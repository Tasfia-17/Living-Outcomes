"""
Domain models — pure Python dataclasses, no ORM dependency.
Used as the shared language between services, routes, and tests.
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Strategy:
    token_id: int
    creator: str           # checksummed address
    parent_id: int         # 0 = root
    content_hash: str      # 0x hex
    price_wei: int
    royalty_bps: int
    parent_royalty_bps: int
    agent_id: str          # 0x hex
    active: bool
    # Enriched fields (from oracle, off-chain)
    latest_score_bps: Optional[int] = None
    snapshot_count: int = 0


@dataclass
class Bundle:
    bundle_id: int
    assembler: str
    strategy_ids: list[int]
    price_wei: int
    active: bool


@dataclass
class PerformanceSnapshot:
    strategy_id: int
    return_bps: int
    max_drawdown_bps: int
    sample_size: int
    recorded_at: int       # unix timestamp


@dataclass
class Agent:
    wallet: str
    agent_id: str
    registered_at: int
    total_sales: int
    total_forks: int
    cumulative_score_bps: int


@dataclass
class SaleReceipt:
    token_id: int
    buyer: str
    seller: str
    price_wei: int
    platform_fee_wei: int
    parent_royalty_wei: int
    seller_net_wei: int
    tx_hash: str


@dataclass
class LeaderboardEntry:
    rank: int
    strategy: "Strategy"
    score_bps: int


@dataclass
class BundleSaleReceipt:
    bundle_id: int
    buyer: str
    price_wei: int
    platform_fee_wei: int
    assembler_share_wei: int
    contributor_share_each_wei: int
    tx_hash: str
