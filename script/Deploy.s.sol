// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AccessManager} from "../contracts/core/AccessManager.sol";
import {PauseController} from "../contracts/core/PauseController.sol";
import {FundryxToken} from "../contracts/core/FundryxToken.sol";
import {FundrexUSD} from "../contracts/core/FundrexUSD.sol";
import {CreditHistoryRegistry} from "../contracts/lending/CreditHistoryRegistry.sol";
import {CreditPolicy} from "../contracts/lending/CreditPolicy.sol";
import {LendingPool} from "../contracts/lending/LendingPool.sol";
import {RiskAttestationRegistry} from "../contracts/monitoring/RiskAttestationRegistry.sol";

/// @title DeployFundryx
/// @notice Deployment script for Fundryx M1 (Lending) on Polygon Amoy
contract DeployFundryx is Script {
    function run() external {
        // Validate chain: Polygon Amoy (80002), Monad Testnet (10143), Monad Mainnet (143)
        require(
            block.chainid == 80002 || block.chainid == 10143 || block.chainid == 143,
            "Must deploy on supported chain (Polygon Amoy 80002, Monad Testnet 10143, Monad Mainnet 143)"
        );

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerKey);

        // 1. AccessManager
        address secondAdmin = vm.envOr("SECOND_ADMIN", deployer);
        if (secondAdmin == deployer) {
            secondAdmin = address(0x1111111111111111111111111111111111111111);
        }
        AccessManager accessManager = new AccessManager(deployer, secondAdmin);
        console.log("AccessManager:", address(accessManager));

        // 2. PauseController
        PauseController pauseController = new PauseController(address(accessManager));
        console.log("PauseController:", address(pauseController));

        // 3. FundryxToken (test ERC-20 utility asset)
        FundryxToken token = new FundryxToken(deployer);
        console.log("FundryxToken (FDX):", address(token));

        // 3b. FundrexUSD (test ERC-20 6-decimal stable asset)
        FundrexUSD fusd = new FundrexUSD(deployer);
        console.log("FundrexUSD (fUSD):", address(fusd));

        // 4. CreditHistoryRegistry
        CreditHistoryRegistry historyRegistry = new CreditHistoryRegistry(address(accessManager));
        console.log("CreditHistoryRegistry:", address(historyRegistry));

        // 5. CreditPolicy
        CreditPolicy creditPolicy = new CreditPolicy(address(accessManager), address(historyRegistry));
        console.log("CreditPolicy:", address(creditPolicy));

        // 6. LendingPool (30 day default grace period = 7 days)
        LendingPool lendingPool = new LendingPool(
            address(accessManager),
            address(pauseController),
            address(creditPolicy),
            address(historyRegistry),
            address(token),
            7 days // default grace period
        );
        console.log("LendingPool:", address(lendingPool));

        // 7. RiskAttestationRegistry
        RiskAttestationRegistry riskRegistry = new RiskAttestationRegistry(address(accessManager));
        console.log("RiskAttestationRegistry:", address(riskRegistry));

        // 8. Configure roles: grant LENDING_POOL_ROLE to LendingPool
        accessManager.grantRole(accessManager.LENDING_POOL_ROLE(), address(lendingPool));
        console.log("Granted LENDING_POOL_ROLE to LendingPool");

        // 9. Grant OPERATOR_ROLE to deployer for operational tasks
        accessManager.grantRole(accessManager.OPERATOR_ROLE(), deployer);
        console.log("Granted OPERATOR_ROLE to deployer");

        // 10. Mint test tokens to deployer (1,000,000 FDX for testnet)
        token.mint(deployer, 1_000_000e18);
        console.log("Minted 1,000,000 FDX to deployer");

        vm.stopBroadcast();

        console.log("\n=== Fundryx M1 Deployment Complete ===");
        console.log("Next steps:");
        console.log("1. Set MONITOR_SIGNER_ROLE for AI monitor key");
        console.log("2. Deposit liquidity into LendingPool");
        console.log("3. Distribute test tokens to borrowers");
        console.log("4. Verify contracts on Polygonscan");
    }
}
