import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import userService from '../services/userService';
import Button from '../components/Button';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function VideoCall() {
  const { user } = useAuth();
  const { sendCallSignal, addCallSignalListener } = useWebSocket();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const partnerId = searchParams.get('partnerId');
  const isIncoming = searchParams.get('isIncoming') === 'true';

  const [partner, setPartner] = useState(null);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting' | 'connected' | 'ended'
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Load partner details
  useEffect(() => {
    async function loadPartner() {
      if (!partnerId) return;
      try {
        const data = await userService.getUserById(Number(partnerId));
        setPartner(data);
      } catch (err) {
        console.error('Failed to load partner details:', err);
      }
    }
    loadPartner();
  }, [partnerId]);

  // Call duration timer
  useEffect(() => {
    let timer;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // WebRTC Setup & Media Stream initialization
  useEffect(() => {
    let cleanup = false;

    async function initializeCall() {
      try {
        // 1. Acquire Local Media
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (mediaErr) {
          console.warn('Could not access real camera/mic, fallback canvas/audio used:', mediaErr);
          // Create dummy black video track so call can still proceed in tests
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 640, 480);
          ctx.font = '24px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(user?.name || 'Local User', 50, 240);
          stream = canvas.captureStream(30);
        }

        if (cleanup) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Setup RTCPeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('connected');
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && partnerId) {
            sendCallSignal({
              type: 'ICE_CANDIDATE',
              senderId: user.id,
              recipientId: Number(partnerId),
              payload: event.candidate,
            });
          }
        };

        // Handle connection state change
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setCallStatus('connected');
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setCallStatus('ended');
          }
        };

        // 3. If initiating caller, send OFFER
        if (!isIncoming && partnerId) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendCallSignal({
            type: 'OFFER',
            senderId: user.id,
            senderName: user.name,
            recipientId: Number(partnerId),
            payload: offer,
            callType: 'video',
          });
        }
      } catch (err) {
        console.error('Call initialization error:', err);
      }
    }

    initializeCall();

    // Listen for incoming call signals from partner
    const removeListener = addCallSignalListener(async (signal) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (signal.type === 'OFFER' && signal.payload) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendCallSignal({
          type: 'ANSWER',
          senderId: user.id,
          recipientId: Number(partnerId),
          payload: answer,
        });
      } else if (signal.type === 'ANSWER' && signal.payload) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        setCallStatus('connected');
      } else if (signal.type === 'ICE_CANDIDATE' && signal.payload) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        } catch (e) {
          console.warn('Error adding ice candidate:', e);
        }
      } else if (signal.type === 'CALL_END' || signal.type === 'CALL_REJECT') {
        setCallStatus('ended');
      }
    });

    return () => {
      cleanup = true;
      removeListener();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [partnerId, isIncoming, user, sendCallSignal, addCallSignalListener]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    if (partnerId) {
      sendCallSignal({
        type: 'CALL_END',
        senderId: user.id,
        recipientId: Number(partnerId),
      });
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    navigate('/chat');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - var(--topbar-height) - 48px)',
      background: '#090d16',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-xl)',
    }}>
      {/* Top Banner: Partner info & Timer */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        right: '24px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar avatar-sm">
            {partner?.profileImage ? (
              <img src={partner.profileImage} alt={partner.name} />
            ) : (
              partner?.name?.substring(0, 2).toUpperCase() || 'P'
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {partner?.name || 'Language Partner'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {partner?.nativeLanguage} ↔ {partner?.learningLanguage}
            </span>
          </div>
        </div>

        {/* Timer & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontSize: '0.8rem',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: callStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: callStatus === 'connected' ? '#34d399' : '#fbbf24',
            fontWeight: 700,
          }}>
            {callStatus === 'connected' ? `● Active ${formatTime(callDuration)}` : '● Ringing / Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Remote Video Screen */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Placeholder if remote video not yet attached */}
        {callStatus !== 'connected' && (
          <div style={{
            position: 'absolute',
            textAlign: 'center',
            color: '#ffffff',
          }}>
            <div className="avatar avatar-xl" style={{ margin: '0 auto 16px', background: 'var(--primary-gradient)' }}>
              {partner?.name?.substring(0, 2).toUpperCase() || 'TB'}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Calling {partner?.name}...</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              Connecting high-definition WebRTC peer-to-peer session...
            </p>
          </div>
        )}
      </div>

      {/* Picture-in-Picture Local Video */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        right: '24px',
        width: '200px',
        height: '140px',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        background: '#1e293b',
        zIndex: 20,
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror local video
          }}
        />
        <span style={{
          position: 'absolute',
          bottom: '6px',
          left: '8px',
          fontSize: '0.7rem',
          color: '#ffffff',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          You {isVideoMuted ? '(Off)' : ''}
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 20,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Mic Toggle */}
        <button
          onClick={toggleAudio}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: 'none',
            background: isAudioMuted ? 'var(--danger)' : 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
          }}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? '🔇' : '🎙️'}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: 'none',
            background: isVideoMuted ? 'var(--danger)' : 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
          }}
          title={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoMuted ? '🚫' : '📹'}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          style={{
            height: '52px',
            padding: '0 28px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: 'var(--danger)',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            transition: 'var(--transition)',
          }}
        >
          <span>📞</span> End Call
        </button>
      </div>
    </div>
  );
}
