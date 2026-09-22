import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE")

if not MONGODB_URL:
    raise ValueError("No se encontró MONGODB_URL en el archivo .env")

if not MONGODB_DATABASE:
    raise ValueError("No se encontró MONGODB_DATABASE en el archivo .env")

client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)

db = client[MONGODB_DATABASE]

users_collection = db["users"]
