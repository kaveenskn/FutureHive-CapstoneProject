# ----------------------------
# Step 0: Install requirements
# ----------------------------
# pip install pandas langchain langchain-community chromadb sentence-transformers textblob flask flask-cors

import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain.schema import Document
from flask import Flask, request, jsonify
from flask_cors import CORS

# ----------------------------
# Step 1: Load Excel and Handle Missing Values
# ----------------------------
df = pd.read_excel("./datas/sample_research_dataset_detailed.xlsx")

# Debug: Print column names to verify
print("Columns in the dataframe:", df.columns)

# Fill missing values with default values
df.fillna("N/A", inplace=True)

# ----------------------------
# Step 2: Create chunk text per project
# ----------------------------
documents = []
for idx, row in df.iterrows():
    try:
        text = f"""
Title: {row['Title']}
Abstract: {row['Abstract']}
Year: {row['Year']}
Author: {row['Author']}
"""
        metadata = {
            "Title": row['Title'],
            "Abstract": row['Abstract'],
            "Year": row['Year'],
            "Author": row['Author']
        }
        documents.append(Document(page_content=text.strip(), metadata=metadata))
    except KeyError as e:
        print(f"Missing column in row {idx}: {e}")

# ----------------------------
# Step 4: Create embeddings
# ----------------------------
# Use a strong semantic model
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# ----------------------------
# Step 5: Store documents in vector database
# ----------------------------
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="projects_database"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})  # top 5 relevant chunks






# ----------------------------
# Step 6: Function to search projects intelligently
# ----------------------------
def search_projects(user_query):
    # Debug: Print the query being used
    print(f"Query used: {user_query}")

    # Retrieve top matching chunks with adjusted parameters
    results = retriever.get_relevant_documents(user_query)

    if not results:
        print("No matching projects found.")
        return []

    # Format the results for the frontend
    formatted_results = []
    for doc in results:
        formatted_results.append({
            "title": doc.metadata.get("Title", ""),
            "authors": doc.metadata.get("Author", ""),
            "description": doc.metadata.get("Abstract", ""),
            "year": doc.metadata.get("Year", ""),
        })
    return formatted_results

# ----------------------------
# Step 7: Flask API Setup
# ----------------------------
app = Flask(__name__)
CORS(app)

def get_default_projects(limit=5):
    # Just take the first few rows from the dataframe
    default_results = []
    for idx, row in df.head(limit).iterrows():
        default_results.append({
            "title": row["Title"],
            "authors": row["Author"],
            "description": row["Abstract"],
            "year": row["Year"],
        })
    return default_results

@app.route("/default", methods=["GET"])
def default_api():
    try:
        results = get_default_projects(limit=5)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500







@app.route("/search", methods=["POST"])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        if not query:
            return jsonify({"error": "No query provided"}), 400

        # Call the search_projects function
        results = search_projects(query)
        return jsonify({"results": results}), 200
    except Exception as e:
        print(f"Error in /search endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
