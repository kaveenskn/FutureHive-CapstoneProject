from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import re
import os
import logging
import sqlite3
import json
from datetime import datetime, timedelta

# Optional external deps
try:
    import jwt
except Exception:
    jwt = None

try:
    # optional google genai
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False

logger = logging.getLogger("chat")

# --- Configuration ---
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "168"))  # default 7 days
DB_PATH = os.getenv("BACKEND_DB_PATH", os.path.join(os.path.dirname(__file__), "data.db"))

# --- Initialize Gemini client if available and configured ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_AVAILABLE and GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def create_jwt_for_user(uid: str, email: str = ""):
    if jwt is None:
        raise RuntimeError("PyJWT is required. Install with: pip install PyJWT")

    now = datetime.utcnow()
    payload = {
        "sub": uid,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXPIRES_HOURS)).timestamp()),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # PyJWT in v2 returns str, in v1 returns bytes
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def decode_jwt(token: str):
    if jwt is None:
        raise RuntimeError("PyJWT is required. Install with: pip install PyJWT")
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except Exception as e:
        logger.exception("JWT decode failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def verify_firebase_id_token(id_token: str):
    """
    Verify Firebase ID token and return decoded claims.
    If AUTH_DISABLED=1, treat the provided id_token as a JSON string containing at least uid/email for dev testing.
    """
    if os.getenv("AUTH_DISABLED") == "1":
        # In dev mode, accept a simple JSON like {"uid":"test","email":"test@example.com"}
        try:
            data = json.loads(id_token)
            return {"uid": data.get("uid"), "email": data.get("email")}
        except Exception:
            # fallback: return a generic test user
            return {"uid": "dev_user", "email": "dev@example.com"}

    try:
        import firebase_admin
        from firebase_admin import auth as admin_auth
        from firebase_admin import credentials
    except Exception as e:
        logger.exception("firebase-admin not available")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Server not configured to verify Firebase tokens. Install firebase-admin and provide credentials.")

    # initialize firebase admin if needed
    try:
        if not firebase_admin._apps:
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            sa_json = os.getenv("FIREBASE_ADMIN_CREDENTIALS")
            if sa_path:
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
            elif sa_json:
                cred_dict = json.loads(sa_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()
    except Exception:
        logger.exception("Failed to initialize firebase-admin")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Failed to initialize firebase-admin. Provide service account credentials.")

    try:
        decoded = admin_auth.verify_id_token(id_token)
        return {"uid": decoded.get("uid"), "email": decoded.get("email")}
    except Exception:
        logger.exception("Firebase token verification failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Firebase ID token")


def get_current_user(request: Request):
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    token = parts[1]
    decoded = decode_jwt(token)
    return decoded


# Initialize DB on startup
init_db()


@app.post("/auth/login")
async def auth_login(payload: Request):
    """Exchange a Firebase ID token for a server-issued JWT.

    Request body should be JSON: { "idToken": "<firebase id token or dev json>" }
    """
    data = await payload.json()
    id_token = data.get("idToken")
    if not id_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="idToken required")

    user_info = verify_firebase_id_token(id_token)
    uid = user_info.get("uid")
    email = user_info.get("email") or ""
    jwt_token = create_jwt_for_user(uid, email)
    return {"token": jwt_token, "uid": uid, "email": email}


@app.get("/bookmarks")
async def get_bookmarks(request: Request, user=Depends(get_current_user)):
    uid = user.get("sub")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT id, data, created_at FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC", (uid,))
    rows = cur.fetchall()
    conn.close()
    bookmarks = []
    for r in rows:
        bookmarks.append({"id": r[0], "data": json.loads(r[1]), "created_at": r[2]})
    return {"bookmarks": bookmarks}


@app.post("/bookmarks")
async def add_bookmark(request: Request, user=Depends(get_current_user)):
    uid = user.get("sub")
    data = await request.json()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bookmark data required")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    now = datetime.utcnow().isoformat()
    cur.execute("INSERT INTO bookmarks (user_id, data, created_at) VALUES (?, ?, ?)", (uid, json.dumps(data), now))
    conn.commit()
    bookmark_id = cur.lastrowid
    conn.close()
    return {"id": bookmark_id, "created_at": now}


@app.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: int, request: Request, user=Depends(get_current_user)):
    uid = user.get("sub")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    # ensure bookmark belongs to user
    cur.execute("SELECT id FROM bookmarks WHERE id = ? AND user_id = ?", (bookmark_id, uid))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
    cur.execute("DELETE FROM bookmarks WHERE id = ?", (bookmark_id,))
    conn.commit()
    conn.close()
    return {"deleted": True}


@app.post("/ask")
async def ask_ai(request: Request, user=Depends(get_current_user)):
    """Receive topic, abstract, and question → return Gemini-generated concise answer. Protected by server JWT."""
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

    # --- Call Gemini API if available ---
    try:
        if client is None:
            return {"answer": "Model not configured on server. Set GEMINI_API_KEY to enable AI responses."}

        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]

        response = client.models.generate_content(
            model=os.getenv("GENAI_MODEL") or "gemini-2.5-pro",
            contents=contents,
        )

        answer = getattr(response, "text", "(No text in response)")
        return {"answer": answer.strip()}

    except Exception as e:
        logger.exception("Gemini call failed")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
