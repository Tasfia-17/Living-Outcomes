// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StrategyNFT} from "./StrategyNFT.sol";

/// @title StrategyMarketplace
/// @notice Handles single-strategy purchases and the full royalty split
///         logic: platform fee → parent creator royalty → seller.
///
/// Payment token is native (MNT on Mantle). All splits are calculated
/// in pure integer basis-point arithmetic — no floating point.

contract StrategyMarketplace {
    StrategyNFT public immutable strategyNFT;

    uint16 public constant PLATFORM_FEE_BPS = 500; // 5%

    address public treasury;
    address public owner;

    event StrategySold(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee,
        uint256 parentRoyalty,
        uint256 sellerNet
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

    /// @notice Buy access to a strategy. Does NOT transfer NFT ownership —
    ///         it transfers a copy fee. NFT owner retains the original.
    ///         Excess ether is refunded.
    function buy(uint256 tokenId) external payable {
        StrategyNFT.Strategy memory s = strategyNFT.getStrategy(tokenId);
        require(s.active, "STRATEGY_INACTIVE");
        require(msg.value >= s.priceWei, "UNDERPAID");

        uint256 price = s.priceWei;
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / 10_000;
        uint256 afterPlatform = price - platformFee;

        uint256 parentRoyalty = 0;
        if (s.parentId != 0 && s.parentRoyaltyBps > 0) {
            parentRoyalty = (price * s.parentRoyaltyBps) / 10_000;
        }

        uint256 sellerNet = afterPlatform - parentRoyalty;

        address seller = strategyNFT.ownerOf(tokenId);

        // ── Transfers ────────────────────────────────────────────────
        _send(treasury, platformFee);

        if (parentRoyalty > 0) {
            address parentCreator = strategyNFT.getStrategy(s.parentId).creator;
            _send(parentCreator, parentRoyalty);
        }

        _send(seller, sellerNet);

        // Refund overpayment
        if (msg.value > price) {
            _send(msg.sender, msg.value - price);
        }

        emit StrategySold(tokenId, msg.sender, seller, price, platformFee, parentRoyalty, sellerNet);
    }

    function _send(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok,) = payable(to).call{value: amount}("");
        require(ok, "TRANSFER_FAILED");
    }

    receive() external payable {}
}
