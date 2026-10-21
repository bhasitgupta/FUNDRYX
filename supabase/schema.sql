-- ========================================================
-- FUNDRYX PROTOCOL — SUPABASE AUDIT TRAIL SCHEMA
-- Network: Polygon Amoy Testnet (Chain ID 80002)
-- Idempotent On-Chain Event & Transaction Hash Ledger
-- ========================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL DEFAULT 80002,
    tx_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    event_name TEXT NOT NULL, -- 'LoanDisbursement', 'LoanRepayment', 'CapitalDeposit', 'Swap', etc.
    contract_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    amount NUMERIC,
    amount_formatted TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'REVERTED', 'PENDING'
    gas_used TEXT,
    effective_gas_price TEXT,
    explorer_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES FOR HIGH-THROUGHPUT AUDIT QUERIES
CREATE INDEX IF NOT EXISTS idx_audit_events_wallet ON public.audit_events (wallet_address);
CREATE INDEX IF NOT EXISTS idx_audit_events_tx_hash ON public.audit_events (tx_hash);
CREATE INDEX IF NOT EXISTS idx_audit_events_event_name ON public.audit_events (event_name);
CREATE INDEX IF NOT EXISTS idx_audit_events_block_number ON public.audit_events (block_number DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events (created_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- Anyone can view verified audit trail events (read-only audit transparency)
CREATE POLICY "Allow public read access to audit events"
    ON public.audit_events
    FOR SELECT
    USING (true);

-- Allow authenticated or anon clients to upsert confirmed on-chain events
CREATE POLICY "Allow client upsert on confirmed audit events"
    ON public.audit_events
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow client update on confirmed audit events"
    ON public.audit_events
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 5. SEED INITIAL VERIFIED POLYGON AMOY TRANSACTIONS
INSERT INTO public.audit_events (
    chain_id,
    tx_hash,
    block_number,
    event_name,
    contract_address,
    wallet_address,
    amount,
    amount_formatted,
    status,
    explorer_url,
    metadata
) VALUES
(
    80002,
    '0x283603fd1883ae05d85cbb220312dcebdc897d5d63343111c0d80fe2c4a92121',
    50702780,
    'CapitalDeposit',
    '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C',
    '0xc90A124b741d48a486950F668BfD62D4B5cF96b4',
    500.0,
    '500.00 FDX',
    'CONFIRMED',
    'https://amoy.polygonscan.com/tx/0x283603fd1883ae05d85cbb220312dcebdc897d5d63343111c0d80fe2c4a92121',
    '{"type": "Deposit", "verified": true}'::jsonb
),
(
    80002,
    '0xf523a1bc8e5cecfaeca2dfb7390b85f524ad2fcb37ad499d6a961eaf47faf5c7',
    50702810,
    'LoanDisbursement',
    '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C',
    '0xc90A124b741d48a486950F668BfD62D4B5cF96b4',
    50.0,
    '50.00 FDX',
    'CONFIRMED',
    'https://amoy.polygonscan.com/tx/0xf523a1bc8e5cecfaeca2dfb7390b85f524ad2fcb37ad499d6a961eaf47faf5c7',
    '{"type": "Borrow", "loanId": "1", "verified": true}'::jsonb
)
ON CONFLICT (tx_hash) DO NOTHING;
