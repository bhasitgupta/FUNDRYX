// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AccessManager} from "../contracts/core/AccessManager.sol";
import {PauseController} from "../contracts/core/PauseController.sol";
import {FundryxToken} from "../contracts/core/FundryxToken.sol";
import {FundrexUSD} from "../contracts/core/FundrexUSD.sol";
import {FundrexCrossChainRouter} from "../contracts/core/FundrexCrossChainRouter.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract FundrexCrossChainRouterTest is Test {
    using MessageHashUtils for bytes32;

    AccessManager internal accessManager;
    PauseController internal pauseController;
    FundryxToken internal fdx;
    FundrexUSD internal fusd;
    FundrexCrossChainRouter internal router;

    address internal admin = address(0xAA11);
    address internal admin2 = address(0xAA22);
    address internal user = address(0xBB11);
    address internal recipient = address(0xCC11);

    uint256 internal sentinelPk = 0x5E471;
    address internal sentinel;

    uint256 internal amoyChainId = 80002;
    uint256 internal monadChainId = 10143;
    uint256 internal fujiChainId = 43113;

    function setUp() public {
        sentinel = vm.addr(sentinelPk);

        vm.startPrank(admin);
        accessManager = new AccessManager(admin, admin2);
        pauseController = new PauseController(address(accessManager));

        fdx = new FundryxToken(admin);
        fusd = new FundrexUSD(admin);

        router = new FundrexCrossChainRouter(address(accessManager), address(pauseController));

        // Grant roles
        accessManager.grantRole(accessManager.MONITOR_SIGNER_ROLE(), sentinel);

        // Configure supported pairs: Amoy -> Monad (FDX and fUSD)
        router.setSupportedTokenPair(address(fdx), monadChainId, address(fdx), true);
        router.setSupportedTokenPair(address(fusd), monadChainId, address(fusd), true);

        // Configure Monad -> Amoy
        router.setSupportedTokenPair(address(fdx), amoyChainId, address(fdx), true);
        router.setSupportedTokenPair(address(fusd), amoyChainId, address(fusd), true);

        // Configure Fuji -> Monad and Fuji -> Amoy
        router.setSupportedTokenPair(address(fdx), fujiChainId, address(fdx), true);
        router.setSupportedTokenPair(address(fusd), fujiChainId, address(fusd), true);

        // Mint test tokens
        fdx.mint(user, 1000e18);
        fusd.mint(user, 1000e6);

        // Seed router liquidity for destination payouts
        fdx.mint(address(router), 10000e18);
        fusd.mint(address(router), 10000e6);

        vm.stopPrank();

        vm.deal(user, 10 ether);
        vm.deal(address(router), 10 ether);
    }

    function test_initiate_bridge_transfer_erc20_success() public {
        vm.startPrank(user);
        fdx.approve(address(router), 100e18);

        // 100 FDX with 0.25% fee = 0.25 FDX fee -> 99.75 FDX net
        bytes32 transferId = router.initiateBridgeTransfer(
            address(fdx),
            100e18,
            monadChainId,
            address(fdx),
            recipient,
            99e18
        );

        assertTrue(transferId != bytes32(0));
        assertTrue(router.initiatedTransfers(transferId));
        assertEq(fdx.balanceOf(user), 900e18);
        vm.stopPrank();
    }

    function test_initiate_slippage_protection_reverts() public {
        vm.startPrank(user);
        fdx.approve(address(router), 100e18);

        // User asks for 99.9 FDX min, but after 0.25% fee (99.75 FDX), it reverts
        vm.expectRevert();
        router.initiateBridgeTransfer(
            address(fdx),
            100e18,
            monadChainId,
            address(fdx),
            recipient,
            999e17 // 99.9 FDX
        );
        vm.stopPrank();
    }

    function test_destination_execution_with_sentinel_signature() public {
        bytes32 transferId = keccak256("TRANSFER_001");
        uint256 amountOut = 9975e16; // 99.75 FDX

        // Construct attestation hash matching contract abi.encode
        bytes32 msgHash = keccak256(
            abi.encode(
                transferId,
                block.chainid,
                monadChainId,
                address(fdx),
                address(fdx),
                recipient,
                amountOut
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(sentinelPk, msgHash.toEthSignedMessageHash());
        bytes memory sig = abi.encodePacked(r, s, v);

        uint256 recipientBalBefore = fdx.balanceOf(recipient);

        // Execute destination settlement
        router.executeDestinationTransfer(
            transferId,
            monadChainId,
            address(fdx),
            address(fdx),
            recipient,
            amountOut,
            sig
        );

        assertTrue(router.executedTransfers(transferId));
        assertEq(fdx.balanceOf(recipient), recipientBalBefore + amountOut);
    }

    function test_destination_execution_recipient_direct_claim() public {
        bytes32 transferId = keccak256("TRANSFER_DIRECT_CLAIM");
        uint256 amountOut = 25e18;

        uint256 recipientBalBefore = fdx.balanceOf(recipient);

        // Recipient calls destination transfer directly without signature
        vm.prank(recipient);
        router.executeDestinationTransfer(
            transferId,
            monadChainId,
            address(fdx),
            address(fdx),
            recipient,
            amountOut,
            ""
        );

        assertTrue(router.executedTransfers(transferId));
        assertEq(fdx.balanceOf(recipient), recipientBalBefore + amountOut);
    }

    function test_replay_protection_prevents_duplicate_execution() public {
        bytes32 transferId = keccak256("TRANSFER_REPLAY");
        uint256 amountOut = 50e18;

        bytes32 msgHash = keccak256(
            abi.encode(
                transferId,
                block.chainid,
                monadChainId,
                address(fdx),
                address(fdx),
                recipient,
                amountOut
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(sentinelPk, msgHash.toEthSignedMessageHash());
        bytes memory sig = abi.encodePacked(r, s, v);

        // First execution succeeds
        router.executeDestinationTransfer(
            transferId,
            monadChainId,
            address(fdx),
            address(fdx),
            recipient,
            amountOut,
            sig
        );

        // Duplicate execution reverts with TransferAlreadyExecuted
        vm.expectRevert();
        router.executeDestinationTransfer(
            transferId,
            monadChainId,
            address(fdx),
            address(fdx),
            recipient,
            amountOut,
            sig
        );
    }

    function test_unauthorized_sentinel_signature_reverts() public {
        bytes32 transferId = keccak256("TRANSFER_UNAUTH");
        uint256 amountOut = 50e18;
        uint256 attackerPk = 0xBADB01;

        bytes32 msgHash = keccak256(
            abi.encode(
                transferId,
                block.chainid,
                monadChainId,
                address(fdx),
                address(fdx),
                recipient,
                amountOut
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerPk, msgHash.toEthSignedMessageHash());
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.expectRevert(FundrexCrossChainRouter.InvalidSentinelSignature.selector);
        router.executeDestinationTransfer(
            transferId,
            monadChainId,
            address(fdx),
            address(fdx),
            recipient,
            amountOut,
            sig
        );
    }

    function test_pause_controller_blocks_transfers() public {
        vm.prank(admin);
        pauseController.setDepositsPaused(true);

        vm.startPrank(user);
        fdx.approve(address(router), 100e18);

        vm.expectRevert(PauseController.DepositsArePaused.selector);
        router.initiateBridgeTransfer(
            address(fdx),
            100e18,
            monadChainId,
            address(fdx),
            recipient,
            90e18
        );
        vm.stopPrank();
    }
}
