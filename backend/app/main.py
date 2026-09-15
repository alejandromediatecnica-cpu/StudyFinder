from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.search import router as search_router
from database import client, users_collection


app = FastAPI(
    title="StudyFinder API",
    version="1.0.0"
)


# =========================================================
# ARCHIVOS ESTÁTICOS
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# =========================================================
# RUTAS DE LA API
# =========================================================

app.include_router(search_router)


# =========================================================
# RUTA PRINCIPAL
# =========================================================

@app.get("/")
def home():
    return {
        "message": "StudyFinder Backend funcionando"
    }


# =========================================================
# RUTA QUE MUESTRA LA PÁGINA HTML
# =========================================================

@app.get("/home")
def home_page():
    return FileResponse("static/index.html")


# =========================================================
# PRUEBA DE CONEXIÓN CON MONGODB
# =========================================================

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


# =========================================================
# PRUEBA PARA GUARDAR UN USUARIO
# =========================================================

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


# =========================================================
# PRUEBA PARA OBTENER USUARIOS
# =========================================================

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
