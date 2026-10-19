import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import MagicBento from './MagicBento';
import BranchedMenu from './BranchedMenu';
import {
  Rocket01Icon,
  Layers01Icon,
  Notification03Icon,
  CursorPointer01Icon,
  TextFontIcon,
  Download04Icon,
} from '@hugeicons/core-free-icons';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  ShieldCheck,
  Radio,
  Layers,
  TrendingUp,
  BarChart3,
  FileText,
  DollarSign,
  Wallet,
  ExternalLink,
  ChevronRight,
  Activity,
  Lock,
  RefreshCw,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Sliders,
  Check,
  Cpu,
  Zap,
  Scale,
  Award,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

export default function FundryxAppPortal({
  wallet,
  poolStats,
  onConnect,
  onDisconnect,
  onBackToLanding,
  initialTab = 'overview',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Loan Calculator state
  const [borrowInput, setBorrowInput] = useState(25000);
  const [borrowTerm, setBorrowTerm] = useState(14);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  // Supply Vault state
  const [supplyAsset, setSupplyAsset] = useState('USDC');
  const [supplyAmount, setSupplyAmount] = useState('10000');
  const [supplySuccess, setSupplySuccess] = useState(false);

  // Repay state
  const [repaySuccess, setRepaySuccess] = useState(false);

  // Swap state
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('FDX');
  const [swapAmount, setSwapAmount] = useState('5000');
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Stress test simulator state
  const [stressShock, setStressShock] = useState(25);

  // Credit simulator state
  const [simRepay, setSimRepay] = useState(15000);
  const [simStake, setSimStake] = useState(5000);

  // Live Simulated Loans
  const [activeLoans, setActiveLoans] = useState([
    { id: 'LOAN-8891', asset: 'USDC', amount: 15000, apr: '5.20%', dueDays: 6, progress: '70%', status: 'Active', tier: 'Prime Tier 1' },
    { id: 'LOAN-8842', asset: 'EURC', amount: 33210, apr: '4.80%', dueDays: 12, progress: '45%', status: 'Active', tier: 'Prime Tier 1' },
    { id: 'LOAN-7920', asset: 'FDX', amount: 50000, apr: '6.10%', dueDays: 0, progress: '100%', status: 'Settled', tier: 'Prime Tier 1' },
  ]);

  // Real-time protocol activity feed
  const [activityFeed, setActivityFeed] = useState([
    { id: 'EV-9921', type: 'Repayment', borrower: '0x8b3f...41e9', amount: '12,500 USDC', score: '+18 Prime', time: '2m ago', verified: true },
    { id: 'EV-9920', type: 'Disbursement', borrower: '0x3c19...9a72', amount: '45,000 EURC', score: '792 Scored', time: '8m ago', verified: true },
    { id: 'EV-9919', type: 'Yield Compound', borrower: 'Liquidity Vault #1', amount: '3,840 USDC', score: 'APY 7.80%', time: '14m ago', verified: true },
    { id: 'EV-9918', type: 'Risk Consensus', borrower: 'AI Sentinel Quorum', amount: '3/3 Nodes', score: '100% Solvency', time: '22m ago', verified: true },
    { id: 'EV-9917', type: 'Capital Supply', borrower: '0x71c9...49a2', amount: '25,000 FDX', score: 'Tier 1 Prime', time: '34m ago', verified: true },
  ]);

  // Order Book Mock Data
  const orderBookAsks = [
    { price: 1.0042, size: '24,500', total: '24,602.90', depth: 85 },
    { price: 1.0035, size: '18,200', total: '18,263.70', depth: 65 },
    { price: 1.0028, size: '35,000', total: '35,098.00', depth: 95 },
    { price: 1.0019, size: '12,400', total: '12,423.56', depth: 40 },
    { price: 1.0011, size: '42,000', total: '42,046.20', depth: 100 },
  ];
  const orderBookBids = [
    { price: 0.9998, size: '38,100', total: '38,092.38', depth: 90 },
    { price: 0.9992, size: '15,600', total: '15,587.52', depth: 45 },
    { price: 0.9985, size: '29,400', total: '29,355.90', depth: 70 },
    { price: 0.9978, size: '19,800', total: '19,756.44', depth: 55 },
    { price: 0.9970, size: '51,200', total: '51,046.40', depth: 100 },
  ];

  // Recent Market Trades
  const marketTrades = [
    { id: 'TRD-4401', pair: 'USDC/FDX', type: 'Buy', price: '1.0012', size: '15,000', time: '1m ago', hash: '0x3f1a...48b9' },
    { id: 'TRD-4400', pair: 'EURC/USDC', type: 'Sell', price: '1.0820', size: '22,400', time: '4m ago', hash: '0x99c2...51da' },
    { id: 'TRD-4399', pair: 'FDX/USDC', type: 'Buy', price: '1.0008', size: '50,000', time: '9m ago', hash: '0x2a8b...773e' },
    { id: 'TRD-4398', pair: 'USDC/EURC', type: 'Buy', price: '0.9240', size: '10,000', time: '15m ago', hash: '0x88f4...11a0' },
  ];

  const handleExecuteBorrow = () => {
    setBorrowSuccess(true);
    const newLoan = {
      id: `LOAN-${Math.floor(1000 + Math.random() * 9000)}`,
      asset: 'USDC',
      amount: Number(borrowInput),
      apr: '5.20%',
      dueDays: borrowTerm,
      progress: '10%',
      status: 'Active',
      tier: 'Prime Tier 1',
    };
    setActiveLoans([newLoan, ...activeLoans]);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Disbursement', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: `${Number(borrowInput).toLocaleString()} USDC`, score: '785 Prime', time: 'Just now', verified: true },
      ...activityFeed,
    ]);
    setTimeout(() => setBorrowSuccess(false), 4000);
  };

  const handleExecuteSupply = () => {
    setSupplySuccess(true);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Liquidity Deposit', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: `${Number(supplyAmount).toLocaleString()} ${supplyAsset}`, score: 'Reserve Backed', time: 'Just now', verified: true },
      ...activityFeed,
    ]);
    setTimeout(() => setSupplySuccess(false), 4000);
  };

  const handleExecuteRepay = (id) => {
    setActiveLoans(activeLoans.map((l) => (l.id === id ? { ...l, status: 'Settled', progress: '100%' } : l)));
    setRepaySuccess(true);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Repayment', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: 'Verified Full Settlement', score: '+15 Prime Boost', time: 'Just now', verified: true },
      ...activityFeed,
    ]);
    setTimeout(() => setRepaySuccess(false), 4000);
  };

  const handleExecuteSwap = () => {
    setSwapSuccess(true);
    setTimeout(() => setSwapSuccess(false), 3500);
  };

  const overviewBentoItems = [
    {
      label: 'Zero-Collateral Borrowing',
      title: 'Able Credit',
      description: 'Institutional credit lines with algorithmic interest rate curves, zero-haircut drawdowns, and real-time debt servicing.',
      visual: 'analytics',
      colSpan: 2,
      rowSpan: 1,
      glowColor: '#10b981',
      headerColor: '#34d399',
      icon: <HugeiconsIcon icon={Rocket01Icon} size={16} strokeWidth={1.8} />,
      onClick: () => setActiveTab('lending')
    },
    {
      label: 'zkSNARK Credential Proofs',
      title: 'Borderline Verify',
      description: 'Zero-knowledge solvency attestations and Tier 1 institutional verification (Prime Score 785) without wallet address exposure.',
      visual: 'security',
      colSpan: 2,
      rowSpan: 1,
      glowColor: '#06b6d4',
      headerColor: '#38bdf8',
      icon: <HugeiconsIcon icon={CursorPointer01Icon} size={16} strokeWidth={1.8} />,
      onClick: () => setActiveTab('credit')
    },
    {
      label: 'Autonomous Risk Sentinel',
      title: 'AI Risk Telemetry',
      description: 'Dynamic liquidity drain indexing, borrower velocity sensors, and multi-validator quorum consensus safeguarding capital.',
      visual: 'automation',
      colSpan: 2,
      rowSpan: 1,
      glowColor: '#f97316',
      headerColor: '#fb923c',
      icon: <HugeiconsIcon icon={Notification03Icon} size={16} strokeWidth={1.8} />,
      onClick: () => setActiveTab('risk')
    },
    {
      label: 'Digital Inventory Pools',
      title: 'Capital Markets',
      description: 'Federated liquidity vaults, multi-asset yield compounding, and automated USDC/EURC treasury balance allocation.',
      visual: 'dashboard',
      colSpan: 1,
      rowSpan: 1,
      glowColor: '#a855f7',
      headerColor: '#c084fc',
      icon: <HugeiconsIcon icon={Layers01Icon} size={16} strokeWidth={1.8} />,
      onClick: () => setActiveTab('markets')
    },
    {
      label: 'Marketplace Legal Terms',
      title: 'Leganetum',
      description: 'Institutional master loan agreements, decentralized dispute arbitration, and binding smart legal covenants.',
      visual: 'collaboration',
      colSpan: 1,
      rowSpan: 1,
      glowColor: '#3b82f6',
      headerColor: '#60a5fa',
      icon: <HugeiconsIcon icon={TextFontIcon} size={16} strokeWidth={1.8} />,
      onClick: () => setActiveTab('terms')
    }
  ];

  const sidebarNavItems = [
    {
      label: 'Protocol Facilities',
      children: [
        { value: 'overview', label: 'Overview & Portfolio', icon: Layers01Icon },
        { value: 'lending', label: 'Able Credit (Borrow & Lend)', icon: Rocket01Icon },
        { value: 'credit', label: 'Borderline Verify (Score)', icon: CursorPointer01Icon },
        { value: 'risk', label: 'AI Risk Telemetry', icon: Notification03Icon },
        { value: 'markets', label: 'Capital Markets', icon: TextFontIcon }
      ]
    },
    {
      label: 'Leganetum Governance',
      children: [
        { value: 'terms', label: 'Legal & Risk Terms', icon: Download04Icon },
        { value: 'landing', label: 'Website Home', icon: Rocket01Icon }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c1611] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(46,74,58,0.3),transparent_70%)] text-[#ecebe1] flex font-body antialiased w-full">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR NAVIGATION PANEL - USING BRANCHEDMENU        */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 min-h-screen border-r border-[#1c2e24] bg-[#0c1410] sticky top-0 h-screen flex-col justify-between p-6 z-40 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Brand Logo & Portal Badge */}
          <button onClick={onBackToLanding} className="flex items-center gap-3.5 cursor-pointer group text-left">
            <div className="p-2 rounded-xl bg-white/90 shadow-sm border border-[#ded8cb]">
              <img src="/fundryx-logo.png" alt="Fundryx" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-emerald-400 transition">
                FUNDRYX
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider mt-1">
                PORTAL v4 · MAINNET
              </span>
            </div>
          </button>

          {/* Left-Side Primary Navigation via BranchedMenu */}
          <div className="pt-2">
            <BranchedMenu
              items={sidebarNavItems}
              defaultOpen={[0, 1]}
              defaultActive={activeTab}
              onSelect={(val) => {
                if (val === 'landing') onBackToLanding?.();
                else {
                  setActiveTab(val);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              color="#8fa799"
              accentColor="#10b981"
              lineColor="#263e30"
              width={260}
              rowHeight={40}
              indent={38}
              trunk={14}
              radius={10}
              lineWidth={1.5}
              fontSize={14}
            />
          </div>
        </div>

        {/* Sidebar Institutional Bottom Card */}
        <div className="pt-5 border-t border-[#1c2e24] flex flex-col gap-2.5 text-xs text-[#71877b]">
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Quorum 3/3 Synchronized</span>
          </div>
          <div className="font-mono text-[11px] text-[#556b5e]">
            Epoch 4,192 · Deterministic
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT WORKSPACE                                    */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-20 px-6 lg:px-10 border-b border-[#1c2e24] bg-[#0c1410] sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#16251e] border border-[#253e30] text-[#a0b8aa]"
            >
              <Layers size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71877b]">Portal</span>
              <span className="text-[#2c4234]">/</span>
              <span className="text-sm md:text-base font-bold text-white tracking-wide">
                {activeTab === 'overview' && 'Overview & Portfolio'}
                {activeTab === 'lending' && 'Able Credit · Borrow & Lend'}
                {activeTab === 'credit' && 'Borderline Verify · zkSNARK Identity'}
                {activeTab === 'risk' && 'AI Risk Telemetry Sentinel'}
                {activeTab === 'markets' && 'Capital Markets · Federated Vaults'}
                {activeTab === 'terms' && 'Leganetum · Legal & Risk Terms'}
              </span>
            </div>
          </div>

          {/* Right Controls: Website & Wallet */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#1c2e24] hover:bg-[#253f31] border border-[#2d4d3b] text-base font-bold text-[#e6ece8] hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-emerald-950/40"
            >
              <ArrowDownLeft size={20} className="text-emerald-400 rotate-45" />
              <span>Website</span>
            </button>

            {wallet.address ? (
              <div className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-xl bg-[#132319] border border-[#263e30] flex items-center gap-3 text-base font-mono text-emerald-300 font-bold shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                  <span className="text-[#657d70] text-sm font-semibold">({wallet.balance || '10,000'} FDX)</span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/60 text-xs font-bold text-rose-300 transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white text-base md:text-lg font-black shadow-xl shadow-emerald-950/80 transition-all cursor-pointer flex items-center gap-2.5"
              >
                <Wallet size={20} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#1c2e24] bg-[#0c1410] p-6 flex flex-col gap-4">
            <BranchedMenu
              items={sidebarNavItems}
              defaultOpen={[0, 1]}
              defaultActive={activeTab}
              onSelect={(val) => {
                setMobileMenuOpen(false);
                if (val === 'landing') onBackToLanding?.();
                else {
                  setActiveTab(val);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              color="#8fa799"
              accentColor="#10b981"
              lineColor="#263e30"
              width={280}
              rowHeight={36}
              indent={36}
              trunk={14}
              radius={10}
              lineWidth={1.5}
              fontSize={13}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN APP WORKSPACE - BALANCED LAYOUT SYSTEM               */}
        {/* ========================================================= */}
        <main className="flex-1 max-w-7xl mx-auto w-full py-8 lg:py-10 px-4 sm:px-6 lg:px-8 flex flex-col gap-8 lg:gap-10">

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & PORTFOLIO                               */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            {/* Hero Banner */}
            <div className="portal-card relative p-7 sm:p-9 lg:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] via-[#122018] to-[#0f1b13] border border-[#263e30] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-teal-500/4 blur-3xl pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-300 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-700/40">Verified Institutional Identity</span>
                    <span className="text-xs font-semibold text-amber-300 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/40">Tier 1 Prime · Score 785</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-[#e8f0eb] to-[#a8c8b5] bg-clip-text text-transparent tracking-tight">
                    Capital Liquidity &amp; Credit Dashboard
                  </h1>
                  <p className="text-sm text-[#8fa799] mt-2.5 max-w-xl leading-relaxed">
                    Real-time portfolio management, deterministic risk limits, and zero-collateral uncollateralized lending.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <button onClick={() => setActiveTab('lending')} className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/60 transition cursor-pointer hover:scale-105">
                    Borrow Capital
                  </button>
                  <button onClick={() => setActiveTab('credit')} className="px-6 py-3.5 rounded-xl bg-[#132219] hover:bg-[#1a2d21] border border-[#263e30] text-[#c8d8e8] text-sm font-bold transition cursor-pointer shadow-md">
                    Inspect Score
                  </button>
                </div>
              </div>
            </div>

            {/* Unified Executive Metric Ribbon — 4-color accent */}
            <div className="rounded-2xl border border-[#1c2e24] bg-[#0d1a12] shadow-xl grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
              <div className="p-6 lg:p-7 flex flex-col gap-3 border-b lg:border-b-0 border-r border-[#1c2e24]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Total Net Worth</span>
                  <span className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/40"><DollarSign size={13} className="text-emerald-400" /></span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums">$&thinsp;1,332,718</div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1c2e24]">
                  <span className="text-[#71877b]">Quarter-to-date</span>
                  <span className="badge-emerald">▲ +11.8%</span>
                </div>
              </div>
              <div className="p-6 lg:p-7 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-[#1c2e24] bg-[#0c1916]/50">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Active Credit Line</span>
                  <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/40"><ShieldCheck size={13} className="text-cyan-400" /></span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-cyan-300 tracking-tight tabular-nums">$&thinsp;250,000</div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1c2e24]">
                  <span className="text-[#71877b]">Tier 1 (Score 785)</span>
                  <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">Prime Qualified</span>
                </div>
              </div>
              <div className="p-6 lg:p-7 flex flex-col gap-3 border-r border-[#1c2e24] bg-[#1a140a]/40">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Current Borrowed</span>
                  <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/40"><Clock size={13} className="text-amber-400" /></span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight tabular-nums">$&thinsp;48,210</div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1c2e24]">
                  <span className="text-[#71877b]">Due in 6 days</span>
                  <span className="badge-amber">2 Active Loans</span>
                </div>
              </div>
              <div className="p-6 lg:p-7 flex flex-col gap-3 bg-[#0f1420]/60">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Weighted Supply APY</span>
                  <span className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/40"><TrendingUp size={13} className="text-purple-400" /></span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-purple-300 tracking-tight tabular-nums">7.80% APY</div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1c2e24]">
                  <span className="text-[#71877b]">Solvency Reserve</span>
                  <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full">100% Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Core Protocol Facilities Streamlined Navigation Directory */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Protocol Facilities &amp; Architecture</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Modular Execution Suite
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8fa799] font-medium bg-[#132319] px-3.5 py-1.5 rounded-xl border border-[#243d2f] self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5 Active Facilities</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    title: 'Able Credit',
                    subtitle: 'Borrow & Lend',
                    tag: 'Zero-Collateral',
                    desc: 'Algorithmic rate curves, uncollateralized drawdowns & real-time servicing.',
                    tab: 'lending',
                    icon: <ArrowUpRight size={18} className="text-emerald-400" />,
                    iconBg: 'bg-emerald-950/80 border-emerald-800/40',
                    tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
                    linkColor: 'text-emerald-400',
                    cardBg: 'from-[#132219] to-[#0c1611] border-[#203328] hover:border-emerald-500/50'
                  },
                  {
                    title: 'Borderline Verify',
                    subtitle: 'zkSNARK Identity',
                    tag: 'Prime Score 785',
                    desc: 'Zero-knowledge solvency attestations without wallet address exposure.',
                    tab: 'credit',
                    icon: <ShieldCheck size={18} className="text-cyan-400" />,
                    iconBg: 'bg-cyan-950/80 border-cyan-800/40',
                    tagColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40',
                    linkColor: 'text-cyan-400',
                    cardBg: 'from-[#0e1e24] to-[#0c1611] border-[#1c3040] hover:border-cyan-500/50'
                  },
                  {
                    title: 'AI Risk Sentinel',
                    subtitle: 'Telemetry Suite',
                    tag: 'Live Guard',
                    desc: 'Dynamic liquidity drain indexing & 3-node offchain consensus protection.',
                    tab: 'risk',
                    icon: <Radio size={18} className="text-amber-400" />,
                    iconBg: 'bg-amber-950/80 border-amber-800/40',
                    tagColor: 'text-amber-300 bg-amber-950/60 border-amber-800/40',
                    linkColor: 'text-amber-400',
                    cardBg: 'from-[#201a0e] to-[#0c1611] border-[#3a2e1c] hover:border-amber-500/50'
                  },
                  {
                    title: 'Capital Markets',
                    subtitle: 'Federated Vaults',
                    tag: 'Instant Swaps',
                    desc: 'Multi-asset liquidity depth, live order book, and automated treasury compound.',
                    tab: 'markets',
                    icon: <BarChart3 size={18} className="text-purple-400" />,
                    iconBg: 'bg-purple-950/80 border-purple-800/40',
                    tagColor: 'text-purple-300 bg-purple-950/60 border-purple-800/40',
                    linkColor: 'text-purple-400',
                    cardBg: 'from-[#180f24] to-[#0c1611] border-[#2d1e40] hover:border-purple-500/50'
                  },
                  {
                    title: 'Leganetum',
                    subtitle: 'Legal Governance',
                    tag: 'Binding Covenants',
                    desc: 'Institutional master loan agreements and decentralized dispute arbitration.',
                    tab: 'terms',
                    icon: <FileText size={18} className="text-sky-400" />,
                    iconBg: 'bg-sky-950/80 border-sky-800/40',
                    tagColor: 'text-sky-300 bg-sky-950/60 border-sky-800/40',
                    linkColor: 'text-sky-400',
                    cardBg: 'from-[#0e1820] to-[#0c1611] border-[#1c2d3c] hover:border-sky-500/50'
                  }
                ].map((facility, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(facility.tab)}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${facility.cardBg} border transition-all cursor-pointer text-left flex flex-col gap-4 group shadow-sm hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`p-2.5 rounded-xl border ${facility.iconBg}`}>
                        {facility.icon}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${facility.tagColor}`}>
                        {facility.tag}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-white">{facility.title}</h3>
                      <p className="text-[10px] font-semibold text-[#71877b] uppercase tracking-wider">{facility.subtitle}</p>
                      <p className="text-xs text-[#8fa799] mt-1 line-clamp-2 leading-relaxed">{facility.desc}</p>
                    </div>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold group-hover:translate-x-0.5 transition">
                      <span className={facility.linkColor}>Launch Terminal</span>
                      <ChevronRight size={13} className={facility.linkColor} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle Section: Active Loans (Col-7) + AI Risk Sentinel (Col-5) */}
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
              {/* Active Capital Loans Table Panel */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#203328] shadow-xl flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-[#1c2e24]">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                        <Layers size={18} />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-wide uppercase">Active Capital Loans</h3>
                        <p className="text-xs text-[#8fa799]">Current uncollateralized loan facilities</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                      Zero Collateral
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-[#1c2e24] bg-[#09120d] overflow-x-auto">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th className="text-left">Loan ID</th>
                          <th className="text-right">Principal</th>
                          <th className="text-right">Fixed APR</th>
                          <th className="text-right">Maturity</th>
                          <th className="text-center">Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLoans.map((loan) => (
                          <tr key={loan.id}>
                            <td className="font-mono text-xs text-[#8fa799] text-left">{loan.id}</td>
                            <td className="font-semibold text-white text-right tabular-nums whitespace-nowrap">{loan.amount.toLocaleString()} {loan.asset}</td>
                            <td className="text-emerald-400 font-mono font-semibold text-right tabular-nums">{loan.apr}</td>
                            <td className="text-[#8fa799] text-right whitespace-nowrap">{loan.status === 'Active' ? `In ${loan.dueDays} days` : 'Matured'}</td>
                            <td className="text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                                loan.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-stone-900 text-stone-400'
                              }`}>
                                {loan.status}
                              </span>
                            </td>
                            <td className="text-right">
                              {loan.status === 'Active' ? (
                                <button
                                  onClick={() => handleExecuteRepay(loan.id)}
                                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  Settle Now
                                </button>
                              ) : (
                                <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Receipt Verified</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-5 mt-6 border-t border-[#1c2e24] flex items-center justify-between text-xs text-[#71877b]">
                  <span>Total 3 positions tracked</span>
                  <span className="font-mono text-emerald-400 font-semibold">100% Repayment Confidence Index</span>
                </div>
              </div>

              {/* AI Risk Sentinel Telemetry Card */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-[#1c3040] shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-5 border-b border-[#1c3040]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400"><Radio size={16} /></span>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide uppercase">AI Risk Sentinel</h3>
                      <p className="text-xs text-[#8fa799]">Offchain solvency oversight</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-700/50">Live Guard</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase text-[#8fa799]">Liquidity Drain Index</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">0.02% (Optimal)</span>
                    </div>
                    <div className="text-xs text-[#71877b]">No anomalous outflow detected across 24h</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase text-[#8fa799]">Borrower Velocity Sensor</span>
                      <span className="text-sm font-bold text-cyan-300">Conforming</span>
                    </div>
                    <div className="text-xs text-[#71877b]">Repayment pacing conforms to Tier 1 standards</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase text-[#8fa799]">Quorum Consensus</span>
                      <span className="text-xs font-mono text-cyan-300 font-bold">3/3 Signatures</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#71877b] truncate">Hash: 0x9d4a82...c77b (Verified)</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#1c3040] mt-auto">
                  <button onClick={() => setActiveTab('risk')} className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-950/80 to-teal-950/80 hover:from-cyan-900 hover:to-teal-900 border border-cyan-700/60 text-xs font-bold uppercase tracking-wider text-cyan-200 transition cursor-pointer shadow-md">
                    Open Risk Telemetry Feed →
                  </button>
                </div>
              </div>
            </div>

            {/* Treasury Reserves — purple accent section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#180f24] via-[#130e1d] to-[#0c1611] border border-[#2d1e40] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2d1e40] gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400"><BarChart3 size={18} /></span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Treasury Reserves &amp; Capital Allocation</h3>
                    <p className="text-xs text-[#9eb5a7] mt-0.5">Automated yield compounding across segregated non-custodial vaults</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-3.5 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/40">Total TVL: $11,480,000</span>
                  <button onClick={() => setActiveTab('lending')} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">+ Supply Vault</button>
                </div>
              </div>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { asset: 'USDC Vault', balance: '$ 912,400', apy: '8.20% APY', alloc: 48, color: 'bg-emerald-500', apyColor: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/30' },
                  { asset: 'EURC Vault', balance: '€ 228,900', apy: '7.10% APY', alloc: 22, color: 'bg-cyan-500', apyColor: 'text-cyan-300', bg: 'bg-cyan-950/20 border-cyan-800/30' },
                  { asset: 'USD Liquid', balance: '$ 540,000', apy: '6.50% APY', alloc: 18, color: 'bg-amber-500', apyColor: 'text-amber-300', bg: 'bg-amber-950/20 border-amber-800/30' },
                  { asset: 'FDX Native', balance: '✦ 9,820,000', apy: '9.40% APY', alloc: 12, color: 'bg-purple-500', apyColor: 'text-purple-300', bg: 'bg-purple-950/20 border-purple-800/30' },
                ].map((vault, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${vault.bg} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{vault.asset}</span>
                      <span className={`text-xs font-mono font-semibold ${vault.apyColor}`}>{vault.apy}</span>
                    </div>
                    <div className="text-xl font-bold text-white tracking-tight tabular-nums">{vault.balance}</div>
                    <div>
                      <div className="flex justify-between text-xs text-[#8fa799] mb-1.5">
                        <span>Vault Allocation</span>
                        <span className="font-semibold text-white tabular-nums">{vault.alloc}%</span>
                      </div>
                      <div className="progress-track h-2"><div className={`progress-fill ${vault.color}`} style={{ width: `${vault.alloc}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Protocol Event Stream */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1820] to-[#0c1611] border border-[#1c2d3c] shadow-xl">
              <div className="flex items-center justify-between pb-5 border-b border-[#1c2d3c]">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/40 text-sky-400"><Activity size={18} /></span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Live Protocol Event Stream</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Real-time ledger audit log of disbursements, yields, and repayments</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-sky-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Synchronized to deterministic consensus
                </span>
              </div>
              <div className="mt-5 rounded-xl border border-[#1c2d3c] bg-[#09111a]/80 divide-y divide-[#1c2d3c] overflow-hidden">
                {activityFeed.map((ev) => (
                  <div key={ev.id} className="py-3.5 px-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#111d2a]/60 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-[#71877b]">{ev.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        ev.type === 'Repayment' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50' :
                        ev.type === 'Disbursement' ? 'bg-teal-950/70 text-teal-300 border border-teal-800/50' :
                        ev.type === 'Yield Compound' ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50' :
                        ev.type === 'Capital Supply' ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50' :
                        'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                      }`}>{ev.type}</span>
                      <span className="font-mono text-xs text-[#9eb5a7]">{ev.borrower}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-semibold text-emerald-400 font-mono tabular-nums">{ev.amount}</span>
                      <span className="text-xs text-[#71877b] hidden sm:block">{ev.score}</span>
                      <span className="text-xs font-mono text-[#8fa799]">{ev.time}</span>
                      <span className="text-xs text-emerald-400 font-bold">✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BORROW & LEND CAPITAL POOLS                        */}
        {/* ========================================================= */}
        {activeTab === 'lending' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            {borrowSuccess && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-[#12281b] border border-emerald-500/50 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span>Success! Uncollateralized facility of ${Number(borrowInput).toLocaleString()} USDC disbursed instantly.</span>
                </div>
                <span className="font-mono text-xs text-emerald-300">Tx: 0x9f1a...48b2</span>
              </div>
            )}

            {supplySuccess && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/60 to-[#12281b] border border-teal-500/50 text-teal-200 text-sm font-semibold flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-teal-400" />
                  <span>Success! Capital supply of {Number(supplyAmount).toLocaleString()} {supplyAsset} allocated to non-custodial yield vault.</span>
                </div>
                <span className="font-mono text-xs text-teal-300">Tx: 0x82b4...91fe</span>
              </div>
            )}

            {/* Section Header */}
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-700/50 text-emerald-400"><ArrowUpRight size={20} /></span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Able Credit — Borrow &amp; Lend</h2>
                <p className="text-sm text-[#8fa799] mt-0.5">Uncollateralized capital facilities powered by deterministic Prime scoring</p>
              </div>
            </div>

            {/* Unified Executive Metric Ribbon */}
            <div className="rounded-2xl border border-[#203328] bg-[#122018]/90 backdrop-blur-md shadow-lg grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1c2e24] overflow-hidden">
              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Available Liquidity</span>
                  <DollarSign size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums my-2">
                  $&thinsp;11.48M
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Solvency Buffer</span>
                  <span className="badge-emerald">100% Guard</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Active Borrow Volume</span>
                  <Activity size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight tabular-nums my-2">
                  $&thinsp;48,210
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Pacing Conforming</span>
                  <span className="badge-emerald">12 Repaid</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Prime Borrow Rate</span>
                  <Lock size={15} className="text-amber-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight tabular-nums my-2">
                  5.20% Fixed
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Tenure 7-30 Days</span>
                  <span className="badge-amber">Zero Collateral</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Weighted Supply APY</span>
                  <TrendingUp size={15} className="text-teal-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-teal-300 tracking-tight tabular-nums my-2">
                  7.80% APY
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Yield Compounding</span>
                  <span className="badge-emerald">Continuous</span>
                </div>
              </div>
            </div>

            {/* Dual Interactive Terminals: Borrow & Supply */}
            <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 items-stretch">
              {/* Borrow Panel — emerald */}
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#22382b] shadow-xl flex flex-col gap-7">
                <div className="flex items-center justify-between pb-5 border-b border-[#203328]">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400"><ArrowUpRight size={18} /></span>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-wide uppercase">Request Uncollateralized Loan</h2>
                      <p className="text-xs text-[#8fa799] mt-0.5">Instant disbursement based on Prime scoring</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">Prime Eligible</span>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="p-5 rounded-xl bg-[#09120d] border border-[#1c2e24]">
                    <div className="flex justify-between items-center text-sm text-[#8fa799] mb-3 font-semibold">
                      <span>Borrow Amount</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">${Number(borrowInput).toLocaleString()} USDC</span>
                    </div>
                    <input type="range" min="1000" max="250000" step="1000" value={borrowInput} onChange={(e) => setBorrowInput(e.target.value)} className="w-full accent-emerald-500 cursor-pointer" />
                    <div className="flex justify-between text-xs text-[#6e8576] mt-2 font-mono">
                      <span>Min $1,000</span>
                      <span>Max $250,000</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#8fa799] mb-3">Repayment Tenure</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[7, 14, 30].map((days) => (
                        <button key={days} type="button" onClick={() => setBorrowTerm(days)} className={`py-3 px-4 rounded-xl text-sm font-bold transition cursor-pointer text-center ${
                          borrowTerm === days ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-md' : 'bg-[#09120d] text-[#8fa799] border border-[#1c2e24] hover:bg-[#16271e]'
                        }`}>{days} DAYS</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#09120d] border border-[#1c2e24] flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Fixed Protocol APR</span>
                      <span className="font-mono text-emerald-400 font-bold">5.20%</span>
                    </div>
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Estimated Total Repayment</span>
                      <span className="font-mono text-white font-bold tabular-nums">${(Number(borrowInput) * (1 + (0.052 * borrowTerm) / 365)).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Collateral Requirement</span>
                      <span className="text-emerald-400 font-bold">Zero Collateral</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#1c2e24]">
                  <button onClick={handleExecuteBorrow} className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-emerald-900/50 transition cursor-pointer">
                    Execute Uncollateralized Loan
                  </button>
                </div>
              </div>

              {/* Supply Vault Panel — cyan/teal accent */}
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-[#1c3040] shadow-xl flex flex-col gap-7">
                <div className="flex items-center justify-between pb-5 border-b border-[#1c3040]">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400"><ArrowDownLeft size={18} /></span>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-wide uppercase">Supply Liquidity Vaults</h2>
                      <p className="text-xs text-[#8fa799] mt-0.5">Earn deterministic non-custodial yields</p>
                    </div>
                  </div>
                  <span className="text-teal-300 font-bold text-sm bg-teal-950/70 px-3 py-1 rounded-full border border-teal-800/50">7.80% APY</span>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#8fa799] mb-3">Select Capital Vault</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['USDC', 'EURC', 'FDX'].map((asset) => (
                        <button key={asset} type="button" onClick={() => setSupplyAsset(asset)} className={`p-3.5 rounded-xl text-left transition cursor-pointer ${
                          supplyAsset === asset ? 'bg-teal-950/60 text-white border border-teal-500/60 shadow-md' : 'bg-[#091520] text-[#8fa799] border border-[#1c3040] hover:bg-[#112030]'
                        }`}>
                          <div className="font-bold text-sm text-white">{asset}</div>
                          <div className="text-xs text-teal-400 font-mono mt-0.5">{asset === 'USDC' ? '8.2% APY' : asset === 'EURC' ? '7.1% APY' : '9.4% APY'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <div className="flex justify-between text-xs text-[#8fa799] mb-2 font-semibold">
                      <span>Deposit Capital</span>
                      <span>Wallet: 148,250 {supplyAsset}</span>
                    </div>
                    <div className="relative">
                      <input type="number" value={supplyAmount} onChange={(e) => setSupplyAmount(e.target.value)} className="w-full bg-[#091520] border border-[#1c3040] rounded-xl px-4 py-3.5 text-white text-xl font-bold focus:outline-hidden focus:border-teal-500 tabular-nums pr-20" />
                      <button onClick={() => setSupplyAmount('25000')} className="absolute right-3 top-3.5 px-3 py-1 bg-teal-950/60 hover:bg-teal-900/60 text-teal-400 text-xs font-mono font-bold rounded-lg transition cursor-pointer">MAX</button>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#091520] border border-[#1c3040] flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Interest Compounding</span>
                      <span className="text-white font-mono font-semibold">Continuous per-second</span>
                    </div>
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Withdrawal Liquidity</span>
                      <span className="text-teal-400 font-semibold">Instant (No Lockup)</span>
                    </div>
                    <div className="flex justify-between items-center text-[#8fa799]">
                      <span>Loss Protection Buffer</span>
                      <span className="text-cyan-400 font-bold">100% Solvency Reserve</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-[#1c3040]">
                  <button onClick={handleExecuteSupply} className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-teal-900/50 transition cursor-pointer">
                    Deposit &amp; Earn {supplyAsset} Yield
                  </button>
                </div>
              </div>
            </div>

            {/* Active Position Management Table */}
            <div className="p-6 sm:p-8 lg:p-9 rounded-3xl bg-gradient-to-br from-[#14231a] to-[#0e1912] border border-[#22382b] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                    <Sliders size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Active Position Management</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Real-time status of your uncollateralized loan facilities</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">Deterministic Repayment Schedule</span>
              </div>
              <div className="mt-5 rounded-2xl border border-[#1e3226] bg-[#0c1611]/80 overflow-x-auto">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Loan ID</th>
                      <th className="text-right">Principal</th>
                      <th className="text-right">APR</th>
                      <th className="text-right">Due</th>
                      <th className="text-center">Progress</th>
                      <th className="text-center">Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="font-mono text-xs text-[#8fa799] text-left">{loan.id}</td>
                        <td className="font-semibold text-white text-right tabular-nums">{loan.amount.toLocaleString()} <span className="text-[#8fa799] text-xs">{loan.asset}</span></td>
                        <td className="text-emerald-400 font-mono font-semibold text-right tabular-nums">{loan.apr}</td>
                        <td className="text-[#8fa799] text-right">{loan.status === 'Active' ? `${loan.dueDays}d` : 'Matured'}</td>
                        <td className="text-center">
                          <div className="w-20 h-2 rounded-full bg-[#1b2d24] overflow-hidden mx-auto">
                            <div className="h-full bg-emerald-500" style={{ width: loan.progress }} />
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            loan.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-stone-900 text-stone-400'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {loan.status === 'Active' ? (
                            <button
                              onClick={() => handleExecuteRepay(loan.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                              Settle
                            </button>
                          ) : (
                            <span className="text-xs text-stone-500 font-medium">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Available Capital Pools Matrix */}
            <div className="p-6 sm:p-8 lg:p-9 rounded-3xl bg-gradient-to-br from-[#14231a] to-[#0e1912] border border-[#22382b] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400">
                    <Layers size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Available Capital Vaults</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Multi-currency lending vaults with deterministic interest models</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-300">Updated live</span>
              </div>
              <div className="mt-5 rounded-2xl border border-[#1e3226] bg-[#0c1611]/80 overflow-x-auto">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Pool Asset</th>
                      <th className="text-right">Total Value Locked</th>
                      <th className="text-right">Utilization</th>
                      <th className="text-right">Supply APY</th>
                      <th className="text-right">Borrow APR</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { asset: 'USDC Vault', tvl: '$ 5,420,000', util: '64.2%', supplyApy: '8.20%', borrowApr: '5.20%' },
                      { asset: 'EURC Vault', tvl: '€ 3,120,000', util: '58.5%', supplyApy: '7.10%', borrowApr: '4.80%' },
                      { asset: 'USD Liquid', tvl: '$ 1,840,000', util: '42.0%', supplyApy: '6.50%', borrowApr: '4.50%' },
                      { asset: 'FDX Native', tvl: '✦ 9,820,000', util: '78.4%', supplyApy: '9.40%', borrowApr: '6.10%' },
                    ].map((pool, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-white text-left">{pool.asset}</td>
                        <td className="font-mono text-right tabular-nums">{pool.tvl}</td>
                        <td className="text-right">
                          <span className="text-xs font-mono text-teal-300 tabular-nums">{pool.util}</span>
                        </td>
                        <td className="text-emerald-400 font-mono font-bold text-right tabular-nums">{pool.supplyApy}</td>
                        <td className="text-white font-mono font-bold text-right tabular-nums">{pool.borrowApr}</td>
                        <td className="text-right">
                          <button
                            onClick={() => { setSupplyAsset(pool.asset.split(' ')[0]); setSupplyAmount('5000'); }}
                            className="px-4 py-1.5 rounded-lg bg-[#1b2d24] hover:bg-[#253e32] border border-[#2d493a] text-white text-xs font-bold transition cursor-pointer"
                          >
                            Select Vault
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VERIFIABLE CREDIT & SCORE ENGINE                   */}
        {/* ========================================================= */}
        {activeTab === 'credit' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-700/50 text-cyan-400"><ShieldCheck size={20} /></span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Borderline Verify — zkSNARK Identity</h2>
                <p className="text-sm text-[#8fa799] mt-0.5">Deterministic credit score engine with zero-knowledge proofs</p>
              </div>
            </div>

            {/* Top Row: Score Gauge & Mathematical Breakdown */}
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
              {/* Score Gauge Card */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#203328] shadow-xl flex flex-col items-center justify-between text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50">
                  Deterministic Score Engine
                </span>

                <div className="relative w-56 h-56 sm:w-60 sm:h-60 flex items-center justify-center my-6">
                  <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="primeScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="35%" stopColor="#06b6d4" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle cx="80" cy="80" r="62" fill="none" stroke="#16271e" strokeWidth="11" />
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      fill="none"
                      stroke="url(#primeScoreGrad)"
                      strokeWidth="11"
                      strokeDasharray="389.6"
                      strokeDashoffset="88"
                      strokeLinecap="round"
                      className="animate-ring-draw"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight tabular-nums metric-value">785</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 mt-1">Tier 1 Prime</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="p-3.5 rounded-xl bg-[#09120d] border border-[#1c2e24] text-center">
                    <div className="text-xs text-[#71877b] mb-0.5">Max Credit Line</div>
                    <div className="text-sm font-bold text-emerald-400">$250,000</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#09120d] border border-[#1c2e24] text-center">
                    <div className="text-xs text-[#71877b] mb-0.5">Fee Multiplier</div>
                    <div className="text-sm font-bold text-cyan-300">0.85x</div>
                  </div>
                </div>

                <p className="text-xs text-[#9eb5a7] mt-4 leading-relaxed">Ranked in top 2% of institutional borrowers. Eligible for max $250,000 zero-collateral line.</p>
              </div>

              {/* Scoring Factors Breakdown */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#203328] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-[#1c2e24]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                        <Award size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        Mathematical Scoring Attributes
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">Max Score: 850</span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: 'On-Time Repayment Consistency', score: 99.2, impact: '+220 pts', color: 'bg-emerald-500', textCol: 'text-emerald-400' },
                      { label: 'Capital Velocity & Turnaround Rate', score: 94.5, impact: '+180 pts', color: 'bg-cyan-500', textCol: 'text-cyan-300' },
                      { label: 'Reserve Staking Commitment', score: 88.0, impact: '+150 pts', color: 'bg-amber-500', textCol: 'text-amber-300' },
                      { label: 'Protocol Longevity & History', score: 82.4, impact: '+135 pts', color: 'bg-purple-500', textCol: 'text-purple-300' },
                      { label: 'Historical Default Rate', score: 100, impact: 'Perfect Record', color: 'bg-rose-500', textCol: 'text-rose-300' },
                    ].map((factor, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#09120d] border border-[#1c2e24]">
                        <div className="flex justify-between items-center text-sm mb-2.5">
                          <span className="font-semibold text-white">{factor.label}</span>
                          <span className={`${factor.textCol} font-mono font-bold text-right tabular-nums shrink-0 ml-4`}>{factor.impact}</span>
                        </div>
                        <div className="progress-track h-1.5">
                          <div className={`progress-fill ${factor.color}`} style={{ width: `${factor.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Credit Tier Progression Matrix + Dynamic Simulator */}
            <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 items-stretch">
              {/* Credit Tier Matrix — teal accent */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-[#1c3040] shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-5 border-b border-[#1c3040]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400"><Scale size={16} /></span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Credit Tier Progression</h3>
                  </div>
                  <span className="text-xs font-mono text-teal-300">Deterministic Gates</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { tier: 'Tier 1 Prime', line: '$ 250,000 Max Line', minScore: '750+ Score', discount: '0.85x Fee Multiplier', active: true, border: 'border-emerald-500/50', bg: 'bg-emerald-950/20' },
                    { tier: 'Tier 2 Growth', line: '$ 100,000 Max Line', minScore: '680+ Score', discount: '1.00x Fee Multiplier', active: false, border: 'border-[#1c3040]', bg: 'bg-[#091520]' },
                    { tier: 'Tier 3 Emerging', line: '$ 25,000 Max Line', minScore: '600+ Score', discount: '1.15x Fee Multiplier', active: false, border: 'border-[#1c3040]', bg: 'bg-[#091520]' },
                  ].map((t, idx) => (
                    <div key={idx} className={`p-4 sm:p-5 rounded-xl border ${t.border} ${t.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{t.tier}</span>
                          {t.active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-300">CURRENT STATUS</span>}
                        </div>
                        <div className="text-xs text-[#8fa799] mt-1">{t.minScore} · {t.discount}</div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <div className="text-emerald-400 font-bold font-mono tabular-nums">{t.line}</div>
                        <div className="text-[11px] text-[#71877b]">Zero Collateral</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Score Simulator — amber accent */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#201a0e] to-[#0c1611] border border-[#3a2e1c] shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-5 border-b border-[#3a2e1c]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400"><SlidersHorizontal size={16} /></span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Score Boost Simulator</h3>
                  </div>
                  <span className="text-xs font-mono text-amber-300">Simulate Actions</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-[#140f05] border border-[#3a2e1c]">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#8fa799] mb-2">
                      <span>Early Repayment Simulation</span>
                      <span className="text-white font-bold font-mono tabular-nums">${simRepay.toLocaleString()} USDC</span>
                    </div>
                    <input type="range" min="0" max="50000" step="5000" value={simRepay} onChange={(e) => setSimRepay(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                  <div className="p-4 rounded-xl bg-[#140f05] border border-[#3a2e1c]">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#8fa799] mb-2">
                      <span>FDX Reserve Staking</span>
                      <span className="text-white font-bold font-mono tabular-nums">{simStake.toLocaleString()} FDX</span>
                    </div>
                    <input type="range" min="0" max="25000" step="2500" value={simStake} onChange={(e) => setSimStake(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                  <div className="p-4 rounded-xl bg-[#140f05] border border-[#3a2e1c] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#8fa799] uppercase font-semibold">Projected Score Impact</div>
                      <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">785 → {785 + Math.round(simRepay / 2500) + Math.round(simStake / 1000)} PTS</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800/40">+{Math.round(simRepay / 2500) + Math.round(simStake / 1000)} PTS Projected</span>
                  </div>
                </div>
                <div className="text-xs text-[#71877b] text-center pt-4 border-t border-[#3a2e1c]">
                  Scores recalculate deterministically upon each onchain settlement.
                </div>
              </div>
            </div>

            {/* Bottom: Immutable Repayment Receipts Ledger */}
            <div className="p-6 sm:p-8 lg:p-9 rounded-3xl bg-gradient-to-br from-[#14231a] to-[#0e1912] border border-[#22382b] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Immutable Repayment Receipts</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Cryptographically proved settlement audit trail</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-300">Cryptographically Proved</span>
              </div>
              <div className="mt-5 rounded-2xl border border-[#1e3226] bg-[#0c1611]/80 overflow-x-auto">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Receipt ID</th>
                      <th className="text-right">Principal Settled</th>
                      <th className="text-right">Interest Paid</th>
                      <th className="text-left">Completion Date</th>
                      <th className="text-left">Verification Hash</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'RCPT-10492', principal: '50,000 FDX', interest: '762.50 FDX', date: 'Sep 28, 2026', hash: '0x4f8a...9c12' },
                      { id: 'RCPT-10491', principal: '25,000 USDC', interest: '150.00 USDC', date: 'Sep 14, 2026', hash: '0x1c3b...8e44' },
                      { id: 'RCPT-10490', principal: '10,000 EURC', interest: '48.00 EURC', date: 'Aug 30, 2026', hash: '0x99a2...7710' },
                    ].map((rcpt, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-xs text-[#8fa799] text-left">{rcpt.id}</td>
                        <td className="font-bold text-white text-right tabular-nums">{rcpt.principal}</td>
                        <td className="text-emerald-400 font-mono text-right tabular-nums">{rcpt.interest}</td>
                        <td className="text-[#8fa799] text-left whitespace-nowrap">{rcpt.date}</td>
                        <td className="font-mono text-xs text-teal-300 text-left whitespace-nowrap">{rcpt.hash}</td>
                        <td className="text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40 inline-block whitespace-nowrap">
                            Immutable Proved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: AI RISK TELEMETRY & SOLVENCY SUITE                 */}
        {/* ========================================================= */}
        {activeTab === 'risk' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-950 border border-amber-700/50 text-amber-400"><Radio size={20} /></span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI Risk Telemetry Sentinel</h2>
                  <p className="text-sm text-[#8fa799] mt-0.5">Autonomous multi-node consensus protecting protocol solvency</p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Live Guard
              </span>
            </div>

            {/* Unified Executive Metric Ribbon */}
            <div className="rounded-2xl border border-[#203328] bg-[#122018]/90 backdrop-blur-md shadow-lg grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1c2e24] overflow-hidden">
              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Sentinel Quorum</span>
                  <Cpu size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight tabular-nums my-2">
                  3 / 3
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Consensus Active</span>
                  <span className="badge-emerald">100% Sync</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Solvency Ratio</span>
                  <ShieldCheck size={15} className="text-teal-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-teal-300 tracking-tight tabular-nums my-2">
                  214.8%
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Surplus Buffer</span>
                  <span className="badge-cyan">Optimal</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Single-Pool Cap</span>
                  <Lock size={15} className="text-amber-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight tabular-nums my-2">
                  $5M
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Circuit Breaker</span>
                  <span className="badge-amber">Auto Guard</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Oracle Health</span>
                  <Activity size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums my-2">
                  100% Sync
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Price Variance</span>
                  <span className="badge-emerald">0.00%</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Multi-Node Quorum Matrix + Live Stress Test Simulator */}
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
              {/* Multi-Node Consensus Matrix */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#203328] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#1c2e24]">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <Cpu size={18} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Multi-Node Sentinel Quorum</h3>
                        <p className="text-xs text-[#8fa799] mt-0.5">Decentralized offchain AI verification nodes</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                      3/3 ACTIVE
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-3.5">
                    {[
                      { node: 'Sentinel Node Alpha', role: 'Liquidity Velocity & Outflow Tracker', latency: '42ms', status: 'Voting: Optimal', sig: '0x9d4a...c77b' },
                      { node: 'Sentinel Node Beta', role: 'Cross-Vault Collateralization Ratio', latency: '38ms', status: 'Voting: 214.8% Solvency', sig: '0x1c8b...32fa' },
                      { node: 'Sentinel Node Gamma', role: 'Borrower Repayment Pacing Engine', latency: '49ms', status: 'Voting: Tier 1 Conforming', sig: '0x7a81...49de' },
                    ].map((n, i) => (
                      <div key={i} className="p-4 sm:p-5 rounded-xl bg-[#09120d] border border-[#1c2e24] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-bold text-white text-sm">{n.node}</span>
                            <span className="text-[11px] font-mono text-[#8fa799]">({n.latency})</span>
                          </div>
                          <div className="text-xs text-[#8fa799] mt-1">{n.role}</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-semibold text-emerald-400 font-mono block">{n.status}</span>
                          <span className="text-[11px] font-mono text-[#6e8576]">Sig: {n.sig}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Stress Testing Simulator */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-[#203328] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#1c2e24]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400">
                        <Zap size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Stress-Test Simulator</h3>
                    </div>
                    <span className="text-xs font-mono text-amber-300">Live Simulation</span>
                  </div>

                  <div className="mt-6 flex flex-col gap-5">
                    <div className="p-4 rounded-xl bg-[#09120d] border border-[#1c2e24]">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#8fa799] mb-2">
                        <span>Market Liquidity Drawdown Shock</span>
                        <span className="text-white font-bold font-mono">{stressShock}% SHOCK</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={stressShock}
                        onChange={(e) => setStressShock(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-5 rounded-xl bg-[#09120d] border border-[#1c2e24] space-y-3">
                      <div className="flex justify-between items-center text-xs text-[#8fa799]">
                        <span>Post-Shock Solvency Buffer</span>
                        <span className="font-bold text-emerald-400 font-mono tabular-nums">{(214.8 - stressShock * 1.8).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1b2d24] overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.max(10, 214.8 - stressShock * 1.8)}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-xs text-[#8fa799]">
                        <span>Default Risk Probability</span>
                        <span className="font-bold text-teal-300 font-mono tabular-nums">{(0.02 + stressShock * 0.01).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle size={15} className="shrink-0 text-emerald-400" />
                  <span>Protocol resilience verified. Solvency guaranteed above 150% threshold.</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Live Attestation Log + Governance Guardrails */}
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
              {/* Real-Time Attestation Log — teal/dark */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-[#1c3040] shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between pb-5 border-b border-[#1c3040]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400"><Radio size={16} /></span>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Real-Time Attestation Log</h3>
                  </div>
                  <span className="text-xs font-mono text-teal-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />Live Stream</span>
                </div>
                <div className="p-5 rounded-xl border border-[#1c3040] bg-[#091520] font-mono text-xs text-[#8fa799] space-y-3 leading-relaxed">
                  <div className="text-teal-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    <span>Live Attestation Consensus Feed</span>
                  </div>
                  <div className="space-y-1.5">
                    <div>[2026-10-14 15:42:01 UTC] Sentinel Node Alpha: Solvency check completed. 0 anomalies detected.</div>
                    <div>[2026-10-14 15:42:04 UTC] Sentinel Node Beta: Cross-checked capital reserves against active credit lines.</div>
                    <div>[2026-10-14 15:42:08 UTC] Sentinel Node Gamma: Verified repayment hashes. Signature 0x7a81...49de generated.</div>
                    <div>[2026-10-14 15:42:15 UTC] Sentinel Node Alpha: Dynamic interest curve re-indexed for USDC vault (8.20% APY).</div>
                  </div>
                </div>
              </div>
              {/* Governance Guardrails — purple accent */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#180f24] to-[#0c1611] border border-[#2d1e40] shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between pb-5 border-b border-[#2d1e40]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400"><ShieldAlert size={16} /></span>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Governance Guardrails</h3>
                  </div>
                  <span className="text-xs font-mono text-purple-300">Safety Boundaries</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-[#9eb5a7] leading-relaxed">
                  <div className="p-4 rounded-xl bg-[#12092a] border border-[#2d1e40]">
                    <span className="text-sm text-white font-bold block mb-1.5">Non-Authoritative AI</span>
                    <p>AI models only monitor and attest. Models have zero direct authority to disburse, seize, or reallocate treasury capital.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#12092a] border border-[#2d1e40]">
                    <span className="text-sm text-white font-bold block mb-1.5">Deterministic Settlement</span>
                    <p>Loan creation, repayment, and interest calculation are governed purely by deterministic, versioned credit rules.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CAPITAL MARKETS & LIQUIDITY SWAP                   */}
        {/* ========================================================= */}
        {activeTab === 'markets' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            {swapSuccess && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-[#12281b] border border-emerald-500/50 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-lg">
                <span>✓ Successfully swapped {Number(swapAmount).toLocaleString()} {swapFrom} for {swapTo}! Instant liquidity filled.</span>
                <span className="font-mono text-xs text-emerald-300">Tx: 0x4e8a...11bc</span>
              </div>
            )}

            {/* Section Header */}
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-purple-950 border border-purple-700/50 text-purple-400"><BarChart3 size={20} /></span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Capital Markets — Federated Vaults</h2>
                <p className="text-sm text-[#8fa799] mt-0.5">Live order book, institutional swap facility, and multi-asset liquidity management</p>
              </div>
            </div>

            {/* Unified Executive Metric Ribbon */}
            <div className="rounded-2xl border border-[#203328] bg-[#122018]/90 backdrop-blur-md shadow-lg grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1c2e24] overflow-hidden">
              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>FDX / USDC Price</span>
                  <DollarSign size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums my-2">
                  $&thinsp;1.0004
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Stable Peg</span>
                  <span className="badge-emerald">▲ +0.04%</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>24h Market Volume</span>
                  <TrendingUp size={15} className="text-teal-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-teal-300 tracking-tight tabular-nums my-2">
                  $&thinsp;4.82M
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Zero Slippage</span>
                  <span className="badge-cyan">Active Pool</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Order Book Spread</span>
                  <BarChart3 size={15} className="text-amber-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight tabular-nums my-2">
                  0.06%
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Market Depth</span>
                  <span className="badge-amber">Institutional</span>
                </div>
              </div>

              <div className="p-5 lg:p-6 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8fa799]">
                  <span>Settlement Finality</span>
                  <Activity size={15} className="text-emerald-400 opacity-90" />
                </div>
                <div className="metric-value text-2xl lg:text-3xl font-bold text-emerald-400 tracking-tight tabular-nums my-2">
                  Sub-Sec
                </div>
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#1c2e24]/70">
                  <span className="text-[#71877b]">Atomic Swaps</span>
                  <span className="badge-emerald">Deterministic</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Order Book & Instant Liquidity Swap */}
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
              {/* Order Book — purple accent */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#180f24] to-[#0c1611] border border-[#2d1e40] shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-5 border-b border-[#2d1e40]">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400"><BarChart3 size={18} /></span>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Live Capital Order Book</h3>
                      <p className="text-xs text-[#8fa799] mt-0.5">USDC / FDX Market Depth</p>
                    </div>
                  </div>
                  <span className="font-mono text-purple-300 text-xs font-semibold px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/40">Spread: 0.0006 (0.06%)</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between items-center text-xs uppercase text-emerald-400 mb-3 font-bold">
                      <span>Bid Price</span><span>Size (FDX)</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {orderBookBids.map((bid, i) => (
                        <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-emerald-950/30 text-emerald-300 border border-emerald-900/40 tabular-nums">
                          <span>{bid.price.toFixed(4)}</span><span className="font-bold">{bid.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs uppercase text-rose-400 mb-3 font-bold">
                      <span>Ask Price</span><span>Size (FDX)</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      {orderBookAsks.map((ask, i) => (
                        <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-rose-950/30 text-rose-300 border border-rose-900/40 tabular-nums">
                          <span>{ask.price.toFixed(4)}</span><span className="font-bold">{ask.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Liquidity Swap Widget — teal accent */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-[#1c3040] shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between pb-5 border-b border-[#1c3040]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400"><RefreshCw size={16} /></span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Instant Liquidity Swap</h3>
                  </div>
                  <span className="text-xs font-mono text-teal-300 bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-800/50">0.05% Fee</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <label className="text-xs font-semibold uppercase text-[#8fa799] block mb-2">Pay Asset</label>
                    <div className="flex items-center gap-2.5">
                      <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="flex-1 bg-[#091520] border border-[#1c3040] rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-hidden focus:border-teal-500 tabular-nums" />
                      <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} className="bg-[#091520] border border-[#1c3040] rounded-xl px-3.5 py-3 text-white text-sm font-bold cursor-pointer">
                        <option>USDC</option><option>EURC</option><option>FDX</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040]">
                    <label className="text-xs font-semibold uppercase text-[#8fa799] block mb-2">Receive Estimate</label>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 bg-[#091520] border border-[#1c3040] rounded-xl px-4 py-3 text-teal-400 text-lg font-bold tabular-nums">{(Number(swapAmount) * 0.9995).toFixed(2)}</div>
                      <select value={swapTo} onChange={(e) => setSwapTo(e.target.value)} className="bg-[#091520] border border-[#1c3040] rounded-xl px-3.5 py-3 text-white text-sm font-bold cursor-pointer">
                        <option>FDX</option><option>USDC</option><option>EURC</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#091520] border border-[#1c3040] text-xs flex flex-col gap-2 text-[#8fa799]">
                    <div className="flex justify-between items-center">
                      <span>Guaranteed Rate</span>
                      <span className="text-white font-mono">1 {swapFrom} ≈ 0.9995 {swapTo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Slippage Tolerance</span>
                      <span className="text-teal-300 font-mono font-semibold">0.10% (Auto)</span>
                    </div>
                  </div>
                </div>
                <div className="pt-5 border-t border-[#1c3040]">
                  <button onClick={handleExecuteSwap} className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-teal-900/50 transition cursor-pointer">
                    Execute Capital Swap
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom: Recent Market Trades Table — amber accent */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#201a0e] to-[#0c1611] border border-[#3a2e1c] shadow-xl">
              <div className="flex items-center justify-between pb-5 border-b border-[#3a2e1c]">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400"><TrendingUp size={18} /></span>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Recent Executed Market Trades</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Live filled market orders across protocol liquidity pairs</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-400">Deterministic Atomic Settlement</span>
              </div>
              <div className="mt-5 rounded-xl border border-[#3a2e1c] bg-[#140f05]/80 overflow-x-auto">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Trade ID</th>
                      <th className="text-left">Market Pair</th>
                      <th className="text-center">Side</th>
                      <th className="text-right">Execution Price</th>
                      <th className="text-right">Volume</th>
                      <th className="text-right">Time</th>
                      <th className="text-right">Settlement Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketTrades.map((t, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-xs text-[#8fa799] text-left">{t.id}</td>
                        <td className="font-bold text-white text-left">{t.pair}</td>
                        <td className="text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold inline-block ${
                            t.type === 'Buy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          }`}>{t.type}</span>
                        </td>
                        <td className="font-mono text-white text-right tabular-nums">{t.price}</td>
                        <td className="font-mono text-[#8fa799] text-right tabular-nums">{t.size}</td>
                        <td className="text-[#8fa799] text-right">{t.time}</td>
                        <td className="text-right font-mono text-xs text-amber-300">{t.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LEGAL & TERMS                                      */}
        {/* ========================================================= */}
        {activeTab === 'terms' && (
          <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
            <div className="flex items-center gap-3 pb-6 border-b border-[#203328]">
              <span className="p-2.5 rounded-2xl bg-sky-950/80 border border-sky-800/40 text-sky-400"><FileText size={20} /></span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">Institutional Terms of Service &amp; Compliance</h2>
                <p className="text-xs text-[#8fa799] mt-0.5">Deterministic governance and capital pool legal disclosures</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#132219] to-[#0c1611] border border-emerald-500/30 flex flex-col gap-4 shadow-[0_4px_24px_rgba(16,185,129,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  </span>
                  <strong className="text-white text-base">1. Non-Custodial Operation</strong>
                </div>
                <p className="text-sm text-[#8fa799] leading-relaxed">Fundryx operates as a non-custodial capital protocol. All borrower credit assessments, loan disbursements, and interest settlements are processed according to deterministic, versioned credit policies.</p>
              </div>
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0e1e24] to-[#0c1611] border border-cyan-500/30 flex flex-col gap-4 shadow-[0_4px_24px_rgba(6,182,212,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  </span>
                  <strong className="text-white text-base">2. Credit Scoring Disclosures</strong>
                </div>
                <p className="text-sm text-[#8fa799] leading-relaxed">Repayment history records and deterministic credit scores are mathematically derived without subjective human intervention or third-party marketing brokers.</p>
              </div>
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#201a0e] to-[#0c1611] border border-amber-500/30 flex flex-col gap-4 shadow-[0_4px_24px_rgba(245,158,11,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  </span>
                  <strong className="text-white text-base">3. Risk Telemetry</strong>
                </div>
                <p className="text-sm text-[#8fa799] leading-relaxed">AI Risk Telemetry operates in advisory shadow mode. It provides early warning notifications to risk committees but has no autonomous transfer authority over treasury funds.</p>
              </div>
              <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#180f24] to-[#0c1611] border border-purple-500/30 flex flex-col gap-4 shadow-[0_4px_24px_rgba(168,85,247,0.08)]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </span>
                  <strong className="text-white text-base">4. Data Privacy &amp; Zero-Knowledge Verification</strong>
                </div>
                <p className="text-sm text-[#8fa799] leading-relaxed">Fundryx does not harvest, distribute, or broker confidential borrower data. Cryptographic attestations verify eligibility while preserving borrower privacy.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Portal Institutional Footer */}
      <footer className="border-t border-[#1c2e24] bg-[#0c1410] py-6 px-6 lg:px-10 text-xs text-[#71877b] w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">All Systems Operational · Quorum 3/3 Synchronized</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[#586f62]">
            <span>Epoch: 4,192</span>
            <span>•</span>
            <span>Deterministic Consensus (0x9d4a82...c77b)</span>
            <span>•</span>
            <button onClick={onBackToLanding} className="hover:text-emerald-400 transition cursor-pointer">Website Home</button>
          </div>
        </div>
      </footer>
    </div>
  </div>
);
}

