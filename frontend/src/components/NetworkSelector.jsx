import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../utils/contracts';

const PRIMARY_CHAINS = [80002, 10143, 8453, 43114, 42161];

export default function NetworkSelector({ currentChainId, onSwitchNetwork, isSwitching }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    shortName: 'Unknown',
    status: 'UNSUPPORTED',
    contractsDeployed: false,
    statusLabel: 'Unsupported Chain',
    iconColor: '#f59e0b',
  };

  const isDeployed = activeNet.contractsDeployed;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="h-10 px-3 rounded-[10px] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] border border-[var(--border)] flex items-center gap-2 text-xs font-medium text-white transition cursor-pointer disabled:opacity-50"
        title={isDeployed ? `Connected to ${activeNet.name} — Protocol contracts active` : `${activeNet.name} — Protocol contracts pending deployment`}
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
          <span className={`text-[9px] font-mono mt-0.5 ${isDeployed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-medium'}`}>
            {isDeployed ? 'Active' : 'Staging'}
          </span>
        </div>

        <ChevronDown size={14} className={`text-[var(--text-dim)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0c1218] border border-[#1e293b] shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-[#1e293b] mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--text-dim)] block">
              Multi-Chain Network Selector
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              Switch network via MetaMask
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {PRIMARY_CHAINS.map((cId) => {
              const net = SUPPORTED_NETWORKS[cId];
              const isSelected = currentChainId === cId;
              const hasContracts = net.contractsDeployed;

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
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">{net.name}</span>
                        {hasContracts ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            Protocol Live
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Staging
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono block mt-0.5">
                        {hasContracts ? 'Deterministic Lending Stack' : 'Contracts Pending Audit'}
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

          <div className="mt-2 pt-2 border-t border-[#1e293b] px-3 py-1 flex items-center gap-2 text-[10px] text-[var(--text-dim)]">
            <AlertCircle size={12} className="text-emerald-400 shrink-0" />
            <span>Fundrex protocol contracts currently active on Polygon.</span>
          </div>
        </div>
      )}
    </div>
  );
}
