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
df1=pd.read_excel("./datas/capstone_project_dataset.xlsx")

# Debug: Print column names to verify
print("Columns in the dataframe:", df.columns)

# Fill missing values with default values
df.fillna("N/A", inplace=True)
df1.fillna("N/A", inplace=True)

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


capstone_documents = []
for idx,row in df1.iterrows():
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
        capstone_documents.append(Document(page_content=text.strip(), metadata=metadata))
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
Research_vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="researchprojects_database"
)
retriever = Research_vectorstore.as_retriever(search_kwargs={"k": 5})  # top 5 relevant chunks


capstone_vectorstore=Chroma.from_documents(
    documents=capstone_documents,
    embedding=embeddings_model,
    collection_name="capstoneprojects_database"
)

retriever1=capstone_vectorstore.as_retriever(search_kwargs={"k":5})

# ----------------------------
# Step 6: Function to search projects intelligently
# ----------------------------
def search_projects(user_query, collection_type='research'):
    # Debug: Print the query being used
    print(f"Query used: {user_query} (collection={collection_type})")

    # Choose the retriever depending on requested collection
    if collection_type == 'capstone':
        results = retriever1.get_relevant_documents(user_query)
    else:
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
            "type": collection_type,
            
        })
    return formatted_results

# ----------------------------
# Step 7: Flask API Setup
# ----------------------------
app = Flask(__name__)
# Avoid Flask automatic redirect from routes with/without trailing slash (prevents 308 on preflight)
app.url_map.strict_slashes = False
# Configure CORS explicitly so browser preflight (OPTIONS) is handled without redirects
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Provide a lightweight preflight responder and ensure CORS headers on all responses.
from flask import make_response


@app.before_request
def handle_options_preflight():
    # Short-circuit OPTIONS preflight requests with the appropriate CORS headers.
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        return resp


@app.after_request
def add_cors_headers(response):
    # Ensure all responses include CORS headers (helps non-preflight requests)
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

def get_default_projects(collection_type='research', limit=5):
    """
    Returns default projects from the selected collection.
    """
    default_results = []

    if collection_type == 'capstone':
        df_to_use = df1  # capstone dataset
    else:
        df_to_use = df   # research dataset

    for idx, row in df_to_use.head(limit).iterrows():
        default_results.append({
            "title": row["Title"],
            "authors": row["Author"],
            "description": row["Abstract"],
            "year": row["Year"],
            "type": collection_type,
        })
    return default_results



@app.route("/default", methods=["GET"])
def default_api():
    try:
        t = request.args.get('type', 'research')
        results = get_default_projects(collection_type=t, limit=5)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/default", methods=["OPTIONS"])
def default_options():
    resp = make_response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return resp



@app.route("/search", methods=["POST"])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        collection_type = data.get('type', 'research')
        if not query:
            return jsonify({"error": "No query provided"}), 400

        # Call the search_projects function
        results = search_projects(query, collection_type=collection_type)
        return jsonify({"results": results}), 200
    except Exception as e:
        print(f"Error in /search endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/search", methods=["OPTIONS"])
def search_options():
    resp = make_response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    return resp

if __name__ == "__main__":
    app.run(port=5000, debug=True)
