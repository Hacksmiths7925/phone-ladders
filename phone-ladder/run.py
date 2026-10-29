import sys
import os
import uvicorn

# Ensure project root is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Fix Windows terminal encoding for Unicode characters
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from backend.database import init_db
from backend.seed_data import seed_database

def main():
    print("=" * 65)
    print("  PHONE LADDER - On-Device AI Model Recommender & Benchmark")
    print("=" * 65)
    print("[1/2] Initializing SQLite database and verifying seed data...")
    init_db()
    seed_database()
    print("[2/2] Starting FastAPI backend with responsive Web UI...")
    print(f"      Local Web App:  http://127.0.0.1:8000")
    print(f"      API Swagger:    http://127.0.0.1:8000/docs")
    print("=" * 65)
    
    # Run uvicorn server
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
