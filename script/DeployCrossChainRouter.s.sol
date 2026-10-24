// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {FundrexCrossChainRouter} from "../contracts/core/FundrexCrossChainRouter.sol";
import {AccessManager} from "../contracts/core/AccessManager.sol";
import {PauseController} from "../contracts/core/PauseController.sol";

/// @title DeployCrossChainRouter
/// @notice Deploys and initializes FundrexCrossChainRouter across supported testnets
contract DeployCrossChainRouter is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address accessManagerAddr = vm.envAddress("ACCESS_MANAGER_ADDRESS");
        address pauseControllerAddr = vm.envAddress("PAUSE_CONTROLLER_ADDRESS");

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("AccessManager:", accessManagerAddr);
        console.log("PauseController:", pauseControllerAddr);

        vm.startBroadcast(deployerKey);

        FundrexCrossChainRouter router = new FundrexCrossChainRouter(accessManagerAddr, pauseControllerAddr);
        console.log("FundrexCrossChainRouter deployed at:", address(router));

        // Configure default supported chains: Polygon Amoy (80002), Monad Testnet (10143), Avalanche Fuji (43113), Base Sepolia (84532)
        router.setSupportedChain(80002, true);
        router.setSupportedChain(10143, true);
        router.setSupportedChain(43113, true);
        router.setSupportedChain(84532, true);

        vm.stopBroadcast();
    }
}
