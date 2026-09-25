import React, { useState, useEffect } from 'react';
import friendService from '../services/friendService';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Avatar from '../components/Avatar';

export default function FriendRequests() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        friendService.getPendingReceivedRequests(),
        friendService.getPendingSentRequests(),
      ]);
      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await friendService.cancelFriendRequest(requestId);
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
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
      }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
          Friend Requests 📬
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage incoming requests from learners who want to practice with you, or review your sent invitations.
        </p>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveTab('received')}
            className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading requests..." />
      ) : activeTab === 'received' ? (
        receivedRequests.length === 0 ? (
          <div className="card-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📭</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No Pending Received Requests</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              When another learner discovers your profile and requests to connect, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {receivedRequests.map((req) => (
              <div key={req.id} className="card-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <Avatar
                      src={req.sender?.profileImage}
                      name={req.sender?.name}
                      size="lg"
                      showStatus
                      online={req.sender?.isOnline}
                      bordered
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {req.sender?.name}
                      </h3>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Requested {new Date(req.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    {req.sender?.bio || 'Would love to exchange languages with you!'}
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    fontSize: '0.825rem',
                  }}>
                    <div>Speaks: <strong style={{ color: 'var(--primary)' }}>{req.sender?.nativeLanguage}</strong></div>
                    <div>Wants to Learn: <strong style={{ color: 'var(--secondary)' }}>{req.sender?.learningLanguage}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="success" size="sm" style={{ flex: 1 }} onClick={() => handleAccept(req.id)}>
                    ✓ Accept
                  </Button>
                  <Button variant="danger" size="sm" style={{ flex: 1 }} onClick={() => handleReject(req.id)}>
                    ✕ Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : sentRequests.length === 0 ? (
        <div className="card-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>✉️</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No Pending Sent Requests</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            You haven't sent any friend invitations that are awaiting response.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {sentRequests.map((req) => (
            <div key={req.id} className="card-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <Avatar
                    src={req.receiver?.profileImage}
                    name={req.receiver?.name}
                    size="lg"
                    showStatus
                    online={req.receiver?.isOnline}
                    bordered
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {req.receiver?.name}
                    </h3>
                    <small style={{ color: 'var(--text-muted)' }}>
                      Sent {new Date(req.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '0.825rem',
                }}>
                  <div>Speaks: <strong style={{ color: 'var(--primary)' }}>{req.receiver?.nativeLanguage}</strong></div>
                  <div>Learning: <strong style={{ color: 'var(--secondary)' }}>{req.receiver?.learningLanguage}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-warning">Pending Response</span>
                <Button variant="ghost" size="sm" onClick={() => handleCancel(req.id)}>
                  Cancel Request
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
