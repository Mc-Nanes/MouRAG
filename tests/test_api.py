"""Integration and endpoint tests for FastAPI REST API."""
import pytest
from fastapi.testclient import TestClient
from main import app
from database import init_db, SessionLocal
from ingestion import ingest_all_documents
from llm_service import NOT_FOUND_MESSAGE


@pytest.fixture(scope="module")
def client():
    """Create test client and ensure documents are ingested."""
    init_db()
    ingest_all_documents("data")
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    """Test GET / endpoint returns service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "endpoints" in data


def test_health_endpoint(client):
    """Test GET /health returns ok and document count."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["total_documents"] == 6
    assert data["total_chunks"] > 30


def test_documents_list_endpoint(client):
    """Test GET /documents lists all corporate documents."""
    response = client.get("/documents")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 6
    assert len(data["documents"]) == 6
    filenames = [d["filename"] for d in data["documents"]]
    assert "politica_de_ferias.md" in filenames
    assert "normas_de_seguranca_do_trabalho.md" in filenames


def test_ask_vacation_policy(client, monkeypatch):
    """Test POST /ask with question regarding vacation rules."""
    payload = {
        "question": "Como posso dividir minhas férias e qual o período mínimo?"
    }
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["question"] == payload["question"]
    assert len(data["sources"]) > 0
    assert "politica_de_ferias.md" in data["sources"]
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "query_id" in data


def test_ask_reimbursement_policy(client):
    """Test POST /ask with question regarding mileage reimbursement."""
    payload = {
        "question": "Qual o valor pago por km rodado com veículo próprio em viagens?"
    }
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "politica_de_viagens_e_reembolso.md" in data["sources"]
    assert "1,45" in data["answer"] or "R$ 1,45" in data["answer"] or "reembolso" in data["answer"].lower()


def test_ask_irrelevant_question_returns_not_found(client):
    """Test POST /ask with out-of-domain question returns standard not found answer."""
    payload = {
        "question": "Qual é a capital da Mongólia e a receita de brigadeiro de panela?"
    }
    response = client.post("/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Informação não encontrada nos documentos corporativos" in data["answer"]


def test_history_endpoint(client):
    """Test GET /history lists registered queries."""
    response = client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "question" in data[0]
    assert "answer" in data[0]
    assert "sources" in data[0]
