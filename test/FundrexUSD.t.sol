// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FundrexUSD} from "../contracts/core/FundrexUSD.sol";

contract FundrexUSDTest is Test {
    FundrexUSD public fusd;
    address public owner = address(0xAA);
    address public user = address(0xBB);

    function setUp() public {
        vm.prank(owner);
        fusd = new FundrexUSD(owner);
    }

    function test_metadata() public view {
        assertEq(fusd.name(), "Fundrex USD");
        assertEq(fusd.symbol(), "fUSD");
        assertEq(fusd.decimals(), 6);
    }

    function test_mint_by_owner() public {
        vm.prank(owner);
        fusd.mint(user, 1_000 * 10**6); // 1,000 fUSD
        assertEq(fusd.balanceOf(user), 1_000 * 10**6);
    }

    function test_mint_unauthorized_reverts() public {
        vm.prank(user);
        vm.expectRevert();
        fusd.mint(user, 500 * 10**6);
    }

    function test_burn() public {
        vm.prank(owner);
        fusd.mint(user, 500 * 10**6);

        vm.prank(user);
        fusd.burn(100 * 10**6);
        assertEq(fusd.balanceOf(user), 400 * 10**6);
    }
}
