// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StrategyNFT} from "./StrategyNFT.sol";
import {StrategyMarketplace} from "./StrategyMarketplace.sol";

/// @title BundleRegistry
/// @notice A bundle is a curated set of strategy token IDs.
///         When a bundle is sold, revenue is split between the assembler
///         (fixed 70%) and all constituent strategy owners equally (30% / n).
///
/// The assembler only earns their cut — they do not re-sell the strategies.
/// Strategy creators retain their individual royalty rights.

contract BundleRegistry {
    StrategyNFT public immutable strategyNFT;

    uint16 public constant PLATFORM_FEE_BPS    = 500;  // 5%
    uint16 public constant ASSEMBLER_SHARE_BPS = 7000; // 70% of remainder
    // Contributors share: 30% of remainder, split equally

    address public treasury;
    address public owner;

    struct Bundle {
        address assembler;
        uint256[] strategyIds;
        uint96   priceWei;
        bool     active;
    }

    uint256 public nextBundleId = 1;
    mapping(uint256 => Bundle) private _bundles;

    event BundleCreated(uint256 indexed bundleId, address indexed assembler, uint256[] strategyIds, uint96 priceWei);
    event BundleSold(
        uint256 indexed bundleId,
        address indexed buyer,
        uint256 price,
        uint256 platformFee,
        uint256 assemblerShare,
        uint256 contributorShareEach
    );

    constructor(address nftAddress, address treasury_) {
        strategyNFT = StrategyNFT(nftAddress);
        treasury = treasury_;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    function setTreasury(address t) external onlyOwner {
        require(t != address(0), "ZERO");
        treasury = t;
    }

    function createBundle(uint256[] calldata strategyIds, uint96 priceWei)
        external
        returns (uint256 bundleId)
    {
        require(strategyIds.length >= 2 && strategyIds.length <= 20, "BUNDLE_SIZE");
        for (uint256 i = 0; i < strategyIds.length; i++) {
            require(strategyNFT.getStrategy(strategyIds[i]).active, "STRATEGY_INACTIVE");
        }
        bundleId = nextBundleId++;
        _bundles[bundleId] = Bundle({
            assembler:   msg.sender,
            strategyIds: strategyIds,
            priceWei:    priceWei,
            active:      true
        });
        emit BundleCreated(bundleId, msg.sender, strategyIds, priceWei);
    }

    function buyBundle(uint256 bundleId) external payable {
        Bundle storage b = _bundles[bundleId];
        require(b.active, "BUNDLE_INACTIVE");
        require(msg.value >= b.priceWei, "UNDERPAID");

        uint256 price = b.priceWei;
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / 10_000;
        uint256 remainder = price - platformFee;
        uint256 assemblerShare = (remainder * ASSEMBLER_SHARE_BPS) / 10_000;
        uint256 contributorPool = remainder - assemblerShare;
        uint256 n = b.strategyIds.length;
        uint256 perContributor = contributorPool / n;

        _send(treasury, platformFee);
        _send(b.assembler, assemblerShare);

        for (uint256 i = 0; i < n; i++) {
            address stratOwner = strategyNFT.ownerOf(b.strategyIds[i]);
            _send(stratOwner, perContributor);
        }

        // Remainder from integer division goes to treasury to avoid locking
        uint256 dust = contributorPool - (perContributor * n);
        if (dust > 0) _send(treasury, dust);

        if (msg.value > price) {
            _send(msg.sender, msg.value - price);
        }

        emit BundleSold(bundleId, msg.sender, price, platformFee, assemblerShare, perContributor);
    }

    function getBundle(uint256 bundleId) external view returns (Bundle memory) {
        return _bundles[bundleId];
    }

    function _send(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok,) = payable(to).call{value: amount}("");
        require(ok, "TRANSFER_FAILED");
    }

    receive() external payable {}
}
