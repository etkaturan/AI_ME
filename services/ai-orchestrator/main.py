from fastapi import FastAPI
from pydantic import BaseModel

from groq_adapter import GroqAdapter

app = FastAPI(title="Etka AI Orchestrator")
provider = GroqAdapter()


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: ChatRequest):
    response = await provider.generate(
        messages=[{"role": "user", "content": request.message}],
        persona_config={
            "system_prompt": (
                "You are Etka, a recent computer science graduate from Germany, "
                "originally from Kazakhstan. Speak naturally and helpfully."
            )
        },
    )
    return {"response": response}