import pandas as pd
import math
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain_core.documents import Document
from flask import request, jsonify, Blueprint
from flask_cors import CORS
from dotenv import load_dotenv

from database import get_db

load_dotenv()

past_papers = Blueprint("past_papers", __name__)

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

    return research_docs, capstone_docs

# -------------------------------------------------
# Convert MongoDB docs to LangChain Documents
# -------------------------------------------------
def convert_to_documents(docs):
    converted = []
    for doc in docs:
        text = (
            f"{doc.get('title', '')}\n"
            f"{doc.get('abstract', '')}\n"
            f"Author: {doc.get('author', '')}\n"
            f"Year: {doc.get('year', '')}"
        )

        converted.append(
            Document(
                page_content=text,
                metadata={
                    "_id": str(doc.get("_id")),
                    "title": doc.get("title", ""),
                    "author": doc.get("author", ""),
                    "abstract": doc.get("abstract", ""),
                    "year": doc.get("year", ""),
                    "university": doc.get("university", "Unknown University"),
                },
            )
        )
    return converted

# -------------------------------------------------
# Vectorstore Initialization (LAZY)
# -------------------------------------------------
def initialize_vectorstores():
    global retriever1, retriever2

    if retriever1 is not None and retriever2 is not None:
        return

    research_docs, capstone_docs = load_collections()

    documents = convert_to_documents(research_docs)
    capstone_documents = convert_to_documents(capstone_docs)

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
    collection = db["Capstone_projects"] if collection_type == "capstone" else db["Past_Research_projects"]

    query = {}
    if year and str(year).lower() != "all":
        year_str = str(year)
        year_int = None
        try:
            year_int = int(year_str)
        except Exception:
            year_int = None

        if year_int is None:
            query["year"] = year_str
        else:
            query["$or"] = [{"year": year_str}, {"year": year_int}]

    total = collection.count_documents(query)

    safe_limit = max(1, min(int(limit), 50))
    safe_page = max(1, int(page))
    skip = (safe_page - 1) * safe_limit
    total_pages = max(1, int(math.ceil(total / safe_limit)))

    cursor = (
        collection.find(query)
        .sort([("_id", -1)])
        .skip(skip)
        .limit(safe_limit)
    )

    results = []
    for doc in cursor:
        results.append(
            {
                "title": doc.get("title", ""),
                "description": doc.get("abstract", ""),
                "authors": doc.get("author", ""),
                "year": doc.get("year", ""),
                "university": doc.get("university", "Unknown University"),
                "type": collection_type,
            }
        )

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

    if collection_type == "capstone":
        results = retriever2.invoke(user_query)
    else:
        results = retriever1.invoke(user_query)

    formatted_results = []
    for doc in results:
        formatted_results.append({
            "title": doc.metadata.get("title", ""),
            "authors": doc.metadata.get("author", ""),
            "description": doc.metadata.get("abstract", ""),
            "year": doc.metadata.get("year", ""),
            "type": collection_type,
            "university": doc.metadata.get("university", "Unknown University")
        })

    return formatted_results

# -------------------------------------------------
# Flask Routes
# -------------------------------------------------
@past_papers.route('/default', methods=['GET'])
def default_pastpapers():
    try:
        collection_type = request.args.get('type', 'research')
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 12)
        year = request.args.get('year', None)

        results, pagination = get_default_projects_paginated(
            collection_type=collection_type,
            page=page,
            limit=limit,
            year=year,
        )
        return jsonify({"results": results, "pagination": pagination}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@past_papers.route('/search', methods=['POST'])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        collection_type = data.get("type", "research")

        if not query:
            return jsonify({"error": "No query provided"}), 400

        results = search_projects(query, collection_type)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
