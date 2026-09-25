import React, { useState, useEffect } from 'react';

// Generates a deterministic modern gradient based on user's name
function getGradientByName(name = '') {
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', // Blue to Cyan
    'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', // Emerald to Teal
    'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', // Amber to Orange
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Pink to Rose
    'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Violet to Fuchsia
    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', // Sky to Blue
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const SIZES = {
  xs: { size: '26px', fontSize: '0.7rem', dotSize: '8px' },
  sm: { size: '36px', fontSize: '0.85rem', dotSize: '9px' },
  md: { size: '44px', fontSize: '1rem', dotSize: '11px' },
  lg: { size: '60px', fontSize: '1.35rem', dotSize: '13px' },
  xl: { size: '80px', fontSize: '1.8rem', dotSize: '15px' },
  xxl: { size: '104px', fontSize: '2.4rem', dotSize: '18px' },
};

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  online = false,
  showStatus = false,
  bordered = false,
  className = '',
  style = {},
  onClick,
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeConfig = SIZES[size] || SIZES.md;
  const initials = (name || 'TB')
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isImageValid = Boolean(src && !hasError && src.trim() !== '');

  return (
    <div
      className={`avatar ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeConfig.size,
        height: sizeConfig.size,
        minWidth: sizeConfig.size,
        minHeight: sizeConfig.size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: isImageValid ? '#f1f5f9' : getGradientByName(name),
        color: '#ffffff',
        fontWeight: 700,
        fontSize: sizeConfig.fontSize,
        border: bordered ? '3px solid #ffffff' : 'none',
        boxShadow: bordered ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
        userSelect: 'none',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {isImageValid ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span>{initials}</span>
      )}

      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            borderRadius: '50%',
            backgroundColor: online ? 'var(--success, #10b981)' : 'var(--text-muted, #94a3b8)',
            border: '2px solid #ffffff',
            boxShadow: online ? '0 0 0 2px rgba(16, 185, 129, 0.25)' : 'none',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}
