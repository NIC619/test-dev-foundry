import React, { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import type { Predeploy } from '../types';
import './OwnershipGraph.css';

interface OwnershipNode {
  name: string;
  address: string;
  children?: OwnershipNode[];
}

interface OwnershipGraphProps {
  contracts: Predeploy[];
  rpcUrl: string;
}

const PROXY_ADMIN_ABI = [
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'getProxyAdmin',
    stateMutability: 'view',
    inputs: [{ name: 'proxy', type: 'address' }],
    outputs: [{ type: 'address' }],
  },
] as const;

export function OwnershipGraph({ contracts, rpcUrl }: OwnershipGraphProps) {
  const [ownershipData, setOwnershipData] = useState<{
    managedContracts: OwnershipNode[];
    unmanagedContracts: Predeploy[];
    proxyAdminOwner: string | null;
    loading: boolean;
    error: string | null;
  }>({
    managedContracts: [],
    unmanagedContracts: [],
    proxyAdminOwner: null,
    loading: true,
    error: null,
  });

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const fetchOwnershipData = async () => {
      try {
        const client = createPublicClient({
          transport: http(rpcUrl),
        });

        // Find ProxyAdmin contract
        const proxyAdminContract = contracts.find(c => c.name === 'ProxyAdmin');
        if (!proxyAdminContract || !proxyAdminContract.address) {
          setOwnershipData({
            managedContracts: [],
            unmanagedContracts: contracts.filter(c => !c.isManageable),
            proxyAdminOwner: null,
            loading: false,
            error: 'ProxyAdmin contract not found',
          });
          return;
        }

        // Get ProxyAdmin's owner
        let proxyAdminOwner: string | null = null;
        try {
          const owner = await client.readContract({
            address: proxyAdminContract.address as `0x${string}`,
            abi: PROXY_ADMIN_ABI,
            functionName: 'owner',
          });
          proxyAdminOwner = owner as string;
        } catch (error) {
          console.error('Failed to get ProxyAdmin owner:', error);
        }

        // Separate managed and unmanaged contracts
        const managedContracts = contracts.filter(
          c => c.isManageable && c.name !== 'ProxyAdmin' && c.address
        );
        const unmanagedContracts = contracts.filter(
          c => !c.isManageable && c.address
        );

        // Group managed contracts by their proxy admin
        const contractsByAdmin: Record<string, Predeploy[]> = {};

        for (const contract of managedContracts) {
          try {
            const admin = await client.readContract({
              address: proxyAdminContract.address as `0x${string}`,
              abi: PROXY_ADMIN_ABI,
              functionName: 'getProxyAdmin',
              args: [contract.address as `0x${string}`],
            });

            const adminAddress = (admin as string).toLowerCase();
            if (!contractsByAdmin[adminAddress]) {
              contractsByAdmin[adminAddress] = [];
            }
            contractsByAdmin[adminAddress].push(contract);
          } catch (error) {
            // If we can't get the admin, assume it's the ProxyAdmin
            const adminAddress = proxyAdminContract.address.toLowerCase();
            if (!contractsByAdmin[adminAddress]) {
              contractsByAdmin[adminAddress] = [];
            }
            contractsByAdmin[adminAddress].push(contract);
          }
        }

        // Build ownership nodes
        const ownershipNodes: OwnershipNode[] = Object.entries(contractsByAdmin).map(
          ([adminAddress, adminContracts]) => {
            const adminContract = contracts.find(
              c => c.address.toLowerCase() === adminAddress
            );

            return {
              name: adminContract?.name || 'Unknown Admin',
              address: adminAddress,
              children: adminContracts.map(c => ({
                name: c.name,
                address: c.address,
              })),
            };
          }
        );

        setOwnershipData({
          managedContracts: ownershipNodes,
          unmanagedContracts,
          proxyAdminOwner,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching ownership data:', error);
        setOwnershipData({
          managedContracts: [],
          unmanagedContracts: [],
          proxyAdminOwner: null,
          loading: false,
          error: 'Failed to fetch ownership data',
        });
      }
    };

    fetchOwnershipData();
  }, [contracts, rpcUrl]);

  const truncateAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const { managedContracts, unmanagedContracts, proxyAdminOwner, loading, error } = ownershipData;

  if (loading) {
    return (
      <div className="ownership-graph">
        <h2>Contract Ownership Graph</h2>
        <p>Loading ownership data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ownership-graph">
        <h2>Contract Ownership Graph</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="ownership-graph">
      <h2>Contract Ownership Graph</h2>

      {/* Managed Contracts */}
      {managedContracts.length > 0 && (
        <div className="ownership-section">
          <h3>Managed Contracts</h3>
          {managedContracts.map((adminNode, index) => (
            <div key={index} className="ownership-tree">
              {/* Root: ProxyAdmin Owner (EOA) */}
              {proxyAdminOwner && adminNode.name === 'ProxyAdmin' && (
                <div className="ownership-level">
                  <div className="ownership-node root-node">
                    <span className="node-label">EOA (ProxyAdmin Owner)</span>
                    <span
                      className="node-address clickable"
                      title={proxyAdminOwner}
                      onClick={() => copyToClipboard(proxyAdminOwner)}
                    >
                      {truncateAddress(proxyAdminOwner)}
                      {copiedAddress === proxyAdminOwner && ' ✓'}
                    </span>
                  </div>
                  <div className="ownership-arrow">↓</div>
                </div>
              )}

              {/* Admin Node */}
              <div className="ownership-level">
                <div className="ownership-node admin-node">
                  <span className="node-label">{adminNode.name}</span>
                  <span
                    className="node-address clickable"
                    title={adminNode.address}
                    onClick={() => copyToClipboard(adminNode.address)}
                  >
                    {truncateAddress(adminNode.address)}
                    {copiedAddress === adminNode.address && ' ✓'}
                  </span>
                </div>
                {adminNode.children && adminNode.children.length > 0 && (
                  <div className="ownership-arrow">↓</div>
                )}
              </div>

              {/* Child Contracts */}
              {adminNode.children && adminNode.children.length > 0 && (
                <div className="ownership-level">
                  <div className="ownership-children">
                    {adminNode.children.map((child, childIndex) => (
                      <div key={childIndex} className="ownership-node child-node">
                        <span className="node-label">{child.name}</span>
                        <span
                          className="node-address clickable"
                          title={child.address}
                          onClick={() => copyToClipboard(child.address)}
                        >
                          {truncateAddress(child.address)}
                          {copiedAddress === child.address && ' ✓'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unmanaged Contracts */}
      {unmanagedContracts.length > 0 && (
        <div className="ownership-section">
          <h3>Non-Managed Contracts</h3>
          <div className="unmanaged-contracts">
            {unmanagedContracts.map((contract, index) => (
              <div key={index} className="ownership-node standalone-node">
                <span className="node-label">{contract.name}</span>
                <span
                  className="node-address clickable"
                  title={contract.address}
                  onClick={() => copyToClipboard(contract.address)}
                >
                  {truncateAddress(contract.address)}
                  {copiedAddress === contract.address && ' ✓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
