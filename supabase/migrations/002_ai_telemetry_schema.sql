-- ========================================================
-- FUNDRYX PROTOCOL — MIGRATION 002: AI TELEMETRY & LOGS
-- ========================================================

-- 1. Extend audit_events with structured telemetry columns
ALTER TABLE public.audit_events
ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'ONCHAIN',
ADD COLUMN IF NOT EXISTS correlation_id TEXT,
ADD COLUMN IF NOT EXISTS ai_telemetry JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS error_code TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_events_source ON public.audit_events (source);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation ON public.audit_events (correlation_id);

-- 2. Create AI Telemetry Reports table for advisory attestation logging
CREATE TABLE IF NOT EXISTS public.ai_telemetry_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL DEFAULT 80002,
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

-- 3. Enable RLS on ai_telemetry_reports
ALTER TABLE public.ai_telemetry_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ai_telemetry_reports"
    ON public.ai_telemetry_reports
    FOR SELECT
    USING (true);

CREATE POLICY "Allow insert on ai_telemetry_reports"
    ON public.ai_telemetry_reports
    FOR INSERT
    WITH CHECK (true);

-- 4. Seed initial baseline AI attestation reports
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
    80002,
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
