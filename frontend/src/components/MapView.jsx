import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { Maximize2, Search, Video, X } from 'lucide-react';
import L from 'leaflet';
import CameraFeed from './CameraFeed';

const createGlowingCarIcon = () => L.divIcon({
  className: 'glowing-car-container',
  html: `
    <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,rgba(240,90,62,.75) 0%,rgba(240,90,62,.3) 50%,rgba(240,90,62,0) 75%);animation:radarPulse 1.8s infinite ease-out"></div>
      <div style="position:relative;width:34px;height:34px;border-radius:50%;background:#f05a3e;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px #f05a3e;border:2px solid #fff">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 30]
});

const createStandbyCarIcon = () => L.divIcon({
  className: 'glowing-car-container',
  html: `
    <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,.65) 0%,rgba(245,158,11,.2) 50%,rgba(245,158,11,0) 75%);animation:radarPulse 2.2s infinite ease-out"></div>
      <div style="position:relative;width:34px;height:34px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px #f59e0b;border:2px solid #fff">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#131726" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 30]
});

const cameraNodeIcon = L.divIcon({
  className: 'camera-node-icon',
  html: '<div style="background:#f59e0b;width:10px;height:10px;border-radius:50%;border:2px solid #1b2034;box-shadow:0 0 8px #f59e0b"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});
const defaultMapCenter = [26.8467, 80.9462];

const isValidCoordinate = (lat, lng) =>
  lat !== null
  && lat !== undefined
  && lat !== ''
  && lng !== null
  && lng !== undefined
  && lng !== ''
  && Number.isFinite(Number(lat))
  && Number.isFinite(Number(lng))
  && Number(lat) >= -90
  && Number(lat) <= 90
  && Number(lng) >= -180
  && Number(lng) <= 180;

const formatAlertTime = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(date);
};

function MapResizer({ focusPosition, focusVersion }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);
    const timeout = window.setTimeout(() => map.invalidateSize(), 250);
    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(timeout);
    };
  }, [map]);

  useEffect(() => {
    if (focusPosition) map.setView(focusPosition, Math.max(map.getZoom(), 14));
  }, [map, focusPosition, focusVersion]);

  return null;
}

export default function MapView({ cameras = [], alerts = [], camerasLoading = false }) {
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [focusVersion, setFocusVersion] = useState(0);
  const [focusOverride, setFocusOverride] = useState(null);
  const activeAlert = alerts[0] || null;

  const enabledCameras = useMemo(
    () => cameras.filter((camera) => camera.enabled),
    [cameras]
  );

  const selectedCamera = enabledCameras.find((camera) => camera.id === selectedCameraId)
    || enabledCameras[0]
    || cameras[0]
    || null;

  useEffect(() => {
    if (selectedCamera && selectedCamera.id !== selectedCameraId) {
      setSelectedCameraId(selectedCamera.id);
    }
  }, [selectedCamera, selectedCameraId]);

  useEffect(() => {
    setFocusOverride(null);
  }, [activeAlert?.id]);

  const alertPosition = useMemo(
    () => activeAlert && isValidCoordinate(activeAlert.lat, activeAlert.lng)
      ? [Number(activeAlert.lat), Number(activeAlert.lng)]
      : null,
    [activeAlert?.lat, activeAlert?.lng]
  );
  const selectedCameraPosition = useMemo(
    () => selectedCamera && isValidCoordinate(selectedCamera.lat, selectedCamera.lng)
      ? [Number(selectedCamera.lat), Number(selectedCamera.lng)]
      : null,
    [selectedCamera?.lat, selectedCamera?.lng]
  );
  const initialCenter = alertPosition
    || selectedCameraPosition
    || defaultMapCenter;
  const focusPosition = focusOverride || alertPosition || selectedCameraPosition;

  const focusCamera = () => {
    if (selectedCameraPosition) {
      setFocusOverride(selectedCameraPosition);
      setFocusVersion((version) => version + 1);
    }
  };

  const selectCamera = (cameraId) => {
    setSelectedCameraId(cameraId);
    const camera = enabledCameras.find((item) => item.id === cameraId);
    if (camera && isValidCoordinate(camera.lat, camera.lng)) {
      setFocusOverride([Number(camera.lat), Number(camera.lng)]);
      setFocusVersion((version) => version + 1);
    }
  };

  return (
    <div className="map-view">
      <MapContainer
        center={initialCenter}
        zoom={13}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#131726' }}
      >
        <MapResizer focusPosition={focusPosition} focusVersion={focusVersion} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />

        {cameras.map((camera) => (
          <Marker key={camera.id} position={[camera.lat, camera.lng]} icon={cameraNodeIcon}>
            <Popup>
              <div style={{ color: '#1b2034', fontSize: '11px', fontWeight: 'bold' }}>
                {camera.name}
              </div>
            </Popup>
          </Marker>
        ))}

        {alertPosition ? (
          <Marker position={alertPosition} icon={createGlowingCarIcon()}>
            <Popup>
              <div style={{ color: '#1b2034', fontSize: '11px', fontWeight: 'bold' }}>
                {activeAlert.plate || 'Alert vehicle'} detected at {activeAlert.camera_name || activeAlert.camera_id || 'camera'}
              </div>
            </Popup>
          </Marker>
        ) : (
          <Marker position={defaultMapCenter} icon={createStandbyCarIcon()}>
            <Popup>
              <div style={{ color: '#1b2034', fontSize: '11px', fontWeight: 'bold' }}>
                ACTIVE SURVEILLANCE PATROL • TARGET: UP32AB1234
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <section className="tracking-card" aria-label="Latest vehicle alert">
        <header>{activeAlert ? 'Latest hotlist alert' : 'Surveillance Radar Active'}</header>
        {activeAlert ? (
          <div className="tracking-card-body">
            <strong>Vehicle: {activeAlert.plate || 'Unknown plate'}</strong>
            <div className="tracking-card-details">
              <div>
                <span>Reason</span>
                <strong>{activeAlert.reason || 'Hotlist match'}</strong>
              </div>
              <div>
                <span>Alert created</span>
                <strong>{formatAlertTime(activeAlert.timestamp || activeAlert.created_at)}</strong>
              </div>
            </div>
            <span className="tracking-camera-name">
              {activeAlert.camera_name || activeAlert.camera_id || 'Camera location unavailable'}
            </span>
          </div>
        ) : (
          <div className="tracking-card-body">
            <strong>Monitoring Target: UP32AB1234</strong>
            <div className="tracking-card-details">
              <div>
                <span>Watchlist</span>
                <strong style={{ color: '#f59e0b' }}>Warrant / Active</strong>
              </div>
              <div>
                <span>Checkpoints</span>
                <strong style={{ color: '#10b981' }}>{cameras.length || 4} Nodes Active</strong>
              </div>
            </div>
            <span className="tracking-camera-name">
              Sector: Hazratganj - Gomti Nagar Grid
            </span>
          </div>
        )}
      </section>

      <section className="map-camera-card" aria-label="Selected camera">
        <header className="map-camera-header">
          <label>
            <Video size={14} aria-hidden="true" />
            <span className="visually-hidden">Select camera</span>
            <select
              value={selectedCamera?.id || ''}
              onChange={(event) => selectCamera(event.target.value)}
              disabled={enabledCameras.length === 0}
            >
              {enabledCameras.length === 0 ? (
                <option value="">No enabled cameras</option>
              ) : enabledCameras.map((camera) => (
                <option value={camera.id} key={camera.id}>{camera.name}</option>
              ))}
            </select>
          </label>
          <div className="map-camera-controls">
            <button type="button" onClick={focusCamera} disabled={!selectedCameraPosition} aria-label="Locate selected camera">
              <Search size={15} />
            </button>
            <button type="button" onClick={() => setIsCameraExpanded(true)} disabled={!selectedCamera} aria-label="Expand selected camera">
              <Maximize2 size={15} />
            </button>
          </div>
        </header>
        {selectedCamera ? (
          <CameraFeed camera={selectedCamera} className="map-camera-feed" />
        ) : (
          <div className="map-camera-empty" role="status">
            {camerasLoading ? 'Loading camera registry...' : 'No camera is available.'}
          </div>
        )}
      </section>

      {isCameraExpanded && selectedCamera && (
        <div className="camera-fullscreen" role="dialog" aria-modal="true" aria-label={`Camera ${selectedCamera.name}`}>
          <header className="camera-fullscreen-header">
            <div>
              <strong>{selectedCamera.id}</strong>
              <span>{selectedCamera.name}</span>
            </div>
            <button type="button" onClick={() => setIsCameraExpanded(false)} aria-label="Close camera">
              <X size={18} />
              CLOSE
            </button>
          </header>
          <CameraFeed camera={selectedCamera} className="camera-fullscreen-feed" />
        </div>
      )}
    </div>
  );
}
