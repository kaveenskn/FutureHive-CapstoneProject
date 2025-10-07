from flask import Flask
from flask_cors import CORS

# Import Blueprints
from routes.PastResearchDefault_route import default_bp
from routes.pastResearchSearch_route import search_bp
from routes.pastResearchAsk_route import ask_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints under /api/*
# app.register_blueprint(default_bp, url_prefix="/api/default")
# app.register_blueprint(search_bp, url_prefix="/api/search")
# app.register_blueprint(ask_bp, url_prefix="/api/ask")

# Also register root-level paths so frontend can call /default and /search directly
app.register_blueprint(default_bp, url_prefix="/default")
app.register_blueprint(search_bp, url_prefix="/search")
app.register_blueprint(ask_bp, url_prefix="/ask")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
