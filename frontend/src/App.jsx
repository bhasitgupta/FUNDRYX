import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import FundryxLanding from './components/FundryxLanding';
import FundryxAppPortal from './components/FundryxAppPortal';
import WalletModal from './components/WalletModal';
import { connectWallet, CONTRACT_ADDRESSES, LENDING_POOL_ABI } from './utils/contracts';
import { ethers } from 'ethers';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [activeAppTab, setActiveAppTab] = useState('overview');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [wallet, setWallet] = useState({
    address: null,
    signer: null,
    provider: null,
    balance: '0',
    chainId: null,
    isDemo: false,
  });

  // Protocol Stats
  const [poolStats, setPoolStats] = useState({
    totalDeposits: 100000,
    totalBorrowed: 150,
    utilization: '0.15',
    verifiedRepayments: 12,
  });

  // Initialize Lenis Smooth Scrolling for Landing View
  useEffect(() => {
    if (currentView !== 'landing') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [currentView]);

  // Connect Wallet handler
  const handleConnectWallet = async () => {
    try {
      const conn = await connectWallet();
      setWallet({ ...conn, isDemo: false });
      fetchLivePoolData(conn.provider);
      setCurrentView('app');
      return true;
    } catch (err) {
      console.warn('Wallet connection notification:', err.message);
      alert(err.message || 'Could not connect Web3 wallet. Try the Instant Demo Wallet!');
      return false;
    }
  };

  const handleSelectWallet = async (walletId) => {
    setIsWalletModalOpen(false);
    if (walletId === 'demo') {
      // 1-Click Instant Institutional Demo Wallet
      setWallet({
        address: '0x71C94142a59a72F2bB4E7d8DeF0882e88a0349A2',
        signer: null,
        provider: null,
        balance: '10000.00',
        chainId: 1337,
        isDemo: true,
      });
      // Immediately navigate to the full working app!
      setCurrentView('app');
    } else {
      await handleConnectWallet();
    }
  };

  const handleDisconnect = () => {
    setWallet({
      address: null,
      signer: null,
      provider: null,
      balance: '0',
      chainId: null,
      isDemo: false,
    });
  };

  // Fetch live pool data if provider is available
  const fetchLivePoolData = async (provider) => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, provider);
      const [deposits, borrowed] = await Promise.all([
        pool.totalDeposits().catch(() => 100000n * 10n ** 18n),
        pool.totalBorrowed().catch(() => 150n * 10n ** 18n),
      ]);

      const depNum = Number(ethers.formatEther(deposits));
      const borNum = Number(ethers.formatEther(borrowed));
      const util = depNum > 0 ? ((borNum / depNum) * 100).toFixed(2) : '0.00';

      setPoolStats((prev) => ({
        ...prev,
        totalDeposits: depNum,
        totalBorrowed: borNum,
        utilization: util,
      }));
    } catch (e) {
      console.warn('Using deterministic pool telemetry:', e.message);
    }
  };

  // Deep-linking and URL Hash synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.startsWith('#app') || hash === '#borrow' || hash === '#lending' || hash === '#credit' || hash === '#risk') {
        setCurrentView('app');
        if (hash.includes('lend') || hash.includes('borrow')) {
          setActiveAppTab('lending');
        } else if (hash.includes('credit') || hash.includes('score')) {
          setActiveAppTab('credit');
        } else if (hash.includes('risk')) {
          setActiveAppTab('risk');
        } else if (hash.includes('market')) {
          setActiveAppTab('markets');
        } else if (hash.includes('terms') || hash.includes('legal')) {
          setActiveAppTab('terms');
        } else {
          setActiveAppTab('overview');
        }
      } else if (hash === '#landing' || hash === '#top') {
        setCurrentView('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAppTab = (tabName) => {
    setActiveAppTab(tabName);
    setCurrentView('app');
    window.location.hash = `#app-${tabName}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#243329] min-h-screen">
      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
      />

      {/* View 1: Full Fundryx Web Application Portal */}
      {currentView === 'app' ? (
        <FundryxAppPortal
          wallet={wallet}
          poolStats={poolStats}
          initialTab={activeAppTab}
          onConnect={() => setIsWalletModalOpen(true)}
          onDisconnect={handleDisconnect}
          onBackToLanding={() => {
            setCurrentView('landing');
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        /* View 2: Fundryx Institutional Landing Experience */
        <FundryxLanding
          brand="fundryx."
          logo={
            <img
              src="/fundryx-logo.png"
              alt="Fundryx"
              className="h-8 md:h-9 w-auto object-contain cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          }
          palette="forest"
          backer={null}
          title={`Lend and borrow
*in a single* transaction`}
          subtitle="Deterministic credit scoring, non-custodial capital pools, and AI risk telemetry from one calm workspace."
          nav={[
            { label: "Why Fundryx", href: "#about" },
            { label: "Features", href: "#features" },
            { label: "Capital Reserves", href: "#features" },
            {
              label: "Launch App",
              href: "#app",
              onClick: () => openAppTab('overview'),
            },
          ]}
          login={
            wallet.address
              ? {
                  label: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
                  onClick: () => handleDisconnect(),
                }
              : {
                  label: "Connect Wallet",
                  onClick: () => setIsWalletModalOpen(true),
                }
          }
          signup={{
            label: "Launch App",
            onClick: () => openAppTab('overview'),
          }}
          primaryAction={{
            label: "Launch App",
            onClick: () => openAppTab('overview'),
          }}
          secondaryAction={{
            label: wallet.address ? "Connected (Open App)" : "Connect Wallet",
            onClick: () => (wallet.address ? openAppTab('overview') : setIsWalletModalOpen(true)),
          }}
          info={{
            label: "/why/",
            text: "Fundryx matches every borrower to its deterministic credit score, *flags anomalies via AI risk telemetry and settles capital pools before you close your books.*",
          }}
          statCards={[
            {
              title: "Cash Out",
              periods: [
                {
                  label: "Month",
                  range: "Sep 01, 2026 - Sep 30, 2026",
                  amount: poolStats.totalBorrowed || 150,
                  change: -4.2,
                  categories: [
                    { label: "Prime Tier", value: 31200 },
                    { label: "Short-term", value: 6810.4 },
                    { label: "Working Cap", value: 4200 },
                    { label: "Micro-loans", value: 6000 },
                  ],
                },
                {
                  label: "Week",
                  range: "Sep 24, 2026 - Sep 30, 2026",
                  amount: 9020,
                  change: 2.1,
                  categories: [
                    { label: "Prime Tier", value: 2820 },
                    { label: "Short-term", value: 1200 },
                    { label: "Working Cap", value: 5000 },
                  ],
                },
              ],
            },
            {
              title: "Cash In",
              periods: [
                {
                  label: "Month",
                  range: "Sep 01, 2026 - Sep 30, 2026",
                  amount: poolStats.totalDeposits || 100000,
                  change: 11.8,
                  categories: [
                    { label: "Liquidity TVL", value: 98400 },
                    { label: "Reserve Staking", value: 21000 },
                    { label: "Protocol Fees", value: 7000 },
                  ],
                },
              ],
            },
          ]}
          about={{
            kicker: "Why Fundryx",
            statement:
              "Fundryx {mark} gives institutional credit its confidence back: deterministic credit scoring, non-custodial capital pools and audit-proof AI telemetry your risk committee will actually trust.",
            stats: [
              { value: 4000, suffix: "+", label: "Borrowers scored" },
              { value: 3.5, decimals: 1, suffix: "×", label: "Capital velocity" },
              { value: 12, prefix: "$", suffix: "M", label: "Total Settled Volume" },
            ],
          }}
          features={{
            kicker: "Inside the app",
            title: `Every *borrower,*
*one* unified pool`,
            subtitle: "Credit verification, capital supply and liquidation protection side by side.",
          }}
          wallet={{
            title: "Multi-Currency Capital Reserves",
            description: "Click a reserve asset to inspect real-time lending allocation and utilization.",
            growth: "+11.8% · This quarter",
            wallets: [
              { code: "USDC", symbol: "$", balance: 912400, perUsd: 1 },
              { code: "EURC", symbol: "€ ", balance: 228900, perUsd: 0.92 },
              { code: "USD", symbol: "$", balance: 540000, perUsd: 1 },
              { code: "FDX", symbol: "✦ ", balance: 9820000, perUsd: 151 },
            ],
          }}
          spending={{
            title: "Capital Utilization Heatmap",
            description: "Week by week, so pool liquidity and risk telemetry explain themselves.",
            budget: 120000,
            seed: 21,
          }}
          cta={{
            title: "Your next capital deployment, *already scored.*",
            subtitle: "Institutional uncollateralized lending and deterministic credit intelligence. Connect account to view eligibility.",
            action: {
              label: "Launch App",
              onClick: () => openAppTab('overview'),
            },
          }}
          footer={{
            columns: [
              {
                title: "Legal & Terms",
                links: [
                  { label: "Terms of Service", href: "#terms", onClick: () => openAppTab('terms') },
                  { label: "Privacy Policy", href: "#privacy", onClick: () => openAppTab('terms') },
                  { label: "Risk Disclosures", href: "#risk-disclosures", onClick: () => openAppTab('terms') },
                  { label: "Compliance Notice", href: "#compliance", onClick: () => openAppTab('terms') },
                ],
              },
              {
                title: "Platform",
                links: [
                  { label: "Portfolio Overview", href: "#overview", onClick: () => openAppTab('overview') },
                  { label: "Borrow & Lend", href: "#lending", onClick: () => openAppTab('lending') },
                  { label: "Verifiable Credit", href: "#credit", onClick: () => openAppTab('credit') },
                  { label: "AI Risk Telemetry", href: "#risk", onClick: () => openAppTab('risk') },
                ],
              },
              {
                title: "Solutions",
                links: [
                  { label: "Capital Reserves", href: "#features" },
                  { label: "Institutional Pools", href: "#features" },
                  { label: "Documentation", href: "#about" },
                  { label: "System Status", href: "#features" },
                ],
              },
            ],
            note: "Institutional uncollateralized lending and deterministic credit intelligence. All operations are non-custodial.",
            socials: [
              { label: "Documentation", href: "#about" },
              { label: "Institutional Portal", href: "#app", onClick: () => openAppTab('overview') },
              { label: "Privacy Policy", href: "#terms", onClick: () => openAppTab('terms') },
              { label: "Terms of Service", href: "#terms", onClick: () => openAppTab('terms') },
            ],
          }}
        />
      )}
    </div>
  );
}
