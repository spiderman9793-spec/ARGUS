import React, { useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';
import CameraFeed from './CameraFeed';

export default function CameraWall({ cameras = [], loading = false }) {
  const [zoomedCam, setZoomedCam] = useState(null);
  const enabledCount = cameras.filter((camera) => camera.enabled).length;

  return (
    <section className="camera-wall">
      <header className="camera-wall-header">
        <div className="camera-wall-title">
          <Camera size={18} color="#f59e0b" />
          <span>CAMERA SURVEILLANCE</span>
        </div>
        <div className="camera-count">
          {enabledCount} OF {cameras.length} CAMERAS ENABLED
        </div>
      </header>

      {loading ? (
        <div className="camera-wall-empty" role="status">Loading camera registry...</div>
      ) : cameras.length === 0 ? (
        <div className="camera-wall-empty" role="status">No cameras are registered.</div>
      ) : (
        <div className="camera-grid">
          {cameras.map((camera) => (
            <article className="camera-card" key={camera.id}>
              <header className="camera-card-header">
                <div>
                  <strong>{camera.id}</strong>
                  <span>{camera.name}</span>
                </div>
                <span className={camera.enabled ? 'camera-enabled' : 'camera-disabled'}>
                  {camera.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </header>

              <CameraFeed camera={camera} className="camera-card-feed" />

              <footer className="camera-card-footer">
                <span>GPS: {camera.lat}, {camera.lng}</span>
                <button
                  type="button"
                  onClick={() => setZoomedCam(camera)}
                  aria-label={`Expand camera ${camera.name}`}
                  title="Expand camera"
                >
                  <Maximize2 size={15} />
                  <span>EXPAND</span>
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {zoomedCam && (
        <div className="camera-fullscreen" role="dialog" aria-modal="true" aria-label={`Camera ${zoomedCam.name}`}>
          <header className="camera-fullscreen-header">
            <div>
              <strong>{zoomedCam.id}</strong>
              <span>{zoomedCam.name}</span>
            </div>
            <button type="button" onClick={() => setZoomedCam(null)} aria-label="Close camera">
              <X size={18} />
              CLOSE
            </button>
          </header>
          <CameraFeed camera={zoomedCam} className="camera-fullscreen-feed" />
        </div>
      )}
    </section>
  );
}
