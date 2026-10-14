// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
