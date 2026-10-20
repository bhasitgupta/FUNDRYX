import { ethers } from 'ethers';

// ─────────────────────────────────────────────────────────────
// NETWORK CONFIG — Polygon Amoy Testnet
// ─────────────────────────────────────────────────────────────
export const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882', // 80002
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export const CHAIN_ID = 80002;

// ─────────────────────────────────────────────────────────────
// DEPLOYED CONTRACT ADDRESSES — Polygon Amoy
// ─────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  AccessManager:           '0x230829f5EC30A1936fDECE13F1179381daaf69e8',
  PauseController:         '0xF4d0F035900c313e44246ED473b3011E42192F77',
  FundryxToken:            '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E',
  CreditHistoryRegistry:   '0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d',
  CreditPolicy:            '0x68fC6E11cD8a855849D7788e035BA92E320Db0d2',
  LendingPool:             '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C',
  RiskAttestationRegistry: '0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC',
};

// ─────────────────────────────────────────────────────────────
// ABIs — exactly match the deployed contracts
// ─────────────────────────────────────────────────────────────

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function burn(uint256 amount) external',
];

export const LENDING_POOL_ABI = [
  // View
  'function totalDeposits() view returns (uint256)',
  'function totalBorrowed() view returns (uint256)',
  'function availableLiquidity() view returns (uint256)',
  'function totalOutstandingDebt() view returns (uint256)',
  'function lenderBalances(address) view returns (uint256)',
  'function getLoan(uint256 loanId) view returns (tuple(uint256 loanId, address borrower, uint256 principalInitial, uint256 principalOutstanding, uint256 feeAmount, uint64 createdAt, uint64 dueAt, uint8 status, uint32 policyVersion))',
  'function getBorrowerLoans(address borrower) view returns (uint256[])',
  'function loanDuration() view returns (uint64)',
  'function defaultGracePeriod() view returns (uint256)',
  'function nextLoanId() view returns (uint256)',
  // Actions
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function borrow(uint256 amount, uint32 expectedPolicyVersion) external',
  'function repay(uint256 loanId, uint256 amount) external',
  'function markOverdue(uint256 loanId) external',
  'function markDefaulted(uint256 loanId) external',
  'function setLoanDuration(uint64 duration) external',
  'function setDefaultGracePeriod(uint256 period) external',
  // Events
  'event Deposited(address indexed lender, uint256 amount)',
  'event Withdrawn(address indexed lender, uint256 amount)',
  'event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 fee, uint64 dueAt, uint32 policyVersion)',
  'event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amountPaid, uint256 remainingOutstanding, bool isFullRepayment)',
  'event LoanStatusChanged(uint256 indexed loanId, address indexed borrower, uint8 oldStatus, uint8 newStatus)',
];

export const CREDIT_POLICY_ABI = [
  'function policyVersion() view returns (uint32)',
  'function eligibleCredit(address borrower, bytes32 marketId) view returns (uint256 amount, uint32 version)',
  'function previewEligibility(address borrower) view returns (uint256 maxCredit, uint32 version, uint64 repaymentCount, uint256 outstandingExposure)',
  'function calculateFee(uint256 principal) view returns (uint256)',
  'function exposureHeadroom(address borrower) view returns (uint256)',
  'function config() view returns (uint256 baseLimit, uint256 perRepaymentBonus, uint64 maxBonusRepayments, uint256 defaultPenalty, uint256 perLoanCap, uint256 maxBorrowerExposure, uint256 maxPoolExposure, uint256 flatFeeBps)',
];

export const CREDIT_HISTORY_ABI = [
  'function getBorrowerStats(address borrower) view returns (tuple(uint64 verifiedRepaymentCount, uint256 verifiedRepaidValue, uint256 outstandingExposure, uint64 defaultCount, uint64 lastUpdateAt, uint32 policyVersionLastEvaluated))',
];

export const PAUSE_CONTROLLER_ABI = [
  'function borrowingPaused() view returns (bool)',
  'function depositsPaused() view returns (bool)',
  'function setBorrowingPaused(bool paused) external',
  'function setDepositsPaused(bool paused) external',
];

export const RISK_REGISTRY_ABI = [
  'function reportCount() view returns (uint256)',
  'function getReport(bytes32 reportId) view returns (tuple(bytes32 reportId, bytes32 modelVersion, uint32 ruleSetVersion, uint256 sourceChainId, uint256 fromBlock, uint256 toBlock, uint64 createdAt, uint8 riskLevel, bytes32 reportHash, address signer, bool revoked))',
];

export const ACCESS_MANAGER_ABI = [
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function ADMIN_ROLE() view returns (bytes32)',
  'function OPERATOR_ROLE() view returns (bytes32)',
  'function LENDING_POOL_ROLE() view returns (bytes32)',
  'function MONITOR_SIGNER_ROLE() view returns (bytes32)',
  'function USER_ROLE() view returns (bytes32)',
  'function grantRole(bytes32 role, address account) external',
  'function revokeRole(bytes32 role, address account) external',
  'function registerUser() external',
  'event UserRegistered(address indexed account)',
  'event RoleGranted(bytes32 indexed role, address indexed account, address indexed grantedBy)',
  'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed revokedBy)',
];

// ─────────────────────────────────────────────────────────────
// LOAN STATUS ENUM (matches LoanStatus in contract)
// ─────────────────────────────────────────────────────────────
export const LOAN_STATUS = {
  0: 'None',
  1: 'Active',
  2: 'Repaid',
  3: 'Overdue',
  4: 'Defaulted',
};

// ─────────────────────────────────────────────────────────────
// READ-ONLY PROVIDER — public RPC, no wallet needed
// ─────────────────────────────────────────────────────────────
export function getReadProvider() {
  return new ethers.JsonRpcProvider('https://polygon-amoy-bor-rpc.publicnode.com');
}

export function getInjectedProvider(walletType = 'metamask') {
  if (typeof window === 'undefined') return null;

  const providers = window.ethereum?.providers || [];

  if (walletType === 'metamask') {
    // Specifically target MetaMask and exclude Phantom/Coinbase
    if (providers.length > 0) {
      const mm = providers.find((p) => p.isMetaMask && !p.isPhantom);
      if (mm) return mm;
    }
    if (window.ethereum?.isMetaMask && !window.ethereum?.isPhantom) {
      return window.ethereum;
    }
    if (window.ethereum && !window.ethereum.isPhantom) {
      return window.ethereum;
    }
    return null;
  }

  if (walletType === 'phantom') {
    if (window.phantom?.ethereum) return window.phantom.ethereum;
    if (providers.length > 0) {
      const ph = providers.find((p) => p.isPhantom);
      if (ph) return ph;
    }
    if (window.ethereum?.isPhantom) return window.ethereum;
    return null;
  }

  if (walletType === 'coinbase') {
    if (window.coinbaseWalletExtension) return window.coinbaseWalletExtension;
    if (providers.length > 0) {
      const cb = providers.find((p) => p.isCoinbaseWallet);
      if (cb) return cb;
    }
    if (window.ethereum?.isCoinbaseWallet) return window.ethereum;
    return null;
  }

  if (walletType === 'trust') {
    if (window.trustwallet) return window.trustwallet;
    if (providers.length > 0) {
      const tr = providers.find((p) => p.isTrust || p.isTrustWallet);
      if (tr) return tr;
    }
    return null;
  }

  return window.ethereum || null;
}

// ─────────────────────────────────────────────────────────────
// WALLET CONNECTION
// ─────────────────────────────────────────────────────────────
let wcProvider = null;

export async function connectWalletConnect() {
  const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';

  if (!wcProvider) {
    wcProvider = await EthereumProvider.init({
      projectId,
      chains: [80002],
      optionalChains: [80002, 137, 1],
      showQrModal: true,
      rpcMap: {
        80002: 'https://polygon-amoy-bor-rpc.publicnode.com',
      },
      metadata: {
        name: 'Fundryx',
        description: 'Institutional Decentralized Credit & Lending',
        url: window.location.origin,
        icons: [`${window.location.origin}/wallets/walletconnect.png`],
      },
    });
  }

  if (wcProvider.connected) {
    try {
      await wcProvider.disconnect();
    } catch (e) {
      console.warn('WalletConnect reset:', e);
    }
  }

  await wcProvider.connect();

  const provider = new ethers.BrowserProvider(wcProvider);
  const signer = await provider.getSigner();
  const accounts = await provider.listAccounts();
  const address = accounts[0]?.address || (await signer.getAddress());
  const balance = await provider.getBalance(address);
  const network = await provider.getNetwork();

  return {
    address,
    signer,
    provider,
    balance: ethers.formatEther(balance),
    chainId: Number(network.chainId),
    walletType: 'walletconnect',
  };
}

export async function connectWallet(walletType = 'metamask') {
  if (walletType === 'walletconnect') {
    return await connectWalletConnect();
  }

  const injected = getInjectedProvider(walletType);

  if (!injected) {
    if (walletType === 'metamask') {
      if (window.ethereum?.isPhantom) {
        throw new Error(
          'MetaMask extension was not detected or Phantom has captured window.ethereum. Please enable MetaMask or set MetaMask as default EVM wallet.'
        );
      }
      throw new Error('MetaMask extension not found. Please install MetaMask to connect.');
    } else if (walletType === 'phantom') {
      throw new Error('Phantom extension not found or EVM support not enabled.');
    } else if (walletType === 'coinbase') {
      throw new Error('Coinbase Wallet extension not found. Please install Coinbase Wallet.');
    } else if (walletType === 'trust') {
      throw new Error('Trust Wallet extension not found.');
    } else {
      throw new Error('Web3 wallet provider not detected in this browser.');
    }
  }

  const provider = new ethers.BrowserProvider(injected);

  // Always request permissions so wallet shows confirmation popup on reconnect
  try {
    await injected.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });
  } catch (permErr) {
    // User dismissed or wallet doesn't support — fall through to eth_requestAccounts
    if (permErr.code === 4001) throw new Error('Connection rejected by user.');
  }

  const accounts = await injected.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in wallet.');
  }

  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  // Switch to Polygon Amoy if needed
  if (network.chainId !== BigInt(CHAIN_ID)) {
    try {
      await injected.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await injected.request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_AMOY_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
    // Re-init after chain switch
    const updatedProvider = new ethers.BrowserProvider(injected);
    const updatedSigner = await updatedProvider.getSigner();
    const updatedNetwork = await updatedProvider.getNetwork();
    const balance = await updatedProvider.getBalance(accounts[0]);
    return {
      address: accounts[0],
      signer: updatedSigner,
      provider: updatedProvider,
      balance: ethers.formatEther(balance),
      chainId: Number(updatedNetwork.chainId),
      walletType,
    };
  }

  const balance = await provider.getBalance(accounts[0]);

  return {
    address: accounts[0],
    signer,
    provider,
    balance: ethers.formatEther(balance),
    chainId: Number(network.chainId),
    walletType,
  };
}

// ─────────────────────────────────────────────────────────────
// CONTRACT FACTORIES
// ─────────────────────────────────────────────────────────────
export function getLendingPool(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, signerOrProvider);
}

export function getCreditPolicy(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.CreditPolicy, CREDIT_POLICY_ABI, signerOrProvider);
}

export function getCreditHistory(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.CreditHistoryRegistry, CREDIT_HISTORY_ABI, signerOrProvider);
}

export function getFundryxToken(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.FundryxToken, ERC20_ABI, signerOrProvider);
}

export function getPauseController(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.PauseController, PAUSE_CONTROLLER_ABI, signerOrProvider);
}

export function getRiskRegistry(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.RiskAttestationRegistry, RISK_REGISTRY_ABI, signerOrProvider);
}

export function getAccessManager(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESSES.AccessManager, ACCESS_MANAGER_ABI, signerOrProvider);
}

// ─────────────────────────────────────────────────────────────
// READ PROTOCOL STATS — calls real deployed contracts
// ─────────────────────────────────────────────────────────────
export async function fetchProtocolStats() {
  const provider = getReadProvider();
  const pool = getLendingPool(provider);
  const policy = getCreditPolicy(provider);
  const pause = getPauseController(provider);

  const [totalDeposits, totalBorrowed, availableLiquidity, policyVersion, borrowingPaused, depositsPaused] =
    await Promise.all([
      pool.totalDeposits().catch(() => 0n),
      pool.totalBorrowed().catch(() => 0n),
      pool.availableLiquidity().catch(() => 0n),
      policy.policyVersion().catch(() => 1),
      pause.borrowingPaused().catch(() => false),
      pause.depositsPaused().catch(() => false),
    ]);

  const depNum = Number(ethers.formatEther(totalDeposits));
  const borNum = Number(ethers.formatEther(totalBorrowed));
  const liqNum = Number(ethers.formatEther(availableLiquidity));
  const util = depNum > 0 ? ((borNum / depNum) * 100).toFixed(2) : '0.00';

  return {
    totalDeposits: depNum,
    totalBorrowed: borNum,
    availableLiquidity: liqNum,
    utilization: util,
    policyVersion: Number(policyVersion),
    borrowingPaused,
    depositsPaused,
  };
}

// ─────────────────────────────────────────────────────────────
// READ WALLET SPECIFIC DATA
// ─────────────────────────────────────────────────────────────
export async function fetchWalletData(address, provider) {
  const rpc = provider || getReadProvider();
  const pool = getLendingPool(rpc);
  const policy = getCreditPolicy(rpc);
  const history = getCreditHistory(rpc);
  const token = getFundryxToken(rpc);

  const [lenderBalance, loanIds, eligibility, stats, fdxBalance, polBalance] = await Promise.all([
    pool.lenderBalances(address).catch(() => 0n),
    pool.getBorrowerLoans(address).catch(() => []),
    policy.previewEligibility(address).catch(() => ({ maxCredit: 0n, version: 1, repaymentCount: 0n, outstandingExposure: 0n })),
    history.getBorrowerStats(address).catch(() => null),
    token.balanceOf(address).catch(() => 0n),
    rpc.getBalance(address).catch(() => 0n),
  ]);

  return {
    lenderBalance: Number(ethers.formatEther(lenderBalance)),
    loanIds: loanIds.map(id => Number(id)),
    maxCredit: Number(ethers.formatEther(eligibility.maxCredit)),
    policyVersion: Number(eligibility.version),
    repaymentCount: Number(eligibility.repaymentCount),
    outstandingExposure: Number(ethers.formatEther(eligibility.outstandingExposure)),
    stats: stats ? {
      verifiedRepaymentCount: Number(stats.verifiedRepaymentCount),
      verifiedRepaidValue: Number(ethers.formatEther(stats.verifiedRepaidValue)),
      outstandingExposure: Number(ethers.formatEther(stats.outstandingExposure)),
      defaultCount: Number(stats.defaultCount),
      lastUpdateAt: Number(stats.lastUpdateAt),
    } : null,
    fdxBalance: Number(ethers.formatEther(fdxBalance)),
    polBalance: Number(ethers.formatEther(polBalance)),
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH ACTIVE LOANS FOR ADDRESS
// ─────────────────────────────────────────────────────────────
export async function fetchBorrowerLoans(address, provider) {
  const rpc = provider || getReadProvider();
  const pool = getLendingPool(rpc);

  const loanIds = await pool.getBorrowerLoans(address).catch(() => []);
  const loans = await Promise.all(
    loanIds.map(id => pool.getLoan(id).catch(() => null))
  );

  return loans.filter(Boolean).map(l => {
    const init = Number(ethers.formatEther(l.principalInitial));
    const out = Number(ethers.formatEther(l.principalOutstanding));
    const isSettled = Number(l.status) === 2 || out === 0;
    return {
      id: `LOAN-${l.loanId}`,
      loanId: Number(l.loanId),
      borrower: l.borrower,
      asset: 'FDX',
      amount: init,
      principalInitial: init,
      principalOutstanding: out,
      feeAmount: Number(ethers.formatEther(l.feeAmount)),
      apr: '5.20%',
      createdAt: Number(l.createdAt),
      dueAt: Number(l.dueAt),
      status: isSettled ? 'Settled' : (LOAN_STATUS[l.status] ?? 'Active'),
      statusCode: Number(l.status),
      policyVersion: Number(l.policyVersion),
      dueDays: Math.max(0, Math.ceil((Number(l.dueAt) - Date.now() / 1000) / 86400)),
      progress: isSettled ? 100 : (init > 0 ? Math.max(10, Math.round(((init - out) / init) * 100)) : 10),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// EXECUTE BORROW — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeBorrow(signer, amount, policyVersion) {
  const provider = signer.provider;
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  // Chain guard
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Wrong network. Switch to Polygon Amoy (chain ${CHAIN_ID}). Current: ${network.chainId}.`);
  }

  const address = await signer.getAddress();

  // FDX balance check — borrowing transfers FDX OUT of pool, but borrower needs POL for gas
  const polBalance = await provider.getBalance(address);
  if (polBalance < ethers.parseEther('0.001')) {
    throw new Error('Insufficient POL for gas. Get testnet POL from the Polygon Amoy faucet.');
  }

  // Read actual policyVersion from chain if not provided
  const policy = getCreditPolicy(provider);
  const chainPolicyVersion = Number(await policy.policyVersion().catch(() => 1n));
  const usedVersion = (policyVersion !== undefined && policyVersion !== null)
    ? Number(policyVersion)
    : chainPolicyVersion;

  // Credit eligibility pre-flight
  const [eligible] = await policy.eligibleCredit(address, ethers.ZeroHash).catch(() => [0n]);
  if (amountWei > eligible) {
    const eligibleFmt = ethers.formatEther(eligible);
    throw new Error(`Borrow amount (${amount} FDX) exceeds credit limit (${Number(eligibleFmt).toFixed(2)} FDX). Build credit history by repaying previous loans.`);
  }

  // Liquidity check
  const available = await pool.availableLiquidity().catch(() => 0n);
  if (amountWei > available) {
    const availFmt = ethers.formatEther(available);
    throw new Error(`Insufficient pool liquidity. Available: ${Number(availFmt).toFixed(2)} FDX. Borrowing is paused or pool is empty.`);
  }

  const tx = await pool.borrow(amountWei, usedVersion).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Borrow transaction reverted on-chain.');

  // Read updated FDX balance after confirmation
  const newFdxBalance = await token.balanceOf(address).catch(() => 0n);
  return { tx, receipt, newFdxBalance: ethers.formatEther(newFdxBalance) };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE DEPOSIT — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeDeposit(signer, amount) {
  const provider = signer.provider;
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  // Chain guard
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Wrong network. Switch to Polygon Amoy (chain ${CHAIN_ID}). Current: ${network.chainId}.`);
  }

  const address = await signer.getAddress();

  // FDX balance check
  const fdxBalance = await token.balanceOf(address).catch(() => 0n);
  if (fdxBalance < amountWei) {
    const fmt = ethers.formatEther(fdxBalance);
    throw new Error(`Insufficient FDX balance. You have ${Number(fmt).toFixed(4)} FDX. Request testnet tokens via the Faucet tab.`);
  }

  // Approval — Step 1
  const allowance = await token.allowance(address, CONTRACT_ADDRESSES.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(CONTRACT_ADDRESSES.LendingPool, ethers.MaxUint256).catch((err) => {
      throw new Error(`Approval rejected: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  // Deposit — Step 2
  const tx = await pool.deposit(amountWei).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Deposit transaction reverted on-chain.');

  // Read updated balances
  const [newFdxBal, newLenderBal, newPoolDeposits] = await Promise.all([
    token.balanceOf(address).catch(() => 0n),
    pool.lenderBalances(address).catch(() => 0n),
    pool.totalDeposits().catch(() => 0n),
  ]);

  return {
    tx,
    receipt,
    newFdxBalance: ethers.formatEther(newFdxBal),
    newLenderBalance: ethers.formatEther(newLenderBal),
    newTotalDeposits: ethers.formatEther(newPoolDeposits),
  };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE REPAY — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeRepay(signer, loanId, amount) {
  const provider = signer.provider;
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  // Chain guard
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Wrong network. Switch to Polygon Amoy (chain ${CHAIN_ID}).`);
  }

  const address = await signer.getAddress();

  // FDX balance check
  const fdxBalance = await token.balanceOf(address).catch(() => 0n);
  if (fdxBalance < amountWei) {
    const fmt = ethers.formatEther(fdxBalance);
    throw new Error(`Insufficient FDX to repay. You have ${Number(fmt).toFixed(4)} FDX, need ${amount} FDX.`);
  }

  // Approval
  const allowance = await token.allowance(address, CONTRACT_ADDRESSES.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(CONTRACT_ADDRESSES.LendingPool, ethers.MaxUint256).catch((err) => {
      throw new Error(`Approval rejected: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  const tx = await pool.repay(loanId, amountWei).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Repay transaction reverted on-chain.');

  // Read updated loan state and balances
  const [loan, newFdxBal] = await Promise.all([
    pool.getLoan(loanId).catch(() => null),
    token.balanceOf(address).catch(() => 0n),
  ]);

  return {
    tx,
    receipt,
    loanStatus: loan ? LOAN_STATUS[Number(loan.status)] : 'Unknown',
    remainingOutstanding: loan ? ethers.formatEther(loan.principalOutstanding) : '0',
    newFdxBalance: ethers.formatEther(newFdxBal),
  };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE WITHDRAW — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeWithdraw(signer, amount) {
  const pool = getLendingPool(signer);
  const amountWei = ethers.parseEther(amount.toString());
  const tx = await pool.withdraw(amountWei);
  const receipt = await tx.wait();
  return { tx, receipt };
}

// ─────────────────────────────────────────────────────────────
// FETCH LIVE EVENTS — recent protocol activity from chain
// ─────────────────────────────────────────────────────────────
export async function fetchRecentEvents(blockRange = 500) {
  const provider = getReadProvider();
  const pool = getLendingPool(provider);

  const latest = await provider.getBlockNumber().catch(() => 0);
  const fromBlock = Math.max(0, latest - blockRange);

  const [loanCreatedLogs, loanRepaidLogs, depositedLogs] = await Promise.all([
    pool.queryFilter(pool.filters.LoanCreated(), fromBlock, latest).catch(() => []),
    pool.queryFilter(pool.filters.LoanRepaid(), fromBlock, latest).catch(() => []),
    pool.queryFilter(pool.filters.Deposited(), fromBlock, latest).catch(() => []),
  ]);

  const events = [];

  for (const log of loanCreatedLogs) {
    events.push({
      id: `EV-${log.transactionHash.slice(2, 6)}`,
      type: 'Disbursement',
      borrower: `${log.args.borrower.slice(0, 6)}...${log.args.borrower.slice(-4)}`,
      amount: `${Number(ethers.formatEther(log.args.principal)).toLocaleString()} FDX`,
      score: `Policy v${log.args.policyVersion}`,
      time: `Block ${log.blockNumber}`,
      hash: `${log.transactionHash.slice(0, 6)}...${log.transactionHash.slice(-4)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
    });
  }

  for (const log of loanRepaidLogs) {
    events.push({
      id: `EV-${log.transactionHash.slice(2, 6)}`,
      type: log.args.isFullRepayment ? 'Repayment' : 'Partial Repayment',
      borrower: `${log.args.borrower.slice(0, 6)}...${log.args.borrower.slice(-4)}`,
      amount: `${Number(ethers.formatEther(log.args.amountPaid)).toLocaleString()} FDX`,
      score: log.args.isFullRepayment ? '+Credit Boost' : 'Partial',
      time: `Block ${log.blockNumber}`,
      hash: `${log.transactionHash.slice(0, 6)}...${log.transactionHash.slice(-4)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
    });
  }

  for (const log of depositedLogs) {
    events.push({
      id: `EV-${log.transactionHash.slice(2, 6)}`,
      type: 'Capital Supply',
      borrower: `${log.args.lender.slice(0, 6)}...${log.args.lender.slice(-4)}`,
      amount: `${Number(ethers.formatEther(log.args.amount)).toLocaleString()} FDX`,
      score: 'Liquidity Deposited',
      time: `Block ${log.blockNumber}`,
      hash: `${log.transactionHash.slice(0, 6)}...${log.transactionHash.slice(-4)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
    });
  }

  // Sort by block descending
  events.sort((a, b) => b.blockNumber - a.blockNumber);
  return events.slice(0, 20);
}

// ─────────────────────────────────────────────────────────────
// POLYGONSCAN EXPLORER LINK
// ─────────────────────────────────────────────────────────────
export function explorerTxLink(txHash) {
  return `https://amoy.polygonscan.com/tx/${txHash}`;
}

export function explorerAddressLink(address) {
  return `https://amoy.polygonscan.com/address/${address}`;
}

export function explorerBlockLink(blockNumber) {
  return `https://amoy.polygonscan.com/block/${blockNumber}`;
}

// ─────────────────────────────────────────────────────────────
// PARSE REVERT REASON — extract human-readable error from tx
// ─────────────────────────────────────────────────────────────
export function parseRevertReason(err) {
  if (!err) return 'Unknown error';

  // User rejected in wallet
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') return 'Transaction rejected by user.';

  // ethers v6 error data
  if (err.reason) return err.reason;
  if (err.revert?.name) return err.revert.name;

  // ABI-decoded custom errors from our contracts
  const knownErrors = {
    'CreditCapExceeded': 'Borrow amount exceeds your credit cap.',
    'InsufficientLiquidity': 'Pool has insufficient liquidity for this amount.',
    'PolicyVersionMismatch': 'Credit policy was updated. Refresh and try again.',
    'ZeroAmount': 'Amount must be greater than zero.',
    'LoanNotFound': 'Loan not found.',
    'LoanNotActive': 'Loan is not in Active or Overdue status.',
    'RepaymentExceedsDebt': 'Repayment amount exceeds outstanding debt.',
    'NotBorrower': 'Only the original borrower can repay this loan.',
    'WithdrawExceedsBalance': 'Withdrawal exceeds your deposited balance.',
  };

  const msg = err.message || String(err);
  for (const [selector, human] of Object.entries(knownErrors)) {
    if (msg.includes(selector)) return human;
  }

  // Gas estimation failure — pull the revert from the message
  const match = msg.match(/reason="([^"]+)"/) || msg.match(/reverted with reason string '([^']+)'/);
  if (match) return match[1];

  // Fallback: return first 200 chars
  return msg.slice(0, 200);
}

// ─────────────────────────────────────────────────────────────
// CREDIT PRE-FLIGHT — read on-chain credit before borrow UI
// ─────────────────────────────────────────────────────────────
export async function fetchCreditPreFlight(address) {
  const provider = getReadProvider();
  const policy = getCreditPolicy(provider);
  const pool = getLendingPool(provider);
  const token = getFundryxToken(provider);

  const [eligibility, available, fdxBalance, lenderBalance, policyVer] = await Promise.all([
    policy.previewEligibility(address).catch(() => ({ maxCredit: 0n, version: 1, repaymentCount: 0n, outstandingExposure: 0n })),
    pool.availableLiquidity().catch(() => 0n),
    token.balanceOf(address).catch(() => 0n),
    pool.lenderBalances(address).catch(() => 0n),
    policy.policyVersion().catch(() => 1),
  ]);

  const maxCredit = Number(ethers.formatEther(
    typeof eligibility.maxCredit === 'bigint' ? eligibility.maxCredit : (eligibility[0] ?? 0n)
  ));
  const effectiveBorrowLimit = Math.min(maxCredit, Number(ethers.formatEther(available)));

  return {
    maxCredit,
    effectiveBorrowLimit,
    availableLiquidity: Number(ethers.formatEther(available)),
    fdxBalance: Number(ethers.formatEther(fdxBalance)),
    lenderBalance: Number(ethers.formatEther(lenderBalance)),
    policyVersion: Number(typeof eligibility.version === 'bigint' ? eligibility.version : (eligibility[1] ?? policyVer)),
    repaymentCount: Number(typeof eligibility.repaymentCount === 'bigint' ? eligibility.repaymentCount : (eligibility[2] ?? 0n)),
  };
}

// ─────────────────────────────────────────────────────────────
// TESTNET MOCK SWAP — constant-product x*y=k with FDX & mock POL
// No external DEX exists on Polygon Amoy. This is a clearly labeled
// test-only implementation. In production, integrate QuickSwap V3 on mainnet.
// ─────────────────────────────────────────────────────────────

// MockSwapRouter deployed address — set after deployment
// If not deployed yet, MOCK_SWAP_ROUTER will be null and swap will show "not available"
export const MOCK_SWAP_ROUTER_ADDRESS = import.meta.env.VITE_MOCK_SWAP_ROUTER || null;

export const MOCK_SWAP_ROUTER_ABI = [
  'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to) external returns (uint256 amountOut)',
  'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, uint256 priceImpactBps)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external',
  'function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB)',
  'event Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, address to)',
];

export function getMockSwapRouter(signerOrProvider) {
  if (!MOCK_SWAP_ROUTER_ADDRESS) return null;
  return new ethers.Contract(MOCK_SWAP_ROUTER_ADDRESS, MOCK_SWAP_ROUTER_ABI, signerOrProvider);
}

export async function executeSwap(signer, tokenInAddress, tokenOutAddress, amountIn, slippageBps = 50) {
  if (!MOCK_SWAP_ROUTER_ADDRESS) {
    throw new Error('[Testnet] No swap router deployed. Deploy MockSwapRouter.sol to Polygon Amoy first.');
  }

  const provider = signer.provider;
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Wrong network. Switch to Polygon Amoy (chain ${CHAIN_ID}).`);
  }

  const address = await signer.getAddress();
  const router = getMockSwapRouter(signer);
  const tokenIn = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
  const amountInWei = ethers.parseEther(amountIn.toString());

  // Balance check
  const balance = await tokenIn.balanceOf(address).catch(() => 0n);
  if (balance < amountInWei) {
    throw new Error(`Insufficient token balance. Have ${ethers.formatEther(balance)}, need ${amountIn}.`);
  }

  // Get expected output with slippage
  const [expectedOut, priceImpact] = await router.getAmountOut(tokenInAddress, tokenOutAddress, amountInWei);
  const minOut = expectedOut * BigInt(10000 - slippageBps) / 10000n;

  // Approve router
  const allowance = await tokenIn.allowance(address, MOCK_SWAP_ROUTER_ADDRESS);
  if (allowance < amountInWei) {
    const approveTx = await tokenIn.approve(MOCK_SWAP_ROUTER_ADDRESS, ethers.MaxUint256).catch((err) => {
      throw new Error(`Approval failed: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  // Deadline: 20 minutes from now (not used in MockSwapRouter but pattern established)
  const tx = await router.swap(tokenInAddress, tokenOutAddress, amountInWei, minOut, address).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Swap reverted on-chain.');

  // Read output balance
  const tokenOut = new ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
  const newOutBalance = await tokenOut.balanceOf(address).catch(() => 0n);

  return {
    tx,
    receipt,
    amountOut: ethers.formatEther(expectedOut),
    priceImpact: Number(priceImpact) / 100,
    newOutBalance: ethers.formatEther(newOutBalance),
    explorerUrl: explorerTxLink(tx.hash),
  };
}
