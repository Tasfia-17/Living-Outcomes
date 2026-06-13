from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.strategy import StrategyService
from app.dependencies import get_strategy_service

router = APIRouter(prefix="/strategies", tags=["strategies"])


class SnapshotIn(BaseModel):
    return_bps: int
    max_drawdown_bps: int
    sample_size: int


@router.get("/{token_id}")
def get_strategy(token_id: int, svc: StrategyService = Depends(get_strategy_service)):
    try:
        return svc.get(token_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/")
def list_strategies(svc: StrategyService = Depends(get_strategy_service)):
    return svc.list_all()


@router.get("/{strategy_id}/snapshots")
def get_snapshots(strategy_id: int, svc: StrategyService = Depends(get_strategy_service)):
    return svc.get_snapshots(strategy_id)


@router.post("/{strategy_id}/snapshots")
def submit_snapshot(
    strategy_id: int,
    body: SnapshotIn,
    svc: StrategyService = Depends(get_strategy_service),
):
    """Reporter-only: submit a verified performance snapshot on-chain."""
    tx = svc.submit_snapshot(
        strategy_id,
        body.return_bps,
        body.max_drawdown_bps,
        body.sample_size,
    )
    return {"tx_hash": tx}
