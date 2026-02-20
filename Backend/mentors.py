from flask import Blueprint, jsonify
from database import get_db

mentors_bp = Blueprint("mentors", __name__)

db = get_db()
collectionMentors = db["Mentors"]


@mentors_bp.route("/default", methods=["GET"])
def get_default_mentors():
    try:
        mentors = list(collectionMentors.find({}, {"_id": 0}))  # Fetch all mentors, exclude MongoDB's _id field
        return jsonify(mentors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500