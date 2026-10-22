// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessManager} from "../core/AccessManager.sol";
import {PauseController} from "../core/PauseController.sol";
import {CreditPolicy} from "./CreditPolicy.sol";
import {CreditHistoryRegistry} from "./CreditHistoryRegistry.sol";
import {ILendingPool} from "../interfaces/ILendingPool.sol";

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
        // Fees paid first; reduce totalBorrowed by the exact principal portion paid
        uint256 principalBefore = (loan.principalOutstanding + amount) > loan.principalInitial
            ? loan.principalInitial
            : (loan.principalOutstanding + amount);
        uint256 principalAfter = loan.principalOutstanding > loan.principalInitial
            ? loan.principalInitial
            : loan.principalOutstanding;
        uint256 principalReduction = principalBefore - principalAfter;

        if (principalReduction > totalBorrowed) {
            totalBorrowed = 0;
        } else {
            totalBorrowed -= principalReduction;
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
