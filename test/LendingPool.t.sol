// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AccessManager} from "../contracts/core/AccessManager.sol";
import {PauseController} from "../contracts/core/PauseController.sol";
import {FundryxToken} from "../contracts/core/FundryxToken.sol";
import {CreditHistoryRegistry} from "../contracts/lending/CreditHistoryRegistry.sol";
import {CreditPolicy} from "../contracts/lending/CreditPolicy.sol";
import {LendingPool} from "../contracts/lending/LendingPool.sol";
import {ILendingPool} from "../contracts/interfaces/ILendingPool.sol";

/// @title LendingPoolTest
/// @notice Unit tests for Fundryx M1 lending lifecycle
contract LendingPoolTest is Test {
    AccessManager accessManager;
    PauseController pauseController;
    FundryxToken token;
    CreditHistoryRegistry historyRegistry;
    CreditPolicy creditPolicy;
    LendingPool lendingPool;

    address admin = address(1);
    address lender = address(2);
    address borrower = address(3);
    address borrower2 = address(4);

    uint256 constant INITIAL_SUPPLY = 1_000_000e18;
    uint256 constant LENDER_DEPOSIT = 100_000e18;

    function setUp() public {
        vm.startPrank(admin);

        accessManager = new AccessManager(admin, address(0x999));
        pauseController = new PauseController(address(accessManager));
        token = new FundryxToken(admin);
        historyRegistry = new CreditHistoryRegistry(address(accessManager));
        creditPolicy = new CreditPolicy(address(accessManager), address(historyRegistry));
        lendingPool = new LendingPool(
            address(accessManager),
            address(pauseController),
            address(creditPolicy),
            address(historyRegistry),
            address(token),
            7 days
        );

        // Grant lending pool role
        accessManager.grantRole(accessManager.LENDING_POOL_ROLE(), address(lendingPool));

        // Mint tokens
        token.mint(lender, LENDER_DEPOSIT);
        token.mint(borrower, 10_000e18); // for repayment
        token.mint(borrower2, 10_000e18);

        vm.stopPrank();

        // Lender deposits
        vm.startPrank(lender);
        token.approve(address(lendingPool), type(uint256).max);
        lendingPool.deposit(LENDER_DEPOSIT);
        vm.stopPrank();

        // Borrower approves for repayments
        vm.prank(borrower);
        token.approve(address(lendingPool), type(uint256).max);
        vm.prank(borrower2);
        token.approve(address(lendingPool), type(uint256).max);
    }

    // ──────────────────────────────────────────────
    // Happy path
    // ──────────────────────────────────────────────

    function test_borrow_success() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1); // 50 FDX, policy version 1

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        assertEq(loan.borrower, borrower);
        assertEq(loan.principalInitial, 50e18);
        assertEq(loan.status == ILendingPool.LoanStatus.Active, true);
        assertEq(token.balanceOf(borrower), 10_000e18 + 50e18);
    }

    function test_borrow_and_full_repay() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        uint256 totalOwed = loan.principalOutstanding; // principal + fee

        vm.prank(borrower);
        lendingPool.repay(1, totalOwed);

        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 0);
        assertEq(loan.status == ILendingPool.LoanStatus.Repaid, true);

        // Verify history updated
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 1);
    }

    function test_partial_repay() public {
        vm.prank(borrower);
        lendingPool.borrow(100e18, 1);

        vm.prank(borrower);
        lendingPool.repay(1, 30e18);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        assertGt(loan.principalOutstanding, 0);
        assertEq(loan.status == ILendingPool.LoanStatus.Active, true);

        // Partial repay does not count as completed repayment
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 0);
    }

    /// @notice Test 60 FDX loan where borrower owes 60.6 FDX (with 1% fee) and makes partial repayments
    function test_partial_repay_60_fdx_sequence_and_final_settlement() public {
        vm.prank(borrower);
        lendingPool.borrow(60e18, 1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        uint256 fee = loan.feeAmount; // 0.6e18
        uint256 totalDebt = loan.principalOutstanding; // 60.6e18
        assertEq(loan.principalInitial, 60e18);
        assertEq(fee, 0.6e18);
        assertEq(totalDebt, 60.6e18);

        // Step 1: Repay 10 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 10e18);
        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 50.6e18);
        assertEq(loan.status == ILendingPool.LoanStatus.Active, true);
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 0);

        // Step 2: Repay 20 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 20e18);
        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 30.6e18);
        assertEq(loan.status == ILendingPool.LoanStatus.Active, true);
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 0);

        // Step 3: Attempting to repay 33 FDX when only 30.6 FDX is owed must revert
        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.repay(1, 33e18);

        // Step 4: Repay remaining exact debt (30.6 FDX) to settle loan fully
        vm.prank(borrower);
        lendingPool.repay(1, 30.6e18);
        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 0);
        assertEq(loan.status == ILendingPool.LoanStatus.Repaid, true);
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 1);
    }

    /// @notice Test 60 FDX loan where borrower with 33 FDX repays 33 FDX partial amount first
    function test_partial_repay_60_fdx_single_partial_33_fdx() public {
        vm.prank(borrower);
        lendingPool.borrow(60e18, 1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 60.6e18);

        // Borrower has 33 FDX available and makes partial repayment of 33 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 33e18);

        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 27.6e18);
        assertEq(loan.status == ILendingPool.LoanStatus.Active, true);

        // Then borrower repays remaining 27.6 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 27.6e18);

        loan = lendingPool.getLoan(1);
        assertEq(loan.principalOutstanding, 0);
        assertEq(loan.status == ILendingPool.LoanStatus.Repaid, true);
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 1);
    }

    /// @notice Test 100 FDX loan with sequential partial payments: 10 FDX, 20 FDX, 33 FDX, and remainder
    function test_partial_repay_sequence_10_20_33_and_remainder() public {
        vm.prank(borrower);
        lendingPool.borrow(100e18, 1); // 100 FDX principal + 1 FDX fee = 101 FDX total debt

        // Repay 10 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 10e18);
        assertEq(lendingPool.getLoan(1).principalOutstanding, 91e18);

        // Repay 20 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 20e18);
        assertEq(lendingPool.getLoan(1).principalOutstanding, 71e18);

        // Repay 33 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 33e18);
        assertEq(lendingPool.getLoan(1).principalOutstanding, 38e18);

        // Repay remaining 38 FDX
        vm.prank(borrower);
        lendingPool.repay(1, 38e18);

        ILendingPool.Loan memory finalLoan = lendingPool.getLoan(1);
        assertEq(finalLoan.principalOutstanding, 0);
        assertEq(finalLoan.status == ILendingPool.LoanStatus.Repaid, true);
        assertEq(historyRegistry.getBorrowerStats(borrower).verifiedRepaymentCount, 1);
    }

    function test_credit_increases_after_repayment() public {
        // First loan
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        vm.prank(borrower);
        lendingPool.repay(1, loan.principalOutstanding);

        // Credit should increase after verified repayment
        (uint256 eligible,) = creditPolicy.eligibleCredit(borrower, bytes32(0));
        // baseLimit(100) + 1 repayment * 50 = 150, capped at perLoanCap(500)
        assertEq(eligible, 150e18);
    }

    // ──────────────────────────────────────────────
    // Rejection tests
    // ──────────────────────────────────────────────

    function test_borrow_exceeds_credit_cap() public {
        // Default base limit is 100e18 for new borrower
        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.borrow(200e18, 1); // exceeds 100e18 base limit
    }

    function test_borrow_insufficient_liquidity() public {
        // Withdraw most liquidity
        vm.prank(lender);
        lendingPool.withdraw(LENDER_DEPOSIT - 10e18);

        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.borrow(50e18, 1); // only 10e18 available
    }

    function test_borrow_wrong_policy_version() public {
        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.borrow(50e18, 99); // wrong version
    }

    function test_borrow_when_paused() public {
        vm.prank(admin);
        pauseController.setBorrowingPaused(true);

        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.borrow(50e18, 1);
    }

    function test_repay_allowed_when_paused() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        vm.prank(admin);
        pauseController.setBorrowingPaused(true);

        // Repayment must still work during pause
        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        vm.prank(borrower);
        lendingPool.repay(1, loan.principalOutstanding);

        loan = lendingPool.getLoan(1);
        assertEq(loan.status == ILendingPool.LoanStatus.Repaid, true);
    }

    function test_repay_exceeds_debt() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        vm.prank(borrower);
        vm.expectRevert();
        lendingPool.repay(1, 1_000_000e18);
    }

    // ──────────────────────────────────────────────
    // Status transitions
    // ──────────────────────────────────────────────

    function test_mark_overdue() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        // Warp past due date
        vm.warp(block.timestamp + 31 days);

        lendingPool.markOverdue(1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        assertEq(loan.status == ILendingPool.LoanStatus.Overdue, true);
    }

    function test_mark_overdue_before_due_reverts() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        vm.expectRevert();
        lendingPool.markOverdue(1);
    }

    function test_mark_defaulted() public {
        vm.prank(borrower);
        lendingPool.borrow(50e18, 1);

        // Past due + grace
        vm.warp(block.timestamp + 31 days + 8 days);

        lendingPool.markOverdue(1);
        lendingPool.markDefaulted(1);

        ILendingPool.Loan memory loan = lendingPool.getLoan(1);
        assertEq(loan.status == ILendingPool.LoanStatus.Defaulted, true);

        // Default recorded in history
        assertEq(historyRegistry.getBorrowerStats(borrower).defaultCount, 1);
    }

    // ──────────────────────────────────────────────
    // Access control
    // ──────────────────────────────────────────────

    function test_unauthorized_history_write() public {
        vm.prank(borrower);
        vm.expectRevert();
        historyRegistry.recordRepayment(borrower, 1, 100e18, true);
    }

    // ──────────────────────────────────────────────
    // Deposit/withdraw
    // ──────────────────────────────────────────────

    function test_deposit_and_withdraw() public {
        uint256 balBefore = token.balanceOf(lender);
        assertEq(lendingPool.lenderBalances(lender), LENDER_DEPOSIT);

        vm.prank(lender);
        lendingPool.withdraw(10_000e18);

        assertEq(lendingPool.lenderBalances(lender), LENDER_DEPOSIT - 10_000e18);
        assertEq(token.balanceOf(lender), balBefore + 10_000e18);
    }

    function test_withdraw_exceeds_balance() public {
        vm.prank(lender);
        vm.expectRevert();
        lendingPool.withdraw(LENDER_DEPOSIT + 1);
    }
}
