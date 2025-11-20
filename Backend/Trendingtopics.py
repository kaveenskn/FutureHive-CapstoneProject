from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os, json, asyncio, random
from dotenv import load_dotenv

load_dotenv()

from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print("Failed to initialize Gemini client:", e)
        client = None
else:
    print("Warning: GEMINI_API_KEY not set.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# 🧠 Helper: Always return an array
# -------------------------------
def force_topic_array(data):
    """
    Ensures output is always:
    { "topics": [ ... ] }
    """

    # if backend returned a dict {"topics": [...]}
    if isinstance(data, dict) and "topics" in data and isinstance(data["topics"], list):
        return {"topics": data["topics"]}

    # if backend returned a list directly
    if isinstance(data, list):
        return {"topics": data}

    # if backend returned a string containing JSON array
    if isinstance(data, str):
        try:
            parsed = json.loads(data)
            return force_topic_array(parsed)
        except:
            pass

    # unknown format → fallback
    return {"topics": []}


# -------------------------------
# 📌 TOPICSPARK: TRENDING TOPICS
# -------------------------------
@app.get("/topicspark")
async def get_trending_topics():

    if not client:
        return {"topics": []}

    prompt = """
    Generate 10 trending research/capstone topics.
    Return ONLY a JSON array you must follow EXACTLY:
    [
      {"title": "...", "description": "...", "type": "research"},
      {"title": "...", "description": "...", "type": "capstone"}
    ]
    """

    max_retries = 3
    base_delay = 1

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            )
            answer = (getattr(response, "text", "")).strip()

            # 1. Direct JSON parse
            try:
                parsed = json.loads(answer)
                return force_topic_array(parsed)
            except:
                pass

            # 2. Extract JSON array
            try:
                start = answer.index('[')
                end = answer.rindex(']') + 1
                arr = json.loads(answer[start:end])
                return {"topics": arr}
            except:
                pass

            # 3. Fallback
            return {
                "topics": [
                    {"title": "Unstructured Response", "description": answer, "type": "research"}
                ]
            }

        except Exception as e:
            if attempt == max_retries - 1:
                # final fallback
                return {
                    "topics": [
                        {
                            "title": "Edge AI for Smart Cities",
                            "description": "AI on edge devices for traffic, pollution and energy optimization.",
                            "type": "research",
                        },
                        {
                            "title": "Secure IoT Firmware Updater",
                            "description": "Build a secure OTA updater for IoT boards.",
                            "type": "capstone",
                        },
                    ]
                }

            if "overloaded" in str(e).lower() or "503" in str(e):
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                await asyncio.sleep(delay)
                continue

            return {"topics": []}


# -------------------------------
# 🔍 SEARCH TOPICS
# -------------------------------
@app.post("/topicspark/search")
async def search_topicspark(request: Request):

    body = await request.json()
    query = body.get("query", "").strip()

    if not query:
        return {"topics": []}

    prompt = f"""
    Generate 10 topics related to: "{query}".
    Return only this JSON format:
    {{
      "topics": [
        {{"title": "...", "description": "...", "type": "research"}}
      ]
    }}
    """

    if not client:
        return {"topics": []}

    max_retries = 3
    base_delay = 1

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            )
            answer = (getattr(response, "text", "")).strip()

            # 1. Direct dict parse
            try:
                parsed = json.loads(answer)
                return force_topic_array(parsed)
            except:
                pass

            # 2. Extract array only
            try:
                start = answer.index("[")
                end = answer.rindex("]") + 1
                arr = json.loads(answer[start:end])
                return {"topics": arr}
            except:
                pass

            # 3. Worst case: fallback
            return {
                "topics": [
                    {"title": "Unstructured Response", "description": answer, "type": "research"}
                ]
            }

        except Exception as e:
            if attempt == max_retries - 1:
                return {"topics": []}

            if "overloaded" in str(e).lower() or "503" in str(e):
                delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                await asyncio.sleep(delay)
                continue

            return {"topics": []}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
