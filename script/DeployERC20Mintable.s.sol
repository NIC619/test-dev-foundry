// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mintable} from "../src/ERC20Mintable.sol";

contract DeployERC20MintableScript is Script {
    ERC20Mintable public erc20Mintable;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        erc20Mintable = new ERC20Mintable("USD Coin", "USDC", 6);

        vm.stopBroadcast();
    }
}
