"""
ABI definitions matching deployed Fundryx contracts on Polygon Amoy.
"""

LENDING_POOL_ABI = [
    {
        "inputs": [],
        "name": "totalDeposits",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalBorrowed",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "availableLiquidity",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalOutstandingDebt",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "lender", "type": "address"}],
        "name": "lenderBalances",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "loanId", "type": "uint256"}],
        "name": "getLoan",
        "outputs": [
            {
                "components": [
                    {"name": "loanId", "type": "uint256"},
                    {"name": "borrower", "type": "address"},
                    {"name": "principalInitial", "type": "uint256"},
                    {"name": "principalOutstanding", "type": "uint256"},
                    {"name": "feeAmount", "type": "uint256"},
                    {"name": "createdAt", "type": "uint64"},
                    {"name": "dueAt", "type": "uint64"},
                    {"name": "status", "type": "uint8"},
                    {"name": "policyVersion", "type": "uint32"},
                ],
                "name": "",
                "type": "tuple",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "borrower", "type": "address"}],
        "name": "getBorrowerLoans",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "nextLoanId",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "lender", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"},
        ],
        "name": "Deposited",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "loanId", "type": "uint256"},
            {"indexed": True, "name": "borrower", "type": "address"},
            {"indexed": False, "name": "principal", "type": "uint256"},
            {"indexed": False, "name": "fee", "type": "uint256"},
            {"indexed": False, "name": "dueAt", "type": "uint64"},
            {"indexed": False, "name": "policyVersion", "type": "uint32"},
        ],
        "name": "LoanCreated",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "loanId", "type": "uint256"},
            {"indexed": True, "name": "borrower", "type": "address"},
            {"indexed": False, "name": "amountPaid", "type": "uint256"},
            {"indexed": False, "name": "remainingOutstanding", "type": "uint256"},
            {"indexed": False, "name": "isFullRepayment", "type": "bool"},
        ],
        "name": "LoanRepaid",
        "type": "event",
    },
]

CREDIT_POLICY_ABI = [
    {
        "inputs": [],
        "name": "policyVersion",
        "outputs": [{"name": "", "type": "uint32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "borrower", "type": "address"}],
        "name": "previewEligibility",
        "outputs": [
            {"name": "maxCredit", "type": "uint256"},
            {"name": "version", "type": "uint32"},
            {"name": "repaymentCount", "type": "uint64"},
            {"name": "outstandingExposure", "type": "uint256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "principal", "type": "uint256"}],
        "name": "calculateFee",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "config",
        "outputs": [
            {"name": "baseLimit", "type": "uint256"},
            {"name": "perRepaymentBonus", "type": "uint256"},
            {"name": "maxBonusRepayments", "type": "uint64"},
            {"name": "defaultPenalty", "type": "uint256"},
            {"name": "perLoanCap", "type": "uint256"},
            {"name": "maxBorrowerExposure", "type": "uint256"},
            {"name": "maxPoolExposure", "type": "uint256"},
            {"name": "flatFeeBps", "type": "uint256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

CREDIT_HISTORY_ABI = [
    {
        "inputs": [{"name": "borrower", "type": "address"}],
        "name": "getBorrowerStats",
        "outputs": [
            {
                "components": [
                    {"name": "verifiedRepaymentCount", "type": "uint64"},
                    {"name": "verifiedRepaidValue", "type": "uint256"},
                    {"name": "outstandingExposure", "type": "uint256"},
                    {"name": "defaultCount", "type": "uint64"},
                    {"name": "lastUpdateAt", "type": "uint64"},
                    {"name": "policyVersionLastEvaluated", "type": "uint32"},
                ],
                "name": "",
                "type": "tuple",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    }
]

PAUSE_CONTROLLER_ABI = [
    {
        "inputs": [],
        "name": "borrowingPaused",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "depositsPaused",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
]

RISK_REGISTRY_ABI = [
    {
        "inputs": [],
        "name": "reportCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "reportId", "type": "bytes32"}],
        "name": "getReport",
        "outputs": [
            {
                "components": [
                    {"name": "reportId", "type": "bytes32"},
                    {"name": "modelVersion", "type": "bytes32"},
                    {"name": "ruleSetVersion", "type": "uint32"},
                    {"name": "sourceChainId", "type": "uint256"},
                    {"name": "fromBlock", "type": "uint256"},
                    {"name": "toBlock", "type": "uint256"},
                    {"name": "createdAt", "type": "uint64"},
                    {"name": "riskLevel", "type": "uint8"},
                    {"name": "reportHash", "type": "bytes32"},
                    {"name": "signer", "type": "address"},
                    {"name": "revoked", "type": "bool"},
                ],
                "name": "",
                "type": "tuple",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

ERC20_ABI = [
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]
