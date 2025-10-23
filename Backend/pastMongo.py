import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain.schema import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

# -----------------------------
# Load documents from MongoDB
# -----------------------------
url = "mongodb+srv://shanmugarajakaveen4:kvn25533@cluster0.s7vzm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(url)
db = client["FutureHiveDB"]
collection = db["Past_Research_projects"]

mongo_docs = list(collection.find())

# Convert MongoDB documents to LangChain Document format
documents = []
for doc in mongo_docs:
    # Assuming your MongoDB has fields: 'title' and 'content'
    text = f"{doc.get('title', '')}\n{doc.get('content', '')}"
    documents.append(Document(page_content=text, metadata={"_id": str(doc["_id"])}))

# -----------------------------
# Initialize embeddings model
# -----------------------------
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# -----------------------------
# Create Chroma vector store
# -----------------------------
Research_vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="researchprojects_database"
)

retriever = Research_vectorstore.as_retriever(search_kwargs={"k": 10})  # top 10 relevant chunks

print("✅ Chroma Vector Store Created and Documents Indexed Successfully")

# -----------------------------
# Test query to check vector store
# -----------------------------
test_query = "machine learning in image recognition"  # Replace with any sample query
results = retriever.get_relevant_documents(test_query)

print(f"\nTop {len(results)} results for query: '{test_query}'\n")
for i, res in enumerate(results, 1):
    print(f"Result {i}:")
    # Print first 300 characters as a snippet
    print(res.page_content[:300] + ("..." if len(res.page_content) > 300 else ""))
    print("Metadata:", res.metadata)
    print("-" * 50)
