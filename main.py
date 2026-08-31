"""Main FastAPI application entry point for Moura Corporate RAG Assistant."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db, SessionLocal
from ingestion import ingest_all_documents
from models import Document
from routes import ask, documents, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: initializes database tables and seeds documents on startup."""
    print("-> Initializing Database and Document Index...")
    init_db()

    # Verify if documents are already ingested
    db = SessionLocal()
    try:
        count = db.query(Document).count()
        if count == 0:
            print("-> Database empty. Auto-ingesting documents from data/ ...")
            ingest_all_documents("data", db)
        else:
            print(f"-> Database already contains {count} documents.")
    finally:
        db.close()

    yield
    print("-> Shutting down Moura RAG Assistant.")


app = FastAPI(
    title="Assistente Inteligente Corporativo - Grupo Moura",
    description="""
API RESTful de Perguntas e Respostas RAG (Retrieval-Augmented Generation) para colaboradores do Grupo Moura.
Permite consultar políticas de RH, normas de segurança do trabalho (SESMT), segurança da informação, benefícios e viagens.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for web frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(ask.router)


@app.get("/", summary="API Root information")
def root_info():
    """Root entrypoint returning system metadata and available endpoints."""
    return {
        "service": "Assistente Inteligente Corporativo - Grupo Moura",
        "status": "operational",
        "docs_url": "/docs",
        "endpoints": {
            "health": "GET /health",
            "documents": "GET /documents",
            "ask": "POST /ask",
            "history": "GET /history",
            "ingest": "POST /ingest"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
