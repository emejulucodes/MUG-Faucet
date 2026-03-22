// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MUGToken.sol";

contract MUGTokenTest is Test {
    MUGToken public mugToken;
    address public user1;
    address public user2;

    function setUp() public {
        user1 = address(0x1);
        user2 = address(0x2);

        mugToken = new MUGToken();
    }

    function test_InitialSupply() public {
        uint256 expectedInitialSupply = 1_000_000 * 10**18;
        assertEq(mugToken.totalSupply(), expectedInitialSupply);
    }

    function test_FirstRequestToken() public {
        vm.prank(user1);
        mugToken.requestToken();

        assertEq(mugToken.balanceOf(user1), mugToken.CLAIM_AMOUNT());
    }

    function test_CannotClaimTwiceWithin24Hours() public {
        vm.prank(user1);
        mugToken.requestToken();

        vm.prank(user1);
        vm.expectRevert("MUGToken: Must wait 24 hours between claims");
        mugToken.requestToken();
    }

    function test_CanClaimAfter24Hours() public {
        vm.prank(user1);
        mugToken.requestToken();

        vm.warp(block.timestamp + 24 hours);

        vm.prank(user1);
        mugToken.requestToken();

        assertEq(mugToken.balanceOf(user1), 2 * mugToken.CLAIM_AMOUNT());
    }

    function test_OwnerCanMint() public {
        uint256 mintAmount = 500_000 * 10**18;
        mugToken.mint(user1, mintAmount);

        assertEq(mugToken.balanceOf(user1), mintAmount);
    }

    function test_NonOwnerCannotMint() public {
        uint256 mintAmount = 100 * 10**18;

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        mugToken.mint(user1, mintAmount);
    }

    function test_CannotMintExceedingMaxSupply() public {
        uint256 currentSupply = mugToken.totalSupply();
        uint256 remainingSupply = mugToken.MAX_SUPPLY() - currentSupply;

        vm.expectRevert("MUGToken: Minting would exceed maximum supply");
        mugToken.mint(user1, remainingSupply + 1);
    }

    function test_RequestTokenWhenSupplyAtMax() public {
        uint256 currentSupply = mugToken.totalSupply();
        uint256 mintable = mugToken.MAX_SUPPLY() - currentSupply;
        mugToken.mint(address(this), mintable);

        vm.prank(user1);
        vm.expectRevert("MUGToken: Exceeds maximum supply");
        mugToken.requestToken();
    }

    function test_MintThenRequestSupplyFlow() public {
        mugToken.mint(user2, 1_000 * 10**18);

        vm.prank(user1);
        mugToken.requestToken();

        assertEq(mugToken.balanceOf(user2), 1_000 * 10**18);
        assertEq(mugToken.balanceOf(user1), mugToken.CLAIM_AMOUNT());
    }
}
