import { ethers } from 'ethers';

// ─────────────────────────────────────────────────────────────
// CENTRALIZED ROUTE STATUS & LIFECYCLE STATE CONSTANTS
// ─────────────────────────────────────────────────────────────

export const CROSS_CHAIN_LIFECYCLE_STATES = {
  IDLE: 'IDLE',
  VALIDATING: 'VALIDATING',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  QUOTING: 'QUOTING',
  AWAITING_SIGNATURE: 'AWAITING_SIGNATURE',
  SOURCE_PENDING: 'SOURCE_PENDING',
  SOURCE_CONFIRMED: 'SOURCE_CONFIRMED',
  BRIDGE_PENDING: 'BRIDGE_PENDING',
  DESTINATION_PENDING: 'DESTINATION_PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  TIMEOUT: 'TIMEOUT',
  REFUND_PENDING: 'REFUND_PENDING',
};

export const ROUTE_STATUS = {
  READY_TO_EXECUTE: 'READY_TO_EXECUTE',
  AWAITING_DEPLOYMENT: 'AWAITING_DEPLOYMENT',
  AWAITING_AUTHORIZATION: 'AWAITING_AUTHORIZATION',
  AUDIT_VERIFICATION_PENDING: 'AUDIT_VERIFICATION_PENDING',
  UNSUPPORTED_ROUTE: 'UNSUPPORTED_ROUTE',
  INSUFFICIENT_LIQUIDITY: 'INSUFFICIENT_LIQUIDITY',
  BRIDGE_UNAVAILABLE: 'BRIDGE_UNAVAILABLE',
  SAME_CHAIN: 'SAME_CHAIN',
};

// ─────────────────────────────────────────────────────────────
// SUPPORTED ASSETS & DECIMAL SPECIFICATIONS
// ─────────────────────────────────────────────────────────────

export const TOKEN_DECIMALS = {
  FDX: 18,
  fUSD: 6,
  USDC: 6,
  MON: 18,
  WMON: 18,
  POL: 18,
  WPOL: 18,
  WMATIC: 18,
  AVAX: 18,
  WAVAX: 18,
  ETH: 18,
  WETH: 18,
  USDT: 6,
};

// ─────────────────────────────────────────────────────────────
// CENTRALIZED ASSET COMPATIBILITY MATRIX
// ─────────────────────────────────────────────────────────────

export const COMPATIBLE_ASSET_MAPPINGS = {
  // Testnet token pairs
  FDX: {
    targetSymbol: 'FDX',
    rate: 1.0,
    supportedChains: [80002, 10143, 43113],
    isBurnAndMint: true,
  },
  fUSD: {
    targetSymbol: 'fUSD',
    rate: 1.0,
    supportedChains: [80002, 10143, 43113],
    isBurnAndMint: true,
  },
  USDC: {
    targetSymbol: 'USDC',
    rate: 1.0,
    supportedChains: [80002, 43113, 84532, 137, 8453, 43114],
    isBurnAndMint: false,
  },
  POL: {
    targetSymbol: 'MON',
    rate: 1.0,
    supportedChains: [80002, 10143],
    isBurnAndMint: false,
  },
  WPOL: {
    targetSymbol: 'WMON',
    rate: 1.0,
    supportedChains: [80002, 10143],
    isBurnAndMint: false,
  },
  MON: {
    targetSymbol: 'POL',
    rate: 1.0,
    supportedChains: [10143, 80002],
    isBurnAndMint: false,
  },
  WMON: {
    targetSymbol: 'WPOL',
    rate: 1.0,
    supportedChains: [10143, 80002],
    isBurnAndMint: false,
  },
  AVAX: {
    targetSymbol: 'POL',
    rate: 1.0,
    supportedChains: [43113, 80002],
    isBurnAndMint: false,
  },
  WAVAX: {
    targetSymbol: 'WPOL',
    rate: 1.0,
    supportedChains: [43113, 80002],
    isBurnAndMint: false,
  },
};

/**
 * Check if token is compatible across source and destination chain
 */
export function getCompatibleDestinationToken(sourceSymbol, sourceChainId, destChainId) {
  if (!sourceSymbol) return null;
  const mapping = COMPATIBLE_ASSET_MAPPINGS[sourceSymbol];
  if (!mapping) return sourceSymbol; // Default to identical ticker if present

  // Direct representation mapping
  if (mapping.supportedChains.includes(sourceChainId) && mapping.supportedChains.includes(destChainId)) {
    return mapping.targetSymbol;
  }

  // Fallback: Check if both chains support same symbol directly
  return sourceSymbol;
}

// ─────────────────────────────────────────────────────────────
// ARBITRARY PRECISION FINANCIAL ARITHMETIC HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Convert user amount string to on-chain BigInt units.
 * Never uses floating-point multiplication.
 */
export function parseTokenUnits(amountStr, decimals = 18) {
  if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
    return 0n;
  }
  // Sanitize decimals precision to prevent parseUnits error
  const cleanStr = amountStr.toString().trim();
  const parts = cleanStr.split('.');
  let sanitized = parts[0];
  if (parts.length > 1) {
    sanitized += '.' + parts[1].slice(0, decimals);
  }
  try {
    return ethers.parseUnits(sanitized, decimals);
  } catch {
    return 0n;
  }
}

/**
 * Format on-chain BigInt units to display string with decimal precision.
 */
export function formatTokenUnits(unitsBigInt, decimals = 18, displayDecimals = 4) {
  if (!unitsBigInt || unitsBigInt <= 0n) return '0.00';
  try {
    const formatted = ethers.formatUnits(unitsBigInt, decimals);
    const num = parseFloat(formatted);
    return isNaN(num) ? '0.00' : num.toFixed(displayDecimals);
  } catch {
    return '0.00';
  }
}

/**
 * Convert between different decimal precisions without float error.
 * e.g. 18 decimals (FDX) to 6 decimals (USDC/fUSD) or vice versa.
 */
export function convertDecimals(amountBigInt, fromDecimals, toDecimals) {
  if (!amountBigInt || amountBigInt <= 0n) return 0n;
  if (fromDecimals === toDecimals) return amountBigInt;
  if (fromDecimals > toDecimals) {
    const diff = BigInt(fromDecimals - toDecimals);
    return amountBigInt / (10n ** diff);
  } else {
    const diff = BigInt(toDecimals - fromDecimals);
    return amountBigInt * (10n ** diff);
  }
}

/**
 * Calculate protocol fee and minimum output units using arbitrary precision.
 */
export function calculateQuoteUnits(inputAmountUnits, feeBps = 25, slippageBps = 50) {
  if (!inputAmountUnits || inputAmountUnits <= 0n) {
    return { feeUnits: 0n, netUnits: 0n, outputUnits: 0n, minReceivedUnits: 0n };
  }
  const feeUnits = (inputAmountUnits * BigInt(feeBps)) / 10000n;
  const netUnits = inputAmountUnits > feeUnits ? inputAmountUnits - feeUnits : 0n;
  const minReceivedUnits = (netUnits * BigInt(10000 - slippageBps)) / 10000n;

  return { feeUnits, netUnits, outputUnits: netUnits, minReceivedUnits };
}

// ─────────────────────────────────────────────────────────────
// BALANCE & AMOUNT VALIDATION ENGINE
// ─────────────────────────────────────────────────────────────

/**
 * Strictly validate transfer amount against user balance and limits.
 * Supports both positional parameters and options object.
 */
export function validateTransferAmount(
  amountOrOpts,
  balanceUnitsArg = null,
  decimalsArg = 18,
  tokenSymbolArg = 'FDX'
) {
  let amountStr, tokenSymbol, decimals, balanceUnits, nativeGasUnits, minTransferStr, maxTransferStr, isNative, estimatedGasUnits;

  if (typeof amountOrOpts === 'object' && amountOrOpts !== null && !(typeof amountOrOpts.toString === 'function' && typeof amountOrOpts.split === 'function')) {
    amountStr = amountOrOpts.amountStr ?? amountOrOpts.amount;
    tokenSymbol = amountOrOpts.tokenSymbol || 'FDX';
    decimals = amountOrOpts.decimals || 18;
    balanceUnits = amountOrOpts.balanceUnits;
    nativeGasUnits = amountOrOpts.nativeGasUnits;
    minTransferStr = amountOrOpts.minTransferStr || '0.0001';
    maxTransferStr = amountOrOpts.maxTransferStr || '1000000';
    isNative = amountOrOpts.isNative || false;
    estimatedGasUnits = amountOrOpts.estimatedGasUnits || 5000000000000000n;
  } else {
    amountStr = amountOrOpts;
    balanceUnits = balanceUnitsArg;
    decimals = decimalsArg || 18;
    tokenSymbol = tokenSymbolArg || 'FDX';
    nativeGasUnits = null;
    minTransferStr = '0.0001';
    maxTransferStr = '1000000';
    isNative = false;
    estimatedGasUnits = 5000000000000000n;
  }

  if (amountStr === undefined || amountStr === null || amountStr.toString().trim() === '') {
    return { isValid: false, code: 'EMPTY_AMOUNT', reason: 'Enter a transfer amount.' };
  }

  const cleanStr = amountStr.toString().trim();
  const num = parseFloat(cleanStr);
  if (isNaN(num)) {
    return { isValid: false, code: 'INVALID_AMOUNT', reason: 'Transfer amount must be a valid number.' };
  }
  if (num === 0) {
    return { isValid: false, code: 'ZERO_AMOUNT', reason: 'Transfer amount must be greater than zero.' };
  }
  if (num < 0) {
    return { isValid: false, code: 'INVALID_AMOUNT', reason: 'Transfer amount cannot be negative.' };
  }

  const amountUnits = parseTokenUnits(cleanStr, decimals);
  const minUnits = parseTokenUnits(minTransferStr, decimals);
  const maxUnits = parseTokenUnits(maxTransferStr, decimals);

  if (minUnits > 0n && amountUnits < minUnits) {
    return {
      isValid: false,
      code: 'BELOW_MINIMUM',
      reason: `Amount is below minimum transfer limit of ${minTransferStr} ${tokenSymbol}.`,
      amountUnits,
    };
  }

  if (maxUnits > 0n && amountUnits > maxUnits) {
    return {
      isValid: false,
      code: 'EXCEEDS_MAXIMUM',
      reason: `Amount exceeds maximum single bridge limit of ${maxTransferStr} ${tokenSymbol}.`,
      amountUnits,
    };
  }

  if (typeof balanceUnits === 'bigint') {
    if (isNative) {
      const totalRequired = amountUnits + estimatedGasUnits;
      if (balanceUnits < totalRequired) {
        const availFmt = ethers.formatUnits(balanceUnits, decimals);
        return {
          isValid: false,
          code: 'INSUFFICIENT_BALANCE',
          reason: `Insufficient ${tokenSymbol} balance to cover transfer and network gas fees. Available: ${parseFloat(availFmt).toFixed(4)} ${tokenSymbol}.`,
          amountUnits,
        };
      }
    } else {
      if (balanceUnits < amountUnits) {
        const availFmt = ethers.formatUnits(balanceUnits, decimals);
        return {
          isValid: false,
          code: 'INSUFFICIENT_BALANCE',
          reason: `Insufficient ${tokenSymbol} balance. You have ${parseFloat(availFmt).toFixed(4)} available, but requested ${amountStr} ${tokenSymbol}.`,
          amountUnits,
        };
      }
      if (typeof nativeGasUnits === 'bigint' && nativeGasUnits < estimatedGasUnits) {
        return {
          isValid: false,
          code: 'INSUFFICIENT_GAS',
          reason: 'Insufficient native gas token to pay source chain transaction fees.',
          amountUnits,
        };
      }
    }
  }

  return { isValid: true, code: 'VALID', amountUnits };
}

// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE PERSISTENT TRANSACTION RECOVERY
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fundrex_active_cross_transfers';

export function saveCrossChainTransfer(transfer) {
  if (typeof window === 'undefined' || !transfer || !transfer.transferId) return;
  try {
    const existing = getActiveCrossChainTransfers();
    const updated = [transfer, ...existing.filter((t) => t.transferId !== transfer.transferId)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { }
}

export function updateCrossChainTransfer(transferId, updates) {
  if (typeof window === 'undefined' || !transferId) return;
  try {
    const existing = getActiveCrossChainTransfers();
    const updated = existing.map((t) => (t.transferId === transferId ? { ...t, ...updates } : t));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { }
}

export function getActiveCrossChainTransfers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearActiveCrossChainTransfers() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { }
}

