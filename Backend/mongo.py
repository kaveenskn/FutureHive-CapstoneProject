from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from .env
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Select your database (replace with your DB name)
db = client["FutureHiveDB"]

print("✅ MongoDB Connected Successfully")

# Example: You can access collections like this
# users_collection = db["users"]
