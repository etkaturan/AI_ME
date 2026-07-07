# Etka — AI Digital Twin Companion
## Software Architecture Document

**Version:** 0.1
**Status:** Draft — foundational architecture, pre-implementation
**Owner:** Mekhmetetka "Etka" Turan
**Last updated:** 2026-07-07

---

## 0. Changelog

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-07-07 | Initial architecture: layering, provider abstraction, flexible schema, persona/access model, testing strategy |
| 0.2 | 2026-07-07 | First working slice built: Postgres + Alembic migrations live; `persons`/`facts` tables in production use. FastAPI backend-api and ai-orchestrator running as separate services (ports 8000/8001). Groq adapter confirmed working end-to-end. Derived-fields utility (age-from-DOB) implemented and verified. System prompt now assembled from real `facts` data with explicit anti-fabrication instruction — first proof that responses are grounded, not invented. Hosting decision (pending final setup): Vercel (frontend) + Hugging Face Spaces (backend) + Supabase (Postgres/pgvector), chosen to avoid Railway-style payment friction. Local dev lesson: a native Windows Postgres service can silently conflict with Docker's Postgres on port 5432 — disable any native `postgresql-x64-*` service before relying on `docker-compose.yml`. |

> Every future architectural decision, addition, or reversal gets a new row here, plus updated sections below. Don't edit history — append. If a decision is later reversed, note it ("superseded by v0.4") rather than deleting it, so we keep a record of *why* things changed.

---

## 1. Guiding Principles

These principles exist specifically to answer your core worry: **"what if I change my mind, or a provider disappears, or I add a field later — will I have to rewrite things?"** Every layer below is designed against that question.

1. **Ports & Adapters (Hexagonal Architecture).** Every external dependency (an LLM provider, a TTS provider, a database engine, an avatar renderer) is accessed through an interface ("port") that we define ourselves. The actual provider (Groq, OpenAI, ElevenLabs, Postgres) is an "adapter" that implements that interface. The rest of the app talks to the interface, never to the provider directly. Swapping Groq for OpenAI, or Postgres for MySQL, means writing one new adapter file — not touching business logic.
2. **Schema flexibility over schema rigidity.** Structured data lives in normalized tables *only* for fields we're sure about (timestamps, categories, person identity). Everything else lives in a `JSONB` metadata column. Adding an "emotion" field to a memory entry later is a data change, not a migration/rewrite.
3. **Independent failure domains.** Each service (backend API, AI orchestrator, animation renderer, frontend) can go down or be swapped without taking down the others. The frontend degrades to text-only if the animation service is unreachable; the AI orchestrator falls back to a secondary LLM provider if the primary fails.
4. **Monorepo, modular packages.** One repository, cleanly separated packages/services, so code (UI components, types, API clients) is shared and reused, but nothing is so tangled that changing one thing breaks another.
5. **Web first, same codebase extends to mobile/desktop.** No separate rewrite for each platform — see Section 5.
6. **Contract-driven testing.** We test the *interface*, not just the implementation, so swapping an adapter has an automatic test to confirm it still fulfills the contract.

---

## 2. High-Level System Layers

```
┌──────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Web → Mobile → Desktop)                 │
│  Next.js (web) · Expo/React Native (mobile) · Tauri (desktop)│
└───────────────────────────┬────────────────────────────────────┘
                            │ REST/WebSocket (typed API contract)
┌───────────────────────────▼────────────────────────────────────┐
│  BACKEND API LAYER (FastAPI)                                  │
│  Auth · Persona/access control · Request routing               │
└───────────┬─────────────────────────────┬──────────────────────┘
            │                             │
┌───────────▼───────────────┐   ┌─────────▼─────────────────────┐
│  AI ORCHESTRATION LAYER    │   │  ANIMATION/RENDER LAYER        │
│  - LLM provider adapters   │   │  - TTS adapters                │
│  - Retrieval engine (RAG)  │   │  - Face/avatar renderer adapter│
│  - Persona engine          │   │  - Emotion→viseme mapping      │
└───────────┬────────────────┘   └────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────────┐
│  DATA LAYER                                                    │
│  Postgres (facts, personas, versioned attributes)              │
│  Vector DB (pgvector or Qdrant) — memories/diary embeddings     │
│  Object storage (S3-compatible) — photos, audio, video assets   │
└──────────────────────────────────────────────────────────────┘
```

Each box is a **replaceable unit**. Nothing above a box needs to know what's inside it — only the shape of its interface.

---

## 3. Backend Framework Choice: FastAPI, separate from Next.js

**Decision:** Next.js is presentation-only. All backend logic (API, AI orchestration, data access) lives in a separate **FastAPI** service, not in Next.js API routes.

**Why:**
- Python has the strongest ecosystem for AI/LLM tooling (embeddings, RAG libraries, ML utilities), which you'll lean on heavily.
- Decoupling means you could rebuild the frontend in a totally different framework later without touching a single line of backend/AI code.
- FastAPI gives you auto-generated OpenAPI schema → a typed API contract → your frontend (whatever it ends up being, web/mobile/desktop) always knows the exact shape of every request/response, and you get free validation on both ends.

This directly solves your "what if I want to change frameworks later" worry — the backend doesn't care if the frontend is Next.js, SwiftUI, or something that doesn't exist yet.

---

## 4. The Provider Abstraction Pattern (solves your Groq example directly)

This is the core mechanism for "if Groq changes terms tomorrow, I can fix it easily."

### 4.1 LLM Provider Interface

```python
# ai_orchestrator/ports/llm_provider.py
from abc import ABC, abstractmethod

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], persona_config: dict) -> str:
        """Returns generated text given conversation + persona settings."""
        ...

    @abstractmethod
    async def stream(self, messages: list[dict], persona_config: dict):
        """Yields tokens as they're generated, for real-time chat UI."""
        ...
```

### 4.2 Adapters implement the interface

```python
# ai_orchestrator/adapters/groq_adapter.py
class GroqAdapter(LLMProvider):
    async def generate(self, messages, persona_config):
        # calls Groq API, formats response to match interface
        ...

# ai_orchestrator/adapters/anthropic_adapter.py
class AnthropicAdapter(LLMProvider):
    async def generate(self, messages, persona_config):
        # calls Anthropic API instead
        ...
```

### 4.3 Config-driven selection + fallback chain

```yaml
# config/llm_providers.yaml
primary: groq
fallback_chain: [groq, anthropic, openai_compatible_local]
```

If Groq goes down or changes terms, you change **one config value** (or the code auto-falls-back per the chain) — nothing else in the app changes. The same exact pattern applies to:
- **TTS provider** (ElevenLabs → another provider)
- **Vector DB** (pgvector → Qdrant → Weaviate)
- **SQL engine** (Postgres → MySQL) — via an ORM (SQLAlchemy) so query code doesn't touch raw SQL dialect specifics
- **Avatar renderer** (Wav2Lip → a 3D pipeline later)

This is the single most important pattern in the whole architecture for your stated goal — build it first, before anything else, even before it feels necessary.

---

## 5. Frontend: Web First, Then Mobile/Desktop, Shared Code

**Recommended stack:**
- **Web (build first):** Next.js
- **Mobile (v2):** React Native + Expo — shares component logic and API client with web via a shared `packages/ui-core` and `packages/api-client`
- **Desktop (v2/v3):** Tauri wrapping the same web build — lightweight, avoids Electron's resource overhead, and since your UI will already be a web app, this is close to free

**Why this order works without a rewrite:**
- Build your API client (typed, generated from FastAPI's OpenAPI schema) once, in a shared package. Web, mobile, and desktop all import the same client.
- Keep business logic (state management, persona-switch logic, chat logic) in framework-agnostic hooks/stores where possible, so React Native can reuse most of it — React Native and Next.js both being React means far more shared logic than a full rewrite.
- UI *components* won't be 100% shared (web and native render differently), but the design tokens (colors, spacing, typography) live in one shared design package, so visual identity ("this represents me") stays consistent across platforms without duplicating design decisions.

**Testing priority (as you requested, frontend is priority #1):**
- Component tests (Vitest + React Testing Library) for every UI component in isolation
- Visual regression tests (Playwright/Chromatic) so avatar/UI changes don't silently break layout
- E2E flows (Playwright) for critical paths: chat → response → persona switch → animation toggle
- Contract tests against the FastAPI OpenAPI schema, so frontend and backend can never silently drift out of sync

---

## 6. Data Layer: Flexible but Precise

This directly answers your "emotion field later" question.

### 6.1 Structured facts — `facts` table (Postgres)

```sql
CREATE TABLE facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id),
    category TEXT NOT NULL,          -- e.g. 'physical', 'language', 'employment'
    key TEXT NOT NULL,               -- e.g. 'weight_kg', 'german_proficiency'
    value JSONB NOT NULL,            -- flexible: number, string, object
    valid_from DATE,
    valid_to DATE,                   -- NULL = still current
    source TEXT,                     -- e.g. 'self-reported', 'whatsapp-extract'
    confidence REAL DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',     -- <-- future fields go here, no migration needed
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Your weight example:**
```
{person_id, category: 'physical', key: 'weight_kg', value: 95, valid_from: '2024-01-01', valid_to: '2025-12-31'}
{person_id, category: 'physical', key: 'weight_kg', value: 80, valid_from: '2026-01-01', valid_to: NULL}
```
Querying "what was true in 2024" is a simple date-range filter. No file-format juggling needed.

**Adding "emotion" later:** you don't alter the table. You either add a new `category: 'emotional_state'` row, or if it's a per-event emotion tag, you add it into the `metadata` JSONB of the relevant memory entry (see below). Zero downtime, zero migration, zero rewrite.

### 6.2 Diary/memory entries — vector store + lightweight Postgres index

```sql
CREATE TABLE memory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id),
    category TEXT,                   -- 'work', 'family', 'health', etc.
    timestamp TIMESTAMPTZ,
    text TEXT NOT NULL,              -- the actual diary/story content
    embedding_id TEXT,               -- pointer to vector in pgvector/Qdrant
    metadata JSONB DEFAULT '{}',     -- emotion, tags, related_people, mood_score, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Same principle: today you store `{category, timestamp, text}`. Next month you decide to add `emotion: "nostalgic"` or `mood_score: 7` — it goes straight into `metadata`, retrievable and filterable immediately, no schema change.

### 6.3 Persona profiles — access-level layering

```sql
CREATE TABLE persona_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id),
    persona_type TEXT NOT NULL,       -- 'public_portfolio', 'friends', 'private_self'
    allowed_categories TEXT[],        -- which fact/memory categories this persona can retrieve
    system_prompt TEXT NOT NULL,
    config JSONB DEFAULT '{}',        -- tone, quirks, language proficiency instructions, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);
```

At query time: retrieval pipeline filters `facts` and `memory_entries` by `category IN (allowed_categories)` **before** running semantic search. This is how your portfolio persona never sees personal categories, and your private persona sees everything — same underlying data, different lens.

### 6.4 Why Postgres over MySQL (with an escape hatch)

Postgres is recommended because of native JSONB (better than MySQL's JSON support) and pgvector (lets you keep facts + embeddings in one engine early on, simplifying your v1 infra). If you ever need to switch, using an ORM (SQLAlchemy) means the switch touches configuration and a few dialect-specific queries — not your application logic.

---

## 7. AI Orchestration Layer — Retrieval + Persona Assembly

Pipeline for every incoming message:

1. Identify active `persona_id` → load `allowed_categories`, `system_prompt`, `config`
2. Query `facts` table filtered by allowed categories (structured, precise answers — e.g. language proficiency)
3. Semantic search over `memory_entries` (vector search), filtered by allowed categories + optionally date range
4. Assemble context: `system_prompt + relevant facts + top-k memory chunks + recent conversation`
5. Send to `LLMProvider.generate()` (interface, not a specific provider)
6. Return response → optionally forward to Animation Layer for voice/avatar rendering

This pipeline itself is provider-agnostic and persona-agnostic — same code path for your private persona, your portfolio persona, and (later) other users' characters.

---

## 8. Animation/Render Layer — Decoupled Renderer

```python
# animation/ports/avatar_renderer.py
class AvatarRenderer(ABC):
    @abstractmethod
    async def render(self, audio: bytes, emotion_tags: list[str]) -> bytes:
        """Returns video/frame data given audio + emotion context."""
        ...
```

- **v1 adapter:** 2D talking-head (Wav2Lip/SadTalker-based or a hosted API like D-ID)
- **v2 adapter (optional, stretch goal):** 3D avatar renderer
- The rest of the app calls `AvatarRenderer.render()` — swapping 2D for 3D later is a new adapter, not a rewrite.
- **Text-only mode** is simply "skip this layer entirely" — the chat pipeline works identically whether or not animation is active, which is why this is cleanly separable.

---

## 9. Testing Strategy Per Layer

| Layer | Test type | Tooling |
|---|---|---|
| Frontend UI | Component, visual regression, E2E | Vitest, Playwright |
| Backend API | Contract tests against OpenAPI schema | Pytest + schemathesis |
| LLM Provider adapters | Contract test (same input → valid interface-shaped output) per adapter | Pytest |
| Retrieval pipeline | Integration tests with seeded fixture data | Pytest |
| Data layer | Migration tests, JSONB query correctness | Pytest + testcontainers (spins up real Postgres) |
| Animation layer | Contract test (audio in → valid video/frame out) | Pytest |

Every adapter (LLM, TTS, avatar renderer, DB engine) gets a **shared contract test suite** that any new adapter must pass before being swapped in — this is what gives you real confidence that "swap Groq for X" won't silently break behavior.

---

## 10. Suggested Monorepo Structure

```
etka/
├── apps/
│   ├── web/                  # Next.js (v1 priority)
│   ├── mobile/                # Expo/React Native (v2)
│   └── desktop/                # Tauri wrapper (v3)
├── services/
│   ├── backend-api/            # FastAPI: auth, routing, persona/access control
│   ├── ai-orchestrator/       # LLM adapters, retrieval engine, persona engine
│   └── animation-service/      # TTS + avatar renderer adapters
├── packages/
│   ├── ui-core/                # Shared design tokens, shared logic hooks
│   ├── api-client/            # Typed client generated from OpenAPI schema
│   └── types/                # Shared TypeScript/Pydantic type contracts
└── docs/
    └── architecture.md        # This document
```

---

## 11. Build Order (Recommended Roadmap)

This is a suggested phasing, not a rigid plan — revise as we go and log changes in the changelog above.

1. **Phase 1:** Postgres schema (facts, memory_entries, persona_profiles) + FastAPI backend + LLM provider interface with one adapter (Groq/Llama) + basic RAG pipeline. Text-only chat, one persona (private).
2. **Phase 2:** Web frontend (Next.js) — chat UI, text-only toggle, persona switch UI.
3. **Phase 3:** Add second LLM adapter + fallback chain (proves the abstraction works before you need it).
4. **Phase 4:** Add access-level personas (public/portfolio, friends) with category filtering.
5. **Phase 5:** Animation layer — TTS + 2D talking-head adapter.
6. **Phase 6:** Mobile (Expo) reusing shared packages.
7. **Phase 7 (stretch):** 3D avatar adapter, multi-tenant "create your own companion."

---

## 12. Open Decisions (to revisit in future versions)

- Final choice of vector DB: pgvector (simpler infra) vs. dedicated (Qdrant/Weaviate — better at scale, more ops overhead)
- Fine-tuning vs. prompting for writing-style mimicry (leaning prompting + few-shot for v1, per earlier discussion)
- Self-reflection persona mode: exact framing/safety-layer implementation
- Data ingestion pipeline for WhatsApp/journal imports: privacy-scrubbing approach for third-party data
