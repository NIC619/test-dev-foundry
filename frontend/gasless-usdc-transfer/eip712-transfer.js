class EIP712TransferManager {
    constructor() {
        this.defaultRpcUrl = 'https://testnet-unifi-rpc.puffer.fi/';
        this.defaultExplorerUrl = 'https://testnet-unifi-explorer.puffer.fi/';
        
        // Default private keys
        this.defaultRelayerPrivateKey = '0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8';
        this.defaultUserPrivateKey = '0xdada0c233671b034b77b638fa29b745133853edd3c4dbedf3273e726b7bb6afc';
        
        // Contract addresses
        this.defaultContractAddress = '0x8A4BC9B8e31bc6B144fD1068581dc0FC2A7885e7';
        this.defaultDelegateContractAddress = '0xf6465b4C05C1a3a04E5cBCF623741b087eB965C7';
        
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
        this.defaultContractAddressDisplay = document.getElementById('default-contract-address');
        this.contractStatus = document.getElementById('contract-status');
        this.mintRecipientInput = document.getElementById('mint-recipient');
        this.mintAmountInput = document.getElementById('mint-amount');
        this.mintTokensBtn = document.getElementById('mint-tokens');

        // Transfer elements
        this.transferRecipientInput = document.getElementById('transfer-recipient');
        this.transferAmountInput = document.getElementById('transfer-amount');
        this.transferFeeInput = document.getElementById('transfer-fee');
        this.userTokenBalance = document.getElementById('user-token-balance');
        this.relayerTokenBalance = document.getElementById('relayer-token-balance');

        // Single action button
        this.submitTransferBtn = document.getElementById('submit-transfer');
    }

    bindEvents() {
        // Relayer events
        this.relayerImportBtn.addEventListener('click', async () => await this.importAccount('relayer'));
        this.relayerGenerateBtn.addEventListener('click', async () => await this.generateAccount('relayer'));
        this.relayerResetBtn.addEventListener('click', async () => await this.resetAccount('relayer'));
        this.relayerEditBtn.addEventListener('click', () => this.editAccount('relayer'));

        // User events
        this.userImportBtn.addEventListener('click', async () => await this.importAccount('user'));
        this.userGenerateBtn.addEventListener('click', async () => await this.generateAccount('user'));
        this.userResetBtn.addEventListener('click', async () => await this.resetAccount('user'));
        this.userEditBtn.addEventListener('click', () => this.editAccount('user'));
        
        // Private key copy functionality
        this.userPrivateKeyDisplay.addEventListener('click', () => this.copyToClipboard(this.userPrivateKeyDisplay.textContent, 'Private key'));

        // Enter key support for inputs
        this.relayerPrivateKeyInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') await this.importAccount('relayer');
        });
        this.userPrivateKeyInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') await this.importAccount('user');
        });

        // Blockchain config events
        this.rpcUrlInput.addEventListener('change', () => this.updateRpcUrl());
        this.explorerUrlInput.addEventListener('change', () => this.updateExplorerUrl());
        this.rpcResetBtn.addEventListener('click', () => this.resetRpcUrl());
        this.explorerResetBtn.addEventListener('click', () => this.resetExplorerUrl());

        // Contract events
        this.mintTokensBtn.addEventListener('click', () => this.mintTokens());

        // Form change events to toggle Transfer button
        [this.transferRecipientInput, this.transferAmountInput, this.transferFeeInput].forEach(input => {
            input.addEventListener('input', async () => await this.updateTransferButtonState());
        });

        // Single Transfer action
        this.submitTransferBtn.addEventListener('click', () => this.handleTransfer());
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

    async generateAccount(type) {
        try {
            // Generate a new random private key
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const address = wallet.address;

            // Store the account data
            await this.setAccountData(type, privateKey, address, false);
            
            // Show success message
            this.showSuccessMessage(`${type} account generated successfully!`);
            
        } catch (error) {
            console.error('Error generating account:', error);
            this.showErrorMessage(`Failed to generate ${type} account: ${error.message}`);
        }
    }

    async importAccount(type) {
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
            await this.setAccountData(type, privateKey, address, false);
            
            // Show success message
            this.showSuccessMessage(`${type} account imported successfully!`);
            
        } catch (error) {
            console.error('Error importing account:', error);
            this.showErrorMessage(`Failed to import ${type} account: ${error.message}`);
        }
    }

    async setAccountData(type, privateKey, address, isDefault = false) {
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

        // Update button state when accounts change
        await this.updateTransferButtonState();
    }

    async resetAccount(type) {
        // Remove from localStorage and load default account
        localStorage.removeItem(`${type}Account`);
        await this.loadDefaultAccount(type);
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

    isValidAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    async mintTokens() {
        try {
            this.mintTokensBtn.disabled = true;
            this.mintTokensBtn.textContent = 'Minting...';

            const recipient = this.mintRecipientInput.value.trim();
            const amount = this.mintAmountInput.value.trim();

            if (!recipient) {
                this.showErrorMessage('Please enter recipient address');
                return;
            }

            if (!amount || amount === '0') {
                this.showErrorMessage('Please enter amount to mint');
                return;
            }

            if (!this.isValidAddress(recipient)) {
                this.showErrorMessage('Invalid recipient address');
                return;
            }

            // Get the relayer account data
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }

            const accountData = JSON.parse(relayerData);
            const wallet = new ethers.Wallet(accountData.privateKey);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Get contract instance
            const contractAddress = this.defaultContractAddressDisplay.textContent.trim();
            const contract = new ethers.Contract(
                contractAddress,
                [
                    "function mint(address to, uint256 amount) public",
                    "function balanceOf(address account) public view returns (uint256)"
                ],
                connectedWallet
            );

            // Convert amount to wei (assuming 18 decimals)
            const amountWei = ethers.parseUnits(amount, 18);

            // Mint tokens
            const tx = await contract.mint(recipient, amountWei);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage(`Minted ${amount} tokens to ${recipient}`, explorerLink);

            // Update balances after minting
            this.updateBalances();

        } catch (error) {
            console.error('Error minting tokens:', error);
            this.showErrorMessage(`Failed to mint tokens: ${error.message}`);
        } finally {
            this.mintTokensBtn.disabled = false;
            this.mintTokensBtn.textContent = 'Mint Tokens';
        }
    }

    async checkUserDelegation() {
        try {
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                return false;
            }

            const userAccountData = JSON.parse(userData);
            const userAddress = userAccountData.address;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);

            // Check if user account is delegated
            const userCode = await provider.getCode(userAddress);
            const isDelegated = userCode !== '0x' && userCode.startsWith('0xef0100');
            
            return isDelegated;
        } catch (error) {
            console.error('Error checking user delegation:', error);
            return false;
        }
    }

    async updateTransferButtonState() {
        try {
            const recipient = this.transferRecipientInput.value.trim();
            const amountInput = this.transferAmountInput.value.trim();
            const isFormComplete = this.isValidAddress(recipient) && amountInput && amountInput !== '0';
            this.submitTransferBtn.disabled = !isFormComplete;
        } catch (_) {
            this.submitTransferBtn.disabled = true;
        }
    }

    async buildTypedData() {
        const userData = localStorage.getItem('userAccount');
        if (!userData) {
            throw new Error('User account not found');
        }

        const userAccountData = JSON.parse(userData);
        const userAddress = userAccountData.address;

        const recipient = this.transferRecipientInput.value.trim();
        const amountInput = this.transferAmountInput.value.trim();
        const feeInput = this.transferFeeInput.value.trim();
        const amount = amountInput ? ethers.parseUnits(amountInput, 18) : 0n;
        const fee = feeInput ? ethers.parseUnits(feeInput, 18) : 0n;

        const contractAddress = this.defaultContractAddressDisplay.textContent.trim();

        const calls = [];
        if (amount && recipient) {
            const transferData = this.encodeTransferData(recipient, amount);
            calls.push({ to: contractAddress, value: "0", data: transferData });
        }
        if (fee && fee !== 0n) {
            const feeData = this.encodeTransferData(this.getRelayerAddress(), fee);
            calls.push({ to: contractAddress, value: "0", data: feeData });
        }

        const expiryTime = 3600; // seconds
        const expiry = Math.floor(Date.now() / 1000) + expiryTime;

        const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
        const chainId = await provider.getNetwork().then(network => Number(network.chainId));

        const domain = {
            name: 'SimpleDelegateContract',
            version: '1',
            chainId: chainId,
            // verifyingContract: userAddress
            verifyingContract: '0xf6465b4C05C1a3a04E5cBCF623741b087eB965C7'
        };

        const types = {
            Call: [
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'data', type: 'bytes' }
            ],
            ExecuteWithSigMessage: [
                { name: 'userAccountAddress', type: 'address' },
                { name: 'expiry', type: 'uint256' },
                { name: 'calls', type: 'Call[]' }
            ]
        };

        const message = {
            userAccountAddress: userAddress,
            expiry: expiry.toString(),
            calls: calls
        };

        return { domain, types, message };
    }

    encodeTransferData(to, amount) {
        // ERC20 transfer function selector: transfer(address,uint256)
        const transferSelector = '0xa9059cbb';
        const toPadded = to.slice(2).padStart(64, '0');
        const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount);
        const amountPadded = amountBigInt.toString(16).padStart(64, '0');
        return transferSelector + toPadded + amountPadded;
    }

    getRelayerAddress() {
        const relayerData = localStorage.getItem('relayerAccount');
        if (!relayerData) return '';
        const accountData = JSON.parse(relayerData);
        return accountData.address;
    }

    async handleTransfer() {
        try {
            this.submitTransferBtn.disabled = true;
            this.submitTransferBtn.textContent = 'Transferring...';

            // Ensure delegation
            const isDelegated = await this.checkUserDelegation();
            if (!isDelegated) {
                this.showErrorMessage('User account is not delegated to SimpleDelegateContract. Please delegate the account first.');
                return;
            }

            // Build typed data
            const typedData = await this.buildTypedData();

            // User signs
            const userData = localStorage.getItem('userAccount');
            const { privateKey: userPrivateKey, address: userAddress } = JSON.parse(userData);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const userWallet = new ethers.Wallet(userPrivateKey, provider);
            const signature = await userWallet.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message
            );
            const sig = ethers.Signature.from(signature);

            // Relayer executes
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }
            const { privateKey: relayerPrivateKey } = JSON.parse(relayerData);

            const relayerSigner = new ethers.Wallet(relayerPrivateKey, provider);
            const contract = new ethers.Contract(
                userAddress, // User's account address (delegated to SimpleDelegateContract)
                [
                    "function executeWithSig((address userAccountAddress,uint256 expiry,(bytes data,address to,uint256 value)[] calls) message,uint8 v,bytes32 r,bytes32 s) payable"
                ],
                relayerSigner
            );

            const tx = await contract.executeWithSig(
                typedData.message,
                sig.v,
                sig.r,
                sig.s
            );
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage('Transfer executed successfully!', explorerLink);
            this.updateBalances();

        } catch (error) {
            console.error('Error executing transfer:', error);
            this.showErrorMessage(`Failed to execute transfer: ${error.message}`);
        } finally {
            this.submitTransferBtn.disabled = false;
            this.submitTransferBtn.textContent = 'Transfer';
        }
    }

    async verifySignature() {
        try {
            this.verifySignatureBtn.disabled = true;
            this.verifySignatureBtn.textContent = 'Verifying...';

            const signature = this.signatureOutput.value.trim();
            if (!signature) {
                this.showErrorMessage('No signature to verify');
                return;
            }

            // Get the typed data from preview
            const typedData = JSON.parse(this.eip712Preview.value);

            // Parse signature
            const sig = ethers.Signature.from(signature);

            // Get user account address (the delegated account)
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.showErrorMessage('User account not found');
                return;
            }

            const userAccountData = JSON.parse(userData);
            const userAddress = userAccountData.address;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            
            const contract = new ethers.Contract(
                userAddress, // User's account address (delegated to SimpleDelegateContract)
                [
                    "function verifySignature((address userAccountAddress,uint256 expiry,(bytes data,address to,uint256 value)[] calls) message,uint8 v,bytes32 r,bytes32 s) view returns (address signer,bool isValid)"
                ],
                provider
            );

            // Call verifySignature
            const result = await contract.verifySignature(
                typedData.message,
                sig.v,
                sig.r,
                sig.s
            );

            const [signer, isValid] = result;

            if (isValid) {
                this.verificationResult.innerHTML = `
                    <div class="verification-success">
                        ✅ Signature is valid!<br>
                        Signer: ${signer}<br>
                        Ready to execute transfer.
                    </div>
                `;
                this.showSuccessMessage('Signature verification successful!');
            } else {
                this.verificationResult.innerHTML = `
                    <div class="verification-error">
                        ❌ Signature is invalid!<br>
                        Signer: ${signer}<br>
                        Expected: ${typedData.message.userAccountAddress}
                    </div>
                `;
                this.showErrorMessage('Signature verification failed!');
            }

        } catch (error) {
            console.error('Error verifying signature:', error);
            this.verificationResult.innerHTML = `
                <div class="verification-error">
                    ❌ Verification error: ${error.message}
                </div>
            `;
            this.showErrorMessage(`Failed to verify signature: ${error.message}`);
        } finally {
            this.verifySignatureBtn.disabled = false;
            this.verifySignatureBtn.textContent = 'Verify Signature';
        }
    }

    async executeTransfer() {
        try {
            this.executeTransferBtn.disabled = true;
            this.executeTransferBtn.textContent = 'Executing...';

            // Check if user account is delegated
            const isDelegated = await this.checkUserDelegation();
            if (!isDelegated) {
                this.showErrorMessage('User account is not delegated to SimpleDelegateContract. Please delegate the account first.');
                return;
            }

            const signature = this.signatureOutput.value.trim();
            if (!signature) {
                this.showErrorMessage('No signature to execute');
                return;
            }

            // Get the typed data from preview
            const typedData = JSON.parse(this.eip712Preview.value);

            // Parse signature
            const sig = ethers.Signature.from(signature);

            // Get relayer account
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }

            const relayerAccountData = JSON.parse(relayerData);
            const relayerPrivateKey = relayerAccountData.privateKey;

            // Get user account address (the delegated account)
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.showErrorMessage('User account not found');
                return;
            }

            const userAccountData = JSON.parse(userData);
            const userAddress = userAccountData.address;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const userSigner = new ethers.Wallet(relayerPrivateKey, provider);
            
            const contract = new ethers.Contract(
                userAddress, // User's account address (delegated to SimpleDelegateContract)
                [
                    "function executeWithSig((address userAccountAddress,uint256 expiry,(bytes data,address to,uint256 value)[] calls) message,uint8 v,bytes32 r,bytes32 s) payable"
                ],
                userSigner
            );

            // Execute the transfer
            const tx = await contract.executeWithSig(
                typedData.message,
                sig.v,
                sig.r,
                sig.s
            );

            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage('Transfer executed successfully!', explorerLink);

            // Update balances after transfer
            this.updateBalances();

        } catch (error) {
            console.error('Error executing transfer:', error);
            this.showErrorMessage(`Failed to execute transfer: ${error.message}`);
        } finally {
            this.executeTransferBtn.disabled = false;
            this.executeTransferBtn.textContent = 'Execute Transfer';
        }
    }

    async updateBalances() {
        try {
            const contractAddress = this.defaultContractAddressDisplay.textContent.trim();
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            
            const contract = new ethers.Contract(
                contractAddress,
                [
                    "function balanceOf(address account) public view returns (uint256)"
                ],
                provider
            );

            const userData = localStorage.getItem('userAccount');
            const relayerData = localStorage.getItem('relayerAccount');

            if (userData) {
                const userAccountData = JSON.parse(userData);
                const userBalance = await contract.balanceOf(userAccountData.address);
                this.userTokenBalance.textContent = `Tokens (User): ${this.formatTokenAmount(userBalance)}`;
            }

            if (relayerData) {
                const relayerAccountData = JSON.parse(relayerData);
                const relayerBalance = await contract.balanceOf(relayerAccountData.address);
                this.relayerTokenBalance.textContent = `Tokens (Relayer): ${this.formatTokenAmount(relayerBalance)}`;
            }

        } catch (error) {
            console.error('Error updating balances:', error);
            this.userTokenBalance.textContent = 'Tokens (User): Error loading';
            this.relayerTokenBalance.textContent = 'Tokens (Relayer): Error loading';
        }
    }

    formatTokenAmount(amount) {
        try {
            const full = ethers.formatUnits(amount, 18);
            if (!full.includes('.')) return full;
            const [intPart, fracPart] = full.split('.');
            const sliced = fracPart.slice(0, 2);
            const trimmed = sliced.replace(/0+$/, '');
            return trimmed ? `${intPart}.${trimmed}` : intPart;
        } catch (_) {
            return String(amount);
        }
    }

    async checkContractStatus() {
        try {
            this.contractStatus.textContent = 'Checking...';
            this.contractStatus.className = 'contract-status checking';

            const contractAddress = this.defaultContractAddressDisplay.textContent;
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(contractAddress);
            
            if (code === '0x' || code === '0x0') {
                this.contractStatus.textContent = 'Not Deployed';
                this.contractStatus.className = 'contract-status not-deployed';
                this.mintTokensBtn.disabled = true;
            } else {
                this.contractStatus.textContent = 'Already Deployed';
                this.contractStatus.className = 'contract-status deployed';
                this.mintTokensBtn.disabled = false;
                this.updateBalances();
            }
        } catch (error) {
            console.error('Error checking contract status:', error);
            this.contractStatus.textContent = 'Error Checking';
            this.contractStatus.className = 'contract-status not-deployed';
            this.mintTokensBtn.disabled = true;
        }
    }

    // Load saved accounts on page load
    async loadSavedAccounts() {
        const types = ['relayer', 'user'];
        for (const type of types) {
            const saved = localStorage.getItem(`${type}Account`);
            if (saved) {
                try {
                    const accountData = JSON.parse(saved);
                    await this.setAccountData(type, accountData.privateKey, accountData.address, accountData.isDefault || false);
                } catch (error) {
                    console.error(`Error loading saved ${type} account:`, error);
                    localStorage.removeItem(`${type}Account`);
                    await this.loadDefaultAccount(type);
                }
            } else {
                // Load default account if no saved account exists
                await this.loadDefaultAccount(type);
            }
        }
    }

    async loadDefaultAccount(type) {
        const defaultPrivateKey = type === 'relayer' ? this.defaultRelayerPrivateKey : this.defaultUserPrivateKey;
        try {
            const wallet = new ethers.Wallet(defaultPrivateKey);
            const address = wallet.address;
            await this.setAccountData(type, defaultPrivateKey, address, true);
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
document.addEventListener('DOMContentLoaded', async () => {
    const eip712TransferManager = new EIP712TransferManager();
    eip712TransferManager.initializeBlockchainConfig();
    await eip712TransferManager.loadSavedAccounts();
    eip712TransferManager.checkContractStatus();
});
