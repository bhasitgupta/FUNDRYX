# FUNDRYX — Autonomous Onchain Capital Network

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue.svg)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange.svg)](https://getfoundry.sh/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Fundryx is an institutional-grade, autonomous onchain capital orchestration network. It provides uncollateralized lending facilities, verifiable zero-knowledge credit scoring, AI-driven risk sentinel telemetry, and multi-currency federated liquidity vaults with deterministic smart legal covenants.

---

## Architecture Overview

```
                                      ┌─────────────────────────────────┐
                                      │   Institutional Borrowers &     │
                                      │      Liquidity Providers        │
                                      └────────────────┬────────────────┘
                                                       │
                                  Ethers.js / Web3Modal│
                                                       ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FUNDRYX CLIENT PORTAL                                    │
│  ├── Able Credit: Uncollateralized borrowing terminal & algorithmic rate curves        │
│  ├── Borderline Verify: zkSNARK credential proofs & Tier 1 Prime scoring engine        │
│  ├── AI Risk Telemetry: Autonomous Sentinel Quorum (3/3 multi-validator consensus)     │
│  ├── Capital Markets: Multi-asset federated liquidity vaults (USDC, EURC, FDX)         │
│  └── Leganetum: Institutional master covenants & smart legal jurisprudence             │
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │
                                 JSON-RPC / Solidity ABIs
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE SMART CONTRACT SUITE                                 │
│                                                                                        │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐   │
│   │     LendingPool     │───►│  InterestRateModel  │───►│       CreditPolicy       │   │
│   │  (Capital Routing)  │    │  (Algorithmic APR)  │    │ (Underwriting Guardrails)│   │
│   └──────────┬──────────┘    └─────────────────────┘    └─────────────┬────────────┘   │
│              │                                                        │                │
│              ▼                                                        ▼                │
│   ┌─────────────────────┐                               ┌──────────────────────────┐   │
│   │RiskAttestationReg.  │                               │  CreditHistoryRegistry   │   │
│   │ (Sentinel Quorum)   │                               │(Immutable Ledger Proofs) │   │
│   └─────────────────────┘                               └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Protocol Facilities

### 1. Able Credit · Uncollateralized Lending Facilities
- Institutional zero-haircut credit facilities backed by verified cryptographic reputational identity.
- Continuous borrow capacity up to $250,000 for Tier 1 Prime institutional borrowers.
- Algorithmic interest rate curve model computing dynamic borrow and supply APRs in per-second compounding intervals.

### 2. Borderline Verify · zkSNARK Identity & Attestations
- Privacy-preserving zero-knowledge solvency verification that proves creditworthiness without exposing wallet transaction histories.
- Deterministic credit scoring (0 to 850) categorizing borrowers into Prime Tier 1 (750+), Tier 2 Growth, and Tier 3 Emerging.
- Immutable onchain repayment receipts proving historical repayment pacing and volume.

### 3. AI Risk Telemetry · Autonomous Sentinel Quorum
- Offchain AI risk telemetry engine monitoring borrower velocity and liquidity drain sensors in real time.
- Cryptographically signed 3/3 validator quorum consensus before credit limit expansions or drawdown allowances.
- Advisory non-authoritative boundary prevents model hallucination from affecting non-custodial capital reserves.

### 4. Capital Markets · Federated Digital Inventory Vaults
- Multi-currency liquidity vaults supporting USDC, EURC, USD Liquid, and FDX native tokens.
- Automated yield compounding and segregated pool liquidity buffers guaranteeing instant lender withdrawal liquidity.
- Real-time order books, swap execution, and liquidity depth tracking.

### 5. Leganetum · Protocol Jurisprudence & Marketplace Legal Terms
- Smart legal agreements bridging decentralized execution with institutional commercial paper standards.
- Enforceable arbitration covenants, digital signature verification, and automated dispute resolution mechanisms.

---

## Smart Contract Directory

| Contract | Path | Description |
|:---|:---|:---|
| `LendingPool` | `contracts/lending/LendingPool.sol` | Core lending facility managing deposits, uncollateralized borrows, repayments, and asset routing. |
| `InterestRateModel` | `contracts/lending/InterestRateModel.sol` | Dynamic utilization-rate pricing model computing borrow and supply rates per second. |
| `CreditPolicy` | `contracts/core/CreditPolicy.sol` | Underwriting parameters, loan tenures, loan-to-value limits, and borrow eligibility verification. |
| `CreditHistoryRegistry`| `contracts/credit/CreditHistoryRegistry.sol` | Immutable ledger tracking borrower repayment records, default rates, and Prime scores. |
| `RiskAttestationRegistry`| `contracts/monitoring/RiskAttestationRegistry.sol`| Quorum validation registry verifying signatures from offchain AI risk sentinels. |
| `PauseController` | `contracts/core/PauseController.sol` | Emergency multi-signature pause mechanism safeguarding protocol reserves. |

---

## Project Structure

```
FUNDRYX/
├── contracts/               # Solidity Core Contracts & Interfaces
│   ├── core/                # CreditPolicy, PauseController
│   ├── credit/              # CreditHistoryRegistry
│   ├── interfaces/          # ILendingPool, ICreditPolicy, IRiskAttestationRegistry
│   ├── lending/             # LendingPool, InterestRateModel
│   └── monitoring/          # RiskAttestationRegistry
├── script/                  # Foundry Deployment & Simulation Scripts
│   ├── Deploy.s.sol         # Mainnet/Testnet Orchestrated Deployment
│   └── SeedMockData.s.sol   # Demo Liquidity & Borrower Seed Scripts
├── test/                    # Comprehensive Foundry Unit & Invariant Tests
│   ├── LendingPool.t.sol    # Lending pool invariants and repayment tests
│   └── CreditPolicy.t.sol   # Credit score verification and loan limits
├── frontend/                # Institutional Web Portal
│   ├── src/
│   │   ├── components/      # MagicBento, BranchedMenu, FundryxAppPortal, FundryxLanding
│   │   ├── lib/             # Utility helpers & class-variance-authority
│   │   ├── utils/           # Web3 contracts bindings & ethers integration
│   │   └── App.jsx          # Route orchestration & Lenis smooth scrolling
│   ├── vite.config.js       # Vite 8 + Tailwind CSS v4 compiler config
│   └── package.json         # Frontend dependencies
├── foundry.toml             # Foundry configuration
└── README.md                # System documentation
```

---

## Getting Started

### Prerequisites

- [Foundry](https://getfoundry.sh/) (`forge`, `cast`, `anvil`)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `pnpm`

### 1. Smart Contracts (Foundry)

```bash
# Clone the repository
git clone https://github.com/bhasitgupta/FUNDRYX.git
cd FUNDRYX

# Install Foundry dependencies
forge install

# Build smart contracts
forge build

# Execute test suite
forge test -vvv
```

### 2. Frontend Web Portal

```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## Security & Verification

- **Reentrancy Protection**: OpenZeppelin `ReentrancyGuard` across all state-mutating deposit and borrow functions.
- **Access Control**: Role-based access governance with multi-sig emergency circuit breakers.
- **Deterministic Consensus**: Every borrow action requires verified attestations from both the `CreditHistoryRegistry` and `RiskAttestationRegistry`.

---

## License

This project is licensed under the [MIT License](LICENSE).
