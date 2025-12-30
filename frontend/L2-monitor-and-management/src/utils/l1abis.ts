import type { Abi } from 'viem';

// ABI for AnchorStateRegistry contract
export const ANCHOR_STATE_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'disputeGameFinalityDelaySeconds',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'systemConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'disputeGameFactory',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'anchorGame',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'respectedGameType',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'retirementTimestamp',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getAnchorRoot',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'root', type: 'bytes32' },
      { name: 'l2SequenceNumber', type: 'uint256' },
    ],
  },
] as const satisfies Abi;

// ABI for DisputeGameFactory contract
export const DISPUTE_GAME_FACTORY_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'portalAddress',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'proverRegistryAddress',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'getBlockNumber',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'getCurrentOffset',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'gameCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'gameImpls',
    stateMutability: 'view',
    inputs: [{ name: 'gameType', type: 'uint32' }],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'initBonds',
    stateMutability: 'view',
    inputs: [{ name: 'gameType', type: 'uint32' }],
    outputs: [{ type: 'uint256' }],
  },
] as const satisfies Abi;

// ABI for L1StandardBridge contract (uses L1ChugSplashProxy)
export const L1_STANDARD_BRIDGE_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'signalService',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'systemConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  // L1ChugSplashProxy functions (must be called with from: address(0))
  {
    type: 'function',
    name: 'getOwner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'getImplementation',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// ABI for OptimismPortal contract
export const OPTIMISM_PORTAL_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'proofMaturityDelaySeconds',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'systemConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'ethLockbox',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'anchorStateRegistry',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'disputeGameFactory',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// ABI for SystemConfig contract
export const SYSTEM_CONFIG_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'batcherHash',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'gasLimit',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'basefeeScalar',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'blobbasefeeScalar',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'eip1559Denominator',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'eip1559Elasticity',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'operatorFeeScalar',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint32' }],
  },
  {
    type: 'function',
    name: 'operatorFeeConstant',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'l2ChainId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'unsafeBlockSigner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'l1CrossDomainMessenger',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'l1StandardBridge',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'disputeGameFactory',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'optimismPortal',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'batchInbox',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'startBlock',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'resourceConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'maxResourceLimit', type: 'uint32' },
          { name: 'elasticityMultiplier', type: 'uint8' },
          { name: 'baseFeeMaxChangeDenominator', type: 'uint8' },
          { name: 'minimumBaseFee', type: 'uint32' },
          { name: 'systemTxMaxGas', type: 'uint32' },
          { name: 'maximumBaseFee', type: 'uint128' },
        ],
      },
    ],
  },
] as const satisfies Abi;

// ABI for EthLockbox contract
export const ETH_LOCKBOX_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'systemConfig',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
] as const satisfies Abi;

// ABI for ProxyAdmin contract
export const PROXY_ADMIN_ABI = [
  {
    type: 'function',
    name: 'changeProxyAdmin',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proxy', type: 'address' },
      { name: 'newAdmin', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'upgrade',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proxy', type: 'address' },
      { name: 'implementation', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// Contract address to ABI mapping
export const L1_CONTRACT_ABIS: Record<string, Abi> = {
  '0x5415b132cb934066dc9bf1924a0cad9fb4eed07e': ANCHOR_STATE_REGISTRY_ABI, // AnchorStateRegistry
  '0xc3566eb389ba4e6c378f6f0a7e99c32033aea9d4': DISPUTE_GAME_FACTORY_ABI, // DisputeGameFactory
  '0xa99a27d6f39630332e0f39c9fa3d2e0c0d76b3e7': L1_STANDARD_BRIDGE_ABI, // L1StandardBridge
  '0x0e9c3f12dca3494d7a6d96bf47fb1d45e949a4b2': OPTIMISM_PORTAL_ABI, // OptimismPortal
  '0xd3d6c903d4b4a2199439f4147cc4ac4781bc5016': PROXY_ADMIN_ABI, // ProxyAdmin
  '0x3c2b21bad19002d888b25a183bcdae97ab520b7c': SYSTEM_CONFIG_ABI, // SystemConfig
  // EthLockbox - Address TBD (not yet deployed)
  // When deployed, add: '[address]': ETH_LOCKBOX_ABI, // EthLockbox
};
