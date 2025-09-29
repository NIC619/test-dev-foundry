// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {PaymentFacilitator} from "src/PaymentFacilitator.sol";

contract DeployPaymentFacilitatorScript is Script {
    function run() external returns (PaymentFacilitator deployed) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        deployed = new PaymentFacilitator();

        vm.stopBroadcast();

        console2.log("PaymentFacilitator deployed at:", address(deployed));
        console2.log("Owner (msg.sender):", vm.addr(deployerPrivateKey));
    }
}