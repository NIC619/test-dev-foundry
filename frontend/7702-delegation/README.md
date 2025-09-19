# EIP-7702 Account Delegation Demo

A dedicated frontend for testing EIP-7702 account delegation functionality. This demo allows you to delegate user accounts to smart contracts, enabling gasless transactions through the relayer pattern.

## Features

- **Account Management**: Generate/import relayer and user accounts
- **Contract Deployment**: Deploy SimpleDelegateContract for delegation
- **EIP-7702 Delegation**: Delegate user accounts to smart contracts
- **Relayer Pattern**: Relayer pays gas fees for delegation transactions
- **Private Key Display**: Copy user private keys for MetaMask import

## Files

- `delegation.html` - Main UI for account delegation
- `delegation.js` - JavaScript logic for delegation functionality
- `styles.css` - CSS styling for the delegation interface
- `ethers-6.15.0.umd.min.js` - Ethers.js library for blockchain interactions
- `README.md` - This documentation

## How to Use

### 1. Start the Server
```bash
cd /Users/nic619/localProjects/test-unifi-deploy/frontend/7702-delegation
python3 -m http.server 5502
```

### 2. Open the Demo
Navigate to: `http://localhost:5502/delegation.html`

### 3. Workflow
1. **Generate/Import Accounts**:
   - Relayer account (has ETH for gas fees)
   - User account (copy private key to MetaMask)

2. **Deploy Contract**:
   - Deploy SimpleDelegateContract if not already deployed

3. **Delegate Account**:
   - User authorizes delegation to the contract
   - Relayer sends the delegation transaction (pays gas)

4. **Revoke Delegation**:
   - User authorizes revocation
   - Relayer sends the revocation transaction

## EIP-7702 Implementation

The demo implements EIP-7702 account delegation using:

- **Authorization Creation**: User's private key creates the authorization
- **Transaction Type 4**: EIP-7702 transaction type with `authorizationList`
- **Self-Transfer Pattern**: Simple self-transfer transaction carries the authorization
- **Relayer Execution**: Relayer sends transaction and pays gas fees

## Account Roles

- **Relayer**: Has ETH for gas fees, sends delegation transactions
- **User**: Creates authorizations, gets delegated to smart contract
- **Contract**: SimpleDelegateContract that handles delegated calls

## Dependencies

- **Ethers.js**: For blockchain interactions and EIP-7702 support
- **Self-contained**: All dependencies included in this folder
- **No external dependencies**: CSS and JavaScript libraries are local

## Self-Contained Structure

This demo is completely self-contained with all necessary files:

- ✅ **Local CSS**: `styles.css` - Complete styling for the interface
- ✅ **Local Ethers**: `ethers-6.15.0.umd.min.js` - Blockchain interaction library
- ✅ **No external links**: All resources are local for offline use
- ✅ **Portable**: Can be copied and run anywhere without dependencies

## Network Configuration

- **Default RPC**: `https://testnet-unifi-rpc.puffer.fi/`
- **Default Explorer**: `https://testnet-unifi-explorer.puffer.fi/`
- **Configurable**: RPC and Explorer URLs can be customized

## Security Notes

- Private keys are stored in localStorage (for demo purposes only)
- Relayer private key is not displayed in UI
- User private key is displayed for MetaMask import convenience
- All transactions are sent by the relayer (who has ETH)

## Troubleshooting

- **Button not working**: Check console for debug logs
- **Contract not deployed**: Deploy SimpleDelegateContract first
- **Delegation fails**: Ensure relayer has ETH for gas fees
- **Network issues**: Verify RPC URL is accessible
