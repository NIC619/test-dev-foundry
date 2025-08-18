# Gasless USDC Transfer with EIP-7702

A simple web application for managing Ethereum EOA (Externally Owned Account) addresses for `relayer` and `user` accounts.

## Features

- **Default Accounts**: Pre-configured relayer and user accounts loaded automatically
- **Account Generation**: Generate random Ethereum accounts with private keys
- **Account Import**: Import existing accounts using private keys
- **Account Display**: View the Ethereum address for each account
- **Account Reset**: Reset to default accounts or clear completely
- **Blockchain Configuration**: Configure RPC and Explorer URLs
- **Contract Deployment**: Deploy ERC20Mintable contracts to the blockchain
- **Contract Interactions**: Mint and transfer tokens using the deployed contract
- **Transaction Explorer Links**: Direct links to view transactions on the blockchain explorer
- **Real-time Balance Display**: Shows ETH balance for relayer and token balance for user
- **Persistence**: Accounts, URLs, and deployed contracts are saved in browser localStorage
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

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
├── index.html                    # Main HTML file
├── styles.css                    # CSS styles
├── script.js                     # JavaScript functionality
├── ethers-5.7.2.umd.min.js      # Local ethers.js library
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

These defaults are loaded automatically when the application starts, but users can still import custom accounts or generate new ones.

## Contract Deployment

The application includes a built-in ERC20Mintable contract deployment feature:

- **Automatic Detection**: Checks if the contract is already deployed at the default address
- **Smart Deployment**: Only allows deployment if the contract doesn't exist
- **Token Configuration**: Set custom token name, symbol, and decimals
- **Account Selection**: Choose which account (relayer/user) to deploy from
- **Deployment Tracking**: Stores deployed contract addresses in localStorage
- **Explorer Links**: Success messages include direct links to view the deployment transaction on the blockchain explorer

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
- **Balance Display**: Real-time token balance shown next to "Called by User Account"
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

1. Edit the HTML structure in `index.html`
2. Modify styles in `styles.css`
3. Update functionality in `script.js`
4. The application uses the `AccountManager` class for all operations

## License

This is a development tool. Use at your own risk.
