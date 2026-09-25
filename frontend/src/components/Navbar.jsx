import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import friendService from '../services/friendService';
import Avatar from './Avatar';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const [pendingCount, setPendingCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRequests() {
      try {
        const reqs = await friendService.getPendingReceivedRequests();
        setPendingCount(reqs ? reqs.length : 0);
      } catch (err) {
        // Silently handle
      }
    }
    if (user) {
      loadRequests();
      const interval = setInterval(loadRequests, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      {/* Left side: mobile toggle & brand title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
          }}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🌉</span>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            TalkBridge
          </span>
        </div>
      </div>

      {/* Right side: Realtime status, Requests Bell, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Real-time status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: connected ? 'var(--success)' : 'var(--warning)',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected ? 'var(--success)' : 'var(--warning)',
          }} />
          {connected ? 'Live Sync' : 'Connecting...'}
        </div>

        {/* Friend Requests Notification */}
        <Link
          to="/friend-requests"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-light)',
            background: '#ffffff',
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
          }}
          title="Friend Requests"
        >
          🔔
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {pendingCount}
            </span>
          )}
        </Link>

        {/* User Pill Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name}
              size="sm"
            />
            <div style={{ textAlign: 'left', display: 'none', minWidth: '80px' }} className="user-name-wrapper">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.nativeLanguage} → {user?.learningLanguage}
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '200px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              padding: '8px 0',
              zIndex: 50,
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <strong style={{ fontSize: '0.9rem', display: 'block' }}>{user?.name}</strong>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</small>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                }}
              >
                👤 My Profile
              </Link>

              <Link
                to="/chat"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                }}
              >
                💬 Messages
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (min-width: 640px) {
          .user-name-wrapper { display: block !important; }
        }
      `}</style>
    </header>
  );
}