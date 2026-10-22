import { createClient } from '@supabase/supabase-js';

const rawUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) || '';
const SUPABASE_URL = rawUrl.replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && (import.meta?.env?.VITE_SUPABASE_ANON_KEY || import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) || (typeof process !== 'undefined' && (process?.env?.VITE_SUPABASE_ANON_KEY || process?.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase-project') &&
  SUPABASE_URL.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Fetch persistent audit events from Supabase.
 * Returns null if Supabase is not configured or an error occurs.
 */
export async function fetchAuditEventsFromSupabase(limit = 50) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .order('block_number', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase query error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase client error:', err.message);
    return null;
  }
}

/**
 * Upsert on-chain transaction event into Supabase audit ledger.
 */
export async function recordAuditEventToSupabase(event) {
  if (!isSupabaseConfigured || !supabase || !event?.txHash) return null;
  try {
    const payload = {
      chain_id: event.chainId || 80002,
      tx_hash: event.txHash,
      block_number: event.blockNumber || 0,
      event_name: event.type || event.eventName || 'Transaction',
      contract_address: event.contractAddress || '',
      wallet_address: event.fullBorrower || event.borrower || event.from || '',
      amount: event.rawAmount ? Number(event.rawAmount) : null,
      amount_formatted: event.amount || '',
      status: event.status || 'CONFIRMED',
      gas_used: event.gasUsed ? String(event.gasUsed) : null,
      effective_gas_price: event.effectiveGasPrice ? String(event.effectiveGasPrice) : null,
      explorer_url: event.explorerUrl || `https://amoy.polygonscan.com/tx/${event.txHash}`,
      source: event.source || 'ONCHAIN',
      correlation_id: event.correlationId || null,
      ai_telemetry: event.aiTelemetry || null,
      error_code: event.errorCode || null,
      metadata: event.metadata || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('audit_events')
      .upsert(payload, { onConflict: 'tx_hash' });

    if (error) {
      console.warn('Failed to upsert audit event to Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase recordAuditEvent error:', err.message);
    return null;
  }
}

/**
 * Subscribe to real-time audit ledger inserts.
 */
export function subscribeToAuditEvents(onInsert) {
  if (!isSupabaseConfigured || !supabase || typeof onInsert !== 'function') return null;
  try {
    const channel = supabase
      .channel('public:audit_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_events' },
        (payload) => {
          if (payload?.new) onInsert(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to audit_events');
        }
      });
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Audit subscription failed:', err.message);
    return null;
  }
}

/**
 * Fetch persisted AI Telemetry reports.
 */
export async function fetchAiTelemetryReports(limit = 20) {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('ai_telemetry_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetchAiTelemetryReports error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase client error:', err.message);
    return null;
  }
}

/**
 * Record an AI Telemetry attestation report into Supabase.
 */
export async function recordAiTelemetryReport(report) {
  const reportId = report?.report_id || report?.reportId;
  if (!isSupabaseConfigured || !supabase || !reportId) return null;
  try {
    const reportHash = report.report_hash || report.reportHash || '';
    const solvency = typeof report.solvency_health === 'number' 
      ? report.solvency_health 
      : (typeof report.solvencyHealth === 'number' ? report.solvencyHealth : 100.0);

    const payload = {
      chain_id: report.sourceChainId || report.chainId || 80002,
      report_id: reportId,
      report_hash: reportHash,
      model_version: report.model_version || report.modelVersion || 'SENTINEL-RF-v1.4',
      ruleset_version: report.ruleset_version || report.ruleSetVersion || 1,
      risk_level: typeof report.risk_level === 'number' ? report.risk_level : (typeof report.riskLevel === 'number' ? report.riskLevel : 0),
      solvency_health: solvency,
      verdict: report.verdict || 'SOLVENT_NORMAL_OPERATION',
      signer: report.signer || '',
      signature: report.signature || '',
      features: report.features || report.metadata || {},
      rules: report.rules || {},
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ai_telemetry_reports')
      .upsert(payload, { onConflict: 'report_id' });

    if (error) {
      console.warn('Supabase recordAiTelemetryReport error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase recordAiTelemetryReport error:', err.message);
    return null;
  }
}

/**
 * Subscribe to real-time AI Telemetry attestation stream.
 */
export function subscribeToAiTelemetry(onInsert) {
  if (!isSupabaseConfigured || !supabase || typeof onInsert !== 'function') return null;
  try {
    const channel = supabase
      .channel('public:ai_telemetry_reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_telemetry_reports' },
        (payload) => {
          if (payload?.new) onInsert(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to ai_telemetry_reports');
        }
      });
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Telemetry subscription failed:', err.message);
    return null;
  }
}

/**
 * Query Supabase for specific transaction hash.
 */
export async function searchSupabaseAuditByHash(txHash) {
  if (!isSupabaseConfigured || !supabase || !txHash) return null;
  try {
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('tx_hash', txHash.trim())
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
