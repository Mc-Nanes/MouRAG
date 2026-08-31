"""RAG Query and Ask endpoints."""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from llm_service import LLMService
from models import QueryHistory
from retriever import RetrievalService
from schemas import AskRequest, AskResponse, QueryHistoryItem

router = APIRouter(prefix="", tags=["RAG Assistant"])

llm_service = LLMService()


@router.post("/ask", response_model=AskResponse, summary="Envia pergunta ao Assistente RAG Corporativo")
def ask_assistant(payload: AskRequest, db: Session = Depends(get_db)):
    """
    Processa a pergunta do colaborador através do pipeline RAG:
    1. Recupera os trechos mais relevantes da base corporativa usando busca de relevância (BM25/Vetorial).
    2. Constrói o prompt restritivo injetando os trechos no contexto da IA Generativa (Google Gemini).
    3. Gera a resposta fundamentada com citação explícita das fontes.
    4. Registra a consulta e resposta no histórico do banco de dados SQL.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="A pergunta não pode estar vazia.")

    # 1. Retrieve relevant chunks
    retriever = RetrievalService(db=db)
    retrieved_chunks = retriever.retrieve(question, top_k=payload.top_k or 4)

    # 2. Generate response with strict RAG prompt
    rag_result = llm_service.generate_rag_response(question, retrieved_chunks)

    # 3. Persist query into QueryHistory table
    query_record = QueryHistory(
        question=question,
        answer=rag_result["answer"],
        sources_json=json.dumps(rag_result["sources"], ensure_ascii=False),
        chunks_used=len(retrieved_chunks),
        model_used=rag_result.get("model_used", "gemini-3.7-flash"),
        latency_ms=rag_result.get("latency_ms", 0.0)
    )
    db.add(query_record)
    db.commit()
    db.refresh(query_record)

    return AskResponse(
        question=question,
        answer=rag_result["answer"],
        sources=rag_result["sources"],
        retrieved_chunks_count=len(retrieved_chunks),
        model_used=rag_result.get("model_used", "gemini-3.7-flash"),
        latency_ms=rag_result.get("latency_ms", 0.0),
        query_id=query_record.id
    )


@router.get("/history", response_model=List[QueryHistoryItem], summary="Histórico de consultas realizadas ao assistente")
def get_query_history(limit: int = 20, db: Session = Depends(get_db)):
    """Retorna as últimas perguntas e respostas processadas pelo assistente corporativo."""
    history = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(limit).all()
    return [
        QueryHistoryItem(
            id=h.id,
            question=h.question,
            answer=h.answer,
            sources=h.get_sources(),
            chunks_used=h.chunks_used,
            model_used=h.model_used,
            latency_ms=h.latency_ms,
            created_at=h.created_at.isoformat() if h.created_at else None
        )
        for h in history
    ]
