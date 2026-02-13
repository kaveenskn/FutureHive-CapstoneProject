from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
import os
import asyncio
import random
from pathlib import Path
from typing import Literal

def _read_gemini_api_key() -> str | None:
    """Read GEMINI_API_KEY reliably.

    Supports both strict `KEY=value` and the common (but invalid for some loaders)
    `KEY = value` formatting.
    """
    # Prefer the local Backend/.env and allow it to override any already-set
    # environment variable so updating the file actually takes effect.
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path if env_path.exists() else None, override=True)
    key = os.getenv("GEMINI_API_KEY")
    if key and key.strip():
        return key.strip().strip('"').strip("'")

    if env_path.exists():
        try:
            text = env_path.read_text(encoding="utf-8", errors="ignore")
            match = re.search(
                r"^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$",
                text,
                flags=re.MULTILINE,
            )
            if match:
                val = match.group(1).strip()
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                if val.strip():
                    return val.strip()
        except Exception:
            pass

    return None


# IMPORTANT: Do not hard-code API keys in source code.
# Read from Backend/.env or the process environment.
GEMINI_API_KEY = _read_gemini_api_key() or (os.getenv("GOOGLE_API_KEY") or "").strip().strip('"').strip("'") or None


# --- Import and initialize Gemini client ---
from google import genai
from google.genai import types

# Initialize Gemini/GenAI client only if an API key is provided. Wrap in
# try/except so the server can still run without the key and provide clear
# error messages from endpoints.
client = None
if GEMINI_API_KEY:
    try:
        # Newer SDKs default to beta endpoints; prefer stable v1 when possible.
        # (If the installed SDK doesn't support HttpOptions, this will raise and
        # fall back to a clearer init error.)
        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(api_version="v1"),
        )
    except Exception as e:
        # Log the error and keep client as None so endpoints can return a
        # helpful message instead of raising during import/runtime.
        print("Failed to initialize Gemini client:", e)
        client = None
else:
    print("Warning: GEMINI_API_KEY is not set. Gemini client disabled.")


def _humanize_genai_error(err: Exception) -> str:
    msg = str(err) or err.__class__.__name__
    low = msg.lower()

    # Very common: free-tier quotas show up with `limit: 0` which means the
    # project/account has no free quota enabled (or it's not eligible).
    if "resource_exhausted" in low and "free_tier" in low and "limit: 0" in low:
        return (
            "Your Gemini free-tier quota for this project is 0 (disabled/not eligible). "
            "This is not a temporary rate limit. Enable billing on the Google Cloud project "
            "and use a key from that billed project, or use a different project/account that has quota."
        )

    if "billing" in low or "payment" in low:
        return (
            "Gemini rejected the request due to billing/quota. "
            "Enable billing (or free-tier quota) on the Google Cloud project used by this API key, "
            "or use an API key from a project with active quota."
        )
    if "api key" in low and ("invalid" in low or "not valid" in low or "unauthorized" in low):
        return "Invalid API key. Create a new Gemini API key and set GEMINI_API_KEY."
    if "permission" in low or "permission_denied" in low or "forbidden" in low:
        return "Permission denied for this model/project. Check API enablement, quotas, and model access."
    if "overloaded" in low or "503" in low or "unavailable" in low:
        return "Gemini is temporarily overloaded/unavailable. Try again in a moment."
    if "quota" in low or "resource_exhausted" in low or "429" in low:
        return "Quota exceeded / rate-limited. Slow down requests or increase quota/billing."

    return msg


async def _generate_with_retry(prompt: str, *, models: list[str]) -> str:
    if not client:
        raise RuntimeError("Gemini client not configured. Set GEMINI_API_KEY in environment.")

    max_retries = 3
    base_delay = 1.0
    last_error: Exception | None = None

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]

    for model in models:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(model=model, contents=contents)
                answer = getattr(response, "text", "")
                if not answer:
                    raise RuntimeError("No text in response")
                return answer.strip()
            except Exception as e:
                last_error = e
                estr = str(e)
                low = estr.lower()

                # Free-tier often surfaces as RESOURCE_EXHAUSTED with `limit: 0`
                # for a specific model. This should fall back to other models.
                is_free_tier_zero = (
                    "resource_exhausted" in low
                    and "free_tier" in low
                    and "limit: 0" in low
                )

                # Quota/rate-limit errors should generally try the next model.
                is_quota_like = (
                    "resource_exhausted" in low
                    or "quota" in low
                    or "429" in low
                )

                # Don't retry billing/auth/permission issues; they won't succeed.
                # Note: some quota errors include the word "billing" in their
                # generic message, so we only treat billing/payment as fatal
                # when it's not a quota-like condition.
                if any(k in low for k in ["permission", "forbidden", "unauthorized", "api key"]):
                    raise
                if ("billing" in low or "payment" in low) and not (is_free_tier_zero or is_quota_like):
                    raise

                # If the current model is not eligible / quota=0, move on.
                if is_free_tier_zero or is_quota_like:
                    break

                # Retry on transient overload/service errors.
                if "overloaded" in low or "503" in low or "unavailable" in low:
                    delay = base_delay * (2**attempt) + random.uniform(0, 0.5)
                    await asyncio.sleep(delay)
                    continue

                # Other errors: move to next model (or fail).
                break

    if last_error:
        raise last_error
    raise RuntimeError("Failed to generate content")


def _intent_from_question(question: str) -> Literal["benefits", "drawbacks", "mixed", "generic"]:
    q = (question or "").strip().lower()
    if not q:
        return "generic"

    benefits = ["benefit", "benefits", "advantage", "advantages", "pros", "strength", "strengths"]
    drawbacks = ["drawback", "drawbacks", "limitation", "limitations", "cons", "weakness", "weaknesses", "challenges"]

    has_benefits = any(w in q for w in benefits)
    has_drawbacks = any(w in q for w in drawbacks)

    if has_benefits and has_drawbacks:
        return "mixed"
    if has_benefits:
        return "benefits"
    if has_drawbacks:
        return "drawbacks"
    return "generic"


def _clean_structured_answer(answer: str, *, question: str | None = None) -> str:
    """Normalize model output into simple, organized plain text.

    - Removes markdown headings/fences
    - Avoids echoing the question (e.g., "drawbacks")
    - Keeps bullets + short lines
    """

    text = (answer or "").strip()
    if not text:
        return text

    # Remove fenced code blocks.
    text = re.sub(r"```.*?```", " ", text, flags=re.S)

    # Drop leading echo of the question (common for single-word questions like "drawbacks").
    q = (question or "").strip()
    if q:
        q_low = q.lower()
        # Compare only the first non-empty line.
        first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
        fl = first_line.lower().rstrip(":")
        if fl == q_low or fl == q_low.rstrip("?"):
            text = "\n".join(text.splitlines()[1:]).strip()

    # Remove markdown headings like ###, #### etc.
    cleaned_lines: list[str] = []
    for ln in text.splitlines():
        s = ln.strip()
        if not s:
            continue
        s = re.sub(r"^#{1,6}\s*", "", s).strip()
        cleaned_lines.append(s)

    text = "\n".join(cleaned_lines)

    # Remove bold/italic markers.
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"__(.*?)__", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)

    # Normalize bullets: turn numbered items into '-'.
    normalized: list[str] = []
    for ln in text.splitlines():
        s = ln.strip()
        s = re.sub(r"^\d+\)\s+", "- ", s)
        s = re.sub(r"^\d+\.\s+", "- ", s)
        s = re.sub(r"^[•*]\s+", "- ", s)
        normalized.append(s)

    # Collapse repeated whitespace.
    out = "\n".join(normalized)
    out = re.sub(r"[ \t]+", " ", out)
    out = re.sub(r"\n{3,}", "\n\n", out).strip()
    return out

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
async def ask_ai(request: Request):
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

    intent = _intent_from_question(question)
    if intent == "drawbacks":
        format_rules = """Return ONLY this format:
Drawbacks:
- <short bullet>
- <short bullet>
- <short bullet>
"""
    elif intent == "benefits":
        format_rules = """Return ONLY this format:
Benefits:
- <short bullet>
- <short bullet>
- <short bullet>
"""
    elif intent == "mixed":
        format_rules = """Return ONLY this format:
Benefits:
- <short bullet>
- <short bullet>

Drawbacks:
- <short bullet>
- <short bullet>
"""
    else:
        format_rules = """Return ONLY this format:
Answer:
- <short bullet>
- <short bullet>
- <short bullet>
"""

    prompt = f"""
You are an academic assistant.

Use ONLY the provided information. If the information is insufficient, say so briefly as a bullet.

STYLE:
- English only
- Plain text only (no Markdown headings like '###', no tables)
- No long paragraphs
- 3 to 6 bullets total
- Each bullet <= 18 words
- Do NOT repeat the question

FORMAT:
{format_rules}

CONTENT:
Title: {topic}
Year: {year}
Authors: {authors}
Abstract: {abstract}

Question: {question}
""".strip()

    try:
        answer = await _generate_with_retry(
            prompt,
            models=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"],
        )
        return {"answer": _clean_structured_answer(answer, question=question)}
    except Exception as e:
        return {"error": _humanize_genai_error(e), "details": str(e)}


@app.post("/ask_topicspark")
async def ask_topicspark(request: Request):
    data = await request.json()
    topic = data.get("topic", "")
    abstract = data.get("abstract", "")
    type_ = data.get("type", "")
    question = data.get("question", "")

    if not (topic or abstract):
        return {"error": "No topic or abstract provided"}

    intent = _intent_from_question(question)
    if intent == "drawbacks":
        format_rules = """Return ONLY this format:
Drawbacks:
- <short bullet>
- <short bullet>
- <short bullet>
"""
    elif intent == "benefits":
        format_rules = """Return ONLY this format:
Benefits:
- <short bullet>
- <short bullet>
- <short bullet>
"""
    elif intent == "mixed":
        format_rules = """Return ONLY this format:
Benefits:
- <short bullet>
- <short bullet>

Drawbacks:
- <short bullet>
- <short bullet>
"""
    else:
        format_rules = """Return ONLY this format:
Answer:
- <short bullet>
- <short bullet>
- <short bullet>
"""

    prompt = f"""
You are an academic assistant.

Use ONLY the provided context. If the context is insufficient, say so briefly as a bullet.

STYLE:
- English only
- Plain text only (no Markdown headings like '###', no tables)
- No long paragraphs
- 3 to 6 bullets total
- Each bullet <= 18 words
- Do NOT repeat the question

FORMAT:
{format_rules}

CONTENT:
Topic: {topic}
Type: {type_}
Context/Abstract: {abstract}

Question: {question}
""".strip()

    try:
        answer = await _generate_with_retry(
            prompt,
            models=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"],
        )
        return {"answer": _clean_structured_answer(answer, question=question)}
    except Exception as e:
        return {"error": _humanize_genai_error(e), "details": str(e)}


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
"""

    if not client:
        return {"error": "Gemini client not configured. Set GEMINI_API_KEY in environment."}

    try:
        answer = await _generate_with_retry(
            prompt,
            models=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"],
        )
        return {"answer": answer}

    except Exception as e:
        return {"error": _humanize_genai_error(e), "details": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)