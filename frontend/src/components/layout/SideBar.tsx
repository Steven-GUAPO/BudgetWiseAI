import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { path: '/activity',  label: 'Activity',   icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
  { path: '/budgets',   label: 'Budgets',    icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
  { path: '/goals',     label: 'Goals',      icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )},
  { path: '/rewards',   label: 'Rewards',    icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )},
  { path: '/settings',  label: 'Settings',   icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )},
  { path: '/ai-assistant',     label: 'AI Assistant',    icon: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
  </svg>
)},
{ path: '/spending-outlook', label: 'Spending Outlook', icon: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)},
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const width = collapsed ? '68px' : '240px';

  return (
    <aside style={{
      width,
      minHeight: '100vh',
      backgroundColor: '#0a110e',
      borderRight: '1px solid rgba(52, 211, 153, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>

      {/* Logo + collapse toggle */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '72px',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '32px', height: '32px', flexShrink: 0,
              background: 'linear-gradient(135deg, #059669, #34d399)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: '800', color: '#fff',
            }}>B</div>
            <span style={{
              color: '#f0fdf4',
              fontSize: '16px',
              fontWeight: '700',
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap',
            }}>BudgetWise</span>
          </div>
        )}

        {collapsed && (
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '800', color: '#fff',
            flexShrink: 0,
          }}>B</div>
        )}

        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4b7a64', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#34d399')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4b7a64')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          title="Expand sidebar"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4b7a64', padding: '10px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#34d399')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4b7a64')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* User info */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', flexShrink: 0,
              background: 'linear-gradient(135deg, #065f46, #059669)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: '#d1fae5',
            }}>
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{ color: '#4b7a64', fontSize: '11px', margin: '1px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{user?.username}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed avatar */}
      {collapsed && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '12px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #065f46, #059669)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: '#d1fae5',
          }}>
            {user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? '0' : '10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px 0' : '10px 12px',
                marginBottom: '2px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive
                  ? 'rgba(52, 211, 153, 0.12)'
                  : 'transparent',
                color: isActive ? '#34d399' : '#4b7a64',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(52,211,153,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#86efac';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#4b7a64';
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '20%', bottom: '20%',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  backgroundColor: '#34d399',
                }} />
              )}
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 10px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            width: '100%',
            padding: collapsed ? '11px 0' : '10px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#4b7a64',
            fontSize: '13px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? '0' : '10px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#4b7a64';
          }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;