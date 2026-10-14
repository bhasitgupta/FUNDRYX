// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessManager} from "../core/AccessManager.sol";
import {ICreditHistoryRegistry} from "../interfaces/ICreditHistoryRegistry.sol";

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
