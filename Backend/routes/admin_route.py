"""
admin_route.py
Routes for the Research Admin Panel
Handles user management, research management, and dashboard statistics
"""

from flask import Blueprint, request, jsonify
from controller.admin_controller import (
    get_all_users,
    get_user_by_id,
    create_user,
    update_user,
    delete_user,
    get_all_research_entries,
    get_research_entry_by_id,
    create_research_entry,
    update_research_entry,
    delete_research_entry,
    bulk_upload_research,
    get_dashboard_stats
)

admin_bp = Blueprint('admin', __name__)

# ========================
# USER MANAGEMENT ROUTES
# ========================

@admin_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users with optional search and pagination"""
    try:
        search_query = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 5))
        
        result = get_all_users(search_query, page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    try:
        user = get_user_by_id(user_id)
        if user:
            return jsonify({'success': True, 'user': user}), 200
        return jsonify({'success': False, 'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users', methods=['POST'])
def add_user():
    """Create a new user"""
    try:
        data = request.get_json()
        result = create_user(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['PUT'])
def edit_user(user_id):
    """Update an existing user"""
    try:
        data = request.get_json()
        result = update_user(user_id, data)
        if result['success']:
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
def remove_user(user_id):
    """Delete a user"""
    try:
        result = delete_user(user_id)
        if result['success']:
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =============================
# RESEARCH MANAGEMENT ROUTES
# =============================

@admin_bp.route('/research', methods=['GET'])
def get_research_entries():
    """Get all research entries with optional pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        result = get_all_research_entries(page, per_page)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/research/<research_id>', methods=['GET'])
def get_research_entry(research_id):
    """Get a specific research entry by ID"""
    try:
        entry = get_research_entry_by_id(research_id)
        if entry:
            return jsonify({'success': True, 'entry': entry}), 200
        return jsonify({'success': False, 'error': 'Research entry not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/research', methods=['POST'])
def add_research_entry():
    """Create a new research entry"""
    try:
        data = request.get_json()
        result = create_research_entry(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/research/<research_id>', methods=['PUT'])
def edit_research_entry(research_id):
    """Update an existing research entry"""
    try:
        data = request.get_json()
        result = update_research_entry(research_id, data)
        if result['success']:
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/research/<research_id>', methods=['DELETE'])
def remove_research_entry(research_id):
    """Delete a research entry"""
    try:
        result = delete_research_entry(research_id)
        if result['success']:
            return jsonify(result), 200
        return jsonify(result), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/research/bulk-upload', methods=['POST'])
def bulk_upload():
    """Bulk upload research entries from Excel file"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'success': False, 'error': 'Invalid file format. Please upload .xlsx or .xls'}), 400
        
        result = bulk_upload_research(file)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =============================
# DASHBOARD STATISTICS ROUTE
# =============================

@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        stats = get_dashboard_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
