import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldCheck, Database, Layers, Radio, Lock, Zap } from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../utils/contracts';

export default function ContractsTransparency() {
  const [selectedChain, setSelectedChain] = useState(80002);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (key, address) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const net = SUPPORTED_NETWORKS[selectedChain] || SUPPORTED_NETWORKS[80002];
  const contracts = net.contracts || {};

  const contractsList = [
    {
      name: 'AccessManager',
      role: 'Role Authority & Multi-Admin',
      address: contracts.AccessManager,
      description: 'Enforces separation of powers between Admins, Operators, and Monitor Signer.',
      icon: Lock,
    },
    {
      name: 'PauseController',
      role: 'Emergency Protocol Pauser',
      address: contracts.PauseController,
      description: 'Circuit breaker preserving unconditional safe borrower repayments.',
      icon: ShieldCheck,
    },
    {
      name: 'FundryxToken (FDX)',
      role: 'Lending Asset (ERC-20)',
      address: contracts.FundryxToken,
      description: 'Standard 18-decimal institutional asset backing liquidity vaults.',
      icon: Layers,
    },
    {
      name: 'FundrexUSD (fUSD)',
      role: 'USD Stable Asset (ERC-20)',
      address: contracts.FundrexUSD,
      description: 'Standard 6-decimal institutional pegged USD asset for credit disbursements.',
      icon: Layers,
    },
    {
      name: 'CreditHistoryRegistry',
      role: 'Repayment Ledger',
      address: contracts.CreditHistoryRegistry,
      description: 'Stores verified repayment counts written strictly by LendingPool.',
      icon: Database,
    },
    {
      name: 'CreditPolicy',
      role: 'Deterministic Formula',
      address: contracts.CreditPolicy,
      description: 'Mathematical credit rules without human bias or offchain scoring.',
      icon: ShieldCheck,
    },
    {
      name: 'LendingPool',
      role: 'Pool Custody & Loans',
      address: contracts.LendingPool,
      description: 'Non-custodial pool managing deposits, borrows, and repayments.',
      icon: Layers,
    },
    {
      name: 'RiskAttestationRegistry',
      role: 'AI Telemetry Feed',
      address: contracts.RiskAttestationRegistry,
      description: 'Cryptographic risk telemetry signed by AI monitor keys.',
      icon: Radio,
    },
    ...(contracts.MockSwapRouter ? [{
      name: 'MockSwapRouter',
      role: 'Liquidity AMM Router',
      address: contracts.MockSwapRouter,
      description: 'Decentralized constant-product liquidity pool router for instant token swaps.',
      icon: Zap,
    }] : []),
  ].filter(c => Boolean(c.address));

  const explorerBase = selectedChain === 10143
    ? 'https://testnet.monadexplorer.com/address/'
    : 'https://amoy.polygonscan.com/address/';

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-5xl mb-10">
        <div className="max-w-2xl">
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

        {/* Network Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#15231c] border border-[#23382c] rounded-xl self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedChain(80002)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              selectedChain === 80002
                ? 'bg-[#1c2e25] text-emerald-400 border border-[#2c4739] shadow-sm'
                : 'text-[#8ca395] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8247E5]" />
            <span>Polygon Amoy</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedChain(10143)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              selectedChain === 10143
                ? 'bg-[#1c2e25] text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-[#8ca395] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#836EF9]" />
            <span>Monad Testnet</span>
          </button>
        </div>
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
                    href={`${explorerBase}${contract.address}`}
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

