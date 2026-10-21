from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rtsp_url = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    enabled = Column(Boolean, default=True)

class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, index=True, nullable=False)
    raw_ocr = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    camera_id = Column(String, ForeignKey("cameras.id"), index=True, nullable=False)
    ts = Column(String, index=True, nullable=False)
    epoch_ts = Column(Float, index=True, nullable=True)
    track_id = Column(Integer, nullable=True)
    bbox = Column(String, nullable=True)
    snapshot_path = Column(String, nullable=True)
    matched = Column(Boolean, default=False)

class Hotlist(Base):
    __tablename__ = "hotlist"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    added_at = Column(String, nullable=False)
    fir_no = Column(String, nullable=True)
    police_station = Column(String, nullable=True)
    district = Column(String, nullable=True)
    io_name = Column(String, nullable=True)
    io_contact = Column(String, nullable=True)
    fir_file_name = Column(String, nullable=True)
    fir_file_type = Column(String, nullable=True)
    fir_file_data = Column(String, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    sighting_id = Column(Integer, ForeignKey("sightings.id"))
    plate = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(String, nullable=False)
    acked = Column(Boolean, default=False, index=True)

# Backward-compatibility aliases
Detection = Sighting
Watchlist = Hotlist