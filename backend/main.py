"""
ET Nexus — The AI-Native Newsroom
FastAPI Backend with mock data and simulated AI endpoints.
"""

import asyncio
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

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
        "summary": "A deep dive into the cascading failures that spread from a single mid-tier European bank to markets in Asia, Latin America, and the US within 72 hours.",
        "content": "In March 2026, Vereinigte Kreditbank AG — a mid-tier German lender with €48 billion in assets — disclosed a €6.2 billion hole in its commercial real-estate portfolio. Within 72 hours the shock had crossed three continents. Asian credit-default-swap spreads widened by 120 basis points, Brazil's Bovespa fell 8.4%, and the S&P 500 shed $1.7 trillion in market capitalisation. The episode became a textbook case of financial contagion: the mechanism by which distress in one node of the global financial network propagates to seemingly unrelated nodes through interbank lending, derivatives exposures, and — crucially — investor psychology. Researchers at the Bank for International Settlements later mapped the transmission channels and found that algorithmic trading strategies amplified the initial shock by roughly 40%, as momentum-based systems piled into the same exit trades. The event reignited debate over Basel IV capital buffers and whether regulators need real-time network-topology monitoring to detect contagion risk before it becomes systemic.",
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
        "summary": "A new transformer-based model trained on 10-K filings, earnings call transcripts, and satellite imagery is outperforming Wall Street consensus estimates.",
        "content": "QuantLens AI, a New York–based hedge-fund spin-off, published a peer-reviewed paper demonstrating that its proprietary transformer model can predict quarterly earnings surprises with 78% directional accuracy — roughly 15 percentage points above the best sell-side consensus. The model ingests three heterogeneous data streams: the full text of 10-K and 10-Q SEC filings (parsed with a legal-domain fine-tuned LLM), earnings-call audio converted to sentiment-annotated transcripts, and commercial satellite imagery of retail foot traffic and factory output. A cross-attention mechanism fuses these modalities into a unified embedding space. Back-tested over 2018-2025, a long-short portfolio constructed from the model's top and bottom decile predictions returned 23.4% annualised alpha net of transaction costs. The work raises profound questions about market efficiency: if machines can systematically extract edge from public data, does the Efficient Market Hypothesis need a version 2.0?",
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
        "summary": "The SEC proposes mandatory 'kill switch' rules for high-frequency trading systems after last month's 12-minute Nasdaq anomaly.",
        "content": "Following a 12-minute anomaly on March 3 in which Nasdaq-100 futures plunged 4.1% before snapping back, the US Securities and Exchange Commission has proposed Rule 15c3-7 — colloquially dubbed the 'Kill Switch Rule'. The proposed regulation would require every broker-dealer operating algorithmic or high-frequency trading systems to implement automated circuit-breakers that halt all outbound orders when predefined volatility or position-size thresholds are breached. The rule also mandates real-time reporting of algorithmic strategy parameters to a new SEC Office of Algorithmic Oversight. Industry reaction is split: Citadel Securities and Jane Street have expressed cautious support, arguing that standardised guardrails level the playing field, while smaller prop-trading firms warn the compliance burden could force consolidation. Academic studies estimate that HFT firms account for roughly 55% of US equity volume, making the stakes enormous for market liquidity.",
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
        "summary": "India's Unified Payments Interface sets a new monthly record, cementing the country's position as the world's largest real-time payments market.",
        "content": "India's Unified Payments Interface processed 20.07 billion transactions worth ₹18.3 lakh crore (approximately $218 billion) in February 2026, according to data from the National Payments Corporation of India. The milestone — up 34% year-on-year — cements India's dominance in real-time digital payments, processing more volume than the combined totals of the US FedNow, EU TIPS, and Brazil PIX systems. Analysts attribute the surge to three factors: the rollout of UPI Lite X (offline NFC payments), credit-line-on-UPI expansion by 14 major banks, and the integration of UPI with Singapore's PayNow and Japan's Zengin for cross-border remittances. For fintech founders, the data signals that India's payments infrastructure is now mature enough to support value-added layers — embedded lending, merchant analytics, and AI-driven fraud detection — creating a $40 billion addressable opportunity by 2028.",
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
        "summary": "Major hedge funds are now generating synthetic market data using GANs and diffusion models to stress-test strategies against scenarios that have never occurred.",
        "content": "Two Sigma, DE Shaw, and at least four other systematic hedge funds have begun using generative adversarial networks (GANs) and denoising diffusion probabilistic models to produce synthetic market-data sets, according to sources familiar with the matter. The synthetic data — realistic tick-by-tick price series, order-book snapshots, and macroeconomic indicator streams — allows quant teams to stress-test trading strategies against plausible but historically unprecedented scenarios: a simultaneous sovereign-debt crisis in three G7 nations, a 90% single-day drop in a mega-cap stock, or a sustained period of negative oil prices. The technique addresses a fundamental limitation of backtesting: history provides only one sample path. By generating thousands of alternative paths that respect the statistical properties (fat tails, volatility clustering, cross-asset correlations) of real data, funds can estimate tail-risk exposure far more robustly. Regulators are watching closely, however, as model-generated 'fantasy data' could also be used to overfit strategies that appear safe on paper.",
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
        "summary": "After two years of contraction, venture capital is flowing again — led by AI infrastructure, climate tech, and defence-tech startups.",
        "content": "Global venture-capital investment totalled $78.3 billion across 4,210 deals in Q1 2026, marking a 41% increase over Q1 2025 and the strongest opening quarter since the 2021 bubble, according to PitchBook data. AI-infrastructure startups captured the lion's share ($28.1 billion), with mega-rounds of $500 million-plus becoming routine for companies building foundational-model training clusters, inference-optimisation chips, and enterprise AI orchestration platforms. Climate tech ranked second at $14.6 billion, driven by green-hydrogen electrolysers and next-generation battery chemistries. Defence tech — dual-use autonomy, satellite communications, and cybersecurity — emerged as a surprise third, pulling in $9.2 billion, triple its year-ago figure. For founders, the message is nuanced: while capital is abundant, investors are demanding clearer paths to profitability and are attaching more stringent governance provisions, including AI-safety audit clauses in term sheets.",
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
        "summary": "The Bank of England and the Reserve Bank of India are piloting agent-based models powered by LLMs to simulate the effects of rate decisions before they are made.",
        "content": "At least five central banks — including the Bank of England, Reserve Bank of India, European Central Bank, Bank of Japan, and the Federal Reserve — are piloting agent-based macroeconomic simulations powered by large language models, according to a confidential BIS working paper obtained by ET Nexus. The simulations populate a virtual economy with millions of LLM-driven 'agents' — households, firms, banks, and government entities — each capable of reading and reacting to simulated news, policy announcements, and market data in natural language. When the Bank of England fed its model a hypothetical 50-basis-point rate cut paired with forward guidance of 'lower for longer', the simulation predicted a 2.3% increase in household spending, a 1.1% rise in residential property prices, and a 15-basis-point steepening of the gilt yield curve within six months — results that closely matched the observed effects of the BOE's 2024 easing cycle. Critics caution that LLM agents may inherit biases from training data and could give policymakers false confidence in model predictions.",
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
        "summary": "The story of PayLoop — a B2B invoicing platform that used AI agents to automate accounts receivable and reached $50M ARR in 18 months.",
        "content": "When Aisha Patel started PayLoop from her Stanford dorm room in September 2024, she had no venture backing, no co-founder, and no enterprise sales experience. Eighteen months later, the B2B invoicing platform has crossed $50 million in annual recurring revenue, employs 120 people across Palo Alto and Bengaluru, and counts 4,200 SMBs as paying customers. The secret, Patel says, is 'AI-native architecture from day one'. PayLoop deploys autonomous AI agents that handle the entire accounts-receivable lifecycle: generating invoices from natural-language descriptions of deliverables, chasing overdue payments via personalised email and WhatsApp sequences, negotiating payment plans within pre-approved parameters, and automatically reconciling incoming payments with open invoices. The system reduces days-sales-outstanding by an average of 14 days for customers. Patel closed a $120 million Series B led by Sequoia Capital last week at a $1.2 billion valuation, making PayLoop the fastest Indian-origin SaaS company to reach unicorn status.",
        "author": "Vikram Rao",
        "date": "2026-03-24",
        "category": "Startups",
        "tags": ["fintech", "AI-agents", "SaaS", "unicorn"],
        "sentiment": "positive",
        "image_url": "/images/payloop.jpg",
        "persona_relevance": ["founder", "student"],
    },
}

# ─────────────────────────────────────────────
# AI Simulation Helpers
# TODO: Replace these stubs with real OpenAI / Gemini API calls.
#       Each function is isolated so you can swap in your API key
#       and client with minimal refactoring.
# ─────────────────────────────────────────────

async def generate_briefing(article: dict) -> dict:
    """
    Simulate an LLM generating bullet-point summary + sentiment analysis.
    TODO: Replace with real LLM call (e.g., openai.ChatCompletion.create).
    """
    await asyncio.sleep(1.0)  # Simulated latency

    # Pre-built briefings keyed by article ID for richer demo
    briefings = {
        "1": {
            "bullets": [
                "Vereinigte Kreditbank AG disclosed a €6.2B loss in commercial real-estate, triggering a 72-hour global sell-off.",
                "Asian CDS spreads widened 120 bps; Brazil's Bovespa fell 8.4%; S&P 500 lost $1.7T in market cap.",
                "Algorithmic trading amplified the shock by ~40% via momentum-based exit cascades.",
                "BIS researchers mapped transmission through interbank lending, derivatives, and investor psychology.",
                "Reignited debate over Basel IV capital buffers and real-time network-topology monitoring.",
            ],
            "sentiment": "negative",
            "confidence": 0.92,
        },
        "2": {
            "bullets": [
                "QuantLens AI's transformer model predicts earnings surprises with 78% directional accuracy.",
                "Model fuses 10-K filings, earnings-call audio sentiment, and satellite imagery via cross-attention.",
                "Back-tested long-short portfolio returned 23.4% annualised alpha (net of costs) over 2018-2025.",
                "Raises fundamental questions about the Efficient Market Hypothesis.",
                "Published as a peer-reviewed paper — first of its kind from a hedge-fund spin-off.",
            ],
            "sentiment": "positive",
            "confidence": 0.88,
        },
        "3": {
            "bullets": [
                "SEC proposes Rule 15c3-7 ('Kill Switch Rule') after a 12-min Nasdaq-100 flash anomaly.",
                "Would require automated circuit-breakers for all algorithmic / HFT trading systems.",
                "Mandates real-time reporting of algo strategy parameters to new SEC oversight office.",
                "Large firms (Citadel, Jane Street) cautiously supportive; smaller firms warn of consolidation risk.",
                "HFT accounts for ~55% of US equity volume — stakes for market liquidity are enormous.",
            ],
            "sentiment": "neutral",
            "confidence": 0.85,
        },
    }

    if article["id"] in briefings:
        return briefings[article["id"]]

    # Fallback generic briefing for articles without a pre-built one
    return {
        "bullets": [
            f"This article covers key developments in {article['category']}.",
            f"Primary topics include: {', '.join(article['tags'][:3])}.",
            f"The author {article['author']} provides analysis of recent market trends.",
            "Multiple data points and expert opinions are cited throughout.",
            "The piece concludes with forward-looking implications for stakeholders.",
        ],
        "sentiment": article.get("sentiment", "neutral"),
        "confidence": 0.80,
    }


async def generate_chat_response(question: str, context_id: str) -> dict:
    """
    Simulate an LLM responding to a user question in the context of an article.
    TODO: Replace with real LLM call.
    """
    await asyncio.sleep(1.5)  # Simulated latency

    article = MOCK_ARTICLES.get(context_id)
    context_title = article["title"] if article else "the selected article"

    # Simple keyword-based mock responses for demo variety
    q_lower = question.lower()

    if any(word in q_lower for word in ["contagion", "spread", "cascade", "systemic"]):
        return {
            "response": (
                "Financial contagion refers to the spread of economic shocks from one market, "
                "institution, or region to others. In the context of this article, the mechanism "
                "operated through three channels: (1) direct interbank lending exposures, (2) shared "
                "derivatives positions that created hidden correlations, and (3) behavioural herding "
                "amplified by algorithmic trading systems. The key insight is that modern financial "
                "networks are so interconnected that a single node failure can cascade systemically "
                "within hours, not days."
            ),
            "sources": [context_title],
        }
    elif any(word in q_lower for word in ["algorithm", "algo", "hft", "trading"]):
        return {
            "response": (
                "Algorithmic trading systems, particularly high-frequency trading (HFT) strategies, "
                "now account for approximately 55% of US equity trading volume. These systems operate "
                "on microsecond timescales and use statistical patterns, order-flow signals, and "
                "momentum indicators to execute trades. The concern highlighted in this article is "
                "that during periods of stress, many algorithms converge on the same exit signals, "
                "creating a liquidity vacuum that amplifies price dislocations."
            ),
            "sources": [context_title],
        }
    elif any(word in q_lower for word in ["deep learning", "ai", "model", "predict", "ml"]):
        return {
            "response": (
                "The application of deep learning to financial markets represents a paradigm shift. "
                "Modern transformer-based architectures can process multiple data modalities — text, "
                "audio, imagery — simultaneously through cross-attention mechanisms. The 78% accuracy "
                "in predicting earnings surprises suggests these models are capturing signals that "
                "traditional fundamental analysis misses. However, it's important to note that past "
                "performance in backtests doesn't guarantee future results, and overfitting remains "
                "a significant concern in quantitative finance."
            ),
            "sources": [context_title],
        }
    elif any(word in q_lower for word in ["invest", "portfolio", "risk", "return"]):
        return {
            "response": (
                "From an investment perspective, the key takeaway is the importance of understanding "
                "tail risks and correlation dynamics. Traditional portfolio theory assumes stable "
                "correlations, but during stress events, correlations tend to spike toward 1.0 — "
                "meaning diversification fails precisely when you need it most. Strategies to mitigate "
                "this include: dynamic hedging, tail-risk parity approaches, and maintaining adequate "
                "cash buffers to avoid forced selling during drawdowns."
            ),
            "sources": [context_title],
        }
    else:
        return {
            "response": (
                f"That's a great question in the context of \"{context_title}\". "
                "Based on the article's analysis, several factors are at play here. The intersection "
                "of technology, regulation, and market microstructure is creating new dynamics that "
                "traditional frameworks struggle to capture. I'd recommend looking at this through "
                "the lens of network theory and behavioural finance — both offer complementary "
                "insights into why modern markets behave the way they do."
            ),
            "sources": [context_title],
        }


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
    return {
        "article_id": request.article_id,
        "article_title": article["title"],
        **briefing,
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Respond to a user question in the context of an article."""
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
