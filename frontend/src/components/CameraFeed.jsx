import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

export default function CameraFeed({ camera, className = '' }) {
  // Determine fallback video based on camera id so each feed has distinct movement
  const cameraNumeric = parseInt(camera?.id?.replace(/\D/g, '') || '1', 10);
  const defaultVideo = cameraNumeric % 2 === 0
    ? '/videos/gettyimages-931707818-640_adpp.mp4'
    : '/videos/gettyimages-871539966-640_adpp.mp4';

  const effectiveStreamUrl = camera?.stream_url || camera?.video_url || (camera?.enabled ? defaultVideo : null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [effectiveStreamUrl]);

  return (
    <div className={`camera-feed ${className}`} aria-label={`Camera feed for ${camera?.name || 'selected camera'}`} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#080b13' }}>
      {camera?.enabled && effectiveStreamUrl && !hasError ? (
        <>
          <video
            key={effectiveStreamUrl}
            src={effectiveStreamUrl}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHasError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* ANPR HUD OVERLAY */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px',
            fontFamily: "'Inter', monospace"
          }}>
            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                backgroundColor: 'rgba(27, 32, 52, 0.85)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {camera?.id || 'CAM-01'} · LIVE ANPR
              </span>
              <span style={{
                backgroundColor: 'rgba(240, 90, 62, 0.2)',
                border: '1px solid #f05a3e',
                color: '#f05a3e',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f05a3e', animation: 'radarPulse 1.5s infinite' }} />
                REC
              </span>
            </div>

            {/* ANPR OPTICAL TARGET BOX (SIMULATED DETECTION) */}
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '32%',
              width: '120px',
              height: '46px',
              border: '2px dashed rgba(245, 158, 11, 0.7)',
              borderRadius: '4px',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              padding: '2px'
            }}>
              <span style={{
                backgroundColor: 'rgba(245, 158, 11, 0.9)',
                color: '#131726',
                fontSize: '8px',
                fontWeight: '800',
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                OCR 98.4%
              </span>
            </div>

            {/* BOTTOM BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              <span>GPS: {camera?.lat || '26.8467'}, {camera?.lng || '80.9462'}</span>
              <span>1080P @ 30 FPS</span>
            </div>
          </div>
        </>
      ) : (
        <div className="camera-feed-placeholder" role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#8e9ab0' }}>
          <Radio size={32} color="#8e9ab0" aria-hidden="true" />
          <strong style={{ color: '#cbd5e1', fontSize: '12px' }}>
            {!camera?.enabled ? 'Camera is disabled' : 'Feed temporarily offline'}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {!camera?.enabled ? 'This camera is currently deactivated in the registry.' : 'Awaiting video stream signal.'}
          </span>
        </div>
      )}
    </div>
  );
}
