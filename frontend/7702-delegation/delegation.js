class DelegationManager {
    constructor() {
        this.defaultRpcUrl = 'https://testnet-unifi-rpc.puffer.fi/';
        this.defaultExplorerUrl = 'https://testnet-unifi-explorer.puffer.fi/';
        
        // Default private keys
        this.defaultRelayerPrivateKey = '0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8';
        this.defaultUserPrivateKey = '0xdada0c233671b034b77b638fa29b745133853edd3c4dbedf3273e726b7bb6afc';
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Relayer elements
        this.relayerInputSection = document.getElementById('relayer-input-section');
        this.relayerDisplaySection = document.getElementById('relayer-display-section');
        this.relayerPrivateKeyInput = document.getElementById('relayer-private-key');
        this.relayerAddressDisplay = document.getElementById('relayer-address');
        this.relayerImportBtn = document.getElementById('relayer-import');
        this.relayerGenerateBtn = document.getElementById('relayer-generate');
        this.relayerResetBtn = document.getElementById('relayer-reset');
        this.relayerEditBtn = document.getElementById('relayer-edit');

        // User elements
        this.userInputSection = document.getElementById('user-input-section');
        this.userDisplaySection = document.getElementById('user-display-section');
        this.userPrivateKeyInput = document.getElementById('user-private-key');
        this.userAddressDisplay = document.getElementById('user-address');
        this.userPrivateKeyDisplay = document.getElementById('user-private-key-display');
        this.userImportBtn = document.getElementById('user-import');
        this.userGenerateBtn = document.getElementById('user-generate');
        this.userResetBtn = document.getElementById('user-reset');
        this.userEditBtn = document.getElementById('user-edit');

        // Blockchain config elements
        this.rpcUrlInput = document.getElementById('rpc-url');
        this.explorerUrlInput = document.getElementById('explorer-url');
        this.rpcUrlValue = document.getElementById('rpc-url-value');
        this.explorerUrlValue = document.getElementById('explorer-url-value');
        this.rpcResetBtn = document.getElementById('rpc-reset');
        this.explorerResetBtn = document.getElementById('explorer-reset');

        // Contract elements
        this.delegateContractAddress = document.getElementById('delegate-contract-address');
        this.delegateContractStatus = document.getElementById('delegate-contract-status');
        this.deployDelegateContractBtn = document.getElementById('deploy-delegate-contract');

        // Delegation elements
        this.delegateAccountBtn = document.getElementById('delegate-account');
        this.revokeDelegationBtn = document.getElementById('revoke-delegation');
        this.delegationStatus = document.getElementById('delegation-status');
    }

    bindEvents() {
        // Relayer events
        this.relayerImportBtn.addEventListener('click', () => this.importAccount('relayer'));
        this.relayerGenerateBtn.addEventListener('click', () => this.generateAccount('relayer'));
        this.relayerResetBtn.addEventListener('click', () => this.resetAccount('relayer'));
        this.relayerEditBtn.addEventListener('click', () => this.editAccount('relayer'));

        // User events
        this.userImportBtn.addEventListener('click', () => this.importAccount('user'));
        this.userGenerateBtn.addEventListener('click', () => this.generateAccount('user'));
        this.userResetBtn.addEventListener('click', () => this.resetAccount('user'));
        this.userEditBtn.addEventListener('click', () => this.editAccount('user'));
        
        // Private key copy functionality
        this.userPrivateKeyDisplay.addEventListener('click', () => this.copyToClipboard(this.userPrivateKeyDisplay.textContent, 'Private key'));

        // Enter key support for inputs
        this.relayerPrivateKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.importAccount('relayer');
        });
        this.userPrivateKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.importAccount('user');
        });

        // Blockchain config events
        this.rpcUrlInput.addEventListener('change', () => this.updateRpcUrl());
        this.explorerUrlInput.addEventListener('change', () => this.updateExplorerUrl());
        this.rpcResetBtn.addEventListener('click', () => this.resetRpcUrl());
        this.explorerResetBtn.addEventListener('click', () => this.resetExplorerUrl());

        // Contract events
        this.deployDelegateContractBtn.addEventListener('click', () => this.deployDelegateContract());

        // Delegation events
        this.delegateAccountBtn.addEventListener('click', () => {
            console.log('Delegate Account button clicked');
            this.delegateAccount();
        });
        this.revokeDelegationBtn.addEventListener('click', () => {
            console.log('Revoke Delegation button clicked');
            this.revokeDelegation();
        });
    }

    initializeBlockchainConfig() {
        // Load saved URLs or use defaults
        const savedRpcUrl = localStorage.getItem('rpcUrl');
        const savedExplorerUrl = localStorage.getItem('explorerUrl');
        
        this.currentRpcUrl = savedRpcUrl || this.defaultRpcUrl;
        this.currentExplorerUrl = savedExplorerUrl || this.defaultExplorerUrl;
        
        // Update displays
        this.rpcUrlValue.textContent = this.currentRpcUrl;
        this.explorerUrlValue.textContent = this.currentExplorerUrl;
        
        // Set input values
        this.rpcUrlInput.value = this.currentRpcUrl;
        this.explorerUrlInput.value = this.currentExplorerUrl;
    }

    updateRpcUrl() {
        const newUrl = this.rpcUrlInput.value.trim();
        if (newUrl && this.isValidUrl(newUrl)) {
            this.currentRpcUrl = newUrl;
            this.rpcUrlValue.textContent = newUrl;
            localStorage.setItem('rpcUrl', newUrl);
            this.showSuccessMessage('RPC URL updated successfully!');
        }
    }

    updateExplorerUrl() {
        const newUrl = this.explorerUrlInput.value.trim();
        if (newUrl && this.isValidUrl(newUrl)) {
            this.currentExplorerUrl = newUrl;
            this.explorerUrlValue.textContent = newUrl;
            localStorage.setItem('explorerUrl', newUrl);
            this.showSuccessMessage('Explorer URL updated successfully!');
        }
    }

    resetRpcUrl() {
        this.currentRpcUrl = this.defaultRpcUrl;
        this.rpcUrlInput.value = this.defaultRpcUrl;
        this.rpcUrlValue.textContent = this.defaultRpcUrl;
        localStorage.setItem('rpcUrl', this.defaultRpcUrl);
        this.showSuccessMessage('RPC URL reset to default!');
    }

    resetExplorerUrl() {
        this.currentExplorerUrl = this.defaultExplorerUrl;
        this.explorerUrlInput.value = this.defaultExplorerUrl;
        this.explorerUrlValue.textContent = this.defaultExplorerUrl;
        localStorage.setItem('explorerUrl', this.defaultExplorerUrl);
        this.showSuccessMessage('Explorer URL reset to default!');
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    generateAccount(type) {
        try {
            // Generate a new random private key
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const address = wallet.address;

            // Store the account data
            this.setAccountData(type, privateKey, address, false);
            
            // Show success message
            this.showSuccessMessage(`${type} account generated successfully!`);
            
        } catch (error) {
            console.error('Error generating account:', error);
            this.showErrorMessage(`Failed to generate ${type} account: ${error.message}`);
        }
    }

    importAccount(type) {
        try {
            const privateKeyInput = type === 'relayer' ? this.relayerPrivateKeyInput : this.userPrivateKeyInput;
            const privateKey = privateKeyInput.value.trim();

            if (!privateKey) {
                this.showErrorMessage(`Please enter a private key for ${type} account`);
                return;
            }

            // Validate private key format
            if (!this.isValidPrivateKey(privateKey)) {
                this.showErrorMessage(`Invalid private key format for ${type} account. Please enter a valid 64-character hex string (with or without 0x prefix)`);
                return;
            }

            // Create wallet from private key
            const wallet = new ethers.Wallet(privateKey);
            const address = wallet.address;

            // Store the account data
            this.setAccountData(type, privateKey, address, false);
            
            // Show success message
            this.showSuccessMessage(`${type} account imported successfully!`);
            
        } catch (error) {
            console.error('Error importing account:', error);
            this.showErrorMessage(`Failed to import ${type} account: ${error.message}`);
        }
    }

    setAccountData(type, privateKey, address, isDefault = false) {
        const inputSection = type === 'relayer' ? this.relayerInputSection : this.userInputSection;
        const displaySection = type === 'relayer' ? this.relayerDisplaySection : this.userDisplaySection;
        const addressDisplay = type === 'relayer' ? this.relayerAddressDisplay : this.userAddressDisplay;
        const accountSection = inputSection.closest('.account-section');
        const accountTypeIndicator = displaySection.querySelector('.account-type');

        // Hide input section and show display section
        inputSection.classList.add('hidden');
        displaySection.classList.remove('hidden');

        // Display the address
        addressDisplay.textContent = address;
        
        // Display the private key for user accounts (not relayer)
        if (type === 'user' && this.userPrivateKeyDisplay) {
            this.userPrivateKeyDisplay.textContent = privateKey;
        }

        // Update account type indicator
        if (accountTypeIndicator) {
            if (isDefault) {
                accountTypeIndicator.textContent = 'Default Account';
                accountTypeIndicator.className = 'account-type default';
            } else {
                accountTypeIndicator.textContent = 'Custom Account';
                accountTypeIndicator.className = 'account-type custom';
            }
        }

        // Store account data in localStorage
        const accountData = {
            privateKey: privateKey,
            address: address,
            isDefault: isDefault
        };
        localStorage.setItem(`${type}Account`, JSON.stringify(accountData));

        // Add success styling
        accountSection.classList.add('success');
        setTimeout(() => {
            accountSection.classList.remove('success');
        }, 2000);
    }

    resetAccount(type) {
        // Remove from localStorage and load default account
        localStorage.removeItem(`${type}Account`);
        this.loadDefaultAccount(type);
    }

    editAccount(type) {
        const inputSection = type === 'relayer' ? this.relayerInputSection : this.userInputSection;
        const displaySection = type === 'relayer' ? this.relayerDisplaySection : this.userDisplaySection;
        const privateKeyInput = type === 'relayer' ? this.relayerPrivateKeyInput : this.userPrivateKeyInput;
        const accountSection = inputSection.closest('.account-section');

        // Show input section and hide display section
        inputSection.classList.remove('hidden');
        displaySection.classList.add('hidden');

        // Clear the private key input
        privateKeyInput.value = '';

        // Remove success styling
        accountSection.classList.remove('success');

        this.showSuccessMessage(`${type} account ready for editing`);
    }

    isValidPrivateKey(privateKey) {
        // Remove 0x prefix if present
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        // Check if it's a valid 64-character hex string
        return /^[0-9a-fA-F]{64}$/.test(cleanKey);
    }

    async deployDelegateContract() {
        try {
            this.deployDelegateContractBtn.disabled = true;
            this.deployDelegateContractBtn.textContent = 'Deploying...';
            this.delegateContractStatus.textContent = 'Deploying...';
            this.delegateContractStatus.className = 'contract-status deploying';

            // Get the user account data
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.showErrorMessage('User account not found');
                return;
            }

            const accountData = JSON.parse(userData);
            const wallet = new ethers.Wallet(accountData.privateKey);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Deploy SimpleDelegateContract
            const contractFactory = new ethers.ContractFactory(
                [
                    "function execute(address to, uint256 value, bytes calldata data) external payable",
                    "function executeBatch(address[] calldata tos, uint256[] calldata values, bytes[] calldata datas) external payable"
                ],
                "contract SimpleDelegateContract {\n    function execute(address to, uint256 value, bytes calldata data) external payable {\n        (bool success, ) = to.call{value: value}(data);\n        require(success, \"Call failed\");\n    }\n\n    function executeBatch(address[] calldata tos, uint256[] calldata values, bytes[] calldata datas) external payable {\n        for (uint256 i = 0; i < tos.length; i++) {\n            (bool success, ) = tos[i].call{value: values[i]}(datas[i]);\n            require(success, \"Call failed\");\n        }\n    }\n}",
                connectedWallet
            );

            const contract = await contractFactory.deploy();
            await contract.waitForDeployment();

            const contractAddress = await contract.getAddress();
            this.delegateContractAddress.textContent = contractAddress;

            const explorerLink = `${this.currentExplorerUrl}/tx/${contract.deploymentTransaction().hash}`;
            this.showSuccessMessage(`SimpleDelegateContract deployed successfully at ${contractAddress}`, explorerLink);
            this.delegateContractStatus.textContent = 'Deployed Successfully';
            this.delegateContractStatus.className = 'contract-status deployed';
            this.deployDelegateContractBtn.textContent = 'Contract Deployed';
            this.deployDelegateContractBtn.disabled = true;

            this.updateDelegationButtons();

        } catch (error) {
            console.error('Error deploying delegate contract:', error);
            this.showErrorMessage(`Failed to deploy delegate contract: ${error.message}`);
            this.deployDelegateContractBtn.disabled = false;
            this.deployDelegateContractBtn.textContent = 'Deploy SimpleDelegateContract';
            this.delegateContractStatus.textContent = 'Deployment Failed';
            this.delegateContractStatus.className = 'contract-status failed';
        }
    }

    async delegateAccount() {
        try {
            this.delegateAccountBtn.disabled = true;
            this.delegateAccountBtn.textContent = 'Delegating...';

            const contractAddress = this.delegateContractAddress.textContent.trim();

            if (!contractAddress) {
                this.showErrorMessage('Please deploy the SimpleDelegateContract first');
                return;
            }

            if (!this.isValidAddress(contractAddress)) {
                this.showErrorMessage('Invalid contract address');
                return;
            }

            // Get the user and relayer account data
            const userData = localStorage.getItem('userAccount');
            const relayerData = localStorage.getItem('relayerAccount');
            if (!userData || !relayerData) {
                this.showErrorMessage('User or relayer account not found');
                return;
            }

            const userAccountData = JSON.parse(userData);
            const relayerAccountData = JSON.parse(relayerData);
            const userPrivateKey = userAccountData.privateKey;
            const userAddress = userAccountData.address;
            const relayerPrivateKey = relayerAccountData.privateKey;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);

            // Check if user account is already delegated
            const userCode = await provider.getCode(userAddress);
            const isDelegated = userCode !== '0x' && userCode.startsWith('0xef0100');
            
            if (isDelegated) {
                this.showErrorMessage('Account is already delegated');
                this.delegateAccountBtn.disabled = false;
                this.delegateAccountBtn.textContent = 'Delegate Account';
                return;
            }

            // Create EIP-7702 authorization using user's private key
            const userWallet = new ethers.Wallet(userPrivateKey, provider);
            const nonce = await userWallet.getNonce();
            
            // Create authorization using ethers.js built-in method
            const authorization = await userWallet.authorize({
                address: contractAddress,
                nonce: nonce
            });

            // Create a simple self-transfer transaction with authorizationList
            const txRequest = {
                to: userAddress, // Self-transfer
                value: 0, // No ETH transfer
                data: '0x', // No data
                type: 4, // EIP-7702 transaction type
                authorizationList: [authorization]
            };

            // Send the transaction using relayer (who has ETH for gas)
            const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
            const tx = await relayerWallet.sendTransaction(txRequest);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage(`Account delegated to contract ${contractAddress}`, explorerLink);
            
            // Update delegation status
            this.delegationStatus.textContent = 'Delegated';
            this.delegationStatus.className = 'contract-status deployed';
            
            // Reset button
            this.delegateAccountBtn.disabled = false;
            this.delegateAccountBtn.textContent = 'Delegate Account';

        } catch (error) {
            console.error('Error delegating account:', error);
            this.showErrorMessage(`Failed to delegate account: ${error.message}`);
            this.delegateAccountBtn.disabled = false;
            this.delegateAccountBtn.textContent = 'Delegate Account';
        }
    }

    async revokeDelegation() {
        try {
            this.revokeDelegationBtn.disabled = true;
            this.revokeDelegationBtn.textContent = 'Revoking...';

            // Get the user and relayer account data
            const userData = localStorage.getItem('userAccount');
            const relayerData = localStorage.getItem('relayerAccount');
            if (!userData || !relayerData) {
                this.showErrorMessage('User or relayer account not found');
                return;
            }

            const userAccountData = JSON.parse(userData);
            const relayerAccountData = JSON.parse(relayerData);
            const userPrivateKey = userAccountData.privateKey;
            const userAddress = userAccountData.address;
            const relayerPrivateKey = relayerAccountData.privateKey;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);

            // Check if user account is actually delegated
            const userCode = await provider.getCode(userAddress);
            const isDelegated = userCode !== '0x' && userCode.startsWith('0xef0100');
            
            if (!isDelegated) {
                this.showErrorMessage('Account is not currently delegated');
                this.revokeDelegationBtn.disabled = false;
                this.revokeDelegationBtn.textContent = 'Revoke Delegation';
                return;
            }

            // Create EIP-7702 authorization to revoke delegation (set code to 0x)
            const userWallet = new ethers.Wallet(userPrivateKey, provider);
            const nonce = await userWallet.getNonce();
            
            // Create authorization to revoke delegation (delegate to 0x address)
            const authorization = await userWallet.authorize({
                address: '0x0000000000000000000000000000000000000000', // Revoke delegation
                nonce: nonce
            });

            // Create a simple self-transfer transaction with authorizationList
            const txRequest = {
                to: userAddress, // Self-transfer
                value: 0, // No ETH transfer
                data: '0x', // No data
                type: 4, // EIP-7702 transaction type
                authorizationList: [authorization]
            };

            // Send the transaction using relayer (who has ETH for gas)
            const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
            const tx = await relayerWallet.sendTransaction(txRequest);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage('Account delegation revoked', explorerLink);
            
            // Update delegation status
            this.delegationStatus.textContent = 'Not Delegated';
            this.delegationStatus.className = 'contract-status not-deployed';
            
            // Reset button
            this.revokeDelegationBtn.disabled = false;
            this.revokeDelegationBtn.textContent = 'Revoke Delegation';

        } catch (error) {
            console.error('Error revoking delegation:', error);
            this.showErrorMessage(`Failed to revoke delegation: ${error.message}`);
            this.revokeDelegationBtn.disabled = false;
            this.revokeDelegationBtn.textContent = 'Revoke Delegation';
        }
    }

    updateDelegationButtons() {
        const contractAddress = this.delegateContractAddress.textContent.trim();
        const contractStatus = this.delegateContractStatus.textContent;
        
        console.log('updateDelegationButtons called:', {
            contractAddress,
            contractStatus,
            isValidAddress: this.isValidAddress(contractAddress)
        });
        
        // Enable buttons if contract is deployed (regardless of address) or if it's a valid deployed address
        const hasValidContract = contractAddress && 
                                this.isValidAddress(contractAddress) && 
                                (contractStatus === 'Already Deployed' || contractStatus === 'Deployed Successfully');
        
        console.log('hasValidContract:', hasValidContract);
        
        this.delegateAccountBtn.disabled = !hasValidContract;
        this.revokeDelegationBtn.disabled = !hasValidContract;
    }

    isValidAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    async checkDelegateContractStatus() {
        try {
            this.delegateContractStatus.textContent = 'Checking...';
            this.delegateContractStatus.className = 'contract-status checking';

            const contractAddress = this.delegateContractAddress.textContent;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(contractAddress);
            
            if (code === '0x' || code === '0x0') {
                this.delegateContractStatus.textContent = 'Not Deployed';
                this.delegateContractStatus.className = 'contract-status not-deployed';
                this.deployDelegateContractBtn.disabled = false;
            } else {
                this.delegateContractStatus.textContent = 'Already Deployed';
                this.delegateContractStatus.className = 'contract-status deployed';
                this.deployDelegateContractBtn.disabled = true;
                this.deployDelegateContractBtn.textContent = 'Contract Already Deployed';
                this.updateDelegationButtons();
            }
        } catch (error) {
            console.error('Error checking contract status:', error);
            this.delegateContractStatus.textContent = 'Error Checking';
            this.delegateContractStatus.className = 'contract-status not-deployed';
        }
    }

    // Load saved accounts on page load
    loadSavedAccounts() {
        ['relayer', 'user'].forEach(type => {
            const saved = localStorage.getItem(`${type}Account`);
            if (saved) {
                try {
                    const accountData = JSON.parse(saved);
                    this.setAccountData(type, accountData.privateKey, accountData.address, accountData.isDefault || false);
                } catch (error) {
                    console.error(`Error loading saved ${type} account:`, error);
                    localStorage.removeItem(`${type}Account`);
                    this.loadDefaultAccount(type);
                }
            } else {
                // Load default account if no saved account exists
                this.loadDefaultAccount(type);
            }
        });
    }

    loadDefaultAccount(type) {
        const defaultPrivateKey = type === 'relayer' ? this.defaultRelayerPrivateKey : this.defaultUserPrivateKey;
        try {
            const wallet = new ethers.Wallet(defaultPrivateKey);
            const address = wallet.address;
            this.setAccountData(type, defaultPrivateKey, address, true);
        } catch (error) {
            console.error(`Error loading default ${type} account:`, error);
        }
    }

    showSuccessMessage(message, explorerLink = null) {
        if (explorerLink) {
            const messageWithLink = `${message} <a href="${explorerLink}" target="_blank" class="explorer-link" style="color: white; text-decoration: underline; margin-left: 8px;">🔗 View on Explorer</a>`;
            this.showMessage(messageWithLink, 'success');
        } else {
            this.showMessage(message, 'success');
        }
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    async copyToClipboard(text, label = 'Text') {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccessMessage(`${label} copied to clipboard!`);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccessMessage(`${label} copied to clipboard!`);
        }
    }

    showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            line-height: 1.4;
            ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const delegationManager = new DelegationManager();
    delegationManager.initializeBlockchainConfig();
    delegationManager.loadSavedAccounts();
    delegationManager.checkDelegateContractStatus();
});
