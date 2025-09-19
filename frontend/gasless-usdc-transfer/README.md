# Gasless USDC Transfer with EIP-7702

A comprehensive web application for gasless token transfers using EIP-7702 delegation and EIP-712 signatures. Includes two demos: a full-featured version (`index.html`) and a simplified EIP-712 transfer demo (`eip712-transfer.html`).

## Features

### Full Demo (`index.html`)
- **Default Accounts**: Pre-configured relayer and user accounts loaded automatically
- **Account Generation**: Generate random Ethereum accounts with private keys
- **Account Import**: Import existing accounts using private keys
- **Account Display**: View the Ethereum address for each account
- **Account Reset**: Reset to default accounts or clear completely
- **Blockchain Configuration**: Configure RPC and Explorer URLs
- **Contract Deployment**: Deploy ERC20Mintable contracts to the blockchain
- **Contract Interactions**: Mint and transfer tokens using the deployed contract
- **EIP-7702 Gasless Transfers**: User delegates execution to relayer, who pays gas fees
- **Transaction Explorer Links**: Direct links to view transactions on the blockchain explorer
- **Real-time Balance Display**: Shows ETH balance for relayer and token balance for user
- **Persistence**: Accounts, URLs, and deployed contracts are saved in browser localStorage
- **Responsive Design**: Works on desktop and mobile devices

### Simplified EIP-712 Demo (`eip712-transfer.html`)
- **MetaMask Integration**: Connect and sign with MetaMask wallet
- **Simplified UI**: Clean interface focused on gasless transfers
- **EIP-712 Signing**: Uses EIP-712 typed data signing for secure transactions
- **Token Decimals Support**: Automatically detects and uses correct token decimals
- **Real-time Balance Display**: Shows user and relayer token balances
- **Gasless Transfer Flow**: One-click transfer with MetaMask signing

## How to Use

### Full Demo (`index.html`)
1. **Open the Application**: Open `index.html` in your web browser
2. **Default Accounts**: Default relayer and user accounts are loaded automatically
3. **Edit Accounts**: Click "Edit Account" to modify the current account or import/generate a new one
4. **Generate an Account**: Click the "Generate" button to create a random account
5. **Import an Account**: Enter a private key and click "Import"
6. **View Address**: Once an account is set, the address will be displayed
7. **Reset Account**: Click "Reset to Default" to return to the default account
8. **Configure Blockchain**: Set custom RPC and Explorer URLs or use the default UniFi testnet URLs
9. **Deploy Contract**: Fill in token details and deploy ERC20Mintable contract if not already deployed
10. **Mint Tokens**: Use the relayer account to mint tokens to any address
11. **Transfer Tokens**: Use the user account to transfer tokens to other addresses

### Simplified EIP-712 Demo (`eip712-transfer.html`)
1. **Open the Demo**: Open `eip712-transfer.html` in your web browser
2. **Connect MetaMask**: Click "Connect MetaMask" to connect your wallet
3. **Fill Transfer Details**: Enter recipient address, amount, and optional fee
4. **Execute Transfer**: Click "Transfer" to sign with MetaMask and execute gasless transfer
5. **View Results**: Check transaction on explorer and updated balances

## Private Key Format

Private keys should be 64-character hexadecimal strings. You can include the `0x` prefix or omit it:
- `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

## Security Notes

⚠️ **Important Security Warnings**:
- This application runs entirely in the browser
- Private keys are stored in browser localStorage (not secure for production use)
- Never use this application with accounts containing real funds
- This is intended for development and testing purposes only
- Always use a hardware wallet or secure wallet for real transactions

## MetaMask EIP-712 Signing Limitations

⚠️ **MetaMask Signing Issues**:
- **VerifyingContract Restriction**: MetaMask blocks EIP-712 signatures when `verifyingContract` is set to an EOA (Externally Owned Account) address for security reasons
- **EIP-7702 Delegation Conflict**: When using EIP-7702 delegation, the user's account is delegated to a contract, but MetaMask still sees it as an EOA and blocks the signature
- **Current Workaround**: The simplified demo (`eip712-transfer.html`) still uses embedded private keys for signing as MetaMask cannot produce verifiable signatures for this use case
- **Domain Structure**: We use a domain without `verifyingContract` to avoid MetaMask restrictions, but this requires contract modifications
- **Future Solutions**: Consider using wallet connect or other signing methods that don't have these restrictions

## Technical Details

- Uses [ethers.js](https://docs.ethers.io/) for Ethereum account operations (bundled locally)
- Pure HTML/CSS/JavaScript - no build process required
- Works offline - no internet connection required
- Responsive design with modern UI
- Local storage for account and URL persistence
- Default UniFi testnet configuration included

## File Structure

```
frontend/
├── index.html                    # Full-featured demo with account management
├── eip712-transfer.html          # Simplified EIP-712 transfer demo
├── styles.css                    # CSS styles
├── script.js                     # JavaScript functionality for full demo
├── eip712-transfer.js            # JavaScript functionality for EIP-712 demo
├── ethers-6.15.0.umd.min.js     # Local ethers.js v6 library
└── README.md                     # This file
```

## Default Configuration

The application comes with default UniFi testnet URLs and accounts:

### Blockchain Configuration
- **RPC URL**: `https://testnet-unifi-rpc.puffer.fi/`
- **Explorer URL**: `https://testnet-unifi-explorer.puffer.fi/`
- **Default Contract Address**: `0x95C622a98FB0d1c89cd9f818e968A18fCAFD8F51`

### Default Accounts
- **Relayer Account**: `0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8`
- **User Account**: `0xdada0c233671b034b77b638fa29b745133853edd3c4dbedf3273e726b7bb6afc`
- **SimpleDelegateContract**: `0x8052A771FbeDa789Fb0384040773E6F0b734f244`

These defaults are loaded automatically when the application starts, but users can still import custom accounts or generate new ones.

## Contract Deployment

The application includes a built-in ERC20Mintable contract deployment feature:

- **Automatic Detection**: Checks if the contract is already deployed at the default address
- **Smart Deployment**: Only allows deployment if the contract doesn't exist
- **Token Configuration**: Set custom token name, symbol, and decimals
- **Account Selection**: Choose which account (relayer/user) to deploy from
- **Deployment Tracking**: Stores deployed contract addresses in localStorage
- **Explorer Links**: Success messages include direct links to view the deployment transaction on the blockchain explorer

## SimpleDelegateContract Deployment

The application includes a SimpleDelegateContract deployment feature for EIP-7702 gasless transfers:

- **Automatic Detection**: Checks if the contract is already deployed at the default address
- **Smart Deployment**: Only allows deployment if the contract doesn't exist
- **Account Selection**: Choose which account (relayer/user) to deploy from
- **Deployment Tracking**: Stores deployed contract addresses in localStorage
- **Explorer Links**: Success messages include direct links to view the deployment transaction on the blockchain explorer

The SimpleDelegateContract enables EIP-7702 gasless transfers by:
- Allowing users to delegate execution authority
- Enabling relayers to execute transactions on behalf of users
- Supporting batch transaction execution

The ERC20Mintable contract includes:
- Standard ERC20 functionality (transfer, approve, etc.)
- Public minting (anyone can mint tokens)
- Batch minting for multiple recipients
- Token burning functionality

## Contract Interactions

The application provides two main contract interaction features:

### Mint Tokens
- **Account**: Uses the relayer account to call the mint function
- **Functionality**: Creates new tokens and sends them to a specified address
- **Requirements**: 
  - Relayer account must be set
  - Contract must be deployed
  - Valid recipient address
  - Positive amount
- **Amount Handling**: The input amount is automatically multiplied by the token's decimals (e.g., 1.5 tokens with 18 decimals = 1500000000000000000 wei)
- **Explorer Links**: Success messages include direct links to view the transaction on the blockchain explorer
- **Balance Display**: Real-time token balance shown next to "User delegates, Relayer pays gas"
- **EIP-7702 Delegation**: User signs a delegation allowing the SimpleDelegateContract to execute on their behalf
- **Gasless Execution**: Relayer pays gas fees while executing the user's token transfer
- **Balance Display**: Real-time ETH balance shown next to "Called by Relayer Account"

### Transfer Tokens
- **Account**: Uses the user account to call the transfer function
- **Functionality**: Transfers existing tokens from the user account to another address
- **Requirements**:
  - User account must be set
  - Contract must be deployed
  - Valid recipient address
  - Positive amount
  - User account must have sufficient balance
- **Amount Handling**: The input amount is automatically multiplied by the token's decimals (e.g., 1.5 tokens with 18 decimals = 1500000000000000000 wei)
```

## Browser Compatibility

- Modern browsers with ES6 support
- No internet connection required (ethers.js bundled locally)
- Tested on Chrome, Firefox, Safari, and Edge

## Development

To modify or extend this application:

### Full Demo (`index.html`)
1. Edit the HTML structure in `index.html`
2. Modify styles in `styles.css`
3. Update functionality in `script.js`
4. The application uses the `AccountManager` class for all operations

### EIP-712 Demo (`eip712-transfer.html`)
1. Edit the HTML structure in `eip712-transfer.html`
2. Modify styles in `styles.css`
3. Update functionality in `eip712-transfer.js`
4. The application uses the `EIP712TransferManager` class for all operations

## License

This is a development tool. Use at your own risk.
