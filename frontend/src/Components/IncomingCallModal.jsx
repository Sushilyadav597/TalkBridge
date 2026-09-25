import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import Button from './Button';

export default function IncomingCallModal() {
  const { incomingCall, dismissIncomingCall } = useWebSocket();
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const handleAccept = () => {
    const callerId = incomingCall.senderId;
    const callType = incomingCall.callType || 'video';
    dismissIncomingCall();
    navigate(`/video-call?partnerId=${callerId}&callType=${callType}&isIncoming=true`);
  };

  const handleDecline = () => {
    dismissIncomingCall();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      background: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-xl)',
      border: '2px solid var(--primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      animation: 'bounceIn 0.3s ease',
      maxWidth: '420px',
    }}>
      <div style={{
        position: 'relative',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
      }}>
        📹
        <span style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid var(--primary)',
          animation: 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        }} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Incoming Video Call</h4>
        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>{incomingCall.senderName || 'Language Partner'}</strong> is calling you...
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="danger" size="sm" onClick={handleDecline}>
          ✕
        </Button>
        <Button variant="success" size="sm" onClick={handleAccept}>
          Accept
        </Button>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
