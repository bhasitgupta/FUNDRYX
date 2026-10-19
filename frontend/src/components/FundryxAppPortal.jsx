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
        <main className="portal-container flex-1 py-8 md:py-10 flex flex-col gap-8 md:gap-10">

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & PORTFOLIO                               */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-10 animate-fade-in">
            {/* Top Overview Banner with Multi-Color Institutional Styling */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-[#172b20] via-[#1a2838] to-[#281b16] border border-[#2d4838] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-950/80 border border-teal-700/50">Verified Institutional Identity</span>
                  <span>·</span>
                  <span className="text-amber-300 font-medium">Tier 1 Prime Status (Score 785)</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#f0ece1] to-[#e6d5b8] bg-clip-text text-transparent tracking-tight">
                  Capital Liquidity & Credit Dashboard
                </h1>
                <p className="text-sm md:text-base text-[#9eb5a7] mt-2.5 max-w-2xl leading-relaxed">
                  Real-time portfolio management, deterministic risk limits, and zero-collateral uncollateralized lending capacity.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('lending')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                >
                  Borrow Capital
                </button>
                <button
                  onClick={() => setActiveTab('credit')}
                  className="px-6 py-3.5 rounded-xl bg-[#241c19] hover:bg-[#332520] border border-[#523b2e] text-[#f2dfc1] text-sm font-bold transition cursor-pointer shadow-md"
                >
                  Inspect Score
                </button>
              </div>
            </div>

            {/* 4 Colored Metric Cards - Multi-Color Theme (Emerald, Cyan, Amber, Purple) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Emerald Theme */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#13281c] via-[#0f2016] to-[#0c1811] border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_8px_30px_rgba(16,185,129,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-2">
                    <span>Total Net Worth</span>
                    <DollarSign size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight tabular-nums">$ 1,332,718.47</div>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-900/30 flex items-center justify-between">
                  <span className="text-xs text-[#71877b]">Quarter-to-date</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    ▲ +11.8%
                  </span>
                </div>
              </div>

              {/* Card 2: Electric Cyan Theme */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e2430] via-[#0a1c26] to-[#08151e] border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_8px_30px_rgba(6,182,212,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-cyan-300/80 mb-2">
                    <span>Active Credit Line</span>
                    <ShieldCheck size={16} className="text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-cyan-300 tracking-tight tabular-nums">$ 250,000.00</div>
                </div>
                <div className="mt-4 pt-3 border-t border-cyan-900/30 flex items-center justify-between">
                  <span className="text-xs text-[#71877b]">Tier 1 (Score 785)</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                    Prime Qualified
                  </span>
                </div>
              </div>

              {/* Card 3: Warm Amber / Terracotta Theme */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2a1c12] via-[#20150d] to-[#170e08] border border-amber-500/30 hover:border-amber-400/60 shadow-[0_8px_30px_rgba(245,158,11,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                    <span>Current Borrowed</span>
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-amber-300 tracking-tight tabular-nums">$ 48,210.40</div>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-900/30 flex items-center justify-between">
                  <span className="text-xs text-[#71877b]">Due in 6 days</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50">
                    2 Active Loans
                  </span>
                </div>
              </div>

              {/* Card 4: Royal Purple Theme */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#241430] via-[#1a0e24] to-[#12081a] border border-purple-500/30 hover:border-purple-400/60 shadow-[0_8px_30px_rgba(168,85,247,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-purple-300/80 mb-2">
                    <span>Weighted Supply APY</span>
                    <TrendingUp size={16} className="text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-300 tracking-tight tabular-nums">7.80% APY</div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
                  <span className="text-xs text-[#71877b]">Solvency Reserve</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50">
                    100% Guaranteed
                  </span>
                </div>
              </div>
            </div>

            {/* Core Protocol Facilities Bento Grid */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Autonomous Modular Grid</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Protocol Facilities & Architecture
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8fa799] font-medium bg-[#132319] px-3.5 py-1.5 rounded-xl border border-[#243d2f] self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5 Interactive Modules</span>
                </div>
              </div>

              <MagicBento
                items={overviewBentoItems}
                columns={4}
                rowHeight={290}
                gap={18}
                radius={24}
                theme="dark"
                glowColor="#10b981"
                enableBorderGlow={true}
                enableSpotlight={true}
                spotlightRadius={320}
                enableStars={true}
                particleCount={24}
                clickEffect={true}
                textAutoHide={false}
              />
            </div>

            {/* Middle Section: Active Loans (Col-8) + AI Risk Sentinel (Col-4) */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Active Capital Loans Table with Numeric Right-Alignment */}
              <div className="lg:col-span-8 p-7 md:p-8 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-[#203328]">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
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

                  <div className="mt-5 overflow-x-auto">
                    <table className="portal-table text-sm">
                      <thead>
                        <tr className="border-b border-[#1c2c22] text-[#8fa799] text-xs font-semibold uppercase">
                          <th className="pb-3.5 text-left">Loan ID</th>
                          <th className="pb-3.5 text-right">Principal</th>
                          <th className="pb-3.5 text-right">Fixed APR</th>
                          <th className="pb-3.5 text-right">Maturity</th>
                          <th className="pb-3.5 text-center">Status</th>
                          <th className="pb-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1c2c22]">
                        {activeLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-[#1a2d22]/50 transition-colors">
                            <td className="py-4 font-mono text-xs text-[#8fa799] text-left">{loan.id}</td>
                            <td className="py-4 font-semibold text-white text-right tabular-nums whitespace-nowrap">{loan.amount.toLocaleString()} {loan.asset}</td>
                            <td className="py-4 text-emerald-400 font-mono font-semibold text-right tabular-nums">{loan.apr}</td>
                            <td className="py-4 text-[#8fa799] text-right whitespace-nowrap">{loan.status === 'Active' ? `In ${loan.dueDays} days` : 'Matured'}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                                loan.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-stone-900 text-stone-400'
                              }`}>
                                {loan.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
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

                <div className="pt-4 border-t border-[#1c2c22] flex items-center justify-between text-xs text-[#71877b]">
                  <span>Total 3 positions tracked</span>
                  <span className="font-mono text-emerald-400">100% Repayment Confidence Index</span>
                </div>
              </div>

              {/* AI Risk Sentinel - Multi-Color Telemetry Card */}
              <div className="lg:col-span-4 p-7 md:p-8 rounded-3xl bg-gradient-to-br from-[#0e1d24] to-[#08131a] border border-cyan-800/40 shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-cyan-900/30">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
                        <Radio size={16} />
                      </span>
                      <h3 className="text-base font-bold text-white tracking-wide uppercase">AI Risk Sentinel</h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-700/50">
                      Live Guard
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#061016] border border-cyan-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-[#8fa799]">Liquidity Drain Index</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">0.02% (Optimal)</span>
                      </div>
                      <div className="text-xs text-[#71877b] mt-1.5">No anomalous outflow detected across 24h</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#061016] border border-cyan-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-[#8fa799]">Borrower Velocity Sensor</span>
                        <span className="text-sm font-bold text-teal-300">Conforming</span>
                      </div>
                      <div className="text-xs text-[#71877b] mt-1.5">Repayment pacing conforms to Tier 1 standards</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#061016] border border-cyan-900/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-[#8fa799]">Quorum Consensus</span>
                        <span className="text-xs font-mono text-cyan-300 font-bold">3/3 Signatures</span>
                      </div>
                      <div className="font-mono text-[11px] text-[#71877b] truncate mt-1">Hash: 0x9d4a82...c77b (Verified)</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('risk')}
                  className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-950/70 to-teal-950/70 hover:from-cyan-900/80 hover:to-teal-900/80 border border-cyan-700/50 text-xs font-bold uppercase tracking-wider text-cyan-200 transition cursor-pointer shadow-md"
                >
                  Open Risk Telemetry Feed →
                </button>
              </div>
            </div>

            {/* Bottom Section 1: Multi-Currency Capital Reserves Breakdown */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#203328] gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400">
                    <BarChart3 size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Treasury Reserves & Capital Allocation</h3>
                    <p className="text-xs text-[#9eb5a7] mt-0.5">Automated yield compounding across segregated non-custodial vaults</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[#16251e] text-emerald-400 border border-[#253e30]">
                    Total TVL: $11,480,000
                  </span>
                  <button
                    onClick={() => setActiveTab('lending')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Supply Vault
                  </button>
                </div>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { asset: 'USDC Vault', balance: '$ 912,400', apy: '8.20% APY', alloc: '48%', color: 'bg-emerald-500', cardBg: 'bg-gradient-to-br from-[#12281c] to-[#0c1811] border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_4px_20px_rgba(16,185,129,0.06)]', apyColor: 'text-emerald-400' },
                  { asset: 'EURC Vault', balance: '€ 228,900', apy: '7.10% APY', alloc: '22%', color: 'bg-cyan-500', cardBg: 'bg-gradient-to-br from-[#0c222e] to-[#08151e] border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(6,182,212,0.06)]', apyColor: 'text-cyan-300' },
                  { asset: 'USD Liquid', balance: '$ 540,000', apy: '6.50% APY', alloc: '18%', color: 'bg-amber-500', cardBg: 'bg-gradient-to-br from-[#2a1d12] to-[#1a110a] border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_20px_rgba(245,158,11,0.06)]', apyColor: 'text-amber-300' },
                  { asset: 'FDX Native', balance: '✦ 9,820,000', apy: '9.40% APY', alloc: '12%', color: 'bg-purple-500', cardBg: 'bg-gradient-to-br from-[#22132e] to-[#140b1c] border-purple-500/30 hover:border-purple-400/60 shadow-[0_4px_20px_rgba(168,85,247,0.06)]', apyColor: 'text-purple-300' },
                ].map((vault, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${vault.cardBg} space-y-3.5 transition-all`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{vault.asset}</span>
                      <span className={`text-xs font-mono font-semibold ${vault.apyColor} text-right`}>{vault.apy}</span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight tabular-nums">{vault.balance}</div>
                    <div>
                      <div className="flex justify-between text-xs text-[#8fa799] mb-1.5">
                        <span>Vault Allocation</span>
                        <span className="font-semibold text-white tabular-nums">{vault.alloc}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1b2d24] overflow-hidden">
                        <div className={`h-full ${vault.color}`} style={{ width: vault.alloc }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section 2: Real-time Live Event Feed */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                    <Activity size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Live Protocol Event Stream</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Real-time ledger audit log of disbursements, yields, and repayments</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synchronized to deterministic consensus
                </span>
              </div>

              <div className="mt-6 divide-y divide-[#1b2d22]">
                {activityFeed.map((ev) => (
                  <div key={ev.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#71877b]">{ev.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        ev.type === 'Repayment' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50' :
                        ev.type === 'Disbursement' ? 'bg-teal-950/70 text-teal-300 border border-teal-800/50' :
                        ev.type === 'Yield Compound' ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50' :
                        ev.type === 'Capital Supply' ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50' :
                        'bg-sky-950/70 text-sky-300 border border-sky-800/50'
                      }`}>
                        {ev.type}
                      </span>
                      <span className="font-mono text-xs text-[#9eb5a7]">{ev.borrower}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-semibold text-emerald-400 font-mono text-right tabular-nums">{ev.amount}</span>
                      <span className="text-xs text-[#71877b]">{ev.score}</span>
                      <span className="text-xs font-mono text-[#8fa799]">{ev.time}</span>
                      <span className="text-xs text-emerald-400 font-semibold">✓ Verified</span>
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
          <div className="flex flex-col gap-10 animate-fade-in">
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

            {/* Market Metrics Strip - Multi-Color Theme */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#13281c] via-[#0f2016] to-[#0c1811] border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_8px_30px_rgba(16,185,129,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">Available Liquidity</div>
                <div className="text-3xl font-bold text-white tracking-tight tabular-nums">$ 11,480,000</div>
                <div className="mt-2 text-xs text-emerald-400 font-mono">100% Solvency Guard</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e2430] via-[#0a1c26] to-[#08151e] border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_8px_30px_rgba(6,182,212,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300/80 mb-1">Active Borrow Volume</div>
                <div className="text-3xl font-bold text-cyan-300 tracking-tight tabular-nums">$ 48,210.40</div>
                <div className="mt-2 text-xs text-cyan-400/80 font-mono">12 Repayments Verified</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2a1c12] via-[#20150d] to-[#170e08] border border-amber-500/30 hover:border-amber-400/60 shadow-[0_8px_30px_rgba(245,158,11,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1">Prime Borrow Rate</div>
                <div className="text-3xl font-bold text-amber-300 tracking-tight tabular-nums">5.20% Fixed</div>
                <div className="mt-2 text-xs text-amber-400/80 font-mono">Zero Collateral</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#241430] via-[#1a0e24] to-[#12081a] border border-purple-500/30 hover:border-purple-400/60 shadow-[0_8px_30px_rgba(168,85,247,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-300/80 mb-1">Weighted Supply APY</div>
                <div className="text-3xl font-bold text-purple-300 tracking-tight tabular-nums">7.80% APY</div>
                <div className="mt-2 text-xs text-purple-400/80 font-mono">Continuous Compounding</div>
              </div>
            </div>

            {/* Dual Interactive Terminals: Borrow & Supply */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Borrow Panel */}
              <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                        <ArrowUpRight size={18} />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Request Uncollateralized Loan</h2>
                        <p className="text-xs text-[#8fa799] mt-0.5">Instant capital disbursement based on deterministic credit score</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                      Prime Eligible
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <div>
                      <div className="flex justify-between items-center text-sm text-[#8fa799] mb-3 font-semibold">
                        <span>Borrow Amount</span>
                        <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">${Number(borrowInput).toLocaleString()} USDC</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="250000"
                        step="1000"
                        value={borrowInput}
                        onChange={(e) => setBorrowInput(e.target.value)}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#1b2d24] rounded-lg"
                      />
                      <div className="flex justify-between text-xs text-[#6e8576] mt-2 font-mono">
                        <span>Min $1,000</span>
                        <span>Max Line $250,000</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-[#8fa799] mb-3">Repayment Tenure</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[7, 14, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setBorrowTerm(days)}
                            className={`py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                              borrowTerm === days
                                ? 'bg-[#243e32] text-white border border-emerald-500/50 shadow-md'
                                : 'bg-[#0c1611] text-[#8fa799] border border-[#22362a] hover:bg-[#18261e]'
                            }`}
                          >
                            {days} DAYS
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0c1611] border border-[#22362a] flex flex-col gap-3 text-sm">
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Fixed Protocol APR</span>
                        <span className="font-mono text-emerald-400 font-bold text-right">5.20%</span>
                      </div>
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Estimated Total Repayment</span>
                        <span className="font-mono text-white font-bold text-right tabular-nums">
                          ${(Number(borrowInput) * (1 + (0.052 * borrowTerm) / 365)).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Collateral Requirement</span>
                        <span className="text-emerald-400 font-bold text-right">Zero Collateral (Uncollateralized)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteBorrow}
                  className="mt-8 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl transition cursor-pointer"
                >
                  Execute Uncollateralized Loan
                </button>
              </div>

              {/* Supply Vault Panel */}
              <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <ArrowDownLeft size={18} />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Supply Liquidity Vaults</h2>
                        <p className="text-xs text-[#8fa799] mt-0.5">Earn deterministic non-custodial yields backed by verified borrowers</p>
                      </div>
                    </div>
                    <span className="text-teal-300 font-bold text-base bg-teal-950/70 px-3 py-1 rounded-full border border-teal-800/50">
                      7.80% APY
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-[#8fa799] mb-3">Select Capital Vault</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['USDC', 'EURC', 'FDX'].map((asset) => (
                          <button
                            key={asset}
                            type="button"
                            onClick={() => setSupplyAsset(asset)}
                            className={`py-3 rounded-xl text-sm font-semibold transition cursor-pointer text-left px-4 ${
                              supplyAsset === asset
                                ? 'bg-[#243e32] text-white border border-emerald-500/50 shadow-md'
                                : 'bg-[#0c1611] text-[#8fa799] border border-[#22362a] hover:bg-[#18261e]'
                            }`}
                          >
                            <div className="font-bold">{asset}</div>
                            <div className="text-xs text-emerald-400 font-mono mt-0.5">
                              {asset === 'USDC' ? '8.2% APY' : asset === 'EURC' ? '7.1% APY' : '9.4% APY'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-[#8fa799] mb-3">
                        <span className="font-semibold">Deposit Capital</span>
                        <span>Wallet: 148,250 {supplyAsset}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={supplyAmount}
                          onChange={(e) => setSupplyAmount(e.target.value)}
                          className="w-full bg-[#0c1611] border border-[#22362a] rounded-2xl px-5 py-4 text-white text-xl font-bold focus:outline-hidden focus:border-emerald-500 tabular-nums"
                        />
                        <button
                          onClick={() => setSupplyAmount('25000')}
                          className="absolute right-4 top-4 px-3 py-1 bg-[#1b2d24] text-emerald-400 text-xs font-mono font-bold rounded-lg cursor-pointer"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0c1611] border border-[#22362a] flex flex-col gap-3 text-sm">
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Interest Compounding</span>
                        <span className="text-white font-mono font-semibold text-right">Continuous per-second</span>
                      </div>
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Withdrawal Liquidity</span>
                        <span className="text-teal-400 font-semibold text-right">Instant (No Lockup)</span>
                      </div>
                      <div className="flex justify-between items-center text-[#8fa799]">
                        <span>Loss Protection Buffer</span>
                        <span className="text-emerald-400 font-bold text-right">100% Solvency Reserve</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteSupply}
                  className="mt-8 w-full py-4 rounded-2xl bg-[#1b2d24] hover:bg-[#253e32] border border-[#2d493a] text-white text-sm font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Deposit & Earn {supplyAsset} Yield
                </button>
              </div>
            </div>

            {/* Active Position Management Table with Numeric Right-Alignment */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                    <Sliders size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Active Position Management</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Real-time status of your uncollateralized loan facilities</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">Deterministic Repayment Schedule</span>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="portal-table text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2c22] text-[#8fa799] text-xs font-semibold uppercase">
                      <th className="pb-3.5 text-left">Loan ID</th>
                      <th className="pb-3.5 text-left">Asset</th>
                      <th className="pb-3.5 text-right">Principal</th>
                      <th className="pb-3.5 text-right">Fixed APR</th>
                      <th className="pb-3.5 text-right">Due Tenure</th>
                      <th className="pb-3.5 text-center">Repaid Progress</th>
                      <th className="pb-3.5 text-center">Status</th>
                      <th className="pb-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2c22]">
                    {activeLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-[#1a2d22]/50 transition-colors">
                        <td className="py-4 font-mono text-xs text-[#8fa799] text-left">{loan.id}</td>
                        <td className="py-4 font-bold text-white text-left">{loan.asset}</td>
                        <td className="py-4 font-semibold text-white text-right tabular-nums whitespace-nowrap">{loan.amount.toLocaleString()} {loan.asset}</td>
                        <td className="py-4 text-emerald-400 font-mono font-semibold text-right tabular-nums">{loan.apr}</td>
                        <td className="py-4 text-[#8fa799] text-right whitespace-nowrap">{loan.status === 'Active' ? `In ${loan.dueDays} days` : 'Matured'}</td>
                        <td className="py-4 text-center">
                          <div className="w-24 h-2 rounded-full bg-[#1b2d24] overflow-hidden mx-auto">
                            <div className="h-full bg-emerald-500" style={{ width: loan.progress }} />
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                            loan.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-stone-900 text-stone-400'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {loan.status === 'Active' ? (
                            <button
                              onClick={() => handleExecuteRepay(loan.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                            >
                              Settle Loan
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

            {/* Available Capital Pools Matrix with Numeric Right-Alignment */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/40 text-purple-400">
                    <Layers size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide uppercase">Available Capital Vaults</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Multi-currency lending vaults with deterministic interest models</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-300">Updated live</span>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="portal-table text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2c22] text-[#8fa799] text-xs font-semibold uppercase">
                      <th className="pb-3.5 text-left">Pool Asset</th>
                      <th className="pb-3.5 text-right">Total Value Locked</th>
                      <th className="pb-3.5 text-right">Utilization</th>
                      <th className="pb-3.5 text-right">Supply APY</th>
                      <th className="pb-3.5 text-right">Borrow APR</th>
                      <th className="pb-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2c22]">
                    {[
                      { asset: 'USDC Vault', tvl: '$ 5,420,000', util: '64.2%', supplyApy: '8.20%', borrowApr: '5.20%' },
                      { asset: 'EURC Vault', tvl: '€ 3,120,000', util: '58.5%', supplyApy: '7.10%', borrowApr: '4.80%' },
                      { asset: 'USD Liquid', tvl: '$ 1,840,000', util: '42.0%', supplyApy: '6.50%', borrowApr: '4.50%' },
                      { asset: 'FDX Native', tvl: '✦ 9,820,000', util: '78.4%', supplyApy: '9.40%', borrowApr: '6.10%' },
                    ].map((pool, idx) => (
                      <tr key={idx} className="hover:bg-[#1a2d22]/50 transition-colors">
                        <td className="py-4 font-bold text-white text-left">{pool.asset}</td>
                        <td className="py-4 font-mono text-right tabular-nums">{pool.tvl}</td>
                        <td className="py-4 text-right">
                          <span className="text-xs font-mono text-teal-300 tabular-nums">{pool.util}</span>
                        </td>
                        <td className="py-4 text-emerald-400 font-mono font-bold text-right tabular-nums">{pool.supplyApy}</td>
                        <td className="py-4 text-white font-mono font-bold text-right tabular-nums">{pool.borrowApr}</td>
                        <td className="py-4 text-right">
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
          <div className="flex flex-col gap-10 animate-fade-in">
            {/* Top Row: Score Gauge & Mathematical Breakdown */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Score Gauge Card */}
              <div className="lg:col-span-5 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-6 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/40">
                  Deterministic Score Engine
                </span>
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="primeScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="35%" stopColor="#06b6d4" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1c2c22" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#primeScoreGrad)"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset="60"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white tracking-tight tabular-nums">785</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mt-2">Tier 1 Prime</span>
                  </div>
                </div>
                <p className="text-sm text-[#9eb5a7] max-w-sm mt-6 leading-relaxed">
                  Ranked in top 2% of institutional borrowers. Eligible for max $250,000 zero-collateral line with 0.85x fee discount.
                </p>
              </div>

              {/* Scoring Factors Breakdown - Multi-Color Theme */}
              <div className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                        <Award size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                        Mathematical Scoring Attributes
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">Max Score: 850</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      { label: 'On-Time Repayment Consistency', score: '99.2%', impact: '+220 pts', color: 'bg-emerald-500', textCol: 'text-emerald-400' },
                      { label: 'Capital Velocity & Turnaround Rate', score: '94.5%', impact: '+180 pts', color: 'bg-cyan-500', textCol: 'text-cyan-300' },
                      { label: 'Reserve Staking Commitment', score: '88.0%', impact: '+150 pts', color: 'bg-amber-500', textCol: 'text-amber-300' },
                      { label: 'Protocol Longevity & History', score: '82.4%', impact: '+135 pts', color: 'bg-purple-500', textCol: 'text-purple-300' },
                      { label: 'Historical Default Rate', score: '0.00%', impact: 'Perfect Record', color: 'bg-rose-500', textCol: 'text-rose-300' },
                    ].map((factor, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a]">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="font-semibold text-white">{factor.label}</span>
                          <span className={`${factor.textCol} font-mono font-bold text-right tabular-nums`}>{factor.impact}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1b2d24] overflow-hidden">
                          <div className={`h-full ${factor.color}`} style={{ width: factor.score }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Credit Tier Progression Matrix + Dynamic Simulator */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Credit Tier Matrix */}
              <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <Scale size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Credit Tier Progression</h3>
                    </div>
                    <span className="text-xs font-mono text-teal-300">Deterministic Gates</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      { tier: 'Tier 1 Prime', line: '$ 250,000 Max Line', minScore: '750+ Score', discount: '0.85x Fee Multiplier', active: true, color: 'border-emerald-500/50 bg-emerald-950/20' },
                      { tier: 'Tier 2 Growth', line: '$ 100,000 Max Line', minScore: '680+ Score', discount: '1.00x Fee Multiplier', active: false, color: 'border-[#22362a] bg-[#0c1611]' },
                      { tier: 'Tier 3 Emerging', line: '$ 25,000 Max Line', minScore: '600+ Score', discount: '1.15x Fee Multiplier', active: false, color: 'border-[#22362a] bg-[#0c1611]' },
                    ].map((t, idx) => (
                      <div key={idx} className={`p-5 rounded-2xl border ${t.color} flex items-center justify-between`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{t.tier}</span>
                            {t.active && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-300">
                                CURRENT STATUS
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#8fa799] mt-1">{t.minScore} · {t.discount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold font-mono text-base tabular-nums">{t.line}</div>
                          <div className="text-[11px] text-[#71877b]">Zero Collateral</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Score Simulator */}
              <div className="lg:col-span-6 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/40 text-amber-400">
                        <SlidersHorizontal size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Score Boost Simulator</h3>
                    </div>
                    <span className="text-xs font-mono text-amber-300">Simulate Actions</span>
                  </div>

                  <div className="mt-6 flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#8fa799] mb-2">
                        <span>Early Repayment Simulation</span>
                        <span className="text-white font-bold font-mono tabular-nums">${simRepay.toLocaleString()} USDC</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="5000"
                        value={simRepay}
                        onChange={(e) => setSimRepay(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#1b2d24] rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold uppercase text-[#8fa799] mb-2">
                        <span>FDX Reserve Staking</span>
                        <span className="text-white font-bold font-mono tabular-nums">{simStake.toLocaleString()} FDX</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25000"
                        step="2500"
                        value={simStake}
                        onChange={(e) => setSimStake(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer h-2 bg-[#1b2d24] rounded-lg"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a] flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[#8fa799] uppercase font-semibold">Projected Score Impact</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
                          785 → {785 + Math.round(simRepay / 2500) + Math.round(simStake / 1000)} PTS
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          +{Math.round(simRepay / 2500) + Math.round(simStake / 1000)} PTS Projected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#71877b] text-center pt-2">
                  Scores recalculate deterministically upon each onchain settlement.
                </div>
              </div>
            </div>

            {/* Bottom: Immutable Repayment Receipts Ledger with Right-Aligned Amounts */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Immutable Repayment Receipts</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Cryptographically proved settlement audit trail</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-teal-300">Cryptographically Proved</span>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="portal-table text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2c22] text-[#8fa799] text-xs font-semibold uppercase">
                      <th className="pb-3.5 text-left">Receipt ID</th>
                      <th className="pb-3.5 text-right">Principal Settled</th>
                      <th className="pb-3.5 text-right">Interest Paid</th>
                      <th className="pb-3.5 text-left">Completion Date</th>
                      <th className="pb-3.5 text-left">Verification Hash</th>
                      <th className="pb-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2c22]">
                    {[
                      { id: 'RCPT-10492', principal: '50,000 FDX', interest: '762.50 FDX', date: 'Sep 28, 2026', hash: '0x4f8a...9c12' },
                      { id: 'RCPT-10491', principal: '25,000 USDC', interest: '150.00 USDC', date: 'Sep 14, 2026', hash: '0x1c3b...8e44' },
                      { id: 'RCPT-10490', principal: '10,000 EURC', interest: '48.00 EURC', date: 'Aug 30, 2026', hash: '0x99a2...7710' },
                    ].map((rcpt, idx) => (
                      <tr key={idx} className="hover:bg-[#1a2d22]/50 transition-colors">
                        <td className="py-4 font-mono text-xs text-[#8fa799] text-left">{rcpt.id}</td>
                        <td className="py-4 font-bold text-white text-right tabular-nums">{rcpt.principal}</td>
                        <td className="py-4 text-emerald-400 font-mono text-right tabular-nums">{rcpt.interest}</td>
                        <td className="py-4 text-[#8fa799] text-left whitespace-nowrap">{rcpt.date}</td>
                        <td className="py-4 font-mono text-xs text-teal-300 text-left whitespace-nowrap">{rcpt.hash}</td>
                        <td className="py-4 text-center">
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
          <div className="flex flex-col gap-10 animate-fade-in">
            {/* Top 4 Risk Sentinel Health Metrics - Multi-Color Theme */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#13281c] via-[#0f2016] to-[#0c1811] border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_8px_30px_rgba(16,185,129,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80 mb-1">Sentinel Quorum</div>
                <div className="text-3xl font-bold text-emerald-400 tracking-tight tabular-nums">3 / 3 Nodes</div>
                <div className="mt-2 text-xs text-emerald-300 font-mono">Consensus: 100% Active</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e2430] via-[#0a1c26] to-[#08151e] border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_8px_30px_rgba(6,182,212,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300/80 mb-1">Solvency Ratio</div>
                <div className="text-3xl font-bold text-cyan-300 tracking-tight tabular-nums">214.8%</div>
                <div className="mt-2 text-xs text-cyan-400/80 font-mono">Surplus Headroom Buffer</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2a1c12] via-[#20150d] to-[#170e08] border border-amber-500/30 hover:border-amber-400/60 shadow-[0_8px_30px_rgba(245,158,11,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1">Single-Pool Max Cap</div>
                <div className="text-3xl font-bold text-amber-300 tracking-tight tabular-nums">$ 5,000,000</div>
                <div className="mt-2 text-xs text-amber-400/80 font-mono">Automatic Circuit Breaker</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#241430] via-[#1a0e24] to-[#12081a] border border-purple-500/30 hover:border-purple-400/60 shadow-[0_8px_30px_rgba(168,85,247,0.06)] transition-all">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-300/80 mb-1">Oracle Health</div>
                <div className="text-3xl font-bold text-purple-300 tracking-tight tabular-nums">100% Sync</div>
                <div className="mt-2 text-xs text-purple-400/80 font-mono">0.00% Price Variance</div>
              </div>
            </div>

            {/* Middle Row: Multi-Node Quorum Matrix + Live Stress Test Simulator */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Multi-Node Consensus Matrix */}
              <div className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <Cpu size={18} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Multi-Node Sentinel Quorum</h3>
                        <p className="text-xs text-[#8fa799] mt-0.5">Decentralized offchain AI verification nodes</p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                      3/3 ACTIVE
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col gap-3.5">
                    {[
                      { node: 'Sentinel Node Alpha', role: 'Liquidity Velocity & Outflow Tracker', latency: '42ms', status: 'Voting: Optimal', sig: '0x9d4a...c77b' },
                      { node: 'Sentinel Node Beta', role: 'Cross-Vault Collateralization Ratio', latency: '38ms', status: 'Voting: 214.8% Solvency', sig: '0x1c8b...32fa' },
                      { node: 'Sentinel Node Gamma', role: 'Borrower Repayment Pacing Engine', latency: '49ms', status: 'Voting: Tier 1 Conforming', sig: '0x7a81...49de' },
                    ].map((n, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <div className="lg:col-span-5 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/40 text-amber-400">
                        <Zap size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Stress-Test Simulator</h3>
                    </div>
                    <span className="text-xs font-mono text-amber-300">Live Simulation</span>
                  </div>

                  <div className="mt-6 flex flex-col gap-5">
                    <div>
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
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-[#1b2d24] rounded-lg"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a] space-y-3">
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

                <div className="mt-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={14} className="shrink-0" />
                  <span>Protocol resilience verified. Solvency guaranteed above 150% threshold.</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Live Attestation Log + Governance Guardrails */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Real-Time Attestation Log */}
              <div className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <Radio size={16} />
                      </span>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">Real-Time Attestation Log</h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">Live Stream</span>
                  </div>

                  <div className="mt-4 p-5 rounded-2xl bg-[#0c1611] border border-[#22362a] font-mono text-xs text-[#8fa799] space-y-3 leading-relaxed">
                    <div className="text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Attestation Consensus Feed</span>
                    </div>
                    <p>
                      [2026-10-14 15:42:01 UTC] Sentinel Node Alpha: Solvency check completed. 0 anomalies detected.
                      <br />
                      [2026-10-14 15:42:04 UTC] Sentinel Node Beta: Cross-checked capital reserves against active credit lines.
                      <br />
                      [2026-10-14 15:42:08 UTC] Sentinel Node Gamma: Verified repayment hashes. Signature 0x7a81...49de generated.
                      <br />
                      [2026-10-14 15:42:15 UTC] Sentinel Node Alpha: Dynamic interest curve re-indexed for USDC vault (8.20% APY).
                    </p>
                  </div>
                </div>
              </div>

              {/* Governance Guardrails */}
              <div className="lg:col-span-5 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/40 text-purple-400">
                        <ShieldAlert size={16} />
                      </span>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide">Governance Guardrails</h3>
                    </div>
                    <span className="text-xs font-mono text-purple-300">Safety Boundaries</span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs text-[#9eb5a7] leading-relaxed">
                    <div className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a]">
                      <span className="text-sm text-white font-bold block mb-1">Non-Authoritative AI</span>
                      <p>AI models only monitor and attest. Models have zero direct authority to disburse, seize, or reallocate treasury capital.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a]">
                      <span className="text-sm text-white font-bold block mb-1">Deterministic Settlement</span>
                      <p>Loan creation, repayment, and interest calculation are governed purely by deterministic, versioned credit rules.</p>
                    </div>
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
          <div className="flex flex-col gap-10 animate-fade-in">
            {swapSuccess && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-[#12281b] border border-emerald-500/50 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-lg">
                <span>✓ Successfully swapped {Number(swapAmount).toLocaleString()} {swapFrom} for {swapTo}! Instant liquidity filled.</span>
                <span className="font-mono text-xs text-emerald-300">Tx: 0x4e8a...11bc</span>
              </div>
            )}

            {/* Top Market Ticker Bar */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12281c] to-[#0c1811] border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80 mb-1">FDX / USDC Price</div>
                <div className="text-3xl font-bold text-white tracking-tight tabular-nums">$ 1.0004</div>
                <div className="mt-2 text-xs text-emerald-400 font-mono">▲ +0.04% (Pegged)</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10242e] to-[#0a171d] border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80 mb-1">24h Market Volume</div>
                <div className="text-3xl font-bold text-cyan-300 tracking-tight tabular-nums">$ 4,820,900</div>
                <div className="mt-2 text-xs text-cyan-400 font-mono">Zero Slippage Pool</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#292014] to-[#18130b] border border-amber-500/30 shadow-lg shadow-amber-950/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 mb-1">Order Book Spread</div>
                <div className="text-3xl font-bold text-amber-300 tracking-tight tabular-nums">0.06% Spread</div>
                <div className="mt-2 text-xs text-amber-400 font-mono">Tight Institutional Book</div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#24172e] to-[#140b1b] border border-purple-500/30 shadow-lg shadow-purple-950/20">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-400/80 mb-1">Settlement Finality</div>
                <div className="text-3xl font-bold text-purple-300 tracking-tight tabular-nums">Sub-Second</div>
                <div className="mt-2 text-xs text-purple-400 font-mono">Deterministic Atomic Swap</div>
              </div>
            </div>

            {/* Middle Row: Order Book & Instant Liquidity Swap */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Order Book */}
              <div className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                        <BarChart3 size={18} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Live Capital Order Book</h3>
                        <p className="text-xs text-[#8fa799] mt-0.5">USDC / FDX Market Depth</p>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-800/40">
                      Spread: 0.0006 (0.06%)
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-5">
                    {/* Bids */}
                    <div>
                      <div className="flex justify-between items-center text-xs uppercase text-emerald-400 mb-3 font-bold">
                        <span>Bid Price</span>
                        <span>Size (FDX)</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {orderBookBids.map((bid, i) => (
                          <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-emerald-950/30 text-emerald-300 border border-emerald-900/30 tabular-nums">
                            <span>{bid.price.toFixed(4)}</span>
                            <span className="font-bold">{bid.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Asks */}
                    <div>
                      <div className="flex justify-between items-center text-xs uppercase text-rose-400 mb-3 font-bold">
                        <span>Ask Price</span>
                        <span>Size (FDX)</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {orderBookAsks.map((ask, i) => (
                          <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-rose-950/30 text-rose-300 border border-rose-900/30 tabular-nums">
                            <span>{ask.price.toFixed(4)}</span>
                            <span className="font-bold">{ask.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Liquidity Swap Widget */}
              <div className="lg:col-span-5 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-800/40 text-teal-400">
                        <RefreshCw size={16} />
                      </span>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">Instant Liquidity Swap</h3>
                    </div>
                    <span className="text-xs font-mono text-teal-300">0.05% Fee</span>
                  </div>

                  <div className="mt-8 flex flex-col gap-5">
                    <div>
                      <label className="text-xs font-semibold uppercase text-[#8fa799] block mb-2">Pay Asset</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={swapAmount}
                          onChange={(e) => setSwapAmount(e.target.value)}
                          className="flex-1 bg-[#0c1611] border border-[#22362a] rounded-2xl px-5 py-3.5 text-white text-lg font-bold focus:outline-hidden focus:border-emerald-500 tabular-nums"
                        />
                        <select
                          value={swapFrom}
                          onChange={(e) => setSwapFrom(e.target.value)}
                          className="bg-[#0c1611] border border-[#22362a] rounded-2xl px-4 py-3.5 text-white text-sm font-bold cursor-pointer"
                        >
                          <option>USDC</option>
                          <option>EURC</option>
                          <option>FDX</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#8fa799] block mb-2">Receive Estimate</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#0c1611] border border-[#22362a] rounded-2xl px-5 py-3.5 text-emerald-400 text-lg font-bold tabular-nums">
                          {(Number(swapAmount) * 0.9995).toFixed(2)}
                        </div>
                        <select
                          value={swapTo}
                          onChange={(e) => setSwapTo(e.target.value)}
                          className="bg-[#0c1611] border border-[#22362a] rounded-2xl px-4 py-3.5 text-white text-sm font-bold cursor-pointer"
                        >
                          <option>FDX</option>
                          <option>USDC</option>
                          <option>EURC</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0c1611] border border-[#22362a] text-xs flex flex-col gap-2 text-[#8fa799]">
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
                </div>

                <button
                  onClick={handleExecuteSwap}
                  className="mt-8 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider shadow-lg transition cursor-pointer"
                >
                  Execute Capital Swap
                </button>
              </div>
            </div>

            {/* Bottom: Recent Market Trades Table with Right-Aligned Values */}
            <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#203328]">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/40 text-teal-400">
                    <TrendingUp size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Recent Executed Market Trades</h3>
                    <p className="text-xs text-[#8fa799] mt-0.5">Live filled market orders across protocol liquidity pairs</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">Deterministic Atomic Settlement</span>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="portal-table text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2c22] text-[#8fa799] text-xs font-semibold uppercase">
                      <th className="pb-3.5 text-left">Trade ID</th>
                      <th className="pb-3.5 text-left">Market Pair</th>
                      <th className="pb-3.5 text-center">Side</th>
                      <th className="pb-3.5 text-right">Execution Price</th>
                      <th className="pb-3.5 text-right">Volume</th>
                      <th className="pb-3.5 text-right">Time</th>
                      <th className="pb-3.5 text-right font-mono">Settlement Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2c22]">
                    {marketTrades.map((t, idx) => (
                      <tr key={idx} className="hover:bg-[#1a2d22]/50 transition-colors">
                        <td className="py-4 font-mono text-xs text-[#8fa799] text-left">{t.id}</td>
                        <td className="py-4 font-bold text-white text-left">{t.pair}</td>
                        <td className="py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold inline-block ${
                            t.type === 'Buy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-white text-right tabular-nums">{t.price}</td>
                        <td className="py-4 font-mono text-[#8fa799] text-right tabular-nums">{t.size}</td>
                        <td className="py-4 text-[#8fa799] text-right">{t.time}</td>
                        <td className="py-4 text-right font-mono text-xs text-teal-300">{t.hash}</td>
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
          <div className="w-full p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#15241b] to-[#0f1b13] border border-[#263e30] shadow-xl flex flex-col gap-8 animate-fade-in">
            <div className="flex items-center gap-3 pb-6 border-b border-[#203328]">
              <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400">
                <FileText size={20} />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                  Institutional Terms of Service & Compliance
                </h2>
                <p className="text-xs text-[#8fa799] mt-0.5">Deterministic governance and capital pool legal disclosures</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm text-[#9eb5a7] leading-relaxed">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12241a] to-[#0b1610] border border-emerald-500/30 flex flex-col justify-between shadow-[0_4px_20px_rgba(16,185,129,0.06)]">
                <strong className="text-white text-base block mb-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  1. Non-Custodial Operation
                </strong>
                Fundryx operates as a non-custodial capital protocol. All borrower credit assessments, loan disbursements, and interest settlements are processed according to deterministic, versioned credit policies.
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e212b] to-[#08151b] border border-cyan-500/30 flex flex-col justify-between shadow-[0_4px_20px_rgba(6,182,212,0.06)]">
                <strong className="text-white text-base block mb-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  2. Credit Scoring Disclosures
                </strong>
                Repayment history records and deterministic credit scores are mathematically derived without subjective human intervention or third-party marketing brokers.
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#241c12] to-[#15100a] border border-amber-500/30 flex flex-col justify-between shadow-[0_4px_20px_rgba(245,158,11,0.06)]">
                <strong className="text-white text-base block mb-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  3. Risk Telemetry
                </strong>
                AI Risk Telemetry operates in advisory shadow mode. It provides early warning notifications to risk committees but has no autonomous transfer authority over treasury funds.
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#20142b] to-[#130b1b] border border-purple-500/30 flex flex-col justify-between shadow-[0_4px_20px_rgba(168,85,247,0.06)]">
                <strong className="text-white text-base block mb-1.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  4. Data Privacy & Zero-Knowledge Verification
                </strong>
                Fundryx does not harvest, distribute, or broker confidential borrower data. Cryptographic attestations verify eligibility while preserving borrower privacy.
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
