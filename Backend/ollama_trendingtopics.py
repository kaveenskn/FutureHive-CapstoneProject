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
async def trending_topics():
    prompt = """
Generate trending academic topics.

STRICT RULES:
- Return ONLY valid JSON
- EXACTLY 10 items
- EXACTLY 5 with type "research"
- EXACTLY 5 with type "capstone"

FORMAT:
[
  {"title":"...","description":"...","type":"research"}
]
"""

    try:
        answer = await _generate_with_retry(prompt)
        parsed = extract_json(answer)
        result = force_topic_array(parsed)

        if result["topics"]:
            return result

        # fallback → force mix
        topics = split_unstructured(answer, "research")
        for i in range(len(topics)):
            if i >= len(topics) // 2:
                topics[i]["type"] = "capstone"

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

    if not query:
        return {"topics": []}

    prompt = f"""
Generate 10 academic topics related to:
"{query}"

RULES:
- Return ONLY valid JSON
- Mix research and capstone topics

FORMAT:
[
  {{"title":"...","description":"...","type":"research"}}
]
"""

    try:
        answer = await _generate_with_retry(prompt)
        parsed = extract_json(answer)
        result = force_topic_array(parsed)

        if result["topics"]:
            return result

        # fallback logic with intent detection
        intent = infer_topic_type_from_query(query)

        if intent:
            return {"topics": split_unstructured(answer, intent)}

        # mixed intent → alternate
        topics = split_unstructured(answer, "research")
        for i in range(len(topics)):
            if i % 2 == 1:
                topics[i]["type"] = "capstone"

        return {"topics": topics}

    except Exception as e:
        return {"error": str(e), "topics": []}

# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
