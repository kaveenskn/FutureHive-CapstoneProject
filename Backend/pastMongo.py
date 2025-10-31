import pandas as pd
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain_core.documents import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

# -----------------------------
# Flask App Setup
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# MongoDB Connection
# -----------------------------
url = "mongodb+srv://shanmugarajakaveen4:kvn25533@cluster0.s7vzm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(url)
db = client["FutureHiveDB"]
collection1 = db["Past_Research_projects"]
collection2 = db["Capstone_projects"]

ResearchDocs = list(collection1.find())
CapstoneDocs = list(collection2.find())

# -----------------------------
# Convert MongoDB docs to LangChain format
# -----------------------------
def convert_to_documents(docs):
    converted = []
    for doc in docs:
        text = f"{doc.get('title', '')}\n{doc.get('abstract', '')}\nAuthor: {doc.get('author', '')}\nYear: {doc.get('year', '')}"
        converted.append(
            Document(
                page_content=text,
                metadata={
                    "_id": str(doc["_id"]),
                    "title": doc.get("title", ""),
                    "author": doc.get("author", ""),
                    "abstract": doc.get("abstract", ""),
                    "year": doc.get("year", ""),
                    "university": doc.get("university", "Unknown University")
                }
            )
        )
    return converted

documents = convert_to_documents(ResearchDocs)
capstone_documents = convert_to_documents(CapstoneDocs)

# -----------------------------
# Initialize embeddings & Chroma vector stores
# -----------------------------
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

Research_vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="researchprojects_database"
)
retriever1 = Research_vectorstore.as_retriever(search_kwargs={"k": 10})

capstone_vectorstore = Chroma.from_documents(
    documents=capstone_documents,
    embedding=embeddings_model,
    collection_name="capstoneprojects_database"
)
retriever2 = capstone_vectorstore.as_retriever(search_kwargs={"k": 10})

# -----------------------------
# Helper Functions
# -----------------------------
def get_default_projects(collection_type="research",limit=10):
       default_projects=[]
    
       if collection_type=="capstone":
        collection_to_use=CapstoneDocs
       else:
        collection_to_use=ResearchDocs

        for doc in collection_to_use[:limit]:
            default_projects.append({
            "title": doc.get("title", ""),
            "description": doc.get("abstract", ""),
            "authors": doc.get("author", ""),
            "year": doc.get("year", "")
        })

        return default_projects


def search_projects(user_query, collection_type="research"):
    print(f"Query used: {user_query} (collection={collection_type})")

    if collection_type == "capstone":
        results = retriever2.invoke(user_query)
    else:
        results = retriever1.invoke(user_query)

    if not results:
        print("No matching projects found.")
        return []

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

# -----------------------------
# Flask Routes
# -----------------------------
@app.route('/default',methods=['GET'])
def default_pastpapers():
    try:
        t=request.args.get('type','research')
        results=get_default_projects(collection_type=t,limit=10)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/search", methods=["POST"])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        collection_type = data.get("type", "research")
        if not query:
            return jsonify({"error": "No query provided"}), 400

        results = search_projects(query, collection_type=collection_type)
        return jsonify({"results": results}), 200
    except Exception as e:
        print(f"Error in /search endpoint: {e}")
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Run Flask App
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
