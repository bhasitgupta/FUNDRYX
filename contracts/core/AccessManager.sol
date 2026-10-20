// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AccessManager
/// @notice Role-based access control for Fundryx protocol
/// @dev Admin cannot bypass financial invariants. Monitor key cannot hold admin/pauser/treasury roles.
///      Connected wallets self-register as USER_ROLE. Admin separation enforced: admins cannot hold USER_ROLE.
contract AccessManager {
    // ──────────────────────────────────────────────
    // Roles
    // ──────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant LENDING_POOL_ROLE = keccak256("LENDING_POOL_ROLE");
    bytes32 public constant MONITOR_SIGNER_ROLE = keccak256("MONITOR_SIGNER_ROLE");
    /// @notice Standard user role — granted to every connected wallet via self-registration
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

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
    error AdminCannotSelfRegisterAsUser(address account);
    error UserAlreadyRegistered(address account);

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed grantedBy);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed revokedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event UserRegistered(address indexed account);

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
    // User self-registration
    // ──────────────────────────────────────────────

    /// @notice Any non-admin wallet can register itself as a USER.
    /// @dev Reverts if already registered. Admins are explicitly excluded — role separation.
    function registerUser() external {
        if (_roles[ADMIN_ROLE][msg.sender]) revert AdminCannotSelfRegisterAsUser(msg.sender);
        if (_roles[USER_ROLE][msg.sender]) revert UserAlreadyRegistered(msg.sender);
        _roles[USER_ROLE][msg.sender] = true;
        emit UserRegistered(msg.sender);
        emit RoleGranted(USER_ROLE, msg.sender, msg.sender);
    }

    // ──────────────────────────────────────────────
    // External functions
    // ──────────────────────────────────────────────

    /// @notice Grant a role to an account (admin only)
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

        // Admin cannot be assigned USER_ROLE — role separation
        if (role == USER_ROLE && _roles[ADMIN_ROLE][account]) {
            revert AdminCannotSelfRegisterAsUser(account);
        }

        _roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    /// @notice Revoke a role from an account (admin only)
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
