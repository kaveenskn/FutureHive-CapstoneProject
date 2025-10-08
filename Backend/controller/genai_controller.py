import os

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False


def generate_answer(topic: str, abstract: str, question: str) -> str:
    """
    Generate an answer scoped to the provided topic and abstract using Google Gemini (google-genai).
    Falls back to a simple heuristic response if the library or API key is missing.
    """
    topic = topic or ""
    abstract = abstract or ""
    question = question or ""

    if not GENAI_AVAILABLE:
        # Fallback: return a short summary/extraction from the abstract
        snippet = abstract.strip()[:600]
        if not snippet:
            return "No model available and no abstract provided to answer the question."
        return f"(genai not installed) Based on the abstract: {snippet}..."

    api_key = "AIzaSyD1NTFj5TCRzmuLhxxIHSRsvvpf9COx5Og"
    if not api_key:
        snippet = abstract.strip()[:600]
        return f"(GEMINI_API_KEY not set) Based on the abstract: {snippet}..."

    client = genai.Client(api_key=api_key)

    prompt = (
        f"You are an assistant that answers questions strictly using the provided paper information.\n"
        f"Topic: {topic}\n\n"
        f"Abstract: {abstract}\n\n"
        f"Question: {question}\n\n"
        f"Answer concisely and only based on the topic and abstract. If the information is not present, say you don't have enough information."
    )

    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    generate_content_config = types.GenerateContentConfig()

    try:
        resp = client.models.generate_content(model="gemini-2.5-pro", contents=contents, config=generate_content_config)

        # Extract text safely from response structure
        output_text = ""
        try:
            for out in getattr(resp, "output", []):
                for c in getattr(out, "content", []) or []:
                    if getattr(c, "text", None):
                        output_text += c.text
                    elif isinstance(c, dict) and c.get("text"):
                        output_text += c.get("text")
        except Exception:
            output_text = str(resp)

        if not output_text:
            output_text = str(resp)

        return output_text.strip()
    except Exception as e:
        return f"(genai error) {e}"
