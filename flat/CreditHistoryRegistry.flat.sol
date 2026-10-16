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

// contracts/lending/CreditHistoryRegistry.sol

/// @title CreditHistoryRegistry
/// @notice Stores verified repayment/default records for Fundryx borrowers
/// @dev Only authorized sources (LendingPool) can write records. Borrowers cannot self-attest.
contract CreditHistoryRegistry is ICreditHistoryRegistry {
    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────
    AccessManager public immutable accessManager;

    mapping(address => BorrowerStats) private _stats;

    /// @dev Track processed records to prevent duplicates: keccak256(borrower, loanId, recordType)
    mapping(bytes32 => bool) private _processedRecords;

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────
    error Unauthorized();
    error DuplicateRecord(address borrower, uint256 loanId);
    error ZeroBorrower();
    error ZeroAmount();

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────
    event RepaymentRecorded(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 amount,
        bool isFullRepayment,
        uint64 timestamp
    );

    event DefaultRecorded(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 outstandingAmount,
        uint64 timestamp
    );

    event ExposureUpdated(
        address indexed borrower,
        uint256 previousExposure,
        uint256 newExposure
    );

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────
    constructor(address _accessManager) {
        accessManager = AccessManager(_accessManager);
    }

    // ──────────────────────────────────────────────
    // Modifiers
    // ──────────────────────────────────────────────
    modifier onlyLendingPool() {
        if (!accessManager.hasRole(accessManager.LENDING_POOL_ROLE(), msg.sender)) {
            revert Unauthorized();
        }
        _;
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @inheritdoc ICreditHistoryRegistry
    function recordRepayment(
        address borrower,
        uint256 loanId,
        uint256 amount,
        bool isFullRepayment
    ) external onlyLendingPool {
        if (borrower == address(0)) revert ZeroBorrower();
        if (amount == 0) revert ZeroAmount();

        // Duplicate check for full repayments only (partial repayments can happen multiple times per loan)
        if (isFullRepayment) {
            bytes32 recordKey = keccak256(abi.encodePacked(borrower, loanId, "REPAID"));
            if (_processedRecords[recordKey]) revert DuplicateRecord(borrower, loanId);
            _processedRecords[recordKey] = true;

            _stats[borrower].verifiedRepaymentCount += 1;
        }

        _stats[borrower].verifiedRepaidValue += amount;
        _stats[borrower].lastUpdateAt = uint64(block.timestamp);

        emit RepaymentRecorded(borrower, loanId, amount, isFullRepayment, uint64(block.timestamp));
    }

    /// @inheritdoc ICreditHistoryRegistry
    function recordDefault(
        address borrower,
        uint256 loanId,
        uint256 outstandingAmount
    ) external onlyLendingPool {
        if (borrower == address(0)) revert ZeroBorrower();

        bytes32 recordKey = keccak256(abi.encodePacked(borrower, loanId, "DEFAULT"));
        if (_processedRecords[recordKey]) revert DuplicateRecord(borrower, loanId);
        _processedRecords[recordKey] = true;

        _stats[borrower].defaultCount += 1;
        _stats[borrower].lastUpdateAt = uint64(block.timestamp);

        emit DefaultRecorded(borrower, loanId, outstandingAmount, uint64(block.timestamp));
    }

    /// @inheritdoc ICreditHistoryRegistry
    function updateExposure(address borrower, uint256 newExposure) external onlyLendingPool {
        if (borrower == address(0)) revert ZeroBorrower();

        uint256 prev = _stats[borrower].outstandingExposure;
        _stats[borrower].outstandingExposure = newExposure;
        _stats[borrower].lastUpdateAt = uint64(block.timestamp);

        emit ExposureUpdated(borrower, prev, newExposure);
    }

    /// @inheritdoc ICreditHistoryRegistry
    function getBorrowerStats(address borrower)
        external
        view
        returns (BorrowerStats memory stats)
    {
        return _stats[borrower];
    }
}

