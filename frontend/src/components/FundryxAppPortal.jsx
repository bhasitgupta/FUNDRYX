import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
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
  ShieldCheck,
  Radio,
  Layers,
  TrendingUp,
  BarChart3,
  FileText,
  DollarSign,
  Wallet,
  Clock,
  Sparkles,
  ChevronDown,
  Cpu,
  ShieldAlert,
  Scale,
  Activity,
  CheckCircle,
  ExternalLink
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

  // Terms accordion state
  const [openTermSection, setOpenTermSection] = useState(0);

  // Live Simulated Loans
  const [activeLoans, setActiveLoans] = useState([
    { id: 'LOAN-8891', asset: 'USDC', amount: 15000, apr: '5.20%', dueDays: 6, progress: 70, status: 'Active', tier: 'Prime Tier 1' },
    { id: 'LOAN-8842', asset: 'EURC', amount: 33210, apr: '4.80%', dueDays: 12, progress: 45, status: 'Active', tier: 'Prime Tier 1' },
    { id: 'LOAN-7920', asset: 'FDX', amount: 50000, apr: '6.10%', dueDays: 0, progress: 100, status: 'Settled', tier: 'Prime Tier 1' },
  ]);

  // Real-time protocol activity feed
  const [activityFeed, setActivityFeed] = useState([
    { id: 'EV-9921', type: 'Repayment', borrower: '0x8b3f...41e9', amount: '12,500 USDC', score: '+18 Prime', time: '2m ago', hash: '0x3f1a...48b9' },
    { id: 'EV-9920', type: 'Disbursement', borrower: '0x3c19...9a72', amount: '45,000 EURC', score: '792 Scored', time: '8m ago', hash: '0x99c2...51da' },
    { id: 'EV-9919', type: 'Yield Compound', borrower: 'Liquidity Vault #1', amount: '3,840 USDC', score: 'APY 7.80%', time: '14m ago', hash: '0x2a8b...773e' },
    { id: 'EV-9918', type: 'Risk Consensus', borrower: 'AI Sentinel Quorum', amount: '3/3 Nodes', score: '100% Solvency', time: '22m ago', hash: '0x88f4...11a0' },
    { id: 'EV-9917', type: 'Capital Supply', borrower: '0x71c9...49a2', amount: '25,000 FDX', score: 'Tier 1 Prime', time: '34m ago', hash: '0x4f8a...9c12' },
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
      progress: 10,
      status: 'Active',
      tier: 'Prime Tier 1',
    };
    setActiveLoans([newLoan, ...activeLoans]);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Disbursement', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: `${Number(borrowInput).toLocaleString()} USDC`, score: '785 Prime', time: 'Just now', hash: '0x1c8b...32fa' },
      ...activityFeed,
    ]);
    setTimeout(() => setBorrowSuccess(false), 3000);
  };

  const handleExecuteSupply = () => {
    setSupplySuccess(true);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Capital Supply', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: `${Number(supplyAmount).toLocaleString()} ${supplyAsset}`, score: 'Reserve Backed', time: 'Just now', hash: '0x7a81...49de' },
      ...activityFeed,
    ]);
    setTimeout(() => setSupplySuccess(false), 3000);
  };

  const handleExecuteRepay = (id) => {
    setActiveLoans(activeLoans.map((l) => (l.id === id ? { ...l, status: 'Settled', progress: 100 } : l)));
    setRepaySuccess(true);
    setActivityFeed([
      { id: `EV-${Math.floor(1000 + Math.random() * 9000)}`, type: 'Repayment', borrower: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '0x71c9...49a2', amount: 'Verified Full Settlement', score: '+15 Prime Boost', time: 'Just now', hash: '0x9d4a...c77b' },
      ...activityFeed,
    ]);
    setTimeout(() => setRepaySuccess(false), 3000);
  };

  const handleExecuteSwap = () => {
    setSwapSuccess(true);
    setTimeout(() => setSwapSuccess(false), 2500);
  };

  const termSections = [
    {
      title: 'Section A: Smart Contract Master Loan Agreement',
      summary: 'Algorithmic enforcement, solvency reserves, and liquidation safeguards.',
      content: 'All uncollateralized lending facilities extended through Able Credit operate under deterministic smart contracts. Interest rate calculations adhere to algorithmic curves calibrated against pool utilization. Solvency reserve contracts absorb first-loss exposure up to 100% of the allocated reserve buffer. In the event of maturity expiration without full principal return, automated credit downgrade cascades trigger across all connected validator nodes.'
    },
    {
      title: 'Section B: Decentralized Dispute Arbitration',
      summary: 'Multi-sig quorum court, deterministic appeal bounds, and evidence verification.',
      content: 'Disputes arising from state transitions or cross-chain synchronization delays are arbitrated via the 3-node offchain sentinel quorum. Evidence consisting of zero-knowledge solvency proofs and signed state transitions must be submitted within 72 hours of epoch finality. Arbitration rulings are executed directly by onchain multi-signature consensus without subjective intervention.'
    },
    {
      title: 'Section C: Capital Pool Insolvency Waterfall',
      summary: 'Primary reserve absorption, secondary mutual tranche, and recovery schedule.',
      content: 'Protocol solvency is structured in a 3-tier waterfall hierarchy. Tier 1: Dedicated vault reserves absorb localized drawdown shocks. Tier 2: Protocol backstop treasury activates upon reaching 150% minimum solvency threshold. Tier 3: Circuit breakers freeze outgoing disbursements while preserving all incoming repayment rails.'
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
    <div className="portal-layout">
      
      {/* ========================================================= */}
      {/* LEFT SIDEBAR NAVIGATION PANEL - UNTOUCHED (HARD RULE 1)   */}
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
      {/* RIGHT-HAND MAIN WORKSPACE (REDESIGNED CONTENT AREA)       */}
      {/* ========================================================= */}
      <div className="portal-main-area">
        
        {/* Sticky Top Bar: 64px Height, 32px Side Padding */}
        <header className="portal-top-bar">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]"
            >
              <Layers size={18} />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="portal-label">Portal</span>
              <span className="text-[var(--border)]">/</span>
              <span className="text-sm font-semibold text-[var(--text)] truncate">
                {activeTab === 'overview' && 'Overview & Portfolio'}
                {activeTab === 'lending' && 'Able Credit'}
                {activeTab === 'credit' && 'Borderline Verify'}
                {activeTab === 'risk' && 'AI Risk Telemetry'}
                {activeTab === 'markets' && 'Capital Markets'}
                {activeTab === 'terms' && 'Legal & Risk Terms'}
              </span>
            </div>
          </div>

          {/* Right Controls: Website & Wallet */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToLanding}
              className="portal-btn-secondary h-10 px-4 text-xs font-semibold gap-2"
            >
              <ArrowDownLeft size={16} className="text-[var(--primary)] rotate-45" />
              <span>Website</span>
            </button>

            {wallet.address ? (
              <div className="flex items-center gap-2.5">
                <div className="h-10 px-3.5 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2 text-xs font-mono text-[var(--primary)] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                  <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                  <span className="text-[var(--text-dim)]">({wallet.balance || '10,000'} FDX)</span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="h-10 px-3.5 rounded-[10px] bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] text-xs font-semibold text-[var(--danger)] transition cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="portal-btn-primary h-10 px-5 text-sm font-semibold shrink-0"
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
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
        {/* MAIN CONTENT AREA: Max-Width 1280px, Padding 32px         */}
        {/* ========================================================= */}
        <main className="portal-main-content">

          {/* ======================================================= */}
          {/* TAB 1: OVERVIEW & PORTFOLIO                             */}
          {/* ======================================================= */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              {/* Header Title: Max 1 short line (<8 words) */}
              <div>
                <h1 className="portal-page-title">Overview &amp; Portfolio</h1>
                <p className="portal-page-sub">Real-time capital and liquidity performance.</p>
              </div>

              {/* Row 1: 3 Summary Cards (Equal Width) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="portal-card portal-card-top-primary portal-sheen-primary">
                  <div className="portal-card-header">
                    <span className="portal-label">Total Net Worth</span>
                    <span className="portal-badge portal-badge-primary">QTD</span>
                  </div>
                  <div className="portal-stat-num">$1,332,718</div>
                  <div className="text-xs text-[var(--primary)] font-medium mt-3 flex items-center gap-1.5">
                    <span>▲ +11.8%</span>
                    <span className="text-[var(--text-muted)]">from last quarter</span>
                  </div>
                </div>

                <div className="portal-card portal-card-top-amber portal-sheen-amber">
                  <div className="portal-card-header">
                    <span className="portal-label">Active Credit Line</span>
                    <span className="portal-badge portal-badge-accent">Prime</span>
                  </div>
                  <div className="portal-stat-num">$250,000</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">
                    Tier 1 Prime · Deterministic Score 785
                  </div>
                </div>

                <div className="portal-card portal-card-top-cyan">
                  <div className="portal-card-header">
                    <span className="portal-label">Current Borrowed</span>
                    <span className="portal-badge portal-badge-neutral">2 Active</span>
                  </div>
                  <div className="portal-stat-num">$48,210</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">
                    Weighted APR 5.05% · Due in 6 days
                  </div>
                </div>
              </div>

              {/* Row 2: Active Loans Table (2/3) + AI Risk Sentinel Card (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="portal-card lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Active Capital Loans</h2>
                      <span className="portal-badge portal-badge-primary">Zero Collateral</span>
                    </div>
                    <div className="portal-table-wrapper">
                      <table className="portal-table-v2">
                        <thead>
                          <tr>
                            <th>Loan ID</th>
                            <th>Asset</th>
                            <th className="text-right">Principal</th>
                            <th className="text-right">Fixed APR</th>
                            <th className="text-right">Due</th>
                            <th className="text-center">Status</th>
                            <th className="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeLoans.map((loan) => (
                            <tr key={loan.id}>
                              <td className="font-mono text-xs text-[var(--text-muted)]">{loan.id}</td>
                              <td className="font-semibold text-white">{loan.asset}</td>
                              <td className="text-right font-mono tabular-nums text-white">{loan.amount.toLocaleString()}</td>
                              <td className="text-right font-mono tabular-nums text-[var(--primary)]">{loan.apr}</td>
                              <td className="text-right text-[var(--text-muted)] text-xs">{loan.status === 'Active' ? `${loan.dueDays}d` : 'Matured'}</td>
                              <td className="text-center">
                                <span className={`portal-badge ${loan.status === 'Active' ? 'portal-badge-primary' : 'portal-badge-neutral'}`}>
                                  {loan.status}
                                </span>
                              </td>
                              <td className="text-right">
                                {loan.status === 'Active' ? (
                                  <button
                                    onClick={() => handleExecuteRepay(loan.id)}
                                    className="portal-btn-secondary h-8 px-3 text-xs"
                                  >
                                    Settle
                                  </button>
                                ) : (
                                  <span className="text-xs text-[var(--text-dim)]">Verified</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{activeLoans.length} active positions tracked</span>
                    <span className="font-semibold text-[var(--primary)]">100% Repayment Confidence</span>
                  </div>
                </div>

                {/* AI Risk Sentinel Card */}
                <div className="portal-card portal-card-top-cyan portal-sheen-cyan flex flex-col justify-between relative">
                  <div className="portal-scanner-line" />
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">AI Risk Sentinel</h2>
                      <span className="portal-badge portal-badge-cyan">
                        <span className="pulse-dot-cyan shrink-0" /> Live Guard
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="portal-label">Liquidity Drain Index</span>
                          <span className="font-mono font-bold text-[var(--accent-2)]">0.02%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="pulse-dot-cyan shrink-0" />
                          <span>Optimal · No anomalous outflow</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="portal-label">Velocity Sensor</span>
                          <span className="font-bold text-white">Conforming</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="pulse-dot-emerald shrink-0" />
                          <span>Repayment pacing normal</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="portal-label">Quorum Consensus</span>
                          <span className="font-mono font-bold text-[var(--warn)]">3/3 Nodes</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span className="pulse-dot-amber shrink-0" />
                          <span>100% Solvency verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={() => setActiveTab('risk')}
                      className="portal-btn-cyan w-full text-xs"
                    >
                      Open Risk Telemetry
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Treasury as 4 Equal Vault Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="portal-card-title">Treasury Reserves &amp; Capital Allocation</h2>
                  <span className="text-xs font-mono text-[var(--text-muted)]">Total TVL: $11.48M</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { name: 'USDC Vault', amount: '$912,400', apy: '8.20% APY', alloc: 48, topClass: 'portal-card-top-primary', badgeClass: 'portal-badge-primary', barColor: 'bg-[var(--primary)]' },
                    { name: 'EURC Vault', amount: '€228,900', apy: '7.10% APY', alloc: 22, topClass: 'portal-card-top-cyan', badgeClass: 'portal-badge-cyan', barColor: 'bg-[var(--accent-2)]' },
                    { name: 'USD Liquid', amount: '$540,000', apy: '6.50% APY', alloc: 18, topClass: 'portal-card-top-amber', badgeClass: 'portal-badge-accent', barColor: 'bg-[var(--warn)]' },
                    { name: 'FDX Native', amount: '9,820,000', apy: '9.40% APY', alloc: 12, topClass: 'portal-card-top-purple', badgeClass: 'portal-badge-purple', barColor: 'bg-[var(--accent-3)]' },
                  ].map((vault, i) => (
                    <div key={i} className={`portal-card ${vault.topClass}`}>
                      <div className="portal-card-header">
                        <span className="text-sm font-semibold text-white">{vault.name}</span>
                        <span className={`portal-badge ${vault.badgeClass}`}>{vault.apy}</span>
                      </div>
                      <div className="portal-stat-num text-white mb-4">{vault.amount}</div>
                      <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                        <span className="portal-label">Allocation</span>
                        <span className="font-mono font-semibold text-white">{vault.alloc}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <div className={`h-full ${vault.barColor} rounded-full`} style={{ width: `${vault.alloc}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Event Stream as a Compact Timeline List */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Protocol Event Stream</h2>
                  <span className="portal-badge portal-badge-neutral">Quorum Attested</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {activityFeed.map((ev) => (
                    <div key={ev.id} className="py-3.5 flex items-center justify-between gap-4 text-sm flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`portal-badge shrink-0 ${
                          ev.type === 'Repayment' ? 'portal-badge-primary' :
                          ev.type === 'Disbursement' ? 'portal-badge-accent' :
                          ev.type === 'Yield Compound' ? 'portal-badge-yield' :
                          ev.type === 'Risk Consensus' ? 'portal-badge-cyan' :
                          ev.type === 'Capital Supply' ? 'portal-badge-purple' :
                          'portal-badge-neutral'
                        }`}>
                          {ev.type}
                        </span>
                        <span className="font-mono text-xs text-[var(--text-muted)] truncate max-w-[140px]">{ev.borrower}</span>
                        <span className="text-xs text-[var(--text-dim)] font-mono hidden md:inline">({ev.score})</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-semibold text-white font-mono">{ev.amount}</span>
                        <span className="text-xs text-[var(--text-muted)] min-w-[50px] text-right">{ev.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: ABLE CREDIT (BORROW & LEND)                      */}
          {/* ======================================================= */}
          {activeTab === 'lending' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <h1 className="portal-page-title">Able Credit</h1>
                <p className="portal-page-sub">Uncollateralized institutional lending and yield vaults.</p>
              </div>

              {/* Row 1: 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="portal-card portal-card-top-primary">
                  <div className="portal-card-header">
                    <span className="portal-label">Available Liquidity</span>
                    <span className="portal-badge portal-badge-primary">Buffer</span>
                  </div>
                  <div className="portal-stat-num">$11.48M</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Solvency reserve 100%</div>
                </div>

                <div className="portal-card portal-card-top-cyan">
                  <div className="portal-card-header">
                    <span className="portal-label">Active Borrow Volume</span>
                    <span className="portal-badge portal-badge-neutral">12 Repaid</span>
                  </div>
                  <div className="portal-stat-num">$48,210</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">100% verified settlement</div>
                </div>

                <div className="portal-card portal-card-top-amber">
                  <div className="portal-card-header">
                    <span className="portal-label">Prime Borrow Rate</span>
                    <span className="portal-badge portal-badge-accent">Fixed</span>
                  </div>
                  <div className="portal-stat-num">5.20%</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Tier 1 Prime rate curve</div>
                </div>

                <div className="portal-card portal-card-top-yield portal-sheen-yield">
                  <div className="portal-card-header">
                    <span className="portal-label">Weighted Supply APY</span>
                    <span className="portal-badge portal-badge-yield">Auto</span>
                  </div>
                  <div className="portal-stat-num text-[var(--accent-1)]">7.80%</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Continuous compounding</div>
                </div>
              </div>

              {/* Row 2: Two Equal Cards (Borrow / Supply) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Borrow Card */}
                <div className="portal-card portal-card-top-primary portal-sheen-primary flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Request Uncollateralized Loan</h2>
                      <span className="portal-badge portal-badge-primary">Prime Eligible</span>
                    </div>

                    {/* Amount Input + Slider */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="portal-label">Borrow Amount</label>
                        <span className="font-mono text-sm font-bold text-[var(--primary)]">${Number(borrowInput).toLocaleString()} USDC</span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="250000"
                        step="1000"
                        value={borrowInput}
                        onChange={(e) => setBorrowInput(e.target.value)}
                        className="portal-slider"
                      />
                      <div className="flex justify-between text-xs text-[var(--text-dim)] font-mono">
                        <span>Min $1,000</span>
                        <span>Max $250,000</span>
                      </div>
                    </div>

                    {/* Tenure Segmented Control */}
                    <div className="mb-6">
                      <label className="portal-label block mb-2">Repayment Tenure</label>
                      <div className="portal-segmented">
                        {[7, 14, 30].map((days) => (
                          <button
                            key={days}
                            onClick={() => setBorrowTerm(days)}
                            className={`portal-segmented-btn ${borrowTerm === days ? 'active border-[var(--primary)] text-white' : ''}`}
                          >
                            {days} Days
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary Rows (12px spacing) */}
                    <div className="flex flex-col gap-3 py-4 border-t border-[var(--border)] text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Fixed Protocol APR</span>
                        <span className="font-mono font-semibold text-[var(--primary)]">5.20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Estimated Total Repayment</span>
                        <span className="font-mono font-semibold text-white">
                          ${(Number(borrowInput) * (1 + 0.052 * (borrowTerm / 365))).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Collateral Requirement</span>
                        <span className="portal-badge portal-badge-primary">Zero Collateral</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Button Inside Card Padding */}
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={handleExecuteBorrow}
                      className="portal-btn-primary w-full"
                    >
                      {borrowSuccess ? 'Loan Disbursed!' : 'Execute Uncollateralized Loan'}
                    </button>
                  </div>
                </div>

                {/* Supply Card */}
                <div className="portal-card portal-card-top-yield portal-sheen-yield flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Supply Liquidity Vaults</h2>
                      <span className="portal-badge portal-badge-yield">7.80% APY</span>
                    </div>

                    {/* Asset Segmented Control */}
                    <div className="mb-5">
                      <label className="portal-label block mb-2">Select Capital Vault</label>
                      <div className="portal-segmented">
                        {[
                          { symbol: 'USDC', apy: '8.2%' },
                          { symbol: 'EURC', apy: '7.1%' },
                          { symbol: 'FDX', apy: '9.4%' }
                        ].map((v) => (
                          <button
                            key={v.symbol}
                            onClick={() => setSupplyAsset(v.symbol)}
                            className={`portal-segmented-btn ${supplyAsset === v.symbol ? 'active border-[var(--accent-1)] text-[var(--accent-1)]' : ''}`}
                          >
                            {v.symbol} ({v.apy})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deposit Amount Input */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="portal-label">Deposit Capital</label>
                        <span className="text-xs text-[var(--text-dim)] font-mono">Balance: 148,250 {supplyAsset}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={supplyAmount}
                          onChange={(e) => setSupplyAmount(e.target.value)}
                          className="w-full h-11 px-4 pr-16 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-white text-base outline-none focus:border-[var(--accent-1)] transition"
                          placeholder="0.00"
                        />
                        <button
                          onClick={() => setSupplyAmount('148250')}
                          className="absolute right-3.5 top-2.5 text-xs font-bold text-[var(--accent-1)] uppercase cursor-pointer hover:brightness-125 transition"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {/* Summary Rows */}
                    <div className="flex flex-col gap-3 py-4 border-t border-[var(--border)] text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Interest Compounding</span>
                        <span className="font-semibold text-white">Continuous per-second</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Withdrawal Liquidity</span>
                        <span className="font-semibold text-white">Instant (No Lockup)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Loss Protection Buffer</span>
                        <span className="portal-badge portal-badge-yield">100% Solvency Reserve</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={handleExecuteSupply}
                      className="portal-btn-yield w-full"
                    >
                      {supplySuccess ? 'Deposited Successfully!' : `Deposit & Earn ${supplyAsset} Yield`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Active Positions Table */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Active Loan Facilities</h2>
                  <span className="portal-badge portal-badge-neutral">Deterministic Servicing</span>
                </div>
                <div className="portal-table-wrapper">
                  <table className="portal-table-v2">
                    <thead>
                      <tr>
                        <th>Loan ID</th>
                        <th>Principal</th>
                        <th className="text-right">APR</th>
                        <th className="text-right">Due Days</th>
                        <th className="text-center">Progress</th>
                        <th className="text-center">Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoans.map((loan) => (
                        <tr key={loan.id}>
                          <td className="font-mono text-xs text-[var(--text-muted)]">{loan.id}</td>
                          <td className="font-semibold text-white font-mono tabular-nums">{loan.amount.toLocaleString()} {loan.asset}</td>
                          <td className="text-right font-mono tabular-nums text-[var(--primary)]">{loan.apr}</td>
                          <td className="text-right text-[var(--text-muted)] text-xs">{loan.status === 'Active' ? `${loan.dueDays}d` : 'Matured'}</td>
                          <td className="text-center">
                            <div className="w-24 h-1.5 bg-[var(--surface)] rounded-full mx-auto overflow-hidden">
                              <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${loan.progress}%` }} />
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`portal-badge ${loan.status === 'Active' ? 'portal-badge-primary' : 'portal-badge-neutral'}`}>
                              {loan.status}
                            </span>
                          </td>
                          <td className="text-right">
                            {loan.status === 'Active' ? (
                              <button
                                onClick={() => handleExecuteRepay(loan.id)}
                                className="portal-btn-secondary h-8 px-3 text-xs"
                              >
                                Settle
                              </button>
                            ) : (
                              <span className="text-xs text-[var(--text-dim)]">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: BORDERLINE VERIFY (SCORE)                        */}
          {/* ======================================================= */}
          {activeTab === 'credit' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <h1 className="portal-page-title">Borderline Verify</h1>
                <p className="portal-page-sub">zkSNARK deterministic solvency and scoring identity.</p>
              </div>

              {/* Row 1: Score Gauge (Left) + Score Breakdown (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Score Gauge Card */}
                <div className="portal-card portal-card-top-primary portal-sheen-primary flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Deterministic Credit Engine</h2>
                      <span className="portal-badge portal-badge-primary">zkSNARK Proved</span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="var(--surface-2)" strokeWidth="8" fill="none" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="var(--primary)"
                            strokeWidth="8"
                            strokeDasharray="264"
                            strokeDashoffset="38"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-extrabold text-white tracking-tight tabular-nums">785</span>
                          <span className="portal-label text-[11px] mt-1 text-[var(--primary)]">Tier 1 Prime</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two Tidy Stat Tiles Under It */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="portal-label block mb-1">Max Credit Line</span>
                      <span className="font-mono text-lg font-bold text-white">$250,000</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                      <span className="portal-label block mb-1">Fee Multiplier</span>
                      <span className="font-mono text-lg font-bold text-[var(--primary)]">0.85x</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Card */}
                <div className="portal-card portal-card-top-cyan flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Score Breakdown</h2>
                      <span className="text-xs font-mono text-[var(--text-muted)]">Max Score: 850</span>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'On-Time Repayment Consistency', pts: '+220 pts', pct: 98, color: 'bg-[var(--primary)]' },
                        { label: 'Capital Velocity & Turnaround', pts: '+180 pts', pct: 92, color: 'bg-[var(--accent-1)]' },
                        { label: 'Reserve Staking Commitment', pts: '+150 pts', pct: 85, color: 'bg-[var(--accent-3)]' },
                        { label: 'Protocol Longevity & History', pts: '+135 pts', pct: 80, color: 'bg-[var(--accent-2)]' },
                        { label: 'Historical Default Rate', pts: '0.00%', pct: 100, color: 'bg-[var(--warn)]' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-[var(--text-muted)]">{item.label}</span>
                            <span className="font-mono font-semibold text-white">{item.pts}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Ranked in top 2% of institutional borrowers</span>
                    <span className="text-[var(--accent)] font-semibold">Tier 1 Qualified</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Tier Progression (3 Stacked) + Score Boost Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* 3 Stacked Tier Cards */}
                <div className="portal-card portal-card-top-primary flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Credit Tier Progression</h2>
                      <span className="portal-badge portal-badge-neutral">Deterministic Gates</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Tier 1 - Highlighted */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border-2 border-[var(--primary)] shadow-sm">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-sm">Tier 1 Prime</span>
                          <span className="portal-badge portal-badge-primary">Current Status</span>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>750+ Score · 0.85x Fee Multiplier</span>
                          <span className="font-mono font-semibold text-white">$250,000 Max Line</span>
                        </div>
                      </div>

                      {/* Tier 2 */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[var(--text)] text-sm">Tier 2 Growth</span>
                          <span className="text-xs text-[var(--text-dim)]">Unlocked at 680</span>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>680+ Score · 1.00x Fee Multiplier</span>
                          <span className="font-mono text-white">$100,000 Max Line</span>
                        </div>
                      </div>

                      {/* Tier 3 */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[var(--text)] text-sm">Tier 3 Emerging</span>
                          <span className="text-xs text-[var(--text-dim)]">Base Gate</span>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>600+ Score · 1.15x Fee Multiplier</span>
                          <span className="font-mono text-white">$25,000 Max Line</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Boost Simulator */}
                <div className="portal-card portal-card-top-amber portal-sheen-amber flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Score Boost Simulator</h2>
                      <span className="portal-badge portal-badge-accent">Interactive</span>
                    </div>

                    <div className="flex flex-col gap-5">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="portal-label">Early Repayment Simulation</span>
                          <span className="font-mono font-bold text-white text-right">${simRepay.toLocaleString()} USDC</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="1000"
                          value={simRepay}
                          onChange={(e) => setSimRepay(Number(e.target.value))}
                          className="portal-slider portal-slider-amber"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="portal-label">FDX Reserve Staking</span>
                          <span className="font-mono font-bold text-white text-right">{simStake.toLocaleString()} FDX</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20000"
                          step="500"
                          value={simStake}
                          onChange={(e) => setSimStake(Number(e.target.value))}
                          className="portal-slider portal-slider-amber"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] mt-4 flex items-center justify-between">
                    <div>
                      <span className="portal-label block">Projected Score Impact</span>
                      <span className="text-xs text-[var(--text-muted)]">785 → <strong className="text-[var(--accent)] font-mono text-sm">796 PTS</strong></span>
                    </div>
                    <span className="portal-badge portal-badge-accent font-mono font-bold">+11 PTS Boost</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Receipts Table */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Immutable Repayment Receipts</h2>
                  <span className="portal-badge portal-badge-primary">Cryptographically Proved</span>
                </div>
                <div className="portal-table-wrapper">
                  <table className="portal-table-v2">
                    <thead>
                      <tr>
                        <th>Receipt ID</th>
                        <th className="text-right">Principal Settled</th>
                        <th className="text-right">Interest Paid</th>
                        <th>Completion Date</th>
                        <th>Verification Hash</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'RCPT-10492', principal: '50,000 FDX', interest: '762.50 FDX', date: 'Sep 28, 2026', hash: '0x4f8a...9c12' },
                        { id: 'RCPT-10491', principal: '25,000 USDC', interest: '150.00 USDC', date: 'Sep 14, 2026', hash: '0x1c3b...8e44' },
                        { id: 'RCPT-10490', principal: '10,000 EURC', interest: '48.00 EURC', date: 'Aug 30, 2026', hash: '0x99a2...7710' },
                      ].map((r) => (
                        <tr key={r.id}>
                          <td className="font-mono text-xs text-[var(--text-muted)]">{r.id}</td>
                          <td className="text-right font-mono tabular-nums font-semibold text-white">{r.principal}</td>
                          <td className="text-right font-mono tabular-nums text-[var(--accent-1)]">{r.interest}</td>
                          <td className="text-xs text-[var(--text-muted)]">{r.date}</td>
                          <td className="font-mono text-xs text-[var(--accent-2)] truncate max-w-[130px]">{r.hash}</td>
                          <td className="text-center">
                            <span className="portal-badge portal-badge-primary">Immutable Proved</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: AI RISK TELEMETRY                                */}
          {/* ======================================================= */}
          {activeTab === 'risk' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <h1 className="portal-page-title">AI Risk Telemetry</h1>
                <p className="portal-page-sub">Advisory shadow sentinel monitoring protocol solvency.</p>
              </div>

              {/* Row 1: 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="portal-card portal-card-top-cyan portal-sheen-cyan">
                  <div className="portal-card-header">
                    <span className="portal-label">Sentinel Quorum</span>
                    <span className="portal-badge portal-badge-cyan">
                      <span className="pulse-dot-cyan shrink-0" /> 3/3
                    </span>
                  </div>
                  <div className="portal-stat-num text-[var(--accent-2)]">3/3 Active</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">100% consensus sync</div>
                </div>

                <div className="portal-card portal-card-top-primary">
                  <div className="portal-card-header">
                    <span className="portal-label">Solvency Ratio</span>
                    <span className="portal-badge portal-badge-primary">Optimal</span>
                  </div>
                  <div className="portal-stat-num">214.8%</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Surplus headroom buffer</div>
                </div>

                <div className="portal-card portal-card-top-amber">
                  <div className="portal-card-header">
                    <span className="portal-label">Single-Pool Cap</span>
                    <span className="portal-badge portal-badge-accent">Circuit</span>
                  </div>
                  <div className="portal-stat-num">$5.0M</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Auto circuit breaker limit</div>
                </div>

                <div className="portal-card portal-card-top-cyan">
                  <div className="portal-card-header">
                    <span className="portal-label">Oracle Health</span>
                    <span className="portal-badge portal-badge-cyan">Live</span>
                  </div>
                  <div className="portal-stat-num">100% Sync</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">0.00% price deviation</div>
                </div>
              </div>

              {/* Row 2: Sentinel Nodes (3 Cards in a Row) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Sentinel Node Alpha', latency: '42ms', vote: 'Optimal', sig: '0x9d4a...c77b', desc: 'Liquidity Velocity & Outflow Tracker', topClass: 'portal-card-top-cyan portal-sheen-cyan', dotClass: 'pulse-dot-cyan', badgeClass: 'portal-badge-cyan', voteColor: 'text-[var(--accent-2)]' },
                  { name: 'Sentinel Node Beta', latency: '38ms', vote: '214.8% Solvency', sig: '0x1c8b...32fa', desc: 'Cross-Vault Collateralization Ratio', topClass: 'portal-card-top-primary portal-sheen-primary', dotClass: 'pulse-dot-emerald', badgeClass: 'portal-badge-primary', voteColor: 'text-[var(--primary)]' },
                  { name: 'Sentinel Node Gamma', latency: '49ms', vote: 'Tier 1 Conforming', sig: '0x7a81...49de', desc: 'Borrower Repayment Pacing Engine', topClass: 'portal-card-top-purple portal-sheen-purple', dotClass: 'pulse-dot-purple', badgeClass: 'portal-badge-purple', voteColor: 'text-[var(--accent-3)]' },
                ].map((node, i) => (
                  <div key={i} className={`portal-card ${node.topClass}`}>
                    <div className="portal-card-header">
                      <div className="flex items-center gap-2">
                        <span className={`${node.dotClass} shrink-0`} />
                        <span className="text-sm font-semibold text-white">{node.name}</span>
                      </div>
                      <span className={`portal-badge ${node.badgeClass} font-mono`}>{node.latency}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mb-3">{node.desc}</div>
                    <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
                      <span className={`font-semibold ${node.voteColor}`}>{node.vote}</span>
                      <span className="font-mono text-[var(--text-dim)] truncate max-w-[120px]">{node.sig}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 3: Stress-Test Simulator + Governance Guardrails */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Stress-Test Simulator */}
                <div className="portal-card portal-card-top-amber portal-sheen-amber flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Stress-Test Simulator</h2>
                      <span className="portal-badge portal-badge-accent">{stressShock}% Shock</span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="portal-label">Market Liquidity Drawdown Shock</span>
                        <span className="font-mono font-bold text-white">{stressShock}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={stressShock}
                        onChange={(e) => setStressShock(Number(e.target.value))}
                        className="portal-slider portal-slider-amber"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <span className="portal-label block mb-1">Post-Shock Solvency</span>
                        <span className="font-mono text-lg font-bold text-[var(--accent-2)]">
                          {(214.8 - stressShock * 1.8).toFixed(1)}%
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <span className="portal-label block mb-1">Default Probability</span>
                        <span className="font-mono text-lg font-bold text-white">
                          {(0.05 + stressShock * 0.009).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="pulse-dot-emerald shrink-0" />
                    <span>Protocol resilience verified above 150% threshold.</span>
                  </div>
                </div>

                {/* Governance Guardrails: 2 Small Cards */}
                <div className="portal-card portal-card-top-cyan flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Governance Guardrails</h2>
                      <span className="portal-badge portal-badge-neutral">Safety Boundaries</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Cpu size={16} className="text-[var(--accent-2)]" />
                          <span className="text-sm font-semibold text-white">Non-Authoritative AI</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          Advisory models monitor and attest only. Zero autonomous custody or transfer authority over treasury assets.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Scale size={16} className="text-[var(--warn)]" />
                          <span className="text-sm font-semibold text-white">Deterministic Settlement</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          Loan disbursement, interest calculation, and settlement follow immutable versioned smart contract rules.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Attestation Log (Max 280px Height, Wrapping) */}
              <div className="portal-card portal-card-top-cyan portal-sheen-cyan relative">
                <div className="portal-scanner-line" />
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Real-Time Attestation Log</h2>
                  <span className="portal-badge portal-badge-cyan">
                    <span className="pulse-dot-cyan shrink-0" /> Live Consensus Stream
                  </span>
                </div>
                <div className="h-[280px] overflow-y-auto rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 font-mono text-xs text-[var(--text-muted)] flex flex-col gap-2.5 break-words">
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:01 UTC]</span> <span className="text-[var(--accent-2)] font-semibold">Sentinel Alpha:</span> Solvency ratio cross-check completed. 0 anomalies detected.</div>
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:04 UTC]</span> <span className="text-[var(--primary)] font-semibold">Sentinel Beta:</span> Verified active debt against reserve tranches. Coverage index 214.8%.</div>
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:08 UTC]</span> <span className="text-[var(--accent-3)] font-semibold">Sentinel Gamma:</span> Verified 12 repayment receipts onchain. Quorum signature generated.</div>
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:15 UTC]</span> <span className="text-[var(--warn)] font-semibold">Consensus Engine:</span> Block #4,192 verified. Hash 0x9d4a82...c77b committed.</div>
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:22 UTC]</span> <span className="text-[var(--accent-2)] font-semibold">Sentinel Alpha:</span> Real-time outflow rate: 0.02% (below 1.00% warning trigger).</div>
                  <div><span className="text-[var(--text-dim)]">[2026-10-18 18:24:30 UTC]</span> <span className="text-[var(--primary)] font-semibold">Sentinel Beta:</span> Treasury asset reserves re-indexed across USDC, EURC, and FDX vaults.</div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: CAPITAL MARKETS                                  */}
          {/* ======================================================= */}
          {activeTab === 'markets' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <h1 className="portal-page-title">Capital Markets</h1>
                <p className="portal-page-sub">Federated liquidity vaults and instant atomic swaps.</p>
              </div>

              {/* Row 1: 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="portal-card portal-card-top-primary">
                  <div className="portal-card-header">
                    <span className="portal-label">FDX / USDC Price</span>
                    <span className="portal-badge portal-badge-primary">+0.04%</span>
                  </div>
                  <div className="portal-stat-num">$1.0004</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Stable parity maintained</div>
                </div>

                <div className="portal-card portal-card-top-purple portal-sheen-purple">
                  <div className="portal-card-header">
                    <span className="portal-label">24h Market Volume</span>
                    <span className="portal-badge portal-badge-purple">Pool</span>
                  </div>
                  <div className="portal-stat-num text-[var(--accent-3)]">$4.82M</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Zero slippage protocol trades</div>
                </div>

                <div className="portal-card portal-card-top-amber">
                  <div className="portal-card-header">
                    <span className="portal-label">Order Book Spread</span>
                    <span className="portal-badge portal-badge-accent">Tight</span>
                  </div>
                  <div className="portal-stat-num">0.06%</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Institutional market depth</div>
                </div>

                <div className="portal-card portal-card-top-cyan">
                  <div className="portal-card-header">
                    <span className="portal-label">Settlement Finality</span>
                    <span className="portal-badge portal-badge-cyan">Atomic</span>
                  </div>
                  <div className="portal-stat-num">Sub-Sec</div>
                  <div className="text-xs text-[var(--text-muted)] mt-3">Deterministic onchain swaps</div>
                </div>
              </div>

              {/* Row 2: Order Book (2-col layout) + Swap Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Order Book Card */}
                <div className="portal-card portal-card-top-purple flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Live Capital Order Book</h2>
                      <span className="portal-badge portal-badge-purple font-mono">Spread: 0.0006 (0.06%)</span>
                    </div>

                    <div className="portal-table-wrapper">
                      <table className="portal-table-v2">
                        <thead>
                          <tr>
                            <th>Bid Price</th>
                            <th className="text-right">Size (FDX)</th>
                            <th className="text-right">Ask Price</th>
                            <th className="text-right">Size (FDX)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderBookBids.map((bid, i) => {
                            const ask = orderBookAsks[i];
                            return (
                              <tr key={i} className="h-10">
                                <td className="font-mono text-xs text-[var(--primary)] font-semibold">{bid.price.toFixed(4)}</td>
                                <td className="font-mono text-xs text-white text-right">{bid.size}</td>
                                <td className="font-mono text-xs text-[var(--danger)] text-right font-semibold">{ask?.price.toFixed(4)}</td>
                                <td className="font-mono text-xs text-white text-right">{ask?.size}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[var(--border)] mt-4 flex justify-between items-center text-xs text-[var(--text-muted)]">
                    <span>Market: USDC / FDX Primary</span>
                    <span className="font-semibold text-[var(--primary)]">Depth: 100% Balanced</span>
                  </div>
                </div>

                {/* Instant Liquidity Swap Card */}
                <div className="portal-card portal-card-top-purple portal-sheen-purple flex flex-col justify-between">
                  <div>
                    <div className="portal-card-header">
                      <h2 className="portal-card-title">Instant Liquidity Swap</h2>
                      <span className="portal-badge portal-badge-purple">0.05% Fee</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Pay Input */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="portal-label">You Pay</span>
                          <span className="text-xs text-[var(--text-dim)] font-mono">Balance: 10,000 USDC</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <input
                            type="number"
                            value={swapAmount}
                            onChange={(e) => setSwapAmount(e.target.value)}
                            className="bg-transparent font-mono text-xl font-bold text-white outline-none w-2/3"
                            placeholder="0.00"
                          />
                          <span className="portal-badge portal-badge-neutral font-bold">{swapFrom}</span>
                        </div>
                      </div>

                      {/* Receive Output */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="portal-label">You Receive (Estimated)</span>
                          <span className="text-xs text-[var(--text-dim)] font-mono">Rate: 1 USDC ≈ 0.9995 FDX</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-[var(--accent-3)]">
                            {(Number(swapAmount || 0) * 0.9995).toFixed(2)}
                          </span>
                          <span className="portal-badge portal-badge-purple font-bold">{swapTo}</span>
                        </div>
                      </div>

                      {/* Rate Info Rows */}
                      <div className="flex flex-col gap-2 py-2 text-xs text-[var(--text-muted)]">
                        <div className="flex justify-between">
                          <span>Guaranteed Rate</span>
                          <span className="font-mono text-white">1 USDC ≈ 0.9995 FDX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slippage Tolerance</span>
                          <span className="font-mono text-[var(--accent-3)]">0.10% (Auto)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={handleExecuteSwap}
                      className="portal-btn-purple w-full"
                    >
                      {swapSuccess ? 'Swap Executed!' : 'Execute Capital Swap'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Trades Table */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Recent Executed Market Trades</h2>
                  <span className="portal-badge portal-badge-neutral">Atomic Settlement</span>
                </div>
                <div className="portal-table-wrapper">
                  <table className="portal-table-v2">
                    <thead>
                      <tr>
                        <th>Trade ID</th>
                        <th>Market Pair</th>
                        <th className="text-center">Side</th>
                        <th className="text-right">Execution Price</th>
                        <th className="text-right">Volume</th>
                        <th className="text-right">Time</th>
                        <th>Settlement Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketTrades.map((t) => (
                        <tr key={t.id}>
                          <td className="font-mono text-xs text-[var(--text-muted)]">{t.id}</td>
                          <td className="font-semibold text-white">{t.pair}</td>
                          <td className="text-center">
                            <span className={`portal-badge ${t.type === 'Buy' ? 'portal-badge-primary' : 'portal-badge-danger'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="font-mono text-right tabular-nums text-white">{t.price}</td>
                          <td className="font-mono text-right tabular-nums text-[var(--text-muted)]">{t.size}</td>
                          <td className="text-right text-xs text-[var(--text-muted)]">{t.time}</td>
                          <td className="font-mono text-xs text-[var(--accent-3)] truncate max-w-[130px]">{t.hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 6: LEGAL & RISK TERMS                               */}
          {/* ======================================================= */}
          {activeTab === 'terms' && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <div>
                <h1 className="portal-page-title">Legal &amp; Risk Terms</h1>
                <p className="portal-page-sub">Institutional covenants and deterministic compliance disclosures.</p>
              </div>

              {/* 2x2 Grid of Cards with Icons, Short Titles, and 2-3 Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="portal-card portal-card-top-primary">
                  <div className="portal-card-header">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-[var(--primary)]" />
                      <h2 className="portal-card-title">1. Non-Custodial Operation</h2>
                    </div>
                    <span className="portal-badge portal-badge-primary">Enforced</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Fundryx operates purely as a non-custodial capital protocol. All borrower underwriting, disbursements, and settlements occur via deterministic, versioned smart contracts.
                  </p>
                </div>

                <div className="portal-card portal-card-top-amber">
                  <div className="portal-card-header">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-[var(--warn)]" />
                      <h2 className="portal-card-title">2. Credit Scoring Disclosures</h2>
                    </div>
                    <span className="portal-badge portal-badge-accent">Mathematical</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Borrower repayment records and credit ratings are derived mathematically from verifiable onchain historical settlements without third-party broker intervention.
                  </p>
                </div>

                <div className="portal-card portal-card-top-cyan">
                  <div className="portal-card-header">
                    <div className="flex items-center gap-2.5">
                      <Radio size={18} className="text-[var(--accent-2)]" />
                      <h2 className="portal-card-title">3. AI Risk Telemetry Bounds</h2>
                    </div>
                    <span className="portal-badge portal-badge-cyan">Advisory</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    AI Sentinel nodes operate in an advisory shadow mode. Telemetry alerts inform risk parameters but hold zero direct custody or unilateral transfer authority.
                  </p>
                </div>

                <div className="portal-card portal-card-top-purple">
                  <div className="portal-card-header">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert size={18} className="text-[var(--accent-3)]" />
                      <h2 className="portal-card-title">4. Zero-Knowledge Privacy</h2>
                    </div>
                    <span className="portal-badge portal-badge-purple">zkSNARK</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Institutional identity attestations verify credit eligibility through cryptographic zero-knowledge proofs without exposing underlying balance sheets or wallet histories.
                  </p>
                </div>
              </div>

              {/* Last Updated Line */}
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex-wrap gap-2">
                <span>Last audited &amp; verified: October 18, 2026</span>
                <span className="font-mono text-[var(--text-dim)]">Quorum Consensus Hash: 0x9d4a82...c77b</span>
              </div>

              {/* Compact Accordion for Full Terms (Fills the Void) */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <h2 className="portal-card-title">Master Institutional Terms &amp; Conditions</h2>
                  <span className="portal-badge portal-badge-neutral">Legal Articles</span>
                </div>
                
                <div className="divide-y divide-[var(--border)]">
                  {termSections.map((sec, idx) => {
                    const isOpen = openTermSection === idx;
                    return (
                      <div key={idx} className="py-4">
                        <button
                          onClick={() => setOpenTermSection(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between text-left cursor-pointer group"
                        >
                          <div>
                            <h3 className="text-sm font-semibold text-white group-hover:text-[var(--primary)] transition">
                              {sec.title}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{sec.summary}</p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="mt-3 p-4 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text-muted)] leading-relaxed border border-[var(--border)]">
                            {sec.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Portal Institutional Footer Status Bar: Height 48px, Padding 0 32px */}
        <footer className="portal-bottom-bar">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="font-semibold text-white">All Systems Operational · Quorum 3/3 Synchronized</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--text-dim)]">
            <span>Epoch 4,192</span>
            <span>•</span>
            <span>Deterministic Consensus (0x9d4a82...c77b)</span>
            <span>•</span>
            <button onClick={onBackToLanding} className="hover:text-[var(--primary)] transition cursor-pointer">
              Website Home
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
