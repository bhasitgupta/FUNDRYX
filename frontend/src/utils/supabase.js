import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
