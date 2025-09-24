# Gasless USDC Transfer Demo

A React web application that demonstrates gasless token transfers using EIP-7702 account abstraction on the Unifi testnet.

## What This Demo Is For

This demo showcases how users can transfer USDC tokens without paying gas fees in ETH. Instead, users sign a message with their wallet, and a relayer executes the transaction on their behalf. The relayer can optionally charge a fee in USDC tokens for this service.

## How It's Achieved

The demo uses:
- **EIP-7702** for account abstraction, allowing smart contract functionality on regular EOA accounts
- **EIP-712** typed data signing for secure off-chain message authorization
- **WAGMI** React hooks for seamless wallet integration
- A relayer system that executes transactions using user signatures

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
   - Make sure you're connected to the Unifi testnet
   - Connect your MetaMask wallet when prompted

5. **Try the demo:**
   - Use the USDC Contract section to mint test tokens
   - Use the Gasless Transfer section to send tokens without paying ETH gas fees

## Requirements

- MetaMask browser extension
- Connection to Unifi testnet
- Some test USDC tokens (can be minted through the demo interface)
