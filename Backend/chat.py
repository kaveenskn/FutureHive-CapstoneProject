from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
import os
import asyncio
import random
import json
import re as _re

# --- Directly include your Gemini API key for testing ---
# Load .env into environment (if present) and then read the key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Import and initialize Gemini client ---
from google import genai
from google.genai import types

# Initialize Gemini/GenAI client only if an API key is provided. Wrap in
# try/except so the server can still run without the key and provide clear
# error messages from endpoints.
client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        # Log the error and keep client as None so endpoints can return a
        # helpful message instead of raising during import/runtime.
        print("Failed to initialize Gemini client:", e)
        client = None
else:
    print("Warning: GEMINI_API_KEY is not set. Gemini client disabled.")

# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ask")
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
    if not client:
        return {"error": "Gemini client not configured. Set GEMINI_API_KEY in environment."}

    # Retry on transient 'model overloaded' / 503 responses with exponential backoff
    if not client:
        return {"error": "Gemini client not configured. Set GEMINI_API_KEY in environment."}

    max_retries = 3
    base_delay = 1.0
    for attempt in range(max_retries):
        try:
            contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=contents,
            )
            answer = getattr(response, "text", "(No text in response)")
            return {"answer": answer.strip()}

        except Exception as e:
            # Convert to string once for analysis
            estr = str(e)
            # If this was the last attempt, return the error
            if attempt == max_retries - 1:
                return {"error": f"Failed after {max_retries} attempts: {estr}"}

            # If the model is overloaded or service unavailable, wait and retry
            if "overloaded" in estr.lower() or "503" in estr or "unavailable" in estr.lower():
                # exponential backoff with jitter
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                print(f"Model overloaded/temporary error, retrying in {delay:.2f}s (attempt {attempt+1})")
                await asyncio.sleep(delay)
                continue

            # For other errors, don't retry
            return {"error": estr}

# --- NEW ROUTE: Get trending research & capstone ideas ---
@app.get("/topicspark")
async def get_trending_topics():
    """
    Generate trending research and mini project ideas with short descriptions.
    """
        # Ask the model to return strict JSON (an array of objects) to make frontend
        # rendering simple. Each object must include `title`, `description`, and
        # `type` where `type` is one of: "research", "capstone", or "both".
    prompt = """
    You are an expert academic and innovation advisor.
    Generate 10 trending topics for university research papers and capstone (mini) projects.
    Include modern and relevant fields (AI, IoT, cybersecurity, data science, sustainability, etc.)
    For each topic, give a short 2–3 sentence description of what it is about and why it’s trending.

    IMPORTANT: Return ONLY valid JSON: an array of objects with the keys `title`, `description`, and `type`.
    `type` must be exactly one of the strings: "research", "capstone", or "both".
    Example output:
    [
        {"title": "Topic A", "description": "Two sentence description.", "type": "research"},
        {"title": "Topic B", "description": "Two sentence description.", "type": "capstone"}
    ]

    Do not include any extra commentary or markdown — strictly the JSON array.
        """
    if not client:
            return {"error": "Gemini client not configured. Set GEMINI_API_KEY in environment."}

    max_retries = 3
    base_delay = 1.0
    for attempt in range(max_retries):
        try:
            contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=contents,
            )
            answer = getattr(response, "text", "(No text in response)").strip()

            # Try to parse JSON directly. If parsing fails, try to extract a JSON
            # substring, otherwise fall back to a lightweight regex parser.
            try:
                topics = json.loads(answer)
                # Validate shape
                if isinstance(topics, list):
                    # Ensure each item has title/description/type and normalize
                    normalized = []
                    for t in topics:
                        if not isinstance(t, dict):
                            continue
                        title = t.get("title") or t.get("Title") or ""
                        desc = t.get("description") or t.get("Description") or ""
                        typ = t.get("type") or t.get("Type")
                        normalized.append({"title": title, "description": desc, "type": typ})
                    return {"topics": normalized}
            except Exception:
                pass

            # Try to extract JSON-like substring between the first '[' and last ']'
            try:
                start = answer.index('[')
                end = answer.rindex(']')
                candidate = answer[start:end+1]
                topics = json.loads(candidate)
                if isinstance(topics, list):
                    return {"topics": topics}
            except Exception:
                pass

            # Fallback: parse numbered lines like '1. Title - description' and
            # try to detect type heuristically from the description if missing.
            items = []
            for line in _re.split(r"\n+", answer):
                m = _re.match(r"\s*\d+\.\s*(?:\*\*)?(?P<title>[^\-\n\*]+?)(?:\*\*)?\s*[\-–:\)]\s*(?P<desc>.+)", line)
                if m:
                    title = m.group('title').strip().strip('"')
                    desc = m.group('desc').strip()
                    # Heuristic: if description mentions 'capstone' or 'mini project'
                    # classify as capstone, otherwise research.
                    low = desc.lower()
                    if 'capstone' in low or 'mini project' in low or 'project' in low and 'capstone' in low:
                        typ = 'capstone'
                    else:
                        typ = 'research'
                    items.append({"title": title, "description": desc, "type": typ})

            if items:
                return {"topics": items}

            # As a last resort, return the raw string in a single-item array so the
            # frontend can still display content.
            return {"topics": [{"title": "Generated topics", "description": answer}]}

        except Exception as e:
            estr = str(e)
            if attempt == max_retries - 1:
                # Return a small cached fallback so the frontend can render cards
                print(f"topicspark: model failed after retries: {estr}")
                fallback = [
                    {"title": "Edge AI for Environmental Sensing", "description": "Low-power edge models for real-time environmental monitoring and anomaly detection.", "type": "research"},
                    {"title": "Secure IoT Firmware Update Framework", "description": "A capstone-style project building a secure OTA update flow for resource-constrained IoT devices.", "type": "capstone"},
                    {"title": "Explainable ML for Healthcare Triage", "description": "Interpretable models that help triage patients and provide human-readable explanations for decisions.", "type": "research"}
                ]
                return {"topics": fallback}
            if "overloaded" in estr.lower() or "503" in estr or "unavailable" in estr.lower():
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                print(f"Model overloaded/temporary error, retrying in {delay:.2f}s (attempt {attempt+1})")
                await asyncio.sleep(delay)
                continue
            return {"error": estr}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)