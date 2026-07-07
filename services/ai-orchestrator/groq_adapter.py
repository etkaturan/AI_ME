import os
from groq import Groq
from dotenv import load_dotenv

from llm_provider import LLMProvider

load_dotenv()


class GroqAdapter(LLMProvider):
    def __init__(self, model: str = "llama-3.3-70b-versatile"):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = model

    async def generate(self, messages: list[dict], persona_config: dict) -> str:
        system_prompt = persona_config.get("system_prompt", "")
        full_messages = [{"role": "system", "content": system_prompt}] + messages

        response = self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
        )
        return response.choices[0].message.content