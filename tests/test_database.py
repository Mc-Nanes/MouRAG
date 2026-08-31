"""Unit tests for SQLite database initialization and models."""
import os
import pytest
from database import create_session_factory, init_db, SessionLocal, engine, Base
from models import Document, DocumentChunk, QueryHistory


def test_database_initialization():
    """Verify that all tables can be created and queried without error."""
    init_db()
    db = SessionLocal()
    try:
        assert db.query(Document).count() >= 0
        assert db.query(DocumentChunk).count() >= 0
        assert db.query(QueryHistory).count() >= 0
    finally:
        db.close()


def test_database_factory_supports_isolated_sqlite_database(tmp_path):
    """Each test should be able to use a dedicated SQLite file instead of the shared app database."""
    isolated_url = f"sqlite:///{tmp_path / 'isolated_test.db'}"
    session_factory, engine = create_session_factory(isolated_url)
    db = session_factory()

    try:
        Base.metadata.create_all(bind=engine)
        assert db.query(Document).count() >= 0
        assert str(engine.url).startswith("sqlite")
    finally:
        db.close()


def test_document_model_relationships():
    """Test creating a document with chunks and query history."""
    db = SessionLocal()
    try:
        # Create test document
        doc = Document(
            title="Documento de Teste",
            filename="teste_doc.md",
            category="Qualidade",
            total_chunks=2
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        chunk1 = DocumentChunk(
            document_id=doc.id,
            chunk_index=0,
            content="Conteúdo do primeiro trecho para teste.",
            section_title="Seção 1",
            char_count=40
        )
        chunk2 = DocumentChunk(
            document_id=doc.id,
            chunk_index=1,
            content="Conteúdo do segundo trecho para teste.",
            section_title="Seção 2",
            char_count=39
        )
        db.add_all([chunk1, chunk2])
        db.commit()

        # Query and verify
        loaded_doc = db.query(Document).filter_by(filename="teste_doc.md").first()
        assert loaded_doc is not None
        assert len(loaded_doc.chunks) == 2
        assert loaded_doc.chunks[0].chunk_index == 0

        # Query history
        hist = QueryHistory(
            question="O que é o teste?",
            answer="É uma validação de sistema.",
            sources_json='["teste_doc.md"]',
            chunks_used=1,
            model_used="gemini-3.6-flash",
            latency_ms=120.5
        )
        db.add(hist)
        db.commit()
        db.refresh(hist)

        assert hist.id is not None
        assert hist.get_sources() == ["teste_doc.md"]

        # Clean up test rows
        db.delete(doc)
        db.delete(hist)
        db.commit()
    finally:
        db.close()
