import sys
import os
from pathlib import Path

# Add api directory and project root to Python path
API_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = API_DIR.parent

for p in (str(API_DIR), str(PROJECT_ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception:
    from api.app.main import app

# Export for Vercel Serverless WSGI/ASGI handler
__all__ = ["app"]
