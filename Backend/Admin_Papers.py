from flask import Blueprint, request, jsonify
from bson import ObjectId
from database import get_db

admin = Blueprint("admin", __name__)

db = get_db()
research_collection = db["Past_Research_projects"]
capstone_collection = db["Capstone_projects"]

# Helper to convert MongoDB documents to JSON
def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# -----------------------------
# Load ALL documents
# -----------------------------
@admin.route("/all", methods=["GET"])
def get_all_papers():
    research = list(research_collection.find())
    capstone = list(capstone_collection.find())

    research = [serialize(r) for r in research]
    capstone = [serialize(c) for c in capstone]

    return jsonify({
        "research_projects": research,
        "capstone_projects": capstone
    }), 200


# -----------------------------
# Add a New Paper
# -----------------------------
@admin.route("/add", methods=["POST"])
def add_paper():
    data = request.json
    paper_type = data.get("type", "research")

    collection = research_collection if paper_type == "research" else capstone_collection
    result = collection.insert_one(data)

    return jsonify({"message": "Paper added", "id": str(result.inserted_id)}), 201


# -----------------------------
# Update Existing Paper
# -----------------------------
@admin.route("/update/<paper_id>", methods=["PUT"])
def update_paper(paper_id):
    data = request.json
    paper_type = data.get("type", "research")

    collection = research_collection if paper_type == "research" else capstone_collection

    result = collection.update_one(
        {"_id": ObjectId(paper_id)},
        {"$set": data}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Paper not found"}), 404

    return jsonify({"message": "Paper updated"}), 200


# -----------------------------
# Delete Paper
# -----------------------------
@admin.route("/delete/<paper_id>", methods=["DELETE"])
def delete_paper(paper_id):
    paper_type = request.args.get("type", "research")

    collection = research_collection if paper_type == "research" else capstone_collection

    result = collection.delete_one({"_id": ObjectId(paper_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Paper not found"}), 404

    return jsonify({"message": "Paper deleted"}), 200
