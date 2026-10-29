import time
import requests
import uvicorn
import threading
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from backend.main import app
from backend.database import init_db
from backend.seed_data import seed_database

class ServerThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.config = uvicorn.Config(
            app,
            host="127.0.0.1",
            port=8089,
            log_level="warning"
        )
        self.server = uvicorn.Server(self.config)
        self.server.install_signal_handlers = lambda: None
        self.daemon = True

    def run(self):
        try:
            self.server.run()
        except Exception as e:
            print("Server thread error:", e)

def run_live_test():
    init_db()
    seed_database()

    server = ServerThread()
    server.start()

    base = "http://127.0.0.1:8089"
    connected = False
    for _ in range(20):
        time.sleep(0.3)
        try:
            r = requests.get(f"{base}/api/health", timeout=1)
            if r.status_code == 200:
                connected = True
                break
        except Exception:
            pass

    if not connected:
        print("Failed to connect to server on port 8089")
        sys.exit(1)

    print("Connected to live server! Running test assertions...")

    # 1. Health
    r_health = requests.get(f"{base}/api/health")
    assert r_health.status_code == 200
    print("[PASS] /api/health returned 200 OK:", r_health.json())

    # 2. Frontend index.html
    r_index = requests.get(f"{base}/")
    assert r_index.status_code == 200
    assert "Phone Ladder" in r_index.text
    print(f"[PASS] / returned 200 OK (size: {len(r_index.text)} bytes)")

    # 3. Static scripts & CSS
    r_css = requests.get(f"{base}/static/css/styles.css")
    assert r_css.status_code == 200
    print(f"[PASS] /static/css/styles.css returned 200 OK (size: {len(r_css.text)} bytes)")

    r_js = requests.get(f"{base}/static/js/app.js")
    assert r_js.status_code == 200
    print(f"[PASS] /static/js/app.js returned 200 OK (size: {len(r_js.text)} bytes)")

    r_scan_js = requests.get(f"{base}/static/js/components/OneTapScanModal.js")
    assert r_scan_js.status_code == 200
    print(f"[PASS] OneTapScanModal.js loaded (size: {len(r_scan_js.text)} bytes)")

    r_mon_js = requests.get(f"{base}/static/js/components/LiveMonitor.js")
    assert r_mon_js.status_code == 200
    print(f"[PASS] LiveMonitor.js loaded (size: {len(r_mon_js.text)} bytes)")

    r_lead_js = requests.get(f"{base}/static/js/components/CommunityLeaderboard.js")
    assert r_lead_js.status_code == 200
    print(f"[PASS] CommunityLeaderboard.js loaded (size: {len(r_lead_js.text)} bytes)")

    # 4. Models & Presets
    r_models = requests.get(f"{base}/api/models")
    assert r_models.status_code == 200
    print(f"[PASS] /api/models returned {len(r_models.json())} models")

    # 5. Advanced Feature 1: One-Tap Device Scan Audit
    r_scan = requests.post(f"{base}/api/scan/audit", json={
        "device_memory_gb": 8.0,
        "cpu_cores": 8,
        "storage_free_gb": 48.0,
        "battery_level": 0.90,
        "battery_charging": False,
        "webgpu_supported": True,
        "platform": "Android"
    })
    assert r_scan.status_code == 200
    scan_res = r_scan.json()
    assert "grade" in scan_res
    print(f"[PASS] /api/scan/audit generated Grade: {scan_res['grade']} ({scan_res['summary_verdict']})")

    # 6. Advanced Feature 2: Smart Model Switching Evaluation
    r_switch = requests.post(f"{base}/api/smart-switch/evaluate", json={
        "current_model_id": "llama-3.2-3b-instruct",
        "device_ram_gb": 6.0,
        "storage_free_gb": 30.0,
        "trigger_reason": "memory_pressure"
    })
    assert r_switch.status_code == 200
    switch_res = r_switch.json()
    assert switch_res["needs_fallback"] is True
    print(f"[PASS] /api/smart-switch/evaluate recommended fallback: {switch_res['recommended_fallback']['model']['name']} (RAM saved: +{switch_res['recommended_fallback']['ram_saved_gb']} GB)")

    # 7. Advanced Feature 5: Community Leaderboard
    r_comm = requests.get(f"{base}/api/community/benchmarks")
    assert r_comm.status_code == 200
    comm_data = r_comm.json()
    assert len(comm_data) >= 8
    print(f"[PASS] /api/community/benchmarks returned {len(comm_data)} community benchmarks")

    # 8. Advanced Feature 7: AI Quality Test
    r_qual = requests.post(f"{base}/api/quality/evaluate", json={
        "model_id": "qwen2.5-1.5b-instruct",
        "prompt_id": "work_math_hi",
        "language": "hi"
    })
    assert r_qual.status_code == 200
    qual_res = r_qual.json()
    assert qual_res["relevance_score"] >= 80
    print(f"[PASS] /api/quality/evaluate executed Hindi math prompt with relevance {qual_res['relevance_score']}%")

    # 9. Advanced Feature 8: Privacy Wipe
    r_wipe = requests.post(f"{base}/api/privacy/wipe")
    assert r_wipe.status_code == 200
    print("[PASS] /api/privacy/wipe executed successfully:", r_wipe.json())

    print("\n[SUCCESS] ALL ADVANCED ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")
    server.server.should_exit = True

if __name__ == "__main__":
    run_live_test()
