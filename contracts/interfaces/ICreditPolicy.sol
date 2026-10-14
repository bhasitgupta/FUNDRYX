// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
