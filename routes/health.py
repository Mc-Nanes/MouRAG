"""Health check endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document, DocumentChunk
from schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Verificação de status da API")
def get_health(db: Session = Depends(get_db)):
    """
    Retorna o status operacional da API do Assistente RAG Grupo Moura,
    conectividade com o banco de dados SQL e contagem de documentos indexados.
    """
    try:
        total_docs = db.query(Document).count()
        total_chunks = db.query(DocumentChunk).count()
        db_status = "connected"
    except Exception as e:
        total_docs = 0
        total_chunks = 0
        db_status = f"error: {str(e)}"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        version="1.0.0",
        service="Assistente Inteligente Corporativo - Grupo Moura",
        database=db_status,
        total_documents=total_docs,
        total_chunks=total_chunks
    )
