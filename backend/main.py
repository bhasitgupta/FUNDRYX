import uvicorn
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from .config import PORT, HOST, CHAIN_ID, CONTRACTS
from .chain_service import chain_service
from .ai_risk_monitor import ai_monitor
from .market_service import market_service

app = FastAPI(
    title="Fundryx Institutional API",
    description="Deterministic Credit Intelligence, Smart Contract Liquidity Telemetry, and AI Sentinel Risk Monitor for Fundryx.",
    version="1.0.0",
)

# Enable CORS for local dev & all web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "project": "Fundryx",
        "description": "Onchain Capital Network API",
        "status": "ONLINE",
        "chain": "Polygon Amoy Testnet",
        "chainId": CHAIN_ID,
        "docs": "/docs",
    }

@app.get("/api/health")
def get_health():
    is_web3_ok = chain_service.is_connected()
    current_block = chain_service.get_current_block()
    return {
        "status": "healthy" if is_web3_ok else "degraded",
        "web3Connected": is_web3_ok,
        "currentBlock": current_block,
        "chainId": CHAIN_ID,
        "contractsTracked": len(CONTRACTS),
    }

@app.get("/api/contracts")
def get_contracts():
    return {
        "chainId": CHAIN_ID,
        "network": "polygon_amoy",
        "contracts": CONTRACTS,
    }

@app.get("/api/pool")
def get_pool_data():
    """Live pool telemetry from Polygon Amoy contracts."""
    return chain_service.get_pool_stats()

@app.get("/api/credit/score/{borrower_address}")
def get_credit_score(borrower_address: str):
    """Deterministic credit score and eligibility formula for borrower."""
    return chain_service.get_borrower_credit(borrower_address)

@app.get("/api/risk/telemetry")
def get_risk_telemetry():
    """Live AI Sentinel risk telemetry and consensus quorum status."""
    pool_stats = chain_service.get_pool_stats()
    return ai_monitor.get_telemetry_summary(pool_stats)

@app.post("/api/risk/evaluate")
def run_risk_evaluation():
    """Trigger an on-demand AI risk audit cycle producing a cryptographically hashed report."""
    pool_stats = chain_service.get_pool_stats()
    report = ai_monitor.evaluate_telemetry(pool_stats)
    return {
        "message": "AI Risk Audit Completed Successfully",
        "report": report,
    }

@app.get("/api/markets/tickers")
def get_market_tickers():
    """Real live token prices fetched from public crypto endpoints."""
    return market_service.fetch_live_prices()

@app.get("/api/markets/orderbook")
def get_order_book(pair: str = Query("USDC/FDX")):
    """Live Order Book bids and asks."""
    return market_service.get_order_book(pair)

@app.get("/api/markets/trades")
def get_market_trades(limit: int = Query(10, le=50)):
    """Live market trade feed."""
    return market_service.get_market_trades(limit)

@app.get("/api/activity")
def get_activity_feed(limit: int = Query(10, le=50)):
    """Live authenticated activity events."""
    return chain_service.get_recent_activity(limit)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False)
