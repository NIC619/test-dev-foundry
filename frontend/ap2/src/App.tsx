import React, { useRef } from 'react';
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { USDCBalance, USDCBalanceRef } from './components/USDCBalance'
import { DemoCards } from './components/DemoCards'
import { ToastContainer } from './components/ToastContainer'
import { useToast } from './hooks/useToast'
import UniFiLogo from './UniFi_Black.svg'
import './App.css';

const queryClient = new QueryClient()

function App() {
  const { toasts, hideToast, showError, showSuccess, showInfo } = useToast();
  const usdcBalanceRef = useRef<USDCBalanceRef>(null);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <div style={{minHeight: '100vh', paddingTop: '32px', paddingBottom: '32px'}}>
            {/* Logo in top left corner */}
            <div style={{position: 'absolute', top: '20px', left: '20px'}}>
              <img
                src={UniFiLogo}
                alt="UniFi Logo"
                style={{height: '40px', width: 'auto'}}
              />
            </div>

            <div className="container">
              <div style={{textAlign: 'center', marginBottom: '32px'}}>
                <h1 style={{fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '8px'}}>
                  AP2 Protocol Demo
                </h1>
                <p style={{color: '#6b7280'}}>
                  Delegated Agent Payment Flow
                </p>
              </div>

              <USDCBalance
                ref={usdcBalanceRef}
                onShowError={showError}
                onShowSuccess={showSuccess}
                onShowInfo={showInfo}
              />
              <DemoCards
                onShowError={showError}
                onShowSuccess={showSuccess}
                onShowInfo={showInfo}
                onBalanceRefresh={() => usdcBalanceRef.current?.refreshBalance()}
              />

            </div>
          </div>

          <ToastContainer toasts={toasts} onHideToast={hideToast} />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
