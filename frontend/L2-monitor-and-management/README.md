# L2 Monitor & Management Frontend

A comprehensive admin dashboard for monitoring and managing OP Stack chain predeploy contracts and block information.

## Features

### Block Monitor
- **Real-time block tracking** across multiple RPC endpoints
- **Multi-endpoint support**:
  - Gateway Endpoint: `https://testnet-unifi-rpc.puffer.fi/`
  - Main Node: `http://34.51.145.209:8545`
  - TEE Node: `http://34.1.254.59:8545`
- **Block tags**: Query `unsafe`, `safe`, and `finalized` blocks
- **Auto-refresh**: 5-second refresh interval for real-time updates
- **Block details**: Number, hash, timestamp, transaction count, miner, gas info

### Predeploys Management
- **Query predeploy contract info**: View owner, balance, and status
- **Filter by category**:
  - Bridge & Messaging
  - Fee Vaults
  - Factories
  - System Contracts
  - Governance & Attestation
- **Management features** (for manageable contracts):
  - Transfer ownership
  - Withdraw funds (for vault contracts)
- **Smart authorization handling**:
  - If owner is an EOA: Check wallet connection
  - If owner is a contract (multisig, DAO): Present calldata for transaction crafting

## Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- A compatible Ethereum wallet (MetaMask, WalletConnect, etc.)

### Installation

```bash
npm install
```

### Configuration

Edit `src/config/wagmi.ts` to update:
- Chain ID (currently set to 1337)
- RPC endpoints
- Chain details

Edit `src/config/predeploys.ts` to add/remove predeploy contracts:

```typescript
{
  name: 'ContractName',
  address: '0x...',
  description: 'Description of what this contract does',
  category: 'bridge' | 'vault' | 'factory' | 'system' | 'governance',
  isManageable: true | false,
}
```

### Running the Frontend

```bash
npm start
```

Opens at `http://localhost:3000`

## Tech Stack

- **React 19** with TypeScript
- **Wagmi 2** - Wallet integration and smart contract interactions
- **Viem 2** - Ethereum client library
- **React Router 6** - Navigation
- **TanStack React Query 5** - Data fetching and caching
- **CSS3** - Styling (no framework, pure CSS)

## File Structure

```
src/
├── components/
│   ├── PredeployCard.tsx      # Individual predeploy contract card
│   └── PredeployCard.css
├── config/
│   ├── wagmi.ts               # Wagmi configuration
│   └── predeploys.ts          # Predeploy contracts list
├── pages/
│   ├── BlockMonitor.tsx       # Block monitoring page
│   ├── BlockMonitor.css
│   ├── Predeploys.tsx         # Predeploys management page
│   └── Predeploys.css
├── types/
│   └── index.ts               # TypeScript types
├── utils/
│   ├── rpc.ts                 # RPC utilities
│   └── contracts.ts           # Contract interaction utilities
├── App.tsx                    # Main app component
├── App.css
├── index.tsx
└── index.css
```

## Key Utilities

### RPC Utilities (`src/utils/rpc.ts`)
- `getBlockByTag()` - Fetch block by tag (unsafe, safe, finalized)
- `fetchBlockData()` - Fetch multiple blocks at once
- `RPC_ENDPOINTS` - List of all configured RPC endpoints

### Contract Utilities (`src/utils/contracts.ts`)
- `getContractOwner()` - Get owner address of a contract
- `getBalance()` - Get ETH balance of an address
- `getContractInfo()` - Get owner and balance info
- `generateTransferOwnershipCalldata()` - Generate calldata for ownership transfer
- `generateWithdrawCalldata()` - Generate calldata for withdraw function
- `isValidAddress()` - Validate Ethereum address format

## Usage

### Block Monitor
1. Navigate to the "Block Monitor" tab
2. View blocks across all three RPC endpoints
3. See real-time block data updated every 5 seconds
4. Click on block details to see expanded information

### Manage Predeploys
1. Navigate to the "Predeploys" tab
2. Connect your wallet using the wallet connection button
3. Filter contracts by category or show only manageable ones
4. Click a contract card to select it
5. Click "Transfer Owner" or "Withdraw" buttons
6. For EOA owners:
   - Verify you are the owner (displayed on card)
   - Copy the calldata and execute the transaction from your wallet
7. For contract owners (multisig, DAO):
   - The calldata will be presented
   - Craft the transaction in your multisig/DAO interface using the provided calldata

## Management Actions

### Transfer Ownership
- **For EOA Owner**: Must be the connected wallet
- **For Contract Owner**: Calldata provided for multisig/DAO to craft transaction
- **Calldata Function**: `transferOwnership(address newOwner)`

### Withdraw Funds
- **For EOA Owner**: Must be the connected wallet
- **For Contract Owner**: Calldata provided for multisig/DAO to craft transaction
- **Calldata Function**: `withdraw()`

## Notes

- No authorization is enforced by the frontend - it assumes the user has legitimate access
- The frontend provides guidance based on contract ownership (EOA vs contract)
- Always verify transaction details before executing
- Some contracts are read-only and cannot be managed (marked as `isManageable: false`)

## Development

### TypeScript
Strict mode is enabled. All components use proper typing.

### Adding New Predeploys
Edit `src/config/predeploys.ts`:

```typescript
{
  name: 'YourContract',
  address: '0x...',
  description: 'What this contract does',
  category: 'system',
  isManageable: false,
}
```

### Adding New RPC Endpoints
Edit `src/utils/rpc.ts`:

```typescript
export const RPC_ENDPOINTS: RpcEndpoint[] = [
  // ... existing endpoints
  {
    name: 'Your Endpoint',
    url: 'https://your-rpc-url/',
  },
];
```

## Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

## License

Inherited from parent project.
