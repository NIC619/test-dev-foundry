import React from 'react';
import { ToastMessage } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onHideToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHideToast }) => {
  const getTypeStyles = (type: 'error' | 'success' | 'info') => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          textColor: '#dc2626',
          icon: '❌'
        };
      case 'success':
        return {
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          textColor: '#16a34a',
          icon: '✅'
        };
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          borderColor: '#bfdbfe',
          textColor: '#2563eb',
          icon: 'ℹ️'
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
          textColor: '#374151',
          icon: '📝'
        };
    }
  };

  const handleToastClose = (id: string) => {
    onHideToast(id);
  };

  // Auto-hide toasts after 10 seconds
  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        handleToastClose(toast.id);
      }, 10000);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    }}>
      {toasts.map((toast) => {
        const styles = getTypeStyles(toast.type);

        return (
          <div
            key={toast.id}
            style={{
              padding: '16px',
              backgroundColor: styles.backgroundColor,
              border: `1px solid ${styles.borderColor}`,
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              animation: 'slideIn 0.3s ease-out',
              fontFamily: 'inherit',
              minWidth: '300px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <span style={{ fontSize: '20px' }}>{styles.icon}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: styles.textColor,
                  marginBottom: '4px'
                }}>
                  {toast.type === 'error' && 'Error'}
                  {toast.type === 'success' && 'Success'}
                  {toast.type === 'info' && 'Info'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: styles.textColor,
                  opacity: 0.8,
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}>
                  {toast.message}
                </div>
              </div>

              <button
                onClick={() => handleToastClose(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: styles.textColor,
                  opacity: 0.6,
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};