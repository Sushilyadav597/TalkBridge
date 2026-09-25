import React from 'react';

export default function Loader({ text = 'Loading TalkBridge...', fullScreen = false }) {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid #e0e7ff',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
      }} />
      {text && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#ffffff',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
}
