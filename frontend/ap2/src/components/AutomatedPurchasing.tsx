import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACTS, X402_CONFIG } from '../constants/contracts';

interface AutomatedPurchasingProps {
  onShowError: (message: string) => void;
  onShowSuccess: (message: string) => void;
  onShowInfo: (message: string) => void;
  onBalanceRefresh: () => void;
}

interface MockItem {
  id: string;
  name: string;
  description: string;
  basePrice: number; // in USDC
  currentPrice: number;
  priceRange: [number, number]; // [min, max] for simulation
  merchant: string;
  emoji: string;
}

interface ActiveBid {
  itemId: string;
  bidAmount: number;
  maxPrice: number;
  createdAt: number;
  status: 'active' | 'executing' | 'executed' | 'expired' | 'cancelled';
  txHash?: string;
  purchasePrice?: number; // Actual price when executed
  userSignature?: string; // EIP712 signature from user
  intentData?: any; // Intent data for the signature
}

const MOCK_ITEMS: MockItem[] = [
  {
    id: 'premium-api-access',
    name: 'Premium API Access',
    description: 'Monthly subscription to premium API features',
    basePrice: 10.00,
    currentPrice: 12.00,
    priceRange: [8.00, 15.00],
    merchant: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    emoji: '🚀'
  },
  {
    id: 'nft-artwork',
    name: 'Digital Artwork NFT',
    description: 'Limited edition digital artwork by emerging artist',
    basePrice: 25.00,
    currentPrice: 28.00,
    priceRange: [20.00, 35.00],
    merchant: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    emoji: '🎨'
  },
  {
    id: 'data-analytics',
    name: 'Market Data Package',
    description: 'Real-time market analytics and insights',
    basePrice: 5.00,
    currentPrice: 7.00,
    priceRange: [3.00, 9.00],
    merchant: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    emoji: '📊'
  }
];

export const AutomatedPurchasing: React.FC<AutomatedPurchasingProps> = ({
  onShowError,
  onShowSuccess,
  onShowInfo,
  onBalanceRefresh
}) => {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [items, setItems] = useState<MockItem[]>(MOCK_ITEMS);
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [isCreatingBid, setIsCreatingBid] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [usdcAllowance, setUsdcAllowance] = useState<string>('0');
  const [isApproving, setIsApproving] = useState(false);

  // Track bids currently being executed to prevent duplicates
  const executingBids = useRef<Set<string>>(new Set());

  // Check USDC balance
  const checkUSDCBalance = async () => {
    if (!address || !isConnected) return;

    try {
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const tokenAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ];

      const usdcContract = new ethers.Contract(CONTRACTS.USDC, tokenAbi, provider);
      const balance = await usdcContract.balanceOf(address);
      const allowance = await usdcContract.allowance(address, CONTRACTS.PAYMENT_FACILITATOR);
      const decimals = await usdcContract.decimals();
      const balanceFormatted = ethers.formatUnits(balance, decimals);
      const allowanceFormatted = ethers.formatUnits(allowance, decimals);

      console.log('USDC Balance check:', { balanceFormatted, allowanceFormatted });
      setUsdcBalance(balanceFormatted);
      setUsdcAllowance(allowanceFormatted);
    } catch (error) {
      console.error('Error checking USDC balance:', error);
      setUsdcBalance('0');
      setUsdcAllowance('0');
    }
  };

  // Approve USDC for PaymentFacilitator
  const approveUSDC = async (amount: string) => {
    if (!address || !isConnected) return;

    try {
      setIsApproving(true);
      onShowInfo('Requesting USDC approval...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenAbi = [
        'function approve(address spender, uint256 amount) returns (bool)'
      ];

      const usdcContract = new ethers.Contract(CONTRACTS.USDC, tokenAbi, signer);
      const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals

      const tx = await usdcContract.approve(CONTRACTS.PAYMENT_FACILITATOR, amountWei);
      await tx.wait();

      onShowSuccess(`Successfully approved ${amount} USDC for automated purchasing!`);

      // Wait a moment for blockchain state to update, then refresh
      setTimeout(async () => {
        console.log('Refreshing balance after approval...');
        await checkUSDCBalance(); // Refresh both balance and allowance
        onBalanceRefresh(); // Also refresh parent component balance displays
        console.log('Balance refresh completed');
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('USDC approval failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onShowError(`USDC approval failed: ${errorMessage}`);
    } finally {
      setIsApproving(false);
    }
  };

  // Check balance when connected
  useEffect(() => {
    if (isConnected && address) {
      checkUSDCBalance();
    }
  }, [isConnected, address]);

  // Simulate price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prevItems =>
        prevItems.map(item => {
          const [min, max] = item.priceRange;
          const volatility = 0.1; // 10% price movement
          const change = (Math.random() - 0.5) * 2 * volatility;
          const newPrice = Math.max(min, Math.min(max, item.currentPrice * (1 + change)));

          return {
            ...item,
            currentPrice: Number((Math.round(newPrice * 100) / 100).toFixed(2))
          };
        })
      );
    }, 3000); // Update prices every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Monitor bids and execute when price is favorable
  useEffect(() => {
    const checkBids = () => {
      setActiveBids(prevBids => {
        let hasChanges = false;
        const updatedBids = prevBids.map(bid => {
          if (bid.status !== 'active') return bid;

          const item = items.find(i => i.id === bid.itemId);
          if (!item) return bid;

          // Check if current price is at or below bid amount (with precision fix)
          const currentPrice = Number(item.currentPrice.toFixed(2));
          if (currentPrice <= bid.bidAmount) {
            const bidKey = `${bid.itemId}-${bid.createdAt}`;

            // Check if this bid is already being executed
            if (executingBids.current.has(bidKey)) {
              return bid; // Don't change status if already executing
            }

            // Mark as executing to prevent duplicate executions
            executingBids.current.add(bidKey);
            const updatedBid = { ...bid, status: 'executing' as const };
            hasChanges = true;
            // Execute purchase asynchronously without blocking state update
            setTimeout(() => executePurchase(updatedBid, item), 0);
            return updatedBid;
          }

          // Check if bid has expired (24 hours)
          if (Date.now() - bid.createdAt > 24 * 60 * 60 * 1000) {
            hasChanges = true;
            return { ...bid, status: 'expired' as const };
          }

          return bid;
        });

        // Only update state if there are actual changes
        return hasChanges ? updatedBids : prevBids;
      });
    };

    const interval = setInterval(checkBids, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [items]); // Remove activeBids from dependencies to prevent restart loops

  const executePurchase = async (bid: ActiveBid, item: MockItem) => {
    if (!address || !isConnected || !bid.userSignature || !bid.intentData) return;

    const bidKey = `${bid.itemId}-${bid.createdAt}`;

    // Double-check that this bid should still be executed (prevent duplicate executions)
    if (!executingBids.current.has(bidKey)) {
      console.log('Execution cancelled - bid no longer marked for execution');
      return;
    }

    try {
      onShowInfo(`Executing automated purchase for ${item.name} at $${item.currentPrice}...`);

      // Use the stored intent from when the bid was created
      const intent = bid.intentData;

      // Fix decimal precision issues by formatting to 2 decimal places
      const formattedCurrentPrice = Number(item.currentPrice.toFixed(2));

      const cart = {
        merchant: item.merchant,
        token: CONTRACTS.USDC,
        amount: ethers.parseUnits(formattedCurrentPrice.toString(), 6).toString()
      };

      // Use the stored user signature from when the bid was created
      const userSignature = bid.userSignature;

      // Sign the cart with merchant's key
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

      // Execute the payment through PaymentFacilitator using agent
      const provider = new ethers.JsonRpcProvider('https://testnet-unifi-rpc.puffer.fi/');
      const agentWallet = new ethers.Wallet(X402_CONFIG.AGENT_PRIVATE_KEY, provider);

      const facilitatorAbi = [
        `function executePurchase(
          tuple(address user, bytes32 task, address token, uint256 maxPrice, uint256 expires, uint256 nonce) intent,
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

      // Try to execute with manual gas limit as fallback for rate-limited RPC
      let tx;
      try {
        tx = await facilitatorContract.executePurchase(intent, cart, userSignature, cartSignature);
      } catch (gasError: any) {
        if (gasError.message?.includes('estimateGas') || gasError.message?.includes('rate limit')) {
          onShowInfo('Gas estimation failed, retrying with manual gas limit...');
          tx = await facilitatorContract.executePurchase(intent, cart, userSignature, cartSignature, {
            gasLimit: 300000
          });
        } else {
          throw gasError;
        }
      }

      await tx.wait();

      onShowSuccess(`Successfully purchased ${item.name} for $${formattedCurrentPrice} USDC! View transaction: https://testnet-explorer-unifi.puffer.fi/tx/${tx.hash}`);
      onBalanceRefresh();
      await checkUSDCBalance(); // Refresh automated purchasing balance too

      // Remove from executing set
      executingBids.current.delete(bidKey);

      // Update bid status with purchase price using itemId and createdAt for identification
      setActiveBids(prevBids =>
        prevBids.map(b =>
          b.itemId === bid.itemId && b.createdAt === bid.createdAt ? {
            ...b,
            status: 'executed' as const,
            txHash: tx.hash,
            purchasePrice: formattedCurrentPrice
          } : b
        )
      );

    } catch (error) {
      console.error('Automated purchase failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onShowError(`Automated purchase failed: ${errorMessage}`);

      // Remove from executing set
      executingBids.current.delete(bidKey);

      // Reset bid status back to active if execution failed using itemId and createdAt for identification
      setActiveBids(prevBids =>
        prevBids.map(b =>
          b.itemId === bid.itemId && b.createdAt === bid.createdAt ? { ...b, status: 'active' as const } : b
        )
      );
    }
  };

  const createBid = async () => {
    if (!selectedItem || !bidAmount || !address || !isConnected) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      onShowError('Please enter a valid bid amount');
      return;
    }

    // Check if user has sufficient USDC balance
    const currentBalance = parseFloat(usdcBalance);
    if (currentBalance < bidValue) {
      onShowError(`Insufficient USDC balance. You have ${currentBalance.toFixed(2)} USDC but need ${bidValue.toFixed(2)} USDC for this bid.`);
      return;
    }

    // Check if user has sufficient USDC allowance
    const currentAllowance = parseFloat(usdcAllowance);
    if (currentAllowance < bidValue) {
      onShowError(`Insufficient USDC approval. Current allowance: ${currentAllowance.toFixed(2)} USDC, needed: ${bidValue.toFixed(2)} USDC. Please approve more USDC first.`);
      return;
    }

    // Fix decimal precision for bid amount
    const formattedBidValue = Number(bidValue.toFixed(2));

    setIsCreatingBid(true);

    try {
      // Generate intent data for user signature
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes(`automated-purchase-${selectedItem.id}`));
      const maxPriceFormatted = formattedBidValue; // Use exact bid amount as max price

      const intent = {
        user: address,
        task: taskHash,
        token: CONTRACTS.USDC,
        maxPrice: ethers.parseUnits(maxPriceFormatted.toString(), 6).toString(),
        expires,
        nonce
      };

      // Request user signature for the intent
      const userSignature = await signTypedDataAsync({
        domain: {
          name: 'PaymentFacilitator',
          version: '1',
          chainId: 2092151908,
          verifyingContract: CONTRACTS.PAYMENT_FACILITATOR as `0x${string}`
        },
        types: {
          IntentMandate: [
            { name: 'user', type: 'address' },
            { name: 'task', type: 'bytes32' },
            { name: 'token', type: 'address' },
            { name: 'maxPrice', type: 'uint256' },
            { name: 'expires', type: 'uint256' },
            { name: 'nonce', type: 'uint256' }
          ]
        },
        primaryType: 'IntentMandate',
        message: {
          user: intent.user as `0x${string}`,
          task: intent.task as `0x${string}`,
          token: intent.token as `0x${string}`,
          maxPrice: BigInt(intent.maxPrice),
          expires: BigInt(intent.expires),
          nonce: BigInt(intent.nonce)
        }
      });

      const newBid: ActiveBid = {
        itemId: selectedItem.id,
        bidAmount: formattedBidValue,
        maxPrice: maxPriceFormatted,
        createdAt: Date.now(),
        status: 'active',
        userSignature,
        intentData: intent
      };

      // Check if there's already an active bid for this item
      const existingBidIndex = activeBids.findIndex(
        bid => bid.itemId === selectedItem.id && bid.status === 'active'
      );

      if (existingBidIndex !== -1) {
        // Replace existing bid
        setActiveBids(prev =>
          prev.map((bid, index) =>
            index === existingBidIndex ? newBid : bid
          )
        );
        onShowSuccess(`Bid updated for ${selectedItem.name} to $${formattedBidValue} USDC. Previous bid replaced.`);
      } else {
        // Add new bid
        setActiveBids(prev => [...prev, newBid]);
        onShowSuccess(`Bid created for ${selectedItem.name} at $${formattedBidValue} USDC. Agent will execute when price is favorable.`);
      }

      setBidAmount('');
      setSelectedItem(null);

    } catch (error) {
      console.error('Bid creation failed:', error);
      onShowError('Failed to create bid');
    } finally {
      setIsCreatingBid(false);
    }
  };

  const cancelBid = (bidIndex: number) => {
    const bid = activeBids[bidIndex];
    if (!bid || bid.status !== 'active') return;

    setActiveBids(prev =>
      prev.map((b, index) =>
        index === bidIndex ? { ...b, status: 'cancelled' as const } : b
      )
    );

    const item = items.find(i => i.id === bid.itemId);
    onShowInfo(`Cancelled bid for ${item?.name || 'item'} at $${bid.bidAmount} USDC`);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
        Automated Purchasing
      </h2>

      {!isConnected && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            Please connect your wallet to use automated purchasing.
          </p>
        </div>
      )}

      {/* Item Selection */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Select Item to Bid On
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {items.map(item => {
            const hasActiveBid = activeBids.some(bid => bid.itemId === item.id && bid.status === 'active');
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  padding: '20px',
                  border: selectedItem?.id === item.id ? '2px solid #10b981' :
                         hasActiveBid ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: selectedItem?.id === item.id ? '#f0fdfa' :
                                 hasActiveBid ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {hasActiveBid && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    ACTIVE BID
                  </div>
                )}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>{item.emoji}</span>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {item.description}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                    ${item.currentPrice}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
                    USDC
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Range: ${item.priceRange[0]}-${item.priceRange[1]}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Bid Creation */}
      {selectedItem && (
        <div style={{
          padding: '24px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Create Bid for {selectedItem.name}
          </h3>

          {/* Show warning if there's already an active bid for this item */}
          {activeBids.some(bid => bid.itemId === selectedItem.id && bid.status === 'active') && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                ⚠️ You already have an active bid for this item. Creating a new bid will replace the existing one.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Bid Amount (USDC)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: bidAmount && (parseFloat(bidAmount) > parseFloat(usdcBalance) || parseFloat(bidAmount) > parseFloat(usdcAllowance)) ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Current price: ${items.find(i => i.id === selectedItem.id)?.currentPrice || selectedItem.currentPrice} USDC
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Balance: ${parseFloat(usdcBalance).toFixed(2)} USDC
                </p>
              </div>
              <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Approved: ${parseFloat(usdcAllowance).toFixed(2)} USDC
                </p>
                <button
                  onClick={checkUSDCBalance}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    lineHeight: 1
                  }}
                  title="Refresh approval amount"
                >
                  ↻
                </button>
              </div>
              {bidAmount && parseFloat(bidAmount) > parseFloat(usdcBalance) && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                  ⚠️ Insufficient balance for this bid amount
                </p>
              )}
              {bidAmount && parseFloat(bidAmount) > parseFloat(usdcAllowance) && (
                <div style={{ marginTop: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: '0 0 8px 0' }}>
                    ⚠️ Insufficient USDC approval. Need to approve more USDC.
                  </p>
                  <button
                    onClick={() => approveUSDC(bidAmount)}
                    disabled={isApproving || !isConnected}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isConnected ? '#3b82f6' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: isConnected ? 'pointer' : 'not-allowed',
                      opacity: isApproving ? 0.7 : 1
                    }}
                  >
                    {isApproving ? 'Approving...' : `Approve ${bidAmount} USDC`}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={createBid}
              disabled={!bidAmount || isCreatingBid || !isConnected}
              style={{
                padding: '12px 24px',
                backgroundColor: isConnected ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                opacity: isCreatingBid ? 0.7 : 1
              }}
            >
              {isCreatingBid ? 'Signing Authorization...' :
               activeBids.some(bid => bid.itemId === selectedItem.id && bid.status === 'active') ? 'Update Bid' : 'Create Bid'}
            </button>
          </div>
        </div>
      )}

      {/* Active Bids */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Your Active Bids ({activeBids.filter(b => b.status === 'active').length})
        </h3>
        {activeBids.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            No active bids. Select an item above to create your first bid.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBids.map((bid, index) => {
              const item = items.find(i => i.id === bid.itemId);
              if (!item) return null;

              return (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.emoji} {item.name}</span>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        Bid: ${bid.bidAmount} USDC | {bid.status === 'executed' ?
                          `Purchased: $${bid.purchasePrice} USDC` :
                          `Current: $${item.currentPrice} USDC`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          color: bid.status === 'active' ? '#10b981' :
                                 bid.status === 'executing' ? '#f59e0b' :
                                 bid.status === 'executed' ? '#3b82f6' :
                                 bid.status === 'cancelled' ? '#ef4444' : '#6b7280',
                          textTransform: 'uppercase'
                        }}>
                          {bid.status}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {bid.status === 'executed' && bid.txHash ? (
                            <a
                              href={`https://testnet-explorer-unifi.puffer.fi/tx/${bid.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#3b82f6' }}
                            >
                              View TX
                            </a>
                          ) : (
                            `Created: ${formatTime(bid.createdAt)}`
                          )}
                        </div>
                      </div>
                      {bid.status === 'active' && (
                        <button
                          onClick={() => cancelBid(index)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};