from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
import os
import asyncio
import random
from pathlib import Path

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
"""

    try:
        answer = await _generate_with_retry(
            prompt,
            models=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"],
        )
        return {"answer": answer}
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
"""

    try:
        answer = await _generate_with_retry(
            prompt,
            models=["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"],
        )
        return {"answer": answer}
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