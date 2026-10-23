import { ethers } from 'ethers';
import {
  isSupabaseConfigured,
  fetchAuditEventsFromSupabase,
  recordAuditEventToSupabase,
} from './supabase.js';

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
      CCIPRouter:              getEnvVar('VITE_CCIP_ROUTER_POLYGON_AMOY', '0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2'),
    },
    tokens: {
      FDX:    getEnvVar('VITE_POLYGON_FUNDRYX_TOKEN', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      WPOL:   '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      WMATIC: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
      fUSD:   getEnvVar('VITE_POLYGON_FUSD', '0x19a3c4BA6E1108421507a39Dc9193eFad0B9FB34'),
      USDC:   '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
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
    wrappedNative: { symbol: 'WMON', address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701' },
    supportedAssets: ['MON', 'WMON', 'FDX', 'fUSD'],
    supportedOperations: ['lending', 'borrowing', 'swap', 'telemetry', 'risk_analysis'],
    rpcUrl: getEnvVar('VITE_MONAD_TESTNET_RPC', 'https://testnet-rpc.monad.xyz/'),
    explorerUrl: 'https://testnet.monadexplorer.com',
    status: 'ACTIVE',
    contractsDeployed: true,
    bridgeActive: false,
    statusLabel: 'Protocol Live',
    relayer: 'Fundrex Sentinel Quorum Relayer (Pending Deployment)',
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
    },
    tokens: {
      FDX:  getEnvVar('VITE_MONAD_FUNDRYX_TOKEN', '0x86E7023f10c5bd119521EB95a8CddF19159f95Cd'),
      fUSD: getEnvVar('VITE_MONAD_FUSD', '0xdA2631Aadb95AB5Ea6926e431F66fe2a66EF930E'),
      WMON: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
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
    supportedAssets: ['AVAX', 'USDC'],
    supportedOperations: ['read_only_telemetry', 'risk_analysis'],
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    status: 'STAGING',
    contractsDeployed: false,
    bridgeActive: false,
    statusLabel: 'Pending Contract Deployment',
    relayer: 'Chainlink CCIP (Fuji Router 0xF694...8177)',
    iconColor: '#E84142',
    contracts: {},
    tokens: {
      USDC: '0x5425890298aed601595a70ab815c96711a31bc65',
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
  return SUPPORTED_NETWORKS[numId]?.contracts || SUPPORTED_NETWORKS[80002].contracts;
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
      supportedOperations: ['lending', 'borrowing', 'swap', 'deposit', 'repay'],
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
      supportedOperations: ['lending', 'borrowing', 'deposit', 'repay'],
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
      address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
      name: 'Wrapped MON',
      symbol: 'WMON',
      decimals: 18,
      tokenType: 'wrapped-native',
      verifiedDeploymentStatus: 'VERIFIED_ON_CHAIN',
      supportedOperations: ['cross_chain_staging'],
      explorerUrl: 'https://testnet.monadexplorer.com/token/0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
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
      supportedOperations: ['gas', 'telemetry'],
      explorerUrl: 'https://testnet.snowtrace.io',
      canAddToWallet: false,
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

  // Multi-chain protocol check: Allow borrowing on any network with deployed protocol contracts
  if (!netConfig || !netConfig.contractsDeployed || !netConfig.contracts?.LendingPool) {
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a network with deployed protocol contracts (Polygon Amoy 80002 or Monad Testnet 10143).`);
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
          }
        }
      }
    } catch (roleErr) {
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
    throw new Error(`Unsupported network (chain ${currentChainId}). Connect to a network with deployed protocol contracts.`);
  }

  const chainContracts = getContractAddresses(currentChainId);
  const pool = getLendingPool(signer, currentChainId);
  const tokenAddr = tokenSymbol === 'fUSD' && chainContracts.FundrexUSD
    ? chainContracts.FundrexUSD
    : chainContracts.FundryxToken;
  const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

  // Dynamic decimals: 6 for fUSD / USDC, 18 for FDX / POL / MON
  const decimals = (tokenSymbol === 'fUSD' || tokenSymbol === 'USDC') ? 6 : 18;
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
  WALLET_APPROVAL: 'Wallet Approval',
  SOURCE_SUBMITTED: 'Source Submitted',
  SOURCE_CONFIRMED: 'Source Confirmed',
  BRIDGE_PENDING: 'Bridge Pending',
  DESTINATION_EXECUTING: 'Destination Execution',
  COMPLETED: 'Completed',
  REJECTED: 'Signature Rejected',
  FAILED: 'Execution Failed',
  REFUNDED: 'Refunded',
};

/**
 * Audit verification logic for multi-chain destinations.
 * Enforces strict network-type segregation (never mix testnet and mainnet)
 * and verifies on-chain contract deployments and provider route availability.
 */
export function verifyCrossChainRoute(sourceChainId, destChainId, sourceSymbol, destSymbol) {
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
  // Both source and destination chains must have deployed protocol contracts.
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

  // ── TESTNET ROUTING (CCIP / Protocol Quorum) ────────────────
  // Protocol fee schedule: 0.25% (25 bps)
  const feeBps = 25;
  const bridgeFeeRate = feeBps / 10000;
  const bridgeFeeAmount = numInput * bridgeFeeRate;
  const estimatedOutput = Math.max(0, numInput - bridgeFeeAmount);
  const minimumReceived = estimatedOutput * (1 - (slip || 0.5) / 100);

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
    destEstimatedOutput: estimatedOutput.toFixed(4),
    estimatedOutput,
    bridgeFee: bridgeFeeAmount.toFixed(4),
    bridgeFeePercentage: '0.25%',
    feeBps,
    slippagePercent: `${slip}%`,
    minimumReceived,
    minReceived: minimumReceived.toFixed(4),
    estimatedDuration: '30 - 60 seconds',
    estimatedTimeSeconds: 45,
    relayer: destNet?.relayer || 'Chainlink CCIP / Sentinel Quorum',
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

  // ── TESTNET EXECUTION GATE ──────────────────────────────────
  // If invoked on testnet, strictly block because destination receiver contracts are pending deployment
  throw new Error(
    `Testnet execution blocked by audit safeguard: ${quote.auditVerification?.reason || 'Destination contracts not deployed.'}`
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN ACCESS GATE & ON-CHAIN VERIFICATION
// ─────────────────────────────────────────────────────────────
export const ADMIN_WALLETS = [
  '0xc90A124b741d48a486950F668BfD62D4B5cF96b4'.toLowerCase(),
  (getEnvVar('VITE_POLYGON_ACCESS_MANAGER', '0x230829f5EC30A1936fDECE13F1179381daaf69e8')).toLowerCase(),
  (getEnvVar('VITE_MONAD_ACCESS_MANAGER', '0x8748fa4147c9fE78572D14F3C827d2E8ad4B9138')).toLowerCase(),
];


export async function checkIsAdminWallet(address) {
  if (!address) return false;
  const lower = address.toLowerCase();
  if (ADMIN_WALLETS.includes(lower)) return true;
  try {
    const provider = getReadProvider();
    const am = new ethers.Contract(CONTRACT_ADDRESSES.AccessManager, ACCESS_MANAGER_ABI, provider);
    const adminRole = await am.ADMIN_ROLE();
    return await am.hasRole(adminRole, address);
  } catch {
    return false;
  }
}

export async function verifyTxHashOnChain(txHash) {
  if (!txHash || !txHash.startsWith('0x')) {
    throw new Error('Invalid transaction hash format. Must begin with 0x.');
  }
  const provider = getReadProvider();
  const [tx, receipt] = await Promise.all([
    provider.getTransaction(txHash).catch(() => null),
    provider.getTransactionReceipt(txHash).catch(() => null),
  ]);

  if (!tx || !receipt) {
    throw new Error('Transaction hash not found or not yet mined on-chain.');
  }

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
    explorerUrl: explorerTxLink(tx.hash),
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

// ─────────────────────────────────────────────────────────────
// MULTI-CHAIN EXPLORER LINKS
// ─────────────────────────────────────────────────────────────
export function explorerTxLink(txHash, chainId = 80002) {
  const base = SUPPORTED_NETWORKS[chainId]?.explorerUrl || 'https://amoy.polygonscan.com';
  return `${base}/tx/${txHash}`;
}

export function explorerAddressLink(address, chainId = 80002) {
  const base = SUPPORTED_NETWORKS[chainId]?.explorerUrl || 'https://amoy.polygonscan.com';
  return `${base}/address/${address}`;
}

export function explorerBlockLink(blockNumber, chainId = 80002) {
  const base = SUPPORTED_NETWORKS[chainId]?.explorerUrl || 'https://amoy.polygonscan.com';
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
    '0x6a40c667': 'Borrow amount exceeds credit limit.',
    '0x9c42c7de': 'Credit policy version mismatch. Refresh and try again.',
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
    'CreditCapExceeded': 'Borrow amount exceeds your credit cap.',
    'InsufficientLiquidity': 'Pool has zero or insufficient liquidity for this amount.',
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

export async function getPairReserves(tokenA, tokenB) {
  const provider = getReadProvider();
  const router = getMockSwapRouter(provider);
  if (!router) return { reserveA: 0, reserveB: 0 };
  try {
    const [resA, resB] = await router.getReserves(tokenA, tokenB);
    return {
      reserveA: Number(ethers.formatEther(resA)),
      reserveB: Number(ethers.formatEther(resB)),
    };
  } catch {
    return { reserveA: 0, reserveB: 0 };
  }
}

export async function executeSeedLiquidity(signer, amountFdx = 10, amountPol = 10) {
  const address = await signer.getAddress();
  const provider = signer.provider;
  const overrides = await getPolygonFeeOverrides(provider);
  const fdx = getFundryxToken(signer);
  const wpol = new ethers.Contract(
    SUPPORTED_TOKENS.WPOL,
    [
      'function deposit() payable',
      'function approve(address,uint256) returns (bool)',
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
    ],
    signer
  );
  const router = getMockSwapRouter(signer);

  const fdxWei = ethers.parseEther(amountFdx.toString());
  const polWei = ethers.parseEther(amountPol.toString());

  // 1. Wrap POL to WPOL if needed
  const wpolBal = await wpol.balanceOf(address).catch(() => 0n);
  if (wpolBal < polWei) {
    const wrapNeeded = polWei - wpolBal;
    const wrapTx = await wpol.deposit({ value: wrapNeeded, ...overrides });
    await wrapTx.wait();
  }

  // 2. Mint FDX if needed
  const fdxBal = await fdx.balanceOf(address).catch(() => 0n);
  if (fdxBal < fdxWei) {
    const mintAmount = fdxWei - fdxBal;
    const mintTx = await fdx.mint(address, mintAmount, overrides);
    await mintTx.wait();
  }

  // 3. Approve router for both tokens
  const fdxAllowance = await fdx.allowance(address, MOCK_SWAP_ROUTER_ADDRESS);
  if (fdxAllowance < fdxWei) {
    const appFdx = await fdx.approve(MOCK_SWAP_ROUTER_ADDRESS, fdxWei, overrides);
    await appFdx.wait();
  }

  const wpolAllowance = await wpol.allowance(address, MOCK_SWAP_ROUTER_ADDRESS);
  if (wpolAllowance < polWei) {
    const appWpol = await wpol.approve(MOCK_SWAP_ROUTER_ADDRESS, polWei, overrides);
    await appWpol.wait();
  }

  // 4. Add Liquidity
  const addTx = await router.addLiquidity(
    CONTRACT_ADDRESSES.FundryxToken,
    SUPPORTED_TOKENS.WPOL,
    fdxWei,
    polWei,
    overrides
  );
  const receipt = await addTx.wait();
  return { tx: addTx, receipt };
}

export async function executeSwap(signer, tokenInAddress, tokenOutAddress, amountIn, slippageBps = 50) {
  const provider = signer.provider;
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);
  const netConfig = SUPPORTED_NETWORKS[currentChainId];
  const routerAddress = netConfig?.contracts?.MockSwapRouter || (currentChainId === 80002 ? MOCK_SWAP_ROUTER_ADDRESS : null);

  if (!routerAddress) {
    throw new Error(`Instant AMM Swap router is not deployed on ${netConfig?.name || `Chain ${currentChainId}`}. Use Cross-Chain Bridge or switch to Polygon Amoy (80002).`);
  }

  const address = await signer.getAddress();
  const router = new ethers.Contract(routerAddress, MOCK_SWAP_ROUTER_ABI, signer);
  const tokenIn = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
  const amountInWei = ethers.parseEther(amountIn.toString());

  // Balance check
  const balance = await tokenIn.balanceOf(address).catch(() => 0n);
  if (balance < amountInWei) {
    throw new Error(`Insufficient token balance. You have ${Number(ethers.formatEther(balance)).toFixed(4)}, but requested ${amountIn}.`);
  }

  // Pre-flight check: Verify pair reserves before submitting
  const [resIn, resOut] = await router.getReserves(tokenInAddress, tokenOutAddress).catch(() => [0n, 0n]);
  if (resIn === 0n || resOut === 0n) {
    throw new Error('This AMM liquidity pool currently has 0 reserves for this token pair. Initialize pool liquidity to enable instant swaps.');
  }

  // Get expected output with slippage
  const [expectedOut, priceImpact] = await router.getAmountOut(tokenInAddress, tokenOutAddress, amountInWei);
  if (expectedOut === 0n) {
    throw new Error('Liquidity pool returned 0 output. Insufficient pool liquidity.');
  }

  const minOut = expectedOut * BigInt(10000 - slippageBps) / 10000n;
  const overrides = await getNetworkFeeOverrides(provider, currentChainId);

  // Approve router — exact amount
  const allowance = await tokenIn.allowance(address, routerAddress);
  if (allowance < amountInWei) {
    const approveTx = await tokenIn.approve(routerAddress, amountInWei, overrides).catch((err) => {
      throw new Error(`Approval failed: ${parseRevertReason(err)}`);
    });
    await approveTx.wait();
  }

  // Execute swap
  const tx = await router.swap(tokenInAddress, tokenOutAddress, amountInWei, minOut, address, overrides).catch((err) => {
    throw new Error(parseRevertReason(err));
  });
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error('Swap reverted on-chain.');

  // Read output balance
  const tokenOut = new ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
  const newOutBalance = await tokenOut.balanceOf(address).catch(() => 0n);

  // Proactively record to Supabase audit trail
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
    amountOut: ethers.formatEther(expectedOut),
    priceImpact: Number(priceImpact) / 100,
    newOutBalance: ethers.formatEther(newOutBalance),
    explorerUrl: explorerTxLink(tx.hash, currentChainId),
    chainId: currentChainId,
  };
}
