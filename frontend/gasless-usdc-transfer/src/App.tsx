import React from 'react';
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { GaslessTransfer } from './components/GaslessTransfer'
import UniFiLogo from './UniFi_Black.svg'
import './App.css';

const queryClient = new QueryClient()

function App() {
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
                  Gasless USDC Transfer with EIP-7702
                </h1>
                <p style={{color: '#6b7280'}}>
                  Transfer USDC and pay gas in USDC
                </p>
              </div>

              <GaslessTransfer />

            </div>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
