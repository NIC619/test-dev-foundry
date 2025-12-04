export interface RpcEndpoint {
  name: string;
  url: string;
}

export interface BlockInfo {
  number: bigint;
  hash: string;
  timestamp: bigint;
}

export interface BlockMonitorData {
  endpoint: RpcEndpoint;
  tag: 'latest' | 'safe' | 'finalized';
  block: BlockInfo | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface Predeploy {
  name: string;
  address: string;
  description: string;
  category: 'bridge' | 'vault' | 'factory' | 'system' | 'governance';
  isManageable: boolean;
}

export interface PredployInfo extends Predeploy {
  owner?: string;
  balance?: bigint;
  loading?: boolean;
  error?: string | null;
}
