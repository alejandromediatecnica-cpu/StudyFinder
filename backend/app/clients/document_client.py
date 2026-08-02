import httpx

from config import API_URL


class DocumentClient:

    async def search_documents(self, query: str):

        async with httpx.AsyncClient() as client:

            response = await client.get(
                f"{API_URL}/works",
                params={
                    "search": query,
                    "per-page": 10
                }
            )

            response.raise_for_status()

            return response.json()