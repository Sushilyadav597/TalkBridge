import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import chatService from '../services/chatService';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { senderId, senderName, callType, payload }
  const stompClientRef = useRef(null);
  const conversationSubscriptions = useRef(new Map());
  const messageListeners = useRef(new Set());
  const callSignalListeners = useRef(new Set());

  // Connect STOMP WebSocket client when user is authenticated
  useEffect(() => {
    if (!token || !user) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const wsEndpoint = import.meta.env.VITE_WS_URL
      ? `${import.meta.env.VITE_WS_URL}/ws-talkbridge`
      : '/ws-talkbridge';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {
        // Disabled verbose debug logs in production
      },
      onConnect: () => {
        setConnected(true);

        // 1. Subscribe to personal WebRTC call signaling topic
        client.subscribe(`/topic/call/${user.id}`, (message) => {
          try {
            const signal = JSON.parse(message.body);
            handleIncomingSignal(signal);
          } catch (e) {
            console.error('Error handling incoming call signal:', e);
          }
        });

        // 2. Subscribe to user personal queue for notifications / messages
        if (user.email) {
          client.subscribe(`/user/${user.email}/queue/messages`, (message) => {
            try {
              const msg = JSON.parse(message.body);
              messageListeners.current.forEach((listener) => listener(msg));
            } catch (e) {
              console.error('Error handling direct message:', e);
            }
          });
        }
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      setConnected(false);
    };
  }, [token, user]);

  const handleIncomingSignal = (signal) => {
    // Notify all registered call listeners (e.g. VideoCall page)
    callSignalListeners.current.forEach((listener) => listener(signal));

    // If it's a new call request/offer and we're not already on a call, set incomingCall modal state
    if (signal.type === 'CALL_REQUEST' || signal.type === 'OFFER') {
      setIncomingCall(signal);
    } else if (signal.type === 'CALL_END' || signal.type === 'CALL_REJECT') {
      setIncomingCall(null);
    }
  };

  const sendCallSignal = useCallback(async (signal) => {
    // Try via WebSocket first, fallback to REST
    let sent = false;
    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.publish({
          destination: '/app/call.signal',
          body: JSON.stringify(signal),
        });
        sent = true;
      } catch (err) {
        console.warn('Failed to send call signal via STOMP, using REST fallback', err);
      }
    }

    if (!sent) {
      try {
        await chatService.sendCallSignal(signal);
      } catch (e) {
        console.error('REST call signal failed:', e);
      }
    }
  }, []);

  const subscribeToConversation = useCallback((conversationId, callback) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      return () => {};
    }

    const destination = `/topic/conversations/${conversationId}`;
    const sub = stompClientRef.current.subscribe(destination, (message) => {
      try {
        const msg = JSON.parse(message.body);
        callback(msg);
      } catch (e) {
        console.error('Error parsing conversation message:', e);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const addMessageListener = useCallback((listener) => {
    messageListeners.current.add(listener);
    return () => {
      messageListeners.current.delete(listener);
    };
  }, []);

  const addCallSignalListener = useCallback((listener) => {
    callSignalListeners.current.add(listener);
    return () => {
      callSignalListeners.current.delete(listener);
    };
  }, []);

  const dismissIncomingCall = useCallback(() => {
    if (incomingCall) {
      sendCallSignal({
        type: 'CALL_REJECT',
        recipientId: incomingCall.senderId,
      });
      setIncomingCall(null);
    }
  }, [incomingCall, sendCallSignal]);

  const value = {
    connected,
    incomingCall,
    dismissIncomingCall,
    setIncomingCall,
    sendCallSignal,
    subscribeToConversation,
    addMessageListener,
    addCallSignalListener,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
