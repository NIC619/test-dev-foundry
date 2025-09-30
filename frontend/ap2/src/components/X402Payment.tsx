import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACTS, X402_CONFIG } from '../constants/contracts';
// Remove all imports from eip712 utils to avoid type pollution

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface X402PaymentProps {
  onShowError: (message: string) => void;
  onShowSuccess: (message: string) => void;
  onShowInfo: (message: string) => void;
  onBalanceRefresh: () => void;
}

export const X402Payment: React.FC<X402PaymentProps> = ({
  onShowError,
  onShowSuccess,
  onShowInfo,
  onBalanceRefresh
}) => {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [allowance, setAllowance] = useState<string>('0');
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [recurringIntent, setRecurringIntent] = useState<{
    user: string;
    merchant: string;
    token: string;
    amount: string;
    interval: number;
    expires: number;
  } | null>(null);
  const [recurringSignature, setRecurringSignature] = useState<string | null>(null);

  // Check USDC allowance
  const checkAllowance = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      setIsCheckingAllowance(true);
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const usdcAbi = ['function allowance(address owner, address spender) view returns (uint256)'];
      const usdcContract = new ethers.Contract(CONTRACTS.USDC, usdcAbi, provider);

      const allowanceRaw = await usdcContract.allowance(address, CONTRACTS.PAYMENT_FACILITATOR);
      const allowanceFormatted = ethers.formatUnits(allowanceRaw, 6);
      setAllowance(allowanceFormatted);
    } catch (error) {
      console.error('Error checking allowance:', error);
      onShowError('Failed to check USDC allowance');
    } finally {
      setIsCheckingAllowance(false);
    }
  }, [address, isConnected, onShowError]);

  // Approve USDC for PaymentFacilitator
  const approveUSDC = useCallback(async () => {
    if (!address || !isConnected) {
      onShowError('Please connect your wallet');
      return;
    }

    // Get signer from window.ethereum
    if (!window.ethereum) {
      onShowError('MetaMask not detected');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    try {
      setIsApproving(true);
      const usdcAbi = ['function approve(address spender, uint256 amount) returns (bool)'];
      const usdcContract = new ethers.Contract(CONTRACTS.USDC, usdcAbi, signer);

      // Approve an amount greater (10 USDC) than per payment amount (1 USDC) for convenience
      const approvalAmount = ethers.parseUnits('10', 6);

      // Try to approve with manual gas limit as fallback for rate-limited RPC
      let tx;
      try {
        tx = await usdcContract.approve(CONTRACTS.PAYMENT_FACILITATOR, approvalAmount);
      } catch (gasError: any) {
        // If gas estimation fails, try with manual gas limit
        if (gasError.message?.includes('estimateGas') || gasError.message?.includes('rate limit')) {
          onShowInfo('Gas estimation failed, retrying approval with manual gas limit...');
          tx = await usdcContract.approve(CONTRACTS.PAYMENT_FACILITATOR, approvalAmount, {
            gasLimit: 100000 // Manual gas limit as fallback for approval
          });
        } else {
          throw gasError;
        }
      }

      onShowInfo('Approval transaction submitted. Waiting for confirmation...');

      await tx.wait();

      onShowSuccess('USDC approval successful! You can now make x402 payments.');
      await checkAllowance();
    } catch (error) {
      console.error('Approval failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.toLowerCase().includes('user rejected')) {
        onShowError('Transaction was rejected by user');
      } else if (errorMessage.toLowerCase().includes('429') || errorMessage.toLowerCase().includes('too many requests') || errorMessage.toLowerCase().includes('rate limit')) {
        onShowError(`RPC rate limit exceeded: ${errorMessage}`);
      } else {
        onShowError(`Approval failed: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  }, [address, isConnected, onShowError, onShowSuccess, onShowInfo, checkAllowance]);

  // Execute recurring payment (two-phase: sign once, pay multiple times)
  const executePayment = useCallback(async () => {
    if (!address || !isConnected) {
      onShowError('Please connect your wallet');
      return;
    }

    if (parseFloat(allowance) < 0.1) {
      onShowError('Insufficient USDC allowance. Please approve USDC first.');
      return;
    }

    try {
      setIsPayment(true);

      // Phase 1: Sign recurring intent (only needed once)
      if (!recurringIntent || !recurringSignature) {
        onShowInfo('Please sign the recurring payment authorization...');

        const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now

        const intent = {
          user: address,
          merchant: X402_CONFIG.MERCHANT_ADDRESS,
          token: CONTRACTS.USDC,
          amount: X402_CONFIG.PAYMENT_AMOUNT,
          interval: 0, // No interval - can pay immediately and repeatedly
          expires
        };

        // Sign the recurring intent with user's wallet using WAGMI
        const userSignature = await signTypedDataAsync({
          domain: {
            name: 'PaymentFacilitator',
            version: '1',
            chainId: 2092151908,
            verifyingContract: CONTRACTS.PAYMENT_FACILITATOR as `0x${string}`
          },
          types: {
            RecurringIntentMandate: [
              { name: 'user', type: 'address' },
              { name: 'merchant', type: 'address' },
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint256' },
              { name: 'interval', type: 'uint256' },
              { name: 'expires', type: 'uint256' }
            ]
          },
          primaryType: 'RecurringIntentMandate',
          message: {
            user: intent.user as `0x${string}`,
            merchant: intent.merchant as `0x${string}`,
            token: intent.token as `0x${string}`,
            amount: BigInt(intent.amount),
            interval: BigInt(intent.interval),
            expires: BigInt(intent.expires)
          }
        });

        setRecurringIntent(intent);
        setRecurringSignature(userSignature);
        onShowSuccess('Recurring payment authorization signed! You can now pay multiple times.');
        return;
      }

      // Phase 2: Execute payment using stored signature
      onShowInfo('Executing recurring payment via agent...');

      // Execute the payment through PaymentFacilitator using agent
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const agentWallet = new ethers.Wallet(X402_CONFIG.AGENT_PRIVATE_KEY, provider);

      const facilitatorAbi = [
        `function executeRecurringPayment(
          tuple(address user, address merchant, address token, uint256 amount, uint256 interval, uint256 expires) recurringIntent,
          bytes userSignature
        )`
      ];

      const facilitatorContract = new ethers.Contract(
        CONTRACTS.PAYMENT_FACILITATOR,
        facilitatorAbi,
        agentWallet
      );

      // Try to execute with manual gas limit as fallback for rate-limited RPC
      let tx;
      try {
        tx = await facilitatorContract.executeRecurringPayment(recurringIntent, recurringSignature);
      } catch (gasError: any) {
        // If gas estimation fails, try with manual gas limit
        if (gasError.message?.includes('estimateGas') || gasError.message?.includes('rate limit')) {
          onShowInfo('Gas estimation failed, retrying with manual gas limit...');
          tx = await facilitatorContract.executeRecurringPayment(recurringIntent, recurringSignature, {
            gasLimit: 300000 // Manual gas limit as fallback
          });
        } else {
          throw gasError;
        }
      }

      onShowInfo('Payment transaction submitted. Waiting for confirmation...');

      await tx.wait();

      onShowSuccess(`Successfully paid 0.1 USDC for ${X402_CONFIG.SERVICE_NAME} access (gasless)! View transaction: https://testnet-explorer-unifi.puffer.fi/tx/${tx.hash}`);
      await checkAllowance(); // Refresh allowance
      onBalanceRefresh(); // Refresh USDC balance in the balance component
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      let cleanError = 'Payment failed';
      const msg = errorMessage.toLowerCase();

      if (msg.includes('user rejected')) {
        cleanError = 'Transaction was rejected by user';
      } else if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit')) {
        cleanError = `RPC rate limit exceeded: ${errorMessage}`;
      } else if (msg.includes('insufficient')) {
        cleanError = 'Insufficient funds or allowance for payment';
      } else if (msg.includes('intent expired')) {
        cleanError = 'Payment authorization expired. Please sign again.';
        setRecurringIntent(null);
        setRecurringSignature(null);
      } else if (msg.includes('interval not met')) {
        cleanError = 'Payment interval not met. Please wait before paying again.';
      } else {
        cleanError = `Payment failed: ${errorMessage}`;
      }

      onShowError(cleanError);
    } finally {
      setIsPayment(false);
    }
  }, [address, isConnected, allowance, recurringIntent, recurringSignature, signTypedDataAsync, onShowError, onShowSuccess, onShowInfo, checkAllowance, onBalanceRefresh]);

  // Auto-check allowance when connected
  useEffect(() => {
    if (isConnected && address) {
      checkAllowance();
    }
  }, [isConnected, address, checkAllowance]);

  const hasEnoughAllowance = parseFloat(allowance) >= 0.1;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px 0' }}>
          x402 Payment Protocol
        </h3>
        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Service:</strong> {X402_CONFIG.SERVICE_NAME}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Payment:</strong> 0.1 USDC per request
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Network:</strong> Unifi Testnet
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Merchant:</strong> <code style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>
              {X402_CONFIG.MERCHANT_ADDRESS}
            </code>
          </p>
        </div>
      </div>

      {/* Allowance Status */}
      <div style={{
        padding: '16px',
        backgroundColor: hasEnoughAllowance ? '#f0fdf4' : '#fef3c7',
        border: `1px solid ${hasEnoughAllowance ? '#bbf7d0' : '#fcd34d'}`,
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: hasEnoughAllowance ? '#16a34a' : '#d97706'
            }}>
              USDC Allowance Status
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: hasEnoughAllowance ? '#15803d' : '#b45309'
            }}>
              {isCheckingAllowance ? 'Checking...' : `${allowance} USDC approved`}
            </p>
          </div>
          <button
            onClick={checkAllowance}
            disabled={isCheckingAllowance}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isCheckingAllowance ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Recurring Payment Status */}
      <div style={{
        padding: '16px',
        backgroundColor: recurringIntent ? '#f0f9ff' : '#f9fafb',
        border: `1px solid ${recurringIntent ? '#bfdbfe' : '#e5e7eb'}`,
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <p style={{
          margin: '0 0 4px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: recurringIntent ? '#0369a1' : '#6b7280'
        }}>
          Recurring Payment Authorization
        </p>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: recurringIntent ? '#0284c7' : '#9ca3af'
        }}>
          {recurringIntent ?
            `✅ Authorized until ${new Date(recurringIntent.expires * 1000).toLocaleDateString()}` :
            'Not yet authorized - sign once to enable multiple payments'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {!hasEnoughAllowance && (
          <button
            onClick={approveUSDC}
            disabled={isApproving || !isConnected}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: (isApproving || !isConnected) ? 0.5 : 1
            }}
          >
            {isApproving ? 'Approving...' : 'Approve USDC'}
          </button>
        )}

        <button
          onClick={executePayment}
          disabled={isPayment || !isConnected || !hasEnoughAllowance}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: (isPayment || !isConnected || !hasEnoughAllowance) ? 0.5 : 1
          }}
        >
{isPayment ? 'Processing Payment...' : (recurringIntent ? 'Pay 0.1 USDC (Recurring)' : 'Authorize Recurring Payments')}
        </button>
      </div>

      {!isConnected && (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          Please connect your wallet to use x402 payments
        </div>
      )}

      {/* Payment Details (when processing or authorized) */}
      {(recurringIntent || isPayment) && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: isPayment ? '#fef3c7' : '#f0f9ff',
          border: `1px solid ${isPayment ? '#f59e0b' : '#0284c7'}`,
          borderRadius: '8px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isPayment ? '#92400e' : '#0369a1',
            margin: '0 0 12px 0'
          }}>
            {isPayment ? 'Payment Processing...' : 'Recurring Payment Details'}
          </h4>
          <div style={{ fontSize: '12px', color: isPayment ? '#78350f' : '#075985', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Service:</strong> {X402_CONFIG.SERVICE_NAME}
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Payment Amount:</strong> 0.1 USDC per transaction
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Merchant Account:</strong>{' '}
              <code style={{
                backgroundColor: isPayment ? '#fed7aa' : '#bae6fd',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '11px'
              }}>
                {X402_CONFIG.MERCHANT_ADDRESS}
              </code>
            </p>
            {recurringIntent && (
              <>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Authorization Expires:</strong> {new Date(recurringIntent.expires * 1000).toLocaleString()}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Payment Interval:</strong> No limit (can pay anytime)
                </p>
              </>
            )}
            <p style={{ margin: '0' }}>
              <strong>Payment Contract:</strong>{' '}
              <code style={{
                backgroundColor: isPayment ? '#fed7aa' : '#bae6fd',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '11px'
              }}>
                {CONTRACTS.PAYMENT_FACILITATOR}
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};