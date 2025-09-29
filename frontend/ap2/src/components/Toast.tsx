import React, { useState, useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 10000
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(onClose, 300); // Allow animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  useEffect(() => {
    if (!isVisible) {
      setIsAnimatingOut(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#dc2626',
          iconColor: '#dc2626'
        };
      case 'success':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          textColor: '#16a34a',
          iconColor: '#16a34a'
        };
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          textColor: '#2563eb',
          iconColor: '#2563eb'
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
          textColor: '#374151',
          iconColor: '#6b7280'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: isAnimatingOut ? '-400px' : '20px',
        zIndex: 1000,
        maxWidth: '400px',
        width: 'auto',
        minWidth: '300px',
        padding: '16px',
        backgroundColor: typeStyles.backgroundColor,
        border: `1px solid ${typeStyles.borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transition: 'right 0.3s ease-in-out',
        fontFamily: 'inherit'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {type === 'error' && (
            <span style={{ fontSize: '20px', color: typeStyles.iconColor }}>❌</span>
          )}
          {type === 'success' && (
            <span style={{ fontSize: '20px', color: typeStyles.iconColor }}>✅</span>
          )}
          {type === 'info' && (
            <span style={{ fontSize: '20px', color: typeStyles.iconColor }}>ℹ️</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: typeStyles.textColor,
            marginBottom: '4px'
          }}>
            {type === 'error' && 'Error'}
            {type === 'success' && 'Success'}
            {type === 'info' && 'Info'}
          </div>
          <div style={{
            fontSize: '12px',
            color: typeStyles.textColor,
            opacity: 0.8,
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {message}
          </div>
        </div>

        <button
          onClick={() => {
            setIsAnimatingOut(true);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            color: typeStyles.textColor,
            opacity: 0.6,
            flexShrink: 0
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};