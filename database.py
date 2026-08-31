"""Database configuration and session management for Moura RAG Assistant."""
import os
import sys
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./moura_rag.db")


def create_session_factory(database_url: str | None = None):
    """Build a dedicated session factory and engine for the provided database URL."""
    resolved_url = database_url or DATABASE_URL
    connect_args = {"check_same_thread": False} if resolved_url.startswith("sqlite") else {}
    engine = create_engine(
        resolved_url,
        connect_args=connect_args,
        echo=False
    )
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return session_factory, engine


SessionLocal, engine = create_session_factory()

Base = declarative_base()


def configure_database(database_url: str | None = None):
    """Rebind the app to a different database URL, useful for isolated per-test persistence."""
    global DATABASE_URL, engine, SessionLocal
    DATABASE_URL = database_url or os.getenv("DATABASE_URL", "sqlite:///./moura_rag.db")
    SessionLocal, engine = create_session_factory(DATABASE_URL)

    for module_name in ["ingestion", "retriever", "main", "routes.ask", "routes.documents", "routes.health"]:
        module = sys.modules.get(module_name)
        if module is not None and hasattr(module, "SessionLocal"):
            module.SessionLocal = SessionLocal

    return engine, SessionLocal


def get_db():
    """FastAPI dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables."""
    import models  # Ensure models are imported before creating tables
    Base.metadata.create_all(bind=engine)
    print(f"[{datetime.utcnow().isoformat()}] Database tables initialized successfully ({DATABASE_URL}).")


if __name__ == "__main__":
    init_db()
