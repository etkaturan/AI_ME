import uuid
from datetime import date, datetime
from pydantic import BaseModel


class PersonCreate(BaseModel):
    name: str
    date_of_birth: date | None = None
    place_of_birth: str | None = None
    gender: str | None = None


class PersonRead(BaseModel):
    id: uuid.UUID
    name: str
    date_of_birth: date | None
    place_of_birth: str | None
    gender: str | None
    created_at: datetime

    class Config:
        from_attributes = True

from typing import Any


class FactCreate(BaseModel):
    person_id: uuid.UUID
    category: str
    key: str
    value: Any
    valid_from: date | None = None
    valid_to: date | None = None
    source: str | None = None
    confidence: float = 1.0


class FactRead(BaseModel):
    id: uuid.UUID
    person_id: uuid.UUID
    category: str
    key: str
    value: Any
    valid_from: date | None
    valid_to: date | None
    source: str | None
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True