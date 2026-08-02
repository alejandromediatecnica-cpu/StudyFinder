from fastapi import APIRouter

from services.document_service import search_documents

router = APIRouter()

@router.get("/search")
async def search(q: str):
    return await search_documents(q)