import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { ethers } from 'ethers';
import { unifiTestnet } from '../wagmi';
import { retryWithDelay } from '../utils/retry';

// USDC contract address from gasless-usdc-transfer example
const USDC_ADDRESS = '0xa1706a87F06d4F0F379A9123e41672924B654550';

interface USDCBalanceProps {
  onShowError: (message: string) => void;
  onShowSuccess: (message: string) => void;
  onShowInfo: (message: string) => void;
}

export interface USDCBalanceRef {
  refreshBalance: () => void;
}

export const USDCBalance = forwardRef<USDCBalanceRef, USDCBalanceProps>(({
  onShowError,
  onShowSuccess,
  onShowInfo
}, ref) => {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const [balance, setBalance] = useState<string>('');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  // Check if user is on the correct network
  const isCorrectNetwork = chainId === unifiTestnet.id;
  const shouldShowNetworkError = isConnected && !isCorrectNetwork;

  const handleSwitchNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: unifiTestnet.id });
      onShowSuccess('Successfully switched to Unifi Testnet!');
    } catch (error) {
      console.error('Failed to switch network:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onShowError(`Failed to switch network: ${errorMessage}. Please switch manually in MetaMask.`);
    }
  }, [switchChain, onShowError, onShowSuccess]);

  const fetchBalance = useCallback(async () => {
    if (!address || !isConnected || !isCorrectNetwork) return;

    try {
      setIsLoadingBalance(true);
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const tokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(USDC_ADDRESS, tokenAbi, provider);

      const [balanceRaw, decimals] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals()
      ]);

      const balanceFormatted = ethers.formatUnits(balanceRaw, decimals);
      setBalance(balanceFormatted);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address, isConnected, isCorrectNetwork]);

  useEffect(() => {
    if (isConnected && address && isCorrectNetwork) {
      fetchBalance();
    } else {
      setBalance('');
    }
  }, [isConnected, address, isCorrectNetwork, fetchBalance]);

  // Expose fetchBalance to parent components
  useImperativeHandle(ref, () => ({
    refreshBalance: fetchBalance
  }), [fetchBalance]);

  const handleMint = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !mintAmount) {
      onShowError('Please enter mint amount');
      return;
    }

    if (!isCorrectNetwork) {
      onShowError('Please switch to Unifi Testnet to mint USDC');
      return;
    }

    try {
      setIsMinting(true);

      // Using a relayer private key for minting (from gasless example)
      const relayerPrivateKey = '0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8';
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);

      const tokenAbi = [
        'function mint(address to, uint256 amount) public',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(USDC_ADDRESS, tokenAbi, relayerWallet);

      const decimals = await tokenContract.decimals();
      const parsedMintAmount = ethers.parseUnits(mintAmount, decimals);

      // Use retry mechanism for rate-limited requests
      const tx = await retryWithDelay(
        async () => {
          try {
            return await tokenContract.mint(address, parsedMintAmount);
          } catch (error) {
            const msg = (error as Error).message.toLowerCase();
            if (msg.includes('429') || msg.includes('too many requests')) {
              onShowInfo('RPC rate limited, retrying in a moment...');
            }
            throw error;
          }
        },
        3, // max retries
        2000 // initial delay 2 seconds
      );

      await retryWithDelay(
        () => tx.wait(),
        3,
        1000
      );

      onShowSuccess(`Successfully minted ${mintAmount} USDC!`);
      await fetchBalance();
      setMintAmount('');

    } catch (error) {
      console.error('Minting failed:', error);

      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        if (msg.includes('429') || msg.includes('too many requests')) {
          errorMessage = 'RPC rate limit exceeded. Please wait a moment and try again.';
        } else if (msg.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to pay for gas fees.';
        } else if (msg.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (msg.includes('network')) {
          errorMessage = 'Network connection error. Please check your connection.';
        } else if (msg.includes('timeout')) {
          errorMessage = 'Transaction timed out. Please try again.';
        } else {
          // For development, show partial error for debugging
          const cleanError = error.message.length > 200
            ? error.message.substring(0, 200) + '...'
            : error.message;
          errorMessage = `Transaction failed: ${cleanError}`;
        }
      }

      onShowError(errorMessage);
    } finally {
      setIsMinting(false);
    }
  }, [address, mintAmount, isCorrectNetwork, fetchBalance, onShowError, onShowSuccess, onShowInfo]);

  return (
    <div style={{maxWidth: '600px', margin: '0 auto 32px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>
          USDC Balance
        </h2>

        {!isConnected ? (
          <div style={{display: 'flex', gap: '8px'}}>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => disconnect()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Disconnect
          </button>
        )}
      </div>

      {isConnected ? (
        <div>
          <div style={{marginBottom: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', color: '#374151'}}>Wallet:</span>
              <span style={{fontSize: '12px', fontFamily: 'monospace', color: '#6b7280'}}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', color: '#374151'}}>Network:</span>
              <span style={{fontSize: '12px', fontFamily: 'monospace', color: isCorrectNetwork ? '#059669' : '#ef4444'}}>
                {isCorrectNetwork ? 'Unifi Testnet' : `Chain ${chainId}`}
              </span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', color: '#374151'}}>Balance:</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                {isLoadingBalance ? (
                  <span style={{fontSize: '14px', color: '#6b7280'}}>Loading...</span>
                ) : (
                  <span style={{fontSize: '18px', fontWeight: '600', color: '#059669'}}>
                    {balance ? `${parseFloat(balance).toLocaleString()} USDC` : '0 USDC'}
                  </span>
                )}
                <button
                  onClick={fetchBalance}
                  disabled={isLoadingBalance || !isCorrectNetwork}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ↻
                </button>
              </div>
            </div>
          </div>

          {/* Network Error Alert */}
          {shouldShowNetworkError && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#dc2626'}}>
                    Wrong Network
                  </p>
                  <p style={{margin: '0', fontSize: '12px', color: '#7f1d1d'}}>
                    Please switch to Unifi Testnet to use this application.
                  </p>
                </div>
                <button
                  onClick={handleSwitchNetwork}
                  disabled={isSwitchingChain}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    opacity: isSwitchingChain ? 0.5 : 1
                  }}
                >
                  {isSwitchingChain ? 'Switching...' : 'Switch Network'}
                </button>
              </div>
            </div>
          )}

          <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '24px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: '#374151'}}>
              Mint USDC
            </h3>
            <form onSubmit={handleMint} style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
              <div style={{flex: 1}}>
                <label htmlFor="mintAmount" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                  Amount
                </label>
                <input
                  type="number"
                  id="mintAmount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isMinting || !mintAmount || !isCorrectNetwork}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: (isMinting || !mintAmount || !isCorrectNetwork) ? 0.5 : 1
                }}
              >
                {isMinting ? 'Minting...' : 'Mint'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{textAlign: 'center', color: '#6b7280', padding: '40px 0'}}>
          <p>Please connect your wallet to view USDC balance</p>
        </div>
      )}
    </div>
  );
});

USDCBalance.displayName = 'USDCBalance';