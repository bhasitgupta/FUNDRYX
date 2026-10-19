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
  'function grantRole(bytes32 role, address account) external',
  'function revokeRole(bytes32 role, address account) external',
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

// ─────────────────────────────────────────────────────────────
// WALLET CONNECTION
// ─────────────────────────────────────────────────────────────
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask or Web3 wallet not detected. Please install MetaMask.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  // Switch to Polygon Amoy if needed
  if (network.chainId !== BigInt(CHAIN_ID)) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_AMOY_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
    // Re-init after chain switch
    const updatedProvider = new ethers.BrowserProvider(window.ethereum);
    const updatedSigner = await updatedProvider.getSigner();
    const updatedNetwork = await updatedProvider.getNetwork();
    const balance = await updatedProvider.getBalance(accounts[0]);
    return {
      address: accounts[0],
      signer: updatedSigner,
      provider: updatedProvider,
      balance: ethers.formatEther(balance),
      chainId: Number(updatedNetwork.chainId),
      isDemo: false,
    };
  }

  const balance = await provider.getBalance(accounts[0]);

  return {
    address: accounts[0],
    signer,
    provider,
    balance: ethers.formatEther(balance),
    chainId: Number(network.chainId),
    isDemo: false,
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

  return loans.filter(Boolean).map(l => ({
    loanId: Number(l.loanId),
    borrower: l.borrower,
    principalInitial: Number(ethers.formatEther(l.principalInitial)),
    principalOutstanding: Number(ethers.formatEther(l.principalOutstanding)),
    feeAmount: Number(ethers.formatEther(l.feeAmount)),
    createdAt: Number(l.createdAt),
    dueAt: Number(l.dueAt),
    status: LOAN_STATUS[l.status] ?? 'Unknown',
    statusCode: Number(l.status),
    policyVersion: Number(l.policyVersion),
    dueDays: Math.ceil((Number(l.dueAt) - Date.now() / 1000) / 86400),
  }));
}

// ─────────────────────────────────────────────────────────────
// EXECUTE BORROW — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeBorrow(signer, amount, policyVersion) {
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  // Check allowance first
  const address = await signer.getAddress();
  const allowance = await token.allowance(address, CONTRACT_ADDRESSES.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(CONTRACT_ADDRESSES.LendingPool, ethers.MaxUint256);
    await approveTx.wait();
  }

  const tx = await pool.borrow(amountWei, policyVersion);
  const receipt = await tx.wait();
  return { tx, receipt };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE DEPOSIT — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeDeposit(signer, amount) {
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  const address = await signer.getAddress();
  const allowance = await token.allowance(address, CONTRACT_ADDRESSES.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(CONTRACT_ADDRESSES.LendingPool, ethers.MaxUint256);
    await approveTx.wait();
  }

  const tx = await pool.deposit(amountWei);
  const receipt = await tx.wait();
  return { tx, receipt };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE REPAY — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeRepay(signer, loanId, amount) {
  const pool = getLendingPool(signer);
  const token = getFundryxToken(signer);
  const amountWei = ethers.parseEther(amount.toString());

  const address = await signer.getAddress();
  const allowance = await token.allowance(address, CONTRACT_ADDRESSES.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(CONTRACT_ADDRESSES.LendingPool, ethers.MaxUint256);
    await approveTx.wait();
  }

  const tx = await pool.repay(loanId, amountWei);
  const receipt = await tx.wait();
  return { tx, receipt };
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
// MINT FDX — testnet helper for devs
// ─────────────────────────────────────────────────────────────
export async function mintTestTokens(signer, toAddress, amount) {
  const token = getFundryxToken(signer);
  const tx = await token.mint(toAddress, ethers.parseEther(amount.toString()));
  const receipt = await tx.wait();
  return { tx, receipt };
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
