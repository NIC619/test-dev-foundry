import { useEffect, useState } from 'react';
import { getContractInfo } from '../utils/contracts';
import type { Predeploy } from '../types';
import './PredeployCard.css';

interface PredeployCardProps {
  predeploy: Predeploy;
  isSelected: boolean;
  onSelect: () => void;
  onTransferClick: () => void;
  onWithdrawClick: () => void;
  connectedAddress?: string;
}

export default function PredeployCard({
  predeploy,
  isSelected,
  onSelect,
  onTransferClick,
  onWithdrawClick,
  connectedAddress,
}: PredeployCardProps) {
  const [contractInfo, setContractInfo] = useState<{ owner: string | null; balance: bigint | null }>({
    owner: null,
    balance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const info = await getContractInfo(predeploy.address);
        setContractInfo({
          owner: info.owner,
          balance: info.balance,
        });
        setError(info.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contract info');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [predeploy.address]);

  const isOwnedByConnected =
    connectedAddress && contractInfo.owner
      ? connectedAddress.toLowerCase() === contractInfo.owner.toLowerCase()
      : false;

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
        <div className="info-row">
          <span className="info-label">Owner:</span>
          <span className="info-value">
            {loading ? 'Loading...' : error ? '—' : contractInfo.owner ? truncateAddress(contractInfo.owner) : 'Unknown'}
          </span>
        </div>

        {predeploy.category === 'vault' && (
          <div className="info-row">
            <span className="info-label">Balance:</span>
            <span className="info-value">
              {loading ? 'Loading...' : contractInfo.balance !== null ? formatBalance(contractInfo.balance) : '—'}
            </span>
          </div>
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
            Transfer Owner
          </button>
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
