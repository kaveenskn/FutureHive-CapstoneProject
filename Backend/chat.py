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



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)