// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
