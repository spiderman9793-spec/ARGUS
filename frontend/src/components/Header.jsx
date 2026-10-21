import React from 'react';
import { Menu, ChevronDown, Bell, Radio } from 'lucide-react';

export default function Header({
  wsStatus = 'connected',
  alertCount = 0,
  isSidebarVisible = true,
  onToggleSidebar,
  onOpenEvents,
  onOpenDevices,
  onGoToLanding
}) {
  // Format current date e.g. "19 Oct 2026"
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="app-header" style={{
      height: '56px',
      backgroundColor: '#1b2034',
      borderBottom: '1px solid #28304c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      fontFamily: "'Inter', sans-serif",
      userSelect: 'none',
      flexShrink: 0
    }}>
      
      {/* LEFT: BRAND LOGO & BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* LOGO (CLICK TO RETURN TO LANDING PAGE) */}
        <div 
          onClick={onGoToLanding} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onGoToLanding ? 'pointer' : 'default' }}
          title={onGoToLanding ? "Back to Landing Page" : ""}
        >
          <div style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '0.8px',
            fontFamily: "'Inter', Georgia, serif"
          }}>
            ARGUS<span style={{ color: '#f59e0b' }}>.</span>
          </div>
        </div>

        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #28304c',
              borderRadius: '20px',
              color: '#f59e0b',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
          >
            ← Landing Page
          </button>
        )}

        {/* MENU TOGGLE & SECTION DROPDOWN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', color: '#cbd5e1' }}>
          <button
            type="button"
            className="header-menu-button"
            aria-label={isSidebarVisible ? 'Hide navigation menu' : 'Show navigation menu'}
            aria-expanded={isSidebarVisible}
            onClick={onToggleSidebar}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#8e9ab0', fontSize: '12px', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
          >
            <Menu size={15} />
            <span>Menu</span>
          </button>

          <button
            type="button"
            className="header-section-button"
            onClick={onOpenDevices}
            aria-label="Open video surveillance devices"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500', color: '#ffffff', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
          >
            <span>Video Surveillance</span>
            <ChevronDown size={14} color="#8e9ab0" />
          </button>

          {/* DATE PILL */}
          <div className="header-date-pill" style={{
            backgroundColor: '#ffffff',
            color: '#1b2034',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 14px',
            borderRadius: '9999px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            letterSpacing: '0.3px'
          }}>
            {todayStr}
          </div>
        </div>

      </div>

      {/* RIGHT: SYSTEM STATUS, NOTIFICATIONS, USER PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* LIVE WS STATUS BADGE */}
        <div className="header-ws-status" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#141828',
          border: '1px solid #28304c',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          color: '#8e9ab0'
        }}>
          <Radio size={12} color={wsStatus === 'connected' ? '#10b981' : '#f05a3e'} />
          <span style={{ color: wsStatus === 'connected' ? '#10b981' : '#f05a3e', fontWeight: '600', textTransform: 'uppercase' }}>
            {wsStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* NOTIFICATION BELL WITH BADGE */}
        <button
          type="button"
          onClick={onOpenEvents}
          aria-label={`Open events${alertCount > 0 ? `, ${alertCount} alerts` : ''}`}
          title="Open events"
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0 }}
        >
          <Bell size={18} color="#cbd5e1" />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              backgroundColor: '#f05a3e',
              borderRadius: '50%',
              border: '2px solid #1b2034'
            }} />
          )}
        </button>

        {/* USER PROFILE */}
        <div className="header-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-profile-details" style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>ARGUS Operator</div>
            <div style={{ fontSize: '10px', color: '#8e9ab0' }}>Operations console</div>
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            border: '2px solid #3b4564',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1b2034',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            AO
          </div>
        </div>

      </div>

    </header>
  );
}