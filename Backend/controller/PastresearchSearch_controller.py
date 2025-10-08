from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
import pandas as pd

# Load dataset
df = pd.read_excel("./datas/sample_research_dataset_detailed.xlsx")
df.fillna("N/A", inplace=True)

# Create documents
documents = []
for idx, row in df.iterrows():
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

# Setup embeddings + Chroma
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings_model,
    collection_name="projects_database"
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

def search_projects(user_query):
    results = retriever.get_relevant_documents(user_query)
    formatted_results = []
    for doc in results:
        formatted_results.append({
            "title": doc.metadata.get("Title", ""),
            "authors": doc.metadata.get("Author", ""),
            "description": doc.metadata.get("Abstract", ""),
            "year": doc.metadata.get("Year", ""),
        })
    return formatted_results
