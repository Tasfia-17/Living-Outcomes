// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PerformanceOracle
/// @notice Records verified on-chain performance snapshots for strategies.
///
/// The reporter (a trusted backend key) submits a snapshot: return bps,
/// max drawdown bps, sample size (number of trades), and timestamp.
/// Snapshots are append-only — historical record is never deleted.
///
/// The contract exposes:
///   - latest snapshot per strategy
///   - cumulative score (EWA of returns over last N snapshots)
///   - leaderboard helpers (off-chain sorting, on-chain raw data)
///
/// This is the "Performance Truth" layer: on-chain, permanent,
/// independently verifiable by anyone.

contract PerformanceOracle {
    struct Snapshot {
        int32  returnBps;      // signed: +1200 = +12%, -500 = -5%
        uint16 maxDrawdownBps; // 0-10000
        uint32 sampleSize;     // number of trades in this window
        uint64 recordedAt;     // block.timestamp
        address reporter;
    }

    address public owner;
    mapping(address => bool) public reporters;

    // strategyId => ordered snapshots
    mapping(uint256 => Snapshot[]) private _snapshots;

    // strategyId => aggregated score (int32, updated on each snapshot)
    // Score = exponential-weighted average return over last 10 snapshots
    mapping(uint256 => int32) public latestScore;

    event ReporterSet(address indexed reporter, bool active);
    event SnapshotRecorded(
        uint256 indexed strategyId,
        int32 returnBps,
        uint16 maxDrawdownBps,
        uint32 sampleSize,
        uint64 recordedAt
    );
    event ScoreUpdated(uint256 indexed strategyId, int32 oldScore, int32 newScore);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyReporter() {
        require(reporters[msg.sender], "NOT_REPORTER");
        _;
    }

    function setReporter(address reporter, bool active) external onlyOwner {
        reporters[reporter] = active;
        emit ReporterSet(reporter, active);
    }

    function record(
        uint256 strategyId,
        int32   returnBps,
        uint16  maxDrawdownBps,
        uint32  sampleSize
    ) external onlyReporter {
        require(maxDrawdownBps <= 10_000, "DRAWDOWN_OOB");

        _snapshots[strategyId].push(Snapshot({
            returnBps:     returnBps,
            maxDrawdownBps: maxDrawdownBps,
            sampleSize:    sampleSize,
            recordedAt:    uint64(block.timestamp),
            reporter:      msg.sender
        }));

        int32 oldScore = latestScore[strategyId];
        int32 newScore = _computeEWA(strategyId);
        latestScore[strategyId] = newScore;

        emit SnapshotRecorded(strategyId, returnBps, maxDrawdownBps, sampleSize, uint64(block.timestamp));
        if (newScore != oldScore) emit ScoreUpdated(strategyId, oldScore, newScore);
    }

    /// @notice Exponential-weighted average over last 10 snapshots.
    ///         Weight halves every step going back: 512, 256, 128 … 1.
    ///         Simple integer EWA — precision is sufficient for bps-level returns.
    function _computeEWA(uint256 strategyId) internal view returns (int32) {
        Snapshot[] storage snaps = _snapshots[strategyId];
        uint256 n = snaps.length;
        if (n == 0) return 0;

        uint256 window = n < 10 ? n : 10;
        int256 weightedSum;
        int256 totalWeight;
        uint256 w = 1;

        for (uint256 i = 0; i < window; i++) {
            int256 ret = int256(snaps[n - 1 - i].returnBps);
            weightedSum += ret * int256(w);
            totalWeight  += int256(w);
            w *= 2;
        }

        return int32(weightedSum / totalWeight);
    }

    function snapshotCount(uint256 strategyId) external view returns (uint256) {
        return _snapshots[strategyId].length;
    }

    function getSnapshot(uint256 strategyId, uint256 index) external view returns (Snapshot memory) {
        return _snapshots[strategyId][index];
    }

    function latestSnapshot(uint256 strategyId) external view returns (Snapshot memory) {
        Snapshot[] storage snaps = _snapshots[strategyId];
        require(snaps.length > 0, "NO_DATA");
        return snaps[snaps.length - 1];
    }
}
