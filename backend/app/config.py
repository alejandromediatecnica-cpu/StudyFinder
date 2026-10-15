from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "studyfinder")

_ORIGENES_LOCALES = "http://localhost:4200,http://127.0.0.1:4200"
CORS_ORIGINS = [
    origen.strip()
    for origen in os.getenv("CORS_ORIGINS", _ORIGENES_LOCALES).split(",")
    if origen.strip()
]

PORT = int(os.getenv("PORT", "8000"))
