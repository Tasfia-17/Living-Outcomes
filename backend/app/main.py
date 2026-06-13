from fastapi import FastAPI
from app.routes.health import router as health_router
from app.routes.strategies import router as strategies_router
from app.routes.bundles import router as bundles_router
from app.routes.leaderboard import router as leaderboard_router
from app.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version=settings.app_version)
    app.include_router(health_router)
    app.include_router(strategies_router, prefix="/api/v1")
    app.include_router(bundles_router, prefix="/api/v1")
    app.include_router(leaderboard_router, prefix="/api/v1")
    return app


app = create_app()
