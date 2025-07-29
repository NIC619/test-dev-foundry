// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {SimpleDelegateContract} from "../src/SimpleDelegateContract.sol";
import {ERC20} from "../src/SimpleDelegateContract.sol";

contract SignDelegationScript is Script {
    // Alice's address and private key (EOA with no initial contract code).
    address payable ALICE_ADDRESS = payable(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
    uint256 constant ALICE_PK = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

    // Bob's address and private key (Bob will execute transactions on Alice's behalf).
    address bob_adress;
    uint256 bob_priv_key;

    // Deployer's address and private key (used to deploy contracts).
    uint256 private deployer_priv_key = vm.envUint("PRIVATE_KEY");

    // The contract that Alice will delegate execution to.
    SimpleDelegateContract public implementation;

    // ERC-20 token contract for minting test tokens.
    ERC20 public token;

    function run() external {
        console.log("Deployer address: ", vm.addr(deployer_priv_key));
        bob_priv_key = deployer_priv_key;
        bob_adress = vm.addr(bob_priv_key);

        // Step 1: Deploy delegation and ERC-20 contracts using the Deployer's key.
        vm.startBroadcast(deployer_priv_key);
        implementation = new SimpleDelegateContract();
        // implementation = SimpleDelegateContract(payable(0xb95B715c28A78747f817107f84A5F3f6e5350aEE));
        console.log("Delegation contract deployed at: ", address(implementation));
        token = new ERC20(ALICE_ADDRESS);
        // token = ERC20(0x5fA8e10D54B39DC9C1bEdE5b93e09Ec52cDc286E);
        console.log("ERC-20 contract deployed at: ", address(token));
        vm.stopBroadcast();

        // Construct a single transaction call: Mint 100 tokens to Bob.
        SimpleDelegateContract.Call[] memory calls = new SimpleDelegateContract.Call[](1);
        bytes memory data = abi.encodeCall(ERC20.mint, (100, bob_adress));
        calls[0] = SimpleDelegateContract.Call({to: address(token), data: data, value: 0});

        // Alice signs a delegation allowing `implementation` to execute transactions on her behalf.
        Vm.SignedDelegation memory signedDelegation = vm.signDelegation(address(implementation), ALICE_PK);
        console.log("Signed delegation: ", signedDelegation.implementation);
        console.log("Signed delegation: ", signedDelegation.nonce);
        console.log("Signed delegation: ", signedDelegation.v);
        console.log("Signed delegation: ", uint256(signedDelegation.r));
        console.log("Signed delegation: ", uint256(signedDelegation.s));

        // Bob attaches the signed delegation from Alice and broadcasts it.
        console.log("Bob attaches the signed delegation from Alice and broadcasts it");
        vm.broadcast(bob_priv_key);
        vm.attachDelegation(signedDelegation);

        // As Bob, execute the transaction via Alice's assigned contract.
        SimpleDelegateContract(ALICE_ADDRESS).execute(calls);

        // Verify balance
        vm.assertEq(token.balanceOf(bob_adress), 100);
    }
}
