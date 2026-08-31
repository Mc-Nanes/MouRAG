"""Document listing, inspection and ingestion management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from ingestion import ingest_all_documents
from models import Document, DocumentChunk
from schemas import DocumentItem, DocumentsListResponse, IngestResponse

router = APIRouter(prefix="", tags=["Documents"])


@router.get("/documents", response_model=DocumentsListResponse, summary="Lista os documentos corporativos disponíveis")
def list_documents(db: Session = Depends(get_db)):
    """
    Retorna a listagem completa de documentos institucionais do Grupo Moura
    indexados no banco de dados com seus metadados e quantidade de trechos.
    """
    docs = db.query(Document).order_by(Document.category, Document.title).all()
    doc_items = [
        DocumentItem(
            id=d.id,
            title=d.title,
            filename=d.filename,
            category=d.category or "Geral",
            total_chunks=d.total_chunks,
            created_at=d.created_at.isoformat() if d.created_at else None,
            updated_at=d.updated_at.isoformat() if d.updated_at else None
        )
        for d in docs
    ]
    return DocumentsListResponse(
        total=len(doc_items),
        documents=doc_items
    )


@router.get("/documents/{document_id}", response_model=DocumentItem, summary="Detalhes de um documento específico")
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Obtém detalhes e metadados de um documento específico pelo seu ID."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    return DocumentItem(
        id=doc.id,
        title=doc.title,
        filename=doc.filename,
        category=doc.category,
        total_chunks=doc.total_chunks,
        created_at=doc.created_at.isoformat() if doc.created_at else None,
        updated_at=doc.updated_at.isoformat() if doc.updated_at else None
    )


@router.post("/ingest", response_model=IngestResponse, summary="Executa a reingestão de documentos da pasta data/")
def trigger_ingestion(db: Session = Depends(get_db)):
    """Lê os arquivos markdown da pasta data/, gera chunks e salva no banco de dados."""
    summary = ingest_all_documents("data", db)
    return IngestResponse(
        status="success",
        total_documents=summary["total_documents"],
        total_chunks=summary["total_chunks"],
        message=f"Ingestão concluída com sucesso: {summary['total_documents']} documentos e {summary['total_chunks']} trechos indexados."
    )
