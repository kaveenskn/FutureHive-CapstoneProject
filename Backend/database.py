from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def get_db():
    mongo_url = os.getenv("MONGO_URL")

    client = MongoClient(mongo_url)
    db = client["FutureHiveDB"]

    return db
