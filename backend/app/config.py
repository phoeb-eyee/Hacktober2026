"""Application configuration, loaded from environment / backend/.env.

Secrets live in `.env` (gitignored) and are read server-side only. They are
never returned to the frontend.
"""

import os

from dotenv import load_dotenv

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_BACKEND_DIR, ".env"))


class Settings:
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    gemma_model: str = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
    cors_origins: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if o.strip()
    ]
    max_image_bytes: int = 10 * 1024 * 1024  # 10 MB


settings = Settings()
