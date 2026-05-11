// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

/// @dev Self-transfer script for replacing stuck txs or testing broadcast.
///
/// **Nonce:** `forge script` has no `--nonce` flag. To force a nonce (e.g. replace a pending tx),
/// uncomment `nonce` and `vm.setNonce(sender, nonce)` below so the script uses that sequence number.
///
/// **Gas price:** Set fees when you run the CLI, not in Solidity. Examples:
/// - Legacy: `forge script ... --broadcast --legacy --with-gas-price <wei> [--skip-simulation]`
/// - EIP-1559: `forge script ... --broadcast --with-gas-price <maxFeePerGasWei> --priority-gas-price <maxPriorityFeePerGasWei> [--skip-simulation]`
/// `--skip-simulation` avoids a misleading pre-broadcast gas estimate that may not reflect your flags.

contract ReplaceStuckTxScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address sender = vm.addr(privateKey);
        console2.log("Sender:", sender);
        uint64 nonce = uint64(123);
        vm.setNonce(sender, nonce);
        console2.log("Nonce:", nonce);

        vm.startBroadcast(privateKey);

        (bool success,) = payable(sender).call{value: 1}("");
        require(success, "Self-transfer failed");

        vm.stopBroadcast();
    }
}
