"""
ET Nexus — The AI-Native Newsroom
FastAPI Backend with mock data and simulated AI endpoints.
"""

import asyncio
import json
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from typing import Optional

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────

app = FastAPI(
    title="ET Nexus API",
    description="Backend for ET Nexus — The AI-Native Newsroom",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────

class BriefingRequest(BaseModel):
    article_id: str

class ChatRequest(BaseModel):
    question: str
    context_id: str

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class VideoRequest(BaseModel):
    article_id: str

class StoryArcRequest(BaseModel):
    topic: str

class NavigatorRequest(BaseModel):
    topic: str
    persona: str = "investor"

# ─────────────────────────────────────────────
# Mock Article Database
# ─────────────────────────────────────────────

MOCK_ARTICLES = {
    "1": {
        "id": "1",
        "title": "Financial Contagion: How One Bank's Collapse Triggered a Global Sell-Off",
        "summary": "A deep dive into cascading failures spreading from a single bank to global markets.",
        "content": "A mid-tier European lender disclosed large real-estate losses, triggering rapid cross-market contagion. CDS spreads widened, equity indices fell, and algorithmic momentum exits amplified volatility.",
        "author": "Priya Mehta",
        "date": "2026-03-10",
        "category": "Markets",
        "tags": ["contagion", "banking", "risk", "systemic-risk"],
        "sentiment": "negative",
        "image_url": "/images/contagion.jpg",
        "persona_relevance": ["investor", "student"],
    },
    "2": {
        "id": "2",
        "title": "Deep Learning Models Now Predict Earnings Surprises with 78% Accuracy",
        "summary": "Transformer models are outperforming consensus earnings forecasts.",
        "content": "A model combining SEC filings, transcript sentiment, and satellite data reported strong directional accuracy on earnings surprises and generated backtested alpha.",
        "author": "James O'Sullivan",
        "date": "2026-03-12",
        "category": "AI & Finance",
        "tags": ["deep-learning", "earnings", "quant", "transformers"],
        "sentiment": "positive",
        "image_url": "/images/deep-learning.jpg",
        "persona_relevance": ["investor", "founder", "student"],
    },
    "3": {
        "id": "3",
        "title": "Algorithmic Trading Firms Face New SEC Scrutiny Over Flash-Crash Prevention",
        "summary": "The SEC proposes mandatory kill-switch controls for HFT systems.",
        "content": "Following a sharp futures anomaly and rebound, the SEC proposed guardrails for algorithmic trading, including mandatory circuit-breakers and tighter oversight.",
        "author": "David Chen",
        "date": "2026-03-15",
        "category": "Regulation",
        "tags": ["algorithmic-trading", "SEC", "regulation", "HFT"],
        "sentiment": "neutral",
        "image_url": "/images/algo-trading.jpg",
        "persona_relevance": ["investor", "founder"],
    },
    "4": {
        "id": "4",
        "title": "India's UPI Processes 20 Billion Transactions in February — A Fintech Milestone",
        "summary": "UPI sets a record and strengthens India's lead in real-time payments.",
        "content": "Record UPI transaction volume highlights mature digital payments rails and opens opportunities in lending, analytics, and fraud detection layers.",
        "author": "Ananya Kapoor",
        "date": "2026-03-08",
        "category": "Fintech",
        "tags": ["UPI", "payments", "India", "fintech"],
        "sentiment": "positive",
        "image_url": "/images/upi.jpg",
        "persona_relevance": ["founder", "student"],
    },
    "5": {
        "id": "5",
        "title": "The Rise of Synthetic Data in Quantitative Finance",
        "summary": "Funds are using synthetic market paths to stress-test strategies.",
        "content": "Quant firms are applying GANs and diffusion models to generate realistic synthetic data for tail-risk scenario testing and robustness analysis.",
        "author": "Lena Fischer",
        "date": "2026-03-18",
        "category": "AI & Finance",
        "tags": ["synthetic-data", "GANs", "quant", "risk-management"],
        "sentiment": "positive",
        "image_url": "/images/synthetic-data.jpg",
        "persona_relevance": ["investor", "student"],
    },
    "6": {
        "id": "6",
        "title": "Venture Capital Funding Rebounds: Q1 2026 Sees $78B in Global Deals",
        "summary": "VC activity rebounds with AI infrastructure and climate tech leading.",
        "content": "Global VC funding rose strongly year-over-year, with larger rounds in AI infrastructure and stricter governance terms in new deals.",
        "author": "Marcus Williams",
        "date": "2026-03-20",
        "category": "Venture Capital",
        "tags": ["VC", "funding", "startups", "AI"],
        "sentiment": "positive",
        "image_url": "/images/vc-funding.jpg",
        "persona_relevance": ["founder", "investor"],
    },
    "7": {
        "id": "7",
        "title": "Central Banks Explore AI-Driven Monetary Policy Simulations",
        "summary": "Central banks pilot LLM-based agent simulations for policy testing.",
        "content": "Multiple central banks are evaluating agent-based simulations to estimate policy impacts, with debate about model bias and robustness.",
        "author": "Ravi Shankar",
        "date": "2026-03-22",
        "category": "Macro",
        "tags": ["central-banks", "AI", "monetary-policy", "simulation"],
        "sentiment": "neutral",
        "image_url": "/images/central-bank-ai.jpg",
        "persona_relevance": ["investor", "student"],
    },
    "8": {
        "id": "8",
        "title": "How a 22-Year-Old Built a $50M ARR Fintech from a College Dorm",
        "summary": "An AI-native invoicing startup reaches rapid scale and unicorn valuation.",
        "content": "The company automated accounts receivable with AI agents and scaled quickly through product-led efficiency and strong SMB adoption.",
        "author": "Vikram Rao",
        "date": "2026-03-24",
        "category": "Startups",
        "tags": ["fintech", "AI-agents", "SaaS", "unicorn"],
        "sentiment": "positive",
        "image_url": "/images/payloop.jpg",
        "persona_relevance": ["founder", "student"],
    },
}


def _extract_json_object(raw_text: str) -> dict:
    """Extract a JSON object from model output, even if wrapped in markdown fences."""
    if not raw_text:
        raise ValueError("Empty model response")

    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 3:
            text = "\n".join(lines[1:-1]).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found")

    return json.loads(text[start:end + 1])


def _default_briefing(article: dict) -> dict:
    return {
        "bullets": [
            article.get("summary", "Key developments are covered in this article."),
            f"Category focus: {article.get('category', 'General')}.",
            f"Top themes: {', '.join(article.get('tags', [])[:3]) or 'business, markets, analysis'}.",
            "The story includes market impact, stakeholder implications, and forward-looking signals.",
        ],
        "sentiment": article.get("sentiment", "neutral"),
        "confidence_score": 70,
    }


def _default_chat_response(article: dict, question: str) -> dict:
    context_title = article.get("title", "the selected article")
    return {
        "response": (
            f"Based on \"{context_title}\", a concise takeaway is: "
            f"{article.get('summary', 'the article highlights key business developments and their implications')}. "
            f"Your question was: \"{question}\"."
        ),
        "sources": [context_title],
    }


async def generate_briefing(article: dict) -> dict:
    """Generate article briefing with Groq and a strict JSON output contract."""
    if not groq_client:
        return _default_briefing(article)

    system_prompt = (
        "You are a business news analyst. "
        "Return ONLY raw JSON with this exact schema and no extra keys: "
        "{\"bullets\": [string], \"sentiment\": \"positive|negative|neutral\", \"confidence_score\": integer}. "
        "Rules: bullets must be 4-6 concise factual points. confidence_score must be 0-100 integer. "
        "No markdown fences. No additional text."
    )
    user_prompt = (
        f"Article title: {article.get('title', '')}\n"
        f"Article summary: {article.get('summary', '')}\n"
        f"Article content:\n{article.get('content', '')}"
    )

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = completion.choices[0].message.content or ""
        parsed = _extract_json_object(content)

        bullets = parsed.get("bullets", [])
        if not isinstance(bullets, list):
            raise ValueError("Invalid bullets format")
        bullets = [str(b).strip() for b in bullets if str(b).strip()]
        if not bullets:
            raise ValueError("No bullets returned")

        sentiment = str(parsed.get("sentiment", "neutral")).lower()
        if sentiment not in {"positive", "negative", "neutral"}:
            sentiment = "neutral"

        confidence_score = int(parsed.get("confidence_score", 70))
        confidence_score = max(0, min(100, confidence_score))

        return {
            "bullets": bullets,
            "sentiment": sentiment,
            "confidence_score": confidence_score,
        }
    except Exception:
        return _default_briefing(article)


async def generate_chat_response(question: str, context_id: str) -> dict:
    """Answer a user question grounded strictly in the selected article text."""
    article = MOCK_ARTICLES.get(context_id)
    if not article:
        return {
            "response": "I could not find context for this article. Please open the article again and retry.",
            "sources": ["unknown"],
        }

    if not groq_client:
        return _default_chat_response(article, question)

    context_title = article["title"]
    system_prompt = (
        "You are a financial news assistant. "
        "Answer the user question using strictly and only the provided article text. "
        "If the answer is not explicitly supported by the text, say that the article does not provide that detail. "
        "Keep the answer concise and factual."
    )
    user_prompt = (
        f"Article title: {context_title}\n"
        f"Article text:\n{article.get('content', '')}\n\n"
        f"User question: {question}"
    )

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        response_text = (completion.choices[0].message.content or "").strip()
        if not response_text:
            raise ValueError("Empty chat completion")

        return {
            "response": response_text,
            "sources": [context_title],
        }
    except Exception:
        return _default_chat_response(article, question)


async def generate_translation(text: str, target_language: str) -> dict:
    """
    Simulate a culturally adapted translation.
    TODO: Replace with real translation API (e.g., Google Translate + LLM post-editing).
    """
    await asyncio.sleep(0.5)  # Simulated latency

    translations = {
        "Hindi": {
            "Markets crashed today": "आज बाज़ारों में भारी गिरावट आई — निवेशकों में बेचैनी का माहौल है।",
            "default": "यह एक AI-जनित हिंदी अनुवाद है। मूल पाठ का सांस्कृतिक रूप से अनुकूलित संस्करण यहाँ प्रदर्शित होगा।",
        },
        "Tamil": {
            "default": "இது AI-உருவாக்கிய தமிழ் மொழிபெயர்ப்பு. கலாச்சார ரீதியாக தழுவிய பதிப்பு இங்கே காட்டப்படும். வணிக நிதி செய்திகளை எளிய தமிழில் புரிந்துகொள்ளலாம்.",
        },
        "Telugu": {
            "default": "ఇది AI-రూపొందించిన తెలుగు అనువాదం. సాంస్కృతికంగా అనుకూలమైన వెర్షన్ ఇక్కడ చూపబడుతుంది. వ్యాపార ఆర్థిక వార్తలను సరళమైన తెలుగులో అర్థం చేసుకోవచ్చు.",
        },
        "Bengali": {
            "default": "এটি একটি AI-উৎপন্ন বাংলা অনুবাদ। সাংস্কৃতিকভাবে অভিযোজিত সংস্করণ এখানে প্রদর্শিত হবে। ব্যবসায়িক অর্থনৈতিক সংবাদ সহজ বাংলায় বোঝা যাবে।",
        },
    }

    lang_map = translations.get(target_language, translations.get("Hindi"))
    translated_text = lang_map.get(text, lang_map.get("default", f"[Translated to {target_language}]: {text}"))

    return {
        "original": text,
        "translated": translated_text,
        "target_language": target_language,
        "culturally_adapted": True,
        "note": f"Translation adapted for {target_language}-speaking audience with local idioms and context.",
    }


# ─────────────────────────────────────────────
# API Endpoints
# ─────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "ET Nexus API",
        "version": "0.1.0",
        "status": "running",
        "endpoints": [
            "GET  /api/feed?persona={investor|founder|student}",
            "POST /api/briefing",
            "POST /api/chat",
            "POST /api/translate",
        ],
    }


@app.get("/api/feed")
async def get_feed(persona: str = Query("investor", description="User persona: investor, founder, or student")):
    """Return articles filtered by persona relevance."""
    valid_personas = ["investor", "founder", "student"]
    if persona.lower() not in valid_personas:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid persona '{persona}'. Choose from: {valid_personas}",
        )

    filtered = [
        article for article in MOCK_ARTICLES.values()
        if persona.lower() in article["persona_relevance"]
    ]

    # Return a lightweight feed (no full content)
    feed = []
    for a in filtered:
        feed.append({
            "id": a["id"],
            "title": a["title"],
            "summary": a["summary"],
            "author": a["author"],
            "date": a["date"],
            "category": a["category"],
            "tags": a["tags"],
            "sentiment": a["sentiment"],
            "image_url": a["image_url"],
        })

    return {"persona": persona, "count": len(feed), "articles": feed}


@app.get("/api/article/{article_id}")
async def get_article(article_id: str):
    """Return full article by ID."""
    article = MOCK_ARTICLES.get(article_id)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{article_id}' not found.")
    return article


@app.post("/api/briefing")
async def get_briefing(request: BriefingRequest):
    """Generate an AI briefing (bullet summary + sentiment) for an article."""
    article = MOCK_ARTICLES.get(request.article_id)
    if not article:
        raise HTTPException(
            status_code=404,
            detail=f"Article '{request.article_id}' not found.",
        )

    briefing = await generate_briefing(article)
    confidence_score = int(briefing.get("confidence_score", 70))
    confidence_score = max(0, min(100, confidence_score))
    return {
        "article_id": request.article_id,
        "article_title": article["title"],
        "bullets": briefing.get("bullets", []),
        "sentiment": briefing.get("sentiment", "neutral"),
        "confidence_score": confidence_score,
        # Keep legacy numeric contract expected by frontend api.ts.
        "confidence": round(confidence_score / 100, 2),
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Respond to a user question in the context of an article."""
    article = MOCK_ARTICLES.get(request.context_id)
    if not article:
        raise HTTPException(
            status_code=404,
            detail=f"Article '{request.context_id}' not found.",
        )

    result = await generate_chat_response(request.question, request.context_id)
    return {
        "question": request.question,
        "context_id": request.context_id,
        **result,
    }


@app.post("/api/translate")
async def translate(request: TranslateRequest):
    """Translate and culturally adapt text to a target language."""
    result = await generate_translation(request.text, request.target_language)
    return result


# ─────────────────────────────────────────────
# AI News Video Studio
# ─────────────────────────────────────────────

@app.post("/api/video")
async def generate_video(request: VideoRequest):
    """
    Simulate AI video generation from an article.
    TODO: Replace with real video generation pipeline.
    """
    article = MOCK_ARTICLES.get(request.article_id)
    if not article:
        raise HTTPException(status_code=404, detail=f"Article '{request.article_id}' not found.")

    await asyncio.sleep(2.0)  # Simulated video generation time

    return {
        "article_id": request.article_id,
        "title": article["title"],
        "video_status": "generated",
        "duration_seconds": 90,
        "format": "mp4",
        "resolution": "1080p",
        "scenes": [
            {
                "timestamp": "0:00",
                "type": "intro",
                "narration": f"Breaking: {article['title']}",
                "visual": "Animated title card with ET Nexus branding and category badge",
                "duration": 8,
            },
            {
                "timestamp": "0:08",
                "type": "context",
                "narration": article["summary"],
                "visual": "Animated data visualization showing key metrics and trends",
                "duration": 20,
            },
            {
                "timestamp": "0:28",
                "type": "analysis",
                "narration": f"Key analysis from {article['author']} highlights several critical factors driving this development.",
                "visual": "Split-screen with expert quote overlay and supporting charts",
                "duration": 25,
            },
            {
                "timestamp": "0:53",
                "type": "data",
                "narration": "Let's look at the numbers that matter.",
                "visual": "Animated bar charts and line graphs with real-time data overlays",
                "duration": 20,
            },
            {
                "timestamp": "1:13",
                "type": "outlook",
                "narration": "Looking ahead, analysts expect this trend to reshape the landscape significantly.",
                "visual": "Forward-looking prediction graphic with confidence intervals",
                "duration": 12,
            },
            {
                "timestamp": "1:25",
                "type": "outro",
                "narration": "Stay informed with ET Nexus — your AI-native newsroom.",
                "visual": "ET Nexus logo with subscribe CTA and related article thumbnails",
                "duration": 5,
            },
        ],
        "ai_narration_voice": "professional-female",
        "background_music": "corporate-ambient",
        "data_visuals": [
            {"type": "bar_chart", "label": "Market Impact", "data": [45, 72, 38, 91, 65]},
            {"type": "line_graph", "label": "Trend Over Time", "data": [12, 19, 35, 42, 58, 71, 85]},
            {"type": "pie_chart", "label": "Sector Breakdown", "data": [{"label": "Tech", "value": 35}, {"label": "Finance", "value": 28}, {"label": "Energy", "value": 22}, {"label": "Other", "value": 15}]},
        ],
        "tags": article["tags"],
        "sentiment": article["sentiment"],
    }


# ─────────────────────────────────────────────
# Story Arc Tracker
# ─────────────────────────────────────────────

STORY_ARCS = {
    "market-contagion": {
        "id": "market-contagion",
        "title": "The Ripple Effects of Market Contagion",
        "description": "Tracking how a single bank's real-estate losses cascaded into a global financial episode.",
        "status": "active",
        "events": [
            {
                "date": "2026-03-03",
                "title": "Nasdaq Flash Anomaly",
                "description": "Nasdaq-100 futures plunge 4.1% in 12 minutes before snapping back. Algorithmic cascades identified as primary amplifier.",
                "sentiment": "negative",
                "impact_score": 7.2,
                "related_articles": ["3"],
            },
            {
                "date": "2026-03-10",
                "title": "Vereinigte Kreditbank Disclosure",
                "description": "German lender reveals €6.2B real-estate loss. Global sell-off begins within hours — Asian CDS spreads widen 120 bps.",
                "sentiment": "negative",
                "impact_score": 9.5,
                "related_articles": ["1"],
            },
            {
                "date": "2026-03-15",
                "title": "SEC Kill Switch Proposal",
                "description": "SEC proposes Rule 15c3-7 mandating automated circuit-breakers for all algorithmic trading systems.",
                "sentiment": "neutral",
                "impact_score": 6.8,
                "related_articles": ["3"],
            },
            {
                "date": "2026-03-18",
                "title": "Synthetic Data Hedge",
                "description": "Major hedge funds reveal they anticipated the contagion using synthetic data stress-testing and avoided 80% of drawdown.",
                "sentiment": "positive",
                "impact_score": 5.4,
                "related_articles": ["5"],
            },
            {
                "date": "2026-03-22",
                "title": "Central Banks Deploy AI Simulations",
                "description": "Five central banks pilot LLM-driven agent-based models to stress-test monetary policy before implementation.",
                "sentiment": "positive",
                "impact_score": 7.8,
                "related_articles": ["7"],
            },
        ],
        "key_players": [
            {"name": "Vereinigte Kreditbank AG", "role": "Origin of contagion", "sentiment": "negative"},
            {"name": "SEC", "role": "Regulatory response", "sentiment": "neutral"},
            {"name": "BIS (Bank for International Settlements)", "role": "Research & analysis", "sentiment": "neutral"},
            {"name": "Citadel Securities", "role": "Industry voice — supportive of Kill Switch", "sentiment": "positive"},
            {"name": "Two Sigma / DE Shaw", "role": "Synthetic data pioneers — hedged successfully", "sentiment": "positive"},
        ],
        "sentiment_trajectory": [
            {"date": "2026-03-03", "score": -0.6},
            {"date": "2026-03-10", "score": -0.9},
            {"date": "2026-03-15", "score": -0.3},
            {"date": "2026-03-18", "score": 0.2},
            {"date": "2026-03-22", "score": 0.5},
        ],
        "predictions": [
            "Basel IV capital buffer revision expected by Q3 2026.",
            "SEC Kill Switch Rule likely to pass with modifications by year-end.",
            "LLM-based monetary policy simulations to become standard at G7 central banks within 18 months.",
            "Algo-trading market share may temporarily decline 5-8% as firms retool for compliance.",
        ],
    },
    "ai-finance-revolution": {
        "id": "ai-finance-revolution",
        "title": "AI's Takeover of Financial Markets",
        "description": "From earnings prediction to monetary policy — AI is reshaping every corner of finance.",
        "status": "active",
        "events": [
            {
                "date": "2026-03-08",
                "title": "UPI Hits 20B Transactions",
                "description": "India's digital payments infrastructure matures to support AI-driven fintech layers.",
                "sentiment": "positive",
                "impact_score": 6.5,
                "related_articles": ["4"],
            },
            {
                "date": "2026-03-12",
                "title": "Deep Learning Beats Wall Street",
                "description": "QuantLens AI's transformer achieves 78% accuracy on earnings surprises.",
                "sentiment": "positive",
                "impact_score": 8.7,
                "related_articles": ["2"],
            },
            {
                "date": "2026-03-18",
                "title": "Synthetic Data Goes Mainstream",
                "description": "GANs and diffusion models generate synthetic market data for unprecedented stress testing.",
                "sentiment": "positive",
                "impact_score": 7.3,
                "related_articles": ["5"],
            },
            {
                "date": "2026-03-22",
                "title": "Central Banks Go AI-Native",
                "description": "Five central banks pilot LLM-powered economic simulations for policy decisions.",
                "sentiment": "positive",
                "impact_score": 8.9,
                "related_articles": ["7"],
            },
            {
                "date": "2026-03-24",
                "title": "AI-Native Startup Hits Unicorn",
                "description": "PayLoop reaches $50M ARR and $1.2B valuation with autonomous AI agents.",
                "sentiment": "positive",
                "impact_score": 7.1,
                "related_articles": ["8"],
            },
        ],
        "key_players": [
            {"name": "QuantLens AI", "role": "Pioneering deep-learning earnings prediction", "sentiment": "positive"},
            {"name": "Two Sigma / DE Shaw", "role": "Leading synthetic data adoption", "sentiment": "positive"},
            {"name": "RBI / BOE / ECB / BOJ / Fed", "role": "Central banks pioneering AI simulations", "sentiment": "neutral"},
            {"name": "PayLoop (Aisha Patel)", "role": "AI-native fintech unicorn", "sentiment": "positive"},
            {"name": "NPCI (India)", "role": "Enabling AI-driven payments infrastructure", "sentiment": "positive"},
        ],
        "sentiment_trajectory": [
            {"date": "2026-03-08", "score": 0.6},
            {"date": "2026-03-12", "score": 0.8},
            {"date": "2026-03-18", "score": 0.7},
            {"date": "2026-03-22", "score": 0.8},
            {"date": "2026-03-24", "score": 0.9},
        ],
        "predictions": [
            "AI-driven trading strategies to manage >$2T in assets by end of 2026.",
            "At least 3 more AI-native fintechs expected to reach unicorn status this year.",
            "Regulatory frameworks for AI in finance to emerge across G20 nations.",
            "Synthetic data market for finance to exceed $5B by 2028.",
        ],
    },
}


@app.get("/api/story-arcs")
async def list_story_arcs():
    """List all available story arcs."""
    arcs = []
    for arc in STORY_ARCS.values():
        arcs.append({
            "id": arc["id"],
            "title": arc["title"],
            "description": arc["description"],
            "status": arc["status"],
            "event_count": len(arc["events"]),
            "player_count": len(arc["key_players"]),
        })
    return {"arcs": arcs}


@app.get("/api/story-arc/{arc_id}")
async def get_story_arc(arc_id: str):
    """Get full story arc with timeline, key players, sentiment, and predictions."""
    await asyncio.sleep(0.8)  # Simulated processing
    arc = STORY_ARCS.get(arc_id)
    if not arc:
        raise HTTPException(status_code=404, detail=f"Story arc '{arc_id}' not found.")
    return arc


# ─────────────────────────────────────────────
# News Navigator — Multi-Article Synthesis
# ─────────────────────────────────────────────

@app.post("/api/navigator")
async def news_navigator(request: NavigatorRequest):
    """
    Synthesize multiple articles on a topic into an explorable briefing.
    TODO: Replace with real LLM multi-document summarisation.
    """
    await asyncio.sleep(1.5)  # Simulated processing

    topic_lower = request.topic.lower()

    # Find related articles by keyword matching
    related = []
    for article in MOCK_ARTICLES.values():
        title_lower = article["title"].lower()
        tags_lower = [t.lower() for t in article["tags"]]
        if any(kw in title_lower or kw in " ".join(tags_lower) for kw in topic_lower.split()):
            # Filter by persona if specified
            if request.persona in article["persona_relevance"]:
                related.append(article)

    if not related:
        # Fallback: return all articles for the persona
        related = [a for a in MOCK_ARTICLES.values() if request.persona in a["persona_relevance"]]

    return {
        "topic": request.topic,
        "persona": request.persona,
        "article_count": len(related),
        "synthesis": {
            "headline": f"Deep Briefing: {request.topic}",
            "executive_summary": f"Across {len(related)} articles, ET Nexus identifies converging trends in {request.topic}. Key themes include technological disruption, regulatory response, and market recalibration. The overall sentiment leans {'bullish' if sum(1 for a in related if a['sentiment']=='positive') > len(related)//2 else 'mixed'}.",
            "key_findings": [
                f"📊 {len(related)} related articles analysed spanning {related[0]['date'] if related else 'N/A'} to {related[-1]['date'] if related else 'N/A'}.",
                "🔍 Primary narrative: technological innovation is outpacing regulatory frameworks.",
                "📈 Sentiment trend: shifting from cautious to cautiously optimistic.",
                "⚡ Contrarian view: rapid AI adoption may introduce new systemic risks.",
                "🎯 Investor action: position for regulatory clarity in Q3-Q4 2026.",
            ],
            "follow_up_questions": [
                "How do these developments affect emerging market investors?",
                "What are the second-order effects on traditional financial institutions?",
                "Which regulatory frameworks are most likely to be adopted globally?",
                "How should portfolio allocation change in response to these trends?",
            ],
        },
        "source_articles": [
            {"id": a["id"], "title": a["title"], "sentiment": a["sentiment"], "date": a["date"]}
            for a in related
        ],
    }
