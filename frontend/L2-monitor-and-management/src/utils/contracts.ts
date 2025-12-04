import { createPublicClient, http, type Abi } from 'viem';

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

export interface ContractInfo {
  address: string;
  owner: string | null;
  balance: bigint | null;
  error: string | null;
}

export async function getContractOwner(
  address: string,
  rpcUrl: string = 'http://34.51.145.209:8545',
): Promise<string | null> {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

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
    error: null,
  };

  try {
    const owner = await getContractOwner(address, rpcUrl);
    result.owner = owner;

    const balance = await getBalance(address, rpcUrl);
    result.balance = balance;
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
