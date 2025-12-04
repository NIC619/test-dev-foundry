import { useState } from 'react';
import { useAccount } from 'wagmi';
import { PREDEPLOYS } from '../config/predeploys';
import { getContractInfo, generateTransferOwnershipCalldata, isValidAddress } from '../utils/contracts';
import PredeployCard from '../components/PredeployCard';
import './Predeploys.css';

type FilterCategory = 'all' | 'bridge' | 'vault' | 'factory' | 'system' | 'governance';

export default function PredeploysPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [showOnlyManageable, setShowOnlyManageable] = useState(true);
  const [selectedPredeploy, setSelectedPredeploy] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'transfer' | 'withdraw' | null>(null);
  const [newOwner, setNewOwner] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const filtered = PREDEPLOYS.filter(p => {
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    const manageableMatch = !showOnlyManageable || p.isManageable;
    return categoryMatch && manageableMatch;
  });

  const handleTransferOwnership = async (predeploy: typeof PREDEPLOYS[0]) => {
    if (!isValidAddress(newOwner)) {
      alert('Invalid Ethereum address');
      return;
    }

    setActionInProgress(true);
    try {
      const calldata = generateTransferOwnershipCalldata(newOwner);
      const contractInfo = await getContractInfo(predeploy.address);

      if (!contractInfo.owner) {
        alert('Could not retrieve current owner');
        return;
      }

      // Check if owner is EOA or contract
      const isEOA = await isOwnerEOA(contractInfo.owner);

      if (isEOA) {
        if (connectedAddress?.toLowerCase() !== contractInfo.owner.toLowerCase()) {
          alert('You are not the owner of this contract');
          return;
        }
        // Execute transaction directly
        alert('Execute this transaction from your wallet:\n\nTo: ' + predeploy.address + '\nData: ' + calldata);
      } else {
        // Owner is a contract (multisig, DAO, etc.)
        alert(
          'This contract is owned by a multisig or contract address.\n\nCalldata for multisig:\n' + calldata +
            '\n\nTarget: ' +
            predeploy.address,
        );
      }

      resetForm();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setActionInProgress(false);
    }
  };

  const handleWithdraw = async (predeploy: typeof PREDEPLOYS[0]) => {
    setActionInProgress(true);
    try {
      const contractInfo = await getContractInfo(predeploy.address);

      if (!contractInfo.owner) {
        alert('Could not retrieve current owner');
        return;
      }

      const isEOA = await isOwnerEOA(contractInfo.owner);

      if (isEOA) {
        if (connectedAddress?.toLowerCase() !== contractInfo.owner.toLowerCase()) {
          alert('You are not the owner of this contract');
          return;
        }
        // Execute withdraw directly
        const calldata = '0x3ccfd60b'; // withdraw() function selector
        alert('Execute this transaction from your wallet:\n\nTo: ' + predeploy.address + '\nData: ' + calldata);
      } else {
        // Owner is a contract
        const calldata = '0x3ccfd60b';
        alert(
          'This contract is owned by a multisig or contract address.\n\nCalldata for multisig:\n' + calldata +
            '\n\nTarget: ' +
            predeploy.address,
        );
      }

      resetForm();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setActionInProgress(false);
    }
  };

  const resetForm = () => {
    setActionType(null);
    setNewOwner('');
    setSelectedPredeploy(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Predeploys Management</h1>
        <p>Query and manage OP Stack predeploy contracts</p>
      </div>

      {!isConnected && (
        <div className="warning-banner">
          ⚠️ Wallet not connected. Connect your wallet to manage contracts.
        </div>
      )}

      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="category-filter">Filter by Category</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as FilterCategory)}
          >
            <option value="all">All Categories</option>
            <option value="bridge">Bridge & Messaging</option>
            <option value="vault">Fee Vaults</option>
            <option value="factory">Factories</option>
            <option value="system">System</option>
            <option value="governance">Governance & Attestation</option>
          </select>
        </div>

        <div className="control-group checkbox">
          <input
            id="manageable-filter"
            type="checkbox"
            checked={showOnlyManageable}
            onChange={e => setShowOnlyManageable(e.target.checked)}
          />
          <label htmlFor="manageable-filter">Show only manageable contracts</label>
        </div>
      </div>

      <div className="count-badge">{filtered.length} contracts</div>

      <div className="predeploys-grid">
        {filtered.map(predeploy => (
          <PredeployCard
            key={predeploy.address}
            predeploy={predeploy}
            isSelected={selectedPredeploy === predeploy.address}
            onSelect={() => setSelectedPredeploy(predeploy.address)}
            onTransferClick={() => {
              setSelectedPredeploy(predeploy.address);
              setActionType('transfer');
            }}
            onWithdrawClick={() => {
              setSelectedPredeploy(predeploy.address);
              setActionType('withdraw');
            }}
            connectedAddress={connectedAddress}
          />
        ))}
      </div>

      {selectedPredeploy && actionType && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionType === 'transfer' ? 'Transfer Ownership' : 'Withdraw Funds'}
              </h2>
              <button className="close-btn" onClick={resetForm}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {actionType === 'transfer' && (
                <>
                  <div className="form-group">
                    <label htmlFor="new-owner">New Owner Address</label>
                    <input
                      id="new-owner"
                      type="text"
                      placeholder="0x..."
                      value={newOwner}
                      onChange={e => setNewOwner(e.target.value)}
                      disabled={actionInProgress}
                    />
                  </div>
                </>
              )}

              {actionType === 'withdraw' && (
                <div className="confirmation-message">
                  <p>
                    Are you sure you want to withdraw all funds from{' '}
                    <strong>{PREDEPLOYS.find(p => p.address === selectedPredeploy)?.name}</strong>?
                  </p>
                  <p className="text-muted">This action will call the withdraw() function on the contract.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={resetForm} disabled={actionInProgress}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const predeploy = PREDEPLOYS.find(p => p.address === selectedPredeploy);
                  if (predeploy) {
                    if (actionType === 'transfer') {
                      handleTransferOwnership(predeploy);
                    } else {
                      handleWithdraw(predeploy);
                    }
                  }
                }}
                disabled={actionInProgress || (actionType === 'transfer' && !newOwner)}
              >
                {actionInProgress ? 'Processing...' : actionType === 'transfer' ? 'Transfer' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function isOwnerEOA(ownerAddress: string): Promise<boolean> {
  // For now, assume EOA if not a known multisig pattern
  // In production, you'd check if the address has code
  const multisigPatterns = [
    'gnosis', // Gnosis Safe pattern
    'multisig', // Generic multisig
  ];

  const isKnownContract = multisigPatterns.some(pattern =>
    ownerAddress.toLowerCase().includes(pattern.toLowerCase()),
  );

  return !isKnownContract;
}
