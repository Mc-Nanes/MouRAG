"""Database configuration and session management for Moura RAG Assistant."""
import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./moura_rag.db")

# SQLite requires check_same_thread=False for multithreaded FastAPI requests
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


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
