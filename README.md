# Tacit

**An always-on system that captures what senior employees know before they leave.**

🔗 **[Live demo](https://tacit-three.vercel.app/)** — click "Enter demo workspace", no signup needed
`demo@knowledgelayer.app` / `demo1234`

---

## The problem

When a 30-year engineer retires, the documented knowledge leaves with the file
share. The *undocumented* knowledge — why they never trust a particular supplier,
which machine needs a specific restart sequence, who to call when a process
breaks — leaves with them entirely.

Most knowledge-management tools ask people to write things down. They don't,
because the knowledge is tacit: they don't know they know it until someone asks
the right question.

Tacit asks the questions.

---

## What it does

**Capture.** An AI interviewer questions a senior employee using their role,
domains, and the company's own documents as context. Every answer is
automatically parsed into discrete, typed knowledge — decisions, warnings,
failure patterns, heuristics, tribal rules — each stored with the original quote
as a citation.

**Retrieve.** Anyone can ask a question in plain language. The system searches
captured knowledge semantically and answers with citations, or admits it doesn't
know and routes the question to the right person.

**Self-heal.** When a human answers a routed question, that answer runs through
the same extraction pipeline and becomes permanent knowledge. Ask again and the
system answers it. Every human answer permanently reduces future interruptions.

**Detect gaps.** The system compares what's been captured against the person's
role and the company's documentation, then flags what's missing — with severity
and a suggested interview question to close it.

---

## Architecture

```
Upload document ──> parse ──> chunk (overlapping) ──> embed ──> pgvector
                                                                   │
Interview ──> LLM asks question ◄──── vector search for context ───┘
      │
      └──> answer ──> LLM extracts typed chunks ──> embed ──> pgvector
                                                                   │
Question ──> embed ──> vector search ─────────────────────────────┘
      │
      ├── confidence ≥ 0.6 ──> answer with citations
      └── confidence < 0.6 ──> route to human ──> extract ──> back into the KB
```

**Stack**

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, Server Components) |
| Database | Supabase — Postgres + pgvector + Auth + Storage |
| Embeddings | Cloudflare Workers AI — `bge-small-en-v1.5`, 384-dim |
| LLM | Groq (`gpt-oss-120b`) |
| Hosting | Vercel |

---

## Engineering notes

**The RAG pipeline is built from scratch** — no LangChain, no vector-DB SaaS.
Chunking with configurable overlap, embedding, `ivfflat` indexes, and cosine
similarity search as Postgres functions. Retrieval is a SQL call, not a
framework abstraction.

**Multi-tenancy runs on row-level security.** Every table is scoped by company at
the database layer, so a query that forgets a `WHERE` clause still can't leak
across tenants. Company creation needed a specific RLS policy split, because the
insert-and-return pattern reads the row back before the user is a member of it.

**The AI layer is provider-swappable by design.** Every LLM call goes through a
single `chat()` function in `lib/ai/llm.ts`. Moving from Groq to Claude or OpenAI
is one file. Same for embeddings — one module, one interface. This mattered in
practice: the embedding provider changed mid-build when Hugging Face moved Docker
Spaces behind a paywall, and the swap touched exactly one file.

**Hallucination is treated as the primary failure mode.** The Q&A prompt is
constrained to the retrieved chunks and instructed that admitting ignorance is
better than guessing. Answers below a confidence threshold route to a human
rather than being served. For a tool aimed at manufacturing and pharma, a
confident wrong answer is worse than no answer.

**Built entirely on free tiers**, with a documented production path — the
cost analysis for embeddings and LLM routing (cheap model for high-volume
extraction, stronger model for reasoning) is in `EMBEDDINGS_GUIDE.md` and
`LLM_GUIDE.md`.

---

## Running locally

```bash
git clone https://github.com/vpatel2398/Tacit.git
cd Tacit
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Then run the migrations in `supabase/migrations/` in order via the Supabase SQL
editor, and seed demo data:

```bash
node scripts/seed-demo.mjs
```

**Required keys** — all free tier:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | supabase.com |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com — Workers AI |
| `GROQ_API_KEY` | console.groq.com |
| `SUPABASE_SERVICE_ROLE_KEY` | local only, for the seed script |

---

## Status

Working end to end: authentication, multi-tenant company onboarding with invite
codes and approval flow, document ingestion (PDF / DOCX / TXT / MD / CSV), the AI
interview and extraction engine, semantic Q&A with human routing, and gap
detection.

Deliberately deferred: team-level knowledge scoping, and passive capture from
Slack and meeting transcripts — both reuse the existing extraction engine.

---

Built by [Vivek Patel](https://github.com/vpatel2398).
