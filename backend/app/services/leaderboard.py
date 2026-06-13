"""
Leaderboard service — ranks strategies by their on-chain EWA score
from the PerformanceOracle. Pure computation, no writes.
"""
from app.services.strategy import StrategyService
from app.models.domain import Strategy, LeaderboardEntry


class LeaderboardService:
    def __init__(self, strategy_service: StrategyService):
        self._strategies = strategy_service

    def get(self, limit: int = 20) -> list[LeaderboardEntry]:
        all_strats = self._strategies.list_all()
        active = [s for s in all_strats if s.active and s.latest_score_bps is not None]
        sorted_strats = sorted(active, key=lambda s: s.latest_score_bps or 0, reverse=True)
        return [
            LeaderboardEntry(rank=i + 1, strategy=s, score_bps=s.latest_score_bps or 0)
            for i, s in enumerate(sorted_strats[:limit])
        ]
