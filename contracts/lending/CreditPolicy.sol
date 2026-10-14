// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessManager} from "../core/AccessManager.sol";
import {ICreditPolicy} from "../interfaces/ICreditPolicy.sol";
import {ICreditHistoryRegistry} from "../interfaces/ICreditHistoryRegistry.sol";

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
