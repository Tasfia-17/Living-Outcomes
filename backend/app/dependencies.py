"""
Dependency injection — single point of construction for all services.
FastAPI's Depends() calls these functions once per request.
"""
from functools import lru_cache
from app.chain import ChainClient
from app.config import get_settings
from app.services.strategy import StrategyService
from app.services.bundle import BundleService
from app.services.leaderboard import LeaderboardService


@lru_cache
def _chain() -> ChainClient:
    return ChainClient(get_settings().rpc_url)


def get_strategy_service() -> StrategyService:
    return StrategyService(_chain(), get_settings())


def get_bundle_service() -> BundleService:
    return BundleService(_chain(), get_settings())


def get_leaderboard_service() -> LeaderboardService:
    return LeaderboardService(get_strategy_service())
