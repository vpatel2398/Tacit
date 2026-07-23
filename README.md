# Knowledge Layer

An always-on institutional knowledge capture system — built so companies stop losing what their people know when those people go quiet, change roles, or leave.

## What it does

Knowledge Layer runs in the background of a team's workflow, capturing institutional knowledge before it walks out the door:

- **AI interview agent** — conversational agent that draws out tacit knowledge from subject-matter experts and extracts it into structured, typed chunks
- **Q&A with citations** — ask questions against the captured knowledge base and get answers grounded in sourced, traceable chunks
- **Human routing** — when the knowledge base can't answer confidently, questions get routed to the right person instead of dead-ending
- **Gap detection** — surfaces areas where institutional knowledge is thin or missing, so teams know where to focus capture efforts
- **Knowledge holder profiles** — track who knows what across the org
- **Team & company dashboards** — sessions, knowledge base browsing, team management, and settings in one place

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database / Vector store:** Supabase (Postgres + pgvector)
- **Embeddings:** local embedding model
- **LLM:** Groq (development) — production split across Claude Haiku / Sonnet depending on task complexity
- **Auth:** Supabase Auth

## Getting started

1. Clone the repo

   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables — copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[your Supabase project URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[your Supabase anon/publishable key]
   GROQ_API_KEY=[your Groq API key]
   ```

4. Run the dev server

   ```bash
   npm run dev
   ```

   The app runs on [localhost:3000](http://localhost:3000).

## Project status

- ✅ Phase 1 — schema, auth, onboarding, knowledge holder profiles, document ingestion pipeline
- ✅ Phase 2 — AI interview agent + knowledge extraction into typed chunks
- ✅ Phase 3 — Q&A layer with citations and human routing
- ✅ Gap detection, knowledge base, sessions, team, and settings pages
- ⏳ Team layer (hybrid team-only + company-wide knowledge, multi-team membership, admin/lead roles) — deferred to Phase 1.5

## License

Private project — not currently licensed for reuse.