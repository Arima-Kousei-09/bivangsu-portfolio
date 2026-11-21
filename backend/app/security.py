
"""
Centralised security configuration for the portfolio API.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import RATE_LIMIT_STORAGE_URI


# ==========================================
# RATE LIMITER
# ==========================================

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60/minute"],
    storage_uri=RATE_LIMIT_STORAGE_URI,
    headers_enabled=False,
)
