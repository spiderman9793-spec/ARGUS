import React from 'react';
import { AlertTriangle, Radio } from 'lucide-react';

export default function EventsView({ alerts = [] }) {
  return (
    <section style={{
      flex: 1,
      minWidth: 0,
      padding: '20px',
      overflow: 'auto',
      backgroundColor: '#131726',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif"
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          LIVE ALERT EVENTS
        </div>
        <div style={{ color: '#8e9ab0', fontSize: '11px' }}>
          {alerts.length} {alerts.length === 1 ? 'event' : 'events'}
        </div>
      </header>

      <div style={{
        backgroundColor: '#1b2034',
        border: '1px solid #28304c',
        borderRadius: '8px',
        overflow: 'auto'
      }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '32px 20px', color: '#8e9ab0', fontSize: '12px', textAlign: 'center' }}>
            No alert events have been recorded.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#171c2e', color: '#8e9ab0' }}>
                {['PLATE', 'REASON', 'CAMERA', 'TIMESTAMP', 'STATUS'].map((heading) => (
                  <th key={heading} scope="col" style={{ padding: '12px 14px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={alert.id ?? `${alert.plate}-${alert.timestamp ?? alert.created_at ?? index}`} style={{
                  borderTop: '1px solid #28304c',
                  backgroundColor: index % 2 === 0 ? '#1b2034' : '#1f253c'
                }}>
                  <td style={{ padding: '12px 14px', color: '#ffffff', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {alert.plate || 'Unknown plate'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                    {alert.reason || 'Hotlist match'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                    {alert.camera_name || alert.camera_id || 'Unknown camera'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#8e9ab0', whiteSpace: 'nowrap' }}>
                    {alert.created_at || alert.timestamp || '—'}
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: alert.acked ? '#8e9ab0' : '#f05a3e',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}>
                      <Radio size={12} />
                      {alert.acked ? 'ACKNOWLEDGED' : 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
