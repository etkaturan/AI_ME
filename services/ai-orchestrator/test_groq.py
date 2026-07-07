import asyncio
from groq_adapter import GroqAdapter


async def main():
    provider = GroqAdapter()
    response = await provider.generate(
        messages=[{"role": "user", "content": "Say hello in one short sentence."}],
        persona_config={"system_prompt": "You are a helpful assistant."},
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())