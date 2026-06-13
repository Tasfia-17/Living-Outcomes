from app.main import app

# Vercel expects a module-level `app` (ASGI callable)
__all__ = ["app"]
