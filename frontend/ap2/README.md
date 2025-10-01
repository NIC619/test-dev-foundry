# AP2 Protocol Demo

A React web application demonstrating the AP2 (Agent Payment Protocol v2) on UniFi Testnet, featuring delegated agent payment flows with gasless transactions.

## What This Demo Is For

This demo showcases two payment flows:

1. **Recurring Payment (x402)** - Users sign once to authorize recurring payments, then can pay multiple times without additional signatures
2. **Automated Purchasing** - Users create price-based bids that execute automatically when conditions are met

Both flows enable gasless transactions where an agent pays the gas fees while users only pay for services in USDC.

## How It's Achieved

The demo uses:
- **EIP-712** typed data signing for secure off-chain authorization
- **WAGMI** React hooks for wallet integration
- **PaymentFacilitator contract** for permissionless delegated payments
- An agent system that monitors and executes transactions on behalf of users

## How to Run the Demo

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

4. **Connect MetaMask:**
   - Make sure you're connected to UniFi testnet
   - Connect your wallet when prompted

5. **Try the demos:**
   - **Recurring Payment**: Approve USDC, then authorize recurring payments. Click "Pay 0.1 USDC" multiple times without re-signing
   - **Automated Purchasing**: Select an item, create a bid, and watch it execute automatically when the price drops

## Requirements

- MetaMask browser extension
- Connection to UniFi testnet
- USDC tokens on UniFi testnet (approve before use)

## Network Configuration

- **Network**: UniFi Testnet
- **Chain ID**: `2092151908`
- **RPC URL**: `https://testnet-unifi-rpc.puffer.fi/`
- **Explorer**: `https://testnet-explorer-unifi.puffer.fi/`

## Contract Addresses

- **USDC Token**: `0xa1706a87F06d4F0F379A9123e41672924B654550`
- **PaymentFacilitator**: `0xA88288C4314B390F7E0DE9fb04DAE4c0c6bb1459`
