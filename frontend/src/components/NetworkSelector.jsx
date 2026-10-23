import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../utils/contracts';

const TESTNET_CHAINS = [80002, 10143, 84532, 43113];
const MAINNET_CHAINS = [137, 143, 8453, 43114];

export default function NetworkSelector({
  currentChainId,
  onSwitchNetwork,
  isSwitching,
  networkMode = 'testnet',
  onSelectMode,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(networkMode || 'testnet');
  const dropdownRef = useRef(null);

  // Sync internal tab if prop updates
  useEffect(() => {
    if (networkMode && (networkMode === 'testnet' || networkMode === 'mainnet')) {
      setActiveTab(networkMode);
    }
  }, [networkMode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeNet = SUPPORTED_NETWORKS[currentChainId] || {
    name: `Chain ${currentChainId || 'Unknown'}`,
    shortName: currentChainId ? `Chain ${currentChainId}` : 'Unknown',
    networkType: 'unknown',
    status: 'UNSUPPORTED',
    contractsDeployed: false,
    statusLabel: 'Unsupported Chain',
    iconColor: '#f59e0b',
  };

  const isDeployed = activeNet.contractsDeployed;
  const isMainnet = activeNet.networkType === 'mainnet';

  const visibleChains = activeTab === 'mainnet' ? MAINNET_CHAINS : TESTNET_CHAINS;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="h-10 px-3.5 rounded-[10px] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--border)] flex items-center gap-2 text-xs font-medium text-white transition cursor-pointer disabled:opacity-50"
        title={
          isDeployed
            ? `Connected to ${activeNet.name} — Protocol contracts live`
            : isMainnet
            ? `Connected to ${activeNet.name} — LI.FI cross-chain active`
            : `${activeNet.name} — Pending protocol contract deployment`
        }
      >
        {isSwitching ? (
          <Loader2 size={14} className="animate-spin text-emerald-400" />
        ) : (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: activeNet.iconColor || '#8247E5' }}
          />
        )}

        <div className="flex flex-col text-left leading-none">
          <span className="font-semibold text-white">{activeNet.shortName}</span>
          <span
            className={`text-[9px] font-mono mt-0.5 ${
              isDeployed
                ? 'text-emerald-400 font-bold'
                : isMainnet
                ? 'text-cyan-400 font-semibold'
                : 'text-amber-400 font-medium'
            }`}
          >
            {isDeployed ? 'Protocol Live' : isMainnet ? 'LI.FI Live' : 'Staging'}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-[var(--text-dim)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0c1218] border border-[#1e293b] shadow-2xl p-2.5 z-50 animate-fade-in backdrop-blur-xl">
          {/* Header & Segregation Tabs */}
          <div className="px-2 py-1.5 border-b border-[#1e293b] mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--text-dim)] block">
                Network Architecture
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-muted)]">
                4-Chain Segregated
              </span>
            </div>

            {/* Testnet vs Mainnet Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('testnet');
                  if (onSelectMode) onSelectMode('testnet');
                }}
                className={`py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'testnet'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <ShieldCheck size={12} />
                <span>Testnets (4)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('mainnet');
                  if (onSelectMode) onSelectMode('mainnet');
                }}
                className={`py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'mainnet'
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <Zap size={12} />
                <span>Mainnets (4)</span>
              </button>
            </div>
          </div>

          {/* Network List */}
          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
            {visibleChains.map((cId) => {
              const net = SUPPORTED_NETWORKS[cId];
              const isSelected = currentChainId === cId;
              const hasContracts = net.contractsDeployed;
              const isNetMainnet = net.networkType === 'mainnet';

              return (
                <button
                  key={cId}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (!isSelected && onSwitchNetwork) {
                      onSwitchNetwork(cId);
                    }
                  }}
                  className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-[#15202b] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: net.iconColor }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-white">{net.name}</span>
                        {hasContracts ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Protocol Live
                          </span>
                        ) : isNetMainnet ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {cId === 143 ? 'Inbound Live' : 'LI.FI Live'}
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Pending Deploy
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono block mt-0.5">
                        Chain ID: {net.chainId} · {net.nativeCurrency.symbol}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-[#1e293b] px-2 py-1 flex items-center gap-2 text-[10px] text-[var(--text-dim)]">
            <AlertCircle size={12} className="text-[var(--accent-1)] shrink-0" />
            <span>
              {activeTab === 'testnet'
                ? 'Lending & AMM contracts verified on Polygon Amoy (80002).'
                : 'Mainnet liquidity routes powered by verified LI.FI aggregator.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
