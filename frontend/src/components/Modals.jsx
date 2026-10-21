import React from 'react';
import { Video, X, ShieldAlert, Clock, FileText, Printer, CheckCircle } from 'lucide-react';
import CameraFeed from './CameraFeed';

export default function Modals({
  fullScreenCamera,
  setFullScreenCamera,
  selectedAlert,
  setSelectedAlert,
  viewDossierModal,
  setViewDossierModal
}) {
  return (
    <>
      {/* 1. FULL SCREEN CAMERA STREAM MODAL */}
      {fullScreenCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(10, 13, 22, 0.96)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #28304c',
            backgroundColor: '#1b2034'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video style={{ color: '#f59e0b' }} size={20} />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>
                  {fullScreenCamera.name || fullScreenCamera.id}
                </div>
                <div style={{ color: '#8e9ab0', fontSize: '11px', marginTop: '2px' }}>
                  GPS: {fullScreenCamera.lat}, {fullScreenCamera.lng} • HIGH PRECISION ANPR SURVEILLANCE
                </div>
              </div>
            </div>
            <button
              onClick={() => setFullScreenCamera(null)}
              style={{
                background: 'rgba(240, 90, 62, 0.15)',
                color: '#f05a3e',
                border: '1px solid rgba(240, 90, 62, 0.4)',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <X size={16} /> EXIT FULLSCREEN
            </button>
          </div>
          <div style={{ flex: 1, margin: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #28304c', backgroundColor: '#131726' }}>
            <CameraFeed camera={fullScreenCamera} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* 2. INCIDENT ALERT MODAL */}
      {selectedAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10, 13, 22, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999998,
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: '#1b2034',
            border: '1px solid rgba(240, 90, 62, 0.5)',
            borderRadius: '10px',
            width: '500px',
            maxWidth: '92vw',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #28304c', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '10px', background: 'rgba(240, 90, 62, 0.2)', color: '#f05a3e', border: '1px solid #f05a3e', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  HOTLIST DETECTED
                </span>
                <h4 style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '17px', fontWeight: '700' }}>
                  INCIDENT FILE #{selectedAlert.id || '9021'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'none', border: 'none', color: '#8e9ab0', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '12px',
              backgroundColor: '#131726',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #28304c',
              marginBottom: '18px'
            }}>
              <div>
                <span style={{ color: '#8e9ab0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plate Number</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginTop: '4px', fontFamily: 'monospace' }}>
                  {selectedAlert.plate}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confidence Score</span>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={15} /> 98.4% MATCH
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#8e9ab0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Flag Reason</span>
                <div style={{ color: '#f59e0b', marginTop: '4px', fontWeight: '600' }}>
                  {selectedAlert.reason || 'Flagged on vehicle hotlist'}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Camera Node</span>
                <div style={{ color: '#ffffff', marginTop: '4px' }}>
                  {selectedAlert.camera_name || selectedAlert.camera_id || 'Hazratganj Chauraha'}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timestamp</span>
                <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                  {selectedAlert.timestamp || selectedAlert.created_at || 'Just now'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#f59e0b',
                  color: '#131726',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} /> EXPORT INCIDENT AUDIT
              </button>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  padding: '11px 18px',
                  background: '#28304c',
                  color: '#cbd5e1',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL DOSSIER AUDIT MODAL */}
      {viewDossierModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10, 13, 22, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999998,
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: '#1b2034',
            border: '1px solid #28304c',
            borderRadius: '10px',
            width: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #28304c', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', background: 'rgba(240, 90, 62, 0.15)', color: '#f05a3e', border: '1px solid #f05a3e', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  TARGET CASE DOSSIER
                </span>
                <h3 style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '18px', fontFamily: 'monospace' }}>
                  CASE ID: {viewDossierModal.caseId || viewDossierModal.fir_no || 'FIR-2026/892'}
                </h3>
              </div>
              <button
                onClick={() => setViewDossierModal(null)}
                style={{ background: 'none', border: 'none', color: '#8e9ab0', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#131726', padding: '10px 14px', borderRadius: '6px', border: '1px solid #28304c', marginBottom: '16px', fontSize: '11px' }}>
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} /> CREATED ON: {viewDossierModal.added_at || viewDossierModal.addedTimestamp || 'Active'}
              </span>
              <span style={{ color: '#f05a3e', fontWeight: '700', background: 'rgba(240, 90, 62, 0.12)', border: '1px solid rgba(240, 90, 62, 0.4)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>
                ● {viewDossierModal.active !== false ? 'WANTED / ARMED PATROL' : 'RESOLVED'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11px', background: '#131726', padding: '14px', borderRadius: '8px', border: '1px solid #28304c', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#8e9ab0' }}>TARGET PLATE:</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f59e0b', marginTop: '2px', fontFamily: 'monospace' }}>
                  {viewDossierModal.plate}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0' }}>CRIME / REASON:</span>
                <div style={{ color: '#ffffff', fontWeight: '600', marginTop: '4px' }}>
                  {viewDossierModal.reason}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0' }}>POLICE STATION:</span>
                <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                  {viewDossierModal.police_station || viewDossierModal.station || 'Hazratganj Kotwali'}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0' }}>DISTRICT:</span>
                <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                  {viewDossierModal.district || 'Lucknow, Uttar Pradesh'}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0' }}>INVESTIGATION OFFICER:</span>
                <div style={{ color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                  {viewDossierModal.io_name || viewDossierModal.officerId || 'SI R.K. Singh'}
                </div>
              </div>
              <div>
                <span style={{ color: '#8e9ab0' }}>IO CONTACT:</span>
                <div style={{ color: '#cbd5e1', marginTop: '4px' }}>
                  {viewDossierModal.io_contact || viewDossierModal.officerContact || '+91 94150 11200'}
                </div>
              </div>
            </div>

            <div style={{ background: '#131726', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '11px' }}>
                <FileText size={16} /> ATTACHED LEGAL DOCUMENT: <strong>{viewDossierModal.fir_file_name || 'FIR_Certified_Copy.pdf'}</strong>
              </div>
              <span style={{ fontSize: '10px', color: '#8e9ab0', border: '1px solid #28304c', padding: '2px 8px', borderRadius: '4px' }}>
                CERTIFIED
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: '#f59e0b',
                  color: '#131726',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Printer size={15} /> EXPORT PRINTABLE DOSSIER (PDF)
              </button>
              <button
                onClick={() => setViewDossierModal(null)}
                style={{
                  padding: '11px 18px',
                  background: '#28304c',
                  color: '#cbd5e1',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
