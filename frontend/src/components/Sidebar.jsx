import React from 'react';
import { Home, Monitor, Shield, AlertTriangle, FileText, Users } from 'lucide-react';

export default function Sidebar({ activeTab = 'dashboard', setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'events', label: 'Events', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  return (
    <aside className="app-sidebar" style={{
      width: '180px',
      backgroundColor: '#1b2034',
      borderRight: '1px solid #28304c',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 0',
      userSelect: 'none',
      flexShrink: 0
    }}>
      
      {/* TOP NAVIGATION LINKS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 18px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isActive ? '#f59e0b' : '#8e9ab0',
                fontSize: '12px',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                transition: 'all 0.15s ease',
                width: '100%',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#8e9ab0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={16} color={isActive ? '#f59e0b' : '#8e9ab0'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONSOLE LABEL */}
      <div style={{ padding: '8px 18px', color: '#8e9ab0', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        <span>Operations console</span>
      </div>

    </aside>
  );
}
