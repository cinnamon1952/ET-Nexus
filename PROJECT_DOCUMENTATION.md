# ET Nexus Project Documentation

## 1. Project Overview

`ET Nexus` is a full-stack AI-assisted business news product built around `Economic Times` coverage.

It combines:

- a `FastAPI` backend that ingests and normalizes live ET articles into an in-memory corpus
- a `Next.js` frontend that renders a persona-aware news experience
- AI-assisted features such as briefings, article chat, dynamic story arcs, topic synthesis, translation, and a free storyboard-style video view

The current product focus is:

- ET-only news ingestion
- live-ish refresh behavior using TTL-based re-ingestion
- article-linked story arcs instead of static canned arcs
- real ET article images
- real language translation for feed and article content
- a free visual video/storyboard experience without paid avatar APIs

## 2. Current Status

The core app is working end-to-end.

Major working features:

- live ET feed ingestion from multiple ET RSS sources
- stable article IDs
- persona-filtered feed views
- article detail page with real article image
- AI-generated article briefing
- article-level AI chat
- article-dependent dynamic story arcs
- story arc tracker page
- topic-based navigator page
- real translation for feed and article content
- free storyboard-style video response using article data and ET imagery

No major blocker is left in the core experience.

The main remaining work would be polish or product-depth improvements, for example:

- translate more secondary UI areas such as navigator output, story-arc output, and video narration text on the client
- replace the free storyboard video with a true rendered video pipeline if paid infrastructure is acceptable
- replace lightweight or template-driven synthesis areas with deeper multi-document LLM reasoning
- add persistent storage and caching beyond in-memory runtime state
- add test coverage beyond manual verification and lint/build checks

## 3. Tech Stack

### Frontend

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `lucide-react`

### Backend

- `FastAPI`
- `Uvicorn`
- `Pydantic`
- `python-dotenv`
- `feedparser`
- `BeautifulSoup4`
- `requests`
- `Groq Python SDK`

## 4. Repository Structure

```text
ET-Nexus/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── README.md
└── PROJECT_DOCUMENTATION.md
```

## 5. Product Surface

### Main Pages

- `/`
  - live persona-aware feed
  - ET article cards with thumbnails
  - inline story arc preview

- `/article/[id]`
  - full article content
  - AI briefing
  - translation-aware article rendering
  - free inline video preview
  - chat for the current article
  - link into the story arc tracker for this article

- `/story-arc`
  - full article-linked dynamic story arc page
  - timeline
  - key players
  - sentiment trajectory
  - predictions / watch-next view

- `/navigator`
  - topic exploration page across the current ET corpus
  - synthesis, key findings, source articles, and follow-up questions

- `/video`
  - video studio page
  - article picker
  - generated storyboard scenes
  - scene-by-scene article-backed preview

### Global Controls

The navbar provides:

- persona selection:
  - `general`
  - `investor`
  - `founder`
  - `student`

- language selection:
  - `English`
  - `Hindi`
  - `Tamil`
  - `Telugu`
  - `Bengali`

## 6. Data Model Summary

The backend stores articles in an in-memory `ARTICLES_DB`.

Each normalized article includes fields such as:

- `id`
- `title`
- `summary`
- `content`
- `full_text`
- `author`
- `date`
- `category`
- `tags`
- `sentiment`
- `image_url`
- `persona_relevance`
- `source`
- `read_time`
- `link`

Important characteristics:

- IDs are stable and derived from the article link
- the corpus is rebuilt by ingestion
- the database is not persistent across process restarts
- the app relies on ET article HTML and RSS content for article text and images

## 7. Feed Ingestion

### Source Policy

This project currently uses `Economic Times` only.

Configured ET RSS sources include:

- ET Markets RSS
- ET Tech RSS
- ET B2B Startup RSS
- ET Education RSS

### Ingestion Behavior

On backend startup:

- the app attempts a best-effort ingest so the first page load is not empty

During runtime:

- feed requests call a freshness check
- if the in-memory corpus is stale, the backend re-ingests automatically
- the user can also force a refresh via the feed endpoint

### Refresh Controls

The following backend settings control ingestion behavior:

- `FEED_REFRESH_TTL_SECONDS`
- `MAX_FEED_ARTICLES`
- `INGEST_WITH_GROQ`

### Article Images

The backend extracts real ET article thumbnails using:

- `og:image`
- `twitter:image`
- `link[rel="image_src"]`
- image fallback scanning in article HTML

This is why feed cards and article pages can now show real ET article visuals.

## 8. AI Features

### 8.1 Briefing

Endpoint: `POST /api/briefing`

Purpose:

- generate article-level bullet summaries
- estimate sentiment
- return a confidence score

Behavior:

- uses the current article from the in-memory corpus
- prefers model-backed behavior when the API key is available

### 8.2 Article Chat

Endpoint: `POST /api/chat`

Purpose:

- answer questions using the current article as context

Behavior:

- grounded to the article text
- intended to answer only from the article
- falls back gracefully on model failure

### 8.3 Translation

Endpoints:

- `POST /api/translate`
- `POST /api/translate/batch`

Purpose:

- translate content into the selected target language

Current implementation:

- model-backed translation using Groq
- chunking for longer article bodies
- in-memory translation cache keyed by language + text hash
- batch translation support for efficient feed and article rendering

Current frontend translation coverage:

- feed titles
- feed summaries
- article title
- article content
- AI briefing bullets

### 8.4 Story Arc Generation

Endpoints:

- `GET /api/story-arcs`
- `GET /api/story-arc/{arc_id}`

Purpose:

- generate article-linked story arcs from the current ET article corpus

Behavior:

- related articles are retrieved by overlap/similarity logic
- story arcs are built from the selected seed article
- arcs are no longer static or generic global placeholders
- story arc summaries are generated per article seed
- detailed arcs include:
  - timeline events
  - key players
  - sentiment trajectory
  - predictions

### 8.5 Navigator

Endpoint: `POST /api/navigator`

Purpose:

- synthesize multiple articles around a user-entered topic

Current status:

- useful and working
- still lighter-weight than the story arc system
- some of the synthesis output remains template-driven and is a good future upgrade candidate

### 8.6 Video Studio

Endpoint: `POST /api/video`

Purpose:

- create a free article-backed storyboard/video response

Current behavior:

- this is not a true rendered avatar video
- it generates a structured response that includes:
  - scene list
  - narration
  - scene visuals
  - scene timestamps
  - scene durations
  - article image as scene backdrop
  - data-visual metadata

Why this approach was chosen:

- it is fully free to operate
- it avoids paid avatar/video generation services
- it still creates a visually meaningful “video studio” experience

## 9. Persona System

The app supports four personas:

- `general`
- `investor`
- `founder`
- `student`

Persona usage appears in:

- feed filtering
- story arc selection
- navigator topic synthesis

The backend infers persona relevance from article text and title using keyword heuristics, with optional LLM classification support during ingest if `INGEST_WITH_GROQ=true`.

## 10. Language System

The language system is controlled in the frontend `AppProvider`.

Supported values:

- `English`
- `Hindi`
- `Tamil`
- `Telugu`
- `Bengali`

Current behavior:

- English renders the original content
- other languages trigger translation requests
- translated content is rendered in the UI
- translations are cached in-memory on the backend

Important note:

- translation quality depends on having a valid `GROQ_API_KEY`
- without a working model client, translations degrade to safe fallback behavior

## 11. Backend API Reference

### `GET /`

Simple backend status and endpoint summary.

### `POST /api/admin/ingest`

Forces live ET ingestion and replaces the in-memory corpus.

### `GET /api/feed?persona={persona}&refresh={bool}`

Returns a lightweight feed for the chosen persona.

Response contains:

- `persona`
- `count`
- `articles`
- `last_ingested_at`

Each feed article includes:

- `id`
- `title`
- `summary`
- `author`
- `date`
- `category`
- `tags`
- `sentiment`
- `image_url`

### `GET /api/article/{article_id}`

Returns the full stored article object.

### `POST /api/briefing`

Request body:

```json
{
  "article_id": "article-id"
}
```

### `POST /api/chat`

Request body:

```json
{
  "question": "How does this affect markets?",
  "context_id": "article-id"
}
```

### `POST /api/translate`

Request body:

```json
{
  "text": "Some text",
  "target_language": "Hindi"
}
```

### `POST /api/translate/batch`

Request body:

```json
{
  "texts": ["Title", "Summary", "Body"],
  "target_language": "Hindi"
}
```

### `POST /api/video`

Request body:

```json
{
  "article_id": "article-id"
}
```

### `GET /api/story-arcs?persona={persona}`

Returns story arc summaries for seed articles under the selected persona.

### `GET /api/story-arc/{arc_id}?persona={persona}`

Returns the full story arc for the requested seed article.

### `POST /api/navigator`

Request body:

```json
{
  "topic": "AI in Finance",
  "persona": "investor"
}
```

## 12. Frontend Architecture Summary

### App Shell

`frontend/app/layout.tsx` provides:

- app-wide layout
- Google font loading via `next/font`
- global navbar
- `AppProvider` for persona/language state

### Core Client Utilities

`frontend/lib/context.tsx`

- stores selected persona and selected language

`frontend/lib/api.ts`

- central typed API client
- all frontend network calls are routed through here

### Core Components

`frontend/components/Navbar.tsx`

- navigation
- persona switcher
- language switcher

`frontend/components/NewsCard.tsx`

- feed card UI
- sentiment badge
- ET article thumbnail rendering

`frontend/components/StoryArc.tsx`

- story arc preview on the home page
- article-linked rather than static

`frontend/components/ChatInterface.tsx`

- article chat experience

## 13. Setup Instructions

## Prerequisites

- `Python 3.10+`
- `Node.js 18+`
- `npm`
- a valid `GROQ_API_KEY`

## Backend Setup

From the repo root:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant

# Optional tuning
FEED_REFRESH_TTL_SECONDS=900
MAX_FEED_ARTICLES=12
MAX_STORY_ARC_SUMMARIES=6
MAX_RELATED_ARTICLES=4
INGEST_WITH_GROQ=false
```

Run backend:

```bash
cd backend
. .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

Backend URL:

- `http://127.0.0.1:8000`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## 14. Development Commands

### Backend

```bash
cd backend
. .venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

### Lint

```bash
cd frontend
npm run lint
```

### Production Build

```bash
cd frontend
npm run build
```

### Basic Backend Syntax Check

```bash
python3 -m py_compile backend/main.py
```

## 15. Runtime Notes

### In-Memory Storage

Articles and translation cache live only in process memory.

Implications:

- restarting the backend clears the article DB
- restarting the backend clears translation cache
- there is no durable database yet

### Initial Load

The backend tries to ingest on startup.

Implications:

- first startup can take longer than a trivial API server
- the feed endpoint still retries lazy ingest if startup ingest fails

### Translation Cost and Speed

The first non-English translation request for new content can take noticeable time.

After that:

- the backend cache makes repeated translations much faster

### Video Expectations

The current video system is intentionally free and lightweight.

It does:

- create a scene graph
- use real article imagery
- provide narration text and timings

It does not:

- render a downloadable final video file
- create an avatar presenter
- call a paid video generation vendor

## 16. Known Limitations

These are the main current limitations to be aware of:

- persistence is in-memory only
- navigator synthesis is useful but still more template-driven than the story-arc pipeline
- video output is a storyboard payload, not a true generated video file
- not every secondary UI text string is translated yet
- there is no automated end-to-end test suite at the moment
- image rendering uses plain `<img>` tags in several places, which causes non-blocking Next.js lint warnings

## 17. Troubleshooting

### Feed does not load

Check:

- backend is running on `127.0.0.1:8000`
- frontend is running on `localhost:3000`
- `GROQ_API_KEY` is set if AI features are expected to work

### No articles appear

Possible causes:

- ET RSS fetch failed
- startup ingest did not complete yet
- backend was restarted and has not reloaded corpus

Try:

- refreshing the home page
- calling `POST /api/admin/ingest`
- checking backend logs

### Translation does not look real

Check:

- `GROQ_API_KEY` is valid
- backend can reach the model provider

Without a live model client, translation falls back safely and quality drops.

### Story arcs seem weak

Possible causes:

- too few related ET articles in the current corpus
- backend recently restarted and corpus is small
- the selected persona narrows the candidate set

### Video feels “not real”

That is expected for the current free implementation.

The current design is a storyboard/video-preview system, not a rendered media pipeline.

## 18. Recommended Next Enhancements

If this project is continued, the strongest next improvements would be:

1. Add persistent storage for article corpus and translation cache.
2. Upgrade navigator to a more robust multi-document synthesis pipeline.
3. Translate more generated surfaces, including story arcs and navigator output.
4. Replace plain image tags with `next/image`.
5. Add focused backend and frontend tests.
6. Add a true rendered video pipeline if paid APIs become acceptable.

## 19. Quick Start Summary

If you just want to run the project:

1. Create and activate `backend/.venv`.
2. Install backend dependencies with `pip install -r requirements.txt`.
3. Add `GROQ_API_KEY` to `backend/.env`.
4. Start the backend on port `8000`.
5. Run `npm install` in `frontend`.
6. Start the frontend on port `3000`.
7. Open `http://localhost:3000`.

## 20. Final Notes

This project is no longer just a static mock newsroom.

At its current state it is:

- ET-backed
- image-backed
- persona-aware
- translation-aware
- story-arc-driven
- usable locally as a working prototype

For demo, prototyping, and iterative product development, the foundation is solid.
