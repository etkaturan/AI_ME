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