from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.search import router as search_router

app = FastAPI(
    title="StudyFinder API",
    version="1.0.0"
)

# Archivos estáticos (HTML, CSS, JS, imágenes...), //Recorderis
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rutas de la API, //Recorderis
app.include_router(search_router)

@app.get("/")
def home():
    return {
        "message": "StudyFinder Backend funcionando"
    }

# Ruta que muestra la página HTML, //Recorderis
@app.get("/home")
def home_page():
    return FileResponse("static/index.html")