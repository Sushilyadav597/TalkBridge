import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

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

// Curated high quality avatars for 1-click selection
const PRESET_AVATARS = [
  { id: 'adventurer-1', name: 'Alex', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'adventurer-2', name: 'Priya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc' },
  { id: 'adventurer-3', name: 'Carlos', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden&backgroundColor=c0aede' },
  { id: 'adventurer-4', name: 'Sophia', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=d1d4f9' },
  { id: 'lorelei-1', name: 'Sasha', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=ffdfbf' },
  { id: 'lorelei-2', name: 'Leo', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo&backgroundColor=c0aede' },
  { id: 'bottts-1', name: 'Bot-X', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TalkBridge1&backgroundColor=b6e3f4' },
  { id: 'bottts-2', name: 'Gizmo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TalkBridge2&backgroundColor=d1d4f9' },
];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    nativeLanguage: 'Hindi',
    learningLanguage: 'English',
    interests: '',
    profileImage: '',
  });

  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        nativeLanguage: user.nativeLanguage || 'Hindi',
        learningLanguage: user.learningLanguage || 'English',
        interests: user.interests || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  // Handle local image file upload & client-side compression to WebP/JPEG data URL
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ text: 'Please choose a valid image file (JPG, PNG, WebP)', isError: true });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize image to square 280x280 for fast loading and optimal quality
        const canvas = document.createElement('canvas');
        const targetSize = 280;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Center crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfileData((prev) => ({ ...prev, profileImage: compressedDataUrl }));
        setProfileMsg({
          text: '✓ New photo selected! Click "Save Profile Changes" below to apply it.',
          isError: false,
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setProfileData((prev) => ({ ...prev, profileImage: url }));
    setProfileMsg({
      text: '✓ Avatar selected! Click "Save Profile Changes" below to apply it.',
      isError: false,
    });
  };

  const handleRemovePhoto = () => {
    setProfileData((prev) => ({ ...prev, profileImage: '' }));
    setProfileMsg({
      text: 'Photo removed. Your profile will use your name initials.',
      isError: false,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ text: '', isError: false });

    try {
      const updated = await userService.updateProfile(profileData);
      updateUser(updated);
      setProfileMsg({ text: '🎉 Profile and photo updated successfully! Your picture is now visible on your requests and profile.', isError: false });
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile', isError: true });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMsg({ text: 'New passwords do not match', isError: true });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters long', isError: true });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg({ text: '', isError: false });

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg({ text: 'Password changed successfully!', isError: false });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to change password', isError: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      logout();
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Overview Card with Interactive Photo */}
      <div className="card-box" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        flexWrap: 'wrap',
      }}>
        {/* Avatar with click-to-change overlay */}
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
          title="Click to change profile picture"
        >
          <Avatar
            src={profileData.profileImage || user?.profileImage}
            name={profileData.name || user?.name}
            size="xxl"
            bordered
          />
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            background: 'var(--primary)',
            color: '#ffffff',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            border: '2px solid #ffffff',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s ease',
          }}>
            📷
          </div>
        </div>

        <div style={{ flex: '1 1 260px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
            {profileData.name || user?.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
            {user?.email} • {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'TalkBridge Member'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-primary">Native: {profileData.nativeLanguage}</span>
            <span className="badge badge-success">Learning: {profileData.learningLanguage}</span>
            {profileData.profileImage && (
              <span className="badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                ✓ Custom Photo Set
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Photo Form */}
      <div className="card-box">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
          Edit Profile Information
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          Your picture and language goals help language learners discover you and connect when sending requests.
        </p>

        {profileMsg.text && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: profileMsg.isError ? 'var(--danger-light)' : 'var(--success-light)',
            color: profileMsg.isError ? 'var(--danger)' : 'var(--success)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {profileMsg.isError ? '⚠️ ' : '✅ '}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          {/* PROFILE PHOTO MANAGEMENT SECTION */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontSize: '1rem', fontWeight: 800 }}>
                  Profile Picture 📸
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  This picture will be shown on your requests when you connect with other users.
                </p>
              </div>

              {profileData.profileImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
                >
                  ✕ Remove Picture
                </button>
              )}
            </div>

            {/* Photo Choice Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`btn btn-sm ${avatarTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              >
                📁 Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`btn btn-sm ${avatarTab === 'presets' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🎭 Choose Avatar
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`btn btn-sm ${avatarTab === 'url' ? 'btn-primary' : 'btn-secondary'}`}
              >
                🔗 Image Link
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {avatarTab === 'upload' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '16px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-light)',
                flexWrap: 'wrap',
              }}>
                <Avatar
                  src={profileData.profileImage}
                  name={profileData.name}
                  size="lg"
                  bordered
                />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    📤 Choose Picture from Device
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Supports JPG, PNG, WebP (auto-optimized & resized for crisp display).
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Preset Character Avatars */}
            {avatarTab === 'presets' && (
              <div style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Pick one of our illustrated 3D character avatars with 1 tap:
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                  gap: '12px',
                  justifyItems: 'center',
                }}>
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = profileData.profileImage === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.url)}
                        style={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Avatar src={preset.url} name={preset.name} size="md" />
                        <span style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                          marginTop: '4px',
                        }}>
                          {preset.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Image URL input */}
            {avatarTab === 'url' && (
              <div style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/... or any image URL"
                  value={profileData.profileImage}
                  onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Paste a direct web link to any profile picture (JPG, PNG, SVG).
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Native Language (You Speak)</label>
              <select
                className="form-select"
                value={profileData.nativeLanguage}
                onChange={(e) => setProfileData({ ...profileData, nativeLanguage: e.target.value })}
                required
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Learning Language (You Practice)</label>
              <select
                className="form-select"
                value={profileData.learningLanguage}
                onChange={(e) => setProfileData({ ...profileData, learningLanguage: e.target.value })}
                required
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">About Me (Bio)</label>
            <textarea
              className="form-textarea"
              placeholder="Tell other learners about your interests, language goals, and conversational topics..."
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interests & Hobbies (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Travel, Cinema, Technology, Cooking, Hiking"
              value={profileData.interests}
              onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })}
            />
          </div>

          <Button type="submit" variant="primary" loading={savingProfile} style={{ padding: '12px 28px', fontSize: '1rem' }}>
            💾 Save Profile Changes
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card-box">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
          Change Password
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          Ensure your account is protected with a secure password.
        </p>

        {passwordMsg.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: passwordMsg.isError ? 'var(--danger-light)' : 'var(--success-light)',
            color: passwordMsg.isError ? 'var(--danger)' : 'var(--success)',
            marginBottom: '18px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              >
              </input>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="secondary" loading={savingPassword}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="card-box" style={{ border: '1px solid #fecaca', background: '#fffafa' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '4px' }}>
          Delete Account
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Permanently remove your profile, friendships, messages, and call histories. This action is irreversible.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
          Delete My Account
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to permanently delete your account? All your chats and connections will be lost immediately.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Yes, Delete Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
