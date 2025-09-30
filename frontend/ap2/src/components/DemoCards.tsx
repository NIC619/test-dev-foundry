import React, { useState } from 'react';
import { X402Payment } from './X402Payment';
import { AutomatedPurchasing } from './AutomatedPurchasing';

interface DemoCardsProps {
  onShowError: (message: string) => void;
  onShowSuccess: (message: string) => void;
  onShowInfo: (message: string) => void;
  onBalanceRefresh: () => void;
}

export const DemoCards: React.FC<DemoCardsProps> = ({
  onShowError,
  onShowSuccess,
  onShowInfo,
  onBalanceRefresh
}) => {
  const [showX402Payment, setShowX402Payment] = useState(false);
  const [showAutomatedPurchasing, setShowAutomatedPurchasing] = useState(false);

  const handleX402Payment = () => {
    setShowX402Payment(true);
  };

  const handleItemPurchasing = () => {
    setShowAutomatedPurchasing(true);
  };

  const handlePlaceholder = () => {
    alert('Placeholder Demo - Coming Soon!');
  };

  return (
    <div style={{maxWidth: '1200px', margin: '0 auto'}}>
      <h2 style={{fontSize: '28px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '32px'}}>
        Demo Applications
      </h2>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>

        {/* X402 Payment Demo Card */}
        <div
          onClick={handleX402Payment}
          style={{
            padding: '32px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{marginBottom: '16px'}}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{fontSize: '24px', color: 'white'}}>💳</span>
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0'}}>
              X402 Payment
            </h3>
            <p style={{fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: 0}}>
              Demonstrate API request payment via x402 protocol. A small amount of USDC will be deducted from your balance and paid to the specified merchant account.
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#3b82f6'
          }}>
            Try Demo →
          </div>
        </div>

        {/* Item Purchasing Demo Card */}
        <div
          onClick={handleItemPurchasing}
          style={{
            padding: '32px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{marginBottom: '16px'}}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{fontSize: '24px', color: 'white'}}>🛒</span>
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0'}}>
              Automated Purchasing
            </h3>
            <p style={{fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: 0}}>
              Set a bid amount for an item with fluctuating prices. Your agent will automatically complete the purchase when the price becomes favorable.
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#10b981'
          }}>
            Try Demo →
          </div>
        </div>

        {/* Placeholder Demo Card */}
        <div
          onClick={handlePlaceholder}
          style={{
            padding: '32px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            opacity: 0.7
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{marginBottom: '16px'}}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <span style={{fontSize: '24px', color: 'white'}}>🔮</span>
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px 0'}}>
              Coming Soon
            </h3>
            <p style={{fontSize: '14px', color: '#9ca3af', lineHeight: '1.5', margin: 0}}>
              Additional demo applications will be available here. Stay tuned for more delegated agent payment use cases.
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280'
          }}>
            Coming Soon →
          </div>
        </div>

      </div>

      {/* X402 Payment Modal */}
      {showX402Payment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowX402Payment(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                zIndex: 1001
              }}
            >
              ×
            </button>

            <X402Payment
              onShowError={onShowError}
              onShowSuccess={onShowSuccess}
              onShowInfo={onShowInfo}
              onBalanceRefresh={onBalanceRefresh}
            />
          </div>
        </div>
      )}

      {/* Automated Purchasing Modal */}
      {showAutomatedPurchasing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAutomatedPurchasing(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                zIndex: 1001
              }}
            >
              ×
            </button>

            <AutomatedPurchasing
              onShowError={onShowError}
              onShowSuccess={onShowSuccess}
              onShowInfo={onShowInfo}
              onBalanceRefresh={onBalanceRefresh}
            />
          </div>
        </div>
      )}
    </div>
  );
};