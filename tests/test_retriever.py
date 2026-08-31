"""Unit tests for the retrieval and search relevance service."""
import pytest
from database import SessionLocal, init_db
from ingestion import ingest_all_documents
from retriever import RetrievalService, normalize_text, tokenize


@pytest.fixture(scope="module", autouse=True)
def setup_database_and_documents():
    """Ensure database has ingested documents before tests."""
    init_db()
    ingest_all_documents("data")


def test_normalization_and_tokenization():
    """Test text normalization and Portuguese stopword removal."""
    text = "Qual é o valor do reembolso por quilômetro rodado?"
    norm = normalize_text(text)
    assert "e" in norm
    assert "quilometro" in norm

    tokens = tokenize(text)
    assert "valor" in tokens
    assert "reembolso" in tokens
    assert "quilometro" in tokens
    assert "rodado" in tokens
    assert "do" not in tokens  # Stopword removed


def test_retriever_returns_correct_document_for_vacation_policy():
    """Query about vacations should retrieve chunks from politica_de_ferias.md."""
    service = RetrievalService()
    results = service.retrieve("Quantos períodos posso dividir minhas férias e qual a duração mínima?", top_k=3)
    assert len(results) > 0
    top = results[0]
    assert top["filename"] == "politica_de_ferias.md"
    assert "14" in top["content"] or "períodos" in top["content"].lower() or "fracionamento" in top["section_title"].lower()


def test_retriever_returns_correct_document_for_password_security():
    """Query about password requirements should retrieve seguranca_da_informacao.md."""
    service = RetrievalService()
    results = service.retrieve("Qual o tamanho mínimo e requisitos para senhas?", top_k=3)
    assert len(results) > 0
    top = results[0]
    assert top["filename"] == "seguranca_da_informacao.md"
    assert "12" in top["content"] or "senhas" in top["content"].lower()


def test_retriever_returns_correct_document_for_safety_norms():
    """Query about EPIs in lead areas should retrieve normas_de_seguranca_do_trabalho.md."""
    service = RetrievalService()
    results = service.retrieve("Quais EPIs obrigatórios para áreas de fundição de chumbo?", top_k=3)
    assert len(results) > 0
    top = results[0]
    assert top["filename"] == "normas_de_seguranca_do_trabalho.md"
    assert "chumbo" in top["content"].lower() or "máscara" in top["content"].lower() or "epi" in top["content"].lower()


def test_retriever_empty_or_whitespace_query():
    """Query with empty string should safely return empty list."""
    service = RetrievalService()
    assert service.retrieve("") == []
    assert service.retrieve("    ") == []
