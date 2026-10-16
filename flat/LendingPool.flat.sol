// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 >=0.6.2 ^0.8.20 ^0.8.24;

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

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// contracts/interfaces/ILendingPool.sol

/// @title ILendingPool
/// @notice Interface for the Fundryx lending pool with full loan lifecycle
interface ILendingPool {
    enum LoanStatus {
        None,
        Active,
        Repaid,
        Overdue,
        Defaulted
    }

    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 principalInitial;
        uint256 principalOutstanding;
        uint256 feeAmount;
        uint64 createdAt;
        uint64 dueAt;
        LoanStatus status;
        uint32 policyVersion;
    }

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 fee,
        uint64 dueAt,
        uint32 policyVersion
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 remainingPrincipal,
        bool isFullRepayment
    );

    event LoanStatusChanged(
        uint256 indexed loanId,
        address indexed borrower,
        LoanStatus oldStatus,
        LoanStatus newStatus
    );

    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);

    /// @notice Lender deposits liquidity into the pool
    function deposit(uint256 amount) external;

    /// @notice Lender withdraws available liquidity
    function withdraw(uint256 amount) external;

    /// @notice Borrower takes a loan
    /// @param amount The principal amount to borrow
    /// @param policyVersion The expected policy version (front-running protection)
    function borrow(uint256 amount, uint32 policyVersion) external;

    /// @notice Borrower repays a loan (partial or full)
    /// @param loanId The loan to repay
    /// @param amount The repayment amount
    function repay(uint256 loanId, uint256 amount) external;

    /// @notice Mark a loan as overdue (callable by anyone after due date)
    function markOverdue(uint256 loanId) external;

    /// @notice Mark an overdue loan as defaulted (callable by anyone after grace period)
    function markDefaulted(uint256 loanId) external;

    /// @notice Get loan details
    function getLoan(uint256 loanId) external view returns (Loan memory);

    /// @notice Get total available liquidity
    function availableLiquidity() external view returns (uint256);

    /// @notice Get total outstanding debt
    function totalOutstandingDebt() external view returns (uint256);
}

// lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// lib/openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/extensions/IERC20Metadata.sol)

/**
 * @dev Interface for the optional metadata functions from the ERC-20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// contracts/core/PauseController.sol

/// @title PauseController
/// @notice Emergency pause for Fundryx protocol
/// @dev Pause blocks risk-increasing actions. Safe repayment always allowed.
contract PauseController {
    AccessManager public immutable accessManager;

    bool public borrowingPaused;
    bool public depositsPaused;

    error BorrowingIsPaused();
    error DepositsArePaused();
    error Unauthorized();

    event PauseStateChanged(string indexed action, bool paused, address indexed changedBy);

    constructor(address _accessManager) {
        accessManager = AccessManager(_accessManager);
    }

    modifier onlyAdminOrOperator() {
        if (
            !accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)
                && !accessManager.hasRole(accessManager.OPERATOR_ROLE(), msg.sender)
        ) {
            revert Unauthorized();
        }
        _;
    }

    /// @notice Pause or unpause borrowing
    function setBorrowingPaused(bool paused) external onlyAdminOrOperator {
        borrowingPaused = paused;
        emit PauseStateChanged("borrowing", paused, msg.sender);
    }

    /// @notice Pause or unpause deposits
    function setDepositsPaused(bool paused) external onlyAdminOrOperator {
        depositsPaused = paused;
        emit PauseStateChanged("deposits", paused, msg.sender);
    }

    /// @notice Revert if borrowing is paused
    function requireBorrowingNotPaused() external view {
        if (borrowingPaused) revert BorrowingIsPaused();
    }

    /// @notice Revert if deposits are paused
    function requireDepositsNotPaused() external view {
        if (depositsPaused) revert DepositsArePaused();
    }
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
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

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.7.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _safeTransfer(token, to, value, false);
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _safeTransferFrom(token, from, to, value, false);
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Oppositely, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /// @dev Attempts to fetch the token decimals. A return value of false indicates that the attempt failed in some way.
    function tryGetDecimals(IERC20 token) internal view returns (bool success, uint8 decimals) {
        bytes4 selector = IERC20Metadata.decimals.selector;
        assembly ("memory-safe") {
            mstore(0x00, selector)
            success := staticcall(gas(), token, 0x00, 4, 0x00, 0x20)
            success := and(and(success, gt(returndatasize(), 0x1f)), lt(mload(0x00), 0x100))
            decimals := mul(success, mload(0x00))
        }
    }

    /**
     * @dev Imitates a Solidity `token.transfer(to, value)` call, relaxing the requirement on the return value: the
     * return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    /**
     * @dev Imitates a Solidity `token.transferFrom(from, to, value)` call, relaxing the requirement on the return
     * value: the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param from The sender of the tokens
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value,
        bool bubble
    ) private returns (bool success) {
        bytes4 selector = IERC20.transferFrom.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(from, shr(96, not(0))))
            mstore(0x24, and(to, shr(96, not(0))))
            mstore(0x44, value)
            success := call(gas(), token, 0, 0x00, 0x64, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    /**
     * @dev Imitates a Solidity `token.approve(spender, value)` call, relaxing the requirement on the return value:
     * the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param spender The spender of the tokens
     * @param value The amount of token to approve
     * @param bubble Behavior switch if the approve call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}

// contracts/lending/LendingPool.sol

/// @title LendingPool
/// @notice Token custody and full loan lifecycle for Fundryx lending
/// @dev Checks-effects-interactions pattern. SafeERC20. Reentrancy guard.
contract LendingPool is ILendingPool, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────
    AccessManager public immutable accessManager;
    PauseController public immutable pauseController;
    CreditPolicy public immutable creditPolicy;
    CreditHistoryRegistry public immutable historyRegistry;
    IERC20 public immutable token;

    uint256 public nextLoanId;
    uint256 public totalDeposits;
    uint256 public totalBorrowed; // currently outstanding
    uint256 public defaultGracePeriod; // seconds after dueAt before default

    mapping(uint256 => Loan) private _loans;
    mapping(address => uint256) public lenderBalances;
    mapping(address => uint256[]) private _borrowerLoans;

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────
    error Unauthorized();
    error ZeroAmount();
    error InsufficientLiquidity(uint256 requested, uint256 available);
    error CreditCapExceeded(uint256 requested, uint256 eligible);
    error PolicyVersionMismatch(uint32 expected, uint32 current);
    error LoanNotFound(uint256 loanId);
    error LoanNotActive(uint256 loanId);
    error LoanNotOverdue(uint256 loanId);
    error LoanNotPastGrace(uint256 loanId);
    error RepaymentExceedsDebt(uint256 repayment, uint256 debt);
    error NotBorrower(uint256 loanId, address caller);
    error WithdrawExceedsBalance(uint256 requested, uint256 balance);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────
    constructor(
        address _accessManager,
        address _pauseController,
        address _creditPolicy,
        address _historyRegistry,
        address _token,
        uint256 _defaultGracePeriod
    ) {
        accessManager = AccessManager(_accessManager);
        pauseController = PauseController(_pauseController);
        creditPolicy = CreditPolicy(_creditPolicy);
        historyRegistry = CreditHistoryRegistry(_historyRegistry);
        token = IERC20(_token);
        defaultGracePeriod = _defaultGracePeriod;
        nextLoanId = 1;
    }

    // ──────────────────────────────────────────────
    // Lender functions
    // ──────────────────────────────────────────────

    /// @inheritdoc ILendingPool
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        pauseController.requireDepositsNotPaused();

        lenderBalances[msg.sender] += amount;
        totalDeposits += amount;

        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);
    }

    /// @inheritdoc ILendingPool
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (lenderBalances[msg.sender] < amount) {
            revert WithdrawExceedsBalance(amount, lenderBalances[msg.sender]);
        }

        uint256 available = availableLiquidity();
        if (available < amount) revert InsufficientLiquidity(amount, available);

        lenderBalances[msg.sender] -= amount;
        totalDeposits -= amount;

        token.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    // ──────────────────────────────────────────────
    // Borrower functions
    // ──────────────────────────────────────────────

    /// @inheritdoc ILendingPool
    function borrow(uint256 amount, uint32 expectedPolicyVersion) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        // 1. Pause check
        pauseController.requireBorrowingNotPaused();

        // 2. Policy version check
        uint32 currentVersion = creditPolicy.policyVersion();
        if (expectedPolicyVersion != currentVersion) {
            revert PolicyVersionMismatch(expectedPolicyVersion, currentVersion);
        }

        // 3. Credit eligibility (recomputed at execution, not frontend preview)
        (uint256 eligible,) = creditPolicy.eligibleCredit(msg.sender, bytes32(0));
        if (amount > eligible) revert CreditCapExceeded(amount, eligible);

        // 4. Pool liquidity
        uint256 available = availableLiquidity();
        if (amount > available) revert InsufficientLiquidity(amount, available);

        // 5. Calculate fee
        uint256 fee = creditPolicy.calculateFee(amount);

        // 6. Read loan duration from policy config
        // Using configurable duration: admin sets via setLoanDuration
        uint64 duration = loanDuration;
        uint64 dueAt = uint64(block.timestamp) + duration;

        // 7. Create loan (effects before interactions)
        uint256 loanId = nextLoanId++;
        _loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            principalInitial: amount,
            principalOutstanding: amount + fee,
            feeAmount: fee,
            createdAt: uint64(block.timestamp),
            dueAt: dueAt,
            status: LoanStatus.Active,
            policyVersion: currentVersion
        });

        _borrowerLoans[msg.sender].push(loanId);
        totalBorrowed += amount;

        // 8. Update exposure in history registry
        historyRegistry.updateExposure(
            msg.sender,
            historyRegistry.getBorrowerStats(msg.sender).outstandingExposure + amount
        );

        // 9. Transfer tokens to borrower (interaction last)
        token.safeTransfer(msg.sender, amount);

        emit LoanCreated(loanId, msg.sender, amount, fee, dueAt, currentVersion);
    }

    /// @inheritdoc ILendingPool
    function repay(uint256 loanId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        Loan storage loan = _loans[loanId];
        if (loan.status == LoanStatus.None) revert LoanNotFound(loanId);
        if (loan.status != LoanStatus.Active && loan.status != LoanStatus.Overdue) {
            revert LoanNotActive(loanId);
        }

        if (amount > loan.principalOutstanding) {
            revert RepaymentExceedsDebt(amount, loan.principalOutstanding);
        }

        bool isFullRepayment = (amount == loan.principalOutstanding);

        // Effects
        loan.principalOutstanding -= amount;

        if (isFullRepayment) {
            LoanStatus oldStatus = loan.status;
            loan.status = LoanStatus.Repaid;
            emit LoanStatusChanged(loanId, loan.borrower, oldStatus, LoanStatus.Repaid);
        }

        // Update protocol accounting
        // Reduce totalBorrowed by principal portion only (not fee portion)
        uint256 principalPortion = amount;
        if (loan.feeAmount > 0 && loan.principalOutstanding == 0) {
            // Full repayment: reduce totalBorrowed by initial principal
            principalPortion = loan.principalInitial;
            totalBorrowed -= loan.principalInitial;
        } else if (amount <= loan.principalInitial) {
            totalBorrowed -= amount;
        }

        // Update exposure
        uint256 currentExposure = historyRegistry.getBorrowerStats(loan.borrower).outstandingExposure;
        uint256 exposureReduction = amount > currentExposure ? currentExposure : amount;
        historyRegistry.updateExposure(loan.borrower, currentExposure - exposureReduction);

        // Record in history (only full repayment counts as completed)
        historyRegistry.recordRepayment(loan.borrower, loanId, amount, isFullRepayment);

        // Interaction: pull tokens from borrower
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit LoanRepaid(loanId, loan.borrower, amount, loan.principalOutstanding, isFullRepayment);
    }

    // ──────────────────────────────────────────────
    // Status transitions (callable by anyone after conditions met)
    // ──────────────────────────────────────────────

    /// @inheritdoc ILendingPool
    function markOverdue(uint256 loanId) external {
        Loan storage loan = _loans[loanId];
        if (loan.status != LoanStatus.Active) revert LoanNotActive(loanId);
        if (block.timestamp <= loan.dueAt) revert LoanNotOverdue(loanId);

        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.Overdue;
        emit LoanStatusChanged(loanId, loan.borrower, oldStatus, LoanStatus.Overdue);
    }

    /// @inheritdoc ILendingPool
    function markDefaulted(uint256 loanId) external {
        Loan storage loan = _loans[loanId];
        if (loan.status != LoanStatus.Overdue) revert LoanNotActive(loanId);
        if (block.timestamp <= loan.dueAt + defaultGracePeriod) {
            revert LoanNotPastGrace(loanId);
        }

        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.Defaulted;

        // Record default in history
        historyRegistry.recordDefault(loan.borrower, loanId, loan.principalOutstanding);

        emit LoanStatusChanged(loanId, loan.borrower, oldStatus, LoanStatus.Defaulted);
    }

    // ──────────────────────────────────────────────
    // View functions
    // ──────────────────────────────────────────────

    /// @inheritdoc ILendingPool
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return _loans[loanId];
    }

    /// @inheritdoc ILendingPool
    function availableLiquidity() public view returns (uint256) {
        if (totalDeposits <= totalBorrowed) return 0;
        return totalDeposits - totalBorrowed;
    }

    /// @inheritdoc ILendingPool
    function totalOutstandingDebt() external view returns (uint256) {
        return totalBorrowed;
    }

    /// @notice Get all loan IDs for a borrower
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return _borrowerLoans[borrower];
    }

    // ──────────────────────────────────────────────
    // Admin
    // ──────────────────────────────────────────────

    uint64 public loanDuration = 30 days; // default, configurable

    /// @notice Set loan duration (admin only)
    function setLoanDuration(uint64 duration) external {
        if (!accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)) revert Unauthorized();
        loanDuration = duration;
    }

    /// @notice Set default grace period (admin only)
    function setDefaultGracePeriod(uint256 period) external {
        if (!accessManager.hasRole(accessManager.ADMIN_ROLE(), msg.sender)) revert Unauthorized();
        defaultGracePeriod = period;
    }
}

