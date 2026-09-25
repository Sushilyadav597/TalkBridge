import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import chatService from '../services/chatService';
import userService from '../services/userService';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Avatar from '../components/Avatar';

export default function Chat() {
  const { user } = useAuth();
  const { connected, subscribeToConversation, addMessageListener } = useWebSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const data = await chatService.getConversations();
        setConversations(data || []);

        const targetConvId = searchParams.get('conversationId');
        const targetUserId = searchParams.get('userId');

        if (targetConvId) {
          const match = data.find((c) => c.id === Number(targetConvId));
          if (match) {
            setActiveConversation(match);
            setMobileShowChat(true);
          }
        } else if (targetUserId) {
          // Open or start conversation with user
          const newConv = await chatService.startConversation(Number(targetUserId));
          setActiveConversation(newConv);
          setMobileShowChat(true);
          // Refresh list to include newly created conv
          const refreshed = await chatService.getConversations();
          setConversations(refreshed);
        } else if (data && data.length > 0) {
          setActiveConversation(data[0]);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadConversations();
    }
  }, [user, searchParams]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    let isSubscribed = true;

    async function loadMessages() {
      try {
        const msgs = await chatService.getMessages(activeConversation.id);
        if (isSubscribed) {
          setMessages(msgs || []);
          // Mark as read
          chatService.markAsRead(activeConversation.id).catch(() => {});
          // Update local unread count
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    }

    loadMessages();

    // Subscribe to real-time STOMP room for this conversation
    const unsubscribeStomp = subscribeToConversation(activeConversation.id, (incomingMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });
      // Mark as read
      chatService.markAsRead(activeConversation.id).catch(() => {});
    });

    return () => {
      isSubscribed = false;
      unsubscribeStomp();
    };
  }, [activeConversation, subscribeToConversation]);

  // Also listen for incoming messages across any conversation
  useEffect(() => {
    const removeListener = addMessageListener((incomingMsg) => {
      if (activeConversation && incomingMsg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
      } else {
        // Update unread count and latest message preview in conversations list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === incomingMsg.conversationId
              ? {
                  ...c,
                  lastMessage: incomingMsg.content,
                  lastMessageTime: incomingMsg.timestamp,
                  unreadCount: c.unreadCount + 1,
                }
              : c
          )
        );
      }
    });

    return () => removeListener();
  }, [activeConversation, addMessageListener]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation || sending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const sentMsg = await chatService.sendMessage(activeConversation.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      // Update conversations list latest preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: sentMsg.timestamp,
              }
            : c
        )
      );
    } catch (err) {
      alert('Failed to send message: ' + (err.message || 'Network error'));
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileShowChat(true);
    setSearchParams({ conversationId: conv.id });
  };

  const handleStartCall = () => {
    if (!activeConversation?.partner?.id) return;
    navigate(`/video-call?partnerId=${activeConversation.partner.id}&callType=video`);
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.partner?.name.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <Loader text="Loading your messages..." />;
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - var(--topbar-height) - 48px)',
      background: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }} className="chat-layout">
      {/* ================= LEFT: CONVERSATIONS SIDEBAR ================= */}
      <div style={{
        width: '340px',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
      }} className={`chat-sidebar ${mobileShowChat ? 'hidden-mobile' : ''}`}>
        {/* Header & Search */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-light)', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Messages 💬</h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: connected ? 'var(--success)' : 'var(--warning)',
            }}>
              {connected ? '● WebSocket Live' : '● Reconnecting'}
            </span>
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <p>No conversations found.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/discover')}
                style={{ marginTop: '10px' }}
              >
                Find Partners
              </Button>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeConversation?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    background: isSelected ? '#ffffff' : 'transparent',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    border: isSelected ? '1px solid var(--border-light)' : '1px solid transparent',
                    transition: 'var(--transition)',
                  }}
                >
                  <Avatar
                    src={c.partner?.profileImage}
                    name={c.partner?.name}
                    size="md"
                    showStatus
                    online={c.partner?.isOnline}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {c.partner?.name}
                      </strong>
                      <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </small>
                    </div>
                    <p style={{
                      margin: '2px 0 0',
                      fontSize: '0.8rem',
                      color: c.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: c.unreadCount > 0 ? 700 : 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {c.lastMessage || 'Say hello!'}
                    </p>
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="unread-badge">{c.unreadCount}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT: ACTIVE CHAT PANEL ================= */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }} className={`chat-main ${!mobileShowChat ? 'hidden-mobile' : ''}`}>
        {activeConversation ? (
          <>
            {/* Chat Top Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  className="mobile-back-btn"
                  onClick={() => setMobileShowChat(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    display: 'none',
                  }}
                >
                  ←
                </button>

                <Avatar
                  src={activeConversation.partner?.profileImage}
                  name={activeConversation.partner?.name}
                  size="md"
                  showStatus
                  online={activeConversation.partner?.isOnline}
                />

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    {activeConversation.partner?.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Speaks: <strong>{activeConversation.partner?.nativeLanguage}</strong> • Learning: <strong>{activeConversation.partner?.learningLanguage}</strong>
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: activeConversation.partner?.isOnline ? 'var(--success)' : 'var(--text-muted)',
                    }}>
                      ● {activeConversation.partner?.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Video Call Action */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleStartCall}
                  icon="📹"
                >
                  Start Call
                </Button>
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>👋</span>
                  <p>Start your language exchange conversation with {activeConversation.partner?.name}!</p>
                  <small>Messages are synced in real-time over WebSocket.</small>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 18px',
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMine ? 'var(--primary-gradient)' : '#f1f5f9',
                          color: isMine ? '#ffffff' : 'var(--text-primary)',
                          boxShadow: isMine ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                          fontSize: '0.925rem',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                        }}
                      >
                        {m.content}
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        padding: '0 4px',
                      }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '12px',
              background: '#ffffff',
            }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Type a message in ${activeConversation.partner?.nativeLanguage || 'English'}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="primary"
                loading={sending}
                disabled={!inputMessage.trim()}
              >
                Send ✈️
              </Button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>💬</span>
            <h3>Select a Conversation</h3>
            <p>Choose a language partner from the left sidebar to start messaging.</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-sidebar {
            width: 100% !important;
          }
          .chat-sidebar.hidden-mobile {
            display: none !important;
          }
          .chat-main.hidden-mobile {
            display: none !important;
          }
          .mobile-back-btn {
            display: inline-block !important;
          }
        }
      `}</style>
    </div>
  );
}
