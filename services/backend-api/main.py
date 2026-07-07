from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db
from models import Person
from schemas import PersonCreate, PersonRead

app = FastAPI(title="Etka Backend API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"db_connected": result.scalar() == 1}


@app.post("/persons", response_model=PersonRead)
def create_person(person: PersonCreate, db: Session = Depends(get_db)):
    db_person = Person(**person.model_dump())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


@app.get("/persons/{person_id}", response_model=PersonRead)
def read_person(person_id: str, db: Session = Depends(get_db)):
    return db.query(Person).filter(Person.id == person_id).first()