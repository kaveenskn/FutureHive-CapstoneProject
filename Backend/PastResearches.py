# ----------------------------
# Step 0: Install requirements
# ----------------------------
# pip install pandas langchain langchain-community chromadb sentence-transformers textblob

import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from textblob import TextBlob
from langchain.schema import Document

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


vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="projects_database"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})  # top 5 relevant chunks


# ----------------------------
# Step 7: Function to search projects intelligently
# ----------------------------
def search_projects(user_query):
    # Disable query correction for now
    corrected_query = user_query  # No correction applied

    # Debug: Print the query being used
    print(f"Query used: {corrected_query}")

    # Retrieve top matching chunks with adjusted parameters
    results = retriever.get_relevant_documents(corrected_query)

    if not results:
        print("No matching projects found.")
        return

    print(f"Top {len(results)} matching chunks for query '{user_query}':\n")
    for idx, doc in enumerate(results, 1):
        # Display only the content of the chunk
        print(f"Chunk {idx}:")
        print(doc.page_content)
        print("-" * 50)
        


# ----------------------------
# Step 8: Example usage
# ----------------------------
# Add a new project

# Search projects
search_projects("diseases")  # typo on purpose
search_projects("cybersecurity in healthcare")
