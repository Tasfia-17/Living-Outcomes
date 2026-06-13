// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StrategyNFT} from "../src/StrategyNFT.sol";
import {StrategyMarketplace} from "../src/StrategyMarketplace.sol";
import {BundleRegistry} from "../src/BundleRegistry.sol";
import {PerformanceOracle} from "../src/PerformanceOracle.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

contract LivingOutcomesTest is Test {
    StrategyNFT       nft;
    StrategyMarketplace mp;
    BundleRegistry    bundles;
    PerformanceOracle oracle;
    AgentRegistry     agentReg;

    address treasury = makeAddr("treasury");
    address alice    = makeAddr("alice");
    address bob      = makeAddr("bob");
    address charlie  = makeAddr("charlie");
    address buyer    = makeAddr("buyer");

    function setUp() public {
        nft      = new StrategyNFT();
        mp       = new StrategyMarketplace(address(nft), treasury);
        bundles  = new BundleRegistry(address(nft), treasury);
        oracle   = new PerformanceOracle();
        agentReg = new AgentRegistry();

        nft.setMarketplace(address(mp));
        oracle.setReporter(address(this), true);

        vm.deal(buyer, 10 ether);
    }

    // ── Agent Registry ─────────────────────────────────────────────────

    function test_agentRegistration() public {
        vm.prank(alice);
        bytes32 id = agentReg.register();
        assertNotEq(id, bytes32(0));
        assertEq(agentReg.agentIdOf(alice), id);
        assertEq(agentReg.getAgent(id).wallet, alice);
    }

    function test_cannotRegisterTwice() public {
        vm.prank(alice);
        agentReg.register();
        vm.expectRevert("ALREADY_REGISTERED");
        vm.prank(alice);
        agentReg.register();
    }

    // ── Strategy creation ──────────────────────────────────────────────

    function test_createRootStrategy() public {
        vm.prank(alice);
        uint256 id = nft.create(keccak256("strategy-v1"), 1 ether, 1000, bytes32("agent1"));
        assertEq(id, 1);
        StrategyNFT.Strategy memory s = nft.getStrategy(id);
        assertEq(s.creator, alice);
        assertEq(s.parentId, 0);
        assertEq(s.priceWei, 1 ether);
        assertEq(s.royaltyBps, 1000);
        assertTrue(s.active);
    }

    function test_forkStrategy() public {
        vm.prank(alice);
        uint256 parentId = nft.create(keccak256("strategy-v1"), 1 ether, 1000, bytes32("agent1"));

        vm.prank(bob);
        uint256 childId = nft.fork(parentId, keccak256("strategy-v2"), 1.5 ether, 1500, 500, bytes32("agent2"));

        StrategyNFT.Strategy memory child = nft.getStrategy(childId);
        assertEq(child.parentId, parentId);
        assertEq(child.creator, bob);
        assertEq(child.parentRoyaltyBps, 500);
    }

    function test_forkRoyaltyCannotExceedTotal() public {
        vm.prank(alice);
        uint256 parentId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        vm.prank(bob);
        vm.expectRevert("PARENT_ROYALTY_EXCEEDS_TOTAL");
        nft.fork(parentId, keccak256("s2"), 1 ether, 300, 500, bytes32("a2"));
    }

    // ── Marketplace: single strategy sale ─────────────────────────────

    function test_buySingleStrategy() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));

        uint256 aliceBefore   = alice.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        mp.buy{value: 1 ether}(tokenId);

        // Platform fee = 5% = 0.05 ether
        assertEq(treasury.balance - treasuryBefore, 0.05 ether);
        // No parent → alice gets 0.95 ether
        assertEq(alice.balance - aliceBefore, 0.95 ether);
    }

    function test_buySingleStrategyWithParentRoyalty() public {
        vm.prank(alice);
        uint256 parentId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));

        vm.prank(bob);
        // price 1 ether, total royalty 1500 bps, parent royalty 500 bps
        uint256 childId = nft.fork(parentId, keccak256("s2"), 1 ether, 1500, 500, bytes32("a2"));

        uint256 aliceBefore   = alice.balance;
        uint256 bobBefore     = bob.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        mp.buy{value: 1 ether}(childId);

        // platform: 5% of 1e18 = 0.05 ether
        assertEq(treasury.balance - treasuryBefore, 0.05 ether);
        // parent royalty: 500 bps of 1e18 = 0.05 ether to alice
        assertEq(alice.balance - aliceBefore, 0.05 ether);
        // bob gets remainder: 1 - 0.05 - 0.05 = 0.9 ether
        assertEq(bob.balance - bobBefore, 0.9 ether);
    }

    function test_overpaymentRefunded() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));

        uint256 buyerBefore = buyer.balance;
        vm.prank(buyer);
        mp.buy{value: 2 ether}(tokenId); // overpay by 1 ether
        // buyer spent exactly 1 ether (got 1 back)
        assertEq(buyerBefore - buyer.balance, 1 ether);
    }

    function test_underpaymentReverts() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        vm.prank(buyer);
        vm.expectRevert("UNDERPAID");
        mp.buy{value: 0.5 ether}(tokenId);
    }

    // ── Bundle ─────────────────────────────────────────────────────────

    function test_createAndBuyBundle() public {
        vm.prank(alice);
        uint256 s1 = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        vm.prank(bob);
        uint256 s2 = nft.create(keccak256("s2"), 1 ether, 1000, bytes32("a2"));

        uint256[] memory ids = new uint256[](2);
        ids[0] = s1; ids[1] = s2;

        vm.prank(charlie);
        uint256 bundleId = bundles.createBundle(ids, 2 ether);

        uint256 aliceBefore   = alice.balance;
        uint256 bobBefore     = bob.balance;
        uint256 charlieBefore = charlie.balance;
        uint256 treasuryBefore = treasury.balance;

        vm.prank(buyer);
        bundles.buyBundle{value: 2 ether}(bundleId);

        // platform 5% = 0.1 ether
        assertEq(treasury.balance - treasuryBefore, 0.1 ether);
        // remainder = 1.9 ether; assembler 70% = 1.33 ether; contributors 30% / 2 = 0.285 each
        assertEq(charlie.balance - charlieBefore, (1.9 ether * 7000) / 10_000);
        uint256 perContrib = (1.9 ether * 3000) / 10_000 / 2;
        assertEq(alice.balance - aliceBefore, perContrib);
        assertEq(bob.balance - bobBefore, perContrib);
    }

    function test_bundleRequiresMinSize() public {
        vm.prank(alice);
        uint256 s1 = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        uint256[] memory ids = new uint256[](1);
        ids[0] = s1;
        vm.prank(charlie);
        vm.expectRevert("BUNDLE_SIZE");
        bundles.createBundle(ids, 1 ether);
    }

    // ── Performance Oracle ─────────────────────────────────────────────

    function test_recordSnapshot() public {
        oracle.record(1, 1200, 500, 100);
        PerformanceOracle.Snapshot memory snap = oracle.latestSnapshot(1);
        assertEq(snap.returnBps, 1200);
        assertEq(snap.maxDrawdownBps, 500);
        assertEq(snap.sampleSize, 100);
        assertEq(oracle.snapshotCount(1), 1);
    }

    function test_scoreUpdatesWithMultipleSnapshots() public {
        // Record three snapshots, score should be EWA-weighted toward recent
        oracle.record(1, 1000, 300, 50);
        oracle.record(1, 1500, 200, 75);
        oracle.record(1, 2000, 100, 100);

        int32 score = oracle.latestScore(1);
        // EWA: weight doubles going back, so oldest (1000) pulls score down.
        // weights: newest=1, mid=2, oldest=4 → (2000*1 + 1500*2 + 1000*4) / 7 = 1285
        assertEq(score, 1285);
    }

    function test_onlyReporterCanRecord() public {
        vm.prank(alice);
        vm.expectRevert("NOT_REPORTER");
        oracle.record(1, 1200, 500, 100);
    }

    // ── Price update ───────────────────────────────────────────────────

    function test_ownerCanUpdatePrice() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        vm.prank(alice);
        nft.setPrice(tokenId, 2 ether);
        assertEq(nft.getStrategy(tokenId).priceWei, 2 ether);
    }

    function test_nonOwnerCannotUpdatePrice() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        vm.prank(bob);
        vm.expectRevert("NOT_TOKEN_OWNER");
        nft.setPrice(tokenId, 2 ether);
    }

    // ── ERC-2981 royalty info ──────────────────────────────────────────

    function test_royaltyInfo() public {
        vm.prank(alice);
        uint256 tokenId = nft.create(keccak256("s1"), 1 ether, 1000, bytes32("a1"));
        (address receiver, uint256 amount) = nft.royaltyInfo(tokenId, 1 ether);
        assertEq(receiver, alice);
        assertEq(amount, 0.1 ether); // 10% of 1 ether
    }
}
