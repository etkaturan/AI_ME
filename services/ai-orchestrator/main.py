from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from groq_adapter import GroqAdapter
from database import get_db
from context_builder import build_system_prompt

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