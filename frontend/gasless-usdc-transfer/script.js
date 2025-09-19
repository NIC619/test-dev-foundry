// Check if ethers is available
if (typeof ethers === 'undefined') {
    console.error('Ethers.js library not loaded. Please check your internet connection.');
    alert('Ethers.js library not loaded. Please check your internet connection and refresh the page.');
}

class AccountManager {
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

        // Contract deployment elements
        this.defaultContractAddress = document.getElementById('default-contract-address');
        this.contractStatus = document.getElementById('contract-status');
        this.tokenNameInput = document.getElementById('token-name');
        this.tokenSymbolInput = document.getElementById('token-symbol');
        this.tokenDecimalsInput = document.getElementById('token-decimals');
        this.deployContractBtn = document.getElementById('deploy-contract');

        // SimpleDelegateContract deployment elements
        this.delegateContractAddress = document.getElementById('delegate-contract-address');
        this.delegateContractStatus = document.getElementById('delegate-contract-status');
        this.deployDelegateContractBtn = document.getElementById('deploy-delegate-contract');

        // Contract interaction elements
        this.mintRecipientInput = document.getElementById('mint-recipient');
        this.mintAmountInput = document.getElementById('mint-amount');
        this.mintTokensBtn = document.getElementById('mint-tokens');
        this.transferRecipientInput = document.getElementById('transfer-recipient');
        this.transferAmountInput = document.getElementById('transfer-amount');
        this.transferFeeInput = document.getElementById('transfer-fee');
        this.transferTokensBtn = document.getElementById('transfer-tokens');

        // Balance display elements
        this.relayerEthBalance = document.getElementById('relayer-eth-balance');
        this.relayerTokenBalance = document.getElementById('relayer-token-balance');
        this.userTokenBalance = document.getElementById('user-token-balance');
        this.userEthBalance = document.getElementById('user-eth-balance');
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
        this.rpcUrlInput.addEventListener('input', () => this.updateRpcUrl());
        this.explorerUrlInput.addEventListener('input', () => this.updateExplorerUrl());
        this.rpcResetBtn.addEventListener('click', () => this.resetRpcUrl());
        this.explorerResetBtn.addEventListener('click', () => this.resetExplorerUrl());

        // Contract deployment events
        this.deployContractBtn.addEventListener('click', () => this.deployContract());
        this.tokenNameInput.addEventListener('input', () => this.updateDeployButton());
        this.tokenSymbolInput.addEventListener('input', () => this.updateDeployButton());

        // SimpleDelegateContract deployment events
        this.deployDelegateContractBtn.addEventListener('click', () => this.deployDelegateContract());

        // Contract interaction events
        this.mintTokensBtn.addEventListener('click', () => this.mintTokens());
        this.transferTokensBtn.addEventListener('click', () => this.transferTokens());
        this.mintRecipientInput.addEventListener('input', () => this.updateMintButton());
        this.mintAmountInput.addEventListener('input', () => this.updateMintButton());
        this.transferRecipientInput.addEventListener('input', () => this.updateTransferButton());
        this.transferAmountInput.addEventListener('input', () => this.updateTransferButton());
        this.transferFeeInput.addEventListener('input', () => this.updateTransferButton());
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

        // Initialize contract deployment
        this.initializeContractDeployment();
    }

    updateRpcUrl() {
        const newUrl = this.rpcUrlInput.value.trim();
        if (newUrl && this.isValidUrl(newUrl)) {
            this.currentRpcUrl = newUrl;
            this.rpcUrlValue.textContent = newUrl;
            localStorage.setItem('rpcUrl', newUrl);
            this.showSuccessMessage('RPC URL updated successfully!');
            
            // Update balances when RPC URL changes
            this.updateAllBalances();
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

    // Contract deployment methods
    initializeContractDeployment() {
        this.defaultContractAddressValue = '0xa3D0F0f7b380A48fAF30B0e1670966955411CE3E';
        this.contractABI = [{"inputs":[{"name":"name_","type":"string","internalType":"string"},{"name":"symbol_","type":"string","internalType":"string"},{"name":"decimals_","type":"uint8","internalType":"uint8"}],"stateMutability":"nonpayable","type":"constructor"},{"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"approve","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"burn","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"burnFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},{"type":"function","name":"mint","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"mintBatch","inputs":[{"name":"recipients","type":"address[]","internalType":"address[]"},{"name":"amounts","type":"uint256[]","internalType":"uint256[]"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"spender","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"ERC20InsufficientAllowance","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"allowance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC20InsufficientBalance","inputs":[{"name":"sender","type":"address","internalType":"address"},{"name":"balance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC20InvalidApprover","inputs":[{"name":"approver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidReceiver","inputs":[{"name":"receiver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidSpender","inputs":[{"name":"spender","type":"address","internalType":"address"}]}];
        this.contractBytecode = "0x60a060405234801561000f575f5ffd5b50604051611820380380611820833981810160405281019061003191906101ee565b828281600390816100429190610486565b5080600490816100529190610486565b5050508060ff1660808160ff1681525050505050610555565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6100ca82610084565b810181811067ffffffffffffffff821117156100e9576100e8610094565b5b80604052505050565b5f6100fb61006b565b905061010782826100c1565b919050565b5f67ffffffffffffffff82111561012657610125610094565b5b61012f82610084565b9050602081019050919050565b8281835e5f83830152505050565b5f61015c6101578461010c565b6100f2565b90508281526020810184848401111561017857610177610080565b5b61018384828561013c565b509392505050565b5f82601f83011261019f5761019e61007c565b5b81516101af84826020860161014a565b91505092915050565b5f60ff82169050919050565b6101cd816101b8565b81146101d7575f5ffd5b50565b5f815190506101e8816101c4565b92915050565b5f5f5f6060848603121561020557610204610074565b5b5f84015167ffffffffffffffff81111561022257610221610078565b5b61022e8682870161018b565b935050602084015167ffffffffffffffff81111561024f5761024e610078565b5b61025b8682870161018b565b925050604061026c868287016101da565b9150509250925092565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806102c457607f821691505b6020821081036102d7576102d6610280565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026103397fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826102fe565b61034386836102fe565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f61038761038261037d8461035b565b610364565b61035b565b9050919050565b5f819050919050565b6103a08361036d565b6103b46103ac8261038e565b84845461030a565b825550505050565b5f5f905090565b6103cb6103bc565b6103d6818484610397565b505050565b5b818110156103f9576103ee5f826103c3565b6001810190506103dc565b5050565b601f82111561043e5761040f816102dd565b610418846102ef565b81016020851015610427578190505b61043b610433856102ef565b8301826103db565b50505b505050565b5f82821c905092915050565b5f61045e5f1984600802610443565b1980831691505092915050565b5f610476838361044f565b9150826002028217905092915050565b61048f82610276565b67ffffffffffffffff8111156104a8576104a7610094565b5b6104b282546102ad565b6104bd8282856103fd565b5f60209050601f8311600181146104ee575f84156104dc578287015190505b6104e6858261046b565b86555061054d565b601f1984166104fc866102dd565b5f5b82811015610523578489015182556001820191506020850194506020810190506104fe565b86831015610540578489015161053c601f89168261044f565b8355505b6001600288020188555050505b505050505050565b6080516112b361056d5f395f61039501526112b35ff3fe608060405234801561000f575f5ffd5b50600436106100cd575f3560e01c806342966c681161008a5780637c88e3d9116100645780637c88e3d91461020f57806395d89b411461022b578063a9059cbb14610249578063dd62ed3e14610279576100cd565b806342966c68146101a757806370a08231146101c357806379cc6790146101f3576100cd565b806306fdde03146100d1578063095ea7b3146100ef57806318160ddd1461011f57806323b872dd1461013d578063313ce5671461016d57806340c10f191461018b575b5f5ffd5b6100d96102a9565b6040516100e69190610d0e565b60405180910390f35b61010960048036038101906101049190610dc3565b610339565b6040516101169190610e1b565b60405180910390f35b61012761035b565b6040516101349190610e43565b60405180910390f35b61015760048036038101906101529190610e5c565b610364565b6040516101649190610e1b565b60405180910390f35b610175610392565b6040516101829190610ec7565b60405180910390f35b6101a560048036038101906101a09190610dc3565b6103b9565b005b6101c160048036038101906101bc9190610ee0565b6103c7565b005b6101dd60048036038101906101d89190610f0b565b6103d4565b6040516101ea9190610e43565b60405180910390f35b61020d60048036038101906102089190610dc3565b610419565b005b61022960048036038101906102249190610fec565b610432565b005b6102336104e8565b6040516102409190610d0e565b60405180910390f35b610263600480360381019061025e9190610dc3565b610578565b6040516102709190610e1b565b60405180910390f35b610293600480360381019061028e919061106a565b61059a565b6040516102a09190610e43565b60405180910390f35b6060600380546102b8906110d5565b80601f01602080910402602001604051908101604052809291908181526020018280546102e4906110d5565b801561032f5780601f106103065761010080835404028352916020019161032f565b820191905f5260205f20905b81548152906001019060200180831161031257829003601f168201915b5050505050905090565b5f5f61034361061c565b9050610350818585610623565b600191505092915050565b5f600254905090565b5f5f61036e61061c565b905061037b858285610635565b6103868585856106c8565b60019150509392505050565b5f7f0000000000000000000000000000000000000000000000000000000000000000905090565b6103c382826107b8565b5050565b6103d13382610837565b50565b5f5f5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b610424823383610635565b61042e8282610837565b5050565b81819050848490501461047a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161047190611175565b60405180910390fd5b5f5f90505b848490508110156104e1576104d48585838181106104a05761049f611193565b5b90506020020160208101906104b59190610f0b565b8484848181106104c8576104c7611193565b5b905060200201356107b8565b808060010191505061047f565b5050505050565b6060600480546104f7906110d5565b80601f0160208091040260200160405190810160405280929190818152602001828054610523906110d5565b801561056e5780601f106105455761010080835404028352916020019161056e565b820191905f5260205f20905b81548152906001019060200180831161055157829003601f168201915b5050505050905090565b5f5f61058261061c565b905061058f8185856106c8565b600191505092915050565b5f60015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905092915050565b5f33905090565b61063083838360016108b6565b505050565b5f610640848461059a565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8110156106c257818110156106b3578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016106aa939291906111cf565b60405180910390fd5b6106c184848484035f6108b6565b5b50505050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610738575f6040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161072f9190611204565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107a8575f6040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161079f9190611204565b60405180910390fd5b6107b3838383610a85565b505050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610828575f6040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161081f9190611204565b60405180910390fd5b6108335f8383610a85565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036108a7575f6040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161089e9190611204565b60405180910390fd5b6108b2825f83610a85565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603610926575f6040517fe602df0500000000000000000000000000000000000000000000000000000000815260040161091d9190611204565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610996575f6040517f94280d6200000000000000000000000000000000000000000000000000000000815260040161098d9190611204565b60405180910390fd5b8160015f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508015610a7f578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610a769190610e43565b60405180910390a35b50505050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610ad5578060025f828254610ac9919061124a565b92505081905550610ba3565b5f5f5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081811015610b5e578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401610b55939291906111cf565b60405180910390fd5b8181035f5f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610bea578060025f8282540392505081905550610c34565b805f5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610c919190610e43565b60405180910390a3505050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f610ce082610c9e565b610cea8185610ca8565b9350610cfa818560208601610cb8565b610d0381610cc6565b840191505092915050565b5f6020820190508181035f830152610d268184610cd6565b905092915050565b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610d5f82610d36565b9050919050565b610d6f81610d55565b8114610d79575f5ffd5b50565b5f81359050610d8a81610d66565b92915050565b5f819050919050565b610da281610d90565b8114610dac575f5ffd5b50565b5f81359050610dbd81610d99565b92915050565b5f5f60408385031215610dd957610dd8610d2e565b5b5f610de685828601610d7c565b9250506020610df785828601610daf565b9150509250929050565b5f8115159050919050565b610e1581610e01565b82525050565b5f602082019050610e2e5f830184610e0c565b92915050565b610e3d81610d90565b82525050565b5f602082019050610e565f830184610e34565b92915050565b5f5f5f60608486031215610e7357610e72610d2e565b5b5f610e8086828701610d7c565b9350506020610e9186828701610d7c565b9250506040610ea286828701610daf565b9150509250925092565b5f60ff82169050919050565b610ec181610eac565b82525050565b5f602082019050610eda5f830184610eb8565b92915050565b5f60208284031215610ef557610ef4610d2e565b5b5f610f0284828501610daf565b91505092915050565b5f60208284031215610f2057610f1f610d2e565b5b5f610f2d84828501610d7c565b91505092915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f840112610f5757610f56610f36565b5b8235905067ffffffffffffffff811115610f7457610f73610f3a565b5b602083019150836020820283011115610f9057610f8f610f3e565b5b9250929050565b5f5f83601f840112610fac57610fab610f36565b5b8235905067ffffffffffffffff811115610fc957610fc8610f3a565b5b602083019150836020820283011115610fe557610fe4610f3e565b5b9250929050565b5f5f5f5f6040858703121561100457611003610d2e565b5b5f85013567ffffffffffffffff81111561102157611020610d32565b5b61102d87828801610f42565b9450945050602085013567ffffffffffffffff8111156110505761104f610d32565b5b61105c87828801610f97565b925092505092959194509250565b5f5f604083850312156110805761107f610d2e565b5b5f61108d85828601610d7c565b925050602061109e85828601610d7c565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806110ec57607f821691505b6020821081036110ff576110fe6110a8565b5b50919050565b7f45524332304d696e7461626c653a20617272617973206c656e677468206d69735f8201527f6d61746368000000000000000000000000000000000000000000000000000000602082015250565b5f61115f602583610ca8565b915061116a82611105565b604082019050919050565b5f6020820190508181035f83015261118c81611153565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b6111c981610d55565b82525050565b5f6060820190506111e25f8301866111c0565b6111ef6020830185610e34565b6111fc6040830184610e34565b949350505050565b5f6020820190506112175f8301846111c0565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61125482610d90565b915061125f83610d90565b92508282019050808211156112775761127661121d565b5b9291505056fea2646970667358221220137ed3faabd9d33177cd03606e48d6fd5dbd0a1d0b4a8def0eb82e85ac9c8faf64736f6c634300081c0033";
        
        this.checkContractStatus();
        
        // Initialize SimpleDelegateContract deployment
        this.initializeSimpleDelegateContract();
    }

    initializeSimpleDelegateContract() {
        this.defaultDelegateContractAddressValue = '0x8052A771FbeDa789Fb0384040773E6F0b734f244';
        this.delegateContractABI = [{"type":"receive","stateMutability":"payable"},{"type":"function","name":"execute","inputs":[{"name":"calls","type":"tuple[]","internalType":"struct SimpleDelegateContract.Call[]","components":[{"name":"data","type":"bytes","internalType":"bytes"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}]}],"outputs":[],"stateMutability":"payable"},{"type":"event","name":"Executed","inputs":[{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"},{"name":"data","type":"bytes","indexed":false,"internalType":"bytes"}],"anonymous":false}];
        this.delegateContractBytecode = "0x6080604052348015600e575f5ffd5b506106e88061001c5f395ff3fe608060405260043610610021575f3560e01c8063a6d0ad611461002c57610028565b3661002857005b5f5ffd5b610046600480360381019061004191906104df565b610048565b005b5f5f90505b815181101561019a575f82828151811061006a57610069610526565b5b602002602001015190505f5f826020015173ffffffffffffffffffffffffffffffffffffffff168360400151845f01516040516100a791906105a5565b5f6040518083038185875af1925050503d805f81146100e1576040519150601f19603f3d011682016040523d82523d5f602084013e6100e6565b606091505b509150915081819061012e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610125919061060d565b60405180910390fd5b50826020015173ffffffffffffffffffffffffffffffffffffffff167fcaf938de11c367272220bfd1d2baa99ca46665e7bc4d85f00adb51b90fe1fa9f8460400151855f0151604051610182929190610684565b60405180910390a2505050808060010191505061004d565b5050565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6101f9826101b3565b810181811067ffffffffffffffff82111715610218576102176101c3565b5b80604052505050565b5f61022a61019e565b905061023682826101f0565b919050565b5f67ffffffffffffffff821115610255576102546101c3565b5b602082029050602081019050919050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f67ffffffffffffffff8211156102905761028f6101c3565b5b610299826101b3565b9050602081019050919050565b828183375f83830152505050565b5f6102c66102c184610276565b610221565b9050828152602081018484840111156102e2576102e1610272565b5b6102ed8482856102a6565b509392505050565b5f82601f830112610309576103086101af565b5b81356103198482602086016102b4565b91505092915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61034b82610322565b9050919050565b61035b81610341565b8114610365575f5ffd5b50565b5f8135905061037681610352565b92915050565b5f819050919050565b61038e8161037c565b8114610398575f5ffd5b50565b5f813590506103a981610385565b92915050565b5f606082840312156103c4576103c361026a565b5b6103ce6060610221565b90505f82013567ffffffffffffffff8111156103ed576103ec61026e565b5b6103f9848285016102f5565b5f83015250602061040c84828501610368565b60208301525060406104208482850161039b565b60408301525092915050565b5f61043e6104398461023b565b610221565b9050808382526020820190506020840283018581111561046157610460610266565b5b835b818110156104a857803567ffffffffffffffff811115610486576104856101af565b5b80860161049389826103af565b85526020850194505050602081019050610463565b5050509392505050565b5f82601f8301126104c6576104c56101af565b5b81356104d684826020860161042c565b91505092915050565b5f602082840312156104f4576104f36101a7565b5b5f82013567ffffffffffffffff811115610511576105106101ab565b5b61051d848285016104b2565b91505092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b5f81519050919050565b5f81905092915050565b8281835e5f83830152505050565b5f61057f82610553565b610589818561055d565b9350610599818560208601610567565b80840191505092915050565b5f6105b08284610575565b915081905092915050565b5f81519050919050565b5f82825260208201905092915050565b5f6105df826105bb565b6105e981856105c5565b93506105f9818560208601610567565b610602816101b3565b840191505092915050565b5f6020820190508181035f83015261062581846105d5565b905092915050565b6106368161037c565b82525050565b5f82825260208201905092915050565b5f61065682610553565b610660818561063c565b9350610670818560208601610567565b610679816101b3565b840191505092915050565b5f6040820190506106975f83018561062d565b81810360208301526106a9818461064c565b9050939250505056fea26469706673582212209891191ad2632d0fdbd91509323d9f5c69e7a940209e5e9b504cd88e382398c464736f6c634300081c0033";
        
        this.checkDelegateContractStatus();
    }

    async checkContractStatus() {
        try {
            this.contractStatus.textContent = 'Checking...';
            this.contractStatus.className = 'contract-status checking';

            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(this.defaultContractAddressValue);
            
            if (code === '0x' || code === '0x0') {
                this.contractStatus.textContent = 'Not Deployed';
                this.contractStatus.className = 'contract-status not-deployed';
            } else {
                this.contractStatus.textContent = 'Already Deployed';
                this.contractStatus.className = 'contract-status deployed';
                this.deployContractBtn.disabled = true;
                this.deployContractBtn.textContent = 'Contract Already Deployed';
            }

            // Update interaction buttons
            this.updateMintButton();
            this.updateTransferButton();
            
            // Update token balance when contract status changes
            this.updateUserTokenBalance();
            this.updateRelayerTokenBalance();
            this.updateUserEthBalance();
        } catch (error) {
            console.error('Error checking contract status:', error);
            this.contractStatus.textContent = 'Error Checking';
            this.contractStatus.className = 'contract-status not-deployed';
        }
    }

    async checkDelegateContractStatus() {
        try {
            this.delegateContractStatus.textContent = 'Checking...';
            this.delegateContractStatus.className = 'contract-status checking';

            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(this.defaultDelegateContractAddressValue);
            
            if (code === '0x' || code === '0x0') {
                this.delegateContractStatus.textContent = 'Not Deployed';
                this.delegateContractStatus.className = 'contract-status not-deployed';
            } else {
                this.delegateContractStatus.textContent = 'Already Deployed';
                this.delegateContractStatus.className = 'contract-status deployed';
                this.deployDelegateContractBtn.disabled = true;
                this.deployDelegateContractBtn.textContent = 'Contract Already Deployed';
            }

            // Update transfer button when delegate contract status changes
            this.updateTransferButton();
        } catch (error) {
            console.error('Error checking delegate contract status:', error);
            this.delegateContractStatus.textContent = 'Error Checking';
            this.delegateContractStatus.className = 'contract-status not-deployed';
        }
    }

    updateDeployButton() {
        const hasRelayerAccount = localStorage.getItem('relayerAccount') !== null;
        const hasName = this.tokenNameInput.value.trim() !== '';
        const hasSymbol = this.tokenSymbolInput.value.trim() !== '';
        const isDeployed = this.contractStatus.textContent === 'Already Deployed';
        
        this.deployContractBtn.disabled = !hasRelayerAccount || !hasName || !hasSymbol || isDeployed;
    }

    updateDelegateDeployButton() {
        const hasRelayerAccount = localStorage.getItem('relayerAccount') !== null;
        const isDeployed = this.delegateContractStatus.textContent === 'Already Deployed';
        
        this.deployDelegateContractBtn.disabled = !hasRelayerAccount || isDeployed;
    }

    async deployContract() {
        try {
            const tokenName = this.tokenNameInput.value.trim();
            const tokenSymbol = this.tokenSymbolInput.value.trim();
            const tokenDecimals = parseInt(this.tokenDecimalsInput.value) || 18;

            // Get the relayer account data
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }

            const { privateKey } = JSON.parse(relayerData);
            const wallet = new ethers.Wallet(privateKey);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Create contract factory
            const contractFactory = new ethers.ContractFactory(
                this.contractABI,
                this.contractBytecode,
                connectedWallet
            );

            this.deployContractBtn.disabled = true;
            this.deployContractBtn.textContent = 'Deploying...';
            this.contractStatus.textContent = 'Deploying...';
            this.contractStatus.className = 'contract-status checking';

            // Deploy the contract
            const contract = await contractFactory.deploy(tokenName, tokenSymbol, tokenDecimals);
            
            // Wait for deployment
            await contract.waitForDeployment();

            const explorerLink = `${this.currentExplorerUrl}/tx/${contract.deploymentTransaction().hash}`;
            this.showSuccessMessage(`Contract deployed successfully at ${await contract.getAddress()}`, explorerLink);
            this.contractStatus.textContent = 'Deployed Successfully';
            this.contractStatus.className = 'contract-status deployed';
            this.deployContractBtn.textContent = 'Contract Deployed';
            
            // Update the default address display
            this.defaultContractAddress.textContent = await contract.getAddress();
            
            // Store the deployed address
            localStorage.setItem('deployedContractAddress', await contract.getAddress());

            // Update interaction buttons
            this.updateMintButton();
            this.updateTransferButton();

        } catch (error) {
            console.error('Error deploying contract:', error);
            this.showErrorMessage(`Failed to deploy contract: ${error.message}`);
            this.deployContractBtn.disabled = false;
            this.deployContractBtn.textContent = 'Deploy Contract';
            this.contractStatus.textContent = 'Deployment Failed';
            this.contractStatus.className = 'contract-status not-deployed';
        }
    }

    async deployDelegateContract() {
        try {
            // Get the relayer account data
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }

            const { privateKey } = JSON.parse(relayerData);
            const wallet = new ethers.Wallet(privateKey);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            this.deployDelegateContractBtn.disabled = true;
            this.deployDelegateContractBtn.textContent = 'Deploying...';
            this.delegateContractStatus.textContent = 'Deploying...';
            this.delegateContractStatus.className = 'contract-status checking';

            // Deploy the contract
            const contractFactory = new ethers.ContractFactory(
                this.delegateContractABI,
                this.delegateContractBytecode,
                connectedWallet
            );
            
            const contract = await contractFactory.deploy();
            await contract.waitForDeployment();

            const explorerLink = `${this.currentExplorerUrl}/tx/${contract.deploymentTransaction().hash}`;
            this.showSuccessMessage(`SimpleDelegateContract deployed successfully at ${await contract.getAddress()}`, explorerLink);
            this.delegateContractStatus.textContent = 'Deployed Successfully';
            this.delegateContractStatus.className = 'contract-status deployed';
            this.deployDelegateContractBtn.textContent = 'Contract Deployed';
            
            // Update the default address display
            this.delegateContractAddress.textContent = await contract.getAddress();
            
            // Store the deployed address
            localStorage.setItem('deployedDelegateContractAddress', await contract.getAddress());

            // Update transfer button
            this.updateTransferButton();

        } catch (error) {
            console.error('Error deploying delegate contract:', error);
            this.showErrorMessage(`Failed to deploy delegate contract: ${error.message}`);
            this.deployDelegateContractBtn.disabled = false;
            this.deployDelegateContractBtn.textContent = 'Deploy SimpleDelegateContract';
            this.delegateContractStatus.textContent = 'Deployment Failed';
            this.delegateContractStatus.className = 'contract-status not-deployed';
        }
    }

    // Contract interaction methods
    updateMintButton() {
        const hasRecipient = this.mintRecipientInput.value.trim() !== '';
        const hasAmount = this.mintAmountInput.value.trim() !== '' && parseFloat(this.mintAmountInput.value) > 0;
        const hasRelayerAccount = localStorage.getItem('relayerAccount') !== null;
        const isContractDeployed = this.contractStatus.textContent === 'Already Deployed' || 
                                  this.contractStatus.textContent === 'Deployed Successfully';
        
        this.mintTokensBtn.disabled = !hasRecipient || !hasAmount || !hasRelayerAccount || !isContractDeployed;
    }

    updateTransferButton() {
        const hasRecipient = this.transferRecipientInput.value.trim() !== '';
        const hasAmount = this.transferAmountInput.value.trim() !== '' && parseFloat(this.transferAmountInput.value) > 0;
        const hasValidFee = this.transferFeeInput.value.trim() === '' || parseFloat(this.transferFeeInput.value) >= 0;
        const hasUserAccount = localStorage.getItem('userAccount') !== null;
        const hasRelayerAccount = localStorage.getItem('relayerAccount') !== null;
        const isContractDeployed = this.contractStatus.textContent === 'Already Deployed' || 
                                  this.contractStatus.textContent === 'Deployed Successfully';
        const isDelegateContractDeployed = this.delegateContractStatus.textContent === 'Already Deployed' || 
                                          this.delegateContractStatus.textContent === 'Deployed Successfully';
        
        this.transferTokensBtn.disabled = !hasRecipient || !hasAmount || !hasValidFee || !hasUserAccount || !hasRelayerAccount || !isContractDeployed || !isDelegateContractDeployed;
    }

    async mintTokens() {
        try {
            const recipient = this.mintRecipientInput.value.trim();
            const amount = this.mintAmountInput.value.trim();

            if (!this.isValidAddress(recipient)) {
                this.showErrorMessage('Invalid recipient address');
                return;
            }

            // Get relayer account
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.showErrorMessage('Relayer account not found');
                return;
            }

            const { privateKey } = JSON.parse(relayerData);
            const wallet = new ethers.Wallet(privateKey);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Get contract address
            const contractAddress = this.defaultContractAddress.textContent;
            const contract = new ethers.Contract(contractAddress, this.contractABI, connectedWallet);

            // Get token decimals
            const decimals = await contract.decimals();
            const amountInWei = ethers.parseUnits(amount, decimals);

            this.mintTokensBtn.disabled = true;
            this.mintTokensBtn.textContent = 'Minting...';

            // Call mint function with amount in wei
            const tx = await contract.mint(recipient, amountInWei);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage(`Successfully minted ${amount} tokens to ${recipient}`, explorerLink);
            this.mintRecipientInput.value = '';
            this.mintAmountInput.value = '';
            this.updateMintButton();

            // Update balances after minting
            this.updateUserTokenBalance();
            this.updateRelayerTokenBalance();
            this.updateUserEthBalance();

        } catch (error) {
            console.error('Error minting tokens:', error);
            this.showErrorMessage(`Failed to mint tokens: ${error.message}`);
        } finally {
            this.mintTokensBtn.disabled = false;
            this.mintTokensBtn.textContent = 'Mint Tokens';
            this.updateMintButton();
        }
    }

    async transferTokens() {
        try {
            const recipient = this.transferRecipientInput.value.trim();
            const amount = this.transferAmountInput.value.trim();
            const fee = this.transferFeeInput.value.trim();

            if (!this.isValidAddress(recipient)) {
                this.showErrorMessage('Invalid recipient address');
                return;
            }

            // Get user and relayer accounts
            const userData = localStorage.getItem('userAccount');
            const relayerData = localStorage.getItem('relayerAccount');
            if (!userData || !relayerData) {
                this.showErrorMessage('User or relayer account not found');
                return;
            }

            const { privateKey: userPrivateKey, address: userAddress } = JSON.parse(userData);
            const { privateKey: relayerPrivateKey, address: relayerAddress } = JSON.parse(relayerData);

            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            
            // Get contract addresses
            const tokenContractAddress = this.defaultContractAddress.textContent;
            const delegateContractAddress = this.delegateContractAddress.textContent;
            
            // Validate addresses
            if (!tokenContractAddress || tokenContractAddress === 'Not Deployed') {
                this.showErrorMessage('ERC20 contract is not deployed');
                return;
            }
            
            if (!delegateContractAddress || delegateContractAddress === 'Not Deployed') {
                this.showErrorMessage('SimpleDelegateContract is not deployed');
                return;
            }
            
            if (!this.isValidAddress(tokenContractAddress)) {
                this.showErrorMessage('Invalid ERC20 contract address');
                return;
            }
            
            if (!this.isValidAddress(delegateContractAddress)) {
                this.showErrorMessage('Invalid SimpleDelegateContract address');
                return;
            }
            
            // Create contract instances
            const tokenContract = new ethers.Contract(tokenContractAddress, this.contractABI, provider);
            const delegateContract = new ethers.Contract(delegateContractAddress, this.delegateContractABI, provider);

            // Get token decimals and prepare transfer data
            const decimals = await tokenContract.decimals();
            const amountInWei = ethers.parseUnits(amount, decimals);
            
            // Prepare the transfer call data
            const transferData = tokenContract.interface.encodeFunctionData('transfer', [recipient, amountInWei]);
            
            // Create the call array for SimpleDelegateContract.execute
            const calls = [{
                to: tokenContractAddress,
                data: transferData,
                value: 0
            }];
            
            // Add fee transfer to relayer if fee is specified
            if (fee && parseFloat(fee) > 0) {
                const feeInWei = ethers.parseUnits(fee, decimals);
                const feeTransferData = tokenContract.interface.encodeFunctionData('transfer', [relayerAddress, feeInWei]);
                calls.push({
                    to: tokenContractAddress,
                    data: feeTransferData,
                    value: 0
                });
            }

            // Encode the execute function call
            const executeData = delegateContract.interface.encodeFunctionData('execute', [calls]);

            this.transferTokensBtn.disabled = true;
            this.transferTokensBtn.textContent = 'Checking Delegation Status...';

            // Check if user account is already delegated
            const userCode = await provider.getCode(userAddress);
            const isDelegated = userCode !== '0x' && userCode.startsWith('0xef0100');
            
            let authorization;
            
            if (!isDelegated) {
                this.transferTokensBtn.textContent = 'Creating Delegation...';
                
                // Create EIP-7702 authorization using ethers.js authorize method
                const userWallet = new ethers.Wallet(userPrivateKey, provider);
                const nonce = await userWallet.getNonce();
                
                // Create authorization using ethers.js built-in method
                authorization = await userWallet.authorize({
                    address: delegateContractAddress,
                    nonce: nonce
                });
            } else {
                console.log('User account is already delegated, skipping authorization creation');
            }

            this.transferTokensBtn.textContent = 'Executing Gasless Transfer...';

            // Relayer executes the transaction with the delegation
            const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
            
            // Create transaction with proper structure
            const txRequest = {
                to: userAddress,
                data: executeData
            };
            
            // Only use EIP-7702 transaction type and authorization if user is not already delegated
            if (!isDelegated && authorization) {
                txRequest.type = 4; // EIP-7702 transaction type
                txRequest.authorizationList = [authorization];
            }

            const tx = await relayerWallet.sendTransaction(txRequest);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            let successMessage = `Successfully executed gasless transfer of ${amount} tokens to ${recipient}`;
            if (fee && parseFloat(fee) > 0) {
                successMessage += ` with ${fee} token fee to relayer`;
            }
            this.showSuccessMessage(successMessage, explorerLink);
            this.transferRecipientInput.value = '';
            this.transferAmountInput.value = '';
            this.transferFeeInput.value = '';
            this.updateTransferButton();

            // Update balances after transfer
            this.updateUserTokenBalance();
            this.updateRelayerTokenBalance();
            this.updateUserEthBalance();

        } catch (error) {
            console.error('Error executing gasless transfer:', error);
            this.showErrorMessage(`Failed to execute gasless transfer: ${error.message}`);
        } finally {
            this.transferTokensBtn.disabled = false;
            this.transferTokensBtn.textContent = 'Gasless Transfer';
            this.updateTransferButton();
        }
    }

    async getNonce(address) {
        const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
        return await provider.getTransactionCount(address, 'pending');
    }

    isValidAddress(address) {
        try {
            ethers.getAddress(address);
            return true;
        } catch {
            return false;
        }
    }

    // Balance update methods
    async updateRelayerEthBalance() {
        try {
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.relayerEthBalance.textContent = 'ETH (Relayer): No account';
                return;
            }

            const { address } = JSON.parse(relayerData);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const balance = await provider.getBalance(address);
            const ethBalance = ethers.formatEther(balance);
            this.relayerEthBalance.textContent = `ETH (Relayer): ${parseFloat(ethBalance).toFixed(4)}`;
        } catch (error) {
            console.error('Error fetching relayer ETH balance:', error);
            this.relayerEthBalance.textContent = 'ETH (Relayer): Error';
        }
    }

    async updateRelayerTokenBalance() {
        try {
            const relayerData = localStorage.getItem('relayerAccount');
            if (!relayerData) {
                this.relayerTokenBalance.textContent = 'Tokens (Relayer): No account';
                return;
            }

            const { address } = JSON.parse(relayerData);
            const contractAddress = this.defaultContractAddress.textContent;
            
            // Check if contract is deployed
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(contractAddress);
            
            if (code === '0x' || code === '0x0') {
                this.relayerTokenBalance.textContent = 'Tokens (Relayer): Contract not deployed';
                return;
            }

            const contract = new ethers.Contract(contractAddress, this.contractABI, provider);
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const tokenBalance = ethers.formatUnits(balance, decimals);
            this.relayerTokenBalance.textContent = `Tokens (Relayer): ${parseFloat(tokenBalance).toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching relayer token balance:', error);
            this.relayerTokenBalance.textContent = 'Tokens (Relayer): Error';
        }
    }

    async updateUserEthBalance() {
        try {
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.userEthBalance.textContent = 'ETH (User): No account';
                return;
            }

            const { address } = JSON.parse(userData);
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const balance = await provider.getBalance(address);
            const ethBalance = ethers.formatEther(balance);
            this.userEthBalance.textContent = `ETH (User): ${parseFloat(ethBalance).toFixed(4)}`;
        } catch (error) {
            console.error('Error fetching user ETH balance:', error);
            this.userEthBalance.textContent = 'ETH (User): Error';
        }
    }

    async updateUserTokenBalance() {
        try {
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.userTokenBalance.textContent = 'Tokens (User): No account';
                return;
            }

            const { address } = JSON.parse(userData);
            const contractAddress = this.defaultContractAddress.textContent;
            
            // Check if contract is deployed
            const provider = new ethers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(contractAddress);
            
            if (code === '0x' || code === '0x0') {
                this.userTokenBalance.textContent = 'Tokens (User): Contract not deployed';
                return;
            }

            const contract = new ethers.Contract(contractAddress, this.contractABI, provider);
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const tokenBalance = ethers.formatUnits(balance, decimals);
            this.userTokenBalance.textContent = `Tokens (User): ${parseFloat(tokenBalance).toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching user token balance:', error);
            this.userTokenBalance.textContent = 'Tokens (User): Error';
        }
    }

    async updateAllBalances() {
        await Promise.all([
            this.updateRelayerEthBalance(),
            this.updateRelayerTokenBalance(),
            this.updateUserEthBalance(),
            this.updateUserTokenBalance()
        ]);
    }

    generateAccount(type) {
        try {
            // Generate a random wallet
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

        // Add success styling
        accountSection.classList.add('success');

        // Store data in localStorage for persistence
        localStorage.setItem(`${type}Account`, JSON.stringify({
            privateKey: privateKey,
            address: address,
            isDefault: isDefault
        }));

        // Update balances when account changes
        if (type === 'relayer') {
            this.updateRelayerEthBalance();
            this.updateRelayerTokenBalance();
        } else if (type === 'user') {
            this.updateUserEthBalance();
            this.updateUserTokenBalance();
        }
    }

    resetAccount(type) {
        const inputSection = type === 'relayer' ? this.relayerInputSection : this.userInputSection;
        const displaySection = type === 'relayer' ? this.relayerDisplaySection : this.userDisplaySection;
        const privateKeyInput = type === 'relayer' ? this.relayerPrivateKeyInput : this.userPrivateKeyInput;
        const accountSection = inputSection.closest('.account-section');

        // Clear input
        privateKeyInput.value = '';

        // Show input section and hide display section
        inputSection.classList.remove('hidden');
        displaySection.classList.add('hidden');

        // Remove success styling
        accountSection.classList.remove('success');

        // Remove from localStorage and load default account
        localStorage.removeItem(`${type}Account`);
        this.loadDefaultAccount(type);
    }

    editAccount(type) {
        const inputSection = type === 'relayer' ? this.relayerInputSection : this.userInputSection;
        const displaySection = type === 'relayer' ? this.relayerDisplaySection : this.userDisplaySection;
        const privateKeyInput = type === 'relayer' ? this.relayerPrivateKeyInput : this.userPrivateKeyInput;
        const accountSection = inputSection.closest('.account-section');

        // Get current account data
        const saved = localStorage.getItem(`${type}Account`);
        if (saved) {
            try {
                const accountData = JSON.parse(saved);
                privateKeyInput.value = accountData.privateKey;
            } catch (error) {
                console.error(`Error loading ${type} account data:`, error);
            }
        }

        // Show input section and hide display section
        inputSection.classList.remove('hidden');
        displaySection.classList.add('hidden');

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
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);

        // Add slideOut animation
        const slideOutStyle = document.createElement('style');
        slideOutStyle.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(slideOutStyle);
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
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const accountManager = new AccountManager();
    accountManager.initializeBlockchainConfig();
    accountManager.loadSavedAccounts();
    
    // Initialize balance updates
    accountManager.updateAllBalances();
    
    // Initialize delegate contract status check
    accountManager.checkDelegateContractStatus();
    
    // Initialize delegate deploy button
    accountManager.updateDelegateDeployButton();
});
