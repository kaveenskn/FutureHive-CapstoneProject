import os
from pymongo import MongoClient

# Use MONGO_URI env or default to local Mongo for development
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "past_research_db")

# Top-level connection (convenient for imports)
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# Common collections
papers_collection = db["papers"]
users_collection = db["users"]


def init_mongo(uri: str = None, db_name: str = None):
    """Explicitly re-initialize the global client/db if needed.

    Example: init_mongo(os.getenv('MONGO_URI'), 'my_db')
    """
    global client, db, papers_collection, users_collection
    if uri:
        client = MongoClient(uri)
    else:
        client = MongoClient(MONGO_URI)
    if db_name:
        db = client[db_name]
    else:
        db = client[MONGO_DB_NAME]
    papers_collection = db["papers"]
    users_collection = db["users"]
    print("✅ Connected to MongoDB successfully (init_mongo)")


def get_db():
    return db


print("✅ Connected to MongoDB successfully")
