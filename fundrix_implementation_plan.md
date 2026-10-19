# Fundryx — Full Implementation Plan

## What Fundryx Is

Onchain capital network. Four sequential financial markets with contract-enforced rules:

1. **Credit-history-aware lending** (M1)
2. **Fully onchain order book** (M2)
3. **Perpetual futures** (M3)
4. **Onchain market making** (M4)

Supporting systems: cross-chain credit coordination (mock-first), AI risk monitoring (advisory-only, shadow mode).

**Not building:** tokenomics, DAO, governance, mainnet deployment, company features.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Smart contracts | Solidity 0.8.x, Foundry, OpenZeppelin (pinned) |
| Frontend | Next.js, TypeScript, ethers.js |
| AI pipeline | Python, FastAPI, pandas/Polars, scikit-learn baseline |
| Testing | Foundry unit/fuzz/invariant, Slither static analysis |
| Chain | Single EVM testnet (Sepolia or Base Sepolia — decide before coding) |

---

## Contract Architecture

```
contracts/
├── core/
│   ├── AccessManager.sol          — Role management (admin, operator, monitor)
│   ├── PauseController.sol        — Emergency pause; safe repayment preserved
│   └── FundryxToken.sol           — Test ERC-20 for prototype
├── lending/
│   ├── CreditHistoryRegistry.sol  — Verified repayment/default records
│   ├── CreditPolicy.sol           — Deterministic versioned eligibility formula
│   └── LendingPool.sol            — Token custody, loan lifecycle, exposure
├── crosschain/
│   ├── CreditCoordinator.sol      — Home-chain global capacity + reservations
│   ├── CreditReservation.sol      — Reservation lifecycle state machine
│   ├── MessageAdapter.sol         — Provider-neutral send/receive interface
│   └── MessageReceiver.sol        — Source auth, replay protection, validation
├── monitoring/
│   └── RiskAttestationRegistry.sol — Advisory report metadata, no financial authority
├── oracle/
│   └── OracleRouter.sol           — Price feed normalization (M3+)
├── markets/
│   ├── OrderBook.sol              — M2: Orders, escrow, deterministic matching
│   ├── PerpEngine.sol             — M3: Positions, margin, funding, liquidation
│   └── MarketMakerVault.sol       — M4: Quotes, inventory, capital bounds
└── interfaces/
    ├── ICreditPolicy.sol
    ├── ICreditCoordinator.sol
    ├── ICreditHistoryRegistry.sol
    ├── ILendingPool.sol
    ├── IRiskAttestationRegistry.sol
    ├── IOracleRouter.sol
    ├── IOrderBook.sol
    ├── IPerpEngine.sol
    └── IMarketMakerVault.sol
```

---

## Milestone 1 — Lending (BUILD FIRST)

### Contracts to implement

#### 1. `AccessManager.sol`
- Role-based access: `ADMIN`, `OPERATOR`, `MONITOR_SIGNER`, `LENDING_POOL`
- Admin cannot bypass financial invariants
- Monitor key cannot hold admin/pauser/treasury roles

#### 2. `PauseController.sol`
- `pauseBorrowing()` / `unpauseBorrowing()`
- Pause blocks risk-increasing actions
- Repayment always allowed during pause
- Events: `PauseStateChanged`

#### 3. `FundryxToken.sol`
- Standard ERC-20, mintable by admin for testnet
- Fixed decimals (18)
- No rebasing, no fee-on-transfer

#### 4. `CreditHistoryRegistry.sol`
- Storage: `BorrowerStats` per address
  - `verifiedRepaymentCount`, `verifiedRepaidValue`, `outstandingExposure`, `defaultCount`, `lastUpdateAt`, `policyVersionLastEvaluated`
- Only authorized source (LendingPool) can write records
- Borrower **cannot** self-attest repayment
- Duplicate records rejected
- Events: `RepaymentRecorded`, `DefaultRecorded`

#### 5. `CreditPolicy.sol`
- Deterministic, versioned credit formula
- `eligibleCredit(borrower) = min(policyCreditLimit, poolLiquidity, exposureHeadroom, perLoanCap)`
- Inputs: repayment count, repaid value, outstanding exposure, default count
- `policyVersion` incremented on config change
- Hard caps: per-borrower max, per-loan max, global pool max
- View function: `previewEligibility(borrower)` for frontend
- Events: `CreditPolicyUpdated`

**Credit formula (prototype):**
```
baseLimit = 100 tokens
perRepaymentBonus = 50 tokens per verified repayment (capped at 5)
defaultPenalty = subtract 200 tokens per default
creditLimit = max(0, baseLimit + (repayments * bonus) - (defaults * penalty))
finalLimit = min(creditLimit, perLoanCap, poolLiquidity, maxExposure - currentExposure)
```

#### 6. `LendingPool.sol`
- Core state: `Loan` struct per `loanId`
  - `loanId`, `borrower`, `principalInitial`, `principalOutstanding`, `createdAt`, `dueAt`, `status`, `policyVersion`
- Functions:
  - `deposit(amount)` — lender deposits liquidity
  - `withdraw(amount)` — lender withdraws available liquidity
  - `borrow(amount, policyVersion)` — borrower takes loan
  - `repay(loanId, amount)` — borrower repays
  - `markOverdue(loanId)` — operator marks overdue loans
  - `markDefaulted(loanId)` — operator marks defaults
- Borrow checks (all required):
  1. Market not paused
  2. Policy version matches
  3. Credit eligibility from CreditPolicy
  4. Pool liquidity sufficient
  5. Exposure headroom
  6. Per-loan cap
- Loan statuses: `None`, `Active`, `Repaid`, `Overdue`, `Defaulted`
- SafeERC20, checks-effects-interactions, reentrancy guard
- Events: `LoanCreated`, `LoanRepaid`, `LoanStatusChanged`
- Partial repayment reduces debt, full repayment closes loan
- Only full repayment counts as completed for credit history

#### 7. `RiskAttestationRegistry.sol`
- Accept signed reports from authorized monitor signer
- Reject duplicate report IDs
- Store: `reportId`, `modelVersion`, `ruleSetVersion`, `sourceChainId`, `fromBlock`, `toBlock`, `riskLevel`, `reportHash`
- No financial authority whatsoever
- Events: `RiskReportRegistered`, `RiskReportRevoked`

### M1 Tests Required
| Test | Expected |
|---|---|
| Valid borrow | Succeeds, emits `LoanCreated` |
| Exceeds credit cap | Reverts |
| Insufficient liquidity | Reverts |
| Paused borrowing | Reverts |
| Full repayment | Closes loan, updates history |
| Partial repayment | Reduces debt, loan stays active |
| Unauthorized attestation | Reverts |
| Duplicate repayment record | Reverts |
| Overdue/default transitions | Correct state changes |
| Reentrancy attempt | No corruption |
| Fuzz: exposure never exceeds cap | Invariant holds |

### M1 Exit Gate
- Borrow/repay lifecycle works
- Over-limit rejected
- Forged history rejected
- No unintended state on revert
- Events match contract state

---

## Milestone 2 — Order Book (after M1 gate passes)

### `OrderBook.sol`
- Order struct: `orderId`, `trader`, `side`, `price`, `quantity`, `filledQuantity`, `status`, `timestamp`
- Funded escrow on placement
- Deterministic price-time priority matching
- Partial fills update remaining quantity
- Cancel affects only unfilled portion
- Atomic settlement: both sides or revert
- No hidden backend matcher
- Events: `OrderPlaced`, `OrderCancelled`, `OrderMatched`, `Trade`

---

## Milestone 3 — Perpetual Futures (after M2 gate passes)

### `PerpEngine.sol`
- Position struct: `positionId`, `trader`, `side`, `size`, `entryPrice`, `margin`, `lastFundingIndex`, `status`
- Cumulative funding index (not automatic per-block)
- Margin requirements, leverage cap
- OracleRouter integration (stale price blocks risk-increasing actions)
- PnL calculation, liquidation logic
- Bad-debt handling
- Events: `PositionOpened`, `PositionClosed`, `FundingApplied`, `Liquidation`

### `OracleRouter.sol`
- Normalize price feeds
- Freshness check
- Reject stale/invalid data
- Sequencer check where applicable

---

## Milestone 4 — Market Making (after M3 gate passes)

### `MarketMakerVault.sol`
- Inventory, capital, quote bounds
- Maximum inventory, notional, spread limits
- Quote freshness/nonce validation
- Authorized operator
- Integration with OrderBook
- Events: `QuoteSubmitted`, `QuoteCancelled`, `FillProcessed`, `LimitBreached`

---

## Cross-Chain (Mock-First, Not Blocking M1)

### Contracts
- `CreditCoordinator.sol` — global capacity ledger, reservation lifecycle
- `CreditReservation.sol` — state machine: `None → Requested → Confirmed → Consumed → ReleasePending → Released`
- `MessageAdapter.sol` — provider-neutral interface
- `MessageReceiver.sol` — source authentication, nonce/replay protection

### Invariant
`globalOutstandingExposure + activeReservations <= globalCreditCapacity`

Build interfaces and mock tests with M1. Live provider only after route verification.

---

## AI Monitoring (Shadow Mode, Advisory Only)

### Offchain Pipeline
1. Ingest chain events
2. Validate source/block range
3. Build features (repayment timing, exposure, failed borrows, utilization)
4. Run deterministic rules
5. Optional: Isolation Forest anomaly model
6. Produce structured `RiskReport` JSON
7. Sign with monitor key
8. Register hash in `RiskAttestationRegistry`
9. Display in dashboard

### Hard Boundary
AI **never**: transfers funds, changes policy, creates/releases reservations, liquidates, grants roles.

---

## Deployment Order

```
1. AccessManager
2. PauseController
3. FundryxToken (test ERC-20)
4. CreditHistoryRegistry
5. CreditPolicy (conservative caps)
6. LendingPool
7. Configure roles: LendingPool authorized to write history
8. RiskAttestationRegistry + monitor signer
9. (Later) CreditCoordinator — mock adapter
10. (M2) OrderBook
11. (M3) OracleRouter + PerpEngine
12. (M4) MarketMakerVault
```

---

## Build Order — What to Code and When

### Phase 1: Foundation (do now)
1. Initialize Foundry project in `Fundryx/`
2. Install OpenZeppelin
3. Write all interfaces (`interfaces/` folder)
4. Implement `AccessManager` + `PauseController`
5. Implement `FundryxToken`
6. Write tests for foundation contracts

### Phase 2: Lending Core (M1)
1. Implement `CreditHistoryRegistry`
2. Implement `CreditPolicy` with prototype formula
3. Implement `LendingPool`
4. Write unit tests for each
5. Write fuzz tests (exposure invariants)
6. Write invariant tests
7. Implement `RiskAttestationRegistry`
8. Integration test: full borrow-repay lifecycle
9. Deploy to testnet
10. Verify on explorer

### Phase 3: Cross-Chain Mock
1. Implement `CreditCoordinator` + `CreditReservation`
2. Implement mock `MessageAdapter`
3. Write reservation state machine tests
4. Test replay/duplicate/wrong-source rejection

### Phase 4: Order Book (M2)
1. Implement `OrderBook`
2. Matching engine tests
3. Escrow/settlement tests

### Phase 5: Perps (M3)
1. Implement `OracleRouter`
2. Implement `PerpEngine`
3. Margin/funding/liquidation tests

### Phase 6: Market Making (M4)
1. Implement `MarketMakerVault`
2. Integration with OrderBook
3. Full regression suite

---

## Key Decisions Needed Before Coding

| Decision | Options |
|---|---|
| Testnet chain | Sepolia, Base Sepolia, Arbitrum Sepolia |
| Test token | Custom ERC-20 (recommended) or testnet USDC |
| Loan duration | Fixed (e.g., 30 days) or configurable |
| Interest/fees | None for prototype or simple flat fee |
| Default trigger | Time-based (past due date) or manual operator |
| Credit formula | Use proposed formula above or custom |

---

## Project Structure

```
Fundryx/
├── docs/                    — (existing, keep as-is)
├── contracts/
│   ├── core/
│   ├── lending/
│   ├── crosschain/
│   ├── monitoring/
│   ├── oracle/
│   ├── markets/
│   └── interfaces/
├── test/
│   ├── unit/
│   ├── fuzz/
│   ├── invariant/
│   └── integration/
├── script/
│   ├── Deploy.s.sol
│   └── ConfigureRoles.s.sol
├── frontend/               — (Next.js, later)
├── ai/                     — (Python pipeline, later)
├── foundry.toml
├── .env.example
├── .gitignore
└── README.md
```

> [!IMPORTANT]
> **Immediate next step:** Initialize Foundry project, implement M1 contracts, deploy to testnet. Everything else follows sequentially after M1 exit gate passes.
