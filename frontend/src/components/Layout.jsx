import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

/**
 * Authenticated application shell — Sidebar + Topbar + Content.
 * Wraps all protected routes via <Outlet />.
 */
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        sidebarCollapsed={collapsed}
        onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
      />
      <main className={`layout-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="layout-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
