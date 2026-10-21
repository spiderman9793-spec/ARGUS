import React, { useState, useEffect } from 'react';
import { CloudSun, Shield, UserCheck, HardDrive, Cpu, Radio, ShieldAlert, Sliders } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CameraWall from './components/CameraWall';
import MapView from './components/MapView';
import DossierForm from './components/DossierForm';
import DossierTable from './components/DossierTable';
import EventsView from './components/EventsView';
import LandingPage from './components/LandingPage';
import SearchPanel from './components/SearchPanel';
import RightIntelPanel from './components/RightIntelPanel';
import Modals from './components/Modals';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [alerts, setAlerts] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [wsStatus, setWsStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(false);

  // Shared Modals State
  const [fullScreenCamera, setFullScreenCamera] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [viewDossierModal, setViewDossierModal] = useState(null);
  const [selectedPlate, setSelectedPlate] = useState('UP32AB1234');

  const activeSubTab = activeTab === 'devices'
    ? 'surveillance'
    : activeTab === 'dashboard'
      ? 'anpr'
      : activeTab === 'vehicles'
        ? 'vehicles'
        : activeTab === 'weather'
          ? 'weather'
          : null;

  useEffect(() => {
    let isMounted = true;
    const fetchCameras = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/cameras');
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.detail || `Request failed (${res.status}).`);
        }
        if (!Array.isArray(data)) {
          throw new Error('The camera registry returned an invalid response.');
        }
        const canonicalIds = new Set(
          data.map((camera) => camera.id).filter((id) => /^CAM-\d+$/i.test(id))
        );
        const displayedCameras = data.filter((camera) => {
          const alias = /^cam_(\d+)$/i.exec(camera.id);
          if (!alias) return true;
          const canonicalId = `CAM-${alias[1].padStart(2, '0')}`;
          return !canonicalIds.has(canonicalId);
        });
        if (isMounted) {
          setCameras(displayedCameras);
          setCameraError('');
        }
      } catch (err) {
        if (isMounted) setCameraError(`Could not load cameras: ${err.message}`);
      } finally {
        if (isMounted) setCameraLoading(false);
      }
    };

    fetchCameras();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch('http://localhost:8000/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Initial alerts fetch error:", err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket('ws://localhost:8000/ws/alerts');
      ws.onopen = () => setWsStatus('connected');
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type === 'HOTLIST_ALERT') {
            setAlerts((prev) => [payload.data, ...prev]);
          }
        } catch (err) {
          console.error("WS Parse error:", err);
        }
      };
      ws.onerror = () => setWsStatus('error');
      ws.onclose = () => setWsStatus('disconnected');
    } catch (err) {
      console.error("WebSocket init error:", err);
      setWsStatus('error');
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  if (currentView === 'landing') {
    return <LandingPage onLaunchDashboard={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="app-shell" style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#131726',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* 1. TOP HEADER HUD */}
      <Header
        wsStatus={wsStatus}
        alertCount={alerts.length}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={() => setIsSidebarVisible((visible) => !visible)}
        onOpenEvents={() => setActiveTab('events')}
        onOpenDevices={() => setActiveTab('devices')}
        onGoToLanding={() => setCurrentView('landing')}
      />

      <div className="app-workspace" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', width: '100%' }}>
        
        {/* 2. LEFT SIDEBAR MENU */}
        {isSidebarVisible && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}

        {/* 3. CENTER DYNAMIC WORKSPACE */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#131726' }}>
          
          {/* SUB-HEADER TABS (Video Surveillance | Vehicles | Weather | ANPR) + INTEL DRAWER TOGGLE */}
          <div className="top-tabs" style={{
            height: '42px',
            backgroundColor: '#1b2034',
            borderBottom: '1px solid #28304c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            fontSize: '12px',
            fontWeight: '500',
            userSelect: 'none',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {[
                { id: 'surveillance', label: 'Video Surveillance', mobileLabel: 'Video', activeTab: 'devices', available: true },
                { id: 'vehicles', label: 'Vehicles', mobileLabel: 'Vehicles', activeTab: 'vehicles', available: true },
                { id: 'weather', label: 'Weather & Optics', mobileLabel: 'Weather', activeTab: 'weather', available: true },
                { id: 'anpr', label: 'ANPR Map', mobileLabel: 'ANPR', activeTab: 'dashboard', available: true }
              ].map((tab, idx, arr) => {
                const isSelected = activeSubTab === tab.id;
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      className="top-tab"
                      type="button"
                      disabled={!tab.available}
                      aria-label={tab.label}
                      aria-pressed={isSelected}
                      onClick={() => setActiveTab(tab.activeTab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isSelected ? '#f59e0b' : tab.available ? '#8e9ab0' : '#5e6b82',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: tab.available ? 'pointer' : 'not-allowed',
                        padding: '4px 0',
                        outline: 'none',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (tab.available && !isSelected) e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        if (tab.available && !isSelected) e.currentTarget.style.color = '#8e9ab0';
                      }}
                    >
                      <span className="top-tab-label-desktop">{tab.label}</span>
                      <span className="top-tab-label-mobile">{tab.mobileLabel}</span>
                    </button>
                    {idx < arr.length - 1 && (
                      <span className="top-tab-separator" aria-hidden="true" style={{ color: '#28304c' }}>|</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* INTEL DRAWER TOGGLE BUTTON */}
            <button
              onClick={() => setIsRightExpanded(!isRightExpanded)}
              style={{
                backgroundColor: isRightExpanded ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isRightExpanded ? '1px solid #f59e0b' : '1px solid #28304c',
                borderRadius: '6px',
                color: isRightExpanded ? '#f59e0b' : '#8e9ab0',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Toggle Tactical Intel & Stream Drawer"
            >
              <Sliders size={13} />
              <span>{isRightExpanded ? 'HIDE INTEL DRAWER' : 'INTEL DRAWER'}</span>
              {alerts.length > 0 && (
                <span style={{ backgroundColor: '#f05a3e', color: '#ffffff', borderRadius: '10px', padding: '1px 5px', fontSize: '9px', fontWeight: '700' }}>
                  {alerts.length}
                </span>
              )}
            </button>
          </div>

          {/* MAIN VIEWPORT */}
          {cameraError && (
            <div className="app-data-error" role="alert">
              {cameraError}
            </div>
          )}
          
          <div className="main-viewport" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            
            {/* VIEW 1: DASHBOARD / ANPR (MAP VIEW WITH TRACKING CARD & PIP FEED) */}
            {activeTab === 'dashboard' && (
              <MapView cameras={cameras} alerts={alerts} camerasLoading={cameraLoading} />
            )}

            {/* VIEW 2: DEVICES (CAMERA WALL MATRIX) */}
            {activeTab === 'devices' && (
              <div style={{ flex: 1, overflowY: 'auto', width: '100%', backgroundColor: '#131726' }}>
                <CameraWall cameras={cameras} loading={cameraLoading} />
              </div>
            )}

            {/* VIEW 3: VEHICLES TARGET SEARCH & TRAJECTORY */}
            {activeTab === 'vehicles' && (
              <div style={{ flex: 1, overflowY: 'auto', width: '100%', backgroundColor: '#131726' }}>
                <SearchPanel initialPlate={selectedPlate} />
              </div>
            )}

            {/* VIEW 4: WEATHER & OPTICAL CLARITY MATRIX */}
            {activeTab === 'weather' && (
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#131726', color: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CloudSun size={20} color="#f59e0b" />
                      ENVIRONMENTAL CONDITIONS & OPTICAL CLARITY MATRIX
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8e9ab0' }}>
                      Realtime optical visibility sensors and weather attenuation index across all ANPR intersections
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '4px', fontWeight: '600' }}>
                      OPTICAL READINESS: 99.4%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { id: 'CAM-01', name: 'Hazratganj Chauraha, MG Marg', temp: '27°C', condition: 'Clear Sky', visibility: '99.2%', precipitation: '0 mm/h', lux: '520 Lux (Daylight)', defogger: 'Standby' },
                    { id: 'CAM-02', name: 'Station Gate 1, Charbagh', temp: '28°C', condition: 'Moderate Haze', visibility: '96.8%', precipitation: '0 mm/h', lux: '480 Lux (Standard)', defogger: 'Active 20%' },
                    { id: 'CAM-03', name: 'Ashutosh Nagar, Alambagh', temp: '27°C', condition: 'Clear', visibility: '98.5%', precipitation: '0 mm/h', lux: '510 Lux (Daylight)', defogger: 'Standby' },
                    { id: 'CAM-04', name: 'Cyber Tower Crossing, Gomti Nagar', temp: '26°C', condition: 'Optimal', visibility: '99.5%', precipitation: '0 mm/h', lux: '540 Lux (Peak Optical)', defogger: 'Standby' },
                  ].map((node) => (
                    <div key={node.id} style={{ backgroundColor: '#1b2034', border: '1px solid #28304c', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          {node.id}
                        </span>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                          ● OPTICAL ONLINE
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '10px' }}>
                        {node.name}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', backgroundColor: '#131726', padding: '12px', borderRadius: '6px', border: '1px solid #28304c' }}>
                        <div><span style={{ color: '#8e9ab0' }}>Ambient Temp:</span> <strong style={{ color: '#ffffff', display: 'block' }}>{node.temp}</strong></div>
                        <div><span style={{ color: '#8e9ab0' }}>Weather:</span> <strong style={{ color: '#ffffff', display: 'block' }}>{node.condition}</strong></div>
                        <div><span style={{ color: '#8e9ab0' }}>Optical Clarity:</span> <strong style={{ color: '#10b981', display: 'block' }}>{node.visibility}</strong></div>
                        <div><span style={{ color: '#8e9ab0' }}>Precipitation:</span> <strong style={{ color: '#cbd5e1', display: 'block' }}>{node.precipitation}</strong></div>
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#8e9ab0' }}>Lux Sensor:</span> <strong style={{ color: '#f59e0b', display: 'block' }}>{node.lux}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#1b2034', border: '1px solid #28304c', borderRadius: '8px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>
                    AUTOMATIC ENVIRONMENTAL ADAPTATION ENGINE
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8e9ab0', lineHeight: '1.6' }}>
                    The ARGUS ANPR vision pipeline features dynamic contrast normalization, CLAHE (Contrast Limited Adaptive Histogram Equalization), and automatic day/night infrared thresholding. In severe weather or low illumination conditions, image sharpening triggers automatically to preserve OCR license plate character extraction precision above 98%.
                  </p>
                </div>
              </div>
            )}

            {/* VIEW 5: POLICIES / HOTLIST MANAGEMENT */}
            {activeTab === 'policies' && (
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#131726', width: '100%' }}>
                <DossierForm />
                <DossierTable />
              </div>
            )}

            {/* VIEW 6: EVENTS / LIVE ALERT AUDIT */}
            {activeTab === 'events' && (
              <EventsView alerts={alerts} />
            )}

            {/* VIEW 7: REPORTS & EVIDENCE DOSSIER */}
            {activeTab === 'reports' && (
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#131726', width: '100%' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                      OFFICIAL POLICE EVIDENCE DOSSIERS & COURT AUDIT REPORTS
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8e9ab0' }}>
                      Certified incident dossiers and chain-of-custody hotlist records ready for legal export.
                    </p>
                  </div>
                </div>
                <DossierTable />
              </div>
            )}

            {/* VIEW 8: USER MANAGEMENT & SPECS */}
            {activeTab === 'users' && (
              <div style={{ flex: 1, padding: '24px', color: '#cbd5e1', backgroundColor: '#131726', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Shield size={24} color="#f59e0b" />
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: '700' }}>
                      COMMAND CONSOLE OPERATORS & C4I ARCHITECTURE
                    </h3>
                    <span style={{ fontSize: '11px', color: '#8e9ab0' }}>Argus Security Network Access Control Level 4</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { name: 'Inspector Vikram Rathore', role: 'Chief C4I Commander', badge: 'UPP-44021', status: 'ACTIVE SESSION', sector: 'Lucknow Central Control' },
                    { name: 'Sub-Inspector Ananya Sen', role: 'ANPR Watchlist Auditor', badge: 'UPP-58210', status: 'ACTIVE SESSION', sector: 'Hazratganj Intercept Unit' },
                    { name: 'Systems Engineering Core', role: 'Edge AI & Bridge Administrator', badge: 'ARG-001', status: 'STANDBY', sector: 'Hardware Control Bridge' }
                  ].map((user, i) => (
                    <div key={i} style={{ backgroundColor: '#1b2034', border: '1px solid #28304c', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                          ● {user.status}
                        </span>
                        <span style={{ fontSize: '11px', color: '#8e9ab0', fontFamily: 'monospace' }}>{user.badge}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>{user.role}</div>
                      <div style={{ fontSize: '11px', color: '#8e9ab0', marginTop: '6px' }}>Sector: {user.sector}</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#1b2034', border: '1px solid #28304c', borderRadius: '8px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>
                    HARDWARE INTERFACE & DUAL-BRAIN ARCHITECTURE SPECIFICATIONS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '12px' }}>
                    <div style={{ background: '#131726', padding: '14px', borderRadius: '6px', border: '1px solid #28304c' }}>
                      <div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Cpu size={14} /> LAPTOP 1 (EDGE ANPR BRAIN)
                      </div>
                      <div style={{ color: '#8e9ab0', lineHeight: '1.5' }}>
                        • Model: YOLOv8 Plate Detector + PaddleOCR<br />
                        • Stream: RTSP / USB Camera Ingestion<br />
                        • Output: Ingest HTTP POST to /api/detections
                      </div>
                    </div>
                    <div style={{ background: '#131726', padding: '14px', borderRadius: '6px', border: '1px solid #28304c' }}>
                      <div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HardDrive size={14} /> LAPTOP 2 (C4I COMMAND HUB)
                      </div>
                      <div style={{ color: '#8e9ab0', lineHeight: '1.5' }}>
                        • Engine: FastAPI + SQLAlchemy + SQLite<br />
                        • Realtime: Zero-Latency WebSocket /ws/alerts<br />
                        • Telemetry: OSRM Routing Bridge & Dossier Bank
                      </div>
                    </div>
                    <div style={{ background: '#131726', padding: '14px', borderRadius: '6px', border: '1px solid #28304c' }}>
                      <div style={{ color: '#f59e0b', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Radio size={14} /> HARDWARE ARDUINO BRIDGE
                      </div>
                      <div style={{ color: '#8e9ab0', lineHeight: '1.5' }}>
                        • Serial Bus: USB COM Port (9600 Baud)<br />
                        • Peripherals: High-Decibel Siren & Traffic Gate<br />
                        • Trip Logic: Automated on Hotlist Match
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT SLIDE-IN INTEL PANEL */}
            <RightIntelPanel
              isRightExpanded={isRightExpanded}
              onClose={() => setIsRightExpanded(false)}
              alerts={alerts}
              setSelectedAlert={setSelectedAlert}
              onSelectPlate={(plate) => {
                setSelectedPlate(plate);
                setActiveTab('vehicles');
              }}
            />

          </div>

        </div>
      </div>

      {/* MODALS (CAMERA FULLSCREEN, INCIDENT AUDIT, OFFICIAL DOSSIER) */}
      <Modals
        fullScreenCamera={fullScreenCamera}
        setFullScreenCamera={setFullScreenCamera}
        selectedAlert={selectedAlert}
        setSelectedAlert={setSelectedAlert}
        viewDossierModal={viewDossierModal}
        setViewDossierModal={setViewDossierModal}
      />

    </div>
  );
}
