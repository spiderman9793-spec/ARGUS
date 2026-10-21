import React, { useState, useEffect } from 'react';
import { Search, X, Car, Calendar, Clock, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

export default function RightIntelPanel({
  isRightExpanded,
  onClose,
  alerts = [],
  setSelectedAlert,
  onSelectPlate
}) {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'stream' | 'intel'
  const [recentSightings, setRecentSightings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Poll recent sightings for the live stream tab
  useEffect(() => {
    let isMounted = true;
    const fetchSightings = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/sightings?limit=25');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setRecentSightings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // quiet error in background
      }
    };

    fetchSightings();
    const interval = setInterval(fetchSightings, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;
    setSearchLoading(true);

    try {
      // 1. Hotlist check
      const hotlistRes = await fetch('http://localhost:8000/api/hotlist');
      const hotlistData = hotlistRes.ok ? await hotlistRes.json() : [];
      const match = hotlistData.find(item => item.plate.toUpperCase() === q);

      // 2. Sightings check
      const sightingsRes = await fetch(`http://localhost:8000/api/sightings?plate=${encodeURIComponent(q)}&limit=15`);
      const sightingsData = sightingsRes.ok ? await sightingsRes.json() : [];

      setSearchResult({
        plate: q,
        isHotlist: !!match && match.active,
        reason: match?.reason || 'Standard Transit (No warrants)',
        station: match?.police_station || 'Hazratganj Kotwali',
        history: sightingsData
      });
    } catch (err) {
      console.error('Intel search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <aside style={{
      width: isRightExpanded ? '340px' : '0px',
      backgroundColor: '#1b2034',
      borderLeft: isRightExpanded ? '1px solid #28304c' : 'none',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      flexShrink: 0,
      zIndex: 40,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ width: '340px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* HEADER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #28304c',
          backgroundColor: '#141828'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={14} color="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.5px' }}>
              TACTICAL INTEL & STREAM
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#8e9ab0', cursor: 'pointer', padding: '2px' }}
              title="Close Intel Drawer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* SUB TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #28304c', backgroundColor: '#181e30' }}>
          <button
            onClick={() => setActiveTab('alerts')}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === 'alerts' ? '#1b2034' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'alerts' ? '2px solid #f05a3e' : '2px solid transparent',
              color: activeTab === 'alerts' ? '#ffffff' : '#8e9ab0',
              fontWeight: '600',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>ALERTS</span>
            {alerts.length > 0 && (
              <span style={{ background: '#f05a3e', color: '#ffffff', fontSize: '9px', padding: '1px 5px', borderRadius: '10px', fontWeight: '700' }}>
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === 'stream' ? '#1b2034' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'stream' ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === 'stream' ? '#ffffff' : '#8e9ab0',
              fontWeight: '600',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            LIVE SIGHTINGS
          </button>

          <button
            onClick={() => setActiveTab('intel')}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === 'intel' ? '#1b2034' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'intel' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'intel' ? '#ffffff' : '#8e9ab0',
              fontWeight: '600',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            TARGET INTEL
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', boxSizing: 'border-box', backgroundColor: '#131726' }}>
          
          {/* 1. ALERTS TAB */}
          {activeTab === 'alerts' && (
            alerts.length === 0 ? (
              <div style={{ color: '#8e9ab0', fontSize: '12px', textAlign: 'center', marginTop: '40px', lineHeight: '1.6' }}>
                <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                No active hotlist alerts detected.<br />
                All monitored checkpoints clear.
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={alert.id || index}
                  onClick={() => setSelectedAlert && setSelectedAlert(alert)}
                  style={{
                    backgroundColor: '#1b2034',
                    borderLeft: '4px solid #f05a3e',
                    border: '1px solid #28304c',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f05a3e'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#28304c'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', background: 'rgba(240, 90, 62, 0.2)', color: '#f05a3e', border: '1px solid rgba(240, 90, 62, 0.4)', padding: '2px 6px', borderRadius: '3px', fontWeight: '700' }}>
                      HOTLIST ALERT
                    </span>
                    <span style={{ fontSize: '10px', color: '#8e9ab0' }}>
                      {alert.timestamp || alert.created_at || 'Just now'}
                    </span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace' }}>
                    {alert.plate}
                  </div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', fontWeight: '500' }}>
                    {alert.reason || 'Flagged target'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8e9ab0', marginTop: '4px' }}>
                    Camera: {alert.camera_name || alert.camera_id || 'Hazratganj'}
                  </div>
                </div>
              ))
            )
          )}

          {/* 2. LIVE SIGHTINGS STREAM */}
          {activeTab === 'stream' && (
            recentSightings.length === 0 ? (
              <div style={{ color: '#8e9ab0', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
                Awaiting edge camera scans...
              </div>
            ) : (
              recentSightings.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => onSelectPlate && onSelectPlate(scan.plate)}
                  style={{
                    backgroundColor: '#1b2034',
                    border: '1px solid #28304c',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: onSelectPlate ? 'pointer' : 'default'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: scan.matched ? '#f05a3e' : '#ffffff', fontFamily: 'monospace' }}>
                      {scan.plate}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8e9ab0', marginTop: '2px' }}>
                      {scan.camera_id} • {scan.ts ? new Date(scan.ts).toLocaleTimeString() : 'Recent'}
                    </div>
                  </div>
                  {scan.matched ? (
                    <span style={{ fontSize: '9px', background: 'rgba(240, 90, 62, 0.2)', color: '#f05a3e', padding: '2px 6px', borderRadius: '3px', fontWeight: '700' }}>
                      MATCH
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '3px', fontWeight: '600' }}>
                      PASS
                    </span>
                  )}
                </div>
              ))
            )
          )}

          {/* 3. TARGET INTEL DOSSIER */}
          {activeTab === 'intel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#1b2034', border: '1px solid #28304c', borderRadius: '6px', overflow: 'hidden' }}>
                <input
                  type="text"
                  placeholder="PLATE (e.g. UP32AB1234)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#ffffff', padding: '9px 12px', fontSize: '11px', outline: 'none', fontFamily: 'monospace' }}
                />
                <button
                  type="submit"
                  style={{ background: '#28304c', border: 'none', padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Search size={14} color="#f59e0b" />
                </button>
              </form>

              {searchLoading ? (
                <div style={{ color: '#8e9ab0', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
                  Querying C4I database...
                </div>
              ) : !searchResult ? (
                <div style={{ color: '#8e9ab0', fontSize: '11px', textAlign: 'center', marginTop: '30px' }}>
                  <Search size={28} style={{ opacity: 0.4, margin: '0 auto 8px auto', display: 'block' }} />
                  Enter plate number above to load vehicle intelligence profile.
                </div>
              ) : (
                <div style={{ background: '#1b2034', borderRadius: '6px', border: '1px solid #28304c', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #28304c', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: '700', fontSize: '11px' }}>
                      <Car size={14} /> INTEL DOSSIER
                    </div>
                    <X size={14} style={{ cursor: 'pointer', color: '#8e9ab0' }} onClick={() => setSearchResult(null)} />
                  </div>

                  <h3 style={{ margin: '0 0 10px 0', color: '#ffffff', fontSize: '18px', fontFamily: 'monospace' }}>
                    {searchResult.plate}
                  </h3>

                  <div style={{ background: '#131726', padding: '10px', borderRadius: '4px', border: '1px solid #28304c', marginBottom: '12px', fontSize: '11px' }}>
                    <div style={{ color: '#8e9ab0' }}>Status:</div>
                    <div style={{ color: searchResult.isHotlist ? '#f05a3e' : '#10b981', fontWeight: '700', marginTop: '2px' }}>
                      {searchResult.isHotlist ? '● WANTED ON POLICE HOTLIST' : '● CLEAN REGISTRATION'}
                    </div>
                    <div style={{ color: '#8e9ab0', marginTop: '6px' }}>Crime / Reason:</div>
                    <div style={{ color: '#ffffff', marginTop: '2px' }}>
                      {searchResult.reason}
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: '#f59e0b', marginBottom: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
                    RECENT SIGHTINGS ({searchResult.history.length})
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {searchResult.history.length === 0 ? (
                      <div style={{ color: '#8e9ab0', fontSize: '10px' }}>No checkpoint recordings found.</div>
                    ) : (
                      searchResult.history.map((h, i) => (
                        <div key={i} style={{ background: '#131726', borderLeft: '3px solid #f59e0b', padding: '8px', borderRadius: '4px', marginBottom: '6px', fontSize: '10px' }}>
                          <div style={{ color: '#ffffff', fontWeight: '600' }}>Camera: {h.camera_id}</div>
                          <div style={{ color: '#8e9ab0', marginTop: '2px' }}>Time: {h.ts || 'Recent'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </aside>
  );
}
