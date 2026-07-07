import uuid
from datetime import datetime, date

from sqlalchemy import Column, String, Date, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=True)
    place_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    facts = relationship("Fact", back_populates="person")


class Fact(Base):
    __tablename__ = "facts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=False)
    category = Column(String, nullable=False)       # e.g. 'physical', 'language', 'employment'
    key = Column(String, nullable=False)             # e.g. 'weight_kg', 'german_proficiency'
    value = Column(JSONB, nullable=False)             # flexible: number, string, object
    valid_from = Column(Date, nullable=True)
    valid_to = Column(Date, nullable=True)            # NULL = still current
    source = Column(String, nullable=True)            # e.g. 'self-reported'
    confidence = Column(Float, default=1.0)
    fact_metadata = Column(JSONB, default=dict)       # future fields go here, no migration needed
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="facts")