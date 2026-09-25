import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Italian',
  'Chinese (Mandarin)',
  'Korean',
  'Portuguese',
  'Russian',
  'Arabic',
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nativeLanguage: 'Hindi',
    learningLanguage: 'English',
    bio: '',
    interests: 'Travel, Technology, Culture, Movies',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.nativeLanguage.toLowerCase() === formData.learningLanguage.toLowerCase()) {
      setError('Native and learning languages should be different for exchange');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        learningLanguage: formData.learningLanguage,
        bio: formData.bio || 'Excited to practice languages with friends on TalkBridge!',
        interests: formData.interests,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      background: 'radial-gradient(circle at top left, #e0e7ff 0%, #f8fafc 60%, #e2e8f0 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div className="auth-card" style={{
        maxWidth: '540px',
        width: '100%',
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-light)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            fontSize: '1.6rem',
            marginBottom: '10px',
            boxShadow: 'var(--shadow-glow)',
          }}>
            🌍
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Join TalkBridge
          </h1>
          <p className="subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Set up your profile and start practicing with native speakers
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div className="grid-2" style={{ gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Sushil Yadav"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Languages Selection */}
          <div className="grid-2" style={{ gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Native Language (You Speak)</label>
              <select
                name="nativeLanguage"
                className="form-select"
                value={formData.nativeLanguage}
                onChange={handleChange}
                required
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Learning Language (You Practice)</label>
              <select
                name="learningLanguage"
                className="form-select"
                value={formData.learningLanguage}
                onChange={handleChange}
                required
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid-2" style={{ gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Interests */}
          <div className="form-group">
            <label className="form-label">Interests & Hobbies (Comma separated)</label>
            <input
              type="text"
              name="interests"
              className="form-input"
              placeholder="e.g. Travel, Music, Technology, Cooking, Movies"
              value={formData.interests}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Create My TalkBridge Account
          </Button>
        </form>

        {/* Switch to Login */}
        <p className="switch-text" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
