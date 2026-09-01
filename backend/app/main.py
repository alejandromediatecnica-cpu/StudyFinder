import sys
from pathlib import Path

# Asegurar que backend sea el root para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.search import router as search_router

app = FastAPI(title="StudyFinder API")

# Configuración obligatoria de CORS para conectar con el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],  # Direcciones comunes de Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir tus rutas existentes
app.include_router(search_router)

@app.get("/")
def read_root():
    return {"message": "Backend de StudyFinder operando correctamente"}
