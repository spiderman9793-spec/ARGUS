"""
ARGUS - Edge Simulator (Laptop 1 Brain Simulator)
Run this script to simulate detections being sent from Laptop 1 to Laptop 2.
"""
import datetime
import requests
import sys
import time

SERVER_URL = "http://127.0.0.1:8000"

def get_ist_timestamp():
    # ISO-8601 with IST (+05:30) offset
    tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
    return datetime.datetime.now(tz).isoformat()

def test_health():
    print("\n--- 1. Testing Health Check ---")
    try:
        res = requests.get(f"{SERVER_URL}/health", timeout=3)
        print(f"Status: {res.status_code}, Response: {res.json()}")
        return res.status_code == 200
    except Exception as e:
        print(f"Server not reachable at {SERVER_URL}: {e}")
        return False

def send_detection(plate, camera_id="CAM-01", confidence=0.92, track_id=101):
    payload = {
        "plate": plate,
        "raw_ocr": plate,
        "confidence": confidence,
        "camera_id": camera_id,
        "timestamp": get_ist_timestamp(),
        "track_id": track_id,
        "bbox": [210, 140, 480, 290],
        "snapshot_path": f"snapshots/{camera_id}/{plate}.jpg"
    }
    
    print(f"\nSending Edge Detection for plate [{plate}] from [{camera_id}]...")
    res = requests.post(f"{SERVER_URL}/api/detections", json=payload, timeout=5)
    print(f"Response Code: {res.status_code}")
    print(f"Response Body: {res.json()}")
    return res

def test_unknown_camera():
    print("\n--- 3. Testing Unknown Camera (Expected: 400 Bad Request) ---")
    payload = {
        "plate": "DL01XY9999",
        "camera_id": "UNKNOWN-CAM",
        "timestamp": get_ist_timestamp(),
    }
    res = requests.post(f"{SERVER_URL}/api/detections", json=payload, timeout=5)
    print(f"Response Code: {res.status_code} (Expected 400)")
    print(f"Response Detail: {res.json()}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        SERVER_URL = sys.argv[1]
    
    print("=" * 60)
    print(f"ARGUS Laptop 1 (Edge) Simulator targeting {SERVER_URL}")
    print("=" * 60)

    # 1. Health check
    if not test_health():
        print("Backend server is not running! Start it with:")
        print("uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        sys.exit(1)

    # 2. Regular plate (non-hotlist)
    print("\n--- 2. Normal Vehicle (Non-Hotlist) ---")
    send_detection(plate="UP32ZZ0001", camera_id="CAM-01")

    # 3. Hotlist matched plate
    print("\n--- 3. Stolen / Flagged Vehicle (Hotlist Match -> Alert) ---")
    send_detection(plate="UP32AB1234", camera_id="CAM-02")

    # 4. Another Hotlist plate
    print("\n--- 4. Another Hotlist Match (Hit & Run Suspect) ---")
    send_detection(plate="KA01AB1234", camera_id="CAM-04")

    # 5. Invalid Camera validation test
    test_unknown_camera()

    print("\n" + "=" * 60)
    print("Simulation tests complete! Check the web dashboard for live alerts.")
    print("=" * 60)

