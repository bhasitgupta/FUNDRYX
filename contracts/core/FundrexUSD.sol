// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FundrexUSD (fUSD)
/// @notice Dedicated test stable-value asset for Fundrex protocol lending, borrowing, and swaps
/// @dev 6 decimals, restricted test minting for authorization and faucet controls.
contract FundrexUSD is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;

    event FaucetMint(address indexed to, uint256 amount);

    constructor(address initialOwner)
        ERC20("Fundrex USD", "fUSD")
        Ownable(initialOwner)
    {}

    /// @notice Mint tokens (restricted to owner or authorized caller)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit FaucetMint(to, amount);
    }

    /// @notice Burn tokens from sender's own balance
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Explicit 6-decimals precision matching USDC standards
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
}
