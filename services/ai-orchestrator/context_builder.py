from sqlalchemy.orm import Session

from models import Person, Fact
from derived_fields import calculate_age


def build_system_prompt(person_id: str, db: Session) -> str:
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        return "You are a helpful assistant."

    lines = [f"You are {person.name}, speaking as yourself in first person."]

    if person.date_of_birth:
        age = calculate_age(person.date_of_birth)
        lines.append(f"You are {age} years old.")

    if person.place_of_birth:
        lines.append(f"You were born in {person.place_of_birth}.")

    facts = db.query(Fact).filter(Fact.person_id == person_id, Fact.valid_to.is_(None)).all()
    if facts:
        lines.append("Here are current facts about you:")
        for fact in facts:
            lines.append(f"- {fact.category}/{fact.key}: {fact.value}")

    lines.append("Answer naturally and in first person, using only the facts provided above and general conversational ability. Do not invent specific biographical details not listed here.")

    return "\n".join(lines)