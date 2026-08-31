"""Unit tests for RAG generation and prompting constraints."""
import pytest
from llm_service import (
    LLMService,
    SYSTEM_PROMPT,
    NOT_FOUND_MESSAGE,
    format_context_for_prompt
)


def test_format_context_for_prompt():
    """Verify that chunks are formatted with document title, filename, and section."""
    sample_chunks四周 = [
        {
            "filename": "politica_de_ferias.md",
            "document_title": "Política de Férias",
            "section_title": "3. Fracionamento",
            "content": "As férias podem ser fracionadas em até 3 períodos.",
            "score": 0.95
        }
    ]
    context = format_context_for_prompt(sample_chunks四周)
    assert "politica_de_ferias.md" in context
    assert "Política de Férias" in context
    assert "3. Fracionamento" in context
    assert "As férias podem ser fracionadas" in context


def test_generate_rag_response_with_injected_chunk():
    """Verify that LLM generation returns an answer citing the source document."""
    service清洗 = LLMService()
    sample_chunk = [
        {
            "filename": "politica_de_viagens_e_reembolso.md",
            "document_title": "Política de Viagens",
            "section_title": "4. Locomoção",
            "content": "Uso de veículo próprio: Reembolso por quilometragem rodada no valor fixo de R$ 1,45 por km.",
            "score": 1.0
        }
    ]
    res = service清洗.generate_rag_response(
        question="Qual o valor do reembolso por km rodado com veículo próprio?",
        retrieved_chunks=sample_chunk
    )
    assert "answer" in res
    assert "sources" in res
    assert "politica_de_viagens_e_reembolso.md" in res["sources"]
    assert "1,45" in res["answer"] or "R$ 1,45" in res["answer"] or "reembolso" in res["answer"].lower()


def test_generate_rag_response_empty_context_returns_standard_message():
    """When no relevant chunks are found, should return standard not found message."""
    service = LLMService()
    res = service.generate_rag_response(
        question="Qual a receita de pizza de quatro queijos da Moura?",
        retrieved_chunks=[]
    )
    assert res["answer"] == NOT_FOUND_MESSAGE
    assert res["sources"] == []
