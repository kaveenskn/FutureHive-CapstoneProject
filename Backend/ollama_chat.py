from __future__ import annotations

import asyncio
import os
import random
import re
from typing import Any

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path


def _load_env() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path if env_path.exists() else None, override=True)


_load_env()

OLLAMA_BASE_URL = (os.getenv("OLLAMA_BASE_URL") or "http://127.0.0.1:11434").rstrip("/")
_ENV_OLLAMA_MODEL = (os.getenv("OLLAMA_MODEL") or "").strip()
OLLAMA_TIMEOUT_S = float(os.getenv("OLLAMA_TIMEOUT_S") or "120")


def _list_installed_ollama_models() -> list[str]:
    """Return installed model names from Ollama, or [] if unreachable."""
    try:
        r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
        if r.status_code != 200:
            return []
        data = r.json() or {}
        models = data.get("models") or []
        names: list[str] = []
        for m in models:
            if isinstance(m, dict) and m.get("name"):
                names.append(str(m["name"]))
        return names
    except Exception:
        return []


def _pick_default_model(installed: list[str]) -> str:
    # Prefer small, instruction-tuned models if present.
    preferred = [
        "gemma3:1b",
        "qwen2.5:1.5b-instruct",
        "qwen2.5:0.5b-instruct",
        "llama3.2:1b-instruct",
        "phi3:mini",
    ]
    installed_set = set(installed)
    for m in preferred:
        if m in installed_set:
            return m
    return installed[0] if installed else "gemma3:1b"


_INSTALLED_MODELS = _list_installed_ollama_models()
OLLAMA_MODEL = _ENV_OLLAMA_MODEL or _pick_default_model(_INSTALLED_MODELS)

API_HOST = (os.getenv("OLLAMA_CHAT_HOST") or "127.0.0.1").strip() or "127.0.0.1"
API_PORT = int(os.getenv("OLLAMA_CHAT_PORT") or os.getenv("PORT") or "8001")


def _humanize_ollama_error(err: Exception) -> str:
    msg = str(err) or err.__class__.__name__
    low = msg.lower()

    if "connection" in low and ("refused" in low or "failed" in low):
        return (
            "Cannot reach Ollama. Make sure Ollama is running locally and reachable at "
            f"{OLLAMA_BASE_URL}."
        )
    if "not found" in low and "model" in low:
        installed_hint = (
            f" Installed models: {', '.join(_INSTALLED_MODELS)}" if _INSTALLED_MODELS else ""
        )
        return f"Ollama model '{OLLAMA_MODEL}' not found. Run: ollama pull {OLLAMA_MODEL}.{installed_hint}"
    if "timeout" in low:
        return "Ollama request timed out. Try a smaller prompt/model or increase OLLAMA_TIMEOUT_S."

    return msg


def _ollama_generate_sync(prompt: str) -> str:
    url = f"{OLLAMA_BASE_URL}/api/generate"

    payload: dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    r = requests.post(url, json=payload, timeout=OLLAMA_TIMEOUT_S)
    if r.status_code != 200:
        raise RuntimeError(f"Ollama HTTP {r.status_code}: {r.text[:500]}")

    data = r.json()
    # Ollama returns: { response: "...", done: true, ... }
    text = data.get("response")
    if not text or not str(text).strip():
        raise RuntimeError(f"No text in Ollama response: {str(data)[:500]}")

    return str(text).strip()


async def _generate_with_retry(prompt: str) -> str:
    max_retries = 3
    base_delay = 0.8
    last_error: Exception | None = None

    for attempt in range(max_retries):
        try:
            return await asyncio.to_thread(_ollama_generate_sync, prompt)
        except Exception as e:
            last_error = e
            delay = base_delay * (2**attempt) + random.uniform(0, 0.4)
            await asyncio.sleep(delay)

    raise last_error or RuntimeError("Failed to generate content")


# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ask_research")
async def ask_research(request: Request):
    data = await request.json()
    topic = data.get("topic", "")
    abstract = data.get("abstract", "")
    year = data.get("year", "")
    authors = data.get("authors", "")
    question = data.get("question", "")

    if not (topic or abstract):
        return {"error": "No topic or abstract provided"}

    q_text = (question or "").strip().lower()

    if re.search(r"\bauthor(s)?\b", q_text) or re.match(r"who (are|is|were)\b", q_text):
        return {"answer": f"Authors: {authors or 'Not provided'}"}

    if "year" in q_text or "published" in q_text or ("when" in q_text and "publish" in q_text):
        return {"answer": f"Year: {year or 'Not provided'}"}

    prompt = f"""
You are an academic assistant that gives short, insightful answers.

Given the information below, read it carefully and answer the question directly and concisely.
Avoid long structured sections like "summary", "strengths", etc.
Write 3–5 clear sentences that sound natural and professional.

Title: {topic}
Year: {year}
Authors: {authors}
Abstract: {abstract}

Question: {question}

Answer:
""".strip()

    try:
        answer = await _generate_with_retry(prompt)
        return {"answer": answer}
    except Exception as e:
        return {"error": _humanize_ollama_error(e), "details": str(e)}


@app.post("/ask_topicspark")
async def ask_topicspark(request: Request):
    data = await request.json()
    topic = data.get("topic", "")
    abstract = data.get("abstract", "")
    type_ = data.get("type", "")
    question = data.get("question", "")

    if not (topic or abstract):
        return {"error": "No topic or abstract provided"}

    prompt = f"""
You are an academic assistant that gives short, practical answers.

Given the information below, answer the question directly and concisely.
Avoid long structured sections like "summary", "strengths", etc.
Write 3–5 clear sentences that sound natural and professional.

Topic: {topic}
Type: {type_}
Context/Abstract: {abstract}

Question: {question}

Answer:
""".strip()

    try:
        answer = await _generate_with_retry(prompt)
        return {"answer": answer}
    except Exception as e:
        return {"error": _humanize_ollama_error(e), "details": str(e)}


@app.post("/explore_project")
async def explore_project(request: Request):
    data = await request.json()
    title = data.get("title", "")
    description = data.get("description", "")
    type_ = data.get("type", "")
    tags = data.get("tags", [])

    if not title:
        return {"error": "No project title provided"}

    prompt = f"""
You are an academic assistant that provides detailed insights about projects.

Given the project details below, analyze the project and provide insights, recommendations, and potential improvements.

Title: {title}
Type: {type_}
Tags: {', '.join(tags)}
Description: {description}

Answer:
""".strip()

    try:
        answer = await _generate_with_retry(prompt)
        return {"answer": answer}
    except Exception as e:
        return {"error": _humanize_ollama_error(e), "details": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=API_HOST, port=API_PORT)
