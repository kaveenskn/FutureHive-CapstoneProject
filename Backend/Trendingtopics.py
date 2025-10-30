from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re
from dotenv import load_dotenv
import os
import asyncio
import random
import json
import re as _re

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

from google import genai
from google.genai import types

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


# Adjusted the `/topicspark` endpoint to ensure it sends data correctly
@app.get("/topicspark")
async def get_trending_topics():
    """
    Generate trending research and mini project ideas with short descriptions.
    """
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

            # Parse JSON directly
            try:
                topics = json.loads(answer)
                if isinstance(topics, list):
                    return {"topics": topics}
            except Exception:
                pass

            # Extract JSON substring
            try:
                start = answer.index('[')
                end = answer.rindex(']')
                candidate = answer[start:end+1]
                topics = json.loads(candidate)
                if isinstance(topics, list):
                    return {"topics": topics}
            except Exception:
                pass

            # Fallback: return raw string
            return {"topics": [{"title": "Generated topics", "description": answer}]}

        except Exception as e:
            estr = str(e)
            if attempt == max_retries - 1:
                fallback = [
                    {"title": "Edge AI for Environmental Sensing", "description": "Low-power edge models for real-time environmental monitoring and anomaly detection.", "type": "research"},
                    {"title": "Secure IoT Firmware Update Framework", "description": "A capstone-style project building a secure OTA update flow for resource-constrained IoT devices.", "type": "capstone"},
                    {"title": "Explainable ML for Healthcare Triage", "description": "Interpretable models that help triage patients and provide human-readable explanations for decisions.", "type": "research"}
                ]
                return {"topics": fallback}
            if "overloaded" in estr.lower() or "503" in estr or "unavailable" in estr.lower():
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                await asyncio.sleep(delay)
                continue
            return {"error": estr}
        
        
        
        
  #Search endpoint      
  
        
@app.post("/topicspark/search")
async def search_topicspark(request: Request):
    data = await request.json()
    query = data.get("query", "").strip()

    if not query:
        return {"error": "Query text is required."}

    prompt = f"""
    You are an expert research advisor.
    The user wants research and capstone project ideas related to: "{query}".
    Generate 8–10 modern topics including AI, IoT, Data Science, etc.
    For each topic, include:
      - title (short, unique)
      - description (2–3 sentences)
      - type ("research", "capstone", or "both")
    Return ONLY valid JSON like this:
    {{
      "topics": [
        {{
          "title": "...",
          "description": "...",
          "type": "research"
        }}
      ]
    }}
    """

    if not client:
        return {"error": "Gemini client not configured. Set GEMINI_API_KEY."}

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

            # Try parsing directly
            try:
                data = json.loads(answer)
                if isinstance(data, dict) and "topics" in data:
                    return data
                elif isinstance(data, list):
                    return {"topics": data}
            except Exception:
                pass

            # Fallback: manually extract JSON part
            try:
                start = answer.index('[')
                end = answer.rindex(']')
                candidate = answer[start:end+1]
                topics = json.loads(candidate)
                return {"topics": topics}
            except Exception:
                pass

            return {"topics": [{"title": "Unstructured response", "description": answer, "type": "research"}]}

        except Exception as e:
            err = str(e)
            if attempt == max_retries - 1:
                return {"error": f"Gemini failed after {max_retries} attempts: {err}"}

            if "overloaded" in err.lower() or "503" in err or "unavailable" in err.lower():
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                print(f"Retrying search in {delay:.2f}s (attempt {attempt+1})")
                await asyncio.sleep(delay)
                continue

            return {"error": err}
        
        



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)