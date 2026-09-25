import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import friendService from '../services/friendService';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const navigate = useNavigate();

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await friendService.getFriends();
      setFriends(data || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleConfirmRemove = async () => {
    if (!friendToRemove) return;
    try {
      await friendService.removeFriend(friendToRemove.id);
      setFriends((prev) => prev.filter((f) => f.friend.id !== friendToRemove.id));
      setFriendToRemove(null);
    } catch (err) {
      alert(err.message || 'Failed to remove friend');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
            My Language Friends 👥
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            You have {friends.length} active language exchange partners ready to chat and practice.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/discover')}>
          + Find More Partners
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading your friends..." />
      ) : friends.length === 0 ? (
        <div className="card-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🤝</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No Friends Added Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px' }}>
            Connect with native speakers and language learners from around the world to start practicing together.
          </p>
          <Button variant="primary" onClick={() => navigate('/discover')}>
            Browse Language Partners
          </Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {friends.map((item) => {
            const f = item.friend;
            return (
              <div
                key={item.id}
                className="card-box"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                }}
              >
                {/* Friend Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <Avatar
                    src={f.profileImage}
                    name={f.name}
                    size="lg"
                    showStatus
                    online={f.isOnline}
                    bordered
                  />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {f.name}
                    </h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      color: f.isOnline ? 'var(--success)' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: f.isOnline ? 'var(--success)' : 'var(--text-muted)',
                      }} />
                      {f.isOnline ? 'Online now' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Languages */}
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speaks</span>
                    <strong style={{ color: 'var(--primary)' }}>{f.nativeLanguage}</strong>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-light)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learning</span>
                    <strong style={{ color: 'var(--secondary)' }}>{f.learningLanguage}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/chat?userId=${f.id}`)}
                  >
                    💬 Message
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => navigate(`/video-call?partnerId=${f.id}&callType=video`)}
                    title="Start Video Call"
                  >
                    📹 Call
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFriendToRemove(f)}
                    title="Remove Friend"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!friendToRemove}
        onClose={() => setFriendToRemove(null)}
        title="Remove Friend"
      >
        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
          Are you sure you want to remove <strong>{friendToRemove?.name}</strong> from your friends list? You can send them a request again anytime.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setFriendToRemove(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmRemove}>
            Remove Friend
          </Button>
        </div>
      </Modal>
    </div>
  );
}
