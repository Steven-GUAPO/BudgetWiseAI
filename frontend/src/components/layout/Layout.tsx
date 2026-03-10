import React, { useState } from 'react';
import Sidebar from './SideBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a110e' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main style={{
        marginLeft: collapsed ? '68px' : '240px',
        flex: 1,
        padding: '32px',
        minHeight: '100vh',
        overflowY: 'auto',
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;