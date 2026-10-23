import os
from pathlib import Path
from dotenv import load_dotenv

# Locate root .env
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

RPC_URL = os.getenv("POLYGON_AMOY_RPC_URL", "https://polygon-amoy-bor-rpc.publicnode.com")
MONAD_RPC_URL = os.getenv("MONAD_TESTNET_RPC", "https://testnet-rpc.monad.xyz/")
CHAIN_ID = int(os.getenv("CHAIN_ID", "80002"))
PORT = int(os.getenv("BACKEND_PORT", "8000"))
HOST = os.getenv("BACKEND_HOST", "127.0.0.1")

# Polygon Amoy Contracts (80002)
CONTRACTS = {
    "AccessManager": os.getenv("POLYGON_ACCESS_MANAGER_ADDRESS", os.getenv("ACCESS_MANAGER_ADDRESS", "0x230829f5EC30A1936fDECE13F1179381daaf69e8")),
    "PauseController": os.getenv("POLYGON_PAUSE_CONTROLLER_ADDRESS", os.getenv("PAUSE_CONTROLLER_ADDRESS", "0xF4d0F035900c313e44246ED473b3011E42192F77")),
    "FundryxToken": os.getenv("POLYGON_FUNDRYX_TOKEN_ADDRESS", os.getenv("FUNDRYX_TOKEN_ADDRESS", "0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E")),
    "FundrexUSD": os.getenv("POLYGON_FUSD_ADDRESS", "0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34"),
    "CreditHistoryRegistry": os.getenv("POLYGON_CREDIT_HISTORY_REGISTRY_ADDRESS", os.getenv("CREDIT_HISTORY_REGISTRY_ADDRESS", "0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d")),
    "CreditPolicy": os.getenv("POLYGON_CREDIT_POLICY_ADDRESS", os.getenv("CREDIT_POLICY_ADDRESS", "0x68fC6E11cD8a855849D7788e035BA92E320Db0d2")),
    "LendingPool": os.getenv("POLYGON_LENDING_POOL_ADDRESS", os.getenv("LENDING_POOL_ADDRESS", "0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C")),
    "RiskAttestationRegistry": os.getenv("POLYGON_RISK_ATTESTATION_REGISTRY_ADDRESS", os.getenv("RISK_ATTESTATION_REGISTRY_ADDRESS", "0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC")),
}

# Monad Testnet Contracts (10143)
MONAD_CONTRACTS = {
    "AccessManager": os.getenv("MONAD_ACCESS_MANAGER_ADDRESS", "0x8748fa4147c9fE78572D14F3C827d2E8ad4B9138"),
    "PauseController": os.getenv("MONAD_PAUSE_CONTROLLER_ADDRESS", "0x230829f5EC30A1936fDECE13F1179381daaf69e8"),
    "FundryxToken": os.getenv("MONAD_FUNDRYX_TOKEN_ADDRESS", "0x86E7023f10c5bd119521EB95a8CddF19159f95Cd"),
    "FundrexUSD": os.getenv("MONAD_FUSD_ADDRESS", "0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E"),
    "CreditHistoryRegistry": os.getenv("MONAD_CREDIT_HISTORY_REGISTRY_ADDRESS", "0xF4d0F035900c313e44246ED473b3011E42192F77"),
    "CreditPolicy": os.getenv("MONAD_CREDIT_POLICY_ADDRESS", "0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d"),
    "LendingPool": os.getenv("MONAD_LENDING_POOL_ADDRESS", "0x68fC6E11cD8a855849D7788e035BA92E320Db0d2"),
    "RiskAttestationRegistry": os.getenv("MONAD_RISK_ATTESTATION_REGISTRY_ADDRESS", "0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C"),
}

