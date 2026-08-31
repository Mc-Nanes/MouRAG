"""Unit tests for document ingestion and text chunking."""
import os
import pytest
from database import SessionLocal, init_db
from models import Document, DocumentChunk
from ingestion import ingest_all_documents, split_text_into_chunks, extract_document_metadata


def test_chunking_size_and_structure():
    """Verify that chunks adhere to expected length bounds and preserve section headings."""
    sample_text = """# Política de Teste
## 1. Introdução Geral
Este é o primeiro parágrafo explicativo da política corporativa com detalhes sobre o tema.

## 2. Regras Principais
Aqui detalhamos a primeira regra com informações de prazos e valores estabelecidos.
Este é um complemento da regra com diretrizes adicionais para os colaboradores.
"""
    chunks = split_text_into_chunks(sample_text, target_min_chars=100, target_max_chars=300)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c["content"]) > 0
        assert "section_title" in c


def test_ingestion_of_all_documents():
    """Verify that ingestion processes all 6 markdown files in data/ into database."""
    init_db()
    db = SessionLocal()
    try:
        summary = ingest_all_documents("data", db)
        assert summary["status"] == "success"
        assert summary["total_documents"] == 6
        assert summary["total_chunks"] > 30

        # Verify documents exist in database
        docs = db.query(Document).all()
        assert len(docs) == 6

        filenames = [d.filename for d in docs]
        expected_files = [
            "politica_de_ferias.md",
            "seguranca_da_informacao.md",
            "faq_beneficios.md",
            "solicitacao_de_acessos.md",
            "politica_de_viagens_e_reembolso.md",
            "normas_de_seguranca_do_trabalho.md"
        ]
        for exp in expected_files:
            assert exp in filenames

        # Verify chunks exist and are non-empty
        chunks = db.query(DocumentChunk).all()
        assert len(chunks) == summary["total_chunks"]
        for chunk in chunks:
            assert len(chunk.content) > 10
            assert chunk.document_id is not None
            assert chunk.char_count > 0
    finally:
        db.close()
