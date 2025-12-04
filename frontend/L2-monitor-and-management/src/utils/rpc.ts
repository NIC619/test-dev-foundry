import { createPublicClient, http } from 'viem';
import type { BlockInfo, RpcEndpoint } from '../types';

export const RPC_ENDPOINTS: RpcEndpoint[] = [
  {
    name: 'Gateway Endpoint',
    url: 'https://testnet-unifi-rpc.puffer.fi/',
  },
  {
    name: 'Main Node Endpoint',
    url: 'http://34.51.145.209:8545',
  },
  {
    name: 'TEE Node Endpoint',
    url: 'http://34.1.254.59:8545',
  },
];

export async function getBlockByTag(
  endpoint: RpcEndpoint,
  tag: 'latest' | 'safe' | 'finalized',
): Promise<BlockInfo> {
  const client = createPublicClient({
    transport: http(endpoint.url),
  });

  const block = await client.getBlock({
    blockTag: tag,
  });

  return {
    number: block.number,
    hash: block.hash,
    timestamp: block.timestamp,
  };
}

export async function fetchBlockData(
  endpoint: RpcEndpoint,
  tags: Array<'latest' | 'safe' | 'finalized'>,
): Promise<BlockInfo[]> {
  const promises = tags.map(tag => getBlockByTag(endpoint, tag));
  return Promise.all(promises);
}
