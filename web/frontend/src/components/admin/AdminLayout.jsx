import { useState } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLayout - Layout utama untuk halaman admin
 * Terdiri dari sidebar kiri (200px) + topbar (56px) + konten area
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Menu items
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/schedules', label: 'Jadwal Stream', icon: '📅' },
    { path: '/admin/voting', label: 'Game Voting', icon: '🎮' },
    { path: '/admin/content', label: 'Content Guide', icon: '📖' },
  ];

  // Bottom menu items
  const bottomMenuItems = [
    { path: '#', label: 'Settings', icon: '⚙' },
    { action: 'logout', label: 'Keluar', icon: '↩', danger: true },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
          fixed left-0 top-0 h-screen
          bg-gradient-sidebar border-r border-border-subtle
          flex flex-col
          transition-all duration-300
          z-40
          ${sidebarCollapsed ? 'w-16' : 'w-[200px]'}
        `}
      >
        {/* Logo Area */}
        <div className="p-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center flex-shrink-0">
              <span className="text-bg-base font-bold text-sm">XV</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-bold text-text-primary">X-VOCA PRO</h1>
                <span className="text-[10px] font-mono text-accent-cyan">● CREATOR OPS</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Area */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-accent-purple/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">{user?.name?.charAt(0) || 'X'}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.name || 'Xion Regalia'}
                </p>
                <span className="text-[10px] font-mono text-accent-cyan">● ONLINE</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-bg-nav-active text-text-primary border-l-2 border-accent-cyan'
                  : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                }
              `}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-border-subtle py-3">
          {bottomMenuItems.map((item, index) => (
            item.action === 'logout' ? (
              <button
                key={index}
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-status-live hover:bg-status-live/10 transition-colors"
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors"
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            )
          ))}
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div
        className={`
          flex-1 flex flex-col
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-16' : 'ml-[200px]'}
        `}
      >
        {/* ========== TOPBAR ========== */}
        <header className="fixed top-0 right-0 h-14 bg-bg-nav border-b border-border-subtle z-30 flex items-center justify-between px-6"
          style={{ left: sidebarCollapsed ? '64px' : '200px' }}
        >
          {/* Left - Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">CONSOLE</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary font-medium">SESSION LIVE</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-card text-accent-cyan text-xs font-mono ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
              NODE 01 SYNCED
            </span>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Quick search... ⌘K"
                className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-subtle rounded-full text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right - Avatar & Toggle */}
          <div className="flex items-center gap-4">
            {/* Bell Icon */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-live"></span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-purple/30 flex items-center justify-center">
                <span className="text-sm font-semibold">{user?.name?.charAt(0) || 'X'}</span>
              </div>
              <span className="text-sm text-text-primary">Xion R.</span>
            </div>

            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* ========== CONTENT AREA ========== */}
        <main className="flex-1 pt-14 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
