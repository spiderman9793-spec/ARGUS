from pydantic import BaseModel, Field
from typing import Optional, List, Any

# Edge Ingest Contract (Laptop 1 -> Laptop 2)
class DetectionIngest(BaseModel):
    plate: str
    raw_ocr: Optional[str] = None
    confidence: Optional[float] = 0.95
    camera_id: str
    timestamp: str
    track_id: Optional[int] = None
    bbox: Optional[List[int]] = None
    snapshot_path: Optional[str] = None

class IngestResponse(BaseModel):
    id: int
    matched: bool
    alert_id: Optional[int] = None

# Camera Schemas
class CameraBase(BaseModel):
    id: str
    name: str
    rtsp_url: Optional[str] = None
    lat: float
    lng: float
    enabled: bool = True

class CameraCreate(CameraBase):
    pass

class CameraResponse(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    enabled: bool

    class Config:
        from_attributes = True

# Sighting Schemas
class SightingResponse(BaseModel):
    id: int
    plate: str
    raw_ocr: Optional[str] = None
    confidence: Optional[float] = None
    camera_id: str
    ts: str
    epoch_ts: Optional[float] = None
    track_id: Optional[int] = None
    bbox: Optional[str] = None
    snapshot_path: Optional[str] = None
    matched: bool

    class Config:
        from_attributes = True

# Hotlist Schemas
class HotlistBase(BaseModel):
    plate: str
    reason: Optional[str] = "Hotlist Flagged"
    active: bool = True
    fir_no: Optional[str] = Field(default=None, max_length=120)
    police_station: Optional[str] = Field(default=None, max_length=200)
    district: Optional[str] = Field(default=None, max_length=120)
    io_name: Optional[str] = Field(default=None, max_length=120)
    io_contact: Optional[str] = Field(default=None, max_length=40)
    fir_file_name: Optional[str] = Field(default=None, max_length=255)
    fir_file_type: Optional[str] = Field(default=None, max_length=100)

class HotlistCreate(HotlistBase):
    fir_file_data: Optional[str] = Field(default=None, max_length=7_000_000)

class HotlistResponse(HotlistBase):
    id: int
    added_at: str

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: int
    sighting_id: int
    plate: str
    reason: Optional[str] = None
    created_at: str
    acked: bool

    class Config:
        from_attributes = True

# Backward Compatibility Aliases
DetectionCreate = DetectionIngest
DetectionResponse = SightingResponse
WatchlistCreate = HotlistCreate
WatchlistResponse = HotlistResponse