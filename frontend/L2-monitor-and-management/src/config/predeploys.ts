import type { Predeploy } from '@/types';

export const PREDEPLOYS: Predeploy[] = [
  // Core Bridge & Messaging
  {
    name: 'L2ToL1MessagePasser',
    address: '0x4200000000000000000000000000000000000016',
    description: 'Stores withdrawal transaction commitments and facilitates L2 to L1 message passing',
    category: 'bridge',
    isManageable: true,
  },
  {
    name: 'L2CrossDomainMessenger',
    address: '0x4200000000000000000000000000000000000007',
    description: 'Higher level API for sending cross domain messages between L1 and L2',
    category: 'bridge',
    isManageable: true,
  },
  {
    name: 'L2StandardBridge',
    address: '0x4200000000000000000000000000000000000010',
    description: 'Facilitates ETH and token transfers across domains',
    category: 'bridge',
    isManageable: true,
  },
  {
    name: 'L2ERC721Bridge',
    address: '0x4200000000000000000000000000000000000014',
    description: 'Manages NFT (ERC721) bridge transfers across domains',
    category: 'bridge',
    isManageable: true,
  },

  // Fee Vaults
  {
    name: 'SequencerFeeVault',
    address: '0x4200000000000000000000000000000000000011',
    description: 'Accumulates transaction priority fees from the sequencer',
    category: 'vault',
    isManageable: true,
  },
  {
    name: 'BaseFeeVault',
    address: '0x4200000000000000000000000000000000000019',
    description: 'Accumulates L2 base fees',
    category: 'vault',
    isManageable: true,
  },
  {
    name: 'L1FeeVault',
    address: '0x420000000000000000000000000000000000001a',
    description: 'Accumulates L1 transaction fee portions',
    category: 'vault',
    isManageable: true,
  },
  {
    name: 'OperatorFeeVault',
    address: '0x420000000000000000000000000000000000001B',
    description: 'Collects operator-specific fees',
    category: 'vault',
    isManageable: true,
  },

  // Factory Contracts
  {
    name: 'OptimismMintableERC20Factory',
    address: '0x4200000000000000000000000000000000000012',
    description: 'Creates L2 ERC20 contracts for L1 tokens',
    category: 'factory',
    isManageable: true,
  },
  {
    name: 'OptimismMintableERC721Factory',
    address: '0x4200000000000000000000000000000000000017',
    description: 'Creates L2 ERC721 contracts for L1 NFTs',
    category: 'factory',
    isManageable: true,
  },

  // System Contracts
  {
    name: 'WETH9',
    address: '0x4200000000000000000000000000000000000006',
    description: 'Standard Wrapped Ether implementation',
    category: 'system',
    isManageable: false,
  },
  {
    name: 'L1Block',
    address: '0x4200000000000000000000000000000000000015',
    description: 'Maintains L1 context accessible on L2',
    category: 'system',
    isManageable: false,
  },
  {
    name: 'L1BlockNumber',
    address: '0x4200000000000000000000000000000000000013',
    description: 'Returns last known L1 block number',
    category: 'system',
    isManageable: false,
  },
  {
    name: 'GasPriceOracle',
    address: '0x420000000000000000000000000000000000000F',
    description: 'Computes L1 and L2 transaction fee portions',
    category: 'system',
    isManageable: false,
  },
  {
    name: 'ProxyAdmin',
    address: '0x4200000000000000000000000000000000000018',
    description: 'Owner of all predeploy proxies',
    category: 'system',
    isManageable: false,
  },

  // Governance & Attestation
  {
    name: 'GovernanceToken',
    address: '0x4200000000000000000000000000000000000042',
    description: 'OP governance token',
    category: 'governance',
    isManageable: false,
  },
  {
    name: 'SchemaRegistry',
    address: '0x4200000000000000000000000000000000000020',
    description: 'Stores attestation schemas',
    category: 'governance',
    isManageable: false,
  },
  {
    name: 'EAS',
    address: '0x4200000000000000000000000000000000000021',
    description: 'Ethereum Attestation Service protocol',
    category: 'governance',
    isManageable: false,
  },
  {
    name: 'BeaconBlockRoot',
    address: '0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02',
    description: 'Provides L1 beacon block root access',
    category: 'governance',
    isManageable: false,
  },
];
