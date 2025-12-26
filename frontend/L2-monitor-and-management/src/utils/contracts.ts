import { createPublicClient, http, type Abi } from 'viem';

// ABI for Proxy contracts (to get admin)
export const PROXY_ABI = [
  {
    type: 'function',
    name: 'admin',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address', name: '' }],
  },
  {
    type: 'function',
    name: 'implementation',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address', name: '' }],
  },
  {
    type: 'function',
    name: 'changeAdmin',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_admin', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'upgradeTo',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_implementation', type: 'address' }],
    outputs: [],
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

// Simple ABI for owner-based contracts
export const OWNABLE_ABI = [
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'address',
      },
    ],
  },
  {
    type: 'function',
    name: 'transferOwnership',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    outputs: [],
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
      },
    ],
  },
] as const satisfies Abi;

// ABI for vault contracts that have owner and withdraw
export const VAULT_ABI = [
  ...OWNABLE_ABI,
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdrawAll',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const satisfies Abi;

// ABI for L2CrossDomainMessenger
export const L2_CROSS_DOMAIN_MESSENGER_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'otherMessenger',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// ABI for L2StandardBridge
export const L2_STANDARD_BRIDGE_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'otherBridge',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'messenger',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'signalService',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// ABI for L2ERC721Bridge
export const L2_ERC721_BRIDGE_ABI = [
  {
    type: 'function',
    name: 'messenger',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'otherBridge',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

// ABI for Fee Vault contracts with extended view functions
export const FEE_VAULT_EXTENDED_ABI = [
  ...VAULT_ABI,
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'minWithdrawalAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'recipient',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'totalProcessed',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'withdrawalNetwork',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const satisfies Abi;

// ABI for WETH9
export const WETH9_ABI = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const satisfies Abi;

// ABI for L1Block
export const L1_BLOCK_ABI = [
  {
    type: 'function',
    name: 'version',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'number',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'timestamp',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'hash',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'sequenceNumber',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
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
    name: 'operatorFeeConstant',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint128' }],
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
    name: 'DEPOSITOR_ACCOUNT',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const satisfies Abi;

export interface ContractInfo {
  address: string;
  owner: string | null;
  balance: bigint | null;
  implementation: string | null;
  error: string | null;
}

export async function getContractOwner(
  address: string,
  rpcUrl: string = 'http://34.51.145.209:8545',
): Promise<string | null> {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  // ProxyAdmin contract uses owner() not admin()
  const isProxyAdmin = address.toLowerCase() === '0x4200000000000000000000000000000000000018';

  if (isProxyAdmin) {
    try {
      const owner = await client.readContract({
        address: address as `0x${string}`,
        abi: OWNABLE_ABI,
        functionName: 'owner',
      });
      return owner as string;
    } catch {
      return null;
    }
  }

  // For other contracts, first try to get proxy admin (for upgradeable contracts)
  try {
    const admin = await client.readContract({
      address: address as `0x${string}`,
      abi: PROXY_ABI,
      functionName: 'admin',
    });
    return admin as string;
  } catch {
    // If not a proxy, try getting owner from implementation
    try {
      const owner = await client.readContract({
        address: address as `0x${string}`,
        abi: OWNABLE_ABI,
        functionName: 'owner',
      });
      return owner as string;
    } catch {
      return null;
    }
  }
}

export async function getImplementation(
  address: string,
  rpcUrl: string = 'http://34.51.145.209:8545',
): Promise<string | null> {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  try {
    const implementation = await client.readContract({
      address: address as `0x${string}`,
      abi: PROXY_ABI,
      functionName: 'implementation',
    });
    return implementation as string;
  } catch {
    return null;
  }
}

export async function getBalance(
  address: string,
  rpcUrl: string = 'http://34.51.145.209:8545',
): Promise<bigint | null> {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  try {
    const balance = await client.getBalance({
      address: address as `0x${string}`,
    });
    return balance;
  } catch {
    return null;
  }
}

export async function getContractInfo(
  address: string,
  rpcUrl?: string,
): Promise<ContractInfo> {
  const result: ContractInfo = {
    address,
    owner: null,
    balance: null,
    implementation: null,
    error: null,
  };

  try {
    const owner = await getContractOwner(address, rpcUrl);
    result.owner = owner;

    const balance = await getBalance(address, rpcUrl);
    result.balance = balance;

    const implementation = await getImplementation(address, rpcUrl);
    result.implementation = implementation;
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Unknown error';
  }

  return result;
}

export function generateTransferOwnershipCalldata(newOwner: string): string {
  // Encode the transferOwnership function call
  // Function selector: keccak256("transferOwnership(address)")
  const functionSelector = '0xa6f9dae1'; // Pre-calculated selector
  // Remove 0x prefix from newOwner if present and pad to 32 bytes
  const paddedAddress = newOwner.replace('0x', '').padStart(64, '0');
  return functionSelector + paddedAddress;
}

export function generateChangeProxyAdminCalldata(proxyAddress: string, newAdmin: string): string {
  // Encode the changeProxyAdmin function call
  // Function selector: keccak256("changeProxyAdmin(address,address)")
  const functionSelector = '0x7eff275e'; // Pre-calculated selector
  // Remove 0x prefix and pad both addresses to 32 bytes
  const paddedProxy = proxyAddress.replace('0x', '').padStart(64, '0');
  const paddedNewAdmin = newAdmin.replace('0x', '').padStart(64, '0');
  return functionSelector + paddedProxy + paddedNewAdmin;
}

export function generateUpgradeCalldata(proxyAddress: string, newImplementation: string): string {
  // Encode the upgrade function call
  // Function selector: keccak256("upgrade(address,address)")
  const functionSelector = '0x99a88ec4'; // Pre-calculated selector
  // Remove 0x prefix and pad both addresses to 32 bytes
  const paddedProxy = proxyAddress.replace('0x', '').padStart(64, '0');
  const paddedImpl = newImplementation.replace('0x', '').padStart(64, '0');
  return functionSelector + paddedProxy + paddedImpl;
}

export function generateWithdrawCalldata(): string {
  // Encode the withdraw function call
  // Function selector: keccak256("withdraw()") = 0x3ccfd60b
  return '0x3ccfd60b';
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isEOA(address: string): boolean {
  // In a real scenario, you would check if the address is an EOA by verifying
  // if it has any code associated with it. For now, we assume it's EOA if no code.
  // This is a placeholder - actual implementation would require RPC call.
  return true; // Default assumption for now
}

// Get ABI based on contract address
function getAbiForContract(address: string): Abi | null {
  const lowerAddress = address.toLowerCase();

  // L2CrossDomainMessenger
  if (lowerAddress === '0x4200000000000000000000000000000000000007') {
    return L2_CROSS_DOMAIN_MESSENGER_ABI;
  }

  // L2StandardBridge
  if (lowerAddress === '0x4200000000000000000000000000000000000010') {
    return L2_STANDARD_BRIDGE_ABI;
  }

  // L2ERC721Bridge
  if (lowerAddress === '0x4200000000000000000000000000000000000014') {
    return L2_ERC721_BRIDGE_ABI;
  }

  // Fee Vaults (with extended view functions)
  if (
    lowerAddress === '0x4200000000000000000000000000000000000011' || // SequencerFeeVault
    lowerAddress === '0x4200000000000000000000000000000000000019' || // BaseFeeVault
    lowerAddress === '0x420000000000000000000000000000000000001a' || // L1FeeVault
    lowerAddress === '0x420000000000000000000000000000000000001b'    // OperatorFeeVault
  ) {
    return FEE_VAULT_EXTENDED_ABI;
  }

  // WETH9
  if (lowerAddress === '0x4200000000000000000000000000000000000006') {
    return WETH9_ABI;
  }

  // L1Block
  if (lowerAddress === '0x4200000000000000000000000000000000000015') {
    return L1_BLOCK_ABI;
  }

  return null;
}

// Fetch view function data for contracts
export async function getViewFunctionData(
  address: string,
  functionNames: string[],
  rpcUrl: string = 'http://34.51.145.209:8545',
): Promise<Record<string, any>> {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  const abi = getAbiForContract(address);
  if (!abi) {
    return {};
  }

  const results: Record<string, any> = {};

  for (const functionName of functionNames) {
    try {
      const result = await client.readContract({
        address: address as `0x${string}`,
        abi,
        functionName,
      });
      results[functionName] = result;
    } catch (error) {
      results[functionName] = null;
    }
  }

  return results;
}
