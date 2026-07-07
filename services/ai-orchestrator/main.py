from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from groq_adapter import GroqAdapter
from database import get_db
from context_builder import build_system_prompt
from memory_service import create_memory, search_memories

app = FastAPI(title="Etka AI Orchestrator")
provider = GroqAdapter()


class ChatRequest(BaseModel):
    message: str
    person_id: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    system_prompt = build_system_prompt(request.person_id, db)

    response = await provider.generate(
        messages=[{"role": "user", "content": request.message}],
        persona_config={"system_prompt": system_prompt},
    )
    return {"response": response}

class MemoryCreate(BaseModel):
    person_id: str
    text: str
    category: str | None = None


@app.post("/memories")
def add_memory(request: MemoryCreate, db: Session = Depends(get_db)):
    entry = create_memory(request.person_id, request.text, request.category, db)
    return {"id": str(entry.id), "text": entry.text, "category": entry.category}


@app.get("/memories/search")
def search(person_id: str, query: str, db: Session = Depends(get_db)):
    results = search_memories(person_id, query, db)
    return [{"id": str(r.id), "text": r.text, "category": r.category} for r in results]