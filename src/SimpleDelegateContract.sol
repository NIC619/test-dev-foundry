// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SimpleDelegateContract {
    event Executed(address indexed to, uint256 value, bytes data);
    event ExecutedWithSig(address indexed signer, address indexed to, uint256 value, bytes data);

    struct Call {
        bytes data;
        address to;
        uint256 value;
    }

    struct ExecuteWithSigMessage {
        address userAccountAddress;
        uint256 expiry;
        Call[] calls;
    }

    // EIP-712 domain separator
    bytes32 public constant DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    bytes32 public constant EXECUTE_WITH_SIG_MESSAGE_TYPEHASH = keccak256(
        "ExecuteWithSigMessage(address userAccountAddress,uint256 expiry,Call[] calls)Call(address to,uint256 value,bytes data)"
    );
    
    bytes32 public constant CALL_TYPEHASH = keccak256(
        "Call(address to,uint256 value,bytes data)"
    );

    function execute(Call[] memory calls) external payable {
        for (uint256 i = 0; i < calls.length; i++) {
            Call memory call = calls[i];
            (bool success, bytes memory result) = call.to.call{value: call.value}(call.data);
            require(success, string(result));
            emit Executed(call.to, call.value, call.data);
        }
    }

    function executeWithSig(
        ExecuteWithSigMessage memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        // Check if message has expired
        require(block.timestamp <= message.expiry, "Message expired");
        
        // Verify the signature
        address signer = _verifySignature(message, v, r, s);
        require(
            signer == message.userAccountAddress && signer == address(this), 
            "Invalid signer"
        );
        
        // Execute the calls
        for (uint256 i = 0; i < message.calls.length; i++) {
            Call memory call = message.calls[i];
            (bool success, bytes memory result) = call.to.call{value: call.value}(call.data);
            require(success, string(result));
            emit ExecutedWithSig(signer, call.to, call.value, call.data);
        }
    }

    function verifySignature(
        ExecuteWithSigMessage memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (address signer, bool isValid) {
        signer = _verifySignature(message, v, r, s);
        isValid = (signer == message.userAccountAddress && signer == address(this));
    }

    function _verifySignature(
        ExecuteWithSigMessage memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (address) {
        bytes32 domainSeparator = _hashDomain();
        bytes32 structHash = _hashExecuteWithSigMessage(message);
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        
        return ecrecover(digest, v, r, s);
    }

    function _hashDomain() internal view returns (bytes32) {
        return keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("SimpleDelegateContract"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    function _hashExecuteWithSigMessage(ExecuteWithSigMessage memory message) internal pure returns (bytes32) {
        bytes32 callsHash = _hashCalls(message.calls);
        return keccak256(abi.encode(
            EXECUTE_WITH_SIG_MESSAGE_TYPEHASH,
            message.userAccountAddress,
            message.expiry,
            callsHash
        ));
    }

    function _hashCalls(Call[] memory calls) internal pure returns (bytes32) {
        bytes32[] memory callHashes = new bytes32[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            callHashes[i] = keccak256(abi.encode(
                CALL_TYPEHASH,
                calls[i].to,
                calls[i].value,
                keccak256(calls[i].data)
            ));
        }
        return keccak256(abi.encodePacked(callHashes));
    }

    receive() external payable {}
}

contract ERC20 {
    address public minter;
    mapping(address => uint256) private _balances;

    constructor(address _minter) {
        minter = _minter;
    }

    function mint(uint256 amount, address to) public {
        _mint(to, amount);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function _mint(address account, uint256 amount) internal {
        require(msg.sender == minter, "ERC20: msg.sender is not minter");
        require(account != address(0), "ERC20: mint to the zero address");
        unchecked {
            _balances[account] += amount;
        }
    }
}
