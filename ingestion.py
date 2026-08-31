"""Document ingestion and chunking module for Moura Corporate RAG."""
import os
import re
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from models import Document, DocumentChunk


def extract_document_metadata(content: str, filename: str) -> Tuple[str, str]:
    """Extract document title and category from markdown content and filename."""
    # Find first level 1 heading
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else filename.replace(".md", "").replace("_", " ").title()

    # Determine category based on filename or code
    lower_fn = filename.lower()
    if "viagens" in lower_fn or "reembolso" in lower_fn or "fin" in lower_fn:
        category = "Finanças & Controladoria"
    elif "ferias" in lower_fn or "beneficios" in lower_fn or "rh" in lower_fn:
        category = "Recursos Humanos"
    elif "seguranca_da_informacao" in lower_fn or "acessos" in lower_fn or "ti" in lower_fn:
        category = "Tecnologia da Informação"
    elif "seguranca_do_trabalho" in lower_fn or "sesmt" in lower_fn:
        category = "Saúde & Segurança Ocupacional (SESMT)"
    else:
        category = "Corporativo"

    return title, category


def split_text_into_chunks(
    content: str,
    target_min_chars: int = 250,
    target_max_chars: int = 500,
    overlap_chars: int = 60
) -> List[Dict[str, str]]:
    """
    Split markdown document content into coherent chunks respecting headings and paragraph boundaries.
    Each chunk is between ~300 to 500 characters, retaining context.
    """
    lines = content.splitlines()
    sections: List[Tuple[str, str]] = []  # (section_title, text)
    current_section = "Introdução"
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("# ") or stripped.startswith("## ") or stripped.startswith("### "):
            if current_lines:
                section_text = "\n".join(current_lines).strip()
                if section_text:
                    sections.append((current_section, section_text))
                current_lines = []
            current_section = stripped.lstrip("#").strip()
        else:
            current_lines.append(line)

    if current_lines:
        section_text = "\n".join(current_lines).strip()
        if section_text:
            sections.append((current_section, section_text))

    chunks: List[Dict[str, str]] = []

    for section_title, text in sections:
        # Split section into paragraphs, stripping pure horizontal rules
        paragraphs = [
            p.strip() for p in text.split("\n\n")
            if p.strip() and p.strip() not in ("---", "***", "___")
        ]
        current_chunk_parts = []
        current_len = 0

        for para in paragraphs:
            para_len = len(para)
            if current_len + para_len > target_max_chars and current_chunk_parts:
                # Flush current chunk
                chunk_text = "\n\n".join(current_chunk_parts).strip()
                if len(chunk_text) > 15:
                    chunks.append({
                        "content": chunk_text,
                        "section_title": section_title
                    })
                # Keep last part for slight overlap if feasible
                if len(current_chunk_parts) > 1 and len(current_chunk_parts[-1]) <= overlap_chars * 2:
                    current_chunk_parts = [current_chunk_parts[-1], para]
                    current_len = len(current_chunk_parts[0]) + len(para) + 2
                else:
                    current_chunk_parts = [para]
                    current_len = para_len
            else:
                current_chunk_parts.append(para)
                current_len += para_len + 2

        if current_chunk_parts:
            chunk_text = "\n\n".join(current_chunk_parts).strip()
            # If chunk is too large (> 600 chars), split by sentences
            if len(chunk_text) > target_max_chars + 100:
                sentences = re.split(r"(?<=[.?!])\s+", chunk_text)
                sub_parts = []
                sub_len = 0
                for sent in sentences:
                    sent = sent.strip()
                    if not sent or sent in ("---", "***", "___"):
                        continue
                    if sub_len + len(sent) > target_max_chars and sub_parts:
                        sub_text = " ".join(sub_parts).strip()
                        if len(sub_text) > 15:
                            chunks.append({
                                "content": sub_text,
                                "section_title": section_title
                            })
                        sub_parts = [sent]
                        sub_len = len(sent)
                    else:
                        sub_parts.append(sent)
                        sub_len += len(sent) + 1
                if sub_parts:
                    sub_text = " ".join(sub_parts).strip()
                    if len(sub_text) > 15:
                        chunks.append({
                            "content": sub_text,
                            "section_title": section_title
                        })
            elif len(chunk_text) > 15:
                chunks.append({
                    "content": chunk_text,
                    "section_title": section_title
                })

    return chunks


def ingest_file(filepath: str, db: Session) -> Optional[Document]:
    """Ingest a single markdown file into the database."""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return None

    filename = os.path.basename(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    title, category = extract_document_metadata(content, filename)

    # Check if document already exists
    doc = db.query(Document).filter_by(filename=filename).first()
    if doc:
        doc.title = title
        doc.category = category
        # Remove old chunks
        db.query(DocumentChunk).filter_by(document_id=doc.id).delete()
    else:
        doc = Document(
            title=title,
            filename=filename,
            category=category,
            total_chunks=0
        )
        db.add(doc)
        db.flush()  # Generate doc.id

    raw_chunks = split_text_into_chunks(content)
    created_chunks = []

    for idx, c in enumerate(raw_chunks):
        chunk_content = c["content"].strip()
        if not chunk_content:
            continue

        chunk_obj = DocumentChunk(
            document_id=doc.id,
            chunk_index=idx,
            content=chunk_content,
            section_title=c["section_title"],
            char_count=len(chunk_content),
            token_count=max(1, len(chunk_content) // 4)  # ~4 chars per token estimate
        )
        created_chunks.append(chunk_obj)

    db.add_all(created_chunks)
    doc.total_chunks = len(created_chunks)
    db.commit()
    db.refresh(doc)
    return doc


def ingest_all_documents(data_dir: str = "data", db: Optional[Session] = None) -> Dict[str, any]:
    """Scan the data directory and ingest all markdown documents into SQLite."""
    init_db()
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    results = []
    total_chunks = 0

    try:
        if not os.path.exists(data_dir):
            raise FileNotFoundError(f"Data directory '{data_dir}' does not exist.")

        files = [f for f in sorted(os.listdir(data_dir)) if f.endswith(".md")]
        for file in files:
            path = os.path.join(data_dir, file)
            doc = ingest_file(path, db)
            if doc:
                results.append({
                    "filename": doc.filename,
                    "title": doc.title,
                    "category": doc.category,
                    "chunks": doc.total_chunks
                })
                total_chunks += doc.total_chunks

        summary = {
            "status": "success",
            "total_documents": len(results),
            "total_chunks": total_chunks,
            "documents": results
        }
        return summary
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    print("-> Ingesting all documents from data/ ...")
    res = ingest_all_documents()
    print(f"-> Ingested {res['total_documents']} documents with {res['total_chunks']} total chunks.")
    for d in res["documents"]:
        print(f"   • [{d['category']}] {d['filename']} -> {d['chunks']} chunks ('{d['title']}')")
