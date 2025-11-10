"""
admin_server.py
Standalone Flask server for the Admin Panel only
This avoids loading the heavy ML libraries needed for PastResearches
"""

from flask import Flask
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)
CORS(app)

# Register admin routes
from routes.admin_route import admin_bp
app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/')
def home():
    return {
        'message': 'Research Admin Panel API',
        'version': '1.0',
        'endpoints': {
            'users': '/api/admin/users',
            'research': '/api/admin/research',
            'stats': '/api/admin/dashboard/stats'
        }
    }

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'service': 'admin-panel'}

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Research Admin Panel API Server Starting...")
    print("=" * 60)
    print("📍 Server URL: http://localhost:5000")
    print("📚 Admin API: http://localhost:5000/api/admin")
    print("💚 Health Check: http://localhost:5000/health")
    print("=" * 60)
    print("\nAvailable Endpoints:")
    print("  - GET  /api/admin/users")
    print("  - POST /api/admin/users")
    print("  - GET  /api/admin/research")
    print("  - POST /api/admin/research")
    print("  - POST /api/admin/research/bulk-upload")
    print("  - GET  /api/admin/dashboard/stats")
    print("=" * 60)
    print("\n✅ Server is ready! Press Ctrl+C to stop.\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
