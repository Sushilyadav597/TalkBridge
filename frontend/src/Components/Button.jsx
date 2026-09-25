import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size !== 'md' ? `btn-${size}` : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderRightColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.75s linear infinite'
        }}></span>
      ) : (
        icon && <span className="btn-icon-wrapper">{icon}</span>
      )}
      {children}
    </button>
  );
}
