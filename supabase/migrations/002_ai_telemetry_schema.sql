-- ========================================================
-- FUNDRYX PROTOCOL — FULL SELF-CONTAINED DATABASE SETUP
-- Network: Multi-Chain (Monad, Polygon, Avalanche, Base)
-- Idempotent schema: Safe to run on fresh or existing DB
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BASE AUDIT EVENTS TABLE (created if not exists)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL DEFAULT 80002,
    tx_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL DEFAULT 0,
    event_name TEXT NOT NULL DEFAULT 'ProtocolEvent',
    contract_address TEXT NOT NULL DEFAULT '',
    wallet_address TEXT NOT NULL DEFAULT '',
    amount NUMERIC,
    amount_formatted TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    gas_used TEXT,
    effective_gas_price TEXT,
    explorer_url TEXT,
    source TEXT NOT NULL DEFAULT 'ONCHAIN',
    correlation_id TEXT,
    ai_telemetry JSONB DEFAULT NULL,
    error_code TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure telemetry columns exist if table was already created earlier
ALTER TABLE public.audit_events
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'ONCHAIN',
ADD COLUMN IF NOT EXISTS correlation_id TEXT,
ADD COLUMN IF NOT EXISTS ai_telemetry JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS error_code TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_events_wallet ON public.audit_events (wallet_address);
CREATE INDEX IF NOT EXISTS idx_audit_events_tx_hash ON public.audit_events (tx_hash);
CREATE INDEX IF NOT EXISTS idx_audit_events_source ON public.audit_events (source);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation ON public.audit_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events (created_at DESC);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_events' AND policyname = 'Allow public read access to audit events') THEN
        CREATE POLICY "Allow public read access to audit events" ON public.audit_events FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_events' AND policyname = 'Allow client upsert on confirmed audit events') THEN
        CREATE POLICY "Allow client upsert on confirmed audit events" ON public.audit_events FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_events' AND policyname = 'Allow client update on confirmed audit events') THEN
        CREATE POLICY "Allow client update on confirmed audit events" ON public.audit_events FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 2. AI TELEMETRY REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_telemetry_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL DEFAULT 10143,
    report_id TEXT NOT NULL UNIQUE,
    report_hash TEXT NOT NULL,
    model_version TEXT NOT NULL,
    ruleset_version INTEGER NOT NULL DEFAULT 1,
    risk_level INTEGER NOT NULL DEFAULT 0,
    solvency_health NUMERIC NOT NULL DEFAULT 100.0,
    verdict TEXT NOT NULL DEFAULT 'SOLVENT_NORMAL_OPERATION',
    signer TEXT NOT NULL,
    signature TEXT,
    features JSONB DEFAULT '{}'::jsonb,
    rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_telemetry_chain_id ON public.ai_telemetry_reports (chain_id);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_created_at ON public.ai_telemetry_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_telemetry_risk_level ON public.ai_telemetry_reports (risk_level);

ALTER TABLE public.ai_telemetry_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_telemetry_reports' AND policyname = 'Allow public read on ai_telemetry_reports') THEN
        CREATE POLICY "Allow public read on ai_telemetry_reports" ON public.ai_telemetry_reports FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_telemetry_reports' AND policyname = 'Allow insert on ai_telemetry_reports') THEN
        CREATE POLICY "Allow insert on ai_telemetry_reports" ON public.ai_telemetry_reports FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 3. SEED INITIAL BASELINE AI ATTESTATION REPORT
INSERT INTO public.ai_telemetry_reports (
    chain_id,
    report_id,
    report_hash,
    model_version,
    ruleset_version,
    risk_level,
    solvency_health,
    verdict,
    signer,
    features,
    rules
) VALUES
(
    10143,
    '0x9a8f273618491028374615243546574839201928374657483920192837465748',
    '0x3d7b8a1c9e4f2056781290345678901234567890abcdef1234567890abcdef12',
    'SENTINEL-RF-v1.4',
    1,
    0,
    214.8,
    'SOLVENT_NORMAL_OPERATION',
    '0x230829f5EC30A1936fDECE13F1179381daaf69e8',
    '{"totalDeposits": 500.0, "totalBorrowed": 50.0, "utilizationPct": 10.0, "liquidityBuffer": 450.0}'::jsonb,
    '{"utilizationRule": "NOMINAL_STABLE", "liquidityRule": "HEALTHY_RESERVE", "pauseRule": "UNPAUSED_NORMAL"}'::jsonb
)
ON CONFLICT (report_id) DO NOTHING;
