# ARGUS — Automated Reconnaissance & Gated Unified Surveillance
### Real-Time ANPR Command Center & Defense Intelligence Grid

ARGUS is an enterprise-grade Automated Number Plate Recognition (ANPR) and Tactical C4I Command Center designed for law enforcement, smart-city surveillance, and high-velocity vehicle tracking.

---

## 🌟 Key Features

- **Real-Time ANPR Ingestion:** Zero-latency license plate reading and edge telemetry processing over WebSockets.
- **Dual-Brain Architecture:** 
  - **Laptop 1 (Edge Vision):** YOLOv8 plate detection + high-accuracy OCR.
  - **Laptop 2 (Command Center Hub):** FastAPI server, SQLite hotlist database, Leaflet radar map, and hardware bridge.
- **Automated Hotlist & Siren Trip:** Single-transaction hotlist match detection triggering real-time UI alerts and physical Arduino relays (gate closure, audio siren).
- **Interactive Tactical Map (Leaflet):** Active radar patrol nodes, vehicle trajectory plotting, and camera PIP streams.
- **Court-Admissible Legal Dossiers:** Digital police case files, investigating officer (IO) records, and printable certified PDF audit exports.
- **Environmental & Optical Telemetry:** Real-time visibility index, lux levels, and lens defogger monitoring across all surveillance intersections.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI & SQLite)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the Command Hub server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

*Backend runs at:* `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

*Dashboard runs at:* `http://localhost:5173`

### 3. Edge Camera Simulator (Test Telemetry)

To simulate detections from Laptop 1:
```bash
python3 simulate_edge.py
```

---

## 📂 Project Architecture

```
Argu_Dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI REST & WebSocket endpoints
│   │   ├── models.py         # SQLAlchemy models (Cameras, Hotlist, Sightings, Alerts)
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   ├── database.py       # SQLite connection manager
│   │   └── serial_bridge.py  # Arduino USB serial hardware controller
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Sidebar, MapView, CameraWall, SearchPanel, etc.
│   │   ├── App.jsx           # Master dashboard workspace
│   │   └── index.css         # Tactical deep navy & amber styling
│   └── package.json
├── simulate_edge.py          # Edge ANPR detection stream simulator
└── README.md
```

---

## ⚖️ License & Compliance
Built for smart city security networks. Fully compliant with DPDP Act 2023 chain-of-custody logging standards.

