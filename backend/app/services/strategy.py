"""
StrategyService — reads strategy data from the chain and enriches with oracle scores.
All writes (create, fork, setPrice) happen via signed transactions from the frontend
or a trusted operator; this service only exposes read + oracle-write paths.
"""
from app.chain import ChainClient
from app.config import Settings
from app.models.domain import Strategy, PerformanceSnapshot


class StrategyService:
    def __init__(self, chain: ChainClient, settings: Settings):
        self._chain = chain
        self._settings = settings

    def get(self, token_id: int) -> Strategy:
        raw = self._chain.call(
            self._settings.strategy_nft_address,
            "StrategyNFT",
            "getStrategy",
            token_id,
        )
        score = self._chain.call(
            self._settings.perf_oracle_address,
            "PerformanceOracle",
            "latestScore",
            token_id,
        )
        snap_count = self._chain.call(
            self._settings.perf_oracle_address,
            "PerformanceOracle",
            "snapshotCount",
            token_id,
        )
        return _map_strategy(token_id, raw, score, snap_count)

    def total_supply(self) -> int:
        return self._chain.call(
            self._settings.strategy_nft_address,
            "StrategyNFT",
            "totalSupply",
        )

    def list_all(self) -> list[Strategy]:
        n = self.total_supply()
        return [self.get(i) for i in range(1, n + 1)]

    def submit_snapshot(
        self,
        strategy_id: int,
        return_bps: int,
        max_drawdown_bps: int,
        sample_size: int,
    ) -> str:
        """Submit a performance snapshot on-chain (reporter key required)."""
        return self._chain.send(
            self._settings.perf_oracle_address,
            "PerformanceOracle",
            "record",
            self._settings.reporter_private_key,
            0,
            strategy_id,
            return_bps,
            max_drawdown_bps,
            sample_size,
        )

    def get_snapshots(self, strategy_id: int) -> list[PerformanceSnapshot]:
        n = self._chain.call(
            self._settings.perf_oracle_address,
            "PerformanceOracle",
            "snapshotCount",
            strategy_id,
        )
        snaps = []
        for i in range(n):
            raw = self._chain.call(
                self._settings.perf_oracle_address,
                "PerformanceOracle",
                "getSnapshot",
                strategy_id,
                i,
            )
            snaps.append(PerformanceSnapshot(
                strategy_id=strategy_id,
                return_bps=raw[0],
                max_drawdown_bps=raw[1],
                sample_size=raw[2],
                recorded_at=raw[3],
            ))
        return snaps


def _map_strategy(token_id: int, raw: tuple, score: int, snap_count: int) -> Strategy:
    return Strategy(
        token_id=token_id,
        creator=raw[0],
        parent_id=raw[1],
        content_hash=raw[2].hex() if isinstance(raw[2], bytes) else raw[2],
        price_wei=raw[3],
        royalty_bps=raw[4],
        parent_royalty_bps=raw[5],
        agent_id=raw[6].hex() if isinstance(raw[6], bytes) else raw[6],
        active=raw[7],
        latest_score_bps=score,
        snapshot_count=snap_count,
    )
