"""Retrieval and relevance search engine for Moura Corporate RAG."""
import math
import os
import re
import unicodedata
from typing import Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Document, DocumentChunk

# Common Portuguese stopwords to filter during lexical tokenization
PT_STOPWORDS: Set[str] = {
    "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "ate",
    "com", "como", "da", "das", "de", "dela", "delas", "dele", "deles", "do", "dos",
    "e", "ela", "elas", "ele", "eles", "em", "era", "eram", "essa", "essas", "esse",
    "esses", "esta", "estas", "este", "estes", "eu", "foi", "fomos", "foram", "ha",
    "isso", "isto", "ja", "lhe", "lhes", "mais", "mas", "me", "mesmo", "meu", "meus",
    "minha", "minhas", "muito", "na", "nas", "nao", "no", "nos", "nossa", "nossas",
    "nosso", "nossos", "num", "numa", "o", "os", "ou", "para", "pela", "pelas",
    "pelo", "pelos", "por", "qual", "quando", "que", "quem", "sao", "se", "seja",
    "sem", "ser", "seu", "seus", "so", "sua", "suas", "tambem", "te", "tem", "temos",
    "tenho", "um", "uma", "umas", "uns", "voce", "voces"
}


def normalize_text(text: str) -> str:
    """Strip accents, lower text, and clean special characters."""
    if not text:
        return ""
    # Normalize unicode to NFD and strip combining accents
    text_nfd = unicodedata.normalize("NFD", text.lower())
    text_clean = "".join(c for c in text_nfd if unicodedata.category(c) != "Mn")
    # Replace non-alphanumeric characters with space
    return re.sub(r"[^\w\s]", " ", text_clean)


def tokenize(text: str) -> List[str]:
    """Tokenize normalized string into significant words, removing stopwords."""
    norm = normalize_text(text)
    tokens = re.findall(r"\b\w{2,}\b", norm)
    return [t for t in tokens if t not in PT_STOPWORDS]


class BM25Retriever:
    """
    Okapi BM25 + Section/Title Boosting Retriever for corporate document chunks.
    Provides fast, deterministic, high-accuracy relevance scoring without external API dependencies.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b

    def compute_bm25_scores(
        self,
        query: str,
        chunks: List[DocumentChunk]
    ) -> List[Tuple[DocumentChunk, float]]:
        """Calculate BM25 relevance score for each chunk relative to the user query."""
        query_tokens = tokenize(query)
        if not query_tokens or not chunks:
            return []

        doc_count = len(chunks)
        chunk_tokens_map: Dict[int, List[str]] = {}
        doc_lengths: Dict[int, int] = {}
        doc_freqs: Dict[str, int] = {}

        # 1. Index document chunks
        total_length = 0
        for chunk in chunks:
            # Combine content with section title and document title for contextual weighting
            combined_text = f"{chunk.document.title if chunk.document else ''} {chunk.section_title or ''} {chunk.content}"
            tokens = tokenize(combined_text)
            chunk_tokens_map[chunk.id] = tokens
            doc_lengths[chunk.id] = len(tokens)
            total_length += len(tokens)

            unique_tokens = set(tokens)
            for token in unique_tokens:
                doc_freqs[token] = doc_freqs.get(token, 0) + 1

        avg_doc_len = (total_length / doc_count) if doc_count > 0 else 1.0

        # 2. Calculate BM25 score with field boosting
        scored_chunks: List[Tuple[DocumentChunk, float]] = []

        for chunk in chunks:
            tokens = chunk_tokens_map[chunk.id]
            doc_len = doc_lengths[chunk.id]
            score = 0.0

            # Title and Section tokens for boosting
            title_tokens = set(tokenize(f"{chunk.document.title if chunk.document else ''} {chunk.section_title or ''}"))
            content_tokens = tokenize(chunk.content)
            content_tf: Dict[str, int] = {}
            for t in content_tokens:
                content_tf[t] = content_tf.get(t, 0) + 1

            for q_term in query_tokens:
                if q_term not in doc_freqs:
                    continue

                df = doc_freqs[q_term]
                # Inverse Document Frequency (IDF) with smoothing
                idf = math.log(1.0 + (doc_count - df + 0.5) / (df + 0.5))

                # Term Frequency in content
                tf = content_tf.get(q_term, 0)
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / avg_doc_len))
                term_score = idf * (numerator / (denominator if denominator > 0 else 1.0))

                # Extra boost if query term appears in Section Heading or Document Title
                if q_term in title_tokens:
                    term_score *= 1.4

                score += term_score

            # Additional exact phrase boost
            norm_query = normalize_text(query).strip()
            norm_content = normalize_text(chunk.content)
            if norm_query in norm_content:
                score += 3.0

            if score > 0:
                scored_chunks.append((chunk, score))

        # Sort descending by score
        scored_chunks.sort(key=lambda item: item[1], reverse=True)
        return scored_chunks


class RetrievalService:
    """High-level retrieval service interacting with database and ranking algorithms."""

    def __init__(self, db: Optional[Session] = None):
        self._db = db
        self.bm25 = BM25Retriever()

    def get_session(self) -> Session:
        if self._db:
            return self._db
        return SessionLocal()

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        category: Optional[str] = None,
        min_score: float = 0.05
    ) -> List[Dict[str, any]]:
        """
        Retrieve the top_k most relevant document chunks for a given user query.
        Returns a list of structured chunk dictionaries with source metadata and relevance scores.
        """
        if not query or not query.strip():
            return []

        db = self.get_session()
        should_close = (self._db is None)

        try:
            # Query all chunks from DB with eager load of document
            db_query = db.query(DocumentChunk).join(Document)
            if category:
                db_query = db_query.filter(Document.category == category)

            chunks = db_query.all()
            if not chunks:
                return []

            scored = self.bm25.compute_bm25_scores(query, chunks)
            if not scored:
                return []

            # Normalize scores to 0.0 - 1.0 range
            max_score = scored[0][1] if scored[0][1] > 0 else 1.0

            results: List[Dict[str, any]] = []
            for chunk, raw_score in scored[:top_k]:
                rel_score = round(raw_score / max_score, 4)
                if rel_score < min_score:
                    continue

                doc = chunk.document
                results.append({
                    "chunk_id": chunk.id,
                    "document_id": doc.id if doc else None,
                    "document_title": doc.title if doc else "Documento Corporativo",
                    "filename": doc.filename if doc else "arquivo.md",
                    "category": doc.category if doc else "Geral",
                    "section_title": chunk.section_title or "Seção Geral",
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "score": rel_score,
                    "raw_score": round(raw_score, 4)
                })

            return results
        finally:
            if should_close:
                db.close()


def search_documents(query: str, top_k: int = 3) -> List[Dict[str, any]]:
    """Convenience functional wrapper for document retrieval."""
    service = RetrievalService()
    return service.retrieve(query, top_k=top_k)


if __name__ == "__main__":
    test_queries = [
        "Quantos dias de antecedência para pedir férias?",
        "Qual o valor do reembolso por km rodado com carro próprio?",
        "O que fazer em caso de acidente com ácido na fábrica?",
        "Qual a regra de complexidade de senhas?",
        "Quem tem direito ao plano de saúde e PPR?"
    ]

    service = RetrievalService()
    print("=== TESTE DO MECANISMO DE RETRIEVAL ===")
    for q in test_queries:
        print(f"\nPergunta: '{q}'")
        res = service.retrieve(q, top_k=2)
        if not res:
            print("  [Nenhum resultado encontrado]")
        for idx, r in enumerate(res, 1):
            print(f"  [{idx}] Fonte: {r['filename']} | Seção: {r['section_title']} | Score: {r['score']}")
            preview = r['content'].replace('\n', ' ')[:140]
            print(f"      Trecho: {preview}...")
