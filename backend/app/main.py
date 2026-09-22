import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.api.auth import router as auth_router
from app.api.search import router as search_router
from app.database import client, users_collection

app = FastAPI(title="StudyFinder API", version="1.0.0")
static_dir = Path(__file__).parent / "static"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory=static_dir),
    name="static"
)

app.include_router(search_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Backend de StudyFinder operando correctamente"}

@app.get("/home")
def home_page():
    return FileResponse(static_dir / "index.html")

@app.get("/test-mongodb")
def test_mongodb():
    try:
        client.admin.command("ping")

        return {
            "message": "MongoDB conectado correctamente",
            "database": "studyfinder_log"
        }

    except Exception as e:
        return {
            "error": str(e)
        }

@app.post("/test-user")
def create_test_user():
    user = {
        "name": "Usuario de prueba",
        "email": "test@studyfinder.com"
    }

    try:
        result = users_collection.insert_one(user)

        return {
            "message": "Usuario guardado correctamente",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        return {
            "error": str(e)
        }

@app.get("/test-users")
def get_test_users():
    try:
        users = list(users_collection.find())

        for user in users:
            user["_id"] = str(user["_id"])

        return {
            "users": users
        }

    except Exception as e:
        return {
            "error": str(e)
        }
