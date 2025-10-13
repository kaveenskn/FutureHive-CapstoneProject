"""
main.py
Delegate running the backend to the PastResearches module. This ensures the
vectorstore and API endpoints defined in `PastResearches.py` are initialized
when you run `python main.py`.
"""

# Import the Flask `app` instance created in PastResearches.py and run it.
from PastResearches import app as past_app


if __name__ == "__main__":
    # Run the app that is configured in PastResearches.py
    past_app.run(port=5000, debug=True)