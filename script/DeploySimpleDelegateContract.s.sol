// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import {SimpleDelegateContract} from "src/SimpleDelegateContract.sol";

contract DeploySimpleDelegateContractScript is Script {
    function run() external returns (SimpleDelegateContract deployed) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        deployed = new SimpleDelegateContract();

        vm.stopBroadcast();

        console2.log("SimpleDelegateContract deployed at:", address(deployed));
    }
}
