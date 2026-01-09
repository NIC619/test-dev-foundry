import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { DEFAULT_L1_RPC_URL } from '../utils/contracts';
import './RoleMonitor.css';

interface RoleMonitorProps {
  roleName: string;
  address: string;
  activityThresholds: number[]; // in minutes
  balanceThresholds: number[]; // in ETH
}

interface RoleStatus {
  lastTxTimestamp: number | null;
  balance: string | null;
  loading: boolean;
  error: string | null;
}

export function RoleMonitor({
  roleName,
  address,
  activityThresholds,
  balanceThresholds
}: RoleMonitorProps) {
  const [status, setStatus] = useState<RoleStatus>({
    lastTxTimestamp: null,
    balance: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRoleStatus = async () => {
      try {
        const client = createPublicClient({
          transport: http(process.env.REACT_APP_L1_RPC_URL || DEFAULT_L1_RPC_URL),
        });

        // Fetch balance
        const balanceWei = await client.getBalance({
          address: address as `0x${string}`,
        });
        const balanceEth = formatEther(balanceWei);

        // Fetch latest transaction
        const currentBlock = await client.getBlockNumber();
        let lastTxTimestamp: number | null = null;

        // Search backwards through recent blocks to find the last transaction from this address
        // Check last 1000 blocks (should cover several hours of activity)
        const blocksToCheck = 1000n;
        const startBlock = currentBlock - blocksToCheck;
        const batchSize = 20; // Check 20 blocks at a time in parallel

        // Search in batches for better performance
        for (let batchStart = currentBlock; batchStart >= startBlock && lastTxTimestamp === null; batchStart -= BigInt(batchSize)) {
          const batchEnd = batchStart - BigInt(batchSize - 1) < startBlock
            ? startBlock
            : batchStart - BigInt(batchSize - 1);

          // Fetch blocks in parallel
          const blockPromises: Promise<any>[] = [];
          for (let i = batchStart; i >= batchEnd; i--) {
            blockPromises.push(
              client.getBlock({
                blockNumber: i,
                includeTransactions: true,
              }).catch(() => null)
            );
          }

          const results = await Promise.all(blockPromises);

          // Check results in order (newest first)
          for (const block of results) {
            if (!block) continue;

            if (block.transactions && Array.isArray(block.transactions)) {
              for (const tx of block.transactions) {
                if (typeof tx === 'object' && tx.from) {
                  if (tx.from.toLowerCase() === address.toLowerCase()) {
                    lastTxTimestamp = Number(block.timestamp);
                    break;
                  }
                }
              }
            }

            if (lastTxTimestamp !== null) {
              break;
            }
          }
        }

        setStatus({
          lastTxTimestamp,
          balance: balanceEth,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error(`Error fetching ${roleName} status:`, error);
        setStatus({
          lastTxTimestamp: null,
          balance: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    fetchRoleStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRoleStatus, 30000);
    return () => clearInterval(interval);
  }, [roleName, address]);

  const getActivityWarningLevel = (): { level: number; message: string } | null => {
    if (!status.lastTxTimestamp) {
      return { level: 6, message: 'No recent transaction found' };
    }

    const now = Math.floor(Date.now() / 1000);
    const minutesSinceLastTx = Math.floor((now - status.lastTxTimestamp) / 60);

    // Check thresholds in descending order (most severe first)
    for (let i = activityThresholds.length - 1; i >= 0; i--) {
      if (minutesSinceLastTx >= activityThresholds[i]) {
        return {
          level: i + 1,
          message: `No transaction for ${minutesSinceLastTx} minutes (threshold: ${activityThresholds[i]}m)`,
        };
      }
    }

    return null; // No warning
  };

  const getBalanceWarningLevel = (): { level: number; message: string } | null => {
    if (!status.balance) {
      return null;
    }

    const balanceNum = parseFloat(status.balance);

    // Find the most severe threshold (lowest value) that balance is below
    // Lower balance = higher warning level (more severe)
    let mostSevereLevel = -1;
    let mostSevereThreshold = -1;

    for (let i = 0; i < balanceThresholds.length; i++) {
      if (balanceNum < balanceThresholds[i]) {
        mostSevereLevel = i + 1;
        mostSevereThreshold = balanceThresholds[i];
      }
    }

    if (mostSevereLevel > 0) {
      return {
        level: mostSevereLevel,
        message: `Balance ${balanceNum.toFixed(4)} ETH below threshold ${mostSevereThreshold} ETH`,
      };
    }

    return null; // No warning
  };

  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatTimeSince = (timestamp: number | null): string => {
    if (!timestamp) return 'Unknown';
    const now = Math.floor(Date.now() / 1000);
    const seconds = now - timestamp;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const activityWarning = getActivityWarningLevel();
  const balanceWarning = getBalanceWarningLevel();

  const getWarningClass = (level: number): string => {
    if (level >= 5) return 'warning-critical';
    if (level >= 3) return 'warning-high';
    if (level >= 1) return 'warning-medium';
    return '';
  };

  const truncateAddress = (addr: string): string => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="role-monitor-card">
      <div className="role-header">
        <h3>{roleName}</h3>
        <span className="role-address" title={address}>
          {truncateAddress(address)}
        </span>
      </div>

      {status.loading ? (
        <div className="role-status">Loading...</div>
      ) : status.error ? (
        <div className="role-status error">Error: {status.error}</div>
      ) : (
        <>
          {/* Activity Status */}
          <div className="status-section">
            <h4>Activity</h4>
            <div className="status-item">
              <span className="status-label">Last Transaction:</span>
              <span className="status-value">{formatTimestamp(status.lastTxTimestamp)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Time Since:</span>
              <span className="status-value">{formatTimeSince(status.lastTxTimestamp)}</span>
            </div>
            {activityWarning && (
              <div className={`warning-box ${getWarningClass(activityWarning.level)}`}>
                <span className="warning-icon">⚠️</span>
                <span className="warning-message">{activityWarning.message}</span>
              </div>
            )}
          </div>

          {/* Balance Status */}
          <div className="status-section">
            <h4>Balance</h4>
            <div className="status-item">
              <span className="status-label">ETH Balance:</span>
              <span className="status-value">
                {status.balance ? `${parseFloat(status.balance).toFixed(4)} ETH` : 'Unknown'}
              </span>
            </div>
            {balanceWarning && (
              <div className={`warning-box ${getWarningClass(balanceWarning.level)}`}>
                <span className="warning-icon">⚠️</span>
                <span className="warning-message">{balanceWarning.message}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
