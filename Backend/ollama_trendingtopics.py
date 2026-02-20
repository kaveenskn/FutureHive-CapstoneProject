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


def _load_env() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path if env_path.exists() else None, override=True)


_load_env()

OLLAMA_BASE_URL = (os.getenv("OLLAMA_BASE_URL") or "http://127.0.0.1:11434").rstrip("/")
_ENV_OLLAMA_MODEL = (os.getenv("OLLAMA_MODEL") or "").strip()
OLLAMA_TIMEOUT_S = float(os.getenv("OLLAMA_TIMEOUT_S") or "120")

API_HOST = (os.getenv("OLLAMA_TOPICSPARK_HOST") or "127.0.0.1").strip() or "127.0.0.1"
API_PORT = int(os.getenv("OLLAMA_TOPICSPARK_PORT") or os.getenv("PORT") or "8000")


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
        return (
            f"Ollama model '{OLLAMA_MODEL}' not found. "
            f"Run: ollama pull {OLLAMA_MODEL}.{installed_hint}"
        )

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

    data = r.json() or {}
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


# -------------------------------
# Helper: Always return an array
# -------------------------------

def force_topic_array(data: Any) -> dict[str, list[dict[str, Any]]]:
    """Ensures output is always: {"topics": [ ... ] }."""

    if isinstance(data, dict) and isinstance(data.get("topics"), list):
        topics = data.get("topics")
        if all(isinstance(t, dict) for t in topics):
            return {"topics": topics}
        return {"topics": [t for t in topics if isinstance(t, dict)]}

    if isinstance(data, list):
        return {"topics": [t for t in data if isinstance(t, dict)]}

    if isinstance(data, str):
        try:
            parsed = json.loads(data)
            return force_topic_array(parsed)
        except Exception:
            return {"topics": []}

    return {"topics": []}


def _extract_json_payload(text: str) -> Any | None:
    """Try to extract a JSON object/array from a model response."""
    s = (text or "").strip()
    if not s:
        return None

    # Strip markdown code fences like: ```json ... ```
    if s.startswith("```"):
        s = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", s)
        s = re.sub(r"\s*```\s*$", "", s).strip()

    # Fast-path: if it's fully valid JSON already.
    try:
        return json.loads(s)
    except Exception:
        pass

    # Find first JSON token and parse as a stream.
    m = re.search(r"[\[{]", s)
    if not m:
        return None
    s2 = s[m.start() :]

    decoder = json.JSONDecoder()

    def decode_many(chunk: str) -> list[Any]:
        items: list[Any] = []
        idx = 0
        while idx < len(chunk):
            while idx < len(chunk) and chunk[idx] in " \t\r\n,":
                idx += 1
            if idx >= len(chunk):
                break
            try:
                obj, end = decoder.raw_decode(chunk, idx)
            except Exception:
                break
            items.append(obj)
            idx = end
        return items

    # If the response *starts* with an array but the array is malformed (e.g. missing commas
    # between objects), fall back to decoding individual objects inside the brackets.
    if s2.startswith("["):
        try:
            return json.loads(s2)
        except Exception:
            last = s2.rfind("]")
            inner = s2[1:last] if last != -1 else s2[1:]
            items = decode_many(inner)
            if items:
                if all(isinstance(x, dict) for x in items):
                    return items
                combined: list[Any] = []
                for x in items:
                    if isinstance(x, list):
                        combined.extend(x)
                    else:
                        combined.append(x)
                return combined
            return None

    items = decode_many(s2)
    if not items:
        return None
    if len(items) == 1:
        return items[0]

    # Multiple top-level JSON values (common when the model emits {..}{..}{..} without commas)
    # Prefer returning a list of dicts if possible.
    if all(isinstance(x, dict) for x in items):
        return items

    combined: list[Any] = []
    for x in items:
        if isinstance(x, list):
            combined.extend(x)
        else:
            combined.append(x)
    return combined


# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# TOPICSPARK: TRENDING TOPICS
# -------------------------------
@app.get("/topicspark")
async def get_trending_topics():
    prompt = """
You generate trending academic capstone and research topic ideas.

Return ONLY valid JSON (no markdown/code fences) and no extra text.
Return a JSON array with EXACTLY 10 items. Ensure proper commas between items.
Each item must be an object with keys:
- title (string)
- description (string, 1-2 sentences)
- type (either \"research\" or \"capstone\")

JSON ARRAY ONLY:
[
  {\"title\": \"...\", \"description\": \"...\", \"type\": \"research\"}
]
""".strip()

    try:
        answer = await _generate_with_retry(prompt)
        parsed = _extract_json_payload(answer)
        topics = force_topic_array(parsed if parsed is not None else [])

        # If the model returned an empty/invalid array, surface the raw response in a safe way.
        if not topics.get("topics"):
            return {
                "topics": [
                    {
                        "title": "Unstructured Response",
                        "description": answer,
                        "type": "research",
                    }
                ]
            }

        return topics
    except Exception as e:
        return {
            "error": _humanize_ollama_error(e),
            "details": str(e),
            "topics": [],
        }


# -------------------------------
# SEARCH TOPICS
# -------------------------------
@app.post("/topicspark/search")
async def search_topicspark(request: Request):
    body = await request.json()
    query = (body.get("query", "") or "").strip()

    if not query:
        return {"topics": []}

    prompt = f"""
You generate academic capstone and research topic ideas.

Generate 10 topics related to: {query!r}.
Return ONLY valid JSON (no markdown/code fences) and no extra text.
Ensure proper commas between items.
You may return either:
- a JSON object: {{\"topics\": [ ... ]}}
- OR a raw JSON array: [ ... ]

Each topic must include:
- title (string)
- description (string, 1-2 sentences)
- type (either \"research\" or \"capstone\")
""".strip()

    try:
        answer = await _generate_with_retry(prompt)
        parsed = _extract_json_payload(answer)
        topics = force_topic_array(parsed if parsed is not None else [])

        if not topics.get("topics"):
            return {
                "topics": [
                    {
                        "title": "Unstructured Response",
                        "description": answer,
                        "type": "research",
                    }
                ]
            }

        return topics
    except Exception as e:
        return {
            "error": _humanize_ollama_error(e),
            "details": str(e),
            "topics": [],
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=API_HOST, port=API_PORT)
