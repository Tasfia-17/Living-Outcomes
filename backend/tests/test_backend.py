"""
Backend unit tests — no chain connection needed.
All chain calls are mocked. Tests verify service logic and API contracts.
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import create_app
from app.models.domain import Strategy, Bundle, LeaderboardEntry
from app.services.strategy import StrategyService
from app.services.bundle import BundleService
from app.services.leaderboard import LeaderboardService


# ── Fixtures ───────────────────────────────────────────────────────────

def make_strategy(token_id: int, score: int = 1200) -> Strategy:
    return Strategy(
        token_id=token_id,
        creator="0xAlice",
        parent_id=0,
        content_hash="0xabc",
        price_wei=10**18,
        royalty_bps=1000,
        parent_royalty_bps=0,
        agent_id="0xagent1",
        active=True,
        latest_score_bps=score,
        snapshot_count=3,
    )


def make_bundle(bundle_id: int) -> Bundle:
    return Bundle(
        bundle_id=bundle_id,
        assembler="0xCharlie",
        strategy_ids=[1, 2],
        price_wei=2 * 10**18,
        active=True,
    )


# ── Leaderboard Service ────────────────────────────────────────────────

class TestLeaderboardService:
    def test_ranks_by_score_descending(self):
        strat_svc = MagicMock(spec=StrategyService)
        strat_svc.list_all.return_value = [
            make_strategy(1, score=500),
            make_strategy(2, score=2000),
            make_strategy(3, score=1200),
        ]
        lb = LeaderboardService(strat_svc)
        entries = lb.get()
        assert entries[0].rank == 1
        assert entries[0].score_bps == 2000
        assert entries[1].score_bps == 1200
        assert entries[2].score_bps == 500

    def test_filters_inactive(self):
        strat_svc = MagicMock(spec=StrategyService)
        inactive = make_strategy(99, score=9999)
        inactive.active = False
        strat_svc.list_all.return_value = [make_strategy(1, 1000), inactive]
        lb = LeaderboardService(strat_svc)
        entries = lb.get()
        assert len(entries) == 1
        assert entries[0].strategy.token_id == 1

    def test_respects_limit(self):
        strat_svc = MagicMock(spec=StrategyService)
        strat_svc.list_all.return_value = [make_strategy(i, i * 100) for i in range(1, 11)]
        lb = LeaderboardService(strat_svc)
        entries = lb.get(limit=3)
        assert len(entries) == 3


# ── API routes ─────────────────────────────────────────────────────────

@pytest.fixture
def client():
    app = create_app()
    strat_svc = MagicMock(spec=StrategyService)
    bundle_svc = MagicMock(spec=BundleService)
    lb_svc = MagicMock(spec=LeaderboardService)

    strat_svc.get.return_value = make_strategy(1)
    strat_svc.list_all.return_value = [make_strategy(1), make_strategy(2)]
    strat_svc.get_snapshots.return_value = []
    bundle_svc.get.return_value = make_bundle(1)
    bundle_svc.list_all.return_value = [make_bundle(1)]
    lb_svc.get.return_value = [LeaderboardEntry(rank=1, strategy=make_strategy(1), score_bps=1200)]

    from app import dependencies
    app.dependency_overrides[dependencies.get_strategy_service] = lambda: strat_svc
    app.dependency_overrides[dependencies.get_bundle_service]   = lambda: bundle_svc
    app.dependency_overrides[dependencies.get_leaderboard_service] = lambda: lb_svc

    return TestClient(app)


class TestStrategyRoutes:
    def test_get_strategy(self, client):
        resp = client.get("/api/v1/strategies/1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["token_id"] == 1
        assert data["creator"] == "0xAlice"

    def test_list_strategies(self, client):
        resp = client.get("/api/v1/strategies/")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_snapshots(self, client):
        resp = client.get("/api/v1/strategies/1/snapshots")
        assert resp.status_code == 200
        assert resp.json() == []


class TestBundleRoutes:
    def test_get_bundle(self, client):
        resp = client.get("/api/v1/bundles/1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["bundle_id"] == 1
        assert data["strategy_ids"] == [1, 2]

    def test_list_bundles(self, client):
        resp = client.get("/api/v1/bundles/")
        assert resp.status_code == 200
        assert len(resp.json()) == 1


class TestLeaderboardRoute:
    def test_leaderboard(self, client):
        resp = client.get("/api/v1/leaderboard/")
        assert resp.status_code == 200
        data = resp.json()
        assert data[0]["rank"] == 1
        assert data[0]["score_bps"] == 1200


class TestHealthRoute:
    def test_health(self, client):
        with patch("app.routes.health.ChainClient") as MockChain:
            MockChain.return_value.is_connected.return_value = True
            resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"
