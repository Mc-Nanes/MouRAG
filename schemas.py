"""Pydantic request and response schemas for FastAPI endpoints."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    """Health check status response."""
    status: str = Field(default="ok", json_schema_extra={"example": "ok"})
    version: str = Field(default="1.0.0", json_schema_extra={"example": "1.0.0"})
    service: str = Field(default="Assistente Inteligente Corporativo - Grupo Moura")
    database: str = Field(default="connected", json_schema_extra={"example": "connected"})
    total_documents: int = Field(default=0, json_schema_extra={"example": 6})
    total_chunks: int = Field(default=0, json_schema_extra={"example": 55})


class DocumentItem(BaseModel):
    """Schema representing an ingested corporate document."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    filename: str
    category: Optional[str] = "Geral"
    total_chunks: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DocumentsListResponse(BaseModel):
    """List of available corporate documents."""
    total: int
    documents: List[DocumentItem]


class ChunkItem(BaseModel):
    """Schema for individual document chunk."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    chunk_index: int
    content: str
    section_title: Optional[str] = None
    char_count: int
    token_count: int


class AskRequest(BaseModel):
    """Input payload for corporate assistant questions."""
    question: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        description="Pergunta do colaborador sobre as políticas e normas do Grupo Moura.",
        json_schema_extra={"example": "Quantos dias de antecedência devo solicitar minhas férias?"}
    )
    top_k: Optional[int] = Field(
        default=4,
        ge=1,
        le=10,
        description="Quantidade de trechos relevantes a recuperar."
    )


class AskResponse(BaseModel):
    """Structured response from the RAG assistant."""
    question: str
    answer: str
    sources: List[str] = Field(
        default_factory=list,
        description="Lista dos arquivos fonte utilizados para compor a resposta.",
        json_schema_extra={"example": ["politica_de_ferias.md"]}
    )
    retrieved_chunks_count: int = Field(default=0, json_schema_extra={"example": 2})
    model_used: str = Field(default="gemini-3.7-flash", json_schema_extra={"example": "gemini-3.7-flash"})
    latency_ms: float = Field(default=0.0, json_schema_extra={"example": 120.45})
    query_id: Optional[int] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class QueryHistoryItem(BaseModel):
    """Schema for historical query log."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str
    sources: List[str]
    chunks_used: int
    model_used: str
    latency_ms: float
    created_at: Optional[str] = None


class IngestResponse(BaseModel):
    """Response after executing document ingestion."""
    status: str
    total_documents: int
    total_chunks: int
    message: str
