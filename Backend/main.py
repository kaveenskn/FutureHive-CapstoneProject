"""
main.py
Central runner for all Flask modules.
"""

from flask import Flask
from flask_cors import CORS

# Import Blueprints from your route modules
# from pastMongo import project_search_bp as past_bp
from Admin_Papers import admin
from pastMongo import past_papers
from mentors import mentors_bp


# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints with URL prefixes
# app.register_blueprint(past_bp, url_prefix="/research")
# app.register_blueprint(admin, url_prefix="/admin")
app.register_blueprint(past_papers, url_prefix="/past")
app.register_blueprint(mentors_bp, url_prefix="/mentors")


# Run the main Flask app
if __name__ == "__main__":
    app.run(port=5000, debug=True)