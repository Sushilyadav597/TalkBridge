import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Avatar from './Avatar';
import friendService from '../services/friendService';

export default function UserCard({
  user,
  matchScore,
  matchReason,
  mutualInterests = [],
  connectionStatus: initialStatus = 'NONE',
  onConnectSuccess,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      setLoading(true);
      await friendService.sendFriendRequest(user.id);
      setStatus('PENDING_SENT');
      if (onConnectSuccess) onConnectSuccess(user.id);
    } catch (err) {
      alert(err.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    navigate(`/chat?userId=${user.id}`);
  };

  const handleCall = () => {
    navigate(`/video-call?partnerId=${user.id}&callType=video`);
  };

  return (
    <div className="card-box user-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      background: '#ffffff',
      transition: 'all 0.25s ease',
      border: matchScore && matchScore >= 80 ? '2px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-light)',
    }}>
      {/* Top row: Match Score & Online */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        {matchScore ? (
          <span className="badge badge-primary" style={{ fontWeight: 700 }}>
            ⚡ {matchScore}% Match
          </span>
        ) : (
          <span />
        )}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.75rem',
          color: user.isOnline ? 'var(--success)' : 'var(--text-muted)',
          fontWeight: 600,
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: user.isOnline ? 'var(--success)' : 'var(--text-muted)',
          }} />
          {user.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* User Info */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Avatar
          src={user.profileImage}
          name={user.name}
          size="xl"
          showStatus
          online={user.isOnline}
          bordered
          style={{ margin: '0 auto 12px' }}
        />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {user.name}
        </h3>
        <p style={{
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4em',
          lineHeight: 1.4,
          padding: '0 4px',
        }}>
          {user.bio || 'Passionate language learner on TalkBridge.'}
        </p>
      </div>

      {/* Language Badge Row */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: '#f8fafc',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Native:</span>
          <strong style={{ color: 'var(--primary)' }}>{user.nativeLanguage}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Learning:</span>
          <strong style={{ color: 'var(--secondary)' }}>{user.learningLanguage}</strong>
        </div>
      </div>

      {/* Match Reason or Mutual Interests */}
      {matchReason && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'rgba(99, 102, 241, 0.05)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '14px',
          lineHeight: 1.3,
        }}>
          💡 {matchReason}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        {status === 'FRIENDS' ? (
          <>
            <Button variant="primary" size="sm" onClick={handleChat} style={{ flex: 1 }}>
              💬 Chat
            </Button>
            <Button variant="success" size="sm" onClick={handleCall} title="Start Video Call">
              📹
            </Button>
          </>
        ) : status === 'PENDING_SENT' ? (
          <Button variant="secondary" size="sm" disabled style={{ flex: 1 }}>
            ⏳ Request Sent
          </Button>
        ) : status === 'PENDING_RECEIVED' ? (
          <Button variant="success" size="sm" onClick={() => navigate('/friend-requests')} style={{ flex: 1 }}>
            Respond
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleConnect}
            loading={loading}
            style={{ flex: 1 }}
          >
            + Connect
          </Button>
        )}
      </div>
    </div>
  );
}
