import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import FundryxLanding from './components/FundryxLanding';
import FundryxAppPortal from './components/FundryxAppPortal';
import WalletModal from './components/WalletModal';
import ChooseCryptoWalletLoginPage from './app/choose-crypto-wallet-login/page';
import { connectWallet, reconnectWallet, CONTRACT_ADDRESSES, LENDING_POOL_ABI } from './utils/contracts';
import { ethers } from 'ethers';

class PortalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Portal ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c1410] text-[#ecebe1] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 rounded-2xl bg-[#15231c] border border-red-500/30 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Application Telemetry Alert</h2>
            <p className="text-xs text-[#8fa799] font-mono leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred inside the portal.'}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition cursor-pointer"
              >
                Reload Interface
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-[#1c2e24] border border-[#263e34] text-white font-semibold text-xs hover:bg-[#22382b] transition cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app' | 'wallet-login'
  const [activeAppTab, setActiveAppTab] = useState('overview');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [wallet, setWallet] = useState({
    address: null,
    signer: null,
    provider: null,
    balance: '0',
    chainId: null,
  });

  const [poolStats, setPoolStats] = useState({
    totalDeposits: 0,
    totalBorrowed: 0,
    utilization: '0.00',
    verifiedRepayments: 0,
  });

  // Fetch live pool stats from backend and blockchain
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/pool')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalDeposits !== undefined) {
          setPoolStats((prev) => ({
            ...prev,
            totalDeposits: data.totalDeposits,
            totalBorrowed: data.totalBorrowed,
            utilization: data.utilizationRate ? data.utilizationRate.toString() : '0.15',
          }));
        }
      })
      .catch((e) => console.log('Backend sync offline, using onchain provider:', e.message));
  }, []);

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

  // Track wallet ref to prevent race condition during navigation
  const walletRef = React.useRef(wallet);
  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  // Connect Wallet handler
  const handleConnectWallet = async (walletType = 'metamask') => {
    try {
      const conn = await connectWallet(walletType);
      walletRef.current = conn;
      setWallet(conn);
      setIsWalletModalOpen(false);
      fetchLivePoolData(conn.provider);
      setCurrentView('app');
      window.location.hash = '#app';
      return true;
    } catch (err) {
      console.warn('Wallet connection notification:', err.message);
      alert(err.message || 'Could not connect Web3 wallet.');
      return false;
    }
  };

  const handleSelectWallet = async (walletId) => {
    setIsWalletModalOpen(false);
    await handleConnectWallet(walletId);
  };

  const handleDisconnect = () => {
    const emptyWallet = {
      address: null,
      signer: null,
      provider: null,
      balance: '0',
      chainId: null,
    };
    walletRef.current = emptyWallet;
    setWallet(emptyWallet);
    setCurrentView('landing');
    window.location.hash = '';
  };

  // Fetch live pool data if provider is available
  const fetchLivePoolData = async (provider) => {
    try {
      const pool = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, provider);
      const [deposits, borrowed] = await Promise.all([
        pool.totalDeposits().catch(() => 0n),
        pool.totalBorrowed().catch(() => 0n),
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

  // Silent auto-reconnect on mount if wallet already approved
  useEffect(() => {
    reconnectWallet()
      .then((conn) => {
        if (conn) {
          walletRef.current = conn;
          setWallet(conn);
          fetchLivePoolData(conn.provider);
          const hash = (window.location.hash || '').toLowerCase();
          if (hash.startsWith('#app') || hash === '#borrow' || hash === '#lending' || hash === '#credit' || hash === '#risk' || hash === '#markets' || hash === '#audit') {
            setCurrentView('app');
          }
        }
      })
      .catch((e) => console.log('Auto-reconnect silent bypass:', e.message));
  }, []);

  // Deep-linking and URL Hash synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash === '#wallet-login' || hash === '#login' || hash.includes('choose-crypto-wallet')) {
        setCurrentView('wallet-login');
      } else if (hash.startsWith('#app') || hash === '#borrow' || hash === '#lending' || hash === '#credit' || hash === '#risk' || hash === '#markets' || hash === '#audit') {
        const activeAddr = walletRef.current?.address || window.phantom?.ethereum?.selectedAddress || window.ethereum?.selectedAddress;
        if (!activeAddr) {
          setCurrentView('landing');
        } else {
          setCurrentView('app');
          if (hash.includes('lend') || hash.includes('borrow')) {
            setActiveAppTab('lending');
          } else if (hash.includes('credit') || hash.includes('score')) {
            setActiveAppTab('credit');
          } else if (hash.includes('risk')) {
            setActiveAppTab('risk');
          } else if (hash.includes('market')) {
            setActiveAppTab('markets');
          } else if (hash.includes('audit')) {
            setActiveAppTab('audit');
          } else if (hash.includes('terms') || hash.includes('legal')) {
            setActiveAppTab('terms');
          } else {
            setActiveAppTab('overview');
          }
        }
      } else if (hash === '#landing' || hash === '#top' || hash === '') {
        setCurrentView('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAppTab = (tabName) => {
    if (!wallet.address) {
      setIsWalletModalOpen(true);
      return;
    }
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

      {/* View 1: Creative Tim Choose Crypto Wallet Login Page */}
      {currentView === 'wallet-login' ? (
        <ChooseCryptoWalletLoginPage
          onSelectWallet={handleSelectWallet}
          onBack={() => {
            setCurrentView('landing');
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          connectedAddress={wallet.address}
        />
      ) : currentView === 'app' ? (
        /* View 2: Full Fundryx Web Application Portal */
        <PortalErrorBoundary>
          <FundryxAppPortal
            wallet={wallet}
            poolStats={poolStats}
            initialTab={activeAppTab}
            onConnect={() => setIsWalletModalOpen(true)}
            onNavigateWalletLogin={() => {
              setCurrentView('wallet-login');
              window.location.hash = '#wallet-login';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDisconnect={handleDisconnect}
            onBackToLanding={() => {
              setCurrentView('landing');
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </PortalErrorBoundary>
      ) : (
        /* View 3: Fundryx Institutional Landing Experience */
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
            {
              label: wallet.address ? "Go to Dashboard" : "Connect Wallet",
              href: wallet.address ? "#app" : "#connect",
              onClick: () => {
                if (wallet.address) {
                  openAppTab('overview');
                } else {
                  setIsWalletModalOpen(true);
                }
              },
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
          signup={
            wallet.address
              ? {
                  label: "Go to Dashboard",
                  onClick: () => openAppTab('overview'),
                }
              : null
          }
          primaryAction={{
            label: wallet.address ? "Go to Dashboard" : "Connect Wallet",
            onClick: () => {
              if (wallet.address) {
                openAppTab('overview');
              } else {
                setIsWalletModalOpen(true);
              }
            },
          }}
          secondaryAction={{
            label: "Explore Features",
            href: "#features",
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
                  label: "On-Chain",
                  range: "Live from blockchain",
                  amount: poolStats.totalBorrowed || 0,
                  change: null,
                  categories: [],
                },
              ],
            },
            {
              title: "Cash In",
              periods: [
                {
                  label: "On-Chain",
                  range: "Live from blockchain",
                  amount: poolStats.totalDeposits || 0,
                  change: null,
                  categories: [],
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
            description: "Illustrative reserve allocation. Connect your wallet to view live balances.",
            growth: "Protocol Live · Polygon Amoy",
            wallets: [
              { code: "USDC", symbol: "$", balance: poolStats.totalDeposits > 0 ? poolStats.totalDeposits : 0, perUsd: 1 },
              { code: "FDX", symbol: "✦ ", balance: 0, perUsd: 1 },
              { code: "EURC", symbol: "€ ", balance: 0, perUsd: 0.92 },
              { code: "USD", symbol: "$", balance: 0, perUsd: 1 },
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
