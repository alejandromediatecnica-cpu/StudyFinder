import os
import sqlite3
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "studyfinder_log")

client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)

db = client[MONGODB_DATABASE]

users_collection = db["users"]


def mongo_available() -> bool:
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False


class LocalUsersCollection:
    def __init__(self) -> None:
        self.connection = sqlite3.connect(
            Path(__file__).resolve().parent.parent / "studyfinder.db",
            check_same_thread=False,
        )
        self.connection.row_factory = sqlite3.Row
        self.connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL
            )"""
        )
        self.connection.commit()

    def find_one(self, query: dict):
        row = self.connection.execute(
            "SELECT * FROM users WHERE email = ? LIMIT 1", (query["email"],)
        ).fetchone()
        if not row:
            return None
        user = dict(row)
        user["_id"] = user.pop("id")
        return user

    def insert_one(self, user: dict):
        cursor = self.connection.execute(
            "INSERT INTO users (name, email, password_hash, password_salt) VALUES (?, ?, ?, ?)",
            (user["name"], user["email"], user["password_hash"], user["password_salt"]),
        )
        self.connection.commit()

        class InsertResult:
            inserted_id = cursor.lastrowid

        return InsertResult()


if not mongo_available():
    users_collection = LocalUsersCollection()
