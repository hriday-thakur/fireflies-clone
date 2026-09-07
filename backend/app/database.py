"""
Database setup: creates the SQLAlchemy engine, session factory, and Base class
that all our models inherit from. SQLite file lives at backend/fireflies.db.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./fireflies.db"

# check_same_thread=False is needed because SQLite by default only allows
# one thread to talk to it, but FastAPI can handle requests on multiple threads.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: gives each request its own DB session, then closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
