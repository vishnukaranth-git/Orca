import sys
import os
from pathlib import Path

# Add project root directory to Python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app

# Export for Vercel Serverless WSGI/ASGI handler
__all__ = ["app"]
