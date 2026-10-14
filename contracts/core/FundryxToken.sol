// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FundryxToken
/// @notice Test ERC-20 for Fundryx protocol on Polygon Amoy testnet
/// @dev Mintable by owner for testnet use. No rebasing, no fee-on-transfer.
contract FundryxToken is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;

    constructor(address initialOwner)
        ERC20("Fundryx Token", "FDX")
        Ownable(initialOwner)
    {}

    /// @notice Mint tokens (testnet only)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from sender
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
}
