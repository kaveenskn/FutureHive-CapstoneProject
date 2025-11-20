"""
test_admin_api.py
Quick test script to verify the Admin Panel API endpoints
Run this after starting the Flask server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000/api/admin"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_dashboard_stats():
    """Test dashboard statistics endpoint"""
    print("\n🔍 Testing Dashboard Statistics...")
    response = requests.get(f"{BASE_URL}/dashboard/stats")
    print_response("Dashboard Stats", response)

def test_create_user():
    """Test creating a new user"""
    print("\n🔍 Testing User Creation...")
    user_data = {
        "name": "Test User",
        "email": f"test_{requests.utils.quote('test@example.com')}",
        "role": "User",
        "status": "Active"
    }
    response = requests.post(f"{BASE_URL}/users", json=user_data)
    print_response("Create User", response)
    
    if response.status_code == 201:
        user_id = response.json().get('user', {}).get('_id')
        return user_id
    return None

def test_get_users():
    """Test getting all users"""
    print("\n🔍 Testing Get All Users...")
    response = requests.get(f"{BASE_URL}/users?page=1&per_page=5")
    print_response("Get All Users", response)

def test_search_users():
    """Test searching users"""
    print("\n🔍 Testing User Search...")
    response = requests.get(f"{BASE_URL}/users?search=test&page=1&per_page=5")
    print_response("Search Users", response)

def test_get_user(user_id):
    """Test getting a specific user"""
    if not user_id:
        print("\n⚠️ Skipping Get User - No user ID provided")
        return
    
    print(f"\n🔍 Testing Get User by ID: {user_id}...")
    response = requests.get(f"{BASE_URL}/users/{user_id}")
    print_response(f"Get User {user_id}", response)

def test_update_user(user_id):
    """Test updating a user"""
    if not user_id:
        print("\n⚠️ Skipping Update User - No user ID provided")
        return
    
    print(f"\n🔍 Testing Update User: {user_id}...")
    update_data = {
        "name": "Updated Test User",
        "role": "Moderator"
    }
    response = requests.put(f"{BASE_URL}/users/{user_id}", json=update_data)
    print_response(f"Update User {user_id}", response)

def test_delete_user(user_id):
    """Test deleting a user"""
    if not user_id:
        print("\n⚠️ Skipping Delete User - No user ID provided")
        return
    
    print(f"\n🔍 Testing Delete User: {user_id}...")
    response = requests.delete(f"{BASE_URL}/users/{user_id}")
    print_response(f"Delete User {user_id}", response)

def test_create_research():
    """Test creating a research entry"""
    print("\n🔍 Testing Research Entry Creation...")
    research_data = {
        "title": "Test Research: AI in Healthcare",
        "abstract": "This is a test abstract about artificial intelligence applications in modern healthcare systems.",
        "author": "Dr. Test Researcher",
        "year": 2024,
        "description": "Test description of the research"
    }
    response = requests.post(f"{BASE_URL}/research", json=research_data)
    print_response("Create Research Entry", response)
    
    if response.status_code == 201:
        research_id = response.json().get('entry', {}).get('_id')
        return research_id
    return None

def test_get_research():
    """Test getting all research entries"""
    print("\n🔍 Testing Get All Research Entries...")
    response = requests.get(f"{BASE_URL}/research?page=1&per_page=10")
    print_response("Get All Research", response)

def test_get_research_by_id(research_id):
    """Test getting a specific research entry"""
    if not research_id:
        print("\n⚠️ Skipping Get Research - No research ID provided")
        return
    
    print(f"\n🔍 Testing Get Research by ID: {research_id}...")
    response = requests.get(f"{BASE_URL}/research/{research_id}")
    print_response(f"Get Research {research_id}", response)

def test_update_research(research_id):
    """Test updating a research entry"""
    if not research_id:
        print("\n⚠️ Skipping Update Research - No research ID provided")
        return
    
    print(f"\n🔍 Testing Update Research: {research_id}...")
    update_data = {
        "title": "Updated Test Research: AI in Healthcare",
        "year": 2025
    }
    response = requests.put(f"{BASE_URL}/research/{research_id}", json=update_data)
    print_response(f"Update Research {research_id}", response)

def test_delete_research(research_id):
    """Test deleting a research entry"""
    if not research_id:
        print("\n⚠️ Skipping Delete Research - No research ID provided")
        return
    
    print(f"\n🔍 Testing Delete Research: {research_id}...")
    response = requests.delete(f"{BASE_URL}/research/{research_id}")
    print_response(f"Delete Research {research_id}", response)

def run_all_tests():
    """Run all API tests"""
    print("\n" + "="*60)
    print("🚀 Starting Admin Panel API Tests")
    print("="*60)
    print("\nMake sure the Flask server is running on http://localhost:5000")
    
    try:
        # Test Dashboard
        test_dashboard_stats()
        
        # Test User Management
        user_id = test_create_user()
        test_get_users()
        test_search_users()
        test_get_user(user_id)
        test_update_user(user_id)
        test_delete_user(user_id)
        
        # Test Research Management
        research_id = test_create_research()
        test_get_research()
        test_get_research_by_id(research_id)
        test_update_research(research_id)
        test_delete_research(research_id)
        
        print("\n" + "="*60)
        print(" All tests completed!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n Error: Could not connect to the server.")
        print("Make sure the Flask server is running on http://localhost:5000")
        print("Start it with: python main.py")
    except Exception as e:
        print(f"\n Error during testing: {e}")

if __name__ == "__main__":
    # Install required package if needed
    try:
        import requests
    except ImportError:
        print("Installing required package: requests")
        import subprocess
        subprocess.check_call(["pip", "install", "requests"])
        import requests
    
    run_all_tests()