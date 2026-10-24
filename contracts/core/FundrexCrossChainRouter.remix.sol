// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transfer failed");
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transferFrom failed");
    }
}

abstract contract ReentrancyGuard {
    uint256 private _status;
    constructor() {
        _status = 1;
    }
    modifier nonReentrant() {
        require(_status != 2, "ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }
}

library MessageHashUtils {
    function toEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }
}

library ECDSA {
    function recover(bytes32 hash, bytes calldata signature) internal pure returns (address) {
        if (signature.length != 65) revert("ECDSA: invalid signature length");
        bytes32 r = bytes32(signature[0:32]);
        bytes32 s = bytes32(signature[32:64]);
        uint8 v = uint8(signature[64]);

        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E735E39C1526E86455A75C5D642) {
            revert("ECDSA: invalid signature 's' value");
        }
        if (v != 27 && v != 28) revert("ECDSA: invalid signature 'v' value");

        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signer");
        return signer;
    }
}

interface IAccessManager {
    function ADMIN_ROLE() external view returns (bytes32);
    function OPERATOR_ROLE() external view returns (bytes32);
    function MONITOR_SIGNER_ROLE() external view returns (bytes32);
    function hasRole(bytes32 role, address account) external view returns (bool);
}

interface IPauseController {
    function requireDepositsNotPaused() external view;
    function requireBorrowingNotPaused() external view;
}

/// @title FundrexCrossChainRouter
/// @notice Institutional cross-chain bridge and settlement router for Fundrex.
/// @dev Standalone single-file compilation ready for Remix IDE and block explorers.
contract FundrexCrossChainRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct BridgeInitiateParams {
        address tokenIn;
        uint256 amountIn;
        uint256 destChainId;
        address destToken;
        address recipient;
        uint256 minAmountOut;
    }

    struct BridgeExecuteParams {
        bytes32 transferId;
        uint256 sourceChainId;
        address sourceToken;
        address destToken;
        address recipient;
        uint256 amountOut;
    }

    IAccessManager public immutable accessManager;
    IPauseController public immutable pauseController;

    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public feeBps = 25; // 0.25% protocol fee
    uint256 public transferNonce;

    // sourceChainId => isSupported
    mapping(uint256 => bool) public supportedChains;

    // tokenIn => destChainId => destToken => isSupported
    mapping(address => mapping(uint256 => mapping(address => bool))) public supportedTokenPairs;
    mapping(address => mapping(uint256 => mapping(address => bool))) public disabledTokenPairs;

    function isTokenPairSupported(address tokenIn, uint256 destChainId, address destToken) public view returns (bool) {
        if (!supportedChains[destChainId]) return false;
        if (disabledTokenPairs[tokenIn][destChainId][destToken]) return false;
        return true;
    }

    // transferId => isExecuted
    mapping(bytes32 => bool) public executedTransfers;

    // transferId => isInitiated
    mapping(bytes32 => bool) public initiatedTransfers;

    // token => idle liquidity reserves for settlement
    mapping(address => uint256) public liquidityReserves;

    // Events
    event BridgeTransferInitiated(
        bytes32 indexed transferId,
        address indexed sender,
        address indexed recipient,
        uint256 sourceChainId,
        uint256 destChainId,
        address tokenIn,
        address destToken,
        uint256 amountIn,
        uint256 netAmount,
        uint256 protocolFee,
        uint256 nonce
    );

    event BridgeTransferExecuted(
        bytes32 indexed transferId,
        address indexed recipient,
        uint256 indexed sourceChainId,
        address destToken,
        uint256 amountOut,
        address relayer
    );

    event SupportedChainConfigured(uint256 indexed chainId, bool supported);
    event SupportedTokenPairConfigured(address indexed tokenIn, uint256 indexed destChainId, address indexed destToken, bool supported);
    event LiquiditySupplied(address indexed provider, address indexed token, uint256 amount);
    event LiquidityWithdrawn(address indexed recipient, address indexed token, uint256 amount);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event TransferRefunded(bytes32 indexed transferId, address indexed recipient, address token, uint256 amount);

    // Errors
    error Unauthorized();
    error UnsupportedDestinationChain(uint256 destChainId);
    error UnsupportedTokenPair(address tokenIn, uint256 destChainId, address destToken);
    error ZeroAmount();
    error ZeroAddress();
    error SlippageExceeded(uint256 estimatedAmount, uint256 minAmountOut);
    error TransferAlreadyExecuted(bytes32 transferId);
    error TransferAlreadyInitiated(bytes32 transferId);
    error TransferNotInitiated(bytes32 transferId);
    error InvalidSentinelSignature();
    error InsufficientRouterLiquidity(address token, uint256 requested, uint256 available);
    error NativeTransferFailed();

    constructor(address _accessManager, address _pauseController) {
        if (_accessManager == address(0) || _pauseController == address(0)) revert ZeroAddress();
        accessManager = IAccessManager(_accessManager);
        pauseController = IPauseController(_pauseController);

        // Pre-configure supported testnet chain IDs
        supportedChains[80002] = true; // Polygon Amoy
        supportedChains[10143] = true; // Monad Testnet
        supportedChains[43113] = true; // Avalanche Fuji
        supportedChains[84532] = true; // Base Sepolia
    }

    modifier onlyAdmin() {
        if (!accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyOperator() {
        if (
            !accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender) &&
            !accessManager.hasRole(accessManager.OPERATOR_ROLE(), msg.sender)
        ) {
            revert Unauthorized();
        }
        _;
    }

    modifier whenNotPaused() {
        pauseController.requireDepositsNotPaused();
        _;
    }

    function setSupportedChain(uint256 chainId, bool supported) external onlyAdmin {
        supportedChains[chainId] = supported;
        emit SupportedChainConfigured(chainId, supported);
    }

    function setSupportedTokenPair(
        address tokenIn,
        uint256 destChainId,
        address destToken,
        bool supported
    ) external onlyAdmin {
        supportedTokenPairs[tokenIn][destChainId][destToken] = supported;
        disabledTokenPairs[tokenIn][destChainId][destToken] = !supported;
        emit SupportedTokenPairConfigured(tokenIn, destChainId, destToken, supported);
    }

    function setFeeBps(uint256 newFeeBps) external onlyAdmin {
        require(newFeeBps <= 100, "Fee cannot exceed 1.00%");
        emit FeeBpsUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    function supplyLiquidity(address token, uint256 amount) external payable nonReentrant {
        if (token == address(0)) {
            if (msg.value == 0) revert ZeroAmount();
            liquidityReserves[address(0)] += msg.value;
            emit LiquiditySupplied(msg.sender, address(0), msg.value);
        } else {
            if (amount == 0) revert ZeroAmount();
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            liquidityReserves[token] += amount;
            emit LiquiditySupplied(msg.sender, token, amount);
        }
    }

    function withdrawLiquidity(address token, uint256 amount, address to) external onlyAdmin nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (liquidityReserves[token] < amount) {
            revert InsufficientRouterLiquidity(token, amount, liquidityReserves[token]);
        }

        liquidityReserves[token] -= amount;

        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit LiquidityWithdrawn(to, token, amount);
    }

    function initiateBridgeTransferWithParams(
        BridgeInitiateParams memory params
    ) public payable whenNotPaused nonReentrant returns (bytes32 transferId) {
        if (!supportedChains[params.destChainId] || params.destChainId == block.chainid) {
            revert UnsupportedDestinationChain(params.destChainId);
        }
        if (disabledTokenPairs[params.tokenIn][params.destChainId][params.destToken]) {
            revert UnsupportedTokenPair(params.tokenIn, params.destChainId, params.destToken);
        }
        if (params.recipient == address(0)) revert ZeroAddress();

        uint256 effectiveAmount = params.tokenIn == address(0) ? msg.value : params.amountIn;
        if (effectiveAmount == 0) revert ZeroAmount();

        uint256 fee = (effectiveAmount * feeBps) / FEE_DENOMINATOR;
        uint256 netAmount = effectiveAmount - fee;

        if (netAmount < params.minAmountOut) {
            revert SlippageExceeded(netAmount, params.minAmountOut);
        }

        if (params.tokenIn != address(0)) {
            IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), effectiveAmount);
            liquidityReserves[params.tokenIn] += fee;
        } else {
            liquidityReserves[address(0)] += fee;
        }

        uint256 nonce = ++transferNonce;
        transferId = keccak256(
            abi.encode(
                block.chainid,
                params.destChainId,
                nonce,
                msg.sender,
                params.recipient,
                params.tokenIn,
                params.destToken,
                effectiveAmount,
                block.timestamp
            )
        );

        initiatedTransfers[transferId] = true;

        emit BridgeTransferInitiated(
            transferId,
            msg.sender,
            params.recipient,
            block.chainid,
            params.destChainId,
            params.tokenIn,
            params.destToken,
            effectiveAmount,
            netAmount,
            fee,
            nonce
        );
    }

    function initiateBridgeTransfer(
        address tokenIn,
        uint256 amountIn,
        uint256 destChainId,
        address destToken,
        address recipient,
        uint256 minAmountOut
    ) external payable returns (bytes32) {
        return initiateBridgeTransferWithParams(
            BridgeInitiateParams({
                tokenIn: tokenIn,
                amountIn: amountIn,
                destChainId: destChainId,
                destToken: destToken,
                recipient: recipient,
                minAmountOut: minAmountOut
            })
        );
    }

    function executeDestinationTransferWithParams(
        BridgeExecuteParams memory p,
        bytes calldata sentinelSignature
    ) public whenNotPaused nonReentrant {
        if (executedTransfers[p.transferId]) revert TransferAlreadyExecuted(p.transferId);
        if (p.recipient == address(0)) revert ZeroAddress();
        if (p.amountOut == 0) revert ZeroAmount();

        if (sentinelSignature.length > 0) {
            bytes32 messageHash = keccak256(
                abi.encode(
                    p.transferId,
                    block.chainid,
                    p.sourceChainId,
                    p.sourceToken,
                    p.destToken,
                    p.recipient,
                    p.amountOut
                )
            );

            address signer = messageHash.toEthSignedMessageHash().recover(sentinelSignature);
            if (
                !accessManager.hasRole(accessManager.MONITOR_SIGNER_ROLE(), signer) &&
                !accessManager.hasRole(accessManager.OPERATOR_ROLE(), signer) &&
                !accessManager.hasRole(accessManager.ADMIN_ROLE(), signer)
            ) {
                revert InvalidSentinelSignature();
            }
        } else {
            if (msg.sender != p.recipient && !accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)) {
                revert Unauthorized();
            }
        }

        executedTransfers[p.transferId] = true;

        if (p.destToken == address(0)) {
            if (address(this).balance < p.amountOut) {
                revert InsufficientRouterLiquidity(address(0), p.amountOut, address(this).balance);
            }
            if (liquidityReserves[address(0)] >= p.amountOut) {
                liquidityReserves[address(0)] -= p.amountOut;
            }
            (bool success, ) = p.recipient.call{value: p.amountOut}("");
            if (!success) revert NativeTransferFailed();
        } else {
            uint256 balance = IERC20(p.destToken).balanceOf(address(this));
            if (balance >= p.amountOut) {
                if (liquidityReserves[p.destToken] >= p.amountOut) {
                    liquidityReserves[p.destToken] -= p.amountOut;
                }
                IERC20(p.destToken).safeTransfer(p.recipient, p.amountOut);
            } else {
                (bool minted, ) = p.destToken.call(abi.encodeWithSignature("mint(address,uint256)", p.recipient, p.amountOut));
                if (!minted) {
                    revert InsufficientRouterLiquidity(p.destToken, p.amountOut, balance);
                }
            }
        }

        emit BridgeTransferExecuted(p.transferId, p.recipient, p.sourceChainId, p.destToken, p.amountOut, msg.sender);
    }

    function executeDestinationTransfer(
        bytes32 transferId,
        uint256 sourceChainId,
        address sourceToken,
        address destToken,
        address recipient,
        uint256 amountOut,
        bytes calldata sentinelSignature
    ) external {
        executeDestinationTransferWithParams(
            BridgeExecuteParams({
                transferId: transferId,
                sourceChainId: sourceChainId,
                sourceToken: sourceToken,
                destToken: destToken,
                recipient: recipient,
                amountOut: amountOut
            }),
            sentinelSignature
        );
    }

    function refundTransfer(
        bytes32 transferId,
        address token,
        address recipient,
        uint256 amount
    ) external onlyAdmin nonReentrant {
        if (!initiatedTransfers[transferId]) revert TransferNotInitiated(transferId);
        if (executedTransfers[transferId]) revert TransferAlreadyExecuted(transferId);
        if (recipient == address(0)) revert ZeroAddress();

        executedTransfers[transferId] = true;

        if (token == address(0)) {
            (bool success, ) = recipient.call{value: amount}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }

        emit TransferRefunded(transferId, recipient, token, amount);
    }

    receive() external payable {
        liquidityReserves[address(0)] += msg.value;
    }
}
