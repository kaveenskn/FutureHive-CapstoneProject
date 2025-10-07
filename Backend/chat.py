from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re

# --- Directly include your Gemini API key for testing ---
GEMINI_API_KEY = "AIzaSyD1NTFj5TCRzmuLhxxIHSRsvvpf9COx5Og"

# --- Import and initialize Gemini client ---
from google import genai
from google.genai import types

client = genai.Client(api_key=GEMINI_API_KEY)

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
    """Receive topic, abstract, and question → return Gemini-generated concise answer."""
    data = await request.json()
    topic = data.get("topic", "")
    abstract = data.get("abstract", "")
    year = data.get("year", "")
    authors = data.get("authors", "")
    question = data.get("question", "")

    # Basic validation
    if not (topic or abstract):
        return {"error": "No topic or abstract provided"}

    q_text = (question or "").strip().lower()

    # Handle short metadata questions locally
    if re.search(r"\bauthor(s)?\b", q_text) or re.match(r"who (are|is|were)\b", q_text):
        return {"answer": f"Authors: {authors or 'Not provided'}"}

    if "year" in q_text or "published" in q_text or ("when" in q_text and "publish" in q_text):
        return {"answer": f"Year: {year or 'Not provided'}"}

    # --- Short, intelligent response prompt ---
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

    # --- Call Gemini API ---
    try:
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]

        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=contents,
        )

        answer = getattr(response, "text", "(No text in response)")
        return {"answer": answer.strip()}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
