from flask import Blueprint, request, jsonify
from controller.genai_controller import generate_answer

ask_bp = Blueprint("ask_bp", __name__)

@ask_bp.route("/", methods=["POST"])
def ask_api():
    try:
        data = request.get_json()
        # Accept topic + abstract + question from frontend
        topic = data.get("topic")
        abstract = data.get("abstract")
        question = data.get("question", "").lower()

        if not topic and not abstract:
            return jsonify({"error": "No topic or abstract provided"}), 400

        answer = generate_answer(topic, abstract, question)
        return jsonify({"answer": answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
