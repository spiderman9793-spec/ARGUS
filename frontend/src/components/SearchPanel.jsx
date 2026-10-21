import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Car, MapPin, Clock, Calendar, CheckCircle, Radio } from 'lucide-react';

export default function SearchPanel({ initialPlate = 'UP32AB1234' }) {
  const [searchTerm, setSearchTerm] = useState(initialPlate);
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [sightings, setSightings] = useState([]);
  const [isHotlistMatch, setIsHotlistMatch] = useState(false);

  const performSearch = async (plateToSearch) => {
    const query = (plateToSearch || searchTerm).trim().toUpperCase();
    if (!query) return;
    setLoading(true);

    try {
      // 1. Check Hotlist
      const hotlistRes = await fetch('http://localhost:8000/api/hotlist');
      if (hotlistRes.ok) {
        const hotlistData = await hotlistRes.json();
        const match = hotlistData.find(item => item.plate.toUpperCase() === query);
        setIsHotlistMatch(!!match && match.active);
        if (match) {
          setVehicleData({
            plate: match.plate,
            reason: match.reason || 'Flagged in Police Watchlist',
            station: match.police_station || 'Hazratganj Kotwali',
            firNo: match.fir_no || 'FIR-2026/892',
            ioName: match.io_name || 'SI R.K. Singh'
          });
        } else {
          setVehicleData({
            plate: query,
            reason: 'Clean Record / Standard Transit',
            station: 'State Traffic Authority',
            firNo: 'N/A',
            ioName: 'Automated ANPR Log'
          });
        }
      }

      // 2. Query Sightings for Trajectory
      const sightingsRes = await fetch(`http://localhost:8000/api/sightings?plate=${encodeURIComponent(query)}&limit=10`);
      if (sightingsRes.ok) {
        const sightingsData = await sightingsRes.json();
        setSightings(Array.isArray(sightingsData) ? sightingsData : []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialPlate);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#131726',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: "'Inter', sans-serif",
      color: '#ffffff',
      overflowY: 'auto'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Car size={18} color="#f59e0b" />
          <span>VEHICLE TARGET INTELLIGENCE & TRAJECTORY SEARCH</span>
        </div>
        <span style={{ fontSize: '11px', color: '#8e9ab0' }}>ANPR DATABASE LOOKUP</span>
      </div>

      {/* SEARCH INPUT */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Enter License Plate (e.g. UP32AB1234, KA01AB1234)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            backgroundColor: '#1b2034',
            border: '1px solid #28304c',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none',
            fontFamily: "'Inter', sans-serif"
          }}
        />
        <Search size={18} color="#f59e0b" style={{ position: 'absolute', left: '14px', top: '12px' }} />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '8px',
            top: '7px',
            backgroundColor: '#f59e0b',
            color: '#131726',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* TARGET PROFILE CARD */}
      {vehicleData && (
        <div style={{
          backgroundColor: '#1b2034',
          border: isHotlistMatch ? '1px solid #f05a3e' : '1px solid #28304c',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: isHotlistMatch ? '0 0 20px rgba(240, 90, 62, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #28304c', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isHotlistMatch ? '#f05a3e' : '#f59e0b', fontSize: '13px', fontWeight: '700' }}>
              {isHotlistMatch ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
              <span>TARGET DOSSIER FILE: {vehicleData.plate}</span>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              backgroundColor: isHotlistMatch ? 'rgba(240, 90, 62, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isHotlistMatch ? '#f05a3e' : '#10b981',
              border: isHotlistMatch ? '1px solid #f05a3e' : '1px solid #10b981',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {isHotlistMatch ? 'HOTLIST MATCH' : 'CLEAN TRANSIT'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '11px' }}>
            <div>
              <span style={{ color: '#8e9ab0', display: 'block', marginBottom: '2px' }}>STATUS REASON</span>
              <strong style={{ color: isHotlistMatch ? '#f05a3e' : '#ffffff' }}>{vehicleData.reason}</strong>
            </div>
            <div>
              <span style={{ color: '#8e9ab0', display: 'block', marginBottom: '2px' }}>POLICE JURISDICTION</span>
              <strong style={{ color: '#ffffff' }}>{vehicleData.station}</strong>
            </div>
            <div>
              <span style={{ color: '#8e9ab0', display: 'block', marginBottom: '2px' }}>FIR / CASE NUMBER</span>
              <strong style={{ color: '#f59e0b' }}>{vehicleData.firNo}</strong>
            </div>
            <div>
              <span style={{ color: '#8e9ab0', display: 'block', marginBottom: '2px' }}>ASSIGNED OFFICER</span>
              <strong style={{ color: '#ffffff' }}>{vehicleData.ioName}</strong>
            </div>
          </div>
        </div>
      )}

      {/* RECENT TRAJECTORY HISTORY */}
      <div style={{
        flex: 1,
        backgroundColor: '#1b2034',
        border: '1px solid #28304c',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: '700' }}>
            <MapPin size={16} /> RECENT TRAJECTORY TIMELINE
          </div>
          <span style={{ fontSize: '11px', color: '#8e9ab0' }}>{sightings.length} checkpoints recorded</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sightings.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#8e9ab0', fontSize: '12px' }}>
              No trajectory sightings recorded yet for plate {searchTerm}.<br />
              <span style={{ fontSize: '11px', color: '#5e6b82' }}>Detections from Laptop 1 Edge cameras will appear here automatically.</span>
            </div>
          ) : (
            sightings.map((scan, idx) => (
              <div 
                key={scan.id || idx}
                style={{
                  backgroundColor: '#131726',
                  borderLeft: scan.matched ? '3px solid #f05a3e' : '3px solid #f59e0b',
                  border: '1px solid #28304c',
                  borderLeftWidth: '3px',
                  borderRadius: '4px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}
              >
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '700' }}>
                    Camera: {scan.camera_id}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8e9ab0', marginTop: '3px', display: 'flex', gap: '12px' }}>
                    <span>Timestamp: {scan.ts}</span>
                    <span>Confidence: {(scan.confidence ? (scan.confidence > 1 ? scan.confidence : scan.confidence * 100).toFixed(1) : '95.0')}%</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: scan.matched ? '#f05a3e' : '#10b981',
                    backgroundColor: scan.matched ? 'rgba(240, 90, 62, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '3px'
                  }}>
                    {scan.matched ? 'HOTLIST SIGHTING' : 'LOGGED'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
