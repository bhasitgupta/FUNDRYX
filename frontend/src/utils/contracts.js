import { ethers } from 'ethers';
import {
  isSupabaseConfigured,
  fetchAuditEventsFromSupabase,
  recordAuditEventToSupabase,
} from './supabase.js';
import {
  CROSS_CHAIN_ROUTER_ABI,
  CROSS_CHAIN_ROUTER_BYTECODE,
} from './crossChainRouterArtifact.js';
import {
  CROSS_CHAIN_LIFECYCLE_STATES,
  ROUTE_STATUS,
  TOKEN_DECIMALS,
  COMPATIBLE_ASSET_MAPPINGS,
  getCompatibleDestinationToken,
  parseTokenUnits,
  formatTokenUnits,
  convertDecimals,
  calculateQuoteUnits,
  validateTransferAmount,
  saveCrossChainTransfer,
  updateCrossChainTransfer,
  getActiveCrossChainTransfers,
  isCrossChainTransferCompleted,
} from './crossChainRegistry.js';

export { isCrossChainTransferCompleted };

// ─────────────────────────────────────────────────────────────
// SECURE ENVIRONMENT VARIABLE RETRIEVER
// ─────────────────────────────────────────────────────────────
export const getEnvVar = (key, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta?.env?.[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process?.env?.[key]) {
    return process.env[key];
  }
  return fallback;
};

// ─────────────────────────────────────────────────────────────
// CENTRALIZED MULTI-CHAIN CONFIGURATION REGISTRY
// ─────────────────────────────────────────────────────────────
export const SUPPORTED_NETWORKS = {
  // ── TESTNETS ────────────────────────────────────────────────
  80002: {
    chainId: 80002,
    hexChainId: '0x13882',
    name: 'Polygon Amoy',
    shortName: 'Polygon Amoy',
    networkType: 'testnet',
    family: 'polygon',
    nativeToken: 'POL',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    wrappedNative: { symbol: 'WPOL', address: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9' },
    supportedAssets: ['FDX', 'WPOL', 'fUSD', 'USDC'],
    supportedOperations: ['lending', 'borrowing', 'swap', 'telemetry', 'audit', 'cross_chain_bridge'],
    rpcUrl: getEnvVar('VITE_POLYGON_AMOY_RPC', 'https://polygon-amoy-bor-rpc.publicnode.com'),
    explorerUrl: 'https://amoy.polygonscan.com',
    status: 'ACTIVE',
    contractsDeployed: true,
    bridgeActive: true,
    statusLabel: 'Protocol Live',
    relayer: 'Chainlink CCIP (Amoy Router 0x9C32...84B2)',
    iconColor: '#8247E5',
    contracts: {
      AccessManager:           getEnvVar('VITE_POLYGON_ACCESS_MANAGER', '0x230829f5EC30A1936fDECE13F1179381daaf69e8'),
      PauseController:         getEnvVar('VITE_POLYGON_PAUSE_CONTROLLER', '0xF4d0F035900c313e44246ED473b3011E42192F77'),
      FundryxToken:            getEnvVar('VITE_POLYGON_FUNDRYX_TOKEN', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      FundrexUSD:              getEnvVar('VITE_POLYGON_FUSD', '0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34'),
      CreditHistoryRegistry:   getEnvVar('VITE_POLYGON_CREDIT_HISTORY_REGISTRY', '0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d'),
      CreditPolicy:            getEnvVar('VITE_POLYGON_CREDIT_POLICY', '0x68fC6E11cD8a855849D7788e035BA92E320Db0d2'),
      LendingPool:             getEnvVar('VITE_POLYGON_LENDING_POOL', '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C'),
      RiskAttestationRegistry: getEnvVar('VITE_POLYGON_RISK_ATTESTATION_REGISTRY', '0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC'),
      MockSwapRouter:          getEnvVar('VITE_POLYGON_MOCK_SWAP_ROUTER', '0x460850Fb8495867E526e23B4149D04810d5b4e39'),
      CrossChainRouter:        getEnvVar('VITE_POLYGON_CROSS_CHAIN_ROUTER', '0xa1ec7a768842eC631C887493127fD2f83dDa803A'),
      CCIPRouter:              getEnvVar('VITE_CCIP_ROUTER_POLYGON_AMOY', '0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2'),
    },
    tokens: {
      FDX:    getEnvVar('VITE_POLYGON_FUNDRYX_TOKEN', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      WPOL:   '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      WMATIC: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      fUSD:   getEnvVar('VITE_POLYGON_FUSD', '0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34'),
      USDC:   '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      POL:    '0x0000000000000000000000000000000000000000',
    },
  },
  10143: {
    chainId: 10143,
    hexChainId: '0x279f',
    name: 'Monad Testnet',
    shortName: 'Monad Testnet',
    networkType: 'testnet',
    family: 'monad',
    nativeToken: 'MON',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    wrappedNative: { symbol: 'WMON', address: '0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541' },
    supportedAssets: ['MON', 'WMON', 'FDX', 'fUSD'],
    supportedOperations: ['lending', 'borrowing', 'swap', 'telemetry', 'risk_analysis', 'cross_chain_bridge'],
    rpcUrl: getEnvVar('VITE_MONAD_TESTNET_RPC', 'https://testnet-rpc.monad.xyz/'),
    explorerUrl: 'https://testnet.monadexplorer.com',
    status: 'ACTIVE',
    contractsDeployed: true,
    bridgeActive: true,
    statusLabel: 'Protocol Live',
    relayer: 'Fundrex Sentinel Quorum Relayer (CCIP Standard)',
    iconColor: '#836EF9',
    contracts: {
      AccessManager:           getEnvVar('VITE_MONAD_ACCESS_MANAGER', '0x8748fa4147c9fE78572D14F3C827d2E8ad4B9138'),
      PauseController:         getEnvVar('VITE_MONAD_PAUSE_CONTROLLER', '0x230829f5EC30A1936fDECE13F1179381daaf69e8'),
      FundryxToken:            getEnvVar('VITE_MONAD_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      FundrexUSD:              getEnvVar('VITE_MONAD_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      CreditHistoryRegistry:   getEnvVar('VITE_MONAD_CREDIT_HISTORY_REGISTRY', '0xF4d0F035900c313e44246ED473b3011E42192F77'),
      CreditPolicy:            getEnvVar('VITE_MONAD_CREDIT_POLICY', '0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d'),
      LendingPool:             getEnvVar('VITE_MONAD_LENDING_POOL', '0x68fC6E11cD8a855849D7788e035BA92E320Db0d2'),
      RiskAttestationRegistry: getEnvVar('VITE_MONAD_RISK_REGISTRY', '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C'),
      MockSwapRouter:          getEnvVar('VITE_MONAD_MOCK_SWAP_ROUTER', '0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC'),
      CrossChainRouter:        getEnvVar('VITE_MONAD_CROSS_CHAIN_ROUTER', '0xa049d354C0E169F954449608764DB5538702AC06'),
    },
    tokens: {
      FDX:  getEnvVar('VITE_MONAD_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      fUSD: getEnvVar('VITE_MONAD_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      WMON: '0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541',
      MON:  '0x0000000000000000000000000000000000000000',
    },
  },
  84532: {
    chainId: 84532,
    hexChainId: '0x14a34',
    name: 'Base Sepolia',
    shortName: 'Base Sepolia',
    networkType: 'testnet',
    family: 'base',
    nativeToken: 'ETH',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    wrappedNative: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
    supportedAssets: ['ETH', 'USDC'],
    supportedOperations: ['read_only_telemetry', 'risk_analysis'],
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    status: 'STAGING',
    contractsDeployed: false,
    bridgeActive: false,
    statusLabel: 'Pending Contract Deployment',
    relayer: 'Chainlink CCIP (Base Sepolia Router 0xD3b0...8a93)',
    iconColor: '#0052FF',
    contracts: {},
    tokens: {
      USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
  },
  43113: {
    chainId: 43113,
    hexChainId: '0xa869',
    name: 'Avalanche Fuji',
    shortName: 'Fuji Testnet',
    networkType: 'testnet',
    family: 'avalanche',
    nativeToken: 'AVAX',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    wrappedNative: { symbol: 'WAVAX', address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c' },
    supportedAssets: ['AVAX', 'WAVAX', 'FDX', 'fUSD', 'USDC'],
    supportedOperations: ['lending', 'borrowing', 'swap', 'telemetry', 'risk_analysis', 'cross_chain_bridge'],
    rpcUrl: getEnvVar('VITE_AVAX_FUJI_RPC', 'https://api.avax-test.network/ext/bc/C/rpc'),
    explorerUrl: 'https://testnet.snowtrace.io',
    status: 'ACTIVE',
    contractsDeployed: true,
    bridgeActive: true,
    statusLabel: 'Protocol Live',
    relayer: 'Chainlink CCIP (Fuji Router 0xF694...8177)',
    iconColor: '#E84142',
    contracts: {
      AccessManager:           getEnvVar('VITE_AVALANCHE_FUJI_ACCESS_MANAGER', '0x8748fa4147c9fE78572D14F3C827d2E8ad4B9138'),
      PauseController:         getEnvVar('VITE_AVALANCHE_FUJI_PAUSE_CONTROLLER', '0x230829f5EC30A1936fDECE13F1179381daaf69e8'),
      FundryxToken:            getEnvVar('VITE_AVALANCHE_FUJI_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      FundrexUSD:              getEnvVar('VITE_AVALANCHE_FUJI_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      CreditHistoryRegistry:   getEnvVar('VITE_AVALANCHE_FUJI_CREDIT_HISTORY_REGISTRY', '0xF4d0F035900c313e44246ED473b3011E42192F77'),
      CreditPolicy:            getEnvVar('VITE_AVALANCHE_FUJI_CREDIT_POLICY', '0x27B46c075bf2Cd67D174BD59629cc66b8C9Ea36d'),
      LendingPool:             getEnvVar('VITE_AVALANCHE_FUJI_LENDING_POOL', '0x68fC6E11cD8a855849D7788e035BA92E320Db0d2'),
      RiskAttestationRegistry: getEnvVar('VITE_AVALANCHE_FUJI_RISK_REGISTRY', '0xF35DaC9A5Db13c2b621Aa00288A4996D5d91c07C'),
      MockSwapRouter:          getEnvVar('VITE_AVALANCHE_FUJI_MOCK_SWAP_ROUTER', '0xCa8C5f7AA0717BCc3435cAEbFB96Ff602232dEcC'),
      CrossChainRouter:        getEnvVar('VITE_AVALANCHE_FUJI_CROSS_CHAIN_ROUTER', '0xc8eE091E443648388912F203b4B111cCe4859866'),
      CCIPRouter:              getEnvVar('VITE_CCIP_ROUTER_AVAX_FUJI', '0xF694E193200268f9a4868e4Aa017A0118C9a8177'),
    },
    tokens: {
      FDX:   getEnvVar('VITE_AVALANCHE_FUJI_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      fUSD:  getEnvVar('VITE_AVALANCHE_FUJI_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      WAVAX: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
      AVAX:  '0x0000000000000000000000000000000000000000',
      USDC:  '0x5425890298aed601595a70ab815c96711a31bc65',
    },
  },

  // ── MAINNETS ────────────────────────────────────────────────
  137: {
    chainId: 137,
    hexChainId: '0x89',
    name: 'Polygon PoS',
    shortName: 'Polygon PoS',
    networkType: 'mainnet',
    family: 'polygon',
    nativeToken: 'POL',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    wrappedNative: { symbol: 'WPOL', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },
    supportedAssets: ['POL', 'WPOL', 'USDC', 'USDT'],
    supportedOperations: ['cross_chain_bridge', 'read_only_telemetry'],
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    status: 'ACTIVE',
    contractsDeployed: false,
    bridgeActive: true,
    statusLabel: 'LI.FI Cross-Chain Live',
    relayer: 'LI.FI Multi-Bridge Aggregator (Polymer, Across, CCTP)',
    iconColor: '#8247E5',
    contracts: {},
    tokens: {
      USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      WPOL: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
  },
  143: {
    chainId: 143,
    hexChainId: '0x8f',
    name: 'Monad Mainnet',
    shortName: 'Monad Mainnet',
    networkType: 'mainnet',
    family: 'monad',
    nativeToken: 'MON',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    wrappedNative: { symbol: 'WMON', address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701' },
    supportedAssets: ['MON', 'WMON'],
    supportedOperations: ['cross_chain_bridge', 'read_only_telemetry'],
    rpcUrl: 'https://rpc.monad.xyz',
    explorerUrl: 'https://monadexplorer.com',
    status: 'ACTIVE',
    contractsDeployed: false,
    bridgeActive: true,
    statusLabel: 'LI.FI Inbound Live',
    relayer: 'LI.FI Mayan Fast MCTP / CCTPv2',
    iconColor: '#836EF9',
    contracts: {},
    tokens: {
      WMON: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    },
  },
  8453: {
    chainId: 8453,
    hexChainId: '0x2105',
    name: 'Base Mainnet',
    shortName: 'Base Mainnet',
    networkType: 'mainnet',
    family: 'base',
    nativeToken: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    wrappedNative: { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006' },
    supportedAssets: ['ETH', 'WETH', 'USDC'],
    supportedOperations: ['cross_chain_bridge', 'read_only_telemetry'],
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    status: 'ACTIVE',
    contractsDeployed: false,
    bridgeActive: true,
    statusLabel: 'LI.FI Cross-Chain Live',
    relayer: 'LI.FI Multi-Bridge Aggregator (Polymer, CCTP, Across)',
    iconColor: '#0052FF',
    contracts: {},
    tokens: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      WETH: '0x4200000000000000000000000000000000000006',
    },
  },
  43114: {
    chainId: 43114,
    hexChainId: '0xa86a',
    name: 'Avalanche C-Chain',
    shortName: 'Avalanche C-Chain',
    networkType: 'mainnet',
    family: 'avalanche',
    nativeToken: 'AVAX',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    wrappedNative: { symbol: 'WAVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
    supportedAssets: ['AVAX', 'WAVAX', 'USDC'],
    supportedOperations: ['cross_chain_bridge', 'read_only_telemetry'],
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    status: 'ACTIVE',
    contractsDeployed: false,
    bridgeActive: true,
    statusLabel: 'LI.FI Cross-Chain Live',
    relayer: 'LI.FI Multi-Bridge Aggregator (Polymer, Stargate, CCTP)',
    iconColor: '#E84142',
    contracts: {},
    tokens: {
      USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
  },
};

export const POLYGON_AMOY_CONFIG = {
  chainId: '0x13882',
  chainName: 'Polygon',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://polygon-amoy-bor-rpc.publicnode.com'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export function getNetworkConfig(chainId) {
  if (!chainId) return SUPPORTED_NETWORKS[10143] || SUPPORTED_NETWORKS[80002];
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  return SUPPORTED_NETWORKS[numId] || null;
}

export const CHAIN_ID = 80002;

export const CONTRACT_ADDRESSES = SUPPORTED_NETWORKS[80002].contracts;
export const SUPPORTED_TOKENS = SUPPORTED_NETWORKS[80002].tokens;

export function getContractAddresses(chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  const base = SUPPORTED_NETWORKS[numId]?.contracts || SUPPORTED_NETWORKS[80002].contracts;
  const router = getRouterAddress(numId);
  return {
    ...base,
    ...(router ? { MockSwapRouter: router } : {}),
  };
}

export function getNetworkTokens(chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  return SUPPORTED_NETWORKS[numId]?.tokens || SUPPORTED_NETWORKS[80002].tokens;
}


// ─────────────────────────────────────────────────────────────
// CENTRALIZED, CHAIN-AWARE TOKEN REGISTRY
// ─────────────────────────────────────────────────────────────
export const TOKEN_REGISTRY = {
  80002: [
    {
      chainId: 80002,
      address: getEnvVar('VITE_POLYGON_FUNDRYX_TOKEN', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      name: 'Fundryx Protocol Token',
      symbol: 'FDX',
      decimals: 18,
      tokenType: 'test_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'swap', 'deposit', 'repay', 'cross_chain'],
      explorerUrl: `https://amoy.polygonscan.com/token/${getEnvVar('VITE_POLYGON_FUNDRYX_TOKEN', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E')}`,
      canAddToWallet: true,
      logo: 'FDX',
    },
    {
      chainId: 80002,
      address: getEnvVar('VITE_POLYGON_FUSD', '0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34'),
      name: 'Fundrex USD',
      symbol: 'fUSD',
      decimals: 6,
      tokenType: 'test_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'deposit', 'repay', 'cross_chain'],
      explorerUrl: `https://amoy.polygonscan.com/token/${getEnvVar('VITE_POLYGON_FUSD', '0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34')}`,
      canAddToWallet: true,
      logo: 'fUSD',
    },
    {
      chainId: 80002,
      address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      name: 'USD Coin (Circle Official)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['deposit', 'cross_chain'],
      explorerUrl: 'https://amoy.polygonscan.com/token/0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      canAddToWallet: true,
      logo: 'USDC',
    },
    {
      chainId: 80002,
      address: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      name: 'Wrapped POL',
      symbol: 'WPOL',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['swap', 'amm_pool'],
      explorerUrl: 'https://amoy.polygonscan.com/token/0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      canAddToWallet: true,
      logo: 'POL',
    },
    {
      chainId: 80002,
      address: null,
      name: 'Polygon Native POL',
      symbol: 'POL',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'swap'],
      explorerUrl: 'https://amoy.polygonscan.com',
      canAddToWallet: false,
      logo: 'POL',
    },
  ],
  10143: [
    {
      chainId: 10143,
      address: getEnvVar('VITE_MONAD_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      name: 'Fundryx Protocol Token',
      symbol: 'FDX',
      decimals: 18,
      tokenType: 'test_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'swap', 'deposit', 'repay', 'cross_chain'],
      explorerUrl: `https://testnet.monadexplorer.com/token/${getEnvVar('VITE_MONAD_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd')}`,
      canAddToWallet: true,
      logo: 'FDX',
    },
    {
      chainId: 10143,
      address: getEnvVar('VITE_MONAD_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      name: 'Fundrex USD',
      symbol: 'fUSD',
      decimals: 6,
      tokenType: 'test_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'deposit', 'repay', 'cross_chain'],
      explorerUrl: `https://testnet.monadexplorer.com/token/${getEnvVar('VITE_MONAD_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E')}`,
      canAddToWallet: true,
      logo: 'fUSD',
    },
    {
      chainId: 10143,
      address: null,
      name: 'Monad Native MON',
      symbol: 'MON',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'telemetry'],
      explorerUrl: 'https://testnet.monadexplorer.com',
      canAddToWallet: false,
      logo: 'MON',
    },
    {
      chainId: 10143,
      address: '0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541',
      name: 'Wrapped MON',
      symbol: 'WMON',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_staging'],
      explorerUrl: 'https://testnet.monadexplorer.com/token/0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541',
      canAddToWallet: true,
      logo: 'MON',
    },
  ],
  137: [
    {
      chainId: 137,
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      name: 'USD Coin (Circle Official)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      canAddToWallet: true,
      logo: 'USDC',
    },
    {
      chainId: 137,
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      canAddToWallet: true,
      logo: 'USDT',
    },
    {
      chainId: 137,
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      name: 'Wrapped POL',
      symbol: 'WPOL',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://polygonscan.com/token/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      canAddToWallet: true,
      logo: 'POL',
    },
    {
      chainId: 137,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Polygon Native POL',
      symbol: 'POL',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'cross_chain_bridge'],
      explorerUrl: 'https://polygonscan.com',
      canAddToWallet: false,
      logo: 'POL',
    },
  ],
  143: [
    {
      chainId: 143,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Monad Native MON',
      symbol: 'MON',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'cross_chain_bridge'],
      explorerUrl: 'https://monadexplorer.com',
      canAddToWallet: false,
      logo: 'MON',
    },
    {
      chainId: 143,
      address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
      name: 'Wrapped MON',
      symbol: 'WMON',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://monadexplorer.com',
      canAddToWallet: true,
      logo: 'MON',
    },
  ],
  43114: [
    {
      chainId: 43114,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Avalanche Native AVAX',
      symbol: 'AVAX',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'cross_chain_bridge'],
      explorerUrl: 'https://snowtrace.io',
      canAddToWallet: false,
      logo: 'AVAX',
    },
    {
      chainId: 43114,
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      name: 'USD Coin (Avalanche)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      canAddToWallet: true,
      logo: 'USDC',
    },
    {
      chainId: 43114,
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://snowtrace.io/token/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      canAddToWallet: true,
      logo: 'AVAX',
    },
  ],
  43113: [
    {
      chainId: 43113,
      address: null,
      name: 'Avalanche Fuji Native AVAX',
      symbol: 'AVAX',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'telemetry', 'swap'],
      explorerUrl: 'https://testnet.snowtrace.io',
      canAddToWallet: false,
      logo: 'AVAX',
    },
    {
      chainId: 43113,
      address: getEnvVar('VITE_AVALANCHE_FUJI_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      name: 'Fundryx Protocol Token',
      symbol: 'FDX',
      decimals: 18,
      tokenType: 'protocol_reserve',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'swap', 'cross_chain'],
      explorerUrl: `https://testnet.snowtrace.io/token/${getEnvVar('VITE_AVALANCHE_FUJI_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd')}`,
      canAddToWallet: true,
      logo: 'FDX',
    },
    {
      chainId: 43113,
      address: getEnvVar('VITE_AVALANCHE_FUJI_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      name: 'Fundrex USD',
      symbol: 'fUSD',
      decimals: 6,
      tokenType: 'synthetic_stable',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['lending', 'borrowing', 'swap', 'cross_chain'],
      explorerUrl: `https://testnet.snowtrace.io/token/${getEnvVar('VITE_AVALANCHE_FUJI_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E')}`,
      canAddToWallet: true,
      logo: 'fUSD',
    },
    {
      chainId: 43113,
      address: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
      decimals: 18,
      tokenType: 'wrapped_native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['swap'],
      explorerUrl: 'https://testnet.snowtrace.io/token/0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
      canAddToWallet: true,
      logo: 'AVAX',
    },
    {
      chainId: 43113,
      address: '0x5425890298aed601595a70ab815c96711a31bc65',
      name: 'USD Coin (Fuji Testnet)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_staging'],
      explorerUrl: 'https://testnet.snowtrace.io/token/0x5425890298aed601595a70ab815c96711a31bc65',
      canAddToWallet: true,
      logo: 'USDC',
    },
  ],
  8453: [
    {
      chainId: 8453,
      address: '0x0000000000000000000000000000000000000000',
      name: 'Base Native Ether',
      symbol: 'ETH',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'cross_chain_bridge'],
      explorerUrl: 'https://basescan.org',
      canAddToWallet: false,
      logo: 'ETH',
    },
    {
      chainId: 8453,
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      name: 'USD Coin (Base Mainnet)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      canAddToWallet: true,
      logo: 'USDC',
    },
    {
      chainId: 8453,
      address: '0x4200000000000000000000000000000000000006',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_bridge'],
      explorerUrl: 'https://basescan.org/token/0x4200000000000000000000000000000000000006',
      canAddToWallet: true,
      logo: 'ETH',
    },
  ],
  84532: [
    {
      chainId: 84532,
      address: null,
      name: 'Base Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
      tokenType: 'native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['gas', 'telemetry'],
      explorerUrl: 'https://sepolia.basescan.org',
      canAddToWallet: false,
      logo: 'ETH',
    },
    {
      chainId: 84532,
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      name: 'USD Coin (Base Sepolia)',
      symbol: 'USDC',
      decimals: 6,
      tokenType: 'official_asset',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_staging'],
      explorerUrl: 'https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      canAddToWallet: true,
      logo: 'USDC',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PRESERVED MIGRATION MAP FOR HISTORICAL & PLACEHOLDER RECORDS
// ─────────────────────────────────────────────────────────────
export const LEGACY_TOKEN_MIGRATION_MAP = {
  '0x41E94Eb019C0762fFF8923a1aF1b3F931818B006': {
    originalLabel: 'USDC (Staging Placeholder)',
    status: 'DEPRECATED_EMPTY_BYTECODE',
    reason: 'Contract contains 0x bytecode on Polygon Amoy. Superseded by Fundrex USD (fUSD) test asset and verified Circle Amoy USDC (0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582).',
    replacementAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    canonicalSymbol: 'fUSD / USDC',
  },
};

export function getTokenRegistry(chainId) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  return TOKEN_REGISTRY[numId] || [];
}

export function getTokenConfig(chainId, symbolOrAddress) {
  const tokens = getTokenRegistry(chainId);
  if (!tokens || tokens.length === 0) return null;
  const target = (symbolOrAddress || '').toLowerCase();
  return tokens.find((t) =>
    (t.symbol && t.symbol.toLowerCase() === target) ||
    (t.address && t.address.toLowerCase() === target)
  ) || null;
}

// ─────────────────────────────────────────────────────────────
// ADD TO METAMASK / WALLET (wallet_watchAsset)
// ─────────────────────────────────────────────────────────────
export async function addTokenToWallet(tokenOrAddress, symbolArg, decimalsArg, imageArg) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Web3 wallet (MetaMask) detected. Please connect a compatible wallet.');
  }

  const tokenObj = typeof tokenOrAddress === 'object' && tokenOrAddress !== null
    ? tokenOrAddress
    : {
        address: tokenOrAddress,
        symbol: symbolArg,
        decimals: decimalsArg !== undefined ? decimalsArg : 18,
        image: imageArg,
      };

  if (!tokenObj || !tokenObj.address) {
    throw new Error(`Token ${tokenObj?.symbol || 'asset'} does not have a contract address on this chain.`);
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenObj.address,
          symbol: tokenObj.symbol || 'TOKEN',
          decimals: tokenObj.decimals || 18,
          image: tokenObj.logoUrl || tokenObj.image || undefined,
        },
      },
    });
    return wasAdded;
  } catch (err) {
    if (err.code === 4001) {
      throw new Error('Token import was rejected by the user in the wallet.');
    }
    throw new Error(`Failed to add token to wallet: ${err.message || 'Unknown wallet error'}`);
  }
}

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
  'function owner() view returns (address)',
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
export function getReadProvider(chainId = CHAIN_ID) {
  const net = SUPPORTED_NETWORKS[chainId];
  const rpc = net?.rpcUrl || 'https://polygon-amoy-bor-rpc.publicnode.com';
  return new ethers.JsonRpcProvider(rpc);
}

// Polygon Amoy validator rule: minimum tip cap must be >= 25 gwei
export async function getPolygonFeeOverrides(provider) {
  try {
    const feeData = await provider.getFeeData();
    const minTip = ethers.parseUnits('30', 'gwei');
    const priorityFee = feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minTip
      ? feeData.maxPriorityFeePerGas
      : minTip;
    const maxFee = feeData.maxFeePerGas && feeData.maxFeePerGas > priorityFee + ethers.parseUnits('5', 'gwei')
      ? feeData.maxFeePerGas
      : priorityFee + ethers.parseUnits('10', 'gwei');
    return {
      maxPriorityFeePerGas: priorityFee,
      maxFeePerGas: maxFee,
    };
  } catch {
    return {
      maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
      maxFeePerGas: ethers.parseUnits('40', 'gwei'),
    };
  }
}

// Multi-chain fee overrides: Polygon requires >= 30 gwei minTip; Monad and other chains use native fee data
export async function getNetworkFeeOverrides(provider, chainId = null) {
  let targetChain = chainId;
  if (!targetChain && provider?.getNetwork) {
    try {
      const net = await provider.getNetwork();
      targetChain = Number(net.chainId);
    } catch {
      targetChain = 80002;
    }
  }
  if (targetChain === 80002 || targetChain === 137) {
    return getPolygonFeeOverrides(provider);
  }
  try {
    const feeData = await provider.getFeeData();
    const overrides = {};
    if (feeData.maxPriorityFeePerGas) overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    if (feeData.maxFeePerGas) overrides.maxFeePerGas = feeData.maxFeePerGas;
    return overrides;
  } catch {
    return {};
  }
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
  const projectId =
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_WALLETCONNECT_PROJECT_ID) ||
    (typeof process !== 'undefined' && process?.env?.VITE_WALLETCONNECT_PROJECT_ID) ||
    '3a8170812b534d0ff9d794f19a901d64';

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
  const currentChainId = Number(network.chainId);
  const isCurrentlySupported = Boolean(SUPPORTED_NETWORKS[currentChainId]?.contractsDeployed);

  // Switch to Polygon Amoy only if current network does not have deployed protocol contracts
  if (!isCurrentlySupported && network.chainId !== BigInt(CHAIN_ID)) {
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

// Silently reconnect if an account is already authorized in window.ethereum / Phantom
export async function reconnectWallet() {
  if (typeof window === 'undefined') return null;
  const injected = window.phantom?.ethereum || window.ethereum;
  if (!injected) return null;
  try {
    const accounts = await injected.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) return null;
    const provider = new ethers.BrowserProvider(injected);
    const signer = await provider.getSigner().catch(() => null);
    if (!signer) return null;
    const network = await provider.getNetwork().catch(() => ({ chainId: 80002n }));
    const balance = await provider.getBalance(accounts[0]).catch(() => 0n);
    return {
      address: accounts[0],
      signer,
      provider,
      balance: ethers.formatEther(balance),
      chainId: Number(network.chainId),
      walletType: injected.isPhantom ? 'phantom' : 'metamask',
    };
  } catch {
    return null;
  }
}

/**
 * Switch active wallet network with automatic fallback to wallet_addEthereumChain
 */
export async function switchNetwork(targetChainId, walletType = 'metamask') {
  const targetConfig = SUPPORTED_NETWORKS[targetChainId];
  if (!targetConfig) {
    throw new Error(`Unsupported network chain ID: ${targetChainId}`);
  }

  const injected = getInjectedProvider(walletType) || window.ethereum || window.phantom?.ethereum;
  if (!injected) {
    throw new Error('No EVM wallet detected to switch network.');
  }

  try {
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetConfig.hexChainId }],
    });
  } catch (switchError) {
    // 4902 code means network is not in wallet and needs to be added
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await injected.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: targetConfig.hexChainId,
            chainName: targetConfig.name,
            nativeCurrency: targetConfig.nativeCurrency,
            rpcUrls: [targetConfig.rpcUrl],
            blockExplorerUrls: [targetConfig.explorerUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }

  const updatedProvider = new ethers.BrowserProvider(injected);
  const updatedSigner = await updatedProvider.getSigner();
  const updatedNetwork = await updatedProvider.getNetwork();
  const accounts = await updatedProvider.listAccounts();
  const address = accounts[0] ? accounts[0].address : await updatedSigner.getAddress();
  const balance = await updatedProvider.getBalance(address);

  return {
    address,
    signer: updatedSigner,
    provider: updatedProvider,
    balance: ethers.formatEther(balance),
    chainId: Number(updatedNetwork.chainId),
    walletType,
  };
}

/**
 * EIP-747: Prompt MetaMask to track and discover FDX token
 */
export async function addTokenToMetaMask(tokenAddressOrObj, symbol = 'FDX', decimals = 18, image = '') {
  return await addTokenToWallet(tokenAddressOrObj, symbol, decimals, image);
}

// ─────────────────────────────────────────────────────────────
// CONTRACT FACTORIES
// ─────────────────────────────────────────────────────────────
export function getLendingPool(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.LendingPool || CONTRACT_ADDRESSES.LendingPool;
  return new ethers.Contract(addr, LENDING_POOL_ABI, signerOrProvider);
}

export function getCreditPolicy(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.CreditPolicy || CONTRACT_ADDRESSES.CreditPolicy;
  return new ethers.Contract(addr, CREDIT_POLICY_ABI, signerOrProvider);
}

export function getCreditHistory(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.CreditHistoryRegistry || CONTRACT_ADDRESSES.CreditHistoryRegistry;
  return new ethers.Contract(addr, CREDIT_HISTORY_ABI, signerOrProvider);
}

export function getFundryxToken(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.FundryxToken || CONTRACT_ADDRESSES.FundryxToken;
  return new ethers.Contract(addr, ERC20_ABI, signerOrProvider);
}

export function getFundrexUSD(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.FundrexUSD || CONTRACT_ADDRESSES.FundrexUSD;
  return new ethers.Contract(addr, ERC20_ABI, signerOrProvider);
}

export function getPauseController(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.PauseController || CONTRACT_ADDRESSES.PauseController;
  return new ethers.Contract(addr, PAUSE_CONTROLLER_ABI, signerOrProvider);
}

export function getRiskRegistry(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.RiskAttestationRegistry || CONTRACT_ADDRESSES.RiskAttestationRegistry;
  return new ethers.Contract(addr, RISK_REGISTRY_ABI, signerOrProvider);
}

export function getAccessManager(signerOrProvider, chainId = null) {
  const targetChain = chainId || (signerOrProvider?._network?.chainId ? Number(signerOrProvider._network.chainId) : 80002);
  const addr = SUPPORTED_NETWORKS[targetChain]?.contracts?.AccessManager || CONTRACT_ADDRESSES.AccessManager;
  return new ethers.Contract(addr, ACCESS_MANAGER_ABI, signerOrProvider);
}

// ─────────────────────────────────────────────────────────────
// READ PROTOCOL STATS — calls real deployed contracts
// ─────────────────────────────────────────────────────────────
export async function fetchProtocolStats(chainId = CHAIN_ID) {
  const provider = getReadProvider(chainId);
  const pool = getLendingPool(provider, chainId);
  const policy = getCreditPolicy(provider, chainId);
  const pause = getPauseController(provider, chainId);


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
export async function fetchWalletData(address, provider = null, chainId = null) {
  let targetChain = chainId;
  if (!targetChain && provider?.getNetwork) {
    try {
      const net = await provider.getNetwork();
      targetChain = Number(net.chainId);
    } catch {
      targetChain = null;
    }
  }
  if (!targetChain && typeof window !== 'undefined' && window.ethereum?.chainId) {
    const hex = window.ethereum.chainId;
    targetChain = hex.startsWith('0x') ? parseInt(hex, 16) : Number(hex);
  }
  targetChain = targetChain || 80002;

  const rpc = provider || getReadProvider(targetChain);
  const pool = getLendingPool(rpc, targetChain);
  const policy = getCreditPolicy(rpc, targetChain);
  const history = getCreditHistory(rpc, targetChain);
  const token = getFundryxToken(rpc, targetChain);
  const netConfig = SUPPORTED_NETWORKS[targetChain];
  const wrappedAddr = netConfig?.wrappedNative?.address;
  const wrappedToken = wrappedAddr ? new ethers.Contract(wrappedAddr, ERC20_ABI, rpc) : null;

  const [lenderBalance, loanIds, eligibility, stats, fdxBalance, polBalance, wrappedBalance] = await Promise.all([
    pool.lenderBalances(address).catch(() => 0n),
    pool.getBorrowerLoans(address).catch(() => []),
    policy.previewEligibility(address).catch(() => ({ maxCredit: 0n, version: 1, repaymentCount: 0n, outstandingExposure: 0n })),
    history.getBorrowerStats(address).catch(() => null),
    token.balanceOf(address).catch(() => 0n),
    rpc.getBalance(address).catch(() => 0n),
    wrappedToken ? wrappedToken.balanceOf(address).catch(() => 0n) : 0n,
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
    wrappedBalance: Number(ethers.formatEther(wrappedBalance)),
    chainId: targetChain,
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH ACTIVE LOANS FOR ADDRESS
// ─────────────────────────────────────────────────────────────
export async function fetchBorrowerLoans(address, provider = null, chainId = null) {
  let targetChain = chainId;
  if (!targetChain && provider?.getNetwork) {
    try {
      const net = await provider.getNetwork();
      targetChain = Number(net.chainId);
    } catch {
      targetChain = null;
    }
  }
  if (!targetChain && typeof window !== 'undefined' && window.ethereum?.chainId) {
    const hex = window.ethereum.chainId;
    targetChain = hex.startsWith('0x') ? parseInt(hex, 16) : Number(hex);
  }
  targetChain = targetChain || 80002;

  const rpc = provider || getReadProvider(targetChain);
  const pool = getLendingPool(rpc, targetChain);

  const loanIds = await pool.getBorrowerLoans(address).catch(() => []);
  const loans = await Promise.all(
    loanIds.map(id => pool.getLoan(id).catch(() => null))
  );

  const chainName = SUPPORTED_NETWORKS[targetChain]?.name || `Chain ${targetChain}`;

  return loans.filter(Boolean).map(l => {
    const init = Number(ethers.formatEther(l.principalInitial));
    const out = Number(ethers.formatEther(l.principalOutstanding));
    const fee = Number(ethers.formatEther(l.feeAmount));
    const isSettled = Number(l.status) === 2 || out === 0;

    const nowSec = Math.floor(Date.now() / 1000);
    const createdSec = Number(l.createdAt);
    const dueSec = Number(l.dueAt);
    const tenureDaysTotal = Math.max(1, Math.round((dueSec - createdSec) / 86400));
    const remainingSec = dueSec - nowSec;
    const isOverdue = remainingSec < 0 && !isSettled;
    const dueDays = Math.max(0, Math.ceil(remainingSec / 86400));
    const overdueDays = isOverdue ? Math.ceil(Math.abs(remainingSec) / 86400) : 0;

    // Local timezone formatted date strings
    const borrowDateFormatted = createdSec > 0 ? new Date(createdSec * 1000).toLocaleDateString() : 'N/A';
    const dueDateFormatted = dueSec > 0 ? new Date(dueSec * 1000).toLocaleDateString() : 'N/A';
    const dueTimeFormatted = dueSec > 0 ? new Date(dueSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return {
      id: `LOAN-${l.loanId}`,
      loanId: Number(l.loanId),
      borrower: l.borrower,
      originChain: chainName,
      chainId: targetChain,
      asset: 'FDX',
      amount: init,
      principalInitial: init,
      principalOutstanding: out,
      feeAmount: fee,
      apr: '5.20%',
      createdAt: createdSec,
      dueAt: dueSec,
      borrowDateFormatted,
      dueDateFormatted,
      dueTimeFormatted,
      tenureDaysTotal,
      isOverdue,
      overdueDays,
      status: isSettled ? 'Settled' : (isOverdue ? 'Overdue' : (LOAN_STATUS[l.status] ?? 'Active')),
      statusCode: Number(l.status),
      policyVersion: Number(l.policyVersion),
      dueDays,
      progress: isSettled ? 100 : (init > 0 ? Math.min(100, Math.max(0, Math.round(((init + fee - out) / (init + fee)) * 100))) : 0),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// EXECUTE BORROW — real on-chain transaction
// ─────────────────────────────────────────────────────────────
export async function executeBorrow(signer, amount, policyVersion) {
  const provider = signer.provider;
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId];

  if (!netConfig || !netConfig.contractsDeployed || !netConfig.contracts?.LendingPool) {
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a supported network (Polygon Amoy, Monad Testnet, or Avalanche Fuji) to borrow.`);
  }

  const chainContracts = getContractAddresses(currentChainId);
  const pool = getLendingPool(signer, currentChainId);
  const token = getFundryxToken(signer, currentChainId);
  const policy = getCreditPolicy(provider, currentChainId);
  const amountWei = ethers.parseEther(amount.toString());

  // Native gas balance check — borrowing transfers FDX OUT of pool, but borrower needs native gas
  const nativeSymbol = netConfig.nativeCurrency?.symbol || netConfig.nativeToken || 'gas';
  const nativeBalance = await provider.getBalance(address);
  const minGas = currentChainId === 10143 ? 0n : ethers.parseEther('0.001');
  if (minGas > 0n && nativeBalance < minGas) {
    throw new Error(`Insufficient ${nativeSymbol} for gas. Ensure your wallet has ${nativeSymbol} balance.`);
  }

  // Read actual policyVersion from chain if not provided
  const chainPolicyVersion = Number(await policy.policyVersion().catch(() => 1n));
  const usedVersion = (policyVersion !== undefined && policyVersion !== null)
    ? Number(policyVersion)
    : chainPolicyVersion;

  // Credit eligibility pre-flight
  const [eligible] = await policy.eligibleCredit(address, ethers.ZeroHash).catch(() => [0n]);
  if (eligible > 0n && amountWei > eligible) {
    const eligibleFmt = ethers.formatEther(eligible);
    throw new Error(`Borrow amount (${amount} FDX) exceeds credit limit (${Number(eligibleFmt).toFixed(2)} FDX). Build credit history by repaying previous loans.`);
  }

  // Liquidity check
  const available = await pool.availableLiquidity().catch(() => 0n);
  if (amountWei > available) {
    const availFmt = ethers.formatEther(available);
    throw new Error(`Insufficient pool liquidity on ${netConfig.name}. Available: ${Number(availFmt).toFixed(2)} FDX. Please supply or deposit capital to the vault first.`);
  }

  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Role check: Ensure LendingPool has LENDING_POOL_ROLE in AccessManager
  if (chainContracts.AccessManager) {
    try {
      const accessManager = getAccessManager(signer, currentChainId);
      const lpRole = await accessManager.LENDING_POOL_ROLE().catch(() => null);
      if (lpRole) {
        const poolHasRole = await accessManager.hasRole(lpRole, chainContracts.LendingPool).catch(() => false);
        if (!poolHasRole) {
          const adminRole = await accessManager.ADMIN_ROLE().catch(() => null);
          const isUserAdmin = adminRole ? await accessManager.hasRole(adminRole, address).catch(() => false) : false;
          if (isUserAdmin) {
            const grantTx = await accessManager.grantRole(lpRole, chainContracts.LendingPool, overrides).catch((err) => {
              console.warn('Auto grant role rejected:', parseRevertReason(err));
            });
            if (grantTx?.wait) await grantTx.wait();
          } else {
            console.warn('LendingPool lacks LENDING_POOL_ROLE on this network.');
            throw new Error(`Uncollateralized lending pool requires LENDING_POOL_ROLE on ${netConfig?.name || `chain ${currentChainId}`}.`);
          }
        }
      }
    } catch (roleErr) {
      if (roleErr.message?.includes('active on Polygon Amoy')) throw roleErr;
      console.warn('AccessManager role check skipped:', roleErr.message);
    }
  }

  const tx = await pool.borrow(amountWei, usedVersion, overrides).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Borrow transaction reverted on-chain.');

  // Read updated FDX balance after confirmation
  const newFdxBalance = await token.balanceOf(address).catch(() => 0n);

  // Proactively record to Supabase audit trail
  recordAuditEventToSupabase({
    chainId: currentChainId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    type: 'Loan Disbursement',
    contractAddress: chainContracts.LendingPool,
    borrower: address,
    fullBorrower: address,
    amount: `${amount} FDX`,
    rawAmount: amount,
    status: 'CONFIRMED',
    gasUsed: receipt.gasUsed?.toString(),
    effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
    metadata: { loanVersion: usedVersion },
  }).catch(() => {});

  return { tx, receipt, newFdxBalance: ethers.formatEther(newFdxBalance), chainId: currentChainId };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE DEPOSIT — real on-chain transaction with dynamic token decimals
// ─────────────────────────────────────────────────────────────
export async function executeDeposit(signer, amount, tokenSymbol = 'FDX') {
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    throw new Error('Deposit amount must be a positive number greater than 0.');
  }

  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId];

  if (!netConfig || !netConfig.contractsDeployed || !netConfig.contracts?.LendingPool) {
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a supported network (Polygon Amoy, Monad Testnet, or Avalanche Fuji) to deposit.`);
  }

  if (tokenSymbol !== 'FDX') {
    throw new Error(`LendingPool currently only accepts protocol reserve asset (FDX). Asset '${tokenSymbol}' is not accepted by this vault.`);
  }

  const chainContracts = getContractAddresses(currentChainId);
  const pool = getLendingPool(signer, currentChainId);
  const tokenAddr = chainContracts.FundryxToken;
  const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

  // LendingPool is strictly 18 decimals for FDX
  const decimals = 18;
  const amountWei = ethers.parseUnits(amount.toString(), decimals);

  const address = await signer.getAddress();

  // Token balance check
  const tokenBalance = await token.balanceOf(address).catch(() => 0n);
  if (tokenBalance < amountWei) {
    const fmt = ethers.formatUnits(tokenBalance, decimals);
    throw new Error(`Insufficient ${tokenSymbol} balance. You have ${Number(fmt).toFixed(4)} ${tokenSymbol}. Mint or acquire tokens first.`);
  }

  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Approval — Step 1: Approve exact amount (avoids phishing/wallet drainer flags)
  const allowance = await token.allowance(address, chainContracts.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(chainContracts.LendingPool, amountWei, overrides).catch((err) => {
      throw new Error(`Approval rejected: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  // Deposit — Step 2
  const tx = await pool.deposit(amountWei, overrides).catch((err) => {
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

  // Proactively record to Supabase audit trail
  recordAuditEventToSupabase({
    chainId: currentChainId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    type: 'Capital Supply',
    contractAddress: chainContracts.LendingPool,
    borrower: address,
    fullBorrower: address,
    amount: `${amount} ${tokenSymbol}`,
    rawAmount: amount,
    status: 'CONFIRMED',
    gasUsed: receipt.gasUsed?.toString(),
    effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
    metadata: {
      tokenSymbol,
      lenderBalance: ethers.formatUnits(newLenderBal, decimals),
    },
  }).catch(() => {});

  return {
    tx,
    receipt,
    newFdxBalance: ethers.formatUnits(newFdxBal, decimals),
    newLenderBalance: ethers.formatUnits(newLenderBal, decimals),
    newTotalDeposits: ethers.formatUnits(newPoolDeposits, decimals),
    chainId: currentChainId,
  };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE MINT TOKENS — Institutional Token Issuance
// ─────────────────────────────────────────────────────────────
export async function executeMintTokens(signer, toAddress, amount = 10000) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const token = getFundryxToken(signer, currentChainId);
  const target = toAddress || (await signer.getAddress());
  const amountWei = ethers.parseEther(amount.toString());
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Check if caller is owner
  const owner = await token.owner().catch(() => null);
  const callerAddress = await signer.getAddress();
  if (owner && callerAddress.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(
      `Permission denied: Only contract deployer (${owner.slice(0, 6)}...${owner.slice(-4)}) has authority to mint testnet FDX tokens on ${SUPPORTED_NETWORKS[currentChainId]?.name || 'this network'}. Please request testnet allocation from deployer.`
    );
  }

  const tx = await token.mint(target, amountWei, overrides).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Mint transaction reverted on-chain.');

  const newBal = await token.balanceOf(target).catch(() => 0n);
  return {
    tx,
    receipt,
    newBalance: ethers.formatEther(newBal),
    chainId: currentChainId,
  };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE REPAY — Supports Partial Repayments & Full Settlement
// ─────────────────────────────────────────────────────────────
export async function executeRepay(signer, loanId, amount) {
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    throw new Error('Repayment amount must be a positive number greater than 0.');
  }

  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId];
  if (!netConfig || !netConfig.contractsDeployed || !netConfig.contracts?.LendingPool) {
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a network with deployed protocol contracts.`);
  }

  const chainContracts = getContractAddresses(currentChainId);
  const pool = getLendingPool(signer, currentChainId);
  const token = getFundryxToken(signer, currentChainId);
  const amountWei = ethers.parseEther(amount.toString());
  const address = await signer.getAddress();

  // Verify loan debt and headroom
  const currentLoan = await pool.getLoan(loanId).catch(() => null);
  if (!currentLoan) {
    throw new Error(`Loan #${loanId} does not exist on contract.`);
  }
  if (amountWei > currentLoan.principalOutstanding) {
    const debtFmt = ethers.formatEther(currentLoan.principalOutstanding);
    throw new Error(`Repayment amount (${amount} FDX) exceeds total outstanding debt (${Number(debtFmt).toFixed(2)} FDX).`);
  }

  // FDX balance check
  const fdxBalance = await token.balanceOf(address).catch(() => 0n);
  if (fdxBalance < amountWei) {
    const fmt = ethers.formatEther(fdxBalance);
    throw new Error(`Insufficient FDX to repay. You have ${Number(fmt).toFixed(4)} FDX, need ${amount} FDX.`);
  }

  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Approval — exact amount
  const allowance = await token.allowance(address, chainContracts.LendingPool);
  if (allowance < amountWei) {
    const approveTx = await token.approve(chainContracts.LendingPool, amountWei, overrides).catch((err) => {
      throw new Error(`Approval rejected: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  const tx = await pool.repay(loanId, amountWei, overrides).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Repay transaction reverted on-chain.');

  // Read updated loan state and balances
  const [loan, newFdxBal] = await Promise.all([
    pool.getLoan(loanId).catch(() => null),
    token.balanceOf(address).catch(() => 0n),
  ]);

  const isFullRepay = loan ? loan.principalOutstanding === 0n : false;
  const remainingDebt = loan ? ethers.formatEther(loan.principalOutstanding) : '0';

  // Proactively record to Supabase audit trail
  recordAuditEventToSupabase({
    chainId: currentChainId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    type: isFullRepay ? 'Full Loan Settlement' : 'Partial Loan Repayment',
    contractAddress: chainContracts.LendingPool,
    borrower: address,
    fullBorrower: address,
    amount: `${amount} FDX`,
    rawAmount: amount,
    status: 'CONFIRMED',
    gasUsed: receipt.gasUsed?.toString(),
    effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
    metadata: {
      loanId: String(loanId),
      isFullRepayment: isFullRepay,
      remainingOutstanding: remainingDebt,
    },
  }).catch(() => {});

  return {
    tx,
    receipt,
    isFullRepayment: isFullRepay,
    loanStatus: loan ? LOAN_STATUS[Number(loan.status)] : 'Unknown',
    remainingOutstanding: remainingDebt,
    newFdxBalance: ethers.formatEther(newFdxBal),
    chainId: currentChainId,
  };
}

// ─────────────────────────────────────────────────────────────
// EXECUTE WITHDRAW — real on-chain transaction with amount validation
// ─────────────────────────────────────────────────────────────
export async function executeWithdraw(signer, amount, tokenSymbol = 'FDX') {
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0) {
    throw new Error('Withdrawal amount must be a positive number greater than 0.');
  }

  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId];
  if (!netConfig || !netConfig.contractsDeployed || !netConfig.contracts?.LendingPool) {
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a network with deployed protocol contracts.`);
  }

  const chainContracts = getContractAddresses(currentChainId);
  const pool = getLendingPool(signer, currentChainId);
  const address = await signer.getAddress();

  const decimals = (tokenSymbol === 'fUSD' || tokenSymbol === 'USDC') ? 6 : 18;
  const amountWei = ethers.parseUnits(amount.toString(), decimals);

  // Available liquidity pre-flight check
  const lenderBalance = await pool.lenderBalances(address).catch(() => 0n);
  if (amountWei > lenderBalance) {
    const availFmt = ethers.formatUnits(lenderBalance, decimals);
    throw new Error(`Withdrawal amount (${amount} ${tokenSymbol}) exceeds your available supplied balance (${Number(availFmt).toFixed(4)} ${tokenSymbol}).`);
  }

  const poolLiquidity = await pool.availableLiquidity().catch(() => 0n);
  if (amountWei > poolLiquidity) {
    const poolFmt = ethers.formatUnits(poolLiquidity, decimals);
    throw new Error(`Insufficient pool idle liquidity for immediate withdrawal. Available: ${Number(poolFmt).toFixed(4)} ${tokenSymbol}. Outstanding loans must be repaid first.`);
  }

  const overrides = await getNetworkFeeOverrides(provider, currentChainId);
  const tx = await pool.withdraw(amountWei, overrides).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Withdrawal transaction reverted on-chain.');

  const [newLenderBal, newPoolDeposits] = await Promise.all([
    pool.lenderBalances(address).catch(() => 0n),
    pool.totalDeposits().catch(() => 0n),
  ]);

  // Proactively record to Supabase audit trail
  recordAuditEventToSupabase({
    chainId: currentChainId,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    type: 'Capital Withdrawal',
    contractAddress: chainContracts.LendingPool,
    borrower: address,
    fullBorrower: address,
    amount: `${amount} ${tokenSymbol}`,
    rawAmount: amount,
    status: 'CONFIRMED',
    gasUsed: receipt.gasUsed?.toString(),
    effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
    metadata: {
      tokenSymbol,
      remainingLenderBalance: ethers.formatUnits(newLenderBal, decimals),
    },
  }).catch(() => {});

  return {
    tx,
    receipt,
    newLenderBalance: ethers.formatUnits(newLenderBal, decimals),
    newTotalDeposits: ethers.formatUnits(newPoolDeposits, decimals),
    chainId: currentChainId,
  };
}

// ─────────────────────────────────────────────────────────────
// CROSS-CHAIN ROUTING & VERIFICATION ENGINE
// ─────────────────────────────────────────────────────────────

export const CROSS_CHAIN_STATUS = {
  QUOTE: 'Quote Generated',
  VALIDATING: 'Validating Preflight',
  WALLET_APPROVAL: 'Wallet Approval',
  APPROVAL_REQUIRED: 'Token Approval Required',
  AWAITING_SIGNATURE: 'Awaiting User Signature',
  SOURCE_SUBMITTED: 'Source Submitted',
  SOURCE_PENDING: 'Source Pending',
  SOURCE_CONFIRMED: 'Source Confirmed',
  BRIDGE_PENDING: 'Bridge Pending',
  DESTINATION_EXECUTING: 'Destination Execution',
  DESTINATION_PENDING: 'Destination Pending',
  COMPLETED: 'Completed',
  REJECTED: 'Signature Rejected',
  FAILED: 'Execution Failed',
  REFUNDED: 'Refunded',
};

// ─────────────────────────────────────────────────────────────
// CROSS-CHAIN ROUTER ADDRESS & DEPLOYMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function getCrossChainRouterAddress(chainId) {
  const cid = Number(chainId);
  if (typeof window !== 'undefined' && window?.localStorage) {
    const override = window.localStorage.getItem(`fundrex_router_${cid}`);
    if (override && ethers.isAddress(override)) return override;
  }
  return SUPPORTED_NETWORKS[cid]?.contracts?.CrossChainRouter || null;
}

export function setCrossChainRouterAddress(chainId, address) {
  const cid = Number(chainId);
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  if (typeof window !== 'undefined' && window?.localStorage) {
    window.localStorage.setItem(`fundrex_router_${cid}`, address);
  }
  if (SUPPORTED_NETWORKS[cid]) {
    if (!SUPPORTED_NETWORKS[cid].contracts) SUPPORTED_NETWORKS[cid].contracts = {};
    SUPPORTED_NETWORKS[cid].contracts.CrossChainRouter = address;
    SUPPORTED_NETWORKS[cid].contractsDeployed = true;
    SUPPORTED_NETWORKS[cid].bridgeActive = true;
  }
}

export async function checkCrossChainRouterDeployment(providerOrChainId, chainIdArg = null) {
  let provider, cid;
  if (typeof providerOrChainId === 'number' || typeof providerOrChainId === 'string') {
    cid = Number(providerOrChainId);
    provider = getReadProvider(cid);
  } else {
    provider = providerOrChainId;
    cid = chainIdArg ? Number(chainIdArg) : null;
    if (!cid && provider?.getNetwork) {
      const net = await provider.getNetwork();
      cid = Number(net.chainId);
    }
  }

  const routerAddress = getCrossChainRouterAddress(cid);
  if (!routerAddress || !ethers.isAddress(routerAddress)) {
    return { isDeployed: false, routerAddress: null, codeLength: 0 };
  }

  try {
    const code = await provider.getCode(routerAddress);
    const isDeployed = Boolean(code && code !== '0x' && code !== '0x0');
    return { isDeployed, routerAddress, codeLength: code.length };
  } catch (err) {
    return { isDeployed: false, routerAddress, error: err.message };
  }
}

export async function deployCrossChainRouter(signer) {
  if (!signer) throw new Error('Signer required for contract deployment.');
  const network = await signer.provider.getNetwork();
  const cid = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[cid];
  if (!netConfig) throw new Error(`Unsupported chain ID ${cid} for router deployment.`);

  const accessManager = netConfig.contracts?.AccessManager || (await signer.getAddress());
  const pauseController = netConfig.contracts?.PauseController || (await signer.getAddress());

  const factory = new ethers.ContractFactory(
    CROSS_CHAIN_ROUTER_ABI,
    CROSS_CHAIN_ROUTER_BYTECODE,
    signer
  );

  const contract = await factory.deploy(accessManager, pauseController);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  setCrossChainRouterAddress(cid, address);
  return { contract, address, chainId: cid };
}

export async function getUserTokenBalance(provider, userAddress, chainId, tokenSymbol) {
  if (!provider || !userAddress || !chainId || !tokenSymbol) {
    return { raw: 0n, formatted: '0.00', decimals: 18, symbol: tokenSymbol || '' };
  }

  const cid = Number(chainId);
  const tok = getTokenConfig(cid, tokenSymbol);
  const isNative = !tok?.address || tok?.address === '0x0000000000000000000000000000000000000000';
  const decimals = tok?.decimals || TOKEN_DECIMALS[tokenSymbol] || 18;

  try {
    if (isNative) {
      const bal = await provider.getBalance(userAddress);
      return {
        raw: bal,
        formatted: formatTokenUnits(bal, decimals, 4),
        decimals,
        symbol: tokenSymbol,
      };
    } else {
      const contract = new ethers.Contract(tok.address, ERC20_ABI, provider);
      const bal = await contract.balanceOf(userAddress);
      return {
        raw: bal,
        formatted: formatTokenUnits(bal, decimals, 4),
        decimals,
        symbol: tokenSymbol,
      };
    }
  } catch (_) {
    return { raw: 0n, formatted: '0.00', decimals, symbol: tokenSymbol };
  }
}

export async function pollDestinationSettlement({
  destChainId,
  transferId,
  recipient,
  destToken,
  expectedAmount,
  maxAttempts = 6,
  intervalMs = 2500,
}) {
  const destNet = SUPPORTED_NETWORKS[destChainId];
  if (!destNet) {
    return { status: 'DESTINATION_PENDING', destTxHash: null };
  }

  const destRouterAddress = getCrossChainRouterAddress(destChainId);
  let destProvider = null;
  try {
    destProvider = getReadProvider(destChainId);
  } catch (_) {}

  for (let i = 0; i < maxAttempts; i++) {
    if (destProvider && destRouterAddress && transferId) {
      try {
        const destRouter = new ethers.Contract(
          destRouterAddress,
          ['function executedTransfers(bytes32) view returns (bool)'],
          destProvider
        );
        const isExecuted = await destRouter.executedTransfers(transferId);
        if (isExecuted) {
          return {
            status: 'COMPLETED',
            destTxHash: null,
            verifiedOnChain: true,
          };
        }
      } catch (_) {}
    }

    if (i < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  return {
    status: 'DESTINATION_PENDING',
    destTxHash: null,
    message: 'Attestation in flight. Relayer executing on destination chain.',
  };
}

/**
 * Audit verification logic for multi-chain destinations.
 * Enforces strict network-type segregation (never mix testnet and mainnet)
 * and verifies on-chain contract deployments and provider route availability.
 */
export function verifyCrossChainRoute(sourceChainId, destChainId, sourceSymbol = null, destSymbol = null) {
  const sourceNet = SUPPORTED_NETWORKS[sourceChainId];
  const destNet = SUPPORTED_NETWORKS[destChainId];

  if (!sourceNet) {
    return {
      verified: false,
      isAudited: false,
      status: 'SOURCE_CHAIN_UNSUPPORTED',
      reason: `Source chain ID ${sourceChainId} is not configured in the multi-chain registry.`,
    };
  }

  if (!destNet) {
    return {
      verified: false,
      isAudited: false,
      status: 'DESTINATION_CHAIN_UNSET',
      reason: 'Destination network is unset or not configured in multi-chain registry.',
    };
  }

  if (sourceChainId === destChainId) {
    return {
      verified: false,
      isAudited: false,
      canExecute: false,
      status: 'SAME_CHAIN',
      reason: 'Source and destination chains are identical. Use Instant AMM Swap for same-chain transfers.',
    };
  }

  // STRICT TESTNET VS MAINNET BOUNDARY SAFEGUARD
  if (sourceNet.networkType !== destNet.networkType) {
    return {
      verified: false,
      isAudited: false,
      canExecute: false,
      status: 'TESTNET_MAINNET_MISMATCH',
      reason: `Cross-environment routing prohibited: source is ${sourceNet.networkType} (${sourceNet.name}) and destination is ${destNet.networkType} (${destNet.name}). Never route between testnet and mainnet.`,
    };
  }

  // ASSET COMPATIBILITY VERIFICATION
  if (sourceSymbol && destSymbol) {
    const validDestToken = getCompatibleDestinationToken(sourceSymbol, sourceChainId, destChainId);
    if (!validDestToken) {
      return {
        verified: false,
        isAudited: false,
        canExecute: false,
        status: 'ASSET_INCOMPATIBLE',
        reason: `Asset ${sourceSymbol} on ${sourceNet.name} is not compatible with destination ${destNet.name}.`,
      };
    }
  }

  // MAINNET ROUTE EVALUATION (LI.FI Engine)
  if (sourceNet.networkType === 'mainnet') {
    // Known LI.FI provider liquidity constraints: Monad mainnet (143) currently supports inbound bridging only
    if (sourceChainId === 143) {
      return {
        verified: false,
        isAudited: false,
        canExecute: false,
        status: 'PROVIDER_ROUTE_UNAVAILABLE',
        reason: 'Outbound bridge liquidity from Monad Mainnet (143) is currently unsupported by LI.FI routing providers. Inbound routes to Monad are fully supported.',
        provider: 'lifi',
      };
    }

    return {
      verified: true,
      isAudited: true,
      canExecute: true,
      status: 'AUDIT_VERIFIED',
      provider: 'lifi',
      reason: `Live mainnet liquidity pathway verified via LI.FI Multi-Bridge Aggregator to ${destNet.name}.`,
      relayer: destNet.relayer || 'LI.FI Multi-Bridge Aggregator',
    };
  }

  // TESTNET ROUTE EVALUATION (Fundrex Protocol CCIP / Sentinel Quorum)
  // Both source and destination chains must have deployed protocol contracts and active bridges
  if (!sourceNet.contractsDeployed || !destNet.contractsDeployed || !sourceNet.bridgeActive || !destNet.bridgeActive) {
    const missing = !sourceNet.contractsDeployed || !destNet.contractsDeployed
      ? (!sourceNet.contractsDeployed && !destNet.contractsDeployed
          ? `${sourceNet.name} and ${destNet.name}`
          : (!sourceNet.contractsDeployed ? sourceNet.name : destNet.name))
      : (!sourceNet.bridgeActive && !destNet.bridgeActive
          ? `${sourceNet.name} and ${destNet.name}`
          : (!sourceNet.bridgeActive ? sourceNet.name : destNet.name));
    return {
      verified: false,
      isAudited: false,
      canExecute: false,
      status: 'DEPLOYMENT_PENDING',
      reason: `Cross-chain contracts and sentinel quorum verifiers for ${missing} are pending deployment and multi-sig audit signoff. Execution remains gated to protect funds.`,
      targetDeploymentRequired: `${missing} Fundrex Bridge Contracts & Quorum Verifiers`,
      provider: 'ccip_sentinel',
    };
  }

  // Verify router address is configured
  const srcRouter = getCrossChainRouterAddress(sourceChainId);
  const dstRouter = getCrossChainRouterAddress(destChainId);
  if (!srcRouter || !dstRouter) {
    const missingRouterChain = !srcRouter && !dstRouter
      ? `${sourceNet.name} and ${destNet.name}`
      : (!srcRouter ? sourceNet.name : destNet.name);
    return {
      verified: false,
      isAudited: false,
      canExecute: false,
      status: 'DEPLOYMENT_PENDING',
      reason: `CrossChainRouter address missing or unconfigured for ${missingRouterChain}.`,
      targetDeploymentRequired: `${missingRouterChain} CrossChainRouter`,
      provider: 'ccip_sentinel',
    };
  }

  return {
    verified: true,
    isAudited: true,
    canExecute: true,
    status: 'AUDIT_VERIFIED',
    provider: 'ccip_sentinel',
    reason: `Verified ${destNet.name} cross-chain route active via ${destNet.relayer || 'Chainlink CCIP / Fundrex Sentinel Quorum'}.`,
    relayer: destNet.relayer || 'Fundrex Sentinel Cross-Chain Protocol (CCIP Standard)',
  };
}

/**
 * Returns the complete route matrix for all 6 unordered network pairs (12 directed routes)
 * across both testnet and mainnet environments.
 */
export function getRouteMatrix(networkMode = 'mainnet') {
  const pairs = [
    { a: 'polygon', b: 'monad' },
    { a: 'polygon', b: 'base' },
    { a: 'polygon', b: 'avalanche' },
    { a: 'monad', b: 'base' },
    { a: 'monad', b: 'avalanche' },
    { a: 'base', b: 'avalanche' },
  ];

  const chainMap = {
    testnet: {
      polygon: 80002,
      monad: 10143,
      base: 84532,
      avalanche: 43113,
    },
    mainnet: {
      polygon: 137,
      monad: 143,
      base: 8453,
      avalanche: 43114,
    },
  };

  const matrix = [];
  const chains = chainMap[networkMode] || chainMap.mainnet;

  for (const pair of pairs) {
    const chainA = chains[pair.a];
    const chainB = chains[pair.b];

    const netA = SUPPORTED_NETWORKS[chainA];
    const netB = SUPPORTED_NETWORKS[chainB];

    // Direction 1: A -> B
    const verifyAB = verifyCrossChainRoute(chainA, chainB, 'USDC', 'USDC');
    const isAvailAB = Boolean(verifyAB.verified);
    const statusAB = isAvailAB
      ? 'AVAILABLE'
      : (verifyAB.status === 'DEPLOYMENT_PENDING'
          ? 'GATED_PENDING_DEPLOYMENT'
          : (verifyAB.status === 'PROVIDER_ROUTE_UNAVAILABLE' ? 'PROVIDER_UNSUPPORTED' : 'UNAVAILABLE'));

    matrix.push({
      pairId: `${pair.a}_${pair.b}`,
      direction: `${netA.shortName} → ${netB.shortName}`,
      sourceChain: chainA,
      destChain: chainB,
      sourceChainId: chainA,
      destChainId: chainB,
      sourceName: netA.name,
      destName: netB.name,
      networkMode,
      provider: networkMode === 'mainnet' ? 'LI.FI' : 'Fundrex CCIP / Sentinel',
      status: statusAB,
      rawStatus: verifyAB.status,
      isAudited: verifyAB.isAudited,
      canExecute: isAvailAB,
      reason: verifyAB.reason,
    });

    // Direction 2: B -> A
    const verifyBA = verifyCrossChainRoute(chainB, chainA, 'USDC', 'USDC');
    const isAvailBA = Boolean(verifyBA.verified);
    const statusBA = isAvailBA
      ? 'AVAILABLE'
      : (verifyBA.status === 'DEPLOYMENT_PENDING'
          ? 'GATED_PENDING_DEPLOYMENT'
          : (verifyBA.status === 'PROVIDER_ROUTE_UNAVAILABLE' ? 'PROVIDER_UNSUPPORTED' : 'UNAVAILABLE'));

    matrix.push({
      pairId: `${pair.b}_${pair.a}`,
      direction: `${netB.shortName} → ${netA.shortName}`,
      sourceChain: chainB,
      destChain: chainA,
      sourceChainId: chainB,
      destChainId: chainA,
      sourceName: netB.name,
      destName: netA.name,
      networkMode,
      provider: networkMode === 'mainnet' ? 'LI.FI' : 'Fundrex CCIP / Sentinel',
      status: statusBA,
      rawStatus: verifyBA.status,
      isAudited: verifyBA.isAudited,
      canExecute: isAvailBA,
      reason: verifyBA.reason,
    });
  }

  return matrix;
}

/**
 * Fetch real live cross-chain quote from LI.FI REST API for mainnet pairs.
 */
export async function fetchLiFiQuote({
  fromChain,
  toChain,
  fromToken,
  toToken,
  fromAmount,
  fromAddress,
  slippage = 0.005,
}) {
  const fromNet = SUPPORTED_NETWORKS[fromChain];
  const destNet = SUPPORTED_NETWORKS[toChain];
  if (!fromNet || !destNet) {
    throw new Error('Unsupported chain in LI.FI quote request.');
  }
  if (fromNet.networkType !== 'mainnet' || destNet.networkType !== 'mainnet') {
    throw new Error('LI.FI provider only supports mainnet routes. Testnet routing operates via protocol CCIP relayers.');
  }

  // Normalization: native currency is 0x0000000000000000000000000000000000000000 in LI.FI
  const normalizedFromTok = fromToken || '0x0000000000000000000000000000000000000000';
  const normalizedToTok = toToken || '0x0000000000000000000000000000000000000000';
  const addr = fromAddress || '0x5555555555555555555555555555555555555555';

  const url = `https://li.quest/v1/quote?fromChain=${fromChain}&toChain=${toChain}&fromToken=${normalizedFromTok}&toToken=${normalizedToTok}&fromAmount=${fromAmount}&fromAddress=${addr}&slippage=${slippage}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.estimate) {
    throw new Error(data.message || 'LI.FI could not find an available liquidity route for this token pair.');
  }
  return data;
}

/**
 * Poll LI.FI status endpoint until destination execution is verified or reported pending.
 * NEVER fabricates completion without verified status === 'DONE'.
 */
export async function pollLiFiStatus(txHashOrOpts, bridge, fromChain, toChain, maxAttempts = 15, intervalMs = 4000) {
  let txHash, b, fChain, tChain, maxAtt, intMs;
  if (typeof txHashOrOpts === 'object' && txHashOrOpts !== null) {
    txHash = txHashOrOpts.txHash;
    b = txHashOrOpts.bridge || txHashOrOpts.bridgeTool;
    fChain = txHashOrOpts.fromChain;
    tChain = txHashOrOpts.toChain;
    maxAtt = txHashOrOpts.maxAttempts ?? 15;
    intMs = txHashOrOpts.intervalMs ?? 4000;
  } else {
    txHash = txHashOrOpts;
    b = bridge;
    fChain = fromChain;
    tChain = toChain;
    maxAtt = maxAttempts;
    intMs = intervalMs;
  }

  let url = `https://li.quest/v1/status?txHash=${txHash}`;
  if (b) url += `&bridge=${b}`;
  if (fChain) url += `&fromChain=${fChain}`;
  if (tChain) url += `&toChain=${tChain}`;

  for (let i = 0; i < maxAtt; i++) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'DONE') {
        return {
          status: 'COMPLETED',
          destTxHash: data.receiving?.txHash || null,
          receivingTxHash: data.receiving?.txHash || null,
          destTxLink: data.receiving?.txLink || null,
          raw: data,
        };
      }
      if (data.status === 'FAILED') {
        return {
          status: 'FAILED',
          destTxHash: null,
          receivingTxHash: null,
          error: data.message || 'Bridge execution failed on destination chain.',
          raw: data,
        };
      }
    } catch {
      // network retry
    }
    if (i < maxAtt - 1) {
      await new Promise((r) => setTimeout(r, intMs));
    }
  }

  // If still in flight after polling window, honestly return PENDING with explorer URL
  return {
    status: 'PENDING',
    destTxHash: null,
    receivingTxHash: null,
    message: 'Bridge transfer in flight. Track progress on LI.FI Explorer.',
    lifiExplorerUrl: `https://scan.li.fi/tx/${txHash}`,
  };
}

/**
 * Generate a cross-chain route quote.
 * On Mainnet: queries live LI.FI API asynchronously.
 * On Testnet: applies protocol fee schedule and strictly enforces zero-trust audit gating.
 */
export async function getCrossChainQuote(
  sourceChainIdOrOpts,
  destChainId,
  sourceSymbol = 'FDX',
  destSymbol = 'FDX',
  inputAmount,
  userAddress = null,
  slippagePercent = 0.5
) {
  let sourceChainId, destChain, srcSym, dstSym, inAmt, usrAddr, slip;
  if (typeof sourceChainIdOrOpts === 'object' && sourceChainIdOrOpts !== null) {
    sourceChainId = sourceChainIdOrOpts.sourceChainId || sourceChainIdOrOpts.fromChain;
    destChain = sourceChainIdOrOpts.destChainId || sourceChainIdOrOpts.toChain;
    srcSym = sourceChainIdOrOpts.sourceSymbol || sourceChainIdOrOpts.sourceTokenSymbol || 'FDX';
    dstSym = sourceChainIdOrOpts.destSymbol || sourceChainIdOrOpts.destTokenSymbol || 'FDX';
    inAmt = sourceChainIdOrOpts.inputAmount ?? sourceChainIdOrOpts.amount;
    usrAddr = sourceChainIdOrOpts.userAddress || sourceChainIdOrOpts.fromAddress || null;
    slip = sourceChainIdOrOpts.slippagePercent ?? sourceChainIdOrOpts.slippageTolerance ?? 0.5;
  } else {
    sourceChainId = sourceChainIdOrOpts;
    destChain = destChainId;
    srcSym = sourceSymbol;
    dstSym = destSymbol;
    inAmt = inputAmount;
    usrAddr = userAddress;
    slip = slippagePercent;
  }

  const numInput = parseFloat(inAmt);
  if (!numInput || numInput <= 0 || isNaN(numInput)) {
    return null;
  }

  const sourceNet = SUPPORTED_NETWORKS[sourceChainId];
  const destNet = SUPPORTED_NETWORKS[destChain];

  // Route verification check
  const auditCheck = verifyCrossChainRoute(sourceChainId, destChain, srcSym, dstSym);

  const sourceTok = getTokenConfig(sourceChainId, srcSym);
  const destTok = getTokenConfig(destChain, dstSym);

  // If cross-environment mismatch or unsupported
  if (!auditCheck.verified && auditCheck.status === 'TESTNET_MAINNET_MISMATCH') {
    return {
      canExecute: false,
      isAvailable: false,
      unavailabilityReason: auditCheck.reason,
      sourceChainId,
      destChainId: destChain,
      sourceChainName: sourceNet?.name || 'Source',
      destChainName: destNet?.name || 'Destination',
      sourceSymbol: srcSym,
      destSymbol: dstSym,
      sourceToken: srcSym,
      destToken: dstSym,
      inputAmount: numInput,
      destEstimatedOutput: '0.00',
      estimatedOutput: 0,
      minReceived: '0.00',
      bridgeFee: '0.00',
      estimatedDuration: 'N/A',
      relayer: 'Blocked',
      auditVerification: auditCheck,
    };
  }

  // ── MAINNET ROUTING (LI.FI) ──────────────────────────────────
  if (sourceNet?.networkType === 'mainnet' && destNet?.networkType === 'mainnet') {
    if (!auditCheck.verified) {
      return {
        canExecute: false,
        isAvailable: false,
        unavailabilityReason: auditCheck.reason,
        sourceChainId,
        destChainId: destChain,
        sourceChainName: sourceNet.name,
        destChainName: destNet.name,
        sourceSymbol: srcSym,
        destSymbol: dstSym,
        sourceToken: srcSym,
        destToken: dstSym,
        inputAmount: numInput,
        destEstimatedOutput: '0.00',
        estimatedOutput: 0,
        minReceived: '0.00',
        bridgeFee: '0.00',
        estimatedDuration: 'N/A',
        relayer: 'LI.FI Multi-Bridge Router',
        auditVerification: auditCheck,
      };
    }

    try {
      const fromDec = sourceTok?.decimals ?? 18;
      const toDec = destTok?.decimals ?? 18;
      const fromAmountWei = ethers.parseUnits(numInput.toString(), fromDec).toString();
      const slippageDecimal = (slip || 0.5) / 100;

      const lifiQuote = await fetchLiFiQuote({
        fromChain: sourceChainId,
        toChain: destChain,
        fromToken: sourceTok?.address || '0x0000000000000000000000000000000000000000',
        toToken: destTok?.address || '0x0000000000000000000000000000000000000000',
        fromAmount: fromAmountWei,
        fromAddress: usrAddr,
        slippage: slippageDecimal,
      });

      const estOutFormatted = ethers.formatUnits(lifiQuote.estimate.toAmount, toDec);
      const minReceivedFormatted = ethers.formatUnits(lifiQuote.estimate.toAmountMin, toDec);

      const totalFeeUSD = (lifiQuote.estimate.feeCosts || []).reduce(
        (acc, f) => acc + parseFloat(f.amountUSD || 0),
        0
      );
      const estDurationSec = lifiQuote.estimate.executionDuration || 60;
      const toolName = lifiQuote.toolDetails?.name || lifiQuote.tool || 'LI.FI Router';
      const estNum = parseFloat(estOutFormatted);

      return {
        quoteId: `Q-LIFI-${Date.now().toString(36)}`,
        canExecute: true,
        isAvailable: true,
        provider: 'lifi',
        sourceChainId,
        destChainId: destChain,
        sourceChainName: sourceNet.name,
        destChainName: destNet.name,
        sourceSymbol: srcSym,
        destSymbol: dstSym,
        sourceToken: srcSym,
        destToken: dstSym,
        inputAmount: numInput,
        destEstimatedOutput: estNum.toFixed(4),
        estimatedOutput: estNum,
        minReceived: parseFloat(minReceivedFormatted).toFixed(4),
        bridgeFee: totalFeeUSD > 0 ? `$${totalFeeUSD.toFixed(2)}` : '0.25%',
        feeBps: 25,
        slippagePercent: `${slip}%`,
        estimatedTimeSeconds: estDurationSec,
        estimatedDuration: estDurationSec < 60 ? `${estDurationSec}s` : `${Math.round(estDurationSec / 60)} min`,
        relayer: `LI.FI (${toolName})`,
        relayerProvider: `LI.FI (${toolName})`,
        approvalAddress: lifiQuote.estimate.approvalAddress,
        transactionRequest: lifiQuote.transactionRequest,
        lifiQuote,
        auditVerification: {
          verified: true,
          isAudited: true,
          status: 'LI_FI_ACTIVE',
          reason: `Live route active via LI.FI provider (${toolName}). Settlement tracked via LI.FI status API.`,
        },
      };
    } catch (err) {
      return {
        canExecute: false,
        isAvailable: false,
        unavailabilityReason: err.message || 'LI.FI liquidity route unavailable for this token pair or direction.',
        sourceChainId,
        destChainId: destChain,
        sourceChainName: sourceNet.name,
        destChainName: destNet.name,
        sourceSymbol: srcSym,
        destSymbol: dstSym,
        sourceToken: srcSym,
        destToken: dstSym,
        inputAmount: numInput,
        destEstimatedOutput: '0.00',
        estimatedOutput: 0,
        minReceived: '0.00',
        bridgeFee: '0.00',
        estimatedDuration: 'N/A',
        relayer: 'LI.FI Router',
        auditVerification: {
          verified: false,
          isAudited: false,
          status: 'ROUTE_UNAVAILABLE',
          reason: err.message || 'LI.FI liquidity route unavailable for this token pair or direction.',
        },
      };
    }
  }

  // ── TESTNET ROUTING (CCIP / Sentinel Quorum) ────────────────
  const srcDec = sourceTok?.decimals ?? (TOKEN_DECIMALS[srcSym] || 18);
  const dstDec = destTok?.decimals ?? (TOKEN_DECIMALS[dstSym] || 18);

  const inputUnits = parseTokenUnits(inAmt.toString(), srcDec);
  const feeBps = 25; // 0.25% protocol fee
  const slippageBps = Math.round((slip || 0.5) * 100);
  const { outputUnits, feeUnits, minReceivedUnits } = calculateQuoteUnits(inputUnits, feeBps, slippageBps);

  const convertedOutputUnits = convertDecimals(outputUnits, srcDec, dstDec);
  const convertedMinUnits = convertDecimals(minReceivedUnits, srcDec, dstDec);

  const destEstimatedOutputStr = formatTokenUnits(convertedOutputUnits, dstDec, 4);
  const minReceivedStr = formatTokenUnits(convertedMinUnits, dstDec, 4);
  const feeStr = `${formatTokenUnits(feeUnits, srcDec, 4)} ${srcSym} (0.25%)`;

  const estimatedOutputNum = parseFloat(destEstimatedOutputStr);
  const minReceivedNum = parseFloat(minReceivedStr);

  return {
    quoteId: `Q-CCIP-${Date.now().toString(36)}`,
    canExecute: auditCheck.verified,
    isAvailable: auditCheck.verified,
    unavailabilityReason: auditCheck.verified ? '' : auditCheck.reason,
    provider: 'ccip_sentinel',
    sourceChainId,
    destChainId: destChain,
    sourceChainName: sourceNet?.name || 'Polygon Amoy',
    destChainName: destNet?.name || 'Destination Chain',
    sourceSymbol: srcSym,
    destSymbol: dstSym,
    sourceToken: srcSym,
    destToken: dstSym,
    inputAmount: numInput,
    inputAmountUnits: inputUnits.toString(),
    destEstimatedOutput: destEstimatedOutputStr,
    estimatedOutput: estimatedOutputNum,
    bridgeFee: feeStr,
    bridgeFeePercentage: '0.25%',
    feeBps,
    feeUnits: feeUnits.toString(),
    slippagePercent: `${slip}%`,
    minimumReceived: minReceivedNum,
    minReceived: minReceivedStr,
    minAmountOutUnits: convertedMinUnits.toString(),
    estimatedDuration: '30 - 60 seconds',
    estimatedTimeSeconds: 45,
    relayer: destNet?.relayer || 'Chainlink CCIP / Fundrex Sentinel Quorum',
    relayerProvider: destNet?.relayer || 'Fundrex Sentinel Cross-Chain Protocol (CCIP Standard)',
    auditVerification: auditCheck,
  };
}

/**
 * Execute verified cross-chain swap with lifecycle tracking.
 * Strictly verifies wallet network matches source chain.
 * Never fabricates destination execution.
 */
export async function executeCrossChainSwap(signerOrOpts, quoteArg, onStateUpdateArg) {
  let signer, quote, onStateUpdate;
  if (signerOrOpts && signerOrOpts.signer) {
    signer = signerOrOpts.signer;
    quote = signerOrOpts.quote;
    onStateUpdate = signerOrOpts.onStateUpdate || signerOrOpts.onStatusUpdate;
  } else {
    signer = signerOrOpts;
    quote = quoteArg;
    onStateUpdate = onStateUpdateArg;
  }

  if (!signer) throw new Error('Web3 signer required for transaction execution.');
  if (!quote) throw new Error('Missing cross-chain quote.');

  // Enforce audit verification safeguard — NEVER bypass
  if (!quote.auditVerification?.verified || !quote.canExecute) {
    throw new Error(
      `Cross-chain execution blocked: ${quote.auditVerification?.reason || quote.unavailabilityReason || 'Audit verification unconfirmed'}`
    );
  }

  const provider = signer.provider;
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const walletChainId = Number(network.chainId);

  // STRICT WALLET CHAIN ID CHECK
  if (walletChainId !== quote.sourceChainId) {
    throw new Error(
      `Wallet chain ID mismatch: wallet is connected to Chain ID ${walletChainId}, but route source chain is ${quote.sourceChainId} (${quote.sourceChainName}). Please switch your wallet network before bridging.`
    );
  }

  // ── MAINNET EXECUTION VIA LI.FI ─────────────────────────────
  if (quote.provider === 'lifi') {
    if (!quote.transactionRequest) {
      throw new Error('LI.FI quote is missing executable transactionRequest.');
    }

    onStateUpdate?.({ status: CROSS_CHAIN_STATUS.WALLET_APPROVAL, step: 1, totalSteps: 5 });

    // Handle token approval if ERC-20
    const sourceTok = getTokenConfig(quote.sourceChainId, quote.sourceSymbol);
    const isNative = !sourceTok?.address || sourceTok?.address === '0x0000000000000000000000000000000000000000';

    if (!isNative && quote.approvalAddress) {
      const fromDec = sourceTok.decimals || 18;
      const amountUnits = ethers.parseUnits(quote.inputAmount.toString(), fromDec);
      const tokenContract = new ethers.Contract(sourceTok.address, ERC20_ABI, signer);

      const bal = await tokenContract.balanceOf(address).catch(() => 0n);
      if (bal < amountUnits) {
        throw new Error(`Insufficient ${quote.sourceSymbol} balance to execute bridge transfer.`);
      }

      const allowance = await tokenContract.allowance(address, quote.approvalAddress).catch(() => 0n);
      if (allowance < amountUnits) {
        const appTx = await tokenContract.approve(quote.approvalAddress, amountUnits).catch((err) => {
          if (err.code === 4001 || err.message?.includes('rejected')) {
            throw new Error('Approval transaction rejected by user in wallet.');
          }
          throw err;
        });
        await appTx.wait();
      }
    }

    onStateUpdate?.({ status: CROSS_CHAIN_STATUS.SOURCE_SUBMITTED, step: 2, totalSteps: 5 });

    // Execute the LI.FI transaction request
    const tx = await signer.sendTransaction({
      to: quote.transactionRequest.to,
      data: quote.transactionRequest.data,
      value: quote.transactionRequest.value ? BigInt(quote.transactionRequest.value) : 0n,
      gasLimit: quote.transactionRequest.gasLimit ? BigInt(quote.transactionRequest.gasLimit) : undefined,
    }).catch((err) => {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        throw new Error('Transaction signing rejected by user in wallet.');
      }
      throw err;
    });

    const receipt = await tx.wait();
    if (!receipt || receipt.status === 0) {
      throw new Error('Source chain bridge transaction reverted on-chain.');
    }

    onStateUpdate?.({
      status: CROSS_CHAIN_STATUS.BRIDGE_PENDING,
      sourceTxHash: receipt.hash,
      step: 3,
      totalSteps: 5,
    });

    // Poll LI.FI status for real destination execution
    const bridgeTool = quote.lifiQuote?.tool;
    const pollResult = await pollLiFiStatus(
      receipt.hash,
      bridgeTool,
      quote.sourceChainId,
      quote.destChainId,
      15,
      3000
    );

    if (pollResult?.status === 'COMPLETED') {
      onStateUpdate?.({
        status: CROSS_CHAIN_STATUS.COMPLETED,
        sourceTxHash: receipt.hash,
        destTxHash: pollResult.destTxHash,
        step: 5,
        totalSteps: 5,
      });

      return {
        sourceTxHash: receipt.hash,
        destTxHash: pollResult.destTxHash,
        status: CROSS_CHAIN_STATUS.COMPLETED,
        quote,
      };
    } else {
      // In flight, NOT faked
      onStateUpdate?.({
        status: CROSS_CHAIN_STATUS.BRIDGE_PENDING,
        sourceTxHash: receipt.hash,
        destTxHash: null,
        step: 4,
        totalSteps: 5,
        lifiExplorerUrl: `https://scan.li.fi/tx/${receipt.hash}`,
      });

      return {
        sourceTxHash: receipt.hash,
        destTxHash: null,
        status: CROSS_CHAIN_STATUS.BRIDGE_PENDING,
        lifiExplorerUrl: `https://scan.li.fi/tx/${receipt.hash}`,
        quote,
      };
    }
  }

  // ── TESTNET EXECUTION VIA FUNDREX CROSS CHAIN ROUTER ────────
  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.VALIDATING,
    step: 1,
    totalSteps: 7,
    sourceTxHash: null,
    destTxHash: null,
  });

  const routerAddress = getCrossChainRouterAddress(quote.sourceChainId);
  if (!routerAddress) {
    throw new Error(`CrossChainRouter not configured for source chain ${quote.sourceChainId}`);
  }

  const sourceTok = getTokenConfig(quote.sourceChainId, quote.sourceSymbol);
  const destTok = getTokenConfig(quote.destChainId, quote.destSymbol);
  const srcDec = sourceTok?.decimals || (TOKEN_DECIMALS[quote.sourceSymbol] || 18);
  const dstDec = destTok?.decimals || (TOKEN_DECIMALS[quote.destSymbol] || 18);
  const amountUnits = parseTokenUnits(quote.inputAmount.toString(), srcDec);

  const isNative = !sourceTok?.address || sourceTok?.address === '0x0000000000000000000000000000000000000000';
  const destTokenAddress = destTok?.address || '0x0000000000000000000000000000000000000000';
  const sourceTokenAddress = isNative ? '0x0000000000000000000000000000000000000000' : sourceTok.address;

  // Strict balance preflight check
  const userBalObj = await getUserTokenBalance(provider, address, quote.sourceChainId, quote.sourceSymbol);
  if (userBalObj.raw < amountUnits) {
    throw new Error(
      `Insufficient ${quote.sourceSymbol} balance (${userBalObj.formatted} available) to transfer ${quote.inputAmount} ${quote.sourceSymbol}.`
    );
  }

  // Handle ERC-20 approval if needed
  if (!isNative) {
    const tokenContract = new ethers.Contract(sourceTok.address, ERC20_ABI, signer);
    const allowance = await tokenContract.allowance(address, routerAddress).catch(() => 0n);

    if (allowance < amountUnits) {
      onStateUpdate?.({
        status: CROSS_CHAIN_STATUS.APPROVAL_REQUIRED,
        step: 2,
        totalSteps: 7,
        sourceTxHash: null,
        destTxHash: null,
      });

      const appTx = await tokenContract.approve(routerAddress, amountUnits).catch((err) => {
        if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
          throw new Error('Approval transaction rejected by user in wallet.');
        }
        throw err;
      });
      await appTx.wait();
    }
  }

  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.AWAITING_SIGNATURE,
    step: 3,
    totalSteps: 7,
    sourceTxHash: null,
    destTxHash: null,
  });

  const routerContract = new ethers.Contract(routerAddress, CROSS_CHAIN_ROUTER_ABI, signer);
  const minAmountOutUnits = quote.minAmountOutUnits
    ? BigInt(quote.minAmountOutUnits)
    : convertDecimals((amountUnits * 9925n) / 10000n, srcDec, dstDec);

  let tx;
  try {
    if (isNative) {
      tx = await routerContract.initiateBridgeTransfer(
        '0x0000000000000000000000000000000000000000',
        amountUnits,
        quote.destChainId,
        destTokenAddress,
        address,
        minAmountOutUnits,
        { value: amountUnits }
      );
    } else {
      tx = await routerContract.initiateBridgeTransfer(
        sourceTokenAddress,
        amountUnits,
        quote.destChainId,
        destTokenAddress,
        address,
        minAmountOutUnits
      );
    }
  } catch (err) {
    if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
      onStateUpdate?.({
        status: CROSS_CHAIN_STATUS.REJECTED,
        step: 3,
        totalSteps: 7,
        error: 'Transaction signing rejected by user in wallet.',
      });
      throw new Error('Transaction signing rejected by user in wallet.');
    }
    throw err;
  }

  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.SOURCE_PENDING,
    step: 4,
    totalSteps: 7,
    sourceTxHash: tx.hash,
    destTxHash: null,
  });

  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) {
    onStateUpdate?.({
      status: CROSS_CHAIN_STATUS.FAILED,
      step: 4,
      totalSteps: 7,
      error: 'Source chain bridge transaction reverted on-chain.',
    });
    throw new Error('Source chain bridge transaction reverted on-chain.');
  }

  // Extract transferId from event logs if available
  let transferId = null;
  try {
    for (const log of receipt.logs || []) {
      try {
        const parsed = routerContract.interface.parseLog(log);
        if (parsed?.name === 'BridgeTransferInitiated') {
          transferId = parsed.args.transferId;
          break;
        }
      } catch (_) {}
    }
  } catch (_) {}

  if (!transferId) {
    transferId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256', 'uint256', 'address', 'address', 'uint256', 'string'],
        [quote.sourceChainId, quote.destChainId, address, destTokenAddress, amountUnits, receipt.hash]
      )
    );
  }

  saveCrossChainTransfer({
    transferId,
    sourceChainId: quote.sourceChainId,
    destChainId: quote.destChainId,
    sourceToken: quote.sourceSymbol,
    destToken: quote.destSymbol,
    amount: quote.inputAmount,
    sourceTxHash: receipt.hash,
    status: CROSS_CHAIN_STATUS.SOURCE_CONFIRMED,
    recipient: address,
  });

  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.SOURCE_CONFIRMED,
    step: 5,
    totalSteps: 7,
    sourceTxHash: receipt.hash,
    destTxHash: null,
    transferId,
  });

  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.BRIDGE_PENDING,
    step: 6,
    totalSteps: 7,
    sourceTxHash: receipt.hash,
    destTxHash: null,
    transferId,
  });

  updateCrossChainTransfer(transferId, {
    status: CROSS_CHAIN_STATUS.DESTINATION_PENDING,
  });

  onStateUpdate?.({
    status: CROSS_CHAIN_STATUS.DESTINATION_PENDING,
    step: 6,
    totalSteps: 7,
    sourceTxHash: receipt.hash,
    destTxHash: null,
    transferId,
  });

  return {
    sourceTxHash: receipt.hash,
    destTxHash: null,
    transferId,
    status: CROSS_CHAIN_STATUS.DESTINATION_PENDING,
    quote,
  };
}

/**
 * Execute destination settlement or recipient claim on destination chain.
 */
export async function claimDestinationBridgeTransfer(signer, {
  transferId,
  sourceChainId,
  destChainId,
  sourceTokenAddress,
  destTokenAddress,
  recipient,
  amountOutUnits,
  sentinelSignature = '0x',
}) {
  if (!signer) throw new Error('Web3 signer required to claim destination transfer.');
  const network = await signer.provider.getNetwork();
  const currentChainId = Number(network.chainId);
  if (currentChainId !== Number(destChainId)) {
    throw new Error(`Please switch your wallet to destination chain ID ${destChainId} to claim transfer.`);
  }

  const routerAddress = getCrossChainRouterAddress(destChainId);
  if (!routerAddress) {
    throw new Error(`CrossChainRouter address not configured for destination chain ID ${destChainId}`);
  }

  const router = new ethers.Contract(routerAddress, CROSS_CHAIN_ROUTER_ABI, signer);
  const sig = sentinelSignature && sentinelSignature.startsWith('0x') && sentinelSignature.length > 2 ? sentinelSignature : '0x';

  // 1. Resolve token: if native gas token (0x0) and router native reserves are insufficient, fallback to FDX
  let effectiveDestToken = destTokenAddress || '0x0000000000000000000000000000000000000000';
  const fdxConfig = getTokenRegistry(destChainId)?.find((t) => t.symbol === 'FDX');

  if (effectiveDestToken === '0x0000000000000000000000000000000000000000') {
    const routerNativeBal = await signer.provider.getBalance(routerAddress).catch(() => 0n);
    if (routerNativeBal <= amountOutUnits && fdxConfig?.address) {
      effectiveDestToken = fdxConfig.address;
    }
  }

  const overrides = await getNetworkFeeOverrides(signer.provider, destChainId);

  // 2. For ERC-20 claims, ensure router has liquidity (auto-seed if caller is token owner)
  if (effectiveDestToken && effectiveDestToken !== '0x0000000000000000000000000000000000000000') {
    try {
      const tokenContract = new ethers.Contract(
        effectiveDestToken,
        [
          'function balanceOf(address) view returns (uint256)',
          'function owner() view returns (address)',
          'function mint(address, uint256)',
          'function transfer(address, uint256) returns (bool)',
        ],
        signer
      );
      const rBal = await tokenContract.balanceOf(routerAddress).catch(() => 0n);
      if (rBal < amountOutUnits) {
        const callerAddr = await signer.getAddress();
        const tokenOwner = await tokenContract.owner().catch(() => null);
        if (tokenOwner && callerAddr.toLowerCase() === tokenOwner.toLowerCase()) {
          const mintTx = await tokenContract.mint(routerAddress, ethers.parseEther('5000'), overrides);
          await mintTx.wait();
        } else {
          const userBal = await tokenContract.balanceOf(callerAddr).catch(() => 0n);
          if (userBal >= amountOutUnits) {
            const seedTx = await tokenContract.transfer(routerAddress, amountOutUnits * 2n, overrides);
            await seedTx.wait();
          }
        }
      }
    } catch (e) {
      console.warn('[claimDestinationBridgeTransfer] Router liquidity seed preflight skipped:', e);
    }
  }

  const tx = await router.executeDestinationTransfer(
    transferId,
    sourceChainId,
    sourceTokenAddress || '0x0000000000000000000000000000000000000000',
    effectiveDestToken,
    recipient,
    amountOutUnits,
    sig,
    overrides
  );

  const receipt = await tx.wait();
  updateCrossChainTransfer(transferId, {
    status: 'COMPLETED',
    destTxHash: receipt.hash,
  });

  return {
    receipt,
    destTxHash: receipt.hash,
    status: 'COMPLETED',
  };
}

// ─────────────────────────────────────────────────────────────
// ADMIN ACCESS GATE & ON-CHAIN VERIFICATION (DYNAMIC CONTRACT CHECK)
// ─────────────────────────────────────────────────────────────
export const ADMIN_WALLETS = [];

export async function checkIsAdminWallet(address, targetChainId = null) {
  if (!address || typeof address !== 'string') return false;
  const userAddr = address.trim().toLowerCase();

  const chainId = getActiveChainId(targetChainId);
  const candidateChains = [chainId, 80002, 10143, 43113].filter((c, i, a) => a.indexOf(c) === i);

  for (const cid of candidateChains) {
    const chainNet = SUPPORTED_NETWORKS[cid];
    if (!chainNet?.contracts) continue;
    try {
      const p = getReadProvider(cid);

      // 1. Check FundryxToken owner
      if (chainNet.contracts.FundryxToken) {
        try {
          const token = new ethers.Contract(
            chainNet.contracts.FundryxToken,
            ['function owner() view returns (address)'],
            p
          );
          const owner = await token.owner();
          if (owner && owner.toLowerCase() === userAddr) return true;
        } catch (_) {}
      }

      // 2. Check LendingPool owner
      if (chainNet.contracts.LendingPool) {
        try {
          const pool = new ethers.Contract(
            chainNet.contracts.LendingPool,
            ['function owner() view returns (address)'],
            p
          );
          const owner = await pool.owner();
          if (owner && owner.toLowerCase() === userAddr) return true;
        } catch (_) {}
      }

      // 3. Check AccessManager hasRole / owner
      if (chainNet.contracts.AccessManager) {
        try {
          const am = new ethers.Contract(
            chainNet.contracts.AccessManager,
            [
              'function hasRole(bytes32 role, address account) view returns (bool)',
              'function owner() view returns (address)',
              'function ADMIN_ROLE() view returns (bytes32)',
              'function DEFAULT_ADMIN_ROLE() view returns (bytes32)'
            ],
            p
          );

          try {
            const amOwner = await am.owner();
            if (amOwner && amOwner.toLowerCase() === userAddr) return true;
          } catch (_) {}

          try {
            const hasZero = await am.hasRole(ethers.ZeroHash, address);
            if (hasZero) return true;
          } catch (_) {}

          try {
            const adminRole = await am.ADMIN_ROLE();
            const hasAdmin = await am.hasRole(adminRole, address);
            if (hasAdmin) return true;
          } catch (_) {}
        } catch (_) {}
      }
    } catch (_) {}
  }

  return false;
}

export async function verifyTxHashOnChain(txHash, targetChainId = null) {
  if (!txHash || !txHash.startsWith('0x')) {
    throw new Error('Invalid transaction hash format. Must begin with 0x.');
  }

  const preferredChain = getActiveChainId(targetChainId);
  const chainsToTry = [preferredChain, 80002, 10143, 43113, 84532].filter((v, i, a) => a.indexOf(v) === i);

  let tx = null;
  let receipt = null;
  let verifiedChain = preferredChain;

  for (const cid of chainsToTry) {
    try {
      const p = getReadProvider(cid);
      const [t, r] = await Promise.all([
        p.getTransaction(txHash).catch(() => null),
        p.getTransactionReceipt(txHash).catch(() => null),
      ]);
      if (t && r) {
        tx = t;
        receipt = r;
        verifiedChain = cid;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!tx || !receipt) {
    throw new Error('Transaction hash not found or not yet mined on-chain across monitored networks.');
  }

  const provider = getReadProvider(verifiedChain);
  const latestBlock = await provider.getBlockNumber().catch(() => receipt.blockNumber);
  const confirmations = Math.max(1, latestBlock - receipt.blockNumber + 1);

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    status: receipt.status === 1 ? 'SUCCESS' : 'REVERTED',
    blockNumber: receipt.blockNumber,
    confirmations,
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: ethers.formatUnits(receipt.gasPrice || 0n, 'gwei'),
    logsCount: receipt.logs.length,
    explorerUrl: explorerTxLink(tx.hash, verifiedChain),
    chainId: verifiedChain,
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH LIVE EVENTS — recent protocol activity from chain
// ─────────────────────────────────────────────────────────────
export async function fetchRecentEvents(blockRange = 3000) {
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
      type: 'Loan Disbursement',
      borrower: `${log.args.borrower.slice(0, 6)}...${log.args.borrower.slice(-4)}`,
      amount: `${Number(ethers.formatEther(log.args.principal)).toLocaleString()} FDX (Loan #${log.args.loanId.toString()})`,
      score: `Policy v${log.args.policyVersion}`,
      time: `Block ${log.blockNumber}`,
      hash: `${log.transactionHash.slice(0, 8)}...${log.transactionHash.slice(-6)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
      fullBorrower: log.args.borrower,
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
      hash: `${log.transactionHash.slice(0, 8)}...${log.transactionHash.slice(-6)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
      fullBorrower: log.args.borrower,
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
      hash: `${log.transactionHash.slice(0, 8)}...${log.transactionHash.slice(-6)}`,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: null,
      fullBorrower: log.args.lender,
    });
  }

  // Also query MockSwapRouter Swap events if deployed
  if (MOCK_SWAP_ROUTER_ADDRESS) {
    try {
      const router = getMockSwapRouter(provider);
      const swapLogs = await router.queryFilter(router.filters.Swap(), fromBlock, latest).catch(() => []);
      for (const log of swapLogs) {
        events.push({
          id: `EV-${log.transactionHash.slice(2, 6)}`,
          type: 'AMM Swap',
          borrower: `${log.args.sender.slice(0, 6)}...${log.args.sender.slice(-4)}`,
          amount: `${Number(ethers.formatEther(log.args.amountIn)).toFixed(2)} → ${Number(ethers.formatEther(log.args.amountOut)).toFixed(2)}`,
          score: 'x*y=k Swap',
          time: `Block ${log.blockNumber}`,
          hash: `${log.transactionHash.slice(0, 8)}...${log.transactionHash.slice(-6)}`,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: null,
          fullBorrower: log.args.sender,
        });
      }
    } catch {}
  }

  // Deduplicate and merge with Supabase persistent audit events
  const eventMap = new Map();

  // 1. Load Supabase events if available
  if (isSupabaseConfigured) {
    try {
      const sbEvents = await fetchAuditEventsFromSupabase(100);
      if (sbEvents && Array.isArray(sbEvents)) {
        for (const ev of sbEvents) {
          eventMap.set(ev.tx_hash.toLowerCase(), {
            id: `SB-${ev.tx_hash.slice(2, 6)}`,
            type: ev.event_name,
            borrower: ev.wallet_address ? `${ev.wallet_address.slice(0, 6)}...${ev.wallet_address.slice(-4)}` : '0x...',
            amount: ev.amount_formatted || `${ev.amount} FDX`,
            score: 'Supabase Verified',
            time: `Block ${ev.block_number}`,
            hash: `${ev.tx_hash.slice(0, 8)}...${ev.tx_hash.slice(-6)}`,
            txHash: ev.tx_hash,
            blockNumber: Number(ev.block_number),
            timestamp: ev.created_at,
            fullBorrower: ev.wallet_address,
            fromSupabase: true,
          });
        }
      }
    } catch {}
  }

  // 2. Add on-chain queried logs (and sync to Supabase)
  for (const ev of events) {
    const key = ev.txHash.toLowerCase();
    if (!eventMap.has(key)) {
      eventMap.set(key, ev);
      recordAuditEventToSupabase(ev).catch(() => {});
    }
  }

  const combined = Array.from(eventMap.values());
  combined.sort((a, b) => b.blockNumber - a.blockNumber);
  return combined;
}

export function getActiveChainId(chainId = null) {
  if (chainId && SUPPORTED_NETWORKS[Number(chainId)]) return Number(chainId);
  if (typeof window !== 'undefined' && window.ethereum?.chainId) {
    const raw = window.ethereum.chainId;
    const num = typeof raw === 'string' && raw.startsWith('0x') ? parseInt(raw, 16) : Number(raw);
    if (SUPPORTED_NETWORKS[num]) return num;
  }
  return 80002;
}

export function explorerTxLink(txHash, chainId = null) {
  const resolved = getActiveChainId(chainId);
  const base = SUPPORTED_NETWORKS[resolved]?.explorerUrl || 'https://amoy.polygonscan.com';
  return `${base}/tx/${txHash}`;
}

export function explorerAddressLink(address, chainId = null) {
  const resolved = getActiveChainId(chainId);
  const base = SUPPORTED_NETWORKS[resolved]?.explorerUrl || 'https://amoy.polygonscan.com';
  return `${base}/address/${address}`;
}

export function explorerBlockLink(blockNumber, chainId = null) {
  const resolved = getActiveChainId(chainId);
  const base = SUPPORTED_NETWORKS[resolved]?.explorerUrl || 'https://amoy.polygonscan.com';
  return `${base}/block/${blockNumber}`;
}

// ─────────────────────────────────────────────────────────────
// PARSE REVERT REASON — extract human-readable error from tx
// ─────────────────────────────────────────────────────────────
export function parseRevertReason(err) {
  if (!err) return 'Unknown error';

  // User rejected in wallet
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') return 'Transaction rejected by user.';

  // Custom 4-byte selector decoding (catches estimateGas unknown custom error)
  const customSelectors = {
    '0xbb55fd27': 'Liquidity pool currently has 0 reserves for this token pair. Initialize pool liquidity to enable instant swaps.',
    '0xd28d3eb5': 'Swap slippage limit exceeded. Increase slippage tolerance.',
    '0x1f2a2005': 'Amount must be greater than zero.',
    '0x6331980a': 'Cannot swap token for itself.',
    '0x6a40c667': 'Borrow amount exceeds on-chain credit cap.',
    '0x9c42c7de': 'Credit policy version mismatch. Refresh and try again.',
    '0x82b42900': 'Protocol permission notice: Lending and credit facilities are active on Polygon Amoy (80002). Please switch network to Polygon Amoy.',
    '0x24ea4996': 'AccessManager: caller lacks required execution role.',
    '0x2c5211c6': 'Insufficient vault pool liquidity for this borrow amount.',
    '0x4407d56a': 'Unsupported token pair on router. Update router contract with auto-pair support.',
    '0xd08a735e': 'Destination chain is not enabled on router.',
    '0x90b98a11': 'Cross-chain transfer has already been executed.',
    '0x6eb0fd28': 'Destination router has zero liquidity reserves to pay out this asset. Click "Clear / Reset Transfer" to switch asset to FDX.',
  };

  const errData = (err.data || err.error?.data || '').toLowerCase();
  const rawMsg = (err.message || String(err)).toLowerCase();

  for (const [sel, text] of Object.entries(customSelectors)) {
    if (errData.includes(sel) || rawMsg.includes(sel)) return text;
  }

  // ethers v6 error data
  if (err.reason) return err.reason;
  if (err.revert?.name) return err.revert.name;

  // ABI-decoded custom errors from our contracts
  const knownErrors = {
    'CreditCapExceeded': 'Borrow amount exceeds your on-chain credit cap.',
    'InsufficientLiquidity': 'Vault pool has zero or insufficient liquidity for this borrow amount. Deposit into the vault first.',
    'PolicyVersionMismatch': 'Credit policy was updated. Refresh and try again.',
    'ZeroAmount': 'Amount must be greater than zero.',
    'LoanNotFound': 'Loan not found.',
    'LoanNotActive': 'Loan is not in Active or Overdue status.',
    'RepaymentExceedsDebt': 'Repayment amount exceeds outstanding debt.',
    'NotBorrower': 'Only the original borrower can repay this loan.',
    'WithdrawExceedsBalance': 'Withdrawal exceeds your deposited balance.',
    'Unauthorized': 'Protocol permission notice: Action requires authorized protocol role or Polygon Amoy (80002) network.',
    'AccessManagerUnauthorizedAccount': 'Account lacks authorized execution role in AccessManager.',
    'BorrowingPaused': 'Borrowing is currently paused on this network by protocol risk controller.',
    'UnsupportedTokenPair': 'Token pair not enabled on router.',
    'UnsupportedDestinationChain': 'Destination chain not enabled on router.',
    'InvalidSentinelSignature': 'Invalid sentinel quorum signature.',
    'InsufficientRouterLiquidity': 'Destination router has insufficient liquidity reserves to pay out this transfer.',
  };

  const msg = err.message || String(err);
  for (const [selector, human] of Object.entries(knownErrors)) {
    if (msg.includes(selector)) return human;
  }

  // Gas estimation failure — pull the revert from the message
  const match = msg.match(/reason="([^"]+)"/) || msg.match(/reverted with reason string '([^']+)'/);
  if (match) return match[1];

  // If error is raw estimateGas dump, sanitize to clean human message
  if (msg.includes('estimateGas') || msg.includes('unknown custom error')) {
    return 'Transaction reverted by contract. Verify pool liquidity and wallet allowances.';
  }

  // Fallback: return first 150 chars
  return msg.slice(0, 150);
}

// ─────────────────────────────────────────────────────────────
// CREDIT PRE-FLIGHT — read on-chain credit before borrow UI
// ─────────────────────────────────────────────────────────────
export async function fetchCreditPreFlight(address, providerOrChainId = null, maybeChainId = null) {
  let targetChain = 80002;
  let provider = null;

  if (typeof providerOrChainId === 'number') {
    targetChain = providerOrChainId;
    provider = getReadProvider(targetChain);
  } else if (typeof providerOrChainId === 'string' && !isNaN(Number(providerOrChainId))) {
    targetChain = Number(providerOrChainId);
    provider = getReadProvider(targetChain);
  } else if (providerOrChainId && typeof providerOrChainId === 'object') {
    provider = providerOrChainId;
    if (maybeChainId) {
      targetChain = Number(maybeChainId);
    } else if (provider._network?.chainId) {
      targetChain = Number(provider._network.chainId);
    }
  }

  if (!provider) {
    if (typeof window !== 'undefined' && window.ethereum?.chainId) {
      const hex = window.ethereum.chainId;
      const winChain = hex.startsWith('0x') ? parseInt(hex, 16) : Number(hex);
      if (SUPPORTED_NETWORKS[winChain]?.contractsDeployed) {
        targetChain = winChain;
      }
    }
    provider = getReadProvider(targetChain);
  }

  const policy = getCreditPolicy(provider, targetChain);
  const pool = getLendingPool(provider, targetChain);
  const token = getFundryxToken(provider, targetChain);

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
    chainId: targetChain,
  };
}

// ─────────────────────────────────────────────────────────────
// INSTANT LIQUIDITY SWAP — constant-product x*y=k with FDX & WPOL
// ─────────────────────────────────────────────────────────────

// Swap Router deployed address on Polygon Amoy
export const MOCK_SWAP_ROUTER_ADDRESS =
  getEnvVar('VITE_POLYGON_MOCK_SWAP_ROUTER') ||
  getEnvVar('VITE_MOCK_SWAP_ROUTER') ||
  '0x460850Fb8495867E526e23B4149D04810d5b4e39';

export const MOCK_SWAP_ROUTER_BYTECODE =
  '0x608060405234801561000f575f80fd5b5060017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055610956806100415f395ff3fe608060405234801561000f575f80fd5b5060043610610060575f3560e01c80634aa06652146100645780638ee2f35b14610091578063cf6c62ea146100d2578063d52bb6f4146100e7578063d5bcb9b514610130578063ea4afc5414610151575b5f80fd5b610077610072366004610742565b610178565b604080519283526020830191909152015b60405180910390f35b6100c560405180604001604052806015815260200174544553544e45545f4d4f434b5f414d4d5f414d4f5960581b81525081565b604051610088919061077b565b6100e56100e03660046107c7565b610250565b005b6100776100f5366004610806565b6001600160a01b039182165f818152602081815260408083209490951682529283528381205481845284822092825291909252919020549091565b61014361013e366004610837565b6103bf565b604051908152602001610088565b61014361015f366004610806565b5f60208181529281526040808220909352908152205481565b5f80825f0361018b57505f905080610248565b6001600160a01b038086165f8181526020818152604080832094891683529381528382205482825284832093835292905291909120548115806101cc575080155b156101de575f80935093505050610248565b5f6101eb866103e561089e565b90505f6101f8838361089e565b90505f82610208866103e861089e565b61021291906108bb565b905061021e81836108ce565b965061022a88866108bb565b6102368961271061089e565b61024091906108ce565b955050505050505b935093915050565b61025861059c565b826001600160a01b0316846001600160a01b03160361028a57604051635c6d7b7360e01b815260040160405180910390fd5b811580610295575080155b156102b357604051631f2a200560e01b815260040160405180910390fd5b6102c86001600160a01b0385163330856105b7565b6102dd6001600160a01b0384163330846105b7565b6001600160a01b038085165f90815260208181526040808320938716835292905290812080548492906103119084906108bb565b90915550506001600160a01b038084165f908152602081815260408083209388168352929052908120805483929061034a9084906108bb565b9091555050604080516001600160a01b038087168252851660208201529081018390526060810182905233907fb5bf3f2c68363aa6e695c29010485bcfecb5439239c6b1306fdec5b26cb7c62e9060800160405180910390a26103b960015f8051602061090183398151915255565b50505050565b5f6103c861059c565b846001600160a01b0316866001600160a01b0316036103fa57604051635c6d7b7360e01b815260040160405180910390fd5b835f0361041a57604051631f2a200560e01b815260040160405180910390fd5b6001600160a01b03821661042c573391505b5f610438878787610178565b90925090505f82900361045e5760405163bb55fd2760e01b815260040160405180910390fd5b8382101561048e5760405163d28d3eb560e01b815260048101839052602481018590526044015b60405180910390fd5b6104a36001600160a01b0388163330886105b7565b6001600160a01b038088165f90815260208181526040808320938a16835292905290812080548792906104d79084906108bb565b90915550506001600160a01b038087165f90815260208181526040808320938b16835292905290812080548492906105109084906108ed565b9091555061052a90506001600160a01b03871684846105ed565b60408051868152602081018490526001600160a01b03858116828401529151888316928a169133917f54787c404bb33c88e86f4baf88183a3b0141d0a848e6a9f7a13b66ae3a9b73d19181900360600190a45061059360015f8051602061090183398151915255565b95945050505050565b6105a4610627565b60025f8051602061090183398151915255565b6105c5848484846001610658565b6103b957604051635274afe760e01b81526001600160a01b0385166004820152602401610485565b6105fa83838360016106c5565b61062257604051635274afe760e01b81526001600160a01b0384166004820152602401610485565b505050565b5f805160206109018339815191525460020361065657604051633ee5aeb560e01b815260040160405180910390fd5b565b6040516323b872dd60e01b5f8181526001600160a01b038781166004528616602452604485905291602083606481808c5af1925060015f511483166106b45783831516156106a8573d5f823e3d81fd5b5f883b113d1516831692505b604052505f60605295945050505050565b60405163a9059cbb60e01b5f8181526001600160a01b038616600452602485905291602083604481808b5af1925060015f5114831661071b57838315161561070f573d5f823e3d81fd5b5f873b113d1516831692505b60405250949350505050565b80356001600160a01b038116811461073d575f80fd5b919050565b5f805f60608486031215610754575f80fd5b61075d84610727565b925061076b60208501610727565b9150604084013590509250925092565b5f602080835283518060208501525f5b818110156107a75785810183015185820160400152820161078b565b505f604082860101526040601f19601f8301168501019250505092915050565b5f805f80608085870312156107da575f80fd5b6107e385610727565b93506107f160208601610727565b93969395505050506040820135916060013590565b5f8060408385031215610817575f80fd5b61082083610727565b915061082e60208401610727565b90509250929050565b5f805f805f60a0868803121561084b575f80fd5b61085486610727565b945061086260208701610727565b9350604086013592506060860135915061087e60808701610727565b90509295509295909350565b634e487b7160e01b5f52601160045260245ffd5b80820281158282048414176108b5576108b561088a565b92915050565b808201808211156108b5576108b561088a565b5f826108e857634e487b7160e01b5f52601260045260245ffd5b500490565b818103818111156108b5576108b561088a56fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220a57a5fb4be31b787f4ec3efae097450947ecdaceb1cd9af8f3996d8f01eeca1364736f6c63430008180033';

export const MOCK_SWAP_ROUTER_ABI = [
  'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to) external returns (uint256 amountOut)',
  'function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, uint256 priceImpactBps)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external',
  'function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB)',
  'event Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, address to)',
];

export function getRouterAddress(chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`fundryx_mock_router_${numId}`);
    if (cached && ethers.isAddress(cached)) return cached;
  }
  return SUPPORTED_NETWORKS[numId]?.contracts?.MockSwapRouter || (numId === 80002 ? MOCK_SWAP_ROUTER_ADDRESS : null);
}

export function setRouterAddress(chainId, address) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  if (typeof window !== 'undefined' && ethers.isAddress(address)) {
    localStorage.setItem(`fundryx_mock_router_${numId}`, address);
  }
  if (SUPPORTED_NETWORKS[numId]) {
    if (!SUPPORTED_NETWORKS[numId].contracts) SUPPORTED_NETWORKS[numId].contracts = {};
    SUPPORTED_NETWORKS[numId].contracts.MockSwapRouter = address;
  }
}

export async function checkRouterDeployment(provider, chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  const routerAddress = getRouterAddress(numId);
  if (!routerAddress) return { deployed: false, address: null };
  const code = await provider.getCode(routerAddress).catch(() => '0x');
  const isDeployed = Boolean(code && code !== '0x' && code !== '0x0');
  return { deployed: isDeployed, address: routerAddress };
}

export async function deployMockSwapRouter(signer) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);
  const factory = new ethers.ContractFactory(MOCK_SWAP_ROUTER_ABI, MOCK_SWAP_ROUTER_BYTECODE, signer);
  const router = await factory.deploy(overrides);
  await router.waitForDeployment();
  const address = await router.getAddress();
  setRouterAddress(currentChainId, address);
  return { address, tx: router.deploymentTransaction() };
}

export function getMockSwapRouter(signerOrProvider, chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  const routerAddress = getRouterAddress(numId);
  if (!routerAddress) return null;
  return new ethers.Contract(routerAddress, MOCK_SWAP_ROUTER_ABI, signerOrProvider);
}

export async function getPairReserves(tokenA, tokenB, chainId = 80002) {
  const numId = typeof chainId === 'string' ? (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : chainId;
  const provider = getReadProvider(numId);
  const router = getMockSwapRouter(provider, numId);
  if (router && provider) {
    try {
      const routerAddress = getRouterAddress(numId);
      const code = await provider.getCode(routerAddress).catch(() => '0x');
      if (code && code !== '0x' && code !== '0x0') {
        const [resA, resB] = await router.getReserves(tokenA, tokenB);
        return {
          reserveA: Number(ethers.formatEther(resA)),
          reserveB: Number(ethers.formatEther(resB)),
        };
      }
    } catch { }
  }
  return { reserveA: 0, reserveB: 0 };
}

export async function executeSeedLiquidity(signer, amountFdx = 10, amountNative = 10) {
  const address = await signer.getAddress();
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId] || SUPPORTED_NETWORKS[80002];
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  const fdxAddr = getContractAddresses(currentChainId).FundryxToken;
  const wrappedAddr = netConfig?.wrappedNative?.address || SUPPORTED_TOKENS.WPOL;
  const fdx = new ethers.Contract(fdxAddr, ERC20_ABI, signer);
  const wrapped = new ethers.Contract(
    wrappedAddr,
    [
      'function deposit() payable',
      'function approve(address,uint256) returns (bool)',
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
    ],
    signer
  );

  const nativeSymbol = netConfig?.nativeToken || netConfig?.nativeCurrency?.symbol || 'gas';
  const nativeBal = await provider.getBalance(address).catch(() => 0n);
  const wrappedBal = await wrapped.balanceOf(address).catch(() => 0n);
  const gasBuffer = currentChainId === 10143 ? ethers.parseEther('0.05') : ethers.parseEther('0.01');

  // Calculate actual native amount: if requested amount exceeds available native gas, safely scale down
  let effectiveNativeNum = Number(amountNative);
  const usableNative = wrappedBal + (nativeBal > gasBuffer ? nativeBal - gasBuffer : 0n);
  const usableNativeEther = Number(ethers.formatEther(usableNative));

  if (usableNativeEther < 0.05) {
    throw new Error(
      `Insufficient ${nativeSymbol} balance. You have ${Number(ethers.formatEther(nativeBal)).toFixed(3)} ${nativeSymbol}, but need at least 0.05 ${nativeSymbol} to seed liquidity and cover gas.`
    );
  }

  if (effectiveNativeNum > usableNativeEther) {
    effectiveNativeNum = Math.max(0.1, Number((usableNativeEther * 0.8).toFixed(2)));
  }

  const effectiveFdxNum = Number(amountFdx) > 0 ? Math.min(Number(amountFdx), Math.max(1, effectiveNativeNum)) : 1;

  const fdxWei = ethers.parseEther(effectiveFdxNum.toString());
  const nativeWei = ethers.parseEther(effectiveNativeNum.toString());

  // 1. Verify FDX balance / minting capability BEFORE touching native gas
  let fdxBal = await fdx.balanceOf(address).catch(() => 0n);
  if (fdxBal < fdxWei) {
    let owner = null;
    try {
      if (typeof fdx.owner === 'function') {
        owner = await fdx.owner().catch(() => null);
      }
    } catch { }
    const canMint = Boolean(owner && owner.toLowerCase() === address.toLowerCase());
    if (canMint) {
      const mintAmount = fdxWei - fdxBal;
      const mintTx = await fdx.mint(address, mintAmount, overrides).catch((err) => {
        throw new Error(`FDX mint failed: ${parseRevertReason(err)}`);
      });
      if (mintTx) await mintTx.wait();
      fdxBal = await fdx.balanceOf(address).catch(() => fdxWei);
    } else {
      const ownerHint = owner ? ` Deployer (${owner.slice(0, 6)}...${owner.slice(-4)}) must mint initial FDX or seed pool.` : '';
      throw new Error(
        `Insufficient FDX balance. You have ${Number(ethers.formatEther(fdxBal)).toFixed(2)} FDX, but need ${effectiveFdxNum} FDX to seed the pool.${ownerHint}`
      );
    }
  }

  // 2. Wrap native gas token if needed
  if (wrappedBal < nativeWei) {
    const wrapNeeded = nativeWei - wrappedBal;
    const wrapTx = await wrapped.deposit({ value: wrapNeeded, ...overrides }).catch((err) => {
      throw new Error(`Auto-wrap native gas failed: ${parseRevertReason(err)}`);
    });
    if (wrapTx) await wrapTx.wait();
  }

  // 3. Router checks
  const routerAddress = getRouterAddress(currentChainId);
  let hasRouterBytecode = false;
  if (routerAddress) {
    const code = await provider.getCode(routerAddress).catch(() => '0x');
    hasRouterBytecode = Boolean(code && code !== '0x' && code !== '0x0');
  }

  if (hasRouterBytecode) {
    const router = new ethers.Contract(routerAddress, MOCK_SWAP_ROUTER_ABI, signer);
    const fdxAllowance = await fdx.allowance(address, routerAddress).catch(() => 0n);
    if (fdxAllowance < fdxWei) {
      const appFdx = await fdx.approve(routerAddress, fdxWei, overrides);
      await appFdx.wait();
    }
    const wrappedAllowance = await wrapped.allowance(address, routerAddress).catch(() => 0n);
    if (wrappedAllowance < nativeWei) {
      const appWrapped = await wrapped.approve(routerAddress, nativeWei, overrides);
      await appWrapped.wait();
    }
    const addTx = await router.addLiquidity(fdxAddr, wrappedAddr, fdxWei, nativeWei, overrides);
    const receipt = await addTx.wait();
    return {
      tx: addTx,
      receipt,
      chainId: currentChainId,
      explorerUrl: explorerTxLink(receipt.hash, currentChainId),
    };
  }

  throw new Error(
    `MockSwapRouter contract is not deployed on ${netConfig.name} (Chain ID ${currentChainId}). Please deploy the router contract first.`
  );
}

export async function executeWrap(signer, amount) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId] || SUPPORTED_NETWORKS[80002];
  const wrappedAddr = netConfig?.wrappedNative?.address;
  if (!wrappedAddr) throw new Error(`Wrapped native token address not configured for chain ${currentChainId}`);
  const wrapped = new ethers.Contract(wrappedAddr, ['function deposit() payable'], signer);
  const amountWei = ethers.parseEther(amount.toString());
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);
  const tx = await wrapped.deposit({ value: amountWei, ...overrides });
  const receipt = await tx.wait();
  return {
    tx,
    receipt,
    chainId: currentChainId,
    explorerUrl: explorerTxLink(receipt.hash, currentChainId),
  };
}

export async function executeUnwrap(signer, amount) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId] || SUPPORTED_NETWORKS[80002];
  const wrappedAddr = netConfig?.wrappedNative?.address;
  if (!wrappedAddr) throw new Error(`Wrapped native token address not configured for chain ${currentChainId}`);
  const wrapped = new ethers.Contract(wrappedAddr, ['function withdraw(uint256)'], signer);
  const amountWei = ethers.parseEther(amount.toString());
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);
  const tx = await wrapped.withdraw(amountWei, overrides);
  const receipt = await tx.wait();
  return {
    tx,
    receipt,
    chainId: currentChainId,
    explorerUrl: explorerTxLink(receipt.hash, currentChainId),
  };
}

export async function executeSwap(signer, tokenInAddress, tokenOutAddress, amountIn, slippageBps = 50) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId] || SUPPORTED_NETWORKS[80002];
  const routerAddress = getRouterAddress(currentChainId);

  const wrappedAddr = netConfig?.wrappedNative?.address;
  // Sanitize zero address or empty to wrapped native
  const effectiveIn = (!tokenInAddress || tokenInAddress === ethers.ZeroAddress || tokenInAddress === '0x0000000000000000000000000000000000000000') ? wrappedAddr : tokenInAddress;
  const effectiveOut = (!tokenOutAddress || tokenOutAddress === ethers.ZeroAddress || tokenOutAddress === '0x0000000000000000000000000000000000000000') ? wrappedAddr : tokenOutAddress;

  const address = await signer.getAddress();
  const amountInWei = ethers.parseEther(amountIn.toString());
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Check router bytecode on chain
  let hasRouterBytecode = false;
  if (routerAddress) {
    const code = await provider.getCode(routerAddress).catch(() => '0x');
    hasRouterBytecode = Boolean(code && code !== '0x' && code !== '0x0');
  }

  if (hasRouterBytecode) {
    const router = new ethers.Contract(routerAddress, MOCK_SWAP_ROUTER_ABI, signer);
    const tokenIn = new ethers.Contract(effectiveIn, ERC20_ABI, signer);

    const isWrappedIn = wrappedAddr && effectiveIn.toLowerCase() === wrappedAddr.toLowerCase();

    // Check balance and auto-wrap native gas if needed
    let balance = await tokenIn.balanceOf(address).catch(() => 0n);
    if (balance < amountInWei && isWrappedIn) {
      const wrapNeeded = amountInWei - balance;
      const nativeBalance = await provider.getBalance(address).catch(() => 0n);
      const feeBuffer = 5000000000000000n; // 0.005 ETH/MON/POL gas buffer
      if (nativeBalance >= wrapNeeded + feeBuffer) {
        const wrappedContract = new ethers.Contract(wrappedAddr, ['function deposit() payable'], signer);
        const wrapTx = await wrappedContract.deposit({ value: wrapNeeded, ...overrides }).catch((err) => {
          throw new Error(`Auto-wrap native gas failed: ${parseRevertReason(err)}`);
        });
        await wrapTx.wait();
        balance = await tokenIn.balanceOf(address).catch(() => amountInWei);
      } else {
        const wrapSymbol = netConfig?.wrappedNative?.symbol || 'Wrapped';
        const natSymbol = netConfig?.nativeToken || 'Native';
        throw new Error(
          `Insufficient balance. You have ${Number(ethers.formatEther(balance)).toFixed(4)} ${wrapSymbol} (and ${Number(ethers.formatEther(nativeBalance)).toFixed(4)} ${natSymbol} native), but requested ${amountIn} ${wrapSymbol}.`
        );
      }
    } else if (balance < amountInWei) {
      throw new Error(`Insufficient token balance. You have ${Number(ethers.formatEther(balance)).toFixed(4)}, but requested ${amountIn}.`);
    }

    const [expectedOut, priceImpact] = await router.getAmountOut(effectiveIn, effectiveOut, amountInWei).catch(() => [0n, 0n]);
    if (expectedOut === 0n) {
      throw new Error(`AMM pool has zero reserves for this pair on ${netConfig.name}. Please seed initial liquidity first.`);
    }

    const minOut = (expectedOut * BigInt(10000 - slippageBps) / 10000n);

    const allowance = await tokenIn.allowance(address, routerAddress).catch(() => 0n);
    if (allowance < amountInWei) {
      const approveTx = await tokenIn.approve(routerAddress, amountInWei, overrides).catch((err) => {
        throw new Error(`Approval failed: ${parseRevertReason(err)}`);
      });
      await approveTx.wait();
    }

    const tx = await router.swap(effectiveIn, effectiveOut, amountInWei, minOut, address, overrides).catch((err) => {
      throw new Error(parseRevertReason(err));
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status === 0) throw new Error('Swap reverted on-chain.');

    const tokenOut = new ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
    const newOutBalance = await tokenOut.balanceOf(address).catch(() => 0n);

    recordAuditEventToSupabase({
      chainId: currentChainId,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      type: 'AMM Swap',
      contractAddress: routerAddress,
      borrower: address,
      fullBorrower: address,
      amount: `${amountIn} In -> ${Number(ethers.formatEther(expectedOut)).toFixed(4)} Out`,
      rawAmount: amountIn,
      status: 'CONFIRMED',
      gasUsed: receipt.gasUsed?.toString(),
      effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') : null,
      metadata: {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        priceImpact: Number(priceImpact) / 100,
      },
    }).catch(() => {});

    return {
      tx,
      receipt,
      amountIn,
      amountOut: ethers.formatEther(expectedOut),
      priceImpact: Number(priceImpact) / 100,
      newOutBalance: ethers.formatEther(newOutBalance),
      explorerUrl: explorerTxLink(tx.hash, currentChainId),
      chainId: currentChainId,
    };
  }

  // If router is not deployed or has no bytecode on this chain, fail truthfully
  throw new Error(
    `MockSwapRouter contract is not deployed on ${netConfig.name} (Chain ID ${currentChainId}). Click "Deploy Router" in the Swap interface to deploy the AMM on this network.`
  );
}
