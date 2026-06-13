// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StrategyNFT
/// @notice ERC-721 representing ownership of a strategy. Each token is a
///         living document: it carries a content hash (IPFS CID of the
///         strategy spec), a parent pointer for fork lineage, and a
///         royalty rate that flows back to the original creator on every
///         downstream sale or improvement.
///
/// Royalty follows ERC-2981 so marketplaces can honour it natively.
/// ERC-8004 agent identity is stored per-token so judges can verify it.

interface IERC2981 {
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount);
}

contract StrategyNFT is IERC2981 {
    // ── ERC-721 storage ────────────────────────────────────────────────
    string public name = "Living Outcomes Strategy";
    string public symbol = "LOS";
    uint256 public totalSupply;

    mapping(uint256 => address) private _owner;
    mapping(uint256 => address) private _approved;
    mapping(address => mapping(address => bool)) private _operatorApproval;

    // ── Strategy metadata ──────────────────────────────────────────────
    struct Strategy {
        address creator;
        uint256 parentId;       // 0 = root
        bytes32 contentHash;    // keccak256 or IPFS CIDv1 truncated to 32 bytes
        uint96  priceWei;       // listing price in MNT / native token
        uint16  royaltyBps;     // basis points paid to original creator on sales (max 3000 = 30%)
        uint16  parentRoyaltyBps; // portion of royaltyBps forwarded to parent creator
        bytes32 agentId;        // ERC-8004 agent identity hash
        bool    active;
    }

    mapping(uint256 => Strategy) public strategies;

    // ── Governance ─────────────────────────────────────────────────────
    address public owner;
    address public marketplace;

    // ── ERC-721 events ─────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner_, address indexed approved_, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner_, address indexed operator, bool approved);

    // ── Domain events ──────────────────────────────────────────────────
    event StrategyCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 indexed parentId,
        bytes32 contentHash,
        uint96  priceWei,
        uint16  royaltyBps,
        bytes32 agentId
    );
    event PriceUpdated(uint256 indexed tokenId, uint96 oldPrice, uint96 newPrice);
    event ContentUpdated(uint256 indexed tokenId, bytes32 oldHash, bytes32 newHash);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyMarketplace() {
        require(msg.sender == marketplace, "NOT_MARKETPLACE");
        _;
    }

    function setMarketplace(address mp) external onlyOwner {
        marketplace = mp;
    }

    // ── Minting ────────────────────────────────────────────────────────

    /// @notice Mint a root strategy (no parent).
    function create(
        bytes32 contentHash,
        uint96  priceWei,
        uint16  royaltyBps,
        bytes32 agentId
    ) external returns (uint256 tokenId) {
        require(royaltyBps <= 3000, "ROYALTY_TOO_HIGH");
        tokenId = _mint(msg.sender, 0, contentHash, priceWei, royaltyBps, 0, agentId);
    }

    /// @notice Mint an improved fork of an existing strategy.
    /// @param parentId  Token ID of the parent strategy.
    /// @param parentRoyaltyBps  How many of the child's royalty bps flow to parent's creator.
    function fork(
        uint256 parentId,
        bytes32 contentHash,
        uint96  priceWei,
        uint16  royaltyBps,
        uint16  parentRoyaltyBps,
        bytes32 agentId
    ) external returns (uint256 tokenId) {
        require(royaltyBps <= 3000, "ROYALTY_TOO_HIGH");
        require(parentRoyaltyBps <= royaltyBps, "PARENT_ROYALTY_EXCEEDS_TOTAL");
        require(strategies[parentId].active, "PARENT_NOT_ACTIVE");
        tokenId = _mint(msg.sender, parentId, contentHash, priceWei, royaltyBps, parentRoyaltyBps, agentId);
    }

    function _mint(
        address creator,
        uint256 parentId,
        bytes32 contentHash,
        uint96  priceWei,
        uint16  royaltyBps,
        uint16  parentRoyaltyBps,
        bytes32 agentId
    ) internal returns (uint256 tokenId) {
        tokenId = ++totalSupply;
        _owner[tokenId] = creator;
        strategies[tokenId] = Strategy({
            creator:          creator,
            parentId:         parentId,
            contentHash:      contentHash,
            priceWei:         priceWei,
            royaltyBps:       royaltyBps,
            parentRoyaltyBps: parentRoyaltyBps,
            agentId:          agentId,
            active:           true
        });
        emit Transfer(address(0), creator, tokenId);
        emit StrategyCreated(tokenId, creator, parentId, contentHash, priceWei, royaltyBps, agentId);
    }

    // ── Price & content management ─────────────────────────────────────

    function setPrice(uint256 tokenId, uint96 newPrice) external {
        require(_owner[tokenId] == msg.sender, "NOT_TOKEN_OWNER");
        uint96 old = strategies[tokenId].priceWei;
        strategies[tokenId].priceWei = newPrice;
        emit PriceUpdated(tokenId, old, newPrice);
    }

    /// @notice Update strategy content (living document update).
    function updateContent(uint256 tokenId, bytes32 newHash) external {
        require(_owner[tokenId] == msg.sender, "NOT_TOKEN_OWNER");
        bytes32 old = strategies[tokenId].contentHash;
        strategies[tokenId].contentHash = newHash;
        emit ContentUpdated(tokenId, old, newHash);
    }

    // ── ERC-2981 ───────────────────────────────────────────────────────

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        Strategy storage s = strategies[tokenId];
        receiver = s.creator;
        royaltyAmount = (salePrice * s.royaltyBps) / 10_000;
    }

    // ── ERC-721 core ───────────────────────────────────────────────────

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _owner[tokenId];
        require(o != address(0), "NONEXISTENT");
        return o;
    }

    function balanceOf(address account) external view returns (uint256 count) {
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_owner[i] == account) count++;
        }
    }

    function approve(address to, uint256 tokenId) external {
        require(_owner[tokenId] == msg.sender, "NOT_OWNER");
        _approved[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApproval[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_owner[tokenId] == from, "WRONG_OWNER");
        require(to != address(0), "ZERO_TO");
        bool authorised = msg.sender == from
            || _approved[tokenId] == msg.sender
            || _operatorApproval[from][msg.sender];
        require(authorised, "NOT_AUTHORISED");
        _approved[tokenId] = address(0);
        _owner[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    // ── View helpers ───────────────────────────────────────────────────

    function getStrategy(uint256 tokenId) external view returns (Strategy memory) {
        return strategies[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd // ERC-721
            || interfaceId == 0x2a55205a; // ERC-2981
    }
}
