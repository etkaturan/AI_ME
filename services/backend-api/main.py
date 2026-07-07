from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from models import Person, Fact
from schemas import PersonCreate, PersonRead, FactCreate, FactRead


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


@app.post("/facts", response_model=FactRead)
def create_fact(fact: FactCreate, db: Session = Depends(get_db)):
    db_fact = Fact(**fact.model_dump())
    db.add(db_fact)
    db.commit()
    db.refresh(db_fact)
    return db_fact


@app.get("/persons/{person_id}/facts", response_model=list[FactRead])
def read_facts(person_id: str, db: Session = Depends(get_db)):
    return db.query(Fact).filter(Fact.person_id == person_id).all()