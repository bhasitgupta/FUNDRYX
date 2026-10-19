from backend.main import (
    get_health,
    get_contracts,
    get_pool_data,
    get_credit_score,
    get_risk_telemetry,
    get_market_tickers,
    get_order_book,
    get_market_trades,
    get_activity_feed,
)

def run_tests():
    print("Testing get_health()...")
    h = get_health()
    assert "status" in h
    print("  -> Health OK:", h)

    print("Testing get_contracts()...")
    c = get_contracts()
    assert len(c["contracts"]) >= 6
    print("  -> Contracts OK:", len(c["contracts"]), "contracts loaded")

    print("Testing get_pool_data()...")
    pool = get_pool_data()
    assert "totalDeposits" in pool
    print(f"  -> Pool OK: Deposits={pool['totalDeposits']}, Borrowed={pool['totalBorrowed']}, Utilization={pool['utilizationRate']}%")

    print("Testing get_credit_score()...")
    score = get_credit_score("0x71C94142a59a72F2bB4E7d8DeF0882e88a0349A2")
    assert "score" in score
    print(f"  -> Credit Score OK: Score={score['score']}, Tier={score['tier']}, MaxCredit={score['maxCredit']}")

    print("Testing get_risk_telemetry()...")
    risk = get_risk_telemetry()
    assert "systemSolvency" in risk
    print(f"  -> Risk Telemetry OK: Solvency={risk['systemSolvency']}, Mode={risk['mode']}")

    print("Testing get_market_tickers()...")
    tickers = get_market_tickers()
    assert "POL" in tickers
    print(f"  -> Market Tickers OK: POL=${tickers.get('POL')}, ETH=${tickers.get('ETH')}, BTC=${tickers.get('BTC')}")

    print("Testing get_order_book()...")
    ob = get_order_book("USDC/FDX")
    assert len(ob["asks"]) > 0
    print(f"  -> Orderbook OK: Asks={len(ob['asks'])}, Bids={len(ob['bids'])}")

    print("Testing get_activity_feed()...")
    feed = get_activity_feed(5)
    assert len(feed) > 0
    print(f"  -> Activity Feed OK: {len(feed)} events")

    print("\nALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()

