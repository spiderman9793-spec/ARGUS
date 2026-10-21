import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, FileText, Download, CheckCircle, Eye, X } from 'lucide-react';

export default function DossierTable() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHotlistData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/hotlist');
        const responseBody = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(responseBody?.detail || `Request failed (${res.status}).`);
        }
        if (!Array.isArray(responseBody)) {
          throw new Error('The hotlist API returned an invalid response.');
        }
        if (isMounted) {
          setWatchlist(responseBody);
          setLoadError('');
        }
      } catch (err) {
        if (isMounted) setLoadError(`Could not load the hotlist: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHotlistData();
    const interval = setInterval(fetchHotlistData, 4000);
    window.addEventListener('hotlist-updated', fetchHotlistData);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('hotlist-updated', fetchHotlistData);
    };
  }, []);

  const toggleStatus = async (item) => {
    setUpdatingId(item.id);
    setActionError('');
    try {
      const res = await fetch('http://localhost:8000/api/hotlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: item.plate, reason: item.reason, active: !item.active })
      });
      const responseBody = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(responseBody?.detail || `Request failed (${res.status}).`);
      }
      window.dispatchEvent(new Event('hotlist-updated'));
    } catch (err) {
      setActionError(`Could not update ${item.plate}: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadDossier = (row) => {
    const escapeHtml = (value) => String(value || 'Not provided')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
    const fields = [
      ['License plate', row.plate],
      ['FIR / case number', row.fir_no],
      ['Crime category / reason', row.reason],
      ['Police station', row.police_station],
      ['District', row.district],
      ['Investigating officer', row.io_name],
      ['Officer contact', row.io_contact],
      ['Registered at', row.added_at],
      ['Hotlist status', row.active ? 'Active' : 'Inactive'],
      ['FIR attachment', row.fir_file_name || 'No attachment']
    ];
    const content = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Case dossier - ${escapeHtml(row.plate)}</title>
  <style>body{font:14px system-ui,sans-serif;max-width:850px;margin:40px auto;padding:0 24px;color:#172033}h1{font-size:22px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left}th{width:32%;background:#f1f5f9}</style>
</head>
<body>
  <h1>Hotlist case dossier</h1>
  <table><tbody>${fields.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody></table>
</body>
</html>`;
    const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    const safePlate = String(row.plate || 'dossier').replace(/[^a-z0-9_-]/gi, '_');
    link.href = blobUrl;
    link.download = `case-dossier-${safePlate}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div style={{
      backgroundColor: '#1b2034',
      border: '1px solid #28304c',
      borderRadius: '8px',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
      flex: 1,
      overflowY: 'auto',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
    }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '700' }}>
          <Database size={17} color="#f59e0b" /> HOTLIST & CASE REGISTRY
        </div>
        <div style={{ fontSize: '11px', color: '#f05a3e', fontWeight: '700', backgroundColor: 'rgba(240, 90, 62, 0.15)', border: '1px solid #f05a3e', padding: '3px 10px', borderRadius: '12px' }}>
          {watchlist.filter((item) => item.active).length} ACTIVE TARGETS
        </div>
      </div>
      {loadError && (
        <div role="alert" style={{ marginBottom: '12px', color: '#fca5a5', fontSize: '12px' }}>
          {loadError}
        </div>
      )}
      {actionError && (
        <div role="alert" style={{ marginBottom: '12px', color: '#fca5a5', fontSize: '12px' }}>
          {actionError}
        </div>
      )}

      {/* WATCHLIST TABLE */}
      <div className="dossier-table-scroll">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#131726', color: '#8e9ab0', borderBottom: '1px solid #28304c' }}>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>#</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>TARGET PLATE</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>CASE / FIR NO.</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>JURISDICTION & IO</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>TIMESTAMP</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>STATUS</th>
            <th style={{ padding: '12px 14px', fontWeight: '600' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" style={{ padding: '24px', color: '#8e9ab0', textAlign: 'center' }}>Loading hotlist...</td></tr>
          ) : watchlist.length === 0 && !loadError ? (
            <tr><td colSpan="7" style={{ padding: '24px', color: '#8e9ab0', textAlign: 'center' }}>No hotlist targets have been registered.</td></tr>
          ) : watchlist.map((row, idx) => {
            const isActive = Boolean(row.active);
            return (
              <tr key={row.id} style={{ borderBottom: '1px solid #242c44', backgroundColor: idx % 2 === 0 ? '#1b2034' : '#1f253c' }}>
                <td style={{ padding: '12px 14px', color: '#8e9ab0' }}>{idx + 1}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px' }}>{row.plate}</div>
                  <div style={{ fontSize: '11px', color: '#f59e0b' }}>{row.reason || 'Not provided'}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#cbd5e1', fontWeight: '600' }}>{row.fir_no || 'Not provided'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ color: '#ffffff' }}>{[row.police_station, row.district].filter(Boolean).join(', ') || 'Not provided'}</div>
                  <div style={{ fontSize: '10px', color: '#8e9ab0' }}>
                    IO: {[row.io_name, row.io_contact].filter(Boolean).join(' • ') || 'Not provided'}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: '#8e9ab0', fontSize: '11px' }}>{row.added_at || 'Not provided'}</td>
                
                {/* STATUS TOGGLE */}
                <td style={{ padding: '12px 14px' }}>
                  <button 
                    type="button"
                    disabled={updatingId === row.id}
                    onClick={() => toggleStatus(row)}
                    style={{ 
                      backgroundColor: isActive ? 'rgba(240, 90, 62, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                      color: isActive ? '#f05a3e' : '#10b981', 
                      border: isActive ? '1px solid #f05a3e' : '1px solid #10b981', 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      cursor: updatingId === row.id ? 'wait' : 'pointer',
                      opacity: updatingId === row.id ? 0.65 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {isActive ? <AlertTriangle size={13} /> : <CheckCircle size={13} />}
                    {updatingId === row.id ? 'UPDATING...' : isActive ? 'ACTIVE HOTLIST' : 'INACTIVE'}
                  </button>
                </td>

                {/* ACTIONS */}
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => setPreviewDoc(row)}
                      style={{ backgroundColor: '#131726', border: '1px solid #3b4564', color: '#cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                    >
                      <Eye size={12} color="#f59e0b" /> DETAILS
                    </button>

                    <button 
                      type="button"
                      onClick={() => downloadDossier(row)}
                      style={{ backgroundColor: '#131726', border: '1px solid #3b4564', color: '#cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}
                    >
                      <Download size={12} color="#10b981" /> EXPORT HTML
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* FIR DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="dossier-modal-backdrop">
          <div className="dossier-modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #28304c', paddingBottom: '12px' }}>
              <div style={{ color: '#f59e0b', fontWeight: '800', fontSize: '14px' }}>
                CASE DOSSIER DETAILS
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', color: '#f05a3e', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#131726', border: '1px dashed #28304c', padding: '18px', borderRadius: '6px', color: '#cbd5e1', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong style={{ color: '#ffffff' }}>FIR No:</strong> {previewDoc.fir_no || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>Target Vehicle:</strong> {previewDoc.plate}</div>
              <div><strong style={{ color: '#ffffff' }}>Police Station:</strong> {previewDoc.police_station || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>District:</strong> {previewDoc.district || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>Investigating Officer:</strong> {previewDoc.io_name || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>IO Contact:</strong> {previewDoc.io_contact || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>Reason:</strong> {previewDoc.reason || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>Registered:</strong> {previewDoc.added_at || 'Not provided'}</div>
              <div><strong style={{ color: '#ffffff' }}>Hotlist status:</strong> {previewDoc.active ? 'Active' : 'Inactive'}</div>
              <div style={{ marginTop: '10px', borderTop: '1px dashed #28304c', paddingTop: '10px', color: '#8e9ab0' }}>
                {previewDoc.fir_file_name ? (
                  <a
                    href={`http://localhost:8000/api/hotlist/${previewDoc.id}/fir`}
                    style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={14} /> Download attached file: {previewDoc.fir_file_name}
                  </a>
                ) : (
                  'No FIR attachment has been saved for this case.'
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}