from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Interface every LLM provider adapter must implement.
    Swapping providers (Groq, OpenAI, Anthropic, etc.) means writing
    a new class that implements this interface — nothing else changes.
    """

    @abstractmethod
    async def generate(self, messages: list[dict], persona_config: dict) -> str:
        """Returns generated text given conversation + persona settings."""
        ...