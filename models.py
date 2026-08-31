"""SQLAlchemy ORM models for Documents, Chunks, and Query History."""
import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


class Document(Base):
    """Represents a full corporate source document (Markdown file)."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True, default="Geral")
    total_chunks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "filename": self.filename,
            "category": self.category,
            "total_chunks": self.total_chunks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class DocumentChunk(Base):
    """Represents an individual text chunk derived from a document."""
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    section_title = Column(String(255), nullable=True)
    char_count = Column(Integer, default=0)
    token_count = Column(Integer, default=0)
    embedding_json = Column(Text, nullable=True)  # JSON-encoded embedding or term weights
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="chunks")

    def to_dict(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "filename": self.document.filename if self.document else None,
            "document_title": self.document.title if self.document else None,
            "chunk_index": self.chunk_index,
            "content": self.content,
            "section_title": self.section_title,
            "char_count": self.char_count,
            "token_count": self.token_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class QueryHistory(Base):
    """Represents a record of questions asked to the assistant, the response, and retrieved sources."""
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True, default="[]")
    chunks_used = Column(Integer, default=0)
    model_used = Column(String(100), default="gemini-3.7-flash")
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def get_sources(self) -> List[str]:
        if not self.sources_json:
            return []
        try:
            return json.loads(self.sources_json)
        except Exception:
            return [self.sources_json]

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "sources": self.get_sources(),
            "chunks_used": self.chunks_used,
            "model_used": self.model_used,
            "latency_ms": self.latency_ms,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
