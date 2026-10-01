import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.search import router as search_router
from app.database import initialize_database

app = FastAPI(title="StudyFinder API", version="1.0.0")
@app.on_event("startup")
def startup() -> None:
    initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
app.include_router(auth_router)
app.include_router(documents_router)

@app.get("/")
def read_root():
    return {"message": "Backend de StudyFinder operando correctamente"}

