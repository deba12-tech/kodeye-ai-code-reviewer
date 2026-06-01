from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if settings.ENVIRONMENT == "production" and not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError("DATABASE_URL must be set to a valid PostgreSQL URL in production")

def get_engine_and_session(url):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    
    eng = create_engine(url, connect_args=connect_args)
    
    if not url.startswith("sqlite"):
        try:
            with eng.connect() as conn:
                pass
            print(f"Successfully connected to PostgreSQL: {url.split('@')[-1]}")
            return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng)
        except Exception as e:
            if settings.ENVIRONMENT == "production":
                raise RuntimeError("DATABASE_URL must be set to a valid PostgreSQL URL in production") from e
            print(f"Warning: Connection to PostgreSQL failed ({e}). Falling back to local SQLite.")
            
    fallback_url = "sqlite:///./kodeye.db"
    fallback_connect_args = {"check_same_thread": False}
    fallback_eng = create_engine(fallback_url, connect_args=fallback_connect_args)
    return fallback_eng, sessionmaker(autocommit=False, autoflush=False, bind=fallback_eng)

engine, SessionLocal = get_engine_and_session(DATABASE_URL)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
