from __future__ import annotations

import asyncio
import json
import os
import random
import re
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# -------------------------------
# ENV
# -------------------------------
def _load_env() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path if env_path.exists() else None, override=True)

_load_env()

OLLAMA_BASE_URL = (os.getenv("OLLAMA_BASE_URL") or "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL") or "llama3.2:1b-instruct"
OLLAMA_TIMEOUT_S = float(os.getenv("OLLAMA_TIMEOUT_S") or "120")

API_HOST = os.getenv("OLLAMA_TOPICSPARK_HOST") or "127.0.0.1"
API_PORT = int(os.getenv("OLLAMA_TOPICSPARK_PORT") or "8000")


def _normalize_topic_type(value: Any | None) -> str | None:
    if value is None:
        return None
    v = str(value).strip().lower()
    if v in {"research", "paper"}:
        return "research"
    if v in {"capstone", "project", "software", "software_project", "software-project"}:
        return "capstone"
    if v in {"all", ""}:
        return None
    return None


def _clamp_limit(value: Any | None, default: int) -> int:
    try:
        n = int(value) if value is not None else int(default)
    except Exception:
        n = int(default)
    # User requirement: minimum of six responses
    n = max(6, n)
    # Keep it bounded to avoid excessive LLM calls
    return max(1, min(n, 30))


def _title_prefix_for_type(topic_type: str) -> str:
    return "Software Project Idea: " if topic_type == "capstone" else "Research Project Idea: "


def _ensure_prefixed_title(title: str, topic_type: str) -> str:
    prefix = _title_prefix_for_type(topic_type)
    t = (title or "").strip()
    if not t:
        return prefix + "Untitled"
    if t.lower().startswith(prefix.lower()):
        return t
    # Avoid double-prefixing if model already wrote something like "Research idea:" etc.
    if "project idea" in t.lower():
        return t
    return prefix + t


def _normalize_topics(raw_topics: list[dict], forced_type: str | None = None) -> list[dict]:
    topics: list[dict] = []
    for item in raw_topics or []:
        if not isinstance(item, dict):
            continue

        t = _normalize_topic_type(forced_type) or _normalize_topic_type(item.get("type")) or "research"
        title = _ensure_prefixed_title(str(item.get("title", "")).strip(), t)[:160]
        description = str(item.get("description", "")).strip()
        if not description:
            description = "Generated project idea."
        topics.append({
            "title": title,
            "description": description,
            "type": t,
        })
    return topics


def _interleave(a: list[dict], b: list[dict]) -> list[dict]:
    out: list[dict] = []
    for i in range(max(len(a), len(b))):
        if i < len(a):
            out.append(a[i])
        if i < len(b):
            out.append(b[i])
    return out


def _looks_non_english(text: str) -> bool:
    """Heuristic guardrail: detect when the model returns non-English text.

    This is intentionally lightweight (no extra deps). It flags common non-Latin
    scripts and very low ASCII share.
    """

    if not text:
        return False

    # Common non-Latin blocks (CJK, Hangul, Hiragana/Katakana, Arabic, Cyrillic, Devanagari)
    non_latin_re = re.compile(
        r"[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]"
    )
    if non_latin_re.search(text):
        return True

    # If the response contains too few ASCII characters, it's likely not English.
    ascii_count = sum(1 for ch in text if ord(ch) < 128)
    ratio = ascii_count / max(len(text), 1)
    return ratio < 0.85


def _topics_look_non_english(topics: list[dict]) -> bool:
    for t in topics:
        title = str(t.get("title", ""))
        desc = str(t.get("description", ""))
        if _looks_non_english(title) or _looks_non_english(desc):
            return True
    return False


async def _generate_topics_json(count: int, topic_type: str, query: str | None = None) -> list[dict]:
    """Generate topics with stronger guarantees and post-normalization."""

    t = _normalize_topic_type(topic_type) or "research"
    n = max(1, int(count))
    prefix = _title_prefix_for_type(t)
    focus_line = (
        f'Related to: "{query}"\n' if query and str(query).strip() else ""
    )

    prompt = f"""
Generate EXACTLY {n} items.

LANGUAGE:
- English only
- Use plain, professional academic English

CONTENT:
- These must be {"software capstone project" if t == "capstone" else "research"} ideas.
- Each title MUST start with: {prefix}
{focus_line}

STRICT RULES:
- Return ONLY valid JSON (no markdown, no prose)
- Output MUST be a JSON array with EXACTLY {n} objects
- Every object MUST have: title, description, type
- type MUST be exactly: "{t}"

FORMAT:
[
  {{"title":"{prefix}...","description":"...","type":"{t}"}}
]
"""

    answer = await _generate_with_retry(prompt)
    parsed = extract_json(answer)
    result = force_topic_array(parsed)
    topics = _normalize_topics(result.get("topics", []), forced_type=t)

    # Retry once if content came back non-English or empty.
    if not topics or _topics_look_non_english(topics):
        answer = await _generate_with_retry(
            prompt
            + "\nIMPORTANT: English only. If unsure, still respond in English.\n"
        )
        parsed = extract_json(answer)
        result = force_topic_array(parsed)
        topics = _normalize_topics(result.get("topics", []), forced_type=t)

    if topics:
        return topics[:n]

    # Fallback: split unstructured and normalize
    fallback = split_unstructured(answer, t)
    return _normalize_topics(fallback, forced_type=t)[:n]

# -------------------------------
# OLLAMA CORE
# -------------------------------
def _ollama_generate_sync(prompt: str) -> str:
    r = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        },
        timeout=OLLAMA_TIMEOUT_S,
    )

    if r.status_code != 200:
        raise RuntimeError(r.text)

    return r.json().get("response", "").strip()


async def _generate_with_retry(prompt: str) -> str:
    for attempt in range(3):
        try:
            return await asyncio.to_thread(_ollama_generate_sync, prompt)
        except Exception:
            await asyncio.sleep(0.8 * (2 ** attempt))
    raise RuntimeError("Ollama generation failed")

# -------------------------------
# JSON HELPERS
# -------------------------------
def extract_json(text: str) -> Any | None:
    text = text.strip()

    # remove markdown fences
    text = re.sub(r"^```.*?\n", "", text)
    text = re.sub(r"\n```$", "", text)

    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"(\[.*\]|\{.*\})", text, re.S)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    return None


def force_topic_array(data: Any) -> dict[str, list[dict]]:
    if isinstance(data, dict) and isinstance(data.get("topics"), list):
        return {"topics": data["topics"]}

    if isinstance(data, list):
        return {"topics": [x for x in data if isinstance(x, dict)]}

    return {"topics": []}


def split_unstructured(text: str, default_type: str) -> list[dict]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    topics = []

    for l in lines:
        if re.match(r"^(\d+\.|-|\*)\s+", l):
            title = re.sub(r"^(\d+\.|-|\*)\s+", "", l)
            topics.append({
                "title": title[:120],
                "description": "Generated from AI response.",
                "type": default_type,
            })

    return topics

# -------------------------------
# SEARCH INTENT DETECTION
# -------------------------------
def infer_topic_type_from_query(query: str) -> str | None:
    q = query.lower()

    research_keywords = [
        "research", "study", "analysis", "survey",
        "framework", "evaluation", "modeling", "method"
    ]

    capstone_keywords = [
        "project", "system", "application", "platform",
        "tool", "implementation", "development"
    ]

    if any(k in q for k in research_keywords):
        return "research"

    if any(k in q for k in capstone_keywords):
        return "capstone"

    return None  # mixed / unknown

# -------------------------------
# FASTAPI
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# TRENDING TOPICS
# -------------------------------
@app.get("/topicspark")
async def trending_topics(page: int = 1, limit: int = 10, type: str | None = None):
    """Trending topics.

    Rules requested:
    - Default (no type filter): exactly 5 research + 5 capstone (10 total)
    - If type=research/capstone: return only that type
    - Always return at least 6 items overall (handled via clamp for filtered mode)
    """

    try:
        normalized_type = _normalize_topic_type(type)

        # Default (All Types): force exactly 5 research + 5 capstone
        if normalized_type is None:
            research = await _generate_topics_json(5, "research")
            capstone = await _generate_topics_json(5, "capstone")
            mixed = _interleave(research, capstone)
            return {"topics": mixed[:10]}

        # Filtered trending: honor limit with minimum 6
        n = _clamp_limit(limit, 10)
        topics = await _generate_topics_json(n, normalized_type)
        return {"topics": topics}

    except Exception as e:
        return {"error": str(e), "topics": []}

# -------------------------------
# SEARCH TOPICS
# -------------------------------
@app.post("/topicspark/search")
async def search_topics(request: Request):
    body = await request.json()
    query = body.get("query", "").strip()

    requested_type = _normalize_topic_type(body.get("type"))
    limit = _clamp_limit(body.get("limit"), 10)

    if not query:
        return {"topics": []}

    try:
        # If user selected a filter (capstone/research), ONLY return that type.
        if requested_type in {"research", "capstone"}:
            topics = await _generate_topics_json(limit, requested_type, query=query)
            return {"topics": topics}

        # No filter: return a mix, still respecting minimum 6.
        # Split evenly; if odd, give the extra to research.
        research_n = (limit + 1) // 2
        capstone_n = limit // 2

        research = await _generate_topics_json(research_n, "research", query=query)
        capstone = await _generate_topics_json(capstone_n, "capstone", query=query)
        mixed = _interleave(research, capstone)
        return {"topics": mixed[:limit]}

    except Exception as e:
        return {"error": str(e), "topics": []}

# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
