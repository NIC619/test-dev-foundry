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

  // Auto-hide toasts - error messages stay longer
  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      const hideTime = toast.type === 'error' ? 15000 : 4000; // 15s for errors, 4s for others
      const timer = setTimeout(() => {
        handleToastClose(toast.id);
      }, hideTime);
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
      maxWidth: '600px'
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
              minWidth: '500px',
              maxWidth: '700px',
              maxHeight: 'none',
              overflow: 'visible'
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
                {toast.type === 'error' ? (
                  <textarea
                    readOnly
                    value={toast.message}
                    style={{
                      width: '100%',
                      height: '150px',
                      fontSize: '11px',
                      color: styles.textColor,
                      lineHeight: '1.3',
                      fontFamily: 'monospace',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: '13px',
                    color: styles.textColor,
                    opacity: 0.9,
                    lineHeight: '1.4',
                    padding: '4px 0'
                  }}>
                    {toast.message.includes('https://') ? (
                      <>
                        {toast.message.split('https://')[0]}
                        <a
                          href={`https://${toast.message.split('https://')[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: styles.textColor,
                            textDecoration: 'underline',
                            fontWeight: '600'
                          }}
                        >
                          View Transaction
                        </a>
                      </>
                    ) : (
                      toast.message
                    )}
                  </div>
                )}
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