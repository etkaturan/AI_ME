# Aime

**A personal AI digital twin — grounded in real, versioned facts and memories, not invented ones.**

Aime is a full-stack system that lets a person build an AI version of themselves: one that answers questions, holds conversations, and eventually speaks and appears with a synthesized voice and face — all sourced from real, timestamped data about that person rather than a generic language model improvising a biography.

Built as both a personal project and a portfolio piece, with an architecture designed to scale from a single user (its creator) to a platform where others can build their own AI companions or original characters.

---

## Why this exists

Most "AI chatbot" projects either:
- Use a static, hand-written system prompt (doesn't scale, doesn't stay current), or
- Fine-tune a model on personal data (bakes in stale facts, can't be corrected, hallucinates confidently)

Aime instead separates **who someone is** into two solvable problems:
- **Structured, versioned facts** (languages, timestamps, life events) — stored in Postgres, queryable, correctable, never guessed
- **Narrative memory** (diary-style entries) — stored with real timestamps and retrieved via semantic search, not fine-tuning

The result: an AI that can say "I graduated in April 2026" today and be automatically, provably correct — no retraining, no manual prompt rewrites, just accurate data in, accurate answers out.

## Core principles

- **No fabrication.** Every answer is expected to trace back to a real fact or memory. The system prompt explicitly instructs against inventing biographical detail.
- **Swap anything, rewrite nothing.** LLM providers, databases, and rendering engines all sit behind clean interfaces (ports & adapters), so a provider going away or changing terms means writing one new adapter — not a rewrite.
- **Flexible but precise data.** Structured facts use versioned, timestamped rows with a JSONB metadata column for future fields — no migrations needed to add new attributes later.

## Current status

Actively in development. Working end-to-end today:
- Full data layer (Postgres + Alembic migrations): versioned facts, timestamped memories, semantic search via pgvector
- AI orchestration layer: LLM provider abstraction (Groq/Llama currently), grounded system-prompt assembly combining facts + relevant memories
- Frontend shell (Next.js): landing page, login/signup, chat interface with persona and voice/text mode placeholders, admin panel scaffold

See [`docs/architecture.md`](docs/architecture.md) for the full technical architecture and version history, and [`docs/dev-commands.md`](docs/dev-commands.md) for local setup and common commands.

## Tech stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), separated into independent services (API, AI orchestration)
- **Database:** PostgreSQL + pgvector, SQLAlchemy, Alembic migrations
- **AI:** Groq (Llama), sentence-transformers for local embeddings

## Author

Built by [Etka Turan](https://github.com/etkaturan) — computer science graduate, building this both as a personal system and as a demonstration of production-minded, scalable AI application architecture.