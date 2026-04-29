from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create the engine. pool_pre_ping=True reconnects dropped connections automatically.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Each request gets its own session, closed when the request ends.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models inherit from this base so Alembic can detect them.
Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session, always closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()