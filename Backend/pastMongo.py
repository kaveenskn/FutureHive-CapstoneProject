import pandas as pd
import math
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain_core.documents import Document
from bson import ObjectId
from flask import request, jsonify, Blueprint
from flask_cors import CORS
from dotenv import load_dotenv

from database import get_db

load_dotenv()

past_papers = Blueprint("past_papers", __name__)


_DEBUG = str(os.getenv("DEBUG_PASTMONGO", "")).strip().lower() in {"1", "true", "yes", "on"}


def _debug(*parts):
    if _DEBUG:
        print("[pastMongo]", *parts, flush=True)


def _normalize_collection_type(value: str | None) -> str:
    if value is None:
        return "research"
    t = str(value).strip().lower()
    if t in {"capstone", "research", "all"}:
        return t
    # Frontend/UI sometimes uses title-case
    if t in {"capstones", "capstone project", "capstone projects"}:
        return "capstone"
    if t in {"researches", "research project", "research projects"}:
        return "research"
    return "research"


def _first_present(doc: dict, keys: list[str], default=""):
    for k in keys:
        if k in doc and doc.get(k) not in (None, ""):
            return doc.get(k)
    return default


def _doc_to_result(doc: dict, collection_type: str) -> dict:
    title = _first_present(doc, ["title", "Title"], "")
    abstract_or_desc = _first_present(doc, ["abstract", "Abstract", "description", "Description"], "")
    authors = _first_present(doc, ["author", "Author", "authors", "Authors"], "")
    year = _first_present(doc, ["year", "Year"], "")
    university = _first_present(doc, ["university", "University"], "Unknown University")

    return {
        "title": title,
        "description": abstract_or_desc,
        "authors": authors,
        "year": year,
        "university": university,
        "type": collection_type,
    }


def _build_year_query(year):
    query = {}
    if year and str(year).lower() != "all":
        year_str = str(year)
        year_int = None
        try:
            year_int = int(year_str)
        except Exception:
            year_int = None

        if year_int is None:
            query["$or"] = [{"year": year_str}, {"Year": year_str}]
        else:
            query["$or"] = [
                {"year": year_str},
                {"year": year_int},
                {"Year": year_str},
                {"Year": year_int},
            ]
    return query

# -------------------------------------------------
# GLOBAL RETRIEVERS (lazy initialized)
# -------------------------------------------------
retriever1 = None
retriever2 = None

# -------------------------------------------------
# MongoDB loaders (SAFE)
# -------------------------------------------------
def load_collections():
    db = get_db()
    collection1 = db["Past_Research_projects"]
    collection2 = db["Capstone_projects"]

    research_docs = list(collection1.find())
    capstone_docs = list(collection2.find())

    # 🔍 DEBUG PRINTS
    print("---- MongoDB Data Fetch Debug ----")
    print(f"Research projects count: {len(research_docs)}")
    print(f"Capstone projects count: {len(capstone_docs)}")

    if research_docs:
        print("Sample Research Document:", research_docs[0])

    if capstone_docs:
        print("Sample Capstone Document:", capstone_docs[0])
    print("--------------------------------")

    return research_docs, capstone_docs
# -------------------------------------------------
# Convert MongoDB docs to LangChain Documents
# -------------------------------------------------
def convert_to_documents(docs):
    converted = []
    for doc in docs:
        title = _first_present(doc, ["title", "Title"], "")
        abstract = _first_present(doc, ["abstract", "Abstract", "description", "Description"], "")
        author = _first_present(doc, ["author", "Author", "authors", "Authors"], "")
        year = _first_present(doc, ["year", "Year"], "")
        university = _first_present(doc, ["university", "University"], "Unknown University")

        text = (
            f"{title}\n"
            f"{abstract}\n"
            f"Author: {author}\n"
            f"Year: {year}"
        )

        converted.append(
            Document(
                page_content=text,
                metadata={
                    "_id": str(doc.get("_id")),
                    "title": title,
                    "author": author,
                    "abstract": abstract,
                    "year": year,
                    "university": university,
                },
            )
        )
    return converted


def _try_object_id(value: str | None):
    if not value:
        return None
    try:
        return ObjectId(str(value))
    except Exception:
        return None


def _lookup_doc_by_id(db, oid_str: str, preferred_collection: str | None = None):
    oid = _try_object_id(oid_str)
    if oid is None:
        return None, None

    if preferred_collection in {"Past_Research_projects", "Capstone_projects"}:
        doc = db[preferred_collection].find_one({"_id": oid})
        if doc is not None:
            return doc, preferred_collection

    # Fallback: try both collections
    for name in ("Past_Research_projects", "Capstone_projects"):
        doc = db[name].find_one({"_id": oid})
        if doc is not None:
            return doc, name

    return None, None

# -------------------------------------------------
# Vectorstore Initialization (LAZY)
# -------------------------------------------------
def initialize_vectorstores():
    global retriever1, retriever2

    if retriever1 is not None and retriever2 is not None:
        return

    research_docs, capstone_docs = load_collections()

    documents = convert_to_documents(research_docs)
    # Tag each document with its source collection (helps downstream type detection)
    for d in documents:
        d.metadata["collection"] = "research"

    capstone_documents = convert_to_documents(capstone_docs)
    for d in capstone_documents:
        d.metadata["collection"] = "capstone"

    embeddings_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2"
    )

    research_vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings_model,
        collection_name="researchprojects_database"
    )
    retriever1 = research_vectorstore.as_retriever(search_kwargs={"k": 10})

    capstone_vectorstore = Chroma.from_documents(
        documents=capstone_documents,
        embedding=embeddings_model,
        collection_name="capstoneprojects_database"
    )
    retriever2 = capstone_vectorstore.as_retriever(search_kwargs={"k": 10})

# -------------------------------------------------
# Helper Functions
# -------------------------------------------------
def get_default_projects(collection_type="research", limit=10):
    # Backwards-compatible wrapper (kept for older callers)
    results, _pagination = get_default_projects_paginated(
        collection_type=collection_type,
        page=1,
        limit=limit,
        year=None,
    )
    return results


def get_default_projects_paginated(collection_type="research", page=1, limit=12, year=None):
    db = get_db()
    normalized_type = _normalize_collection_type(collection_type)

    query = _build_year_query(year)

    if normalized_type == "all":
        research_collection = db["Past_Research_projects"]
        capstone_collection = db["Capstone_projects"]
        total = research_collection.count_documents(query) + capstone_collection.count_documents(query)
    else:
        collection = db["Capstone_projects"] if normalized_type == "capstone" else db["Past_Research_projects"]
        total = collection.count_documents(query)

    # This endpoint is used by the frontend to fetch a large initial set and
    # paginate client-side. Keep an upper bound to avoid accidental huge pulls.
    safe_limit = max(1, min(int(limit), 1000))
    safe_page = max(1, int(page))
    skip = (safe_page - 1) * safe_limit
    total_pages = max(1, int(math.ceil(total / safe_limit)))

    results = []
    if normalized_type == "all":
        research_collection = db["Past_Research_projects"]
        capstone_collection = db["Capstone_projects"]

        # For mixed collection sorting, fetch all (expected small: ~500 docs).
        research_docs = list(research_collection.find(query))
        capstone_docs = list(capstone_collection.find(query))

        combined = [
            _doc_to_result(doc, "research") for doc in research_docs
        ] + [
            _doc_to_result(doc, "capstone") for doc in capstone_docs
        ]

        def _year_key(item):
            try:
                return int(str(item.get("year", "")).strip())
            except Exception:
                return -1

        combined.sort(key=lambda x: (_year_key(x), x.get("title", "")), reverse=True)
        results = combined[skip : skip + safe_limit]
    else:
        collection = db["Capstone_projects"] if normalized_type == "capstone" else db["Past_Research_projects"]
        cursor = (
            collection.find(query)
            .sort([("_id", -1)])
            .skip(skip)
            .limit(safe_limit)
        )
        for doc in cursor:
            results.append(_doc_to_result(doc, normalized_type))

    pagination = {
        "page": safe_page,
        "limit": safe_limit,
        "total": total,
        "total_pages": total_pages,
        "has_prev": safe_page > 1,
        "has_next": safe_page < total_pages,
    }

    return results, pagination

def search_projects(user_query, collection_type="research"):
    initialize_vectorstores()

    normalized_type = _normalize_collection_type(collection_type)

    if normalized_type == "all":
        results = []
        results.extend(retriever1.invoke(user_query))
        results.extend(retriever2.invoke(user_query))
    elif normalized_type == "capstone":
        results = retriever2.invoke(user_query)
    else:
        results = retriever1.invoke(user_query)

    formatted_results = []
    db = get_db()
    _debug("POST /past/search", "type=", normalized_type, "query=", str(user_query)[:120])
    for doc in results:
        metadata = doc.metadata or {}

        # Determine type from metadata if present; fallback to request type.
        result_type = normalized_type
        meta_collection = metadata.get("collection")
        if isinstance(meta_collection, str) and meta_collection.lower() in {"capstone", "research"}:
            result_type = meta_collection.lower()
        elif normalized_type == "all":
            # If collection metadata is missing, infer it by looking up the _id.
            _found_doc, found_collection = _lookup_doc_by_id(db, metadata.get("_id", ""))
            if found_collection == "Capstone_projects":
                result_type = "capstone"
            elif found_collection == "Past_Research_projects":
                result_type = "research"

        # Always rehydrate the author from Mongo by _id (vectorstore metadata can be stale).
        hydrated_author = None
        try:
            preferred = None
            if result_type == "capstone":
                preferred = "Capstone_projects"
            elif result_type == "research":
                preferred = "Past_Research_projects"

            source_doc, _src = _lookup_doc_by_id(db, metadata.get("_id", ""), preferred_collection=preferred)
            if source_doc is not None:
                hydrated_author = _first_present(source_doc, ["author", "Author", "authors", "Authors"], "")
        except Exception:
            hydrated_author = None

        _debug(
            "search hit",
            "id=", metadata.get("_id", ""),
            "type=", result_type,
            "title=", metadata.get("title", ""),
            "meta_author=", metadata.get("author", ""),
            "hydrated_author=", hydrated_author,
        )

        formatted_results.append({
            "title": metadata.get("title", ""),
            "authors": hydrated_author if hydrated_author not in (None, "") else metadata.get("author", ""),
            "description": metadata.get("abstract", ""),
            "year": metadata.get("year", ""),
            "type": result_type,
            "university": metadata.get("university", "Unknown University")
        })

    return formatted_results

# -------------------------------------------------
# Flask Routes
# -------------------------------------------------
@past_papers.route('/default', methods=['GET'])
def default_pastpapers():
    try:
        collection_type = _normalize_collection_type(request.args.get('type', 'research'))
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 12)
        year = request.args.get('year', None)

        _debug(
            "GET /past/default",
            "type=", collection_type,
            "page=", page,
            "limit=", limit,
            "year=", year,
        )

        results, pagination = get_default_projects_paginated(
            collection_type=collection_type,
            page=page,
            limit=limit,
            year=year,
        )

        if _DEBUG:
            for item in (results or [])[:5]:
                _debug(
                    "default item",
                    "type=", item.get("type"),
                    "title=", item.get("title"),
                    "authors=", item.get("authors"),
                )

        return jsonify({"results": results, "pagination": pagination}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@past_papers.route('/search', methods=['POST'])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        collection_type = _normalize_collection_type(data.get("type", "research"))

        if not query:
            return jsonify({"error": "No query provided"}), 400

        results = search_projects(query, collection_type)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
