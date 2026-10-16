// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// contracts/core/AccessManager.sol

/// @title AccessManager
/// @notice Role-based access control for Fundryx protocol
/// @dev Admin cannot bypass financial invariants. Monitor key cannot hold admin/pauser/treasury roles.
contract AccessManager {
    // ──────────────────────────────────────────────
    // Roles
    // ──────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant LENDING_POOL_ROLE = keccak256("LENDING_POOL_ROLE");
    bytes32 public constant MONITOR_SIGNER_ROLE = keccak256("MONITOR_SIGNER_ROLE");

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────
    mapping(bytes32 => mapping(address => bool)) private _roles;
    address public owner;

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────
    error Unauthorized(address account, bytes32 role);
    error ZeroAddress();
    error MonitorCannotBeAdmin(address account);
    error DuplicateAdmin();

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed grantedBy);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed revokedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────
    constructor(address initialAdmin1, address initialAdmin2) {
        if (initialAdmin1 == address(0) || initialAdmin2 == address(0)) revert ZeroAddress();
        if (initialAdmin1 == initialAdmin2) revert DuplicateAdmin();
        owner = initialAdmin1;
        _roles[ADMIN_ROLE][initialAdmin1] = true;
        _roles[ADMIN_ROLE][initialAdmin2] = true;
        emit RoleGranted(ADMIN_ROLE, initialAdmin1, address(0));
        emit RoleGranted(ADMIN_ROLE, initialAdmin2, address(0));
    }

    // ──────────────────────────────────────────────
    // Modifiers
    // ──────────────────────────────────────────────
    modifier onlyRole(bytes32 role) {
        if (!_roles[role][msg.sender]) revert Unauthorized(msg.sender, role);
        _;
    }

    modifier onlyAdmin() {
        if (!_roles[ADMIN_ROLE][msg.sender]) revert Unauthorized(msg.sender, ADMIN_ROLE);
        _;
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Grant a role to an account
    /// @dev Monitor signer cannot also hold admin, operator, or lending pool roles
    function grantRole(bytes32 role, address account) external onlyAdmin {
        if (account == address(0)) revert ZeroAddress();

        // Enforce separation: monitor signer cannot be admin/operator/lending pool
        if (role == MONITOR_SIGNER_ROLE) {
            if (_roles[ADMIN_ROLE][account] || _roles[OPERATOR_ROLE][account] || _roles[LENDING_POOL_ROLE][account]) {
                revert MonitorCannotBeAdmin(account);
            }
        }

        // Prevent granting admin/operator/lending pool to existing monitor signer
        if (
            (role == ADMIN_ROLE || role == OPERATOR_ROLE || role == LENDING_POOL_ROLE)
                && _roles[MONITOR_SIGNER_ROLE][account]
        ) {
            revert MonitorCannotBeAdmin(account);
        }

        _roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    /// @notice Revoke a role from an account
    function revokeRole(bytes32 role, address account) external onlyAdmin {
        _roles[role][account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    /// @notice Check if an account has a specific role
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[role][account];
    }

    /// @notice Transfer ownership (emergency only)
    function transferOwnership(address newOwner) external onlyAdmin {
        if (newOwner == address(0)) revert ZeroAddress();
        address prev = owner;
        owner = newOwner;
        _roles[ADMIN_ROLE][prev] = false;
        _roles[ADMIN_ROLE][newOwner] = true;
        emit OwnershipTransferred(prev, newOwner);
    }
}

// contracts/interfaces/ICreditHistoryRegistry.sol

/// @title ICreditHistoryRegistry
/// @notice Interface for verified credit history records in Fundryx
interface ICreditHistoryRegistry {
    struct BorrowerStats {
        uint64 verifiedRepaymentCount;
        uint256 verifiedRepaidValue;
        uint256 outstandingExposure;
        uint64 defaultCount;
        uint64 lastUpdateAt;
        uint32 policyVersionLastEvaluated;
    }

    /// @notice Record a verified repayment from an authorized source
    /// @param borrower The borrower address
    /// @param loanId The unique loan identifier
    /// @param amount The repayment amount
    /// @param isFullRepayment Whether this fully closes the loan
    function recordRepayment(
        address borrower,
        uint256 loanId,
        uint256 amount,
        bool isFullRepayment
    ) external;

    /// @notice Record a default from an authorized source
    /// @param borrower The borrower address
    /// @param loanId The unique loan identifier
    /// @param outstandingAmount The amount still owed at default
    function recordDefault(
        address borrower,
        uint256 loanId,
        uint256 outstandingAmount
    ) external;

    /// @notice Update outstanding exposure for a borrower
    /// @param borrower The borrower address
    /// @param newExposure The new total outstanding exposure
    function updateExposure(address borrower, uint256 newExposure) external;

    /// @notice Get borrower stats for credit evaluation
    /// @param borrower The borrower address
    /// @return stats The borrower's credit history statistics
    function getBorrowerStats(address borrower)
        external
        view
        returns (BorrowerStats memory stats);
}

// contracts/interfaces/ICreditPolicy.sol

/// @title ICreditPolicy
/// @notice Deterministic, versioned credit eligibility interface for Fundryx lending
interface ICreditPolicy {
    /// @notice Returns the maximum credit amount a borrower is eligible for in a given market
    /// @param borrower The borrower's wallet address
    /// @param marketId The identifier of the lending market
    /// @return amount The maximum eligible credit amount in base token units
    /// @return policyVersion The current policy version used for this calculation
    function eligibleCredit(address borrower, bytes32 marketId)
        external
        view
        returns (uint256 amount, uint32 policyVersion);

    /// @notice Preview eligibility for frontend display (indicative, not authoritative)
    /// @param borrower The borrower's wallet address
    /// @return maxCredit The indicative maximum credit amount
    /// @return policyVersion The current policy version
    /// @return repaymentCount Verified repayment count used in calculation
    /// @return outstandingExposure Current outstanding exposure
    function previewEligibility(address borrower)
        external
        view
        returns (
            uint256 maxCredit,
            uint32 policyVersion,
            uint64 repaymentCount,
            uint256 outstandingExposure
        );
}

// contracts/lending/CreditPolicy.sol

/// @title CreditPolicy
/// @notice Deterministic, versioned credit eligibility formula for Fundryx lending
/// @dev Credit formula:
///   baseLimit = 100e18 tokens
///   perRepaymentBonus = 50e18 per verified repayment (capped at 5 repayments = 250e18 max bonus)
///   defaultPenalty = 200e18 per default
///   creditLimit = max(0, baseLimit + repayments * bonus - defaults * penalty)
///   finalLimit = min(creditLimit, perLoanCap, availablePoolLiquidity, maxExposure - currentExposure)
contract CreditPolicy is ICreditPolicy {
    // ──────────────────────────────────────────────
    // Configuration (versioned)
    // ──────────────────────────────────────────────
    struct PolicyConfig {
        uint256 baseLimit;          // Base credit amount for new borrowers
        uint256 perRepaymentBonus;  // Extra credit per verified repayment
        uint64 maxBonusRepayments;  // Cap on repayments counted for bonus
        uint256 defaultPenalty;     // Credit reduction per default
        uint256 perLoanCap;         // Maximum single loan size
        uint256 maxBorrowerExposure; // Maximum total exposure per borrower
        uint256 maxPoolExposure;    // Maximum total protocol exposure
        uint256 flatFeeBps;         // Flat fee in basis points (100 = 1%)
    }

    AccessManager public immutable accessManager;
    ICreditHistoryRegistry public immutable historyRegistry;

    PolicyConfig public config;
    uint32 public policyVersion;

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────
    error Unauthorized();
    error InvalidConfig();

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────
    event CreditPolicyUpdated(
        uint32 indexed newVersion,
        uint256 baseLimit,
        uint256 perRepaymentBonus,
        uint256 defaultPenalty,
        uint256 perLoanCap,
        uint256 flatFeeBps,
        address indexed updatedBy
    );

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────
    constructor(address _accessManager, address _historyRegistry) {
        accessManager = AccessManager(_accessManager);
        historyRegistry = ICreditHistoryRegistry(_historyRegistry);

        // Default prototype config
        config = PolicyConfig({
            baseLimit: 100e18,
            perRepaymentBonus: 50e18,
            maxBonusRepayments: 5,
            defaultPenalty: 200e18,
            perLoanCap: 500e18,
            maxBorrowerExposure: 1000e18,
            maxPoolExposure: 100_000e18,
            flatFeeBps: 100 // 1%
        });
        policyVersion = 1;
    }

    // ──────────────────────────────────────────────
    // Admin
    // ──────────────────────────────────────────────

    /// @notice Update policy parameters (increments version)
    function updatePolicy(PolicyConfig calldata newConfig) external {
        if (!accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
        if (newConfig.baseLimit == 0 || newConfig.perLoanCap == 0) revert InvalidConfig();

        config = newConfig;
        policyVersion += 1;

        emit CreditPolicyUpdated(
            policyVersion,
            newConfig.baseLimit,
            newConfig.perRepaymentBonus,
            newConfig.defaultPenalty,
            newConfig.perLoanCap,
            newConfig.flatFeeBps,
            msg.sender
        );
    }

    // ──────────────────────────────────────────────
    // ICreditPolicy implementation
    // ──────────────────────────────────────────────

    /// @inheritdoc ICreditPolicy
    function eligibleCredit(address borrower, bytes32 /* marketId */)
        external
        view
        returns (uint256 amount, uint32 version)
    {
        return (_computeCredit(borrower), policyVersion);
    }

    /// @inheritdoc ICreditPolicy
    function previewEligibility(address borrower)
        external
        view
        returns (
            uint256 maxCredit,
            uint32 version,
            uint64 repaymentCount,
            uint256 outstandingExposure
        )
    {
        ICreditHistoryRegistry.BorrowerStats memory stats = historyRegistry.getBorrowerStats(borrower);
        return (
            _computeCredit(borrower),
            policyVersion,
            stats.verifiedRepaymentCount,
            stats.outstandingExposure
        );
    }

    /// @notice Calculate the flat fee for a given loan amount
    function calculateFee(uint256 principal) external view returns (uint256) {
        return (principal * config.flatFeeBps) / 10_000;
    }

    /// @notice Get remaining borrower exposure headroom
    function exposureHeadroom(address borrower) external view returns (uint256) {
        ICreditHistoryRegistry.BorrowerStats memory stats = historyRegistry.getBorrowerStats(borrower);
        if (stats.outstandingExposure >= config.maxBorrowerExposure) return 0;
        return config.maxBorrowerExposure - stats.outstandingExposure;
    }

    // ──────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────

    function _computeCredit(address borrower) internal view returns (uint256) {
        ICreditHistoryRegistry.BorrowerStats memory stats = historyRegistry.getBorrowerStats(borrower);

        // Count repayments up to max bonus cap
        uint64 countedRepayments = stats.verifiedRepaymentCount > config.maxBonusRepayments
            ? config.maxBonusRepayments
            : stats.verifiedRepaymentCount;

        uint256 bonus = uint256(countedRepayments) * config.perRepaymentBonus;
        uint256 penalty = uint256(stats.defaultCount) * config.defaultPenalty;

        uint256 rawLimit;
        if (config.baseLimit + bonus > penalty) {
            rawLimit = config.baseLimit + bonus - penalty;
        } else {
            rawLimit = 0;
        }

        // Cap by per-loan limit
        uint256 capped = rawLimit > config.perLoanCap ? config.perLoanCap : rawLimit;

        // Subtract current exposure
        if (stats.outstandingExposure >= config.maxBorrowerExposure) return 0;
        uint256 exposureRoom = config.maxBorrowerExposure - stats.outstandingExposure;

        return capped > exposureRoom ? exposureRoom : capped;
    }
}

