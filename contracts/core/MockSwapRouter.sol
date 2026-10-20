// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MockSwapRouter
/// @notice Clearly labeled testnet-only AMM for Polygon Amoy
/// @dev Constant product (x * y = k) with 0.30% fee. For demonstration on testnet only.
contract MockSwapRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    string public constant ROUTER_TYPE = "TESTNET_MOCK_AMM_AMOY";

    // Pair reserves: token0 => token1 => reserve
    mapping(address => mapping(address => uint256)) public reserves;

    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );

    event LiquidityAdded(
        address indexed provider,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    );

    error ZeroAmount();
    error IdenticalTokens();
    error InsufficientLiquidity();
    error InsufficientOutputAmount(uint256 amountOut, uint256 minAmountOut);
    error Expired();

    /// @notice Add initial or additional reserves for a pair
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        if (tokenA == tokenB) revert IdenticalTokens();
        if (amountA == 0 || amountB == 0) revert ZeroAmount();

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        reserves[tokenA][tokenB] += amountA;
        reserves[tokenB][tokenA] += amountB;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB);
    }

    /// @notice Get expected output and estimated price impact (in basis points)
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256 amountOut, uint256 priceImpactBps) {
        if (amountIn == 0) return (0, 0);

        uint256 reserveIn = reserves[tokenIn][tokenOut];
        uint256 reserveOut = reserves[tokenOut][tokenIn];

        if (reserveIn == 0 || reserveOut == 0) return (0, 0);

        // Constant product with 30 bps fee: (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        amountOut = numerator / denominator;

        // Price impact estimate: (amountIn / (reserveIn + amountIn)) * 10000
        priceImpactBps = (amountIn * 10000) / (reserveIn + amountIn);
    }

    /// @notice Execute swap with minimum output slippage protection
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external nonReentrant returns (uint256 amountOut) {
        if (tokenIn == tokenOut) revert IdenticalTokens();
        if (amountIn == 0) revert ZeroAmount();
        if (to == address(0)) to = msg.sender;

        uint256 priceImpactBps;
        (amountOut, priceImpactBps) = getAmountOut(tokenIn, tokenOut, amountIn);

        if (amountOut == 0) revert InsufficientLiquidity();
        if (amountOut < minAmountOut) revert InsufficientOutputAmount(amountOut, minAmountOut);

        // Transfer tokenIn from caller
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Update reserves
        reserves[tokenIn][tokenOut] += amountIn;
        reserves[tokenOut][tokenIn] -= amountOut;

        // Transfer tokenOut to recipient
        IERC20(tokenOut).safeTransfer(to, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, to);
    }

    /// @notice Helper to check reserves of a pair
    function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB) {
        reserveA = reserves[tokenA][tokenB];
        reserveB = reserves[tokenB][tokenA];
    }
}
