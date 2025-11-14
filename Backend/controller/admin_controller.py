"""
admin_controller.py
Controller for the Research Admin Panel
Handles business logic for user and research management
"""

from bson import ObjectId
from datetime import datetime
import pandas as pd
from mongo import db

# MongoDB Collections
users_collection = db["users"]
research_collection = db["research_entries"]

# ========================
# USER MANAGEMENT
# ========================

def get_all_users(search_query="", page=1, per_page=5):
    """Get all users with search and pagination"""
    try:
        # Build search filter
        filter_query = {}
        if search_query:
            filter_query = {
                "$or": [
                    {"name": {"$regex": search_query, "$options": "i"}},
                    {"email": {"$regex": search_query, "$options": "i"}}
                ]
            }
        
        # Count total users
        total_users = users_collection.count_documents(filter_query)
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get users
        users = list(users_collection.find(filter_query)
                    .skip(skip)
                    .limit(per_page)
                    .sort("name", 1))
        
        # Convert ObjectId to string
        for user in users:
            user['_id'] = str(user['_id'])
        
        return {
            'success': True,
            'users': users,
            'total': total_users,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_users + per_page - 1) // per_page
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}


def get_user_by_id(user_id):
    """Get a specific user by ID"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return user
        return None
    except Exception as e:
        return None


def create_user(data):
    """Create a new user"""
    try:
        # Validate required fields
        required_fields = ['name', 'email', 'role']
        for field in required_fields:
            if field not in data:
                return {'success': False, 'error': f'Missing required field: {field}'}
        
        # Check if email already exists
        existing_user = users_collection.find_one({"email": data['email']})
        if existing_user:
            return {'success': False, 'error': 'Email already exists'}
        
        # Create user document
        user_doc = {
            'name': data['name'],
            'email': data['email'],
            'role': data.get('role', 'User'),
            'status': data.get('status', 'Active'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = users_collection.insert_one(user_doc)
        user_doc['_id'] = str(result.inserted_id)
        
        return {'success': True, 'user': user_doc, 'message': 'User created successfully'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def update_user(user_id, data):
    """Update an existing user"""
    try:
        # Check if user exists
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {'success': False, 'error': 'User not found'}
        
        # Update fields
        update_data = {}
        allowed_fields = ['name', 'email', 'role', 'status']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
        updated_user['_id'] = str(updated_user['_id'])
        
        return {'success': True, 'user': updated_user, 'message': 'User updated successfully'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def delete_user(user_id):
    """Delete a user"""
    try:
        result = users_collection.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count > 0:
            return {'success': True, 'message': 'User deleted successfully'}
        return {'success': False, 'error': 'User not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


# =============================
# RESEARCH MANAGEMENT
# =============================

def get_all_research_entries(page=1, per_page=10):
    """Get all research entries with pagination"""
    try:
        # Count total entries
        total_entries = research_collection.count_documents({})
        
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get entries
        entries = list(research_collection.find()
                      .skip(skip)
                      .limit(per_page)
                      .sort("year", -1))  # Sort by year, newest first
        
        # Convert ObjectId to string
        for entry in entries:
            entry['_id'] = str(entry['_id'])
        
        return {
            'success': True,
            'entries': entries,
            'total': total_entries,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_entries + per_page - 1) // per_page
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}


def get_research_entry_by_id(research_id):
    """Get a specific research entry by ID"""
    try:
        entry = research_collection.find_one({"_id": ObjectId(research_id)})
        if entry:
            entry['_id'] = str(entry['_id'])
            return entry
        return None
    except Exception as e:
        return None


def create_research_entry(data):
    """Create a new research entry"""
    try:
        # Validate required fields
        required_fields = ['title', 'abstract', 'author', 'year']
        for field in required_fields:
            if field not in data:
                return {'success': False, 'error': f'Missing required field: {field}'}
        
        # Create entry document
        entry_doc = {
            'title': data['title'],
            'abstract': data['abstract'],
            'author': data['author'],
            'year': data['year'],
            'description': data.get('description', data['abstract'][:200] + '...'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = research_collection.insert_one(entry_doc)
        entry_doc['_id'] = str(result.inserted_id)
        
        return {'success': True, 'entry': entry_doc, 'message': 'Research entry created successfully'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def update_research_entry(research_id, data):
    """Update an existing research entry"""
    try:
        # Check if entry exists
        entry = research_collection.find_one({"_id": ObjectId(research_id)})
        if not entry:
            return {'success': False, 'error': 'Research entry not found'}
        
        # Update fields
        update_data = {}
        allowed_fields = ['title', 'abstract', 'author', 'year', 'description']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update in database
        research_collection.update_one(
            {"_id": ObjectId(research_id)},
            {"$set": update_data}
        )
        
        # Get updated entry
        updated_entry = research_collection.find_one({"_id": ObjectId(research_id)})
        updated_entry['_id'] = str(updated_entry['_id'])
        
        return {'success': True, 'entry': updated_entry, 'message': 'Research entry updated successfully'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def delete_research_entry(research_id):
    """Delete a research entry"""
    try:
        result = research_collection.delete_one({"_id": ObjectId(research_id)})
        if result.deleted_count > 0:
            return {'success': True, 'message': 'Research entry deleted successfully'}
        return {'success': False, 'error': 'Research entry not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def bulk_upload_research(file):
    """Bulk upload research entries from Excel file"""
    try:
        # Read Excel file
        df = pd.read_excel(file)
        
        # Validate required columns
        required_columns = ['Title', 'Abstract', 'Author', 'Year']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {
                'success': False, 
                'error': f'Missing required columns: {", ".join(missing_columns)}'
            }
        
        # Fill NaN values
        df.fillna("N/A", inplace=True)
        
        # Prepare documents for insertion
        entries = []
        for _, row in df.iterrows():
            entry_doc = {
                'title': row['Title'],
                'abstract': row['Abstract'],
                'author': row['Author'],
                'year': int(row['Year']) if pd.notna(row['Year']) else 0,
                'description': row['Abstract'][:200] + '...' if len(row['Abstract']) > 200 else row['Abstract'],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            entries.append(entry_doc)
        
        # Insert into database
        if entries:
            result = research_collection.insert_many(entries)
            return {
                'success': True,
                'message': f'Successfully uploaded {len(result.inserted_ids)} research entries',
                'count': len(result.inserted_ids)
            }
        
        return {'success': False, 'error': 'No valid entries found in the file'}
    except Exception as e:
        return {'success': False, 'error': str(e)}


# =============================
# DASHBOARD STATISTICS
# =============================

def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Total users
        total_users = users_collection.count_documents({})
        
        # Total research entries
        total_research = research_collection.count_documents({})
        
        # Unsupervised accounts (users without a role or with 'Unsupervised' status)
        unsupervised = users_collection.count_documents({
            "$or": [
                {"role": {"$exists": False}},
                {"status": "Unsupervised"}
            ]
        })
        
        # Recent users (created in the last 30 days)
        thirty_days_ago = datetime.utcnow().timestamp() - (30 * 24 * 60 * 60)
        recent_users = users_collection.count_documents({
            "created_at": {"$gte": datetime.fromtimestamp(thirty_days_ago)}
        })
        
        # Recent research entries
        recent_research = research_collection.count_documents({
            "created_at": {"$gte": datetime.fromtimestamp(thirty_days_ago)}
        })
        
        return {
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_research': total_research,
                'unsupervised_accounts': unsupervised,
                'recent_users': recent_users,
                'recent_research': recent_research
            }
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}
