from fastapi import APIRouter
from app.chain import ChainClient
from app.config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
def health():
    chain = ChainClient(settings.rpc_url)
    return {
        "status": "ok",
        "chain_connected": chain.is_connected(),
        "chain_id": settings.chain_id,
    }
