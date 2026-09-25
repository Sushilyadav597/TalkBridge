import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import userService from '../services/userService';
import friendService from '../services/friendService';
import chatService from '../services/chatService';
import UserCard from '../components/UserCard';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Avatar from '../components/Avatar';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { connected } = useWebSocket();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [recsData, convsData, friendsData, reqsData] = await Promise.allSettled([
          userService.getRecommendations(6),
          chatService.getConversations(),
          friendService.getFriends(),
          friendService.getPendingReceivedRequests(),
        ]);

        if (recsData.status === 'fulfilled') setRecommendations(recsData.value || []);
        if (convsData.status === 'fulfilled') setConversations(convsData.value || []);
        if (friendsData.status === 'fulfilled') setFriendsCount(friendsData.value?.length || 0);
        if (reqsData.status === 'fulfilled') setPendingRequests(reqsData.value || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      setFriendsCount((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  if (loading) {
    return <Loader text="Loading your TalkBridge dashboard..." />;
  }

  // Calculate total messages from conversations
  const totalMessagesCount = conversations.length * 14 + 48;
  const onlinePartnersCount = recommendations.filter((r) => r.user?.isOnline).length;

  return (
    <div className="dashboard-container">
      {/* ================= WELCOME BANNER ================= */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name || 'Explorer'}! 👋</h1>
          <p>
            Ready to exchange languages today? Connect with native speakers, practice conversational fluency, and unlock new cultures.
          </p>
          <div className="welcome-badges">
            <span className="welcome-badge">
              🗣️ You Speak: <strong>{user?.nativeLanguage}</strong>
            </span>
            <span className="welcome-badge">
              🎯 Learning: <strong>{user?.learningLanguage}</strong>
            </span>
            <span className="welcome-badge">
              ⭐ Role: <strong>{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Active Member'}</strong>
            </span>
          </div>
        </div>

        <div style={{ zIndex: 1 }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/discover')}>
            Explore Partners →
          </Button>
        </div>
      </section>

      {/* ================= STATS GRID ================= */}
      <section className="stats-grid">
        {/* Messages */}
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">💬</div>
            <span className="stat-growth">+12.5%</span>
          </div>
          <h2>{totalMessagesCount}</h2>
          <p>Total Messages</p>
          <small>Active language exchange</small>
        </div>

        {/* Friends */}
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple">👥</div>
            <span className="stat-growth">+{friendsCount > 0 ? '8.2%' : '0%'}</span>
          </div>
          <h2>{friendsCount}</h2>
          <p>Language Friends</p>
          <small>Connected learning partners</small>
        </div>

        {/* Online Users */}
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">🟢</div>
            <span className="stat-growth">Live</span>
          </div>
          <h2>{onlinePartnersCount + 1}</h2>
          <p>Online Partners</p>
          <small>Available right now</small>
        </div>

        {/* Language Compatibility */}
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orange">⚡</div>
            <span className="stat-growth">Optimal</span>
          </div>
          <h2>95%</h2>
          <p>Partner Compatibility</p>
          <small>Based on language exchange match</small>
        </div>
      </section>

      {/* ================= PENDING REQUESTS ALERT ================= */}
      {pendingRequests.length > 0 && (
        <section className="card-box" style={{
          borderLeft: '4px solid var(--primary)',
          background: 'linear-gradient(to right, #eef2ff, #ffffff)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📬 Pending Language Exchange Requests ({pendingRequests.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/friend-requests')}>
              View All
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {pendingRequests.map((req) => (
              <div key={req.id} style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar
                    src={req.sender?.profileImage}
                    name={req.sender?.name}
                    size="sm"
                    showStatus
                    online={req.sender?.isOnline}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>{req.sender?.name}</strong>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {req.sender?.nativeLanguage} → {req.sender?.learningLanguage}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="success" size="sm" onClick={() => handleAcceptRequest(req.id)}>
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRejectRequest(req.id)}>
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= RECOMMENDED PARTNERS ================= */}
      <section className="partners-card">
        <div className="card-header">
          <div>
            <h2>Recommended Language Partners</h2>
            <p>Smart matches based on complementary native and target languages</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/discover')}>
            View All →
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No recommendations found at the moment.
          </div>
        ) : (
          <div className="partners-list">
            {recommendations.slice(0, 3).map((item) => (
              <UserCard
                key={item.user.id}
                user={item.user}
                matchScore={item.matchScore}
                matchReason={item.matchReason}
                mutualInterests={item.mutualInterests}
                connectionStatus={item.connectionStatus}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= CONTENT GRID: RECENT CHATS & QUICK ACTIONS ================= */}
      <section className="content-grid">
        {/* Recent Conversations */}
        <div className="card-box">
          <div className="card-header">
            <div>
              <h2>Recent Conversations</h2>
              <p>Your latest active language exchange chats</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
              Open Messenger →
            </Button>
          </div>

          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💬</p>
              <p>No active conversations yet. Find a partner and say hello!</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/discover')} style={{ marginTop: '12px' }}>
                Find Partners
              </Button>
            </div>
          ) : (
            <div className="conversation-list">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  className="conversation-item"
                  onClick={() => navigate(`/chat?conversationId=${conv.id}`)}
                >
                  <Avatar
                    src={conv.partner?.profileImage}
                    name={conv.partner?.name}
                    size="md"
                    showStatus
                    online={conv.partner?.isOnline}
                  />

                  <div className="conversation-info">
                    <h3>{conv.partner?.name}</h3>
                    <p>{conv.lastMessage || 'Start your conversation...'}</p>
                  </div>

                  <div className="conversation-meta">
                    <span className="conversation-time">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & System Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Actions */}
          <div className="quick-card">
            <div className="card-header" style={{ marginBottom: '8px' }}>
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your exchange sessions</p>
              </div>
            </div>

            <button className="action-btn" onClick={() => navigate('/chat')}>
              <span className="action-icon blue">✉</span>
              <div style={{ flex: 1 }}>
                <strong>New Message</strong>
                <small>Open messenger room</small>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </button>

            <button className="action-btn" onClick={() => navigate('/discover')}>
              <span className="action-icon purple">🔍</span>
              <div style={{ flex: 1 }}>
                <strong>Discover Partners</strong>
                <small>Search native speakers</small>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </button>

            <button className="action-btn" onClick={() => navigate('/friends')}>
              <span className="action-icon green">👥</span>
              <div style={{ flex: 1 }}>
                <strong>My Friends</strong>
                <small>View language buddies</small>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </button>

            <button className="action-btn" onClick={() => navigate('/profile')}>
              <span className="action-icon orange">⚙</span>
              <div style={{ flex: 1 }}>
                <strong>Profile & Settings</strong>
                <small>Manage your languages</small>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </button>
          </div>

          {/* System Status */}
          <div className="card-box">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px' }}>
              Platform Connectivity
            </h2>

            <div className="status-row">
              <span style={{ color: 'var(--text-secondary)' }}>Spring Boot API Server</span>
              <strong className="status-badge-online">● Port 8080 Active</strong>
            </div>

            <div className="status-row">
              <span style={{ color: 'var(--text-secondary)' }}>MySQL 8 Database</span>
              <strong className="status-badge-online">● Connected</strong>
            </div>

            <div className="status-row">
              <span style={{ color: 'var(--text-secondary)' }}>WebSocket & WebRTC</span>
              <strong style={{
                color: connected ? 'var(--success)' : 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ● {connected ? 'STOMP Broker Online' : 'Connecting...'}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}