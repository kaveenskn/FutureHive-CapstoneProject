from flask import Blueprint, jsonify
import pandas as pd

# Load dataset here (or from a service)
df = pd.read_excel("./datas/sample_research_dataset_detailed.xlsx")
df.fillna("N/A", inplace=True)

default_bp = Blueprint("default_bp", __name__)

def get_default_projects(limit=5):
    results = []
    for idx, row in df.head(limit).iterrows():
        results.append({
            "title": row["Title"],
            "authors": row["Author"],
            "description": row["Abstract"],
            "year": row["Year"],
        })
    return results

@default_bp.route("/", methods=["GET"])
def default_api():
    try:
        results = get_default_projects()
        return jsonify({"results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
