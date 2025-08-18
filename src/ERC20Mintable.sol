// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 token with public minting functionality.
 * Anyone can mint tokens at will.
 */
contract ERC20Mintable is ERC20 {
    uint8 immutable private _decimals;
    /**
     * @dev Constructor that sets up the token with name and symbol.
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints new tokens to the specified address.
     * Anyone can call this function.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @dev Mints new tokens to multiple addresses.
     * Anyone can call this function.
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each recipient
     */
    function mintBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) public {
        require(
            recipients.length == amounts.length,
            "ERC20Mintable: arrays length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Burns tokens from the caller's account.
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specific account (requires allowance).
     * Anyone can call this function if they have allowance.
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) public {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
