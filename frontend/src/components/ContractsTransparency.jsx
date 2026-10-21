import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldCheck, Database, Layers, Radio, Lock } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../utils/contracts';

export default function ContractsTransparency() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (key, address) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contractsList = [
    {
      name: 'AccessManager',
      role: 'Role Authority & Multi-Admin',
      address: CONTRACT_ADDRESSES.AccessManager,
      description: 'Enforces separation of powers between Admins, Operators, and Monitor Signer.',
      icon: Lock,
    },
    {
      name: 'PauseController',
      role: 'Emergency Protocol Pauser',
      address: CONTRACT_ADDRESSES.PauseController,
      description: 'Circuit breaker preserving unconditional safe borrower repayments.',
      icon: ShieldCheck,
    },
    {
      name: 'FundryxToken (FDX)',
      role: 'Lending Asset (ERC-20)',
      address: CONTRACT_ADDRESSES.FundryxToken,
      description: 'Standard 18-decimal institutional asset backing liquidity vaults.',
      icon: Layers,
    },
    {
      name: 'CreditHistoryRegistry',
      role: 'Repayment Ledger',
      address: CONTRACT_ADDRESSES.CreditHistoryRegistry,
      description: 'Stores verified repayment counts written strictly by LendingPool.',
      icon: Database,
    },
    {
      name: 'CreditPolicy',
      role: 'Deterministic Formula',
      address: CONTRACT_ADDRESSES.CreditPolicy,
      description: 'Mathematical credit rules without human bias or offchain scoring.',
      icon: ShieldCheck,
    },
    {
      name: 'LendingPool',
      role: 'Pool Custody & Loans',
      address: CONTRACT_ADDRESSES.LendingPool,
      description: 'Non-custodial pool managing deposits, borrows, and repayments.',
      icon: Layers,
    },
    {
      name: 'RiskAttestationRegistry',
      role: 'AI Telemetry Feed',
      address: CONTRACT_ADDRESSES.RiskAttestationRegistry,
      description: 'Cryptographic risk telemetry signed by AI monitor keys.',
      icon: Radio,
    },
  ];

  return (
    <div className="w-full">
      <div className="max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs text-[#8ca395] font-medium tracking-tight">
          <span className="font-title text-[10px] tracking-wider uppercase text-emerald-400">Stage IV</span>
          <span>·</span>
          <span className="text-[#ecebe1] font-semibold font-title text-[11px] tracking-wider uppercase">Onchain Infrastructure</span>
        </div>
        <h2 className="font-title text-3xl md:text-5xl font-bold tracking-tight text-white">
          Verified Onchain Deployment
        </h2>
        <p className="font-body text-sm text-[#9da59f] mt-2">
          Deployed on institutional smart contracts. Every transaction, event, and credit record is immutable and publicly verifiable.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contractsList.map((contract) => {
          const Icon = contract.icon;
          const isCopied = copiedKey === contract.name;

          return (
            <div
              key={contract.name}
              className="bg-[#15231c] rounded-2xl p-5 border border-[#23382c] shadow-lg flex flex-col justify-between hover:border-emerald-600/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1c2e25] border border-[#2c4739] flex items-center justify-center text-emerald-400">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="font-title text-xs font-bold text-white tracking-wide">{contract.name}</h3>
                      <p className="font-mono text-[9px] text-emerald-400">{contract.role}</p>
                    </div>
                  </div>
                </div>

                <p className="font-body text-xs text-[#8ca395] leading-relaxed mb-4">
                  {contract.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#23382c] flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-[#758a7e] truncate max-w-[170px]" title={contract.address}>
                  {contract.address}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyToClipboard(contract.name, contract.address)}
                    className="p-1.5 text-[#8ca395] hover:text-white rounded-md hover:bg-[#1c2e25] transition cursor-pointer"
                    title="Copy Address"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>

                  <a
                    href={`https://amoy.polygonscan.com/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#8ca395] hover:text-white rounded-md hover:bg-[#1c2e25] transition"
                    title="View on Block Explorer"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
