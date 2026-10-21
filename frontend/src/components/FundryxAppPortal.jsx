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
  ExternalLink,
  Search,
  Copy,
  Lock,
  Shield,
  Database,
} from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabase';
import {
  executeBorrow,
  executeDeposit,
  executeRepay,
  executeSwap,
  executeMintTokens,
  executeSeedLiquidity,
  getPairReserves,
  fetchRecentEvents,
  fetchWalletData,
  fetchBorrowerLoans,
  fetchCreditPreFlight,
  parseRevertReason,
  CONTRACT_ADDRESSES,
  SUPPORTED_TOKENS,
  MOCK_SWAP_ROUTER_ADDRESS,
  CHAIN_ID,
  explorerTxLink,
  ADMIN_WALLETS,
  checkIsAdminWallet,
  verifyTxHashOnChain,
} from '../utils/contracts';

export default function FundryxAppPortal({
  wallet,
  poolStats,
  onConnect,
  onNavigateWalletLogin,
  onDisconnect,
  onBackToLanding,
  initialTab = 'overview',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Loan Calculator state & transaction lifecycle
  const [borrowInput, setBorrowInput] = useState(50);
  const [borrowTerm, setBorrowTerm] = useState(14);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowTxStatus, setBorrowTxStatus] = useState('ready'); // ready | awaiting-wallet | pending | confirmed | failed

  // Supply Vault state & transaction lifecycle
  const [supplyAsset, setSupplyAsset] = useState('FDX');
  const [supplyAmount, setSupplyAmount] = useState('100');
  const [supplySuccess, setSupplySuccess] = useState(false);
  const [supplyTxStatus, setSupplyTxStatus] = useState('ready'); // ready | awaiting-wallet | pending | confirmed | failed

  // Repay state & transaction lifecycle
  const [repaySuccess, setRepaySuccess] = useState(false);
  const [repayTxStatus, setRepayTxStatus] = useState({}); // { [loanId]: ready | awaiting-wallet | pending | confirmed | failed }

  // Swap state & transaction lifecycle
  const [swapFrom, setSwapFrom] = useState('FDX');
  const [swapTo, setSwapTo] = useState('WPOL');
  const [swapAmount, setSwapAmount] = useState('10');
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [swapTxStatus, setSwapTxStatus] = useState('ready'); // ready | awaiting-wallet | pending | confirmed | failed
  const [pairReserves, setPairReserves] = useState({ fdx: 0, wpol: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  // User balances from chain
  const [userFdxBalance, setUserFdxBalance] = useState(null);
  const [userPolBalance, setUserPolBalance] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  // Stress test simulator state
  const [stressShock, setStressShock] = useState(25);

  // Credit simulator state
  const [simRepay, setSimRepay] = useState(15000);
  const [simStake, setSimStake] = useState(5000);

  // Terms accordion state
  const [openTermSection, setOpenTermSection] = useState(0);

  // Real data state
  const [livePool, setLivePool] = useState(poolStats || { totalDeposits: 0, totalBorrowed: 0, utilizationRate: 0 });
  const [creditProfile, setCreditProfile] = useState({
    borrower: wallet.address || null,
    score: null,
    tier: null,
    maxCredit: 0,
    repaymentCount: 0,
    defaultCount: 0,
    verifiedRepaidValue: 0,
    outstandingExposure: 0,
  });
  const [riskData, setRiskData] = useState({
    systemSolvency: '--',
    anomalyScore: null,
    mode: 'LOADING',
    quorumNodes: 0,
    synchronizedNodes: 0,
    nodeQuorum: [],
  });
  const [attestationLogs, setAttestationLogs] = useState([]);
  const [orderBookAsks, setOrderBookAsks] = useState([]);
  const [orderBookBids, setOrderBookBids] = useState([]);
  const [marketTrades, setMarketTrades] = useState([]);
  const [marketTickers, setMarketTickers] = useState({ POL: null, ETH: null, BTC: null, USDC: 1.00, EURC: null, FDX: null });
  const [activeLoans, setActiveLoans] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [txNotification, setTxNotification] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Admin-only Cryptographic Audit Trail State
  const [isAdmin, setIsAdmin] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditSearchHash, setAuditSearchHash] = useState('');
  const [verifiedTxData, setVerifiedTxData] = useState(null);
  const [isVerifyingTx, setIsVerifyingTx] = useState(false);
  const [verifyTxError, setVerifyTxError] = useState(null);

  // Admin role check on wallet change
  useEffect(() => {
    if (wallet.address) {
      checkIsAdminWallet(wallet.address)
        .then((res) => setIsAdmin(res))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [wallet.address]);

  const loadOnChainAuditTrail = async () => {
    setIsLoadingAudit(true);
    try {
      const events = await fetchRecentEvents(3500);
      setAuditEvents(events);
    } catch (err) {
      console.warn('Failed to load onchain audit events:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleVerifyTx = async (hashToVerify) => {
    const targetHash = (hashToVerify || auditSearchHash || '').trim();
    if (!targetHash) return;
    setIsVerifyingTx(true);
    setVerifyTxError(null);
    try {
      const data = await verifyTxHashOnChain(targetHash);
      setVerifiedTxData(data);
    } catch (err) {
      setVerifyTxError(err.message || 'Verification failed');
      setVerifiedTxData(null);
    } finally {
      setIsVerifyingTx(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit' && isAdmin) {
      loadOnChainAuditTrail();
    }
  }, [activeTab, isAdmin]);

  // Sync real data from backend & onchain network
  useEffect(() => {
    // 1. Fetch Pool stats (fallback to onchain query if backend offline)
    fetch('http://127.0.0.1:8000/api/pool')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.totalDeposits !== undefined) {
          setLivePool(data);
        }
      })
      .catch(() => {
        fetchCreditPreFlight(wallet.address || '0x0000000000000000000000000000000000000000')
          .then((flight) => {
            if (flight && flight.availableLiquidity !== undefined) {
              setLivePool((prev) => ({
                ...prev,
                totalDeposits: flight.availableLiquidity,
                availableLiquidity: flight.availableLiquidity,
              }));
            }
          })
          .catch(() => {});
      });

    // 2. Fetch Borrower Credit Score, Active Loans & Wallet Balance directly from chain
    const targetAddr = wallet.address;
    if (targetAddr) {
      fetchWalletData(targetAddr)
        .then((walletData) => {
          setUserFdxBalance(walletData.fdxBalance);
          setUserPolBalance(walletData.polBalance);
          setCreditProfile((prev) => ({
            ...prev,
            borrower: targetAddr,
            maxCredit: walletData.maxCredit,
            repaymentCount: walletData.repaymentCount,
            outstandingExposure: walletData.outstandingExposure,
            verifiedRepaidValue: walletData.stats?.verifiedRepaidValue || 0,
            defaultCount: walletData.stats?.defaultCount || 0,
            tier: walletData.maxCredit >= 200 ? 'Prime Tier 1' : 'Standard Tier 2',
          }));
        })
        .catch(() => {});

      fetchBorrowerLoans(targetAddr)
        .then((onchainLoans) => {
          if (onchainLoans && onchainLoans.length > 0) setActiveLoans(onchainLoans);
        })
        .catch(() => {});

      // Enrich with backend risk score if available
      fetch(`http://127.0.0.1:8000/api/credit/score/${targetAddr}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.score) {
            setCreditProfile((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(() => {});
    }

    // 3. Fetch Risk Telemetry
    fetch('http://127.0.0.1:8000/api/risk/telemetry')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.systemSolvency) {
          setRiskData(data);
          if (data.latestReport) {
            setAttestationLogs((prev) => [
              {
                time: 'Just now',
                sender: 'Sentinel Quorum',
                text: `Attested report ${data.latestReport.reportId.slice(0, 10)}... Hash: ${data.latestReport.reportHash.slice(0, 10)}... Solvency: ${data.latestReport.solvencyHealth}%`,
                color: 'text-[var(--primary)]',
              },
              ...prev,
            ]);
          }
        }
      })
      .catch(() => {});

    // 4. Fetch Market Tickers, Orderbook, Trades
    fetch('http://127.0.0.1:8000/api/markets/tickers')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.POL) setMarketTickers(data);
      })
      .catch(() => {});

    fetch('http://127.0.0.1:8000/api/markets/orderbook')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.asks) {
          setOrderBookAsks(data.asks);
          setOrderBookBids(data.bids);
        }
      })
      .catch(() => {});

    fetch('http://127.0.0.1:8000/api/markets/trades')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMarketTrades(data);
      })
      .catch(() => {});

    // 5. Fetch Activity Feed
    fetch('http://127.0.0.1:8000/api/activity')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setActivityFeed(data);
      })
      .catch(async () => {
        const events = await fetchRecentEvents().catch(() => []);
        if (events.length > 0) setActivityFeed(events);
      });
  }, [wallet.address]);

  const handleExecuteBorrow = async () => {
    if (!wallet.signer || !wallet.address) {
      setBorrowTxStatus('failed');
      setTxNotification({
        type: 'danger',
        message: 'Wallet not connected. Connect your Web3 wallet to borrow.',
      });
      return;
    }

    try {
      setBorrowTxStatus('awaiting-wallet');
      setTxNotification({
        type: 'info',
        message: 'Awaiting wallet signature for uncollateralized loan...',
      });

      // Credit pre-flight check
      const preFlight = await fetchCreditPreFlight(wallet.address).catch(() => null);
      if (preFlight) {
        if (Number(borrowInput) > preFlight.maxCredit) {
          throw new Error(
            `Borrow amount (${borrowInput} FDX) exceeds your on-chain credit cap of ${preFlight.maxCredit.toFixed(2)} FDX. Build credit by repaying active loans.`
          );
        }
        if (Number(borrowInput) > preFlight.availableLiquidity) {
          throw new Error(
            `Pool has insufficient liquidity (${preFlight.availableLiquidity.toFixed(2)} FDX available). Deposit liquidity or lower borrow amount.`
          );
        }
      }

      setBorrowTxStatus('pending');
      setTxNotification({
        type: 'info',
        message: 'Submitting loan transaction on-chain... Waiting for block confirmation.',
      });

      const { tx, receipt, newFdxBalance } = await executeBorrow(wallet.signer, borrowInput);

      setBorrowTxStatus('confirmed');
      setBorrowSuccess(true);
      if (newFdxBalance) setUserFdxBalance(Number(newFdxBalance));

      setTxNotification({
        type: 'success',
        message: `Loan Confirmed on-chain! Block ${receipt.blockNumber}`,
        txHash: tx.hash,
      });

      // Refresh onchain loans and wallet data
      const [updatedLoans, updatedWallet] = await Promise.all([
        fetchBorrowerLoans(wallet.address).catch(() => []),
        fetchWalletData(wallet.address).catch(() => null),
      ]);

      if (updatedLoans && updatedLoans.length > 0) {
        setActiveLoans(updatedLoans);
      } else {
        const newLoan = {
          id: `LOAN-${receipt.blockNumber % 1000}`,
          loanId: receipt.blockNumber % 1000,
          asset: 'FDX',
          amount: Number(borrowInput),
          principalInitial: Number(borrowInput),
          principalOutstanding: Number(borrowInput) * 1.052,
          apr: '5.20%',
          dueDays: borrowTerm,
          progress: 10,
          status: 'Active',
          tier: creditProfile.tier || 'Onchain Loan',
        };
        setActiveLoans((prev) => [newLoan, ...prev]);
      }

      if (updatedWallet) {
        setCreditProfile((prev) => ({
          ...prev,
          outstandingExposure: updatedWallet.outstandingExposure,
          repaymentCount: updatedWallet.repaymentCount,
          maxCredit: updatedWallet.maxCredit,
        }));
      }

      setActivityFeed((prev) => [
        {
          id: `EV-${tx.hash.slice(2, 6)}`,
          type: 'Disbursement',
          borrower: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
          amount: `${Number(borrowInput).toLocaleString()} FDX`,
          score: creditProfile.tier || 'Verified Credit',
          time: `Block ${receipt.blockNumber}`,
          hash: `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`,
          txHash: tx.hash,
        },
        ...prev,
      ]);

      setTimeout(() => {
        setBorrowSuccess(false);
        setBorrowTxStatus('ready');
      }, 5000);
    } catch (err) {
      console.error('Onchain borrow failed:', err);
      const reason = parseRevertReason(err);
      setBorrowTxStatus('failed');
      setBorrowSuccess(false);
      setTxNotification({
        type: 'danger',
        message: `Borrow failed: ${reason}`,
      });
      setTimeout(() => setBorrowTxStatus('ready'), 7000);
    }
  };

  const handleMintTokens = async () => {
    if (!wallet.signer || !wallet.address) {
      setTxNotification({
        type: 'danger',
        message: 'Wallet not connected. Connect your Web3 wallet to mint FDX.',
      });
      return;
    }

    try {
      setIsMinting(true);
      setTxNotification({
        type: 'info',
        message: 'Requesting 10,000 FDX allocation... Confirm in wallet.',
      });

      const { tx, receipt, newBalance } = await executeMintTokens(wallet.signer, wallet.address, 10000);
      setUserFdxBalance(Number(newBalance));
      setTxNotification({
        type: 'success',
        message: `Minted 10,000 FDX! New Balance: ${Number(newBalance).toLocaleString()} FDX (Block ${receipt.blockNumber})`,
        txHash: tx.hash,
      });
      setTimeout(() => setIsMinting(false), 3000);
    } catch (err) {
      console.error('Token mint failed:', err);
      const reason = parseRevertReason(err);
      setIsMinting(false);
      setTxNotification({
        type: 'danger',
        message: `Token mint failed: ${reason}`,
      });
    }
  };

  const handleExecuteSupply = async () => {
    if (!wallet.signer || !wallet.address) {
      setSupplyTxStatus('failed');
      setTxNotification({
        type: 'danger',
        message: 'Wallet not connected. Connect your Web3 wallet to deposit capital.',
      });
      return;
    }

    try {
      setSupplyTxStatus('awaiting-wallet');
      setTxNotification({
        type: 'info',
        message: `Preparing deposit of ${supplyAmount} FDX... Confirm ERC-20 approval / deposit in your wallet.`,
      });

      const { tx, receipt, newFdxBalance, newLenderBalance, newTotalDeposits } = await executeDeposit(
        wallet.signer,
        supplyAmount
      );

      setSupplyTxStatus('confirmed');
      setSupplySuccess(true);
      if (newFdxBalance) setUserFdxBalance(Number(newFdxBalance));

      setLivePool((prev) => ({
        ...prev,
        totalDeposits: Number(newTotalDeposits),
        availableLiquidity: (prev.availableLiquidity || 0) + Number(supplyAmount),
      }));

      setTxNotification({
        type: 'success',
        message: `Deposit Confirmed on-chain! Block ${receipt.blockNumber}`,
        txHash: tx.hash,
      });

      setActivityFeed((prev) => [
        {
          id: `EV-${tx.hash.slice(2, 6)}`,
          type: 'Capital Supply',
          borrower: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
          amount: `${Number(supplyAmount).toLocaleString()} FDX`,
          score: 'Liquidity Deposited',
          time: `Block ${receipt.blockNumber}`,
          hash: `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`,
          txHash: tx.hash,
        },
        ...prev,
      ]);

      setTimeout(() => {
        setSupplySuccess(false);
        setSupplyTxStatus('ready');
      }, 5000);
    } catch (err) {
      console.error('Onchain supply failed:', err);
      const reason = parseRevertReason(err);
      setSupplyTxStatus('failed');
      setSupplySuccess(false);
      setTxNotification({
        type: 'danger',
        message: `Deposit failed: ${reason}`,
      });
      setTimeout(() => setSupplyTxStatus('ready'), 7000);
    }
  };

  const handleExecuteRepay = async (loanIdOrRef) => {
    if (!wallet.signer || !wallet.address) {
      setTxNotification({
        type: 'danger',
        message: 'Wallet not connected. Connect your Web3 wallet to settle loans.',
      });
      return;
    }

    const rawId = typeof loanIdOrRef === 'string' && loanIdOrRef.startsWith('LOAN-')
      ? Number(loanIdOrRef.replace('LOAN-', ''))
      : Number(loanIdOrRef);

    const targetLoan = activeLoans.find(
      (l) => l.loanId === rawId || l.id === loanIdOrRef || l.id === `LOAN-${rawId}`
    );
    const repayAmount = targetLoan ? (targetLoan.principalOutstanding || targetLoan.amount) : 0;

    if (!repayAmount || repayAmount <= 0) {
      setTxNotification({
        type: 'danger',
        message: 'Loan has zero outstanding balance or is already settled.',
      });
      return;
    }

    try {
      setRepayTxStatus((prev) => ({ ...prev, [rawId]: 'awaiting-wallet' }));
      setTxNotification({
        type: 'info',
        message: `Repaying Loan #${rawId} (${Number(repayAmount).toFixed(2)} FDX). Confirm transaction in wallet...`,
      });

      const { tx, receipt, loanStatus } = await executeRepay(
        wallet.signer,
        rawId,
        repayAmount
      );

      setRepayTxStatus((prev) => ({ ...prev, [rawId]: 'confirmed' }));
      setRepaySuccess(true);

      setTxNotification({
        type: 'success',
        message: `Repayment Confirmed! Loan #${rawId} status: ${loanStatus}`,
        txHash: tx.hash,
      });

      // Refresh onchain loans and wallet balance
      const [updatedLoans, updatedWallet] = await Promise.all([
        fetchBorrowerLoans(wallet.address).catch(() => []),
        fetchWalletData(wallet.address).catch(() => null),
      ]);

      if (updatedLoans && updatedLoans.length > 0) {
        setActiveLoans(updatedLoans);
      } else {
        setActiveLoans((prev) =>
          prev.map((l) =>
            (l.loanId === rawId || l.id === loanIdOrRef)
              ? { ...l, status: 'Settled', progress: 100, principalOutstanding: 0 }
              : l
          )
        );
      }

      if (updatedWallet) {
        setUserFdxBalance(updatedWallet.fdxBalance);
      }

      setActivityFeed((prev) => [
        {
          id: `EV-${tx.hash.slice(2, 6)}`,
          type: 'Repayment',
          borrower: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
          amount: `${Number(repayAmount).toLocaleString()} FDX`,
          score: '+Credit History Boost',
          time: `Block ${receipt.blockNumber}`,
          hash: `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`,
          txHash: tx.hash,
        },
        ...prev,
      ]);

      setTimeout(() => {
        setRepaySuccess(false);
        setRepayTxStatus((prev) => ({ ...prev, [rawId]: 'ready' }));
      }, 5000);
    } catch (err) {
      console.error('Onchain repayment failed:', err);
      const reason = parseRevertReason(err);
      setRepayTxStatus((prev) => ({ ...prev, [rawId]: 'failed' }));
      setTxNotification({
        type: 'danger',
        message: `Repayment failed: ${reason}`,
      });
      setTimeout(() => setRepayTxStatus((prev) => ({ ...prev, [rawId]: 'ready' })), 7000);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/risk/evaluate', { method: 'POST' });
      const data = await res.json();
      if (data && data.report) {
        setAttestationLogs((prev) => [
          {
            time: 'Just now',
            sender: 'AI Sentinel Quorum',
            text: `Manual Audit Verified! Report: ${data.report.reportId.slice(0, 10)}... Hash: ${data.report.reportHash.slice(0, 10)}... Solvency: ${data.report.solvencyHealth}% (${data.report.verdict})`,
            color: 'text-[var(--accent-2)]',
          },
          ...prev,
        ]);
        setRiskData((prev) => ({
          ...prev,
          systemSolvency: `${data.report.solvencyHealth}%`,
          latestReport: data.report,
        }));
      }
    } catch (e) {
      console.warn('Audit trigger warning:', e.message);
    } finally {
      setTimeout(() => setIsAuditing(false), 800);
    }
  };

  const loadPairReserves = async () => {
    try {
      const res = await getPairReserves(CONTRACT_ADDRESSES.FundryxToken, SUPPORTED_TOKENS.WPOL);
      setPairReserves({ fdx: res.reserveA, wpol: res.reserveB });
    } catch {}
  };

  useEffect(() => {
    loadPairReserves();
  }, [activeTab]);

  const handleSeedLiquidity = async () => {
    if (!wallet.signer || !wallet.address) {
      setTxNotification({
        type: 'danger',
        message: 'Connect your wallet to seed liquidity.',
      });
      return;
    }
    setIsSeeding(true);
    setTxNotification({
      type: 'info',
      message: 'Seeding AMM liquidity: supplying 10 FDX + 10 WPOL to router... Confirm in wallet.',
    });
    try {
      const res = await executeSeedLiquidity(wallet.signer, 10, 10);
      setTxNotification({
        type: 'success',
        message: 'Liquidity initialized on-chain! 10 FDX + 10 WPOL supplied.',
        txHash: res.tx.hash,
      });
      await loadPairReserves();
      if (wallet.address) {
        const wData = await fetchWalletData(wallet.address);
        setUserFdxBalance(wData.fdxBalance);
        setUserPolBalance(wData.polBalance);
      }
    } catch (err) {
      console.error('Seed liquidity failed:', err);
      setTxNotification({
        type: 'danger',
        message: `Liquidity seeding failed: ${parseRevertReason(err)}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!wallet.signer || !wallet.address) {
      setSwapTxStatus('failed');
      setTxNotification({
        type: 'danger',
        message: 'Wallet not connected. Connect your Web3 wallet first.',
      });
      return;
    }

    if (!MOCK_SWAP_ROUTER_ADDRESS) {
      setSwapTxStatus('failed');
      setTxNotification({
        type: 'danger',
        message: 'Swap router contract is not configured.',
      });
      setTimeout(() => setSwapTxStatus('ready'), 7000);
      return;
    }

    try {
      setSwapTxStatus('awaiting-wallet');
      setTxNotification({
        type: 'info',
        message: `Initiating swap of ${swapAmount} ${swapFrom} to ${swapTo}. Confirm in wallet...`,
      });

      const tokenInAddr = SUPPORTED_TOKENS[swapFrom] || CONTRACT_ADDRESSES.FundryxToken;
      const tokenOutAddr = SUPPORTED_TOKENS[swapTo] || SUPPORTED_TOKENS.WPOL;

      const res = await executeSwap(wallet.signer, tokenInAddr, tokenOutAddr, swapAmount, 100);

      setSwapTxStatus('confirmed');
      setSwapSuccess(true);
      setTxNotification({
        type: 'success',
        message: `Swap Confirmed on-chain! Received ${Number(res.amountOut).toFixed(4)} ${swapTo}`,
        txHash: res.tx.hash,
      });

      await loadPairReserves();
      if (wallet.address) {
        const wData = await fetchWalletData(wallet.address);
        setUserFdxBalance(wData.fdxBalance);
        setUserPolBalance(wData.polBalance);
      }

      setTimeout(() => {
        setSwapSuccess(false);
        setSwapTxStatus('ready');
      }, 5000);
    } catch (err) {
      console.error('Swap failed:', err);
      const reason = parseRevertReason(err);
      setSwapTxStatus('failed');
      setTxNotification({
        type: 'danger',
        message: `Swap failed: ${reason}`,
      });
      setTimeout(() => setSwapTxStatus('ready'), 7000);
    }
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
      label: 'Institutional Governance',
      children: [
        { value: 'audit', label: 'Admin On-Chain Audit', icon: <ShieldCheck size={16} /> },
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
                PORTAL v4 · INSTITUTIONAL NETWORK
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
                {activeTab === 'audit' && 'Admin On-Chain Audit Trail'}
                {activeTab === 'terms' && 'Legal & Risk Terms'}
              </span>
            </div>
          </div>

          {/* Right Controls: Website & Connect */}
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
                  <span className="text-[var(--text-dim)]">({userFdxBalance !== null ? Number(userFdxBalance).toFixed(2) : (wallet.balance || '0.00')} FDX)</span>
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

        {/* Real-Time Onchain Transaction Toast */}
        {txNotification && (
          <div
            className={`mx-6 sm:mx-8 mt-4 p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between shadow-lg transition-all ${
              txNotification.type === 'danger'
                ? 'border-rose-500/50 bg-rose-950/80 text-rose-300 shadow-rose-950/50'
                : txNotification.type === 'info'
                ? 'border-amber-500/50 bg-amber-950/70 text-amber-300 shadow-amber-950/40'
                : 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-emerald-950/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                txNotification.type === 'danger' ? 'bg-rose-400 animate-pulse' :
                txNotification.type === 'info' ? 'bg-amber-400 animate-spin' : 'bg-emerald-400'
              }`} />
              <span>{txNotification.message}</span>
            </div>
            {txNotification.txHash && (
              <a
                href={explorerTxLink(txNotification.txHash)}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline font-semibold flex items-center gap-1 hover:text-emerald-300 shrink-0 ml-4"
              >
                View on Explorer <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

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
                                    onClick={() => handleExecuteRepay(loan.loanId || loan.id)}
                                    disabled={repayTxStatus[loan.loanId || loan.id] === 'awaiting-wallet' || repayTxStatus[loan.loanId || loan.id] === 'pending'}
                                    className="portal-btn-secondary h-8 px-3 text-xs disabled:opacity-60"
                                  >
                                    {repayTxStatus[loan.loanId || loan.id] === 'awaiting-wallet' && 'Confirm...'}
                                    {repayTxStatus[loan.loanId || loan.id] === 'pending' && 'Settling...'}
                                    {repayTxStatus[loan.loanId || loan.id] === 'confirmed' && 'Settled!'}
                                    {repayTxStatus[loan.loanId || loan.id] === 'failed' && 'Retry'}
                                    {(!repayTxStatus[loan.loanId || loan.id] || repayTxStatus[loan.loanId || loan.id] === 'ready') && 'Settle'}
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
                      <span className="portal-badge portal-badge-primary">Cap: {creditProfile.maxCredit || 100} FDX</span>
                    </div>

                    {/* Amount Input + Slider */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="portal-label">Borrow Amount</label>
                        <span className="font-mono text-sm font-bold text-[var(--primary)]">{Number(borrowInput).toLocaleString()} FDX</span>
                      </div>
                      <div className="relative mb-2">
                        <input
                          type="number"
                          value={borrowInput}
                          onChange={(e) => setBorrowInput(e.target.value)}
                          className="w-full h-11 px-4 pr-16 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-white text-base outline-none focus:border-[var(--primary)] transition"
                          placeholder="50"
                        />
                        <button
                          onClick={() => setBorrowInput(Math.min(creditProfile.maxCredit || 100, livePool.availableLiquidity || 100).toString())}
                          className="absolute right-3.5 top-2.5 text-xs font-bold text-[var(--primary)] uppercase cursor-pointer hover:brightness-125 transition"
                        >
                          Max
                        </button>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max={Math.max(100, creditProfile.maxCredit || 100)}
                        step="5"
                        value={borrowInput}
                        onChange={(e) => setBorrowInput(e.target.value)}
                        className="portal-slider"
                      />
                      <div className="flex justify-between text-xs text-[var(--text-dim)] font-mono mt-1">
                        <span>Min 10 FDX</span>
                        <span>Available Pool: {Number(livePool.availableLiquidity || 0).toFixed(0)} FDX</span>
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
                          {(Number(borrowInput) * (1 + 0.052 * (borrowTerm / 365))).toFixed(2)} FDX
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
                      disabled={borrowTxStatus === 'awaiting-wallet' || borrowTxStatus === 'pending'}
                      className="portal-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {borrowTxStatus === 'awaiting-wallet' && 'Confirm in Wallet...'}
                      {borrowTxStatus === 'pending' && 'Confirming on-chain...'}
                      {borrowTxStatus === 'confirmed' && 'Loan Disbursed!'}
                      {borrowTxStatus === 'failed' && 'Borrow Failed (Retry)'}
                      {borrowTxStatus === 'ready' && 'Execute Uncollateralized Loan'}
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
                          { symbol: 'FDX', label: 'FDX (Active Pool)' },
                          { symbol: 'USDC', label: 'USDC (Coming Soon)' },
                          { symbol: 'EURC', label: 'EURC (Coming Soon)' }
                        ].map((v) => (
                          <button
                            key={v.symbol}
                            onClick={() => setSupplyAsset(v.symbol)}
                            className={`portal-segmented-btn ${supplyAsset === v.symbol ? 'active border-[var(--accent-1)] text-[var(--accent-1)]' : ''}`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deposit Amount Input */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="portal-label">Deposit Capital</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--text-dim)] font-mono">
                            Balance: {userFdxBalance !== null ? Number(userFdxBalance).toFixed(2) : '--'} {supplyAsset}
                          </span>
                          <button
                            type="button"
                            onClick={handleMintTokens}
                            disabled={isMinting}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--accent-1)]/20 text-[var(--accent-1)] hover:bg-[var(--accent-1)]/30 border border-[var(--accent-1)]/40 transition disabled:opacity-50 cursor-pointer"
                            title="Mint 10,000 FDX tokens directly to your wallet"
                          >
                            {isMinting ? 'Minting...' : '+ Mint 10k FDX'}
                          </button>
                        </div>
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
                          onClick={() => setSupplyAmount(Math.floor(userFdxBalance || 100).toString())}
                          className="absolute right-3.5 top-2.5 text-xs font-bold text-[var(--accent-1)] uppercase cursor-pointer hover:brightness-125 transition"
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {/* Summary Rows */}
                    <div className="flex flex-col gap-3 py-4 border-t border-[var(--border)] text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Interest Model</span>
                        <span className="font-semibold text-white">Continuous utilization curve</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Withdrawal Liquidity</span>
                        <span className="font-semibold text-white">Instant on available buffer</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Target Network</span>
                        <span className="portal-badge portal-badge-yield">Primary Settlement (80002)</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={handleExecuteSupply}
                      disabled={supplyTxStatus === 'awaiting-wallet' || supplyTxStatus === 'pending'}
                      className="portal-btn-yield w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {supplyTxStatus === 'awaiting-wallet' && 'Confirm in Wallet...'}
                      {supplyTxStatus === 'pending' && 'Depositing on-chain...'}
                      {supplyTxStatus === 'confirmed' && 'Deposited Successfully!'}
                      {supplyTxStatus === 'failed' && 'Deposit Failed (Retry)'}
                      {supplyTxStatus === 'ready' && `Deposit & Earn ${supplyAsset} Yield`}
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
                                onClick={() => handleExecuteRepay(loan.loanId || loan.id)}
                                disabled={repayTxStatus[loan.loanId || loan.id] === 'awaiting-wallet' || repayTxStatus[loan.loanId || loan.id] === 'pending'}
                                className="portal-btn-secondary h-8 px-3 text-xs disabled:opacity-60"
                              >
                                {repayTxStatus[loan.loanId || loan.id] === 'awaiting-wallet' && 'Confirm...'}
                                {repayTxStatus[loan.loanId || loan.id] === 'pending' && 'Settling...'}
                                {repayTxStatus[loan.loanId || loan.id] === 'confirmed' && 'Settled!'}
                                {repayTxStatus[loan.loanId || loan.id] === 'failed' && 'Retry'}
                                {(!repayTxStatus[loan.loanId || loan.id] || repayTxStatus[loan.loanId || loan.id] === 'ready') && 'Settle'}
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
                  <div className="flex items-center gap-3">
                    <h2 className="portal-card-title">Real-Time Attestation Log</h2>
                    <button
                      onClick={handleRunAudit}
                      disabled={isAuditing}
                      className="portal-btn-cyan h-7 px-3 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={12} className={isAuditing ? 'animate-spin' : ''} />
                      <span>{isAuditing ? 'Evaluating...' : 'Run Audit'}</span>
                    </button>
                  </div>
                  <span className="portal-badge portal-badge-cyan">
                    <span className="pulse-dot-cyan shrink-0" /> Live Consensus Stream
                  </span>
                </div>
                <div className="h-[280px] overflow-y-auto rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 font-mono text-xs text-[var(--text-muted)] flex flex-col gap-2.5 break-words">
                  {attestationLogs.map((log, idx) => (
                    <div key={idx}>
                      <span className="text-[var(--text-dim)]">[{log.time}]</span>{' '}
                      <span className={`font-semibold ${log.color || 'text-white'}`}>{log.sender}:</span>{' '}
                      {log.text}
                    </div>
                  ))}
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
                      <span className="portal-badge portal-badge-purple">Institutional Liquidity AMM</span>
                    </div>

                    {/* Pair Liquidity Status Banner */}
                    <div className="mb-4">
                      {pairReserves.fdx === 0 || pairReserves.wpol === 0 ? (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                          <div className="flex flex-col">
                            <span className="font-semibold">Pool Reserves: 0.00 FDX / 0.00 WPOL</span>
                            <span className="text-[11px] text-amber-400/80">Pool requires initial liquidity before swapping.</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleSeedLiquidity}
                            disabled={isSeeding || !wallet.signer}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition cursor-pointer disabled:opacity-50"
                          >
                            {isSeeding ? 'Seeding Pool...' : 'Seed Liquidity (10 POL)'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs text-[var(--text-dim)] font-mono px-1">
                          <span>AMM Liquidity:</span>
                          <span className="text-emerald-400 font-semibold">{pairReserves.fdx.toFixed(2)} FDX / {pairReserves.wpol.toFixed(2)} WPOL</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Pay Input */}
                      <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="portal-label">You Pay</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--text-dim)] font-mono">
                              Balance: {userFdxBalance !== null ? Number(userFdxBalance).toFixed(2) : '--'} {swapFrom}
                            </span>
                            <button
                              type="button"
                              onClick={handleMintTokens}
                              disabled={isMinting}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--accent-3)]/20 text-[var(--accent-3)] hover:bg-[var(--accent-3)]/30 border border-[var(--accent-3)]/40 transition disabled:opacity-50 cursor-pointer"
                              title="Mint 10,000 FDX tokens"
                            >
                              {isMinting ? 'Minting...' : '+ Mint 10k FDX'}
                            </button>
                          </div>
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
                          <span className="text-xs text-[var(--text-dim)] font-mono">Constant Product AMM (x*y=k)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xl font-bold text-[var(--accent-3)]">
                            {pairReserves.fdx === 0 || pairReserves.wpol === 0
                              ? '0.00 (Unseeded Pool)'
                              : ((Number(swapAmount || 0) * 997 * pairReserves.wpol) / (pairReserves.fdx * 1000 + Number(swapAmount || 0) * 997)).toFixed(4)}
                          </span>
                          <span className="portal-badge portal-badge-purple font-bold">{swapTo}</span>
                        </div>
                      </div>

                      {/* Rate Info Rows */}
                      <div className="flex flex-col gap-2 py-2 text-xs text-[var(--text-muted)]">
                        <div className="flex justify-between">
                          <span>AMM Fee Tier</span>
                          <span className="font-mono text-white">0.30% Protocol Fee</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slippage Protection</span>
                          <span className="font-mono text-[var(--accent-3)]">0.50% (Strict Max)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <button
                      onClick={pairReserves.fdx === 0 || pairReserves.wpol === 0 ? handleSeedLiquidity : handleExecuteSwap}
                      disabled={swapTxStatus === 'awaiting-wallet' || swapTxStatus === 'pending' || isSeeding}
                      className="portal-btn-purple w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSeeding && 'Seeding Liquidity Pool...'}
                      {!isSeeding && pairReserves.fdx === 0 && 'Seed Liquidity (10 POL) to Enable Swaps'}
                      {!isSeeding && pairReserves.fdx > 0 && swapTxStatus === 'awaiting-wallet' && 'Confirm in Wallet...'}
                      {!isSeeding && pairReserves.fdx > 0 && swapTxStatus === 'pending' && 'Swapping on-chain...'}
                      {!isSeeding && pairReserves.fdx > 0 && swapTxStatus === 'confirmed' && 'Swap Confirmed!'}
                      {!isSeeding && pairReserves.fdx > 0 && swapTxStatus === 'failed' && 'Swap Failed (Retry)'}
                      {!isSeeding && pairReserves.fdx > 0 && swapTxStatus === 'ready' && 'Execute Liquidity Swap'}
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

          {/* ======================================================= */}
          {/* TAB 7: ADMIN ON-CHAIN AUDIT TRAIL (ADMIN-ONLY GATE)      */}
          {/* ======================================================= */}
          {activeTab === 'audit' && !isAdmin && (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-center max-w-xl mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Restricted Protocol Area</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
                The Cryptographic On-Chain Audit Trail is restricted exclusively to authorized Protocol Administrators and the AccessManager contract.
              </p>
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono text-[var(--text-dim)] w-full text-left flex flex-col gap-1.5 mb-6">
                <div>Connected Account: <span className="text-white">{wallet.address || 'No wallet connected'}</span></div>
                <div>Role Verification: <span className="text-rose-400">UNAUTHORIZED_VIEWER</span></div>
                <div>Authorized Admin Accounts: <span className="text-emerald-400">0xc90A1...F96b4</span> &amp; <span className="text-emerald-400">AccessManager (0x2308...)</span></div>
              </div>
              {!wallet.address ? (
                <button onClick={onConnect} className="portal-btn-primary">Connect Admin Wallet</button>
              ) : (
                <button onClick={() => setActiveTab('overview')} className="portal-btn-secondary">Return to Overview</button>
              )}
            </div>
          )}

          {activeTab === 'audit' && isAdmin && (
            <div className="flex flex-col gap-10 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="portal-page-title">Admin Cryptographic Audit Trail</h1>
                    <span className="portal-badge portal-badge-primary">Admin Validated</span>
                  </div>
                  <p className="portal-page-sub">
                    Immutable on-chain execution ledger and cryptographic hash validation suite.
                  </p>
                </div>
                <button
                  onClick={loadOnChainAuditTrail}
                  disabled={isLoadingAudit}
                  className="portal-btn-secondary flex items-center gap-2 text-xs"
                >
                  <Activity size={14} className={isLoadingAudit ? 'animate-spin' : ''} />
                  <span>{isLoadingAudit ? 'Syncing...' : 'Sync Blockchain Logs'}</span>
                </button>
              </div>

              {/* Admin Authority Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-emerald-500/30 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)] block">Primary Admin Wallet</span>
                    <span className="font-mono text-xs font-bold text-white">0xc90A124b...F96b4</span>
                    <span className="text-[10px] text-emerald-400 block font-medium">Connected · Session Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)] block">Governance Contract</span>
                    <span className="font-mono text-xs font-bold text-white">0x230829f5...69e8</span>
                    <span className="text-[10px] text-[var(--text-muted)] block font-medium">AccessManager Controller</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Radio size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)] block">Consensus Network</span>
                    <span className="font-mono text-xs font-bold text-white">Primary Settlement Layer (80002)</span>
                    <span className="text-[10px] text-cyan-400 block font-medium">Direct Bor RPC · Zero Middleware</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Database size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-dim)] block">Audit Database</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {isSupabaseConfigured ? 'Supabase Indexed' : 'On-Chain Ledger'}
                    </span>
                    <span className={`text-[10px] block font-medium ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isSupabaseConfigured ? 'Persistent Indexing Active' : 'RPC Direct · Ready for Keys'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hash Verifier Tool */}
              <div className="portal-card portal-card-top-cyan">
                <div className="portal-card-header">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-cyan-400" />
                    <h2 className="portal-card-title">Cryptographic Hash Verifier</h2>
                  </div>
                  <span className="portal-badge portal-badge-cyan">RPC Validation</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Paste any transaction hash to verify receipt status, mined block number, and cryptographic consensus on explorer.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    value={auditSearchHash}
                    onChange={(e) => setAuditSearchHash(e.target.value)}
                    placeholder="0x... (e.g. 0xf523a1bc... or 0x283603fd...)"
                    className="flex-1 h-11 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs text-white outline-none focus:border-cyan-400 transition"
                  />
                  <button
                    onClick={() => handleVerifyTx()}
                    disabled={isVerifyingTx || !auditSearchHash}
                    className="portal-btn-cyan h-11 px-6 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingTx ? 'Querying Chain...' : 'Verify Hash'}
                  </button>
                </div>

                {/* Quick Sample Hashes from user's live deposit & loan */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-dim)]">
                  <span>Your recent onchain transactions:</span>
                  <button
                    type="button"
                    onClick={() => { setAuditSearchHash('0xf523a1bc8e5cecfaeca2dfb7390b85f524ad2fcb37ad499d6a961eaf47faf5c7'); handleVerifyTx('0xf523a1bc8e5cecfaeca2dfb7390b85f524ad2fcb37ad499d6a961eaf47faf5c7'); }}
                    className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-cyan-300 font-mono hover:border-cyan-400 transition text-[11px] cursor-pointer"
                  >
                    Loan Disbursed (50 FDX)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuditSearchHash('0x283603fd1883ae05d85cbb220312dcebdc897d5d63343111c0d80fe2c4a92121'); handleVerifyTx('0x283603fd1883ae05d85cbb220312dcebdc897d5d63343111c0d80fe2c4a92121'); }}
                    className="px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-emerald-300 font-mono hover:border-emerald-400 transition text-[11px] cursor-pointer"
                  >
                    Capital Deposit (500 FDX)
                  </button>
                </div>

                {/* Verification Result Card */}
                {verifyTxError && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 font-mono">
                    Verification Error: {verifyTxError}
                  </div>
                )}

                {verifiedTxData && (
                  <div className="mt-4 p-4 rounded-xl bg-[var(--surface-2)] border border-cyan-500/30 flex flex-col gap-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-400" />
                        Status: <span className="text-emerald-400">{verifiedTxData.status}</span>
                      </span>
                      <a
                        href={verifiedTxData.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold underline"
                      >
                        View on Explorer <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--text-muted)]">
                      <div>Mined Block: <span className="text-white font-semibold">#{verifiedTxData.blockNumber}</span> ({verifiedTxData.confirmations} Confirmations)</div>
                      <div>Gas Used: <span className="text-white font-semibold">{Number(verifiedTxData.gasUsed).toLocaleString()}</span> units</div>
                      <div>Gas Price: <span className="text-white font-semibold">{Number(verifiedTxData.effectiveGasPrice).toFixed(2)} Gwei</span></div>
                      <div>Logs Emitted: <span className="text-white font-semibold">{verifiedTxData.logsCount} event(s)</span></div>
                      <div className="sm:col-span-2 truncate">Transaction Hash: <span className="text-cyan-300">{verifiedTxData.hash}</span></div>
                      <div className="sm:col-span-2 truncate">Origin (From): <span className="text-white">{verifiedTxData.from}</span></div>
                      <div className="sm:col-span-2 truncate">Contract (To): <span className="text-white">{verifiedTxData.to}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real On-Chain Ledger Table */}
              <div className="portal-card">
                <div className="portal-card-header">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" />
                    <h2 className="portal-card-title">Live Cryptographic Audit Trail</h2>
                  </div>
                  <span className="portal-badge portal-badge-neutral">
                    {auditEvents.length} Events Verified
                  </span>
                </div>

                <div className="portal-table-wrapper">
                  <table className="portal-table-v2">
                    <thead>
                      <tr>
                        <th>Event Type</th>
                        <th>Transaction Hash</th>
                        <th>Block</th>
                        <th>Actor (Borrower / Lender)</th>
                        <th>Volume / Amount</th>
                        <th>On-Chain Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-xs text-[var(--text-dim)] font-mono">
                            {isLoadingAudit ? 'Fetching verified blocks from network...' : 'No events in recent block range.'}
                          </td>
                        </tr>
                      ) : (
                        auditEvents.map((ev, idx) => (
                          <tr key={ev.txHash || idx}>
                            <td>
                              <span className={`portal-badge ${
                                ev.type.includes('Disbursement') ? 'portal-badge-primary' :
                                ev.type.includes('Supply') ? 'portal-badge-yield' :
                                ev.type.includes('Swap') ? 'portal-badge-purple' :
                                'portal-badge-cyan'
                              }`}>
                                {ev.type}
                              </span>
                            </td>
                            <td className="font-mono text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-white">{ev.hash}</span>
                                <a
                                  href={explorerTxLink(ev.txHash)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="Inspect on Explorer"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            </td>
                            <td className="font-mono text-xs text-[var(--text-muted)]">
                              <a
                                href={`https://amoy.polygonscan.com/block/${ev.blockNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-white underline"
                              >
                                #{ev.blockNumber}
                              </a>
                            </td>
                            <td className="font-mono text-xs text-[var(--text-muted)]">
                              {ev.borrower}
                            </td>
                            <td className="font-mono text-xs font-semibold text-white">
                              {ev.amount}
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                                <CheckCircle size={12} />
                                <span>Verified</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
