"""LLM and RAG Prompting Service for Moura Corporate Assistant."""
import os
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

SYSTEM_PROMPT = """Você é o Assistente Inteligente Corporativo oficial do Grupo Moura.
Sua missão é responder às dúvidas dos colaboradores de forma precisa, profissional, cordial e exclusivamente baseada nos documentos e trechos fornecidos no contexto corporativo.

DIRETRIZES E REGRAS INVIOLÁVEIS:
1. RESPONDA ESTRITAMENTE COM BASE NO CONTEXTO: Utilize APENAS as informações presentes nos trechos fornecidos abaixo. Não deduza nem assuma fatos que não constem expressamente no texto.
2. CITAÇÃO OBRIGATÓRIA DA FONTE: Cite explicitamente o nome do arquivo fonte correspondente (ex: `politica_de_ferias.md`, `seguranca_da_informacao.md`) e a respectiva seção ao apresentar as respostas.
3. AUSÊNCIA DE INFORMAÇÃO: Caso a pergunta não possa ser respondida a partir dos trechos fornecidos, você DEVE responder obrigatoriamente: "Informação não encontrada nos documentos corporativos." Não tente inventar uma resposta.
4. PRECISÃO NUMÉRICA E REGRAS: Mantenha com total exatidão prazos, percentuais, valores em R$, canais de contato e procedimentos de segurança descritos no contexto.
"""

NOT_FOUND_MESSAGE = "Informação não encontrada nos documentos corporativos."
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


def format_context_for_prompt(retrieved_chunks: List[Dict[str, Any]]) -> str:
    """Format retrieved document chunks into a clean, structured context block for the LLM."""
    if not retrieved_chunks:
        return "Nenhum documento relevante encontrado na base corporativa."

    context_parts = []
    for idx, chunk in enumerate(retrieved_chunks, 1):
        filename = chunk.get("filename", "desconhecido.md")
        doc_title = chunk.get("document_title", "Documento Corporativo")
        section = chunk.get("section_title", "Seção")
        content = chunk.get("content", "").strip()

        context_parts.append(
            f"--- [TRECHO {idx}] ---\n"
            f"DOCUMENTO: {doc_title} ({filename})\n"
            f"SEÇÃO: {section}\n"
            f"CONTEÚDO:\n{content}\n"
        )

    return "\n".join(context_parts)


class LLMService:
    """Service handling RAG prompt construction and generative AI API calls."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = DEFAULT_MODEL):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self._client: Optional[genai.Client] = None
        self._init_client()

    def _init_client(self):
        """Initialize the current Google Gen AI SDK when an API key is available."""
        if (
            os.getenv("TESTING") == "1" 
            or not self.api_key 
            or self.api_key == "MY_GEMINI_API_KEY"
        ):
            return

        self._client = genai.Client(api_key=self.api_key)

    def generate_rag_response(
        self,
        question: str,
        retrieved_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate answer using strict RAG prompting over retrieved chunks.
        Returns dictionary containing answer, sources list, model metadata and latency.
        """
        start_time = time.time()

        # Extract unique sources
        sources = list(dict.fromkeys([
            c.get("filename") for c in retrieved_chunks if c.get("filename")
        ]))

        # If no chunks were retrieved, return standard fallback
        if not retrieved_chunks:
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "answer": NOT_FOUND_MESSAGE,
                "sources": [],
                "model_used": "fallback-no-context",
                "latency_ms": latency_ms,
                "context_used": ""
            }

        context_text = format_context_for_prompt(retrieved_chunks)

        user_prompt = f"""CONTEXTO DOS DOCUMENTOS CORPORATIVOS DO GRUPO MOURA:
{context_text}

PERGUNTA DO COLABORADOR:
{question}

INSTRUÇÃO: Responda à pergunta do colaborador com base estritamente no contexto acima. Se a informação não constar nos trechos acima, responda exatamente: "{NOT_FOUND_MESSAGE}". Cite o documento fonte."""

        # If running in automated tests or client not initialized
        if os.getenv("TESTING") == "1" or not self._client:
            answer = self._deterministic_rag_answer(question, retrieved_chunks, sources)
            latency_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "answer": answer,
                "sources": sources if answer != NOT_FOUND_MESSAGE else [],
                "model_used": "deterministic-rag-synthesizer",
                "latency_ms": latency_ms,
                "context_used": context_text
            }

        # Call real AI API if configured
        if self._client:
            try:
                config = types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0,
                    max_output_tokens=500,
                    thinking_config=types.ThinkingConfig(
                        thinking_level=types.ThinkingLevel.LOW,
                    ),
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(
                        disable=True,
                    ),
                )
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config=config,
                )
                answer_text = response.text.strip() if response and response.text else NOT_FOUND_MESSAGE

                latency_ms = round((time.time() - start_time) * 1000, 2)
                return {
                    "answer": answer_text,
                    "sources": sources,
                    "model_used": self.model_name,
                    "latency_ms": latency_ms,
                    "context_used": context_text
                }
            except Exception as e:
                print(f"Warning: LLM API error: {e}. Utilizing deterministic RAG generator.")

        # Deterministic RAG generator (used during unit testing or when offline)
        answer = self._deterministic_rag_answer(question, retrieved_chunks, sources)
        latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "answer": answer,
            "sources": sources,
            "model_used": "deterministic-rag-synthesizer",
            "latency_ms": latency_ms,
            "context_used": context_text
        }

    def _deterministic_rag_answer(
        self,
        question: str,
        chunks: List[Dict[str, Any]],
        sources: List[str]
    ) -> str:
        """
        Deterministic fallback answer generation that strictly cites sources
        and returns NOT_FOUND_MESSAGE when relevance is below threshold.
        """
        if not chunks:
            return NOT_FOUND_MESSAGE

        # Check if query has significant semantic overlap with top chunk
        from retriever import tokenize
        q_tokens = tokenize(question)
        if not q_tokens:
            return NOT_FOUND_MESSAGE

        top_chunk = chunks[0]
        content = top_chunk["content"].strip()
        doc_tokens = set(tokenize(f"{top_chunk['document_title']} {top_chunk['section_title']} {content}"))
        
        matching = [t for t in q_tokens if t in doc_tokens]
        # Require at least 2 matching key terms or at least 50% of question tokens
        match_ratio = len(matching) / len(q_tokens) if q_tokens else 0
        if len(matching) < 2 and match_ratio < 0.4:
            return NOT_FOUND_MESSAGE

        filename = top_chunk["filename"]
        section = top_chunk["section_title"]
        title = top_chunk["document_title"]

        return (
            f"Com base na documentação corporativa do Grupo Moura ({title} - `{filename}`), na seção **{section}**:\n\n"
            f"{content}\n\n"
            f"📌 **Fonte Consultada:** `{filename}`"
        )


def generate_answer(question: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Helper function to execute RAG generation."""
    service = LLMService()
    return service.generate_rag_response(question, chunks)


if __name__ == "__main__":
    from retriever import RetrievalService

    retriever = RetrievalService()
    llm = LLMService()

    test_questions = [
        "Quais são as regras para fracionar as férias?",
        "Qual o valor do reembolso por km rodado?",
        "Como funciona a receita de bolo de chocolate no Grupo Moura?"
    ]

    print("=== TESTE DO SERVIÇO RAG COM IA GENERATIVA ===")
    for q in test_questions:
        print(f"\n❓ Pergunta: {q}")
        chunks = retriever.retrieve(q, top_k=2)
        res = llm.generate_rag_response(q, chunks)
        print(f"🤖 Modelo: {res['model_used']} (Latência: {res['latency_ms']}ms)")
        print(f"📚 Fontes: {res['sources']}")
        print(f"💬 Resposta:\n{res['answer']}\n{'-'*60}")
