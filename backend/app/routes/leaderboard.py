from fastapi import APIRouter, Depends
from app.services.leaderboard import LeaderboardService
from app.dependencies import get_leaderboard_service

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/")
def get_leaderboard(
    limit: int = 20,
    svc: LeaderboardService = Depends(get_leaderboard_service),
):
    return svc.get(limit=min(limit, 100))
