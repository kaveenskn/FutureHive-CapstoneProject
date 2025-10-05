from flask import Blueprint, request, jsonify

ask_bp = Blueprint("ask_bp", __name__)

@ask_bp.route("/", methods=["POST"])
def ask_api():
    try:
        data = request.get_json()
        paper = data.get("paper")
        question = data.get("question", "").lower()

        if not paper:
            return jsonify({"error": "No paper provided"}), 400

        title = paper.get("title", "")
        abstract = paper.get("description", paper.get("abstract", ""))

        # Very simple heuristic answer: if question contains keywords, respond with parts
        if "summary" in question or "abstract" in question or "what" in question:
            answer = f"Title: {title}\n\nAbstract: {abstract}"
        elif "author" in question or "who" in question:
            answer = f"Authors: {paper.get('authors', 'Unknown')}"
        elif "year" in question:
            answer = f"Year: {paper.get('year', 'Unknown')}"
        else:
            # fallback: give a short summary by truncating abstract
            answer = (abstract[:400] + '...') if abstract else "No details available."

        return jsonify({"answer": answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
