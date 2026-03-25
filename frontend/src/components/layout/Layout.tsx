import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './SideBar';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const ICONS: Record<string, string> = {
  success: '✅',
  warning: '⚠️',
  info: '💡',
  error: '❌',
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { notifications, unreadCount, addToast, markAllRead, clearNotifications } = useNotifications();
  const bellRef = useRef<HTMLDivElement>(null);
  const syncedRef = useRef(false);

  // Single sync on mount across all pages
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    api.post('/bank/sync').then(res => {
      if (res.data.toasts) {
        res.data.toasts.forEach((t: any) => addToast(t));
      }
    }).catch(() => {});
  }, []);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBellClick = () => {
    setBellOpen(prev => !prev);
    if (!bellOpen) markAllRead();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a110e' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{
        marginLeft: collapsed ? '68px' : '240px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Top bar with bell */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          backgroundColor: '#0a110e',
          zIndex: 50,
        }}>
          {/* Bell icon */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              onClick={handleBellClick}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '7px',
                cursor: 'pointer',
                color: unreadCount > 0 ? '#34d399' : '#4b7a64',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px', right: '-4px',
                  width: '16px', height: '16px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  fontSize: '9px', fontWeight: '700',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0a110e',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {bellOpen && (
              <div style={{
                position: 'absolute',
                top: '44px', right: 0,
                width: '340px',
                backgroundColor: '#0c1a0f',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: '12px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                zIndex: 200,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '600' }}>
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      style={{
                        background: 'none', border: 'none',
                        color: '#4b7a64', fontSize: '11px',
                        cursor: 'pointer', padding: 0,
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
                      <p style={{ color: '#4b7a64', fontSize: '13px', margin: 0 }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        backgroundColor: n.read ? 'transparent' : 'rgba(52,211,153,0.03)',
                        transition: 'background 0.15s',
                      }}>
                        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
                          {ICONS[n.type]}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#f0fdf4', fontSize: '12px', fontWeight: '600', margin: '0 0 2px 0' }}>
                            {n.title}
                          </p>
                          <p style={{ color: '#4b7a64', fontSize: '11px', margin: '0 0 4px 0', lineHeight: '1.5' }}>
                            {n.message}
                          </p>
                          <p style={{ color: '#2d4a38', fontSize: '10px', margin: 0 }}>
                            {n.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
