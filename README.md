# FUNDRYX — Autonomous Onchain Capital Network

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange.svg)](https://getfoundry.sh/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Polygon Amoy](https://img.shields.io/badge/Polygon-Amoy%20(80002)-8247E5.svg)](https://amoy.polygonscan.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Fundryx is an institutional-grade, autonomous onchain capital orchestration network. It provides uncollateralized lending facilities, verifiable credit history registries, AI-driven risk sentinel telemetry, real-time capital market orderbooks, and multi-currency liquidity vaults with deterministic smart legal covenants.

---

## Deployed Smart Contracts (Polygon Amoy Testnet — Chain ID: 80002)

| Contract | Address | Explorer |
|:---|:---|:---|
| **LendingPool** | `0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C` | [View on Polygonscan](https://amoy.polygonscan.com/address/0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C) |
| **CreditHistoryRegistry** | `0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d` | [View on Polygonscan](https://amoy.polygonscan.com/address/0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d) |
| **CreditPolicy** | `0x68fC6E11cD8a855849D7788e035BA92E320Db0d2` | [View on Polygonscan](https://amoy.polygonscan.com/address/0x68fC6E11cD8a855849D7788e035BA92E320Db0d2) |
| **RiskAttestationRegistry** | `0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC` | [View on Polygonscan](https://amoy.polygonscan.com/address/0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC) |
| **FundryxToken (FDX)** | `0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E` | [View on Polygonscan](https://amoy.polygonscan.com/address/0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E) |
| **PauseController** | `0xF4d0F035900c313e44246ED473b3011E42192F77` | [View on Polygonscan](https://amoy.polygonscan.com/address/0xF4d0F035900c313e44246ED473b3011E42192F77) |
| **AccessManager** | `0x230829f5EC30A1936fDECE13F1179381daaf69e8` | [View on Polygonscan](https://amoy.polygonscan.com/address/0x230829f5EC30A1936fDECE13F1179381daaf69e8) |

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
│  └── Creative Tim Wallet Login: Institutional wallet selection and auth block          │
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │
                                  JSON-RPC / Solidity ABIs / FastAPI
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE SMART CONTRACT SUITE                                 │
│                                                                                        │
│   ┌─────────────────────┐                               ┌──────────────────────────┐   │
│   │     LendingPool     │──────────────────────────────►│       CreditPolicy       │   │
│   │  (Capital Routing)  │                               │ (Underwriting Guardrails)│   │
│   └──────────┬──────────┘                               └─────────────┬────────────┘   │
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
- Algorithmic interest rate model computing dynamic borrow and supply rates per second.

### 2. Borderline Verify · Reputational Identity & Attestations
- Verification of creditworthiness and deterministic credit scoring (0 to 850) based on verified onchain repayment records.
- Borrowers categorized into Prime Tier 1 (750+), Tier 2 Growth, and Tier 3 Emerging.
- Immutable onchain repayment receipts proving historical repayment pacing and volume.

### 3. AI Risk Telemetry · Autonomous Sentinel Quorum
- Offchain AI risk telemetry engine monitoring borrower velocity and liquidity drain sensors in real time.
- Cryptographically signed 3/3 validator quorum consensus before credit limit expansions or drawdown allowances.
- Advisory non-authoritative boundary prevents model hallucination from affecting non-custodial capital reserves.

### 4. Capital Markets · Federated Digital Inventory Vaults
- Multi-currency liquidity vaults supporting USDC, EURC, USD Liquid, and FDX native tokens.
- Real-time order books, swap execution, and live depth tracking fed by FastAPI and Web3.py telemetry.
- Automated yield compounding and segregated pool liquidity buffers guaranteeing instant lender withdrawal liquidity.

---

## Smart Contract Directory

| Contract | Path | Description |
|:---|:---|:---|
| `LendingPool` | `contracts/lending/LendingPool.sol` | Core lending facility managing deposits, uncollateralized borrows, repayments, and asset routing. |
| `CreditPolicy` | `contracts/lending/CreditPolicy.sol` | Underwriting parameters, loan tenures, loan-to-value limits, and borrow eligibility verification. |
| `CreditHistoryRegistry`| `contracts/lending/CreditHistoryRegistry.sol` | Immutable ledger tracking borrower repayment records, default rates, and Prime scores. |
| `RiskAttestationRegistry`| `contracts/monitoring/RiskAttestationRegistry.sol`| Quorum validation registry verifying EIP-191 signatures from offchain AI risk sentinels. |
| `PauseController` | `contracts/core/PauseController.sol` | Emergency multi-signature pause mechanism safeguarding protocol reserves while allowing repayments. |
| `AccessManager` | `contracts/core/AccessManager.sol` | Role-based permission controls and operational boundaries. |
| `FundryxToken` | `contracts/core/FundryxToken.sol` | Native prototype ERC-20 utility and settlement asset. |

---

## Project Structure

```
FUNDRYX/
├── contracts/               # Solidity Smart Contracts (0.8.24)
│   ├── core/                # AccessManager, PauseController, FundryxToken
│   ├── interfaces/          # ILendingPool, ICreditPolicy, ICreditHistoryRegistry, IRiskAttestationRegistry
│   ├── lending/             # LendingPool, CreditPolicy, CreditHistoryRegistry
│   └── monitoring/          # RiskAttestationRegistry
├── script/                  # Foundry Deployment Scripts
│   └── Deploy.s.sol         # Testnet Orchestrated Deployment
├── test/                    # Comprehensive Foundry Unit & Invariant Tests
│   └── LendingPool.t.sol    # 16 passing unit and invariant tests
├── backend/                 # Python 3.14 + FastAPI + Web3.py Telemetry Service
│   ├── main.py              # REST API & WebSocket endpoints
│   ├── chain_service.py     # Polygon Amoy live onchain query service
│   ├── ai_risk_monitor.py   # EIP-191 cryptographic risk sentinel engine
│   ├── market_service.py    # Live CoinGecko ticker & orderbook feed
│   ├── test_backend.py      # Backend unit test suite
│   └── requirements.txt     # Python dependencies
├── frontend/                # Institutional Web Portal
│   ├── src/
│   │   ├── components/      # FundryxAppPortal, FundryxLanding, MagicBento, BranchedMenu
│   │   ├── components/creative-tim/ # Creative Tim Choose Crypto Wallet Login block
│   │   ├── utils/contracts.js# Ethers.js v6 Polygon Amoy bindings
│   │   └── App.jsx          # Route orchestration & Lenis smooth scrolling
│   ├── vite.config.js       # Vite + Tailwind CSS v4 compiler config
│   └── package.json         # Frontend dependencies
├── foundry.toml             # Foundry configuration
├── deployments.json         # Deployed Polygon Amoy contract addresses
└── README.md                # System documentation
```

---

## Getting Started

### Prerequisites

- [Foundry](https://getfoundry.sh/) (`forge`, `cast`)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Python](https://python.org/) (3.10+ recommended)

### 1. Smart Contracts (Foundry)

```bash
# Build smart contracts
forge build

# Execute test suite (16 tests)
forge test -vvv
```

### 2. Backend Telemetry Engine (FastAPI & Web3.py)

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run backend tests
py -m backend.test_backend

# Start FastAPI server (runs on http://127.0.0.1:8000)
py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Web Portal (React 19 & Vite)

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

## Security & Invariants

- **Reentrancy Protection**: OpenZeppelin `ReentrancyGuard` across all state-mutating deposit, borrow, and repay functions.
- **Access Governance**: Strict role separation (`ADMIN_ROLE`, `OPERATOR_ROLE`, `MONITOR_SIGNER_ROLE`, `LENDING_POOL_ROLE`).
- **Emergency Protection**: `PauseController` halts new borrows during system volatility while preserving debt repayment.
- **Cryptographic Attestations**: EIP-191 signatures validate AI risk telemetry reports before parameter updates.

---

## License

This project is licensed under the [MIT License](LICENSE).
