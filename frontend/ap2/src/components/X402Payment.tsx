import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACTS, X402_CONFIG } from '../constants/contracts';
// Remove all imports from eip712 utils to avoid type pollution
import { retryWithDelay } from '../utils/retry';

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
  const [paymentInfo, setPaymentInfo] = useState<{
    intent: {
      task: string;
      token: string;
      maxPrice: string;
      expires: number;
      nonce: string;
    };
    cart: {
      merchant: string;
      token: string;
      amount: string;
    };
  } | null>(null);

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

      const tx = await retryWithDelay(
        () => usdcContract.approve(CONTRACTS.PAYMENT_FACILITATOR, approvalAmount),
        3,
        2000
      );

      onShowInfo('Approval transaction submitted. Waiting for confirmation...');

      await retryWithDelay(() => tx.wait(), 3, 1000);

      onShowSuccess('USDC approval successful! You can now make x402 payments.');
      await checkAllowance();
    } catch (error) {
      console.error('Approval failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.toLowerCase().includes('user rejected')) {
        onShowError('Transaction was rejected by user');
      } else if (errorMessage.toLowerCase().includes('429') || errorMessage.toLowerCase().includes('too many requests')) {
        onShowError('RPC rate limit exceeded. Please wait a moment and try again.');
      } else {
        onShowError(`Approval failed: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  }, [address, isConnected, onShowError, onShowSuccess, onShowInfo, checkAllowance]);

  // Execute x402 payment
  const executePayment = useCallback(async () => {
    if (!address || !isConnected) {
      onShowError('Please connect your wallet');
      return;
    }

    // Note: Using agent for gasless transactions - no user signer needed for execution
    // Only need wallet connected for EIP712 signing

    if (parseFloat(allowance) < 1) {
      onShowError('Insufficient USDC allowance. Please approve USDC first.');
      return;
    }

    try {
      setIsPayment(true);

      // Generate payment data
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes(X402_CONFIG.TASK_DESCRIPTION));

      const intent = {
        task: taskHash,
        token: CONTRACTS.USDC,
        maxPrice: X402_CONFIG.PAYMENT_AMOUNT,
        expires,
        nonce
      };

      const cart = {
        merchant: X402_CONFIG.MERCHANT_ADDRESS,
        token: CONTRACTS.USDC,
        amount: X402_CONFIG.PAYMENT_AMOUNT
      };

      setPaymentInfo({ intent, cart });
      onShowInfo('Please sign the payment authorization...');

      // Sign the intent with user's wallet using WAGMI
      const userSignature = await signTypedDataAsync({
        domain: {
          name: 'PaymentFacilitator',
          version: '1',
          chainId: 2092151908,
          verifyingContract: CONTRACTS.PAYMENT_FACILITATOR as `0x${string}`
        },
        types: {
          IntentMandate: [
            { name: 'task', type: 'bytes32' },
            { name: 'token', type: 'address' },
            { name: 'maxPrice', type: 'uint256' },
            { name: 'expires', type: 'uint256' },
            { name: 'nonce', type: 'uint256' }
          ]
        },
        primaryType: 'IntentMandate',
        message: {
          task: intent.task as `0x${string}`,
          token: intent.token as `0x${string}`,
          maxPrice: BigInt(intent.maxPrice),
          expires: BigInt(intent.expires),
          nonce: BigInt(intent.nonce)
        }
      });

      // Sign the cart with merchant's key (simulated) - using ethers for private key signing
      // Note: signTypedDataAsync is for connected wallet, not private key signing
      const merchantWallet = new ethers.Wallet(X402_CONFIG.MERCHANT_PRIVATE_KEY);
      const cartSignature = await merchantWallet.signTypedData(
        {
          name: 'PaymentFacilitator',
          version: '1',
          chainId: 2092151908,
          verifyingContract: CONTRACTS.PAYMENT_FACILITATOR
        },
        {
          CartMandate: [
            { name: 'merchant', type: 'address' },
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ]
        },
        cart
      );

      onShowInfo('Executing payment transaction via agent...');

      // Execute the payment through PaymentFacilitator using agent
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const agentWallet = new ethers.Wallet(X402_CONFIG.AGENT_PRIVATE_KEY, provider);

      const facilitatorAbi = [
        `function executePurchase(
          tuple(bytes32 task, address token, uint256 maxPrice, uint256 expires, uint256 nonce) intent,
          tuple(address merchant, address token, uint256 amount) cart,
          bytes userSignature,
          bytes cartSignature
        )`
      ];

      const facilitatorContract = new ethers.Contract(
        CONTRACTS.PAYMENT_FACILITATOR,
        facilitatorAbi,
        agentWallet
      );

      const tx = await retryWithDelay(
        () => facilitatorContract.executePurchase(intent, cart, userSignature, cartSignature),
        3,
        2000
      );

      onShowInfo('Payment transaction submitted. Waiting for confirmation...');

      await retryWithDelay(() => tx.wait(), 3, 1000);

      onShowSuccess(`Successfully paid 1 USDC for ${X402_CONFIG.SERVICE_NAME} access (gasless)! View transaction: https://testnet-explorer-unifi.puffer.fi/tx/${tx.hash}`);
      await checkAllowance(); // Refresh allowance
      onBalanceRefresh(); // Refresh USDC balance in the balance component
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      let cleanError = 'Payment failed';
      const msg = errorMessage.toLowerCase();

      if (msg.includes('user rejected')) {
        cleanError = 'Transaction was rejected by user';
      } else if (msg.includes('429') || msg.includes('too many requests')) {
        cleanError = 'RPC rate limit exceeded. Please wait a moment and try again.';
      } else if (msg.includes('insufficient')) {
        cleanError = 'Insufficient funds or allowance for payment';
      } else if (msg.includes('intent expired')) {
        cleanError = 'Payment authorization expired. Please try again.';
      } else if (msg.includes('nonce already used')) {
        cleanError = 'Payment nonce already used. Please try again.';
      } else {
        cleanError = `Payment failed: ${errorMessage}`;
      }

      onShowError(cleanError);
    } finally {
      setIsPayment(false);
      setPaymentInfo(null);
    }
  }, [address, isConnected, allowance, signTypedDataAsync, onShowError, onShowSuccess, onShowInfo, checkAllowance, onBalanceRefresh]);

  // Auto-check allowance when connected
  useEffect(() => {
    if (isConnected && address) {
      checkAllowance();
    }
  }, [isConnected, address, checkAllowance]);

  const hasEnoughAllowance = parseFloat(allowance) >= 1;

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
            <strong>Payment:</strong> 1 USDC per request
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
{isPayment ? 'Processing Payment...' : 'Pay 1 USDC (Gasless x402)'}
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

      {/* Payment Details (when processing) */}
      {paymentInfo && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', margin: '0 0 12px 0' }}>
            Payment Authorization Details
          </h4>
          <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Service:</strong> {X402_CONFIG.SERVICE_NAME}
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Task:</strong> {X402_CONFIG.TASK_DESCRIPTION}
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Payment Amount:</strong> 1 USDC
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Merchant Account:</strong>{' '}
              <code style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '11px'
              }}>
                {X402_CONFIG.MERCHANT_ADDRESS}
              </code>
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Authorization Expires:</strong> {new Date(paymentInfo.intent.expires * 1000).toLocaleString()}
            </p>
            <p style={{ margin: '0 0 6px 0' }}>
              <strong>Intent Nonce:</strong>{' '}
              <code style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '11px'
              }}>
                {paymentInfo.intent.nonce.slice(0, 16)}...
              </code>
            </p>
            <p style={{ margin: '0' }}>
              <strong>Payment Contract:</strong>{' '}
              <code style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
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