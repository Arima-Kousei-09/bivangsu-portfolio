
"""
Centralised application configuration.

Loads environment variables from backend/.env.
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# Locate backend/.env regardless of the working directory.
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(
    dotenv_path=ENV_FILE,
    override=False,
)


def get_list_setting(name: str, default: str = "") -> list[str]:
    """Read a comma-separated environment variable."""
    value = os.getenv(name, default)

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


# Application environment
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()

if APP_ENV not in {"development", "production"}:
    raise ValueError(
        "APP_ENV must be either 'development' or 'production'."
    )


# Host configuration
ALLOWED_HOSTS = get_list_setting(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1",
)


# CORS configuration
CORS_ORIGINS = get_list_setting(
    "CORS_ORIGINS",
    "http://localhost:5500,http://127.0.0.1:5500",
)


# Rate limiting configuration
RATE_LIMIT_STORAGE_URI = os.getenv(
    "RATE_LIMIT_STORAGE_URI",
    "memory://",
).strip()


# Production safeguards
if APP_ENV == "production":

    if not ALLOWED_HOSTS:
        raise RuntimeError(
            "ALLOWED_HOSTS must be configured in production."
        )

    if not CORS_ORIGINS:
        raise RuntimeError(
            "CORS_ORIGINS must be configured in production."
        )

    if RATE_LIMIT_STORAGE_URI.startswith("memory://"):
        raise RuntimeError(
            "Production requires a shared rate-limit storage backend."
        )
