import datetime
import base64
import binascii
import json
import logging
import os
import time
from typing import List, Optional
import requests
from urllib.parse import quote

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, SessionLocal
from .serial_bridge import arduino_bridge

logger = logging.getLogger("argus.server")

# Ensure all database tables exist
models.Base.metadata.create_all(bind=engine)

# Add dossier fields to existing SQLite databases without disturbing hotlist records.
with engine.begin() as connection:
    existing_columns = {
        column["name"]
        for column in connection.exec_driver_sql("PRAGMA table_info(hotlist)").mappings()
    }
    dossier_columns = {
        "fir_no": "VARCHAR",
        "police_station": "VARCHAR",
        "district": "VARCHAR",
        "io_name": "VARCHAR",
        "io_contact": "VARCHAR",
        "fir_file_name": "VARCHAR",
        "fir_file_type": "VARCHAR",
        "fir_file_data": "TEXT",
    }
    for column_name, column_type in dossier_columns.items():
        if column_name not in existing_columns:
            connection.exec_driver_sql(
                f"ALTER TABLE hotlist ADD COLUMN {column_name} {column_type}"
            )

app = FastAPI(title="ARGUS Command Center - Auto Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# SEED INITIAL CAMERAS & DEMO HOTLIST IF EMPTY
# -------------------------------------------------------------
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Cameras
        cam_count = db.query(models.Camera).count()
        if cam_count == 0:
            cameras_data = [
                {"id": "CAM-01", "name": "Hazratganj Chauraha, MG Marg", "lat": 26.8467, "lng": 80.9462, "enabled": True},
                {"id": "CAM-02", "name": "Station Gate 1, Charbagh", "lat": 26.8322, "lng": 80.9231, "enabled": True},
                {"id": "CAM-03", "name": "Ashutosh Nagar, Alambagh", "lat": 26.8145, "lng": 80.9012, "enabled": True},
                {"id": "CAM-04", "name": "Cyber Tower Crossing, Gomti Nagar", "lat": 26.8520, "lng": 80.9980, "enabled": True},
                # Frontend aliases
                {"id": "cam_1", "name": "Hazratganj Chauraha, MG Marg", "lat": 26.8467, "lng": 80.9462, "enabled": True},
                {"id": "cam_2", "name": "Station Gate 1, Charbagh", "lat": 26.8322, "lng": 80.9231, "enabled": True},
                {"id": "cam_3", "name": "Ashutosh Nagar, Alambagh", "lat": 26.8145, "lng": 80.9012, "enabled": True},
                {"id": "cam_4", "name": "Cyber Tower Crossing, Gomti Nagar", "lat": 26.8520, "lng": 80.9980, "enabled": True},
            ]
            for c in cameras_data:
                db.add(models.Camera(**c))
            db.commit()

        # Seed Hotlist with sample stolen/flagged plates
        hotlist_count = db.query(models.Hotlist).count()
        if hotlist_count == 0:
            now_str = datetime.datetime.now().strftime("%a, %d %b %Y • %I:%M %p")
            sample_hotlist = [
                {"plate": "UP32AB1234", "reason": "Stolen Hyundai Creta (Armed Robbery)", "active": True, "added_at": now_str},
                {"plate": "KA01AB1234", "reason": "Hit & Run Suspect Vehicle", "active": True, "added_at": now_str},
                {"plate": "UP32XY9876", "reason": "Red Corner Police Notice", "active": True, "added_at": now_str},
            ]
            for h in sample_hotlist:
                db.add(models.Hotlist(**h))
            db.commit()
    except Exception as e:
        logger.error(f"Error seeding initial data: {e}")
        db.rollback()
    finally:
        db.close()

seed_initial_data()

# -------------------------------------------------------------
# WEBSOCKET CONNECTION MANAGER FOR ZERO-LATENCY ALERTS
# -------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# -------------------------------------------------------------
# 1. HEALTH CHECK (Step 1 Contract)
# -------------------------------------------------------------
@app.get("/health")
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # test DB query
        db.query(models.Camera).count()
        db_status = "ok"
    except Exception:
        db_status = "error"

    arduino_status = "connected" if (arduino_bridge.serial_conn and arduino_bridge.serial_conn.is_open) else "standby"
    return {
        "status": "ok",
        "db": db_status,
        "arduino": arduino_status,
        "system": "argus_online"
    }

# -------------------------------------------------------------
# 2. WEBSOCKET ALERTS ENDPOINT
# -------------------------------------------------------------
@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# -------------------------------------------------------------
# 3. EDGE DETECTION INGESTION (Step 2 & 3 Contract)
# -------------------------------------------------------------
@app.post("/api/detections", status_code=status.HTTP_201_CREATED, response_model=schemas.IngestResponse)
async def process_live_detection(detection: schemas.DetectionIngest, db: Session = Depends(get_db)):
    # 1. Camera validation: unknown camera_id must return 400
    camera = db.query(models.Camera).filter(models.Camera.id == detection.camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=400,
            detail=f"Camera '{detection.camera_id}' not registered in cameras table"
        )

    plate_clean = detection.plate.upper().strip()

    # 2. Compute epoch_ts
    try:
        dt = datetime.datetime.fromisoformat(detection.timestamp.replace("Z", "+00:00"))
        epoch_ts = dt.timestamp()
    except Exception:
        epoch_ts = time.time()

    # 3. Check active Hotlist
    hotlist_entry = db.query(models.Hotlist).filter(
        models.Hotlist.plate == plate_clean,
        models.Hotlist.active == True
    ).first()

    is_match = True if hotlist_entry else False

    # 4. Insert Sighting
    bbox_str = json.dumps(detection.bbox) if detection.bbox else None
    sighting = models.Sighting(
        plate=plate_clean,
        raw_ocr=detection.raw_ocr or plate_clean,
        confidence=detection.confidence,
        camera_id=detection.camera_id,
        ts=detection.timestamp,
        epoch_ts=epoch_ts,
        track_id=detection.track_id,
        bbox=bbox_str,
        snapshot_path=detection.snapshot_path,
        matched=is_match
    )
    db.add(sighting)
    db.flush()

    # 5. On match: Insert Alert in the same transaction
    alert_id = None
    if is_match:
        alert = models.Alert(
            sighting_id=sighting.id,
            plate=plate_clean,
            reason=hotlist_entry.reason or "Critical Hotlist Match",
            created_at=detection.timestamp,
            acked=False
        )
        db.add(alert)
        db.flush()
        alert_id = alert.id

        # Trigger Arduino Siren/Gate over USB serial
        arduino_bridge.trigger_match_alert()

    db.commit()
    db.refresh(sighting)

    # 6. Broadcast via WebSocket immediately
    if is_match:
        alert_payload = {
            "id": alert_id,
            "sighting_id": sighting.id,
            "plate": sighting.plate,
            "camera_id": sighting.camera_id,
            "camera_name": camera.name,
            "lat": camera.lat,
            "lng": camera.lng,
            "reason": hotlist_entry.reason,
            "confidence": sighting.confidence,
            "timestamp": sighting.ts,
            "is_alert": True
        }
        await manager.broadcast({"type": "HOTLIST_ALERT", "data": alert_payload})

    return {"id": sighting.id, "matched": is_match, "alert_id": alert_id}

# -------------------------------------------------------------
# 4. CAMERAS REGISTRY
# -------------------------------------------------------------
@app.get("/api/cameras", response_model=List[schemas.CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(models.Camera).all()

# -------------------------------------------------------------
# 5. SIGHTINGS READ API
# -------------------------------------------------------------
@app.get("/api/sightings")
def get_sightings(
    plate: Optional[str] = None,
    camera_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(models.Sighting)
    if plate:
        query = query.filter(models.Sighting.plate == plate.upper().strip())
    if camera_id:
        query = query.filter(models.Sighting.camera_id == camera_id)
    return query.order_by(models.Sighting.id.desc()).offset(offset).limit(limit).all()

# -------------------------------------------------------------
# 6. HOTLIST CRUD ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/hotlist", response_model=List[schemas.HotlistResponse])
def get_hotlist(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Hotlist)
    if active_only:
        query = query.filter(models.Hotlist.active == True)
    return query.order_by(models.Hotlist.id.desc()).all()

@app.post("/api/hotlist")
def add_to_hotlist(data: schemas.HotlistCreate, db: Session = Depends(get_db)):
    plate_clean = data.plate.upper().strip()
    if not plate_clean:
        raise HTTPException(status_code=422, detail="License plate is required")

    file_data = None
    if data.fir_file_data is not None:
        if not data.fir_file_name or not data.fir_file_type:
            raise HTTPException(status_code=422, detail="FIR filename and content type are required")
        if data.fir_file_type != "application/pdf" and not data.fir_file_type.startswith("image/"):
            raise HTTPException(status_code=415, detail="FIR attachment must be a PDF or image")
        try:
            file_bytes = base64.b64decode(data.fir_file_data, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise HTTPException(status_code=422, detail="FIR attachment is not valid base64") from exc
        if not file_bytes:
            raise HTTPException(status_code=422, detail="FIR attachment cannot be empty")
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="FIR attachment must be 5 MiB or smaller")
        file_name = os.path.basename(data.fir_file_name.replace("\\", "/"))
        if not file_name:
            raise HTTPException(status_code=422, detail="FIR filename is invalid")
        file_data = base64.b64encode(file_bytes).decode("ascii")

    existing = db.query(models.Hotlist).filter(models.Hotlist.plate == plate_clean).first()
    now_str = datetime.datetime.now().strftime("%a, %d %b %Y • %I:%M %p")
    dossier_fields = (
        "fir_no",
        "police_station",
        "district",
        "io_name",
        "io_contact",
    )

    if existing:
        if "active" in data.model_fields_set:
            existing.active = data.active
        if "reason" in data.model_fields_set:
            existing.reason = data.reason
        for field in dossier_fields:
            if field in data.model_fields_set:
                setattr(existing, field, getattr(data, field))
        if file_data is not None:
            existing.fir_file_name = file_name
            existing.fir_file_type = data.fir_file_type
            existing.fir_file_data = file_data
        db.commit()
        db.refresh(existing)
        return {
            "status": "updated",
            "item": schemas.HotlistResponse.model_validate(existing),
        }

    new_item = models.Hotlist(
        plate=plate_clean,
        reason=data.reason,
        active=data.active,
        added_at=now_str,
        **{field: getattr(data, field) for field in dossier_fields},
        fir_file_name=file_name if file_data is not None else None,
        fir_file_type=data.fir_file_type if file_data is not None else None,
        fir_file_data=file_data,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {
        "status": "created",
        "item": schemas.HotlistResponse.model_validate(new_item),
    }

@app.get("/api/hotlist/{hotlist_id}/fir")
def download_fir_document(hotlist_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Hotlist).filter(models.Hotlist.id == hotlist_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hotlist entry not found")
    if not item.fir_file_data or not item.fir_file_name or not item.fir_file_type:
        raise HTTPException(status_code=404, detail="No FIR attachment is available")

    try:
        file_bytes = base64.b64decode(item.fir_file_data, validate=True)
    except (binascii.Error, ValueError) as exc:
        logger.exception("Stored FIR attachment is invalid for hotlist entry %s", hotlist_id)
        raise HTTPException(status_code=500, detail="Stored FIR attachment is corrupted") from exc

    safe_name = os.path.basename(item.fir_file_name.replace("\\", "/"))
    encoded_name = quote(safe_name, safe="")
    return Response(
        content=file_bytes,
        media_type=item.fir_file_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_name}"},
    )

@app.delete("/api/hotlist/{hotlist_id}")
def delete_from_hotlist(hotlist_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Hotlist).filter(models.Hotlist.id == hotlist_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hotlist entry not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": hotlist_id}

# -------------------------------------------------------------
# 7. ALERTS READ & ACKNOWLEDGE API
# -------------------------------------------------------------
@app.get("/alerts")
@app.get("/api/alerts")
def get_alerts(acked: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(models.Alert, models.Sighting, models.Camera).outerjoin(
        models.Sighting, models.Alert.sighting_id == models.Sighting.id
    ).outerjoin(
        models.Camera, models.Sighting.camera_id == models.Camera.id
    )
    if acked is not None:
        query = query.filter(models.Alert.acked == acked)
    return [
        {
            "id": alert.id,
            "sighting_id": alert.sighting_id,
            "plate": alert.plate,
            "reason": alert.reason,
            "created_at": alert.created_at,
            "timestamp": alert.created_at,
            "acked": alert.acked,
            "camera_id": sighting.camera_id if sighting else None,
            "camera_name": camera.name if camera else None,
            "lat": camera.lat if camera else None,
            "lng": camera.lng if camera else None,
        }
        for alert, sighting, camera in query.order_by(models.Alert.id.desc()).all()
    ]

@app.post("/api/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acked = True
    db.commit()
    db.refresh(alert)
    return {"status": "acknowledged", "id": alert.id, "acked": alert.acked}

# -------------------------------------------------------------
# 8. HARDWARE ARDUINO CONTROL ENDPOINT (Step 6)
# -------------------------------------------------------------
@app.post("/api/control/{device}", status_code=status.HTTP_202_ACCEPTED)
def control_device(device: str, action: str = "on", db: Session = Depends(get_db)):
    device = device.lower()
    if device not in ["gate", "siren"]:
        raise HTTPException(status_code=400, detail="Device must be 'gate' or 'siren'")

    cmd = f"{device.upper()}_{action.upper()}"
    success = arduino_bridge.send_command(cmd)

    if not success and not (arduino_bridge.serial_conn and arduino_bridge.serial_conn.is_open):
        raise HTTPException(status_code=503, detail="Arduino hardware is currently disconnected or in standby")

    return {"status": "queued", "device": device, "command": cmd}

# -------------------------------------------------------------
# 9. DYNAMIC ROUTE PROXY (OSRM Street Navigation)
# -------------------------------------------------------------
@app.get("/api/get-route")
def get_backend_street_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float):
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
    try:
        res = requests.get(osrm_url, timeout=5)
        data = res.json()
        if "routes" in data and len(data["routes"]) > 0:
            coords = [[pt[1], pt[0]] for pt in data["routes"][0]["geometry"]["coordinates"]]
            return {"status": "success", "coordinates": coords}
    except Exception:
        pass
    return {"status": "fallback", "coordinates": [[start_lat, start_lng], [end_lat, end_lng]]}