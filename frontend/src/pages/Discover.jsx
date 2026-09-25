import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import UserCard from '../components/UserCard';
import Loader from '../components/Loader';
import Button from '../components/Button';

export default function Discover() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        setLoading(true);
        const data = await userService.getRecommendations(50);
        setRecommendations(data || []);
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  const handleConnectSuccess = (userId) => {
    setRecommendations((prev) =>
      prev.map((item) =>
        item.user.id === userId ? { ...item, connectionStatus: 'PENDING_SENT' } : item
      )
    );
  };

  // Filter recommendations based on search input and language filter
  const filtered = recommendations.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const partner = item.user;

    const matchesQuery =
      !q ||
      partner.name.toLowerCase().includes(q) ||
      partner.nativeLanguage.toLowerCase().includes(q) ||
      partner.learningLanguage.toLowerCase().includes(q) ||
      (partner.interests && partner.interests.toLowerCase().includes(q)) ||
      (partner.bio && partner.bio.toLowerCase().includes(q));

    const matchesLang =
      !filterLanguage ||
      partner.nativeLanguage.toLowerCase() === filterLanguage.toLowerCase() ||
      partner.learningLanguage.toLowerCase() === filterLanguage.toLowerCase();

    return matchesQuery && matchesLang;
  });

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
        <div style={{ maxWidth: '700px' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px' }}>
            Discover Language Exchange Partners 🌍
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Find native speakers eager to learn <strong>{user?.nativeLanguage}</strong> and help you master <strong>{user?.learningLanguage}</strong>.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by partner name, interests (e.g. Cinema, Tech, Travel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '1rem',
            }}>
              🔍
            </span>
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Japanese">Japanese</option>
              <option value="Italian">Italian</option>
              <option value="German">German</option>
            </select>
          </div>

          {(searchQuery || filterLanguage) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setFilterLanguage('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <Loader text="Finding compatible language partners..." />
      ) : filtered.length === 0 ? (
        <div className="card-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔎</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No Partners Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px' }}>
            No partners matched your filter criteria. Try adjusting your search keyword or clearing language filters.
          </p>
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setFilterLanguage(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filtered.map((item) => (
            <UserCard
              key={item.user.id}
              user={item.user}
              matchScore={item.matchScore}
              matchReason={item.matchReason}
              mutualInterests={item.mutualInterests}
              connectionStatus={item.connectionStatus}
              onConnectSuccess={handleConnectSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
