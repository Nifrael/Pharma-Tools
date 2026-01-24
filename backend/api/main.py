from fastapi import FastAPI

app = FastAPI(
    title="Pharma-Tools API",
    description="API pour l'analyse des interactions médicamenteuses",
    version="0.1.0"
)

@app.get("/health")
async def health_check():
    """Vérifie que l'API est opérationnelle."""
    return {"status": "ok"}
