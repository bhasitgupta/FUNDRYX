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

