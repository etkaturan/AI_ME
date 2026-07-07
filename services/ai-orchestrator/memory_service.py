import uuid
from datetime import datetime

from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from models import MemoryEntry

_model = SentenceTransformer("all-MiniLM-L6-v2")


def create_memory(person_id: str, text: str, category: str | None, db: Session) -> MemoryEntry:
    embedding = _model.encode(text).tolist()

    entry = MemoryEntry(
        id=uuid.uuid4(),
        person_id=person_id,
        category=category,
        text=text,
        embedding=embedding,
        timestamp=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def search_memories(person_id: str, query: str, db: Session, limit: int = 5) -> list[MemoryEntry]:
    query_embedding = _model.encode(query).tolist()

    return (
        db.query(MemoryEntry)
        .filter(MemoryEntry.person_id == person_id)
        .order_by(MemoryEntry.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .all()
    )