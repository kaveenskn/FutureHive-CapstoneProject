from flask import Blueprint, request, jsonify
from controller.PastresearchSearch_controller import search_projects

search_bp = Blueprint("search_bp", __name__)

@search_bp.route("/", methods=["POST"])
def search_api():
    try:
        data = request.get_json()
        query = data.get("query", "")
        if not query:
            return jsonify({"error": "No query provided"}), 400

        results = search_projects(query)
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
