import { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Gamepad2,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Activity,
  Radio,
  Bell,
  ChevronDown,
  ChevronUp,
  Home
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import SearchModal from './SearchModal';
import { useBroadcastingStatus } from '../../hooks/useFirebase';

/**
 * AdminLayout - Modern sidebar layout for admin pages
 * Features:
 * - Collapsible sidebar with smooth animations
 * - SVG icons (Lucide)
 * - Hover effects and tooltips
 * - Notification bell
 * - Command palette search (Cmd+K)
 * - Mobile responsive
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Firebase broadcasting status
  const { isReady: fbIsReady } = useBroadcastingStatus();

  // Menu items with Lucide icons
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/schedules', label: 'Jadwal Stream', icon: Calendar },
    { path: '/admin/voting', label: 'Game Voting', icon: Gamepad2 },
    { path: '/admin/content', label: 'Content Guide', icon: BookOpen },
  ];

  // Bottom menu items
  const bottomMenuItems = [
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Get current page name
  const getCurrentPageName = () => {
    const currentItem = menuItems.find(item => location.pathname === item.path);
    if (currentItem) return currentItem.label;
    if (location.pathname.includes('settings')) return 'Settings';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ========== MOBILE OVERLAY ========== */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
          fixed lg:relative left-0 top-0 h-screen
          bg-gradient-to-b from-bg-card to-bg-base
          border-r border-border-subtle
          flex flex-col
          transition-all duration-300 ease-out
          z-50
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-cyan/20">
              <span className="text-bg-base font-bold text-lg">XV</span>
            </div>

            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-text-primary tracking-tight">X-VOCA</h1>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                  </span>
                  <span className="text-[10px] font-mono text-accent-cyan tracking-wider">CREATOR OPS</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Area */}
        <div className="p-3 border-b border-border-subtle">
          <button
            onClick={() => !sidebarCollapsed && setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`
              w-full flex items-center gap-3 p-2 rounded-xl
              transition-colors duration-200
              ${!sidebarCollapsed ? 'hover:bg-bg-input' : ''}
              ${isProfileDropdownOpen ? 'bg-bg-input' : ''}
            `}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/40 to-accent-purple/20 flex items-center justify-center flex-shrink-0 border border-accent-purple/30">
              <span className="text-sm font-semibold text-accent-purple">
                {user?.name?.charAt(0) || 'X'}
              </span>
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.name || 'Xion Regalia'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  <span className="text-[10px] font-mono text-text-muted">ONLINE</span>
                </div>
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {!sidebarCollapsed && isProfileDropdownOpen && (
            <div className="mt-2 p-2 bg-bg-input rounded-xl space-y-1 animate-fade-in">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-status-live hover:bg-status-live/10 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>

        {/* Menu Section Label */}
        {!sidebarCollapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Menu Utama</p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-hide">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200
                  group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-accent-cyan/15 to-transparent text-accent-cyan border-l-2 border-accent-cyan shadow-lg shadow-accent-cyan/5'
                    : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-accent-cyan' : ''}`} />

                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-bg-card"></div>
                      </div>
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-border-subtle p-3 space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Sistem</p>
            </div>
          )}

          {bottomMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-text-secondary hover:bg-bg-card-hover hover:text-text-primary
                transition-all duration-200
                group relative
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-bg-card"></div>
                </div>
              )}
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-status-live hover:bg-status-live/10
              transition-all duration-200
              group relative
            "
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Keluar</span>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-primary whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
                Keluar
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-bg-card"></div>
              </div>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-bg-card-hover hover:text-text-secondary transition-all duration-200 mt-2"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ========== TOPBAR ========== */}
        <header className="sticky top-0 z-30 h-16 bg-bg-nav/95 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 lg:px-6">
          {/* Left - Mobile Menu + Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-text-muted" />
              <span className="text-text-muted">/</span>
              <span className="text-text-primary font-medium">{getCurrentPageName()}</span>
            </div>

            {/* Sync Status Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-card border border-border-subtle">
              <Activity className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="text-[10px] font-mono text-text-muted">NODE 01</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
              </span>
            </div>
          </div>

          {/* Center - Search */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex flex-1 max-w-md mx-4 items-center gap-3 px-4 py-2 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-muted hover:border-border-active hover:text-text-secondary transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-bg-input border border-border-subtle rounded">Cmd</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-bg-input border border-border-subtle rounded">K</kbd>
            </div>
          </button>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Broadcasting Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border-subtle rounded-full">
              <Radio className={`w-4 h-4 ${fbIsReady ? 'text-accent-cyan' : 'text-text-muted'}`} />
              <span className={`text-xs font-medium ${fbIsReady ? 'text-accent-cyan' : 'text-text-muted'}`}>
                {fbIsReady ? 'READY' : 'OFFLINE'}
              </span>
              <span className={`w-2 h-2 rounded-full ${fbIsReady ? 'bg-accent-cyan animate-pulse' : 'bg-text-muted'}`} />
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple/40 to-accent-purple/20 flex items-center justify-center border border-accent-purple/30">
              <span className="text-sm font-semibold text-accent-purple">
                {user?.name?.charAt(0) || 'X'}
              </span>
            </div>
          </div>
        </header>

        {/* ========== CONTENT AREA ========== */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* ========== SEARCH MODAL ========== */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}

export default AdminLayout;
