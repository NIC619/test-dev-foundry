import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignTypedData, useConnect, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';

interface GaslessTransferProps {
  defaultRpcUrl?: string;
  defaultContractAddress?: string;
  relayerPrivateKey?: string;
}

export const GaslessTransfer: React.FC<GaslessTransferProps> = ({
  defaultRpcUrl = 'https://testnet-unifi-rpc.puffer.fi/',
  defaultContractAddress = '0xa1706a87F06d4F0F379A9123e41672924B654550',
  relayerPrivateKey = '0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8',
}) => {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [userBalance, setUserBalance] = useState<string>('');
  const [relayerBalance, setRelayerBalance] = useState<string>('');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [mintRecipient, setMintRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const encodeTransferData = useCallback((to: string, amount: bigint): string => {
    // ERC20 transfer function selector: transfer(address,uint256)
    const transferSelector = '0xa9059cbb';
    // Pad address to 32 bytes
    const paddedTo = to.slice(2).padStart(64, '0');
    // Convert amount to hex and pad to 32 bytes
    const paddedAmount = amount.toString(16).padStart(64, '0');
    return transferSelector + paddedTo + paddedAmount;
  }, []);

  const getTokenDecimals = useCallback(async (): Promise<number> => {
    try {
      const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
      const tokenAbi = ['function decimals() view returns (uint8)'];
      const tokenContract = new ethers.Contract(defaultContractAddress, tokenAbi, provider);
      const decimals = await tokenContract.decimals();
      return Number(decimals);
    } catch (error) {
      console.error('Error getting token decimals:', error);
      return 18; // Default to 18 decimals
    }
  }, [defaultRpcUrl, defaultContractAddress]);

  const fetchBalances = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      setIsLoadingBalances(true);
      const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
      const tokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(defaultContractAddress, tokenAbi, provider);

      // Get decimals and balances
      const decimals = await tokenContract.decimals();
      const relayerWallet = new ethers.Wallet(relayerPrivateKey);

      const [userBalanceRaw, relayerBalanceRaw] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.balanceOf(relayerWallet.address)
      ]);

      // Format balances
      const userBalanceFormatted = ethers.formatUnits(userBalanceRaw, decimals);
      const relayerBalanceFormatted = ethers.formatUnits(relayerBalanceRaw, decimals);

      setUserBalance(userBalanceFormatted);
      setRelayerBalance(relayerBalanceFormatted);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setUserBalance('Error');
      setRelayerBalance('Error');
    } finally {
      setIsLoadingBalances(false);
    }
  }, [address, isConnected, defaultRpcUrl, defaultContractAddress, relayerPrivateKey]);

  // Fetch balances when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
    } else {
      setUserBalance('');
      setRelayerBalance('');
    }
  }, [isConnected, address, fetchBalances]);

  const handleMint = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mintRecipient || !mintAmount) {
      alert('Please enter recipient address and mint amount');
      return;
    }

    try {
      setIsMinting(true);
      setStatusMessage('Minting USDC tokens...');

      const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
      const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);

      // Assuming the USDC contract has a mint function - typical test token ABI
      const tokenAbi = [
        'function mint(address to, uint256 amount) public',
        'function decimals() view returns (uint8)'
      ];
      const tokenContract = new ethers.Contract(defaultContractAddress, tokenAbi, relayerWallet);

      // Get decimals and parse amount
      const decimals = await tokenContract.decimals();
      const parsedMintAmount = ethers.parseUnits(mintAmount, decimals);

      // Execute mint
      const tx = await tokenContract.mint(mintRecipient, parsedMintAmount);
      await tx.wait();

      setStatusMessage(`Successfully minted ${mintAmount} USDC to ${mintRecipient}`);
      alert(`Successfully minted ${mintAmount} USDC!`);

      // Refresh balances after minting
      await fetchBalances();

      // Reset mint form
      setMintRecipient('');
      setMintAmount('');

    } catch (error) {
      console.error('Minting failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Minting failed: ${errorMessage}`);
      setStatusMessage(`Minting failed: ${errorMessage}`);
    } finally {
      setIsMinting(false);
    }
  }, [mintRecipient, mintAmount, defaultRpcUrl, defaultContractAddress, relayerPrivateKey, fetchBalances]);

  const handleTransfer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      alert('Please enter recipient and amount');
      return;
    }

    try {
      setIsTransferring(true);
      setStatusMessage('Building typed data...');
      setTransactionHash('');

      const tokenDecimals = await getTokenDecimals();
      const parsedAmount = ethers.parseUnits(amount, tokenDecimals);
      const parsedFee = fee ? ethers.parseUnits(fee, tokenDecimals) : BigInt(0);

      const calls = [];

      // Add transfer call
      if (parsedAmount && recipient) {
        const transferData = encodeTransferData(recipient, parsedAmount);
        calls.push({ to: defaultContractAddress as `0x${string}`, value: BigInt(0), data: transferData as `0x${string}` });
      }

      // Add fee call if specified
      if (parsedFee && parsedFee !== BigInt(0)) {
        const relayerWallet = new ethers.Wallet(relayerPrivateKey);
        const feeData = encodeTransferData(relayerWallet.address, parsedFee);
        calls.push({ to: defaultContractAddress as `0x${string}`, value: BigInt(0), data: feeData as `0x${string}` });
      }

      const expiryTime = 3600; // seconds
      const expiry = Math.floor(Date.now() / 1000) + expiryTime;

      setStatusMessage('Please sign the message in your wallet...');

      // Use WAGMI's signTypedDataAsync - this should produce a verifiable signature
      const signature = await signTypedDataAsync({
        domain: {
          name: 'SimpleDelegateContract',
          version: '1',
          chainId: chainId!,
          verifyingContract: '0xf6465b4C05C1a3a04E5cBCF623741b087eB965C7' as `0x${string}`,
        },
        types: {
          Call: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ],
          ExecuteWithSigMessage: [
            { name: 'userAccountAddress', type: 'address' },
            { name: 'expiry', type: 'uint256' },
            { name: 'calls', type: 'Call[]' }
          ]
        },
        primaryType: 'ExecuteWithSigMessage',
        message: {
          userAccountAddress: address,
          expiry: BigInt(expiry),
          calls: calls
        }
      });

      setStatusMessage('Signature obtained, executing transfer...');
      console.log('WAGMI Signature:', signature);

      // Now execute the transaction with the relayer
      const provider = new ethers.JsonRpcProvider(defaultRpcUrl);
      const relayerSigner = new ethers.Wallet(relayerPrivateKey, provider);

      const contract = new ethers.Contract(
        address, // User's account address (delegated to SimpleDelegateContract)
        [
          "function executeWithSig((address userAccountAddress,uint256 expiry,(bytes data,address to,uint256 value)[] calls) message,uint8 v,bytes32 r,bytes32 s) payable"
        ],
        relayerSigner
      );

      const sig = ethers.Signature.from(signature);

      const tx = await contract.executeWithSig(
        {
          userAccountAddress: address,
          expiry: expiry.toString(),
          calls: calls
        },
        sig.v,
        sig.r,
        sig.s
      );

      await tx.wait();

      setStatusMessage('Transfer completed successfully!');
      setTransactionHash(tx.hash);
      alert('Transfer executed successfully!');

      // Refresh balances after successful transfer
      await fetchBalances();

      // Reset form
      setRecipient('');
      setAmount('');
      setFee('');

    } catch (error) {
      console.error('Transfer failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Transfer failed: ${errorMessage}`);
      setStatusMessage(`Transfer failed: ${errorMessage}`);
    } finally {
      setIsTransferring(false);
    }
  }, [address, chainId, isConnected, recipient, amount, fee, signTypedDataAsync, defaultRpcUrl, defaultContractAddress, relayerPrivateKey, getTokenDecimals, encodeTransferData]);

  return (
    <div>
      {/* USDC Contract Info & Mint Container */}
      <div className="card" style={{maxWidth: '480px', margin: '32px auto'}}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#1f2937'}}>
          USDC Contract
        </h2>
        <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center'}}>
          Contract information and token minting
        </p>

        {!isConnected ? (
          <div>
            <div className="alert alert-yellow">
              <p>
                Please connect your wallet to use USDC contract features
              </p>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="btn btn-blue"
                  style={{width: '100%', padding: '12px'}}
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* USDC Contract Info */}
            <div style={{marginBottom: '24px'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#374151'}}>
                Contract Information
              </h3>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <span style={{fontSize: '14px', color: '#374151'}}>Address:</span>
                <span style={{fontSize: '12px', fontFamily: 'monospace', color: '#6b7280', wordBreak: 'break-all'}}>
                  {defaultContractAddress}
                </span>
              </div>
              <a
                href={`https://testnet-unifi-explorer.puffer.fi/address/${defaultContractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{fontSize: '12px', textDecoration: 'underline', color: '#2563eb'}}
              >
                View on Explorer →
              </a>
            </div>

            {/* Mint Form */}
            <form onSubmit={handleMint} style={{borderTop: '1px solid #e5e7eb', paddingTop: '24px'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', color: '#374151'}}>
                Mint USDC Tokens
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label htmlFor="mintRecipient" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    id="mintRecipient"
                    value={mintRecipient}
                    onChange={(e) => setMintRecipient(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mintAmount" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                    Amount to Mint
                  </label>
                  <input
                    type="number"
                    id="mintAmount"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.000001"
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isMinting || !mintRecipient || !mintAmount}
                  className="btn btn-green"
                  style={{width: '100%', padding: '12px', fontSize: '16px', fontWeight: '500'}}
                >
                  {isMinting ? 'Minting...' : 'Mint USDC'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Gasless Transfer Container */}
      <div className="card" style={{maxWidth: '480px', margin: '32px auto'}}>
      <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#1f2937'}}>
        Gasless Transfer
      </h2>
      <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '24px', textAlign: 'center'}}>
        Configure recipient address, amount to transfer, and relayer fee (optional)
      </p>

      {!isConnected ? (
        <div>
          <div className="alert alert-yellow">
            <p>
              Please connect your wallet
            </p>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className="btn btn-blue"
                style={{width: '100%', padding: '12px'}}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Connection Status */}
          <div className="alert alert-green">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <p style={{fontWeight: '500', margin: '0 0 4px 0'}}>
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <p style={{fontSize: '12px', margin: '0', opacity: '0.8'}}>
                  Chain: {chainId}
                </p>
              </div>
              <button
                onClick={() => disconnect()}
                style={{fontSize: '12px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Balance Display */}
          <div className="card" style={{margin: '16px 0', padding: '16px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#374151'}}>
              USDC Balances
            </h3>
            {isLoadingBalances ? (
              <p style={{fontSize: '14px', color: '#6b7280', margin: '8px 0'}}>Loading balances...</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '14px', color: '#374151'}}>Your Balance:</span>
                  <span style={{fontSize: '14px', fontWeight: '500', color: '#059669'}}>
                    {userBalance ? `${parseFloat(userBalance).toLocaleString()} USDC` : '0 USDC'}
                  </span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '14px', color: '#374151'}}>Relayer Balance:</span>
                  <span style={{fontSize: '14px', fontWeight: '500', color: '#059669'}}>
                    {relayerBalance ? `${parseFloat(relayerBalance).toLocaleString()} USDC` : '0 USDC'}
                  </span>
                </div>
                <button
                  onClick={fetchBalances}
                  disabled={isLoadingBalances}
                  className="btn btn-blue"
                  style={{fontSize: '12px', padding: '4px 8px', marginTop: '8px', width: 'auto', alignSelf: 'flex-end'}}
                >
                  Refresh
                </button>
              </div>
            )}
          </div>


          {/* Transfer Form */}
          <form onSubmit={handleTransfer} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
            <div>
              <label htmlFor="recipient" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                Recipient Address
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.000001"
                className="form-input"
                required
              />
            </div>

            <div>
              <label htmlFor="fee" style={{display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
                Relayer Fee (Optional)
              </label>
              <input
                type="number"
                id="fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.000001"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isTransferring || !recipient || !amount}
              className="btn btn-green"
              style={{width: '100%', padding: '12px', fontSize: '16px', fontWeight: '500'}}
            >
              {isTransferring ? 'Processing...' : 'Execute Gasless Transfer'}
            </button>
          </form>

          {/* Status Messages */}
          {statusMessage && (
            <div className="alert alert-blue" style={{marginTop: '16px'}}>
              <p>{statusMessage}</p>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="alert alert-green" style={{marginTop: '16px'}}>
              <p style={{fontWeight: '500', margin: '0 0 8px 0'}}>
                Transaction successful!
              </p>
              <p style={{fontSize: '12px', wordBreak: 'break-all', margin: '0 0 8px 0'}}>
                Hash: {transactionHash}
              </p>
              <a
                href={`https://testnet-unifi-explorer.puffer.fi/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{fontSize: '12px', textDecoration: 'underline', color: 'inherit'}}
              >
                View on Explorer →
              </a>
            </div>
          )}

          {/* Debug Info */}
          <div style={{marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
            <details style={{fontSize: '12px', color: '#6b7280'}}>
              <summary style={{cursor: 'pointer'}}>
                Configuration Details
              </summary>
              <div style={{marginTop: '8px', fontFamily: 'monospace'}}>
                <p>Contract: {defaultContractAddress}</p>
                <p>RPC: {defaultRpcUrl}</p>
                <p>Chain ID: {chainId || 'Not connected'}</p>
              </div>
            </details>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};