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
