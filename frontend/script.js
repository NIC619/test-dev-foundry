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
        this.initializeBlockchainConfig();
        
        // Initialize balance updates
        this.updateAllBalances();
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
        this.deployerAccountSelect = document.getElementById('deployer-account');
        this.deployContractBtn = document.getElementById('deploy-contract');

        // Contract interaction elements
        this.mintRecipientInput = document.getElementById('mint-recipient');
        this.mintAmountInput = document.getElementById('mint-amount');
        this.mintTokensBtn = document.getElementById('mint-tokens');
        this.transferRecipientInput = document.getElementById('transfer-recipient');
        this.transferAmountInput = document.getElementById('transfer-amount');
        this.transferTokensBtn = document.getElementById('transfer-tokens');

        // Balance display elements
        this.relayerEthBalance = document.getElementById('relayer-eth-balance');
        this.userTokenBalance = document.getElementById('user-token-balance');
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
        this.deployerAccountSelect.addEventListener('change', () => this.updateDeployButton());
        this.tokenNameInput.addEventListener('input', () => this.updateDeployButton());
        this.tokenSymbolInput.addEventListener('input', () => this.updateDeployButton());

        // Contract interaction events
        this.mintTokensBtn.addEventListener('click', () => this.mintTokens());
        this.transferTokensBtn.addEventListener('click', () => this.transferTokens());
        this.mintRecipientInput.addEventListener('input', () => this.updateMintButton());
        this.mintAmountInput.addEventListener('input', () => this.updateMintButton());
        this.transferRecipientInput.addEventListener('input', () => this.updateTransferButton());
        this.transferAmountInput.addEventListener('input', () => this.updateTransferButton());
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
        this.defaultContractAddressValue = '0x8A4BC9B8e31bc6B144fD1068581dc0FC2A7885e7';
        this.contractABI = [{"inputs":[{"name":"name_","type":"string","internalType":"string"},{"name":"symbol_","type":"string","internalType":"string"},{"name":"decimals_","type":"uint8","internalType":"uint8"}],"stateMutability":"nonpayable","type":"constructor"},{"type":"function","name":"allowance","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"spender","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"approve","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"burn","inputs":[{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"burnFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"decimals","inputs":[],"outputs":[{"name":"","type":"uint8","internalType":"uint8"}],"stateMutability":"view"},{"type":"function","name":"mint","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"amount","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"mintBatch","inputs":[{"name":"recipients","type":"address[]","internalType":"address[]"},{"name":"amounts","type":"uint256[]","internalType":"uint256[]"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"totalSupply","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"value","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"nonpayable"},{"type":"event","name":"Approval","inputs":[{"name":"owner","type":"address","indexed":true,"internalType":"address"},{"name":"spender","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"name":"from","type":"address","indexed":true,"internalType":"address"},{"name":"to","type":"address","indexed":true,"internalType":"address"},{"name":"value","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"ERC20InsufficientAllowance","inputs":[{"name":"spender","type":"address","internalType":"address"},{"name":"allowance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC20InsufficientBalance","inputs":[{"name":"sender","type":"address","internalType":"address"},{"name":"balance","type":"uint256","internalType":"uint256"},{"name":"needed","type":"uint256","internalType":"uint256"}]},{"type":"error","name":"ERC20InvalidApprover","inputs":[{"name":"approver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidReceiver","inputs":[{"name":"receiver","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidSender","inputs":[{"name":"sender","type":"address","internalType":"address"}]},{"type":"error","name":"ERC20InvalidSpender","inputs":[{"name":"spender","type":"address","internalType":"address"}]}];
        this.contractBytecode = "0x60a060405234801561000f575f5ffd5b50604051611820380380611820833981810160405281019061003191906101ee565b828281600390816100429190610486565b5080600490816100529190610486565b5050508060ff1660808160ff1681525050505050610555565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6100ca82610084565b810181811067ffffffffffffffff821117156100e9576100e8610094565b5b80604052505050565b5f6100fb61006b565b905061010782826100c1565b919050565b5f67ffffffffffffffff82111561012657610125610094565b5b61012f82610084565b9050602081019050919050565b8281835e5f83830152505050565b5f61015c6101578461010c565b6100f2565b90508281526020810184848401111561017857610177610080565b5b61018384828561013c565b509392505050565b5f82601f83011261019f5761019e61007c565b5b81516101af84826020860161014a565b91505092915050565b5f60ff82169050919050565b6101cd816101b8565b81146101d7575f5ffd5b50565b5f815190506101e8816101c4565b92915050565b5f5f5f6060848603121561020557610204610074565b5b5f84015167ffffffffffffffff81111561022257610221610078565b5b61022e8682870161018b565b935050602084015167ffffffffffffffff81111561024f5761024e610078565b5b61025b8682870161018b565b925050604061026c868287016101da565b9150509250925092565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806102c457607f821691505b6020821081036102d7576102d6610280565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026103397fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826102fe565b61034386836102fe565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f61038761038261037d8461035b565b610364565b61035b565b9050919050565b5f819050919050565b6103a08361036d565b6103b46103ac8261038e565b84845461030a565b825550505050565b5f5f905090565b6103cb6103bc565b6103d6818484610397565b505050565b5b818110156103f9576103ee5f826103c3565b6001810190506103dc565b5050565b601f82111561043e5761040f816102dd565b610418846102ef565b81016020851015610427578190505b61043b610433856102ef565b8301826103db565b50505b505050565b5f82821c905092915050565b5f61045e5f1984600802610443565b1980831691505092915050565b5f610476838361044f565b9150826002028217905092915050565b61048f82610276565b67ffffffffffffffff8111156104a8576104a7610094565b5b6104b282546102ad565b6104bd8282856103fd565b5f60209050601f8311600181146104ee575f84156104dc578287015190505b6104e6858261046b565b86555061054d565b601f1984166104fc866102dd565b5f5b82811015610523578489015182556001820191506020850194506020810190506104fe565b86831015610540578489015161053c601f89168261044f565b8355505b6001600288020188555050505b505050505050565b6080516112b361056d5f395f61039501526112b35ff3fe608060405234801561000f575f5ffd5b50600436106100cd575f3560e01c806342966c681161008a5780637c88e3d9116100645780637c88e3d91461020f57806395d89b411461022b578063a9059cbb14610249578063dd62ed3e14610279576100cd565b806342966c68146101a757806370a08231146101c357806379cc6790146101f3576100cd565b806306fdde03146100d1578063095ea7b3146100ef57806318160ddd1461011f57806323b872dd1461013d578063313ce5671461016d57806340c10f191461018b575b5f5ffd5b6100d96102a9565b6040516100e69190610d0e565b60405180910390f35b61010960048036038101906101049190610dc3565b610339565b6040516101169190610e1b565b60405180910390f35b61012761035b565b6040516101349190610e43565b60405180910390f35b61015760048036038101906101529190610e5c565b610364565b6040516101649190610e1b565b60405180910390f35b610175610392565b6040516101829190610ec7565b60405180910390f35b6101a560048036038101906101a09190610dc3565b6103b9565b005b6101c160048036038101906101bc9190610ee0565b6103c7565b005b6101dd60048036038101906101d89190610f0b565b6103d4565b6040516101ea9190610e43565b60405180910390f35b61020d60048036038101906102089190610dc3565b610419565b005b61022960048036038101906102249190610fec565b610432565b005b6102336104e8565b6040516102409190610d0e565b60405180910390f35b610263600480360381019061025e9190610dc3565b610578565b6040516102709190610e1b565b60405180910390f35b610293600480360381019061028e919061106a565b61059a565b6040516102a09190610e43565b60405180910390f35b6060600380546102b8906110d5565b80601f01602080910402602001604051908101604052809291908181526020018280546102e4906110d5565b801561032f5780601f106103065761010080835404028352916020019161032f565b820191905f5260205f20905b81548152906001019060200180831161031257829003601f168201915b5050505050905090565b5f5f61034361061c565b9050610350818585610623565b600191505092915050565b5f600254905090565b5f5f61036e61061c565b905061037b858285610635565b6103868585856106c8565b60019150509392505050565b5f7f0000000000000000000000000000000000000000000000000000000000000000905090565b6103c382826107b8565b5050565b6103d13382610837565b50565b5f5f5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b610424823383610635565b61042e8282610837565b5050565b81819050848490501461047a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161047190611175565b60405180910390fd5b5f5f90505b848490508110156104e1576104d48585838181106104a05761049f611193565b5b90506020020160208101906104b59190610f0b565b8484848181106104c8576104c7611193565b5b905060200201356107b8565b808060010191505061047f565b5050505050565b6060600480546104f7906110d5565b80601f0160208091040260200160405190810160405280929190818152602001828054610523906110d5565b801561056e5780601f106105455761010080835404028352916020019161056e565b820191905f5260205f20905b81548152906001019060200180831161055157829003601f168201915b5050505050905090565b5f5f61058261061c565b905061058f8185856106c8565b600191505092915050565b5f60015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905092915050565b5f33905090565b61063083838360016108b6565b505050565b5f610640848461059a565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8110156106c257818110156106b3578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016106aa939291906111cf565b60405180910390fd5b6106c184848484035f6108b6565b5b50505050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610738575f6040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161072f9190611204565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107a8575f6040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161079f9190611204565b60405180910390fd5b6107b3838383610a85565b505050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610828575f6040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161081f9190611204565b60405180910390fd5b6108335f8383610a85565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036108a7575f6040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161089e9190611204565b60405180910390fd5b6108b2825f83610a85565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603610926575f6040517fe602df0500000000000000000000000000000000000000000000000000000000815260040161091d9190611204565b60405180910390fd5b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610996575f6040517f94280d6200000000000000000000000000000000000000000000000000000000815260040161098d9190611204565b60405180910390fd5b8160015f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055508015610a7f578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610a769190610e43565b60405180910390a35b50505050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610ad5578060025f828254610ac9919061124a565b92505081905550610ba3565b5f5f5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081811015610b5e578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401610b55939291906111cf565b60405180910390fd5b8181035f5f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610bea578060025f8282540392505081905550610c34565b805f5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610c919190610e43565b60405180910390a3505050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f610ce082610c9e565b610cea8185610ca8565b9350610cfa818560208601610cb8565b610d0381610cc6565b840191505092915050565b5f6020820190508181035f830152610d268184610cd6565b905092915050565b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610d5f82610d36565b9050919050565b610d6f81610d55565b8114610d79575f5ffd5b50565b5f81359050610d8a81610d66565b92915050565b5f819050919050565b610da281610d90565b8114610dac575f5ffd5b50565b5f81359050610dbd81610d99565b92915050565b5f5f60408385031215610dd957610dd8610d2e565b5b5f610de685828601610d7c565b9250506020610df785828601610daf565b9150509250929050565b5f8115159050919050565b610e1581610e01565b82525050565b5f602082019050610e2e5f830184610e0c565b92915050565b610e3d81610d90565b82525050565b5f602082019050610e565f830184610e34565b92915050565b5f5f5f60608486031215610e7357610e72610d2e565b5b5f610e8086828701610d7c565b9350506020610e9186828701610d7c565b9250506040610ea286828701610daf565b9150509250925092565b5f60ff82169050919050565b610ec181610eac565b82525050565b5f602082019050610eda5f830184610eb8565b92915050565b5f60208284031215610ef557610ef4610d2e565b5b5f610f0284828501610daf565b91505092915050565b5f60208284031215610f2057610f1f610d2e565b5b5f610f2d84828501610d7c565b91505092915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f840112610f5757610f56610f36565b5b8235905067ffffffffffffffff811115610f7457610f73610f3a565b5b602083019150836020820283011115610f9057610f8f610f3e565b5b9250929050565b5f5f83601f840112610fac57610fab610f36565b5b8235905067ffffffffffffffff811115610fc957610fc8610f3a565b5b602083019150836020820283011115610fe557610fe4610f3e565b5b9250929050565b5f5f5f5f6040858703121561100457611003610d2e565b5b5f85013567ffffffffffffffff81111561102157611020610d32565b5b61102d87828801610f42565b9450945050602085013567ffffffffffffffff8111156110505761104f610d32565b5b61105c87828801610f97565b925092505092959194509250565b5f5f604083850312156110805761107f610d2e565b5b5f61108d85828601610d7c565b925050602061109e85828601610d7c565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806110ec57607f821691505b6020821081036110ff576110fe6110a8565b5b50919050565b7f45524332304d696e7461626c653a20617272617973206c656e677468206d69735f8201527f6d61746368000000000000000000000000000000000000000000000000000000602082015250565b5f61115f602583610ca8565b915061116a82611105565b604082019050919050565b5f6020820190508181035f83015261118c81611153565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b6111c981610d55565b82525050565b5f6060820190506111e25f8301866111c0565b6111ef6020830185610e34565b6111fc6040830184610e34565b949350505050565b5f6020820190506112175f8301846111c0565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61125482610d90565b915061125f83610d90565b92508282019050808211156112775761127661121d565b5b9291505056fea2646970667358221220137ed3faabd9d33177cd03606e48d6fd5dbd0a1d0b4a8def0eb82e85ac9c8faf64736f6c634300081c0033";
        
        this.checkContractStatus();
    }

    async checkContractStatus() {
        try {
            this.contractStatus.textContent = 'Checking...';
            this.contractStatus.className = 'contract-status checking';

            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
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
        } catch (error) {
            console.error('Error checking contract status:', error);
            this.contractStatus.textContent = 'Error Checking';
            this.contractStatus.className = 'contract-status not-deployed';
        }
    }

    updateDeployButton() {
        const hasAccount = this.deployerAccountSelect.value !== '';
        const hasName = this.tokenNameInput.value.trim() !== '';
        const hasSymbol = this.tokenSymbolInput.value.trim() !== '';
        const isDeployed = this.contractStatus.textContent === 'Already Deployed';
        
        this.deployContractBtn.disabled = !hasAccount || !hasName || !hasSymbol || isDeployed;
    }

    async deployContract() {
        try {
            const deployerType = this.deployerAccountSelect.value;
            const tokenName = this.tokenNameInput.value.trim();
            const tokenSymbol = this.tokenSymbolInput.value.trim();
            const tokenDecimals = parseInt(this.tokenDecimalsInput.value) || 18;

            // Get the deployer account data
            const accountData = localStorage.getItem(`${deployerType}Account`);
            if (!accountData) {
                this.showErrorMessage('Please select a valid deployer account');
                return;
            }

            const { privateKey } = JSON.parse(accountData);
            const wallet = new ethers.Wallet(privateKey);
            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
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
            await contract.deployed();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage(`Contract deployed successfully at ${contract.address}`, explorerLink);
            this.contractStatus.textContent = 'Deployed Successfully';
            this.contractStatus.className = 'contract-status deployed';
            this.deployContractBtn.textContent = 'Contract Deployed';
            
            // Update the default address display
            this.defaultContractAddress.textContent = contract.address;
            
            // Store the deployed address
            localStorage.setItem('deployedContractAddress', contract.address);

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
        const hasUserAccount = localStorage.getItem('userAccount') !== null;
        const isContractDeployed = this.contractStatus.textContent === 'Already Deployed' || 
                                  this.contractStatus.textContent === 'Deployed Successfully';
        
        this.transferTokensBtn.disabled = !hasRecipient || !hasAmount || !hasUserAccount || !isContractDeployed;
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
            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Get contract address
            const contractAddress = this.defaultContractAddress.textContent;
            const contract = new ethers.Contract(contractAddress, this.contractABI, connectedWallet);

            // Get token decimals
            const decimals = await contract.decimals();
            const amountInWei = ethers.utils.parseUnits(amount, decimals);

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

            if (!this.isValidAddress(recipient)) {
                this.showErrorMessage('Invalid recipient address');
                return;
            }

            // Get user account
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.showErrorMessage('User account not found');
                return;
            }

            const { privateKey } = JSON.parse(userData);
            const wallet = new ethers.Wallet(privateKey);
            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
            const connectedWallet = wallet.connect(provider);

            // Get contract address
            const contractAddress = this.defaultContractAddress.textContent;
            const contract = new ethers.Contract(contractAddress, this.contractABI, connectedWallet);

            // Get token decimals
            const decimals = await contract.decimals();
            const amountInWei = ethers.utils.parseUnits(amount, decimals);

            this.transferTokensBtn.disabled = true;
            this.transferTokensBtn.textContent = 'Transferring...';

            // Call transfer function with amount in wei
            const tx = await contract.transfer(recipient, amountInWei);
            await tx.wait();

            const explorerLink = `${this.currentExplorerUrl}/tx/${tx.hash}`;
            this.showSuccessMessage(`Successfully transferred ${amount} tokens to ${recipient}`, explorerLink);
            this.transferRecipientInput.value = '';
            this.transferAmountInput.value = '';
            this.updateTransferButton();

            // Update balances after transfer
            this.updateUserTokenBalance();

        } catch (error) {
            console.error('Error transferring tokens:', error);
            this.showErrorMessage(`Failed to transfer tokens: ${error.message}`);
        } finally {
            this.transferTokensBtn.disabled = false;
            this.transferTokensBtn.textContent = 'Transfer Tokens';
            this.updateTransferButton();
        }
    }

    isValidAddress(address) {
        try {
            ethers.utils.getAddress(address);
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
                this.relayerEthBalance.textContent = 'ETH: No account';
                return;
            }

            const { address } = JSON.parse(relayerData);
            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
            const balance = await provider.getBalance(address);
            const ethBalance = ethers.utils.formatEther(balance);
            this.relayerEthBalance.textContent = `ETH: ${parseFloat(ethBalance).toFixed(4)}`;
        } catch (error) {
            console.error('Error fetching relayer ETH balance:', error);
            this.relayerEthBalance.textContent = 'ETH: Error';
        }
    }

    async updateUserTokenBalance() {
        try {
            const userData = localStorage.getItem('userAccount');
            if (!userData) {
                this.userTokenBalance.textContent = 'Tokens: No account';
                return;
            }

            const { address } = JSON.parse(userData);
            const contractAddress = this.defaultContractAddress.textContent;
            
            // Check if contract is deployed
            const provider = new ethers.providers.JsonRpcProvider(this.currentRpcUrl);
            const code = await provider.getCode(contractAddress);
            
            if (code === '0x' || code === '0x0') {
                this.userTokenBalance.textContent = 'Tokens: Contract not deployed';
                return;
            }

            const contract = new ethers.Contract(contractAddress, this.contractABI, provider);
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            const tokenBalance = ethers.utils.formatUnits(balance, decimals);
            this.userTokenBalance.textContent = `Tokens: ${parseFloat(tokenBalance).toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching user token balance:', error);
            this.userTokenBalance.textContent = 'Tokens: Error';
        }
    }

    async updateAllBalances() {
        await Promise.all([
            this.updateRelayerEthBalance(),
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
        } else if (type === 'user') {
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
    accountManager.loadSavedAccounts();
});
