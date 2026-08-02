from clients.document_client import DocumentClient

client = DocumentClient()


async def search_documents(query: str):

    data = await client.search_documents(query)

    documents = []

    for paper in data["results"]:

        authors = []

        for author in paper.get("authorships", []):
            authors.append(author["author"]["display_name"])

        documents.append({
            "title": paper.get("display_name"),
            "authors": authors,
            "year": paper.get("publication_year"),
            "url": paper.get("primary_location", {}).get("landing_page_url")
        })

    return documents