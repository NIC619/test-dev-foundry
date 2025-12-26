import { useEffect, useState } from 'react';
import { getContractInfo, getViewFunctionData } from '../utils/contracts';
import type { Predeploy } from '../types';
import './PredeployCard.css';

interface PredeployCardProps {
  predeploy: Predeploy;
  isSelected: boolean;
  onSelect: () => void;
  onTransferClick: () => void;
  onWithdrawClick: () => void;
  onUpgradeClick: () => void;
  connectedAddress?: string;
}

export default function PredeployCard({
  predeploy,
  isSelected,
  onSelect,
  onTransferClick,
  onWithdrawClick,
  onUpgradeClick,
  connectedAddress,
}: PredeployCardProps) {
  const [contractInfo, setContractInfo] = useState<{ owner: string | null; balance: bigint | null; implementation: string | null }>({
    owner: null,
    balance: null,
    implementation: null,
  });
  const [viewData, setViewData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);

        // Fetch owner and balance if not purely view-function based
        if (!predeploy.viewFunctions || predeploy.isManageable) {
          const info = await getContractInfo(predeploy.address);
          setContractInfo({
            owner: info.owner,
            balance: info.balance,
            implementation: info.implementation,
          });
          setError(info.error);
        }

        // If contract has view functions, fetch those as well
        if (predeploy.viewFunctions && predeploy.viewFunctions.length > 0) {
          const functionNames = predeploy.viewFunctions.map(vf => vf.name);
          const data = await getViewFunctionData(predeploy.address, functionNames);
          setViewData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contract info');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [predeploy.address, predeploy.viewFunctions, predeploy.isManageable]);

  const isOwnedByConnected =
    connectedAddress && contractInfo.owner
      ? connectedAddress.toLowerCase() === contractInfo.owner.toLowerCase()
      : false;

  const copyToClipboard = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isCopyableValue = (functionName?: string): boolean => {
    if (!functionName) return false;
    // Copyable: addresses, hashes, and other hex values
    return functionName === 'hash' ||
           functionName === 'batcherHash' ||
           functionName.toLowerCase().includes('address') ||
           functionName.toLowerCase().includes('account') ||
           functionName === 'recipient' ||
           functionName === 'otherMessenger' ||
           functionName === 'otherBridge' ||
           functionName === 'messenger' ||
           functionName === 'signalService';
  };

  const categoryColors: Record<Predeploy['category'], string> = {
    bridge: '#3b82f6',
    vault: '#f59e0b',
    factory: '#8b5cf6',
    system: '#10b981',
    governance: '#ef4444',
  };

  return (
    <div
      className={`predeploy-card ${isSelected ? 'selected' : ''} ${isOwnedByConnected ? 'owned' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <div>
          <h3 className="card-title">{predeploy.name}</h3>
          <p className="card-address">{truncateAddress(predeploy.address)}</p>
        </div>
        <span className="category-badge" style={{ backgroundColor: categoryColors[predeploy.category] }}>
          {predeploy.category}
        </span>
      </div>

      <p className="card-description">{predeploy.description}</p>

      <div className="card-info">
        {/* Display owner/balance if contract is manageable or has no view functions */}
        {(!predeploy.viewFunctions || predeploy.isManageable) && (
          <>
            <div className="info-row">
              <span className="info-label">{predeploy.name === 'ProxyAdmin' ? 'Owner:' : 'Proxy Admin:'}</span>
              <span
                className="info-value copyable"
                onClick={(e) => {
                  e.stopPropagation();
                  if (contractInfo.owner) {
                    copyToClipboard(contractInfo.owner, 'proxyAdmin');
                  }
                }}
                style={{ cursor: contractInfo.owner ? 'pointer' : 'default' }}
                title={contractInfo.owner ? 'Click to copy' : undefined}
              >
                {loading ? 'Loading...' : error ? '—' : contractInfo.owner ? truncateAddress(contractInfo.owner) : 'Unknown'}
                {copiedField === 'proxyAdmin' && ' ✓'}
              </span>
            </div>

            {/* Display implementation address for proxy contracts (except ProxyAdmin) */}
            {predeploy.name !== 'ProxyAdmin' && (
              <div className="info-row">
                <span className="info-label">Implementation:</span>
                <span
                  className="info-value copyable"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contractInfo.implementation) {
                      copyToClipboard(contractInfo.implementation, 'implementation');
                    }
                  }}
                  style={{ cursor: contractInfo.implementation ? 'pointer' : 'default' }}
                  title={contractInfo.implementation ? 'Click to copy' : undefined}
                >
                  {loading ? 'Loading...' : contractInfo.implementation ? truncateAddress(contractInfo.implementation) : '—'}
                  {copiedField === 'implementation' && ' ✓'}
                </span>
              </div>
            )}

            {predeploy.category === 'vault' && (
              <div className="info-row">
                <span className="info-label">Balance:</span>
                <span className="info-value">
                  {loading ? 'Loading...' : contractInfo.balance !== null ? formatBalance(contractInfo.balance) : '—'}
                </span>
              </div>
            )}
          </>
        )}

        {/* Display view function results if available */}
        {predeploy.viewFunctions && predeploy.viewFunctions.length > 0 && (
          predeploy.viewFunctions.map(vf => {
            const rawValue = viewData[vf.name];
            const isCopyable = isCopyableValue(vf.name);
            const displayValue = rawValue !== undefined && rawValue !== null
              ? formatViewData(rawValue, vf.name)
              : '—';

            return (
              <div className="info-row" key={vf.name}>
                <span className="info-label">{vf.label}:</span>
                <span
                  className={isCopyable ? 'info-value copyable' : 'info-value'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCopyable && rawValue) {
                      copyToClipboard(String(rawValue), vf.name);
                    }
                  }}
                  style={{ cursor: isCopyable && rawValue ? 'pointer' : 'default' }}
                  title={isCopyable && rawValue ? 'Click to copy' : undefined}
                >
                  {loading ? 'Loading...' : displayValue}
                  {copiedField === vf.name && ' ✓'}
                </span>
              </div>
            );
          })
        )}
      </div>

      {isOwnedByConnected && (
        <div className="owned-indicator">✓ You own this contract</div>
      )}

      {predeploy.isManageable && (
        <div className="card-actions">
          <button
            className="btn btn-small btn-transfer"
            onClick={e => {
              e.stopPropagation();
              onTransferClick();
            }}
          >
            {predeploy.name === 'ProxyAdmin' ? 'Transfer Owner' : 'Transfer Admin'}
          </button>
          {predeploy.name !== 'ProxyAdmin' && (
            <button
              className="btn btn-small btn-upgrade"
              onClick={e => {
                e.stopPropagation();
                onUpgradeClick();
              }}
            >
              Upgrade Impl
            </button>
          )}
          {predeploy.category === 'vault' && (
            <button
              className="btn btn-small btn-withdraw"
              onClick={e => {
                e.stopPropagation();
                onWithdrawClick();
              }}
            >
              Withdraw
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function truncateAddress(address: string, length: number = 10): string {
  if (!address || address.length <= length) return address;
  return `${address.slice(0, length)}...${address.slice(-4)}`;
}

function formatBalance(balance: bigint): string {
  const eth = Number(balance) / 1e18;
  return eth.toFixed(4) + ' ETH';
}

function formatViewData(value: any, functionName?: string): string {
  // Special handling for withdrawalNetwork
  if (functionName === 'withdrawalNetwork') {
    const networkValue = typeof value === 'bigint' ? Number(value) : value;
    return networkValue === 0 ? 'L1' : 'L2';
  }

  // Special handling for ETH amounts (minWithdrawalAmount, totalProcessed, totalSupply)
  if (functionName === 'minWithdrawalAmount' || functionName === 'totalProcessed' || functionName === 'totalSupply') {
    if (typeof value === 'bigint') {
      return formatBalance(value);
    }
  }

  // Special handling for 32-byte hashes (truncate)
  if (functionName === 'hash' || functionName === 'batcherHash') {
    if (typeof value === 'string') {
      return truncateHash(value);
    }
  }

  // Handle string values
  if (typeof value === 'string') {
    // If it looks like an address, truncate it
    if (value.startsWith('0x') && value.length === 42) {
      return truncateAddress(value);
    }
    return value;
  }

  // Handle bigint values
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function truncateHash(hash: string, length: number = 16): string {
  if (!hash || hash.length <= length) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-4)}`;
}
