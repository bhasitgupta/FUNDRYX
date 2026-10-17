import { ethers } from 'ethers';

export const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export const CONTRACT_ADDRESSES = {
  AccessManager: '0x230829f5EC30A1936fDECE13F1179381daaf69e8',
  PauseController: '0xF4d0F035900c313e44246ED473b3011E42192F77',
  FundryxToken: '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E',
  CreditHistoryRegistry: '0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d',
  CreditPolicy: '0x68fC6E11cD8a855849D7788e035BA92E320Db0d2',
  LendingPool: '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C',
  RiskAttestationRegistry: '0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC',
};

// Essential ABI definitions
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) external',
];

export const LENDING_POOL_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function borrow(uint256 amount, uint256 policyVersion) external returns (bytes32 loanId)',
  'function repay(bytes32 loanId, uint256 amount) external',
  'function totalDeposits() view returns (uint256)',
  'function totalBorrowed() view returns (uint256)',
  'function getBorrowerExposure(address borrower) view returns (uint256)',
  'function deposits(address user) view returns (uint256)',
  'function getAvailableLiquidity() view returns (uint256)',
];

export const CREDIT_POLICY_ABI = [
  'function eligibleCredit(address borrower) view returns (uint256)',
  'function currentPolicyVersion() view returns (uint256)',
  'function previewEligibility(address borrower) view returns (uint256 limit, uint256 currentExposure, uint256 available)',
];

export const CREDIT_HISTORY_ABI = [
  'function getBorrowerStats(address borrower) view returns (tuple(uint256 verifiedRepaymentCount, uint256 verifiedRepaidValue, uint256 outstandingExposure, uint256 defaultCount, uint256 lastUpdateAt, uint256 policyVersionLastEvaluated))',
];

export const RISK_REGISTRY_ABI = [
  'function isAttestationValid(bytes32 reportId) view returns (bool)',
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask or Web3 wallet not detected. Please install MetaMask.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  // Prompt switch to Polygon Amoy if needed
  if (network.chainId !== 80002n) {
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
      }
    }
  }

  const balance = await provider.getBalance(accounts[0]);

  return {
    address: accounts[0],
    signer,
    provider,
    balance: ethers.formatEther(balance),
    chainId: Number(network.chainId),
  };
}
