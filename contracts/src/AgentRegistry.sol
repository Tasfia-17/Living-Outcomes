// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentRegistry (ERC-8004 compatible)
/// @notice Issues on-chain agent identity to strategy creators.
///         Each agent ID is a bytes32 derived from creator address + salt.
///         Achievements (wins, sales, improvement certifications) are
///         appended on-chain — forming a permanent reputation record.
///
/// The registry is used by StrategyNFT to bind agent identity to tokens.

contract AgentRegistry {
    struct Agent {
        address wallet;
        bytes32 agentId;
        uint64  registeredAt;
        uint32  totalSales;
        uint32  totalForks;
        int32   cumulativeScoreBps; // sum of all reported performance scores
    }

    address public owner;
    mapping(address => bytes32) public agentIdOf;
    mapping(bytes32 => Agent)   public agents;

    event AgentRegistered(address indexed wallet, bytes32 indexed agentId);
    event AchievementRecorded(bytes32 indexed agentId, string kind, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    function register() external returns (bytes32 agentId) {
        require(agentIdOf[msg.sender] == bytes32(0), "ALREADY_REGISTERED");
        agentId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.prevrandao));
        agentIdOf[msg.sender] = agentId;
        agents[agentId] = Agent({
            wallet:               msg.sender,
            agentId:              agentId,
            registeredAt:         uint64(block.timestamp),
            totalSales:           0,
            totalForks:           0,
            cumulativeScoreBps:   0
        });
        emit AgentRegistered(msg.sender, agentId);
    }

    function recordSale(bytes32 agentId) external onlyOwner {
        agents[agentId].totalSales++;
        emit AchievementRecorded(agentId, "SALE", agents[agentId].totalSales);
    }

    function recordFork(bytes32 agentId) external onlyOwner {
        agents[agentId].totalForks++;
        emit AchievementRecorded(agentId, "FORK", agents[agentId].totalForks);
    }

    function recordScore(bytes32 agentId, int32 scoreBps) external onlyOwner {
        agents[agentId].cumulativeScoreBps += scoreBps;
        emit AchievementRecorded(agentId, "SCORE", uint256(uint32(scoreBps)));
    }

    function getAgent(bytes32 agentId) external view returns (Agent memory) {
        return agents[agentId];
    }

    function getAgentByWallet(address wallet) external view returns (Agent memory) {
        return agents[agentIdOf[wallet]];
    }
}
