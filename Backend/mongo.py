"""mongo.py
MongoDB connection for the Admin Panel backend.

The admin panel code imports `db` from this module.

Env vars:
- MONGO_URI (preferred)
- MONGO_URL (fallback)
- MONGO_DB (optional, default: FutureHiveDB)

If no URI is provided, falls back to local MongoDB so the API can start.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI") or os.getenv("MONGO_URL") or "mongodb://localhost:27017"
db_name = os.getenv("MONGO_DB") or "FutureHiveDB"

client = MongoClient(mongo_uri)
db = client[db_name]
