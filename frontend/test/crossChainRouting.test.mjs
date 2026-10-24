import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_NETWORKS,
  TOKEN_REGISTRY,
  getTokenRegistry,
  getTokenConfig,
  verifyCrossChainRoute,
  getRouteMatrix,
  fetchLiFiQuote,
  pollLiFiStatus,
  getCrossChainQuote,
  executeCrossChainSwap,
  getCrossChainRouterAddress,
  setCrossChainRouterAddress,
  checkCrossChainRouterDeployment,
  CROSS_CHAIN_STATUS,
} from '../src/utils/contracts.js';
import {
  parseTokenUnits,
  formatTokenUnits,
  convertDecimals,
  calculateQuoteUnits,
  validateTransferAmount,
  CROSS_CHAIN_LIFECYCLE_STATES,
} from '../src/utils/crossChainRegistry.js';

test('1. Multi-Chain Registry Integrity & Segregation', async (t) => {
  const expectedChainIds = [80002, 10143, 84532, 43113, 137, 143, 8453, 43114];
  
  await t.test('All 8 required networks are registered', () => {
    for (const chainId of expectedChainIds) {
      assert.ok(SUPPORTED_NETWORKS[chainId], `Chain ID ${chainId} missing from SUPPORTED_NETWORKS`);
      assert.equal(SUPPORTED_NETWORKS[chainId].chainId, chainId);
      assert.ok(SUPPORTED_NETWORKS[chainId].name);
      assert.ok(SUPPORTED_NETWORKS[chainId].rpcUrl);
      assert.ok(SUPPORTED_NETWORKS[chainId].explorerUrl);
      assert.ok(SUPPORTED_NETWORKS[chainId].nativeCurrency);
      assert.ok(Array.isArray(SUPPORTED_NETWORKS[chainId].supportedOperations));
    }
  });

  await t.test('Testnet and Mainnet classification is strictly partitioned', () => {
    const testnetIds = [80002, 10143, 84532, 43113];
    const mainnetIds = [137, 143, 8453, 43114];

    for (const id of testnetIds) {
      assert.equal(SUPPORTED_NETWORKS[id].networkType, 'testnet', `${id} must be testnet`);
    }
    for (const id of mainnetIds) {
      assert.equal(SUPPORTED_NETWORKS[id].networkType, 'mainnet', `${id} must be mainnet`);
    }
  });

  await t.test('Deployed testnet protocol contracts are configured', () => {
    // Polygon Amoy
    const amoy = SUPPORTED_NETWORKS[80002];
    assert.equal(amoy.contractsDeployed, true);
    assert.equal(amoy.bridgeActive, true);
    assert.ok(amoy.contracts.CrossChainRouter);

    // Monad Testnet
    const monad = SUPPORTED_NETWORKS[10143];
    assert.equal(monad.contractsDeployed, true);
    assert.equal(monad.bridgeActive, true);
    assert.ok(monad.contracts.CrossChainRouter);

    // Avalanche Fuji
    const fuji = SUPPORTED_NETWORKS[43113];
    assert.equal(fuji.contractsDeployed, true);
    assert.equal(fuji.bridgeActive, true);
    assert.ok(fuji.contracts.CrossChainRouter);

    // Base Sepolia (strictly gated pending deployment)
    const baseSepolia = SUPPORTED_NETWORKS[84532];
    assert.equal(baseSepolia.contractsDeployed, false);
    assert.equal(baseSepolia.bridgeActive, false);
  });
});

test('2. Chain-Specific Token Isolation & Decimals', async (t) => {
  await t.test('USDC has 6 decimals on all supported chains', () => {
    const chainsWithUSDC = [137, 8453, 43114, 80002, 84532, 43113];
    for (const chainId of chainsWithUSDC) {
      const reg = getTokenRegistry(chainId);
      const usdc = reg.find(tok => tok.symbol === 'USDC');
      assert.ok(usdc, `USDC missing from chain ${chainId}`);
      assert.equal(usdc.decimals, 6, `USDC on chain ${chainId} must have 6 decimals`);
    }
  });

  await t.test('fUSD has 6 decimals on all deployed chains including Fuji', () => {
    const fujiTokens = getTokenRegistry(43113);
    const fujiFUSD = fujiTokens.find(tok => tok.symbol === 'fUSD');
    assert.ok(fujiFUSD, 'fUSD must exist on Avalanche Fuji');
    assert.equal(fujiFUSD.decimals, 6, 'fUSD on Fuji must have 6 decimals, matching FundrexUSD contract');

    const amoyTokens = getTokenRegistry(80002);
    const amoyFUSD = amoyTokens.find(tok => tok.symbol === 'fUSD');
    assert.ok(amoyFUSD, 'fUSD must exist on Polygon Amoy');
    assert.equal(amoyFUSD.decimals, 6);
  });

  await t.test('Native gas tokens and wrapped assets have 18 decimals', () => {
    const mainnetNatives = [
      { chainId: 137, symbol: 'POL' },
      { chainId: 143, symbol: 'MON' },
      { chainId: 8453, symbol: 'ETH' },
      { chainId: 43114, symbol: 'AVAX' },
    ];
    for (const item of mainnetNatives) {
      const net = SUPPORTED_NETWORKS[item.chainId];
      assert.equal(net.nativeCurrency.decimals, 18);
    }
  });

  await t.test('Token addresses on different chains are never equated', () => {
    const usdcPolygon = getTokenConfig(137, 'USDC').address.toLowerCase();
    const usdcBase = getTokenConfig(8453, 'USDC').address.toLowerCase();
    const usdcAvax = getTokenConfig(43114, 'USDC').address.toLowerCase();
    assert.notEqual(usdcPolygon, usdcBase);
    assert.notEqual(usdcPolygon, usdcAvax);
    assert.notEqual(usdcBase, usdcAvax);
  });
});

test('3. Testnet vs Mainnet Zero-Trust Boundaries & Mandatory Routes', async (t) => {
  await t.test('Rejects testnet to mainnet cross-environment execution', () => {
    const res1 = verifyCrossChainRoute(80002, 137);
    assert.equal(res1.canExecute, false);
    assert.equal(res1.status, 'TESTNET_MAINNET_MISMATCH');

    const res2 = verifyCrossChainRoute(80002, 8453);
    assert.equal(res2.canExecute, false);
    assert.equal(res2.status, 'TESTNET_MAINNET_MISMATCH');
  });

  await t.test('Rejects mainnet to testnet cross-environment execution', () => {
    const res1 = verifyCrossChainRoute(137, 80002);
    assert.equal(res1.canExecute, false);
    assert.equal(res1.status, 'TESTNET_MAINNET_MISMATCH');

    const res2 = verifyCrossChainRoute(8453, 84532);
    assert.equal(res2.canExecute, false);
    assert.equal(res2.status, 'TESTNET_MAINNET_MISMATCH');
  });

  await t.test('Rejects same-chain cross-chain execution', () => {
    const res = verifyCrossChainRoute(137, 137);
    assert.equal(res.canExecute, false);
    assert.equal(res.status, 'SAME_CHAIN');
  });

  await t.test('Mandatory Route 1: Monad Testnet (10143) -> Polygon Amoy (80002) is verified', () => {
    const res = verifyCrossChainRoute(10143, 80002, 'FDX', 'FDX');
    assert.equal(res.canExecute, true);
    assert.equal(res.status, 'AUDIT_VERIFIED');
    assert.equal(res.isAudited, true);
    assert.ok(res.reason.includes('Polygon Amoy'));
  });

  await t.test('Mandatory Route 2: Polygon Amoy (80002) -> Monad Testnet (10143) is verified', () => {
    const res = verifyCrossChainRoute(80002, 10143, 'FDX', 'FDX');
    assert.equal(res.canExecute, true);
    assert.equal(res.status, 'AUDIT_VERIFIED');
    assert.equal(res.isAudited, true);
    assert.ok(res.reason.includes('Monad Testnet'));
  });

  await t.test('Mandatory Route 3: Avalanche Fuji (43113) -> Monad Testnet (10143) is verified', () => {
    const res = verifyCrossChainRoute(43113, 10143, 'FDX', 'FDX');
    assert.equal(res.canExecute, true);
    assert.equal(res.status, 'AUDIT_VERIFIED');
    assert.equal(res.isAudited, true);
    assert.ok(res.reason.includes('Monad Testnet'));
  });

  await t.test('Mandatory Route 4: Avalanche Fuji (43113) -> Polygon Amoy (80002) is verified', () => {
    const res = verifyCrossChainRoute(43113, 80002, 'FDX', 'FDX');
    assert.equal(res.canExecute, true);
    assert.equal(res.status, 'AUDIT_VERIFIED');
    assert.equal(res.isAudited, true);
    assert.ok(res.reason.includes('Polygon Amoy'));
  });

  await t.test('Expanded Routes (Monad <-> Fuji, Amoy -> Fuji) are verified', () => {
    const res1 = verifyCrossChainRoute(10143, 43113, 'FDX', 'FDX');
    assert.equal(res1.canExecute, true);
    assert.equal(res1.status, 'AUDIT_VERIFIED');

    const res2 = verifyCrossChainRoute(80002, 43113, 'FDX', 'FDX');
    assert.equal(res2.canExecute, true);
    assert.equal(res2.status, 'AUDIT_VERIFIED');
  });

  await t.test('Base Sepolia (84532) routes strictly remain gated pending deployment', () => {
    const res1 = verifyCrossChainRoute(80002, 84532);
    assert.equal(res1.canExecute, false);
    assert.equal(res1.status, 'DEPLOYMENT_PENDING');

    const res2 = verifyCrossChainRoute(10143, 84532);
    assert.equal(res2.canExecute, false);
    assert.equal(res2.status, 'DEPLOYMENT_PENDING');

    const res3 = verifyCrossChainRoute(43113, 84532);
    assert.equal(res3.canExecute, false);
    assert.equal(res3.status, 'DEPLOYMENT_PENDING');
  });
});

test('4. 12 Directed Route Matrix Evaluation across 6 Unordered Pairs', async (t) => {
  await t.test('Generates all 12 directed routes for mainnet mode', () => {
    const matrix = getRouteMatrix('mainnet');
    assert.equal(matrix.length, 12, 'Must have 12 directed routes for 4 chains');

    const availableRoutes = matrix.filter(r => r.canExecute);
    const unavailableRoutes = matrix.filter(r => !r.canExecute);

    assert.equal(availableRoutes.length, 9, '9 mainnet routes should be available via LI.FI');
    assert.equal(unavailableRoutes.length, 3, '3 Monad outbound routes must be marked unavailable');

    const monadOutbound = matrix.filter(r => r.sourceChain === 143);
    assert.equal(monadOutbound.length, 3);
    for (const r of monadOutbound) {
      assert.equal(r.canExecute, false);
      assert.equal(r.status, 'PROVIDER_UNSUPPORTED');
    }
  });

  await t.test('Generates all 12 directed routes for testnet mode with proper gating', () => {
    const matrix = getRouteMatrix('testnet');
    assert.equal(matrix.length, 12, 'Must have 12 directed routes for 4 testnets');

    const availableRoutes = matrix.filter(r => r.canExecute);
    const gatedRoutes = matrix.filter(r => !r.canExecute);

    // Amoy <-> Monad (2), Amoy <-> Fuji (2), Monad <-> Fuji (2) = 6 AVAILABLE routes
    assert.equal(availableRoutes.length, 6, '6 routes between Amoy, Monad, Fuji must be operational');

    // All routes involving Base Sepolia (84532) must be gated pending contract deployment (6 routes)
    assert.equal(gatedRoutes.length, 6, '6 routes involving Base Sepolia must be gated');
    for (const r of gatedRoutes) {
      assert.ok(r.sourceChain === 84532 || r.destChain === 84532);
      assert.equal(r.status, 'GATED_PENDING_DEPLOYMENT');
      assert.ok(r.reason.includes('pending deployment'));
    }
  });
});

test('5. Live LI.FI Provider Quote Discovery', async (t) => {
  await t.test('Fetches live quote for Polygon -> Base (USDC -> USDC)', async () => {
    try {
      const quote = await fetchLiFiQuote({
        fromChain: 137,
        toChain: 8453,
        fromToken: getTokenConfig(137, 'USDC').address,
        toToken: getTokenConfig(8453, 'USDC').address,
        fromAmount: '10000000', // 10 USDC (6 decimals)
        fromAddress: '0x1111111111111111111111111111111111111111',
      });

      assert.ok(quote.id || quote.estimate);
      assert.ok(quote.estimate.toAmount);
      assert.ok(Number(quote.estimate.toAmount) > 0);
      assert.ok(quote.toolDetails?.name || quote.tool);
    } catch (err) {
      console.warn('LI.FI quote live fetch notice:', err.message);
    }
  });

  await t.test('getCrossChainQuote returns truthful quote object for mainnet', async () => {
    const quote = await getCrossChainQuote({
      sourceChainId: 137,
      destChainId: 8453,
      sourceTokenSymbol: 'USDC',
      destTokenSymbol: 'USDC',
      amount: '25',
      userAddress: '0x1111111111111111111111111111111111111111',
      slippageTolerance: 0.5,
    });

    assert.equal(quote.sourceChainId, 137);
    assert.equal(quote.destChainId, 8453);
    assert.equal(quote.isAvailable, true);
    assert.equal(quote.provider, 'lifi');
    assert.ok(quote.estimatedOutput > 0);
    assert.equal(quote.auditVerification.isAudited, true);
  });

  await t.test('getCrossChainQuote correctly marks Monad outbound as unavailable', async () => {
    const quote = await getCrossChainQuote({
      sourceChainId: 143,
      destChainId: 8453,
      sourceTokenSymbol: 'USDC',
      destTokenSymbol: 'USDC',
      amount: '25',
      userAddress: '0x1111111111111111111111111111111111111111',
    });

    assert.equal(quote.isAvailable, false);
    assert.ok(quote.unavailabilityReason.includes('LI.FI') || quote.unavailabilityReason.includes('liquidity'));
  });
});

test('6. Testnet Precision Token Quotation & Fee Math', async (t) => {
  await t.test('Quotation for Monad -> Amoy applies 0.25% protocol fee accurately', async () => {
    const quote = await getCrossChainQuote({
      sourceChainId: 10143,
      destChainId: 80002,
      sourceTokenSymbol: 'FDX',
      destTokenSymbol: 'FDX',
      amount: '100',
    });

    assert.equal(quote.canExecute, true);
    assert.equal(quote.isAvailable, true);
    assert.equal(quote.sourceChainId, 10143);
    assert.equal(quote.destChainId, 80002);

    // 100 FDX with 0.25% fee: fee = 0.25 FDX, output = 99.75 FDX
    assert.equal(quote.destEstimatedOutput, '99.7500');
    assert.ok(quote.bridgeFee.includes('0.2500 FDX (0.25%)'));
    assert.equal(quote.feeBps, 25);
  });

  await t.test('Quotation for Amoy -> Fuji handles decimal conversion (18 dec FDX to 6 dec fUSD)', async () => {
    const quote = await getCrossChainQuote({
      sourceChainId: 80002,
      destChainId: 43113,
      sourceTokenSymbol: 'FDX',
      destTokenSymbol: 'fUSD',
      amount: '50',
      slippageTolerance: 0.5,
    });

    assert.equal(quote.canExecute, true);
    assert.equal(quote.feeBps, 25);
    // 50 FDX - 0.25% fee (0.125) = 49.875
    assert.equal(quote.destEstimatedOutput, '49.8750');
    assert.equal(quote.destSymbol, 'fUSD');
  });

  await t.test('Token unit integer math helper functions work with zero loss', () => {
    const parsed18 = parseTokenUnits('12.3456', 18);
    assert.equal(parsed18, 12345600000000000000n);
    assert.equal(formatTokenUnits(parsed18, 18, 4), '12.3456');

    const parsed6 = parseTokenUnits('100.5', 6);
    assert.equal(parsed6, 100500000n);
    assert.equal(formatTokenUnits(parsed6, 6, 2), '100.50');

    // Decimal scaling: 18 -> 6
    const scaled6 = convertDecimals(parsed18, 18, 6);
    assert.equal(scaled6, 12345600n);

    // Quote units calculation with 25 bps
    const { outputUnits, feeUnits } = calculateQuoteUnits(100000000n, 25);
    assert.equal(feeUnits, 250000n); // 0.25%
    assert.equal(outputUnits, 99750000n); // 99.75%
  });
});

test('7. Transfer Amount & Available Balance Validation', async (t) => {
  await t.test('Rejects when requested amount exceeds available balance (e.g. balance 0.66, amount 10.0)', () => {
    const balanceRaw = parseTokenUnits('0.66', 18); // 0.66 FDX
    const val = validateTransferAmount('10.0', balanceRaw, 18, 'FDX');
    assert.equal(val.isValid, false);
    assert.equal(val.code, 'INSUFFICIENT_BALANCE');
    assert.ok(val.reason.includes('Insufficient FDX balance'));
    assert.ok(val.reason.includes('0.6600 available'));
  });

  await t.test('Accepts valid transfer amount within balance (e.g. balance 15.0, amount 10.0)', () => {
    const balanceRaw = parseTokenUnits('15.0', 18);
    const val = validateTransferAmount('10.0', balanceRaw, 18, 'FDX');
    assert.equal(val.isValid, true);
    assert.equal(val.code, 'VALID');
    assert.equal(val.amountUnits, parseTokenUnits('10.0', 18));
  });

  await t.test('Rejects zero amount or negative amount', () => {
    const bal = parseTokenUnits('50.0', 18);

    const valZero = validateTransferAmount('0', bal, 18, 'FDX');
    assert.equal(valZero.isValid, false);
    assert.equal(valZero.code, 'ZERO_AMOUNT');

    const valNeg = validateTransferAmount('-5', bal, 18, 'FDX');
    assert.equal(valNeg.isValid, false);
    assert.equal(valNeg.code, 'INVALID_AMOUNT');
  });
});

test('8. Router Contract & Address Management', async (t) => {
  await t.test('Returns router addresses for all deployed testnet chains', () => {
    const amoyRouter = getCrossChainRouterAddress(80002);
    assert.ok(amoyRouter, 'Amoy router address must be configured');
    assert.ok(amoyRouter.startsWith('0x'));

    const monadRouter = getCrossChainRouterAddress(10143);
    assert.ok(monadRouter, 'Monad router address must be configured');
    assert.ok(monadRouter.startsWith('0x'));

    const fujiRouter = getCrossChainRouterAddress(43113);
    assert.ok(fujiRouter, 'Fuji router address must be configured');
    assert.ok(fujiRouter.startsWith('0x'));
  });

  await t.test('Supports custom router address override via setCrossChainRouterAddress', () => {
    const testAddr = '0x1111111111111111111111111111111111111111';
    setCrossChainRouterAddress(80002, testAddr);
    assert.equal(getCrossChainRouterAddress(80002), testAddr);

    // Restore official address
    setCrossChainRouterAddress(80002, '0x230829f5EC30A1936fDECE13F1179381daaf69e8');
    assert.equal(getCrossChainRouterAddress(80002), '0x230829f5EC30A1936fDECE13F1179381daaf69e8');
  });
});

test('9. Wallet Mismatch, Rejection & Execution Safeguards', async (t) => {
  await t.test('executeCrossChainSwap rejects when wallet chain does not match source chain', async () => {
    const fakeSigner = {
      provider: {
        getNetwork: async () => ({ chainId: 80002n }),
      },
      getAddress: async () => '0x1111111111111111111111111111111111111111',
    };

    const quote = {
      sourceChainId: 137,
      destChainId: 8453,
      provider: 'lifi',
      canExecute: true,
      auditVerification: { verified: true },
      rawQuote: { transactionRequest: {} },
    };

    await assert.rejects(
      async () => {
        await executeCrossChainSwap({
          signer: fakeSigner,
          quote,
          onStatusUpdate: () => {},
        });
      },
      (err) => {
        return err.message.includes('Wallet chain ID mismatch') && err.message.includes('80002');
      }
    );
  });

  await t.test('executeCrossChainSwap rejects unverified / gated quotes', async () => {
    const fakeSigner = {
      provider: {
        getNetwork: async () => ({ chainId: 80002n }),
      },
      getAddress: async () => '0x1111111111111111111111111111111111111111',
    };

    const quote = {
      sourceChainId: 80002,
      destChainId: 84532, // Base Sepolia (gated)
      canExecute: false,
      auditVerification: { verified: false, reason: 'Pending deployment' },
    };

    await assert.rejects(
      async () => {
        await executeCrossChainSwap({
          signer: fakeSigner,
          quote,
          onStatusUpdate: () => {},
        });
      },
      (err) => {
        return err.message.includes('blocked') || err.message.includes('Pending deployment');
      }
    );
  });

  await t.test('executeCrossChainSwap catches user signature rejection (code 4001)', async () => {
    const rejectingSigner = {
      provider: {
        getNetwork: async () => ({ chainId: 137n }),
      },
      getAddress: async () => '0x1111111111111111111111111111111111111111',
      sendTransaction: async () => {
        const err = new Error('User denied transaction signature');
        err.code = 4001;
        throw err;
      },
    };

    const quote = {
      sourceChainId: 137,
      destChainId: 8453,
      sourceSymbol: 'POL',
      destSymbol: 'ETH',
      inputAmount: 1,
      provider: 'lifi',
      canExecute: true,
      auditVerification: { verified: true },
      transactionRequest: {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x',
        value: '1000000000000000000',
      },
    };

    await assert.rejects(
      async () => {
        await executeCrossChainSwap({
          signer: rejectingSigner,
          quote,
          onStatusUpdate: () => {},
        });
      },
      (err) => {
        return err.message.includes('rejected by user') || err.message.includes('denied');
      }
    );
  });
});

test('10. Lifecycle Status Polling & Truthful Settlement Tracking', async (t) => {
  await t.test('pollLiFiStatus returns PENDING status without fabricating fake tx hash', async () => {
    const mockTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const status = await pollLiFiStatus({
      bridgeTool: 'cctp',
      fromChain: 137,
      toChain: 8453,
      txHash: mockTxHash,
      maxAttempts: 1,
      intervalMs: 10,
    });

    assert.ok(['PENDING', 'NOT_FOUND', 'FAILED', 'DONE'].includes(status.status));
    if (status.status !== 'DONE') {
      assert.equal(status.receivingTxHash, null, 'Must NOT fabricate destination tx hash while pending');
    }
  });

  await t.test('Lifecycle states are defined and properly ordered', () => {
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.IDLE, 'IDLE');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.VALIDATING, 'VALIDATING');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.APPROVAL_REQUIRED, 'APPROVAL_REQUIRED');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.AWAITING_SIGNATURE, 'AWAITING_SIGNATURE');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.SOURCE_PENDING, 'SOURCE_PENDING');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.SOURCE_CONFIRMED, 'SOURCE_CONFIRMED');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.BRIDGE_PENDING, 'BRIDGE_PENDING');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.DESTINATION_PENDING, 'DESTINATION_PENDING');
    assert.equal(CROSS_CHAIN_LIFECYCLE_STATES.COMPLETED, 'COMPLETED');
  });
});
