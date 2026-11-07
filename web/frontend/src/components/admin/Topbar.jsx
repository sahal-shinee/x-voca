import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Home,
  Radio,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { useBroadcastingStatus } from '../../hooks/useFirebase';
import { useAuth } from '../../context/AuthContext';

/**
 * Topbar Component
 * Simplified, clean redesign consistent with the new Sidebar and Theme system
 */
export function Topbar({ isMobileMenuOpen, onToggleMobileMenu, onOpenSearch }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isReady: fbIsReady } = useBroadcastingStatus();

  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const avatarDropdownRef = useRef(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target)) {
        setIsAvatarDropdownOpen(false);
      }
    };
    if (isAvatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAvatarDropdownOpen]);

  // Page title mapping
  const pageNames = {
    '/admin/dashboard': 'Dashboard',
    '/admin/schedules': 'Jadwal Stream',
    '/admin/voting': 'Game Voting',
    '/admin/collab-requests': 'Collab Requests',
    '/admin/content': 'Content Guide',
    '/admin/todos': 'Todo List',
    '/admin/settings': 'Settings',
  };

  const currentPage = pageNames[location.pathname] || 'Dashboard';
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'X';
  const userName = user?.name || 'Xion Regalia';
  const userEmail = user?.email || 'creator@x-voca.space';

  return (
    <header className="
      sticky top-0 z-30 h-16
      bg-bg-nav/95 backdrop-blur-md
      border-b border-border-subtle
      flex items-center justify-between
      px-4 lg:px-6
    ">
      {/* ── LEFT: Mobile Menu + Breadcrumb ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-xl transition-colors"
          aria-label="Toggle menu navigasi"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-mono">ADMIN</span>
          </Link>
          <span className="text-text-muted/60 text-xs font-mono">/</span>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            {currentPage}
          </span>
        </div>

        {/* Sync Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-bg-surface border border-border-subtle">
          <Activity className="w-3 h-3 text-accent-cyan" />
          <span className="text-[10px] font-mono text-text-muted">SYNC</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
        </div>
      </div>

      {/* ── CENTER: Quick Search Bar ── */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="
          hidden sm:flex flex-1 max-w-sm mx-4
          items-center gap-2.5 px-3.5 py-2
          bg-bg-surface border border-border-subtle rounded-xl
          text-text-muted text-xs
          hover:border-accent-cyan/40 hover:text-text-secondary
          transition-all duration-150 shadow-sm group
        "
      >
        <Search className="w-4 h-4 flex-shrink-0 text-text-muted group-hover:text-accent-cyan transition-colors" />
        <span className="flex-1 text-left truncate">Cari jadwal, game, request...</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-card border border-border-subtle rounded text-text-muted">
            Ctrl
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-card border border-border-subtle rounded text-text-muted">
            K
          </kbd>
        </div>
      </button>

      {/* ── RIGHT: Broadcasting status + Notification + Avatar Dropdown ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Broadcasting Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-border-subtle">
          <Radio className={`w-3.5 h-3.5 ${fbIsReady ? 'text-accent-cyan' : 'text-text-muted'}`} />
          <span className={`text-[11px] font-mono font-medium ${fbIsReady ? 'text-accent-cyan' : 'text-text-muted'}`}>
            {fbIsReady ? 'LIVE READY' : 'OFFLINE'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              fbIsReady ? 'bg-accent-cyan animate-pulse' : 'bg-text-muted'
            }`}
          />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Toggle in Topbar */}
        <ThemeToggle />

        {/* User Avatar Dropdown */}
        <div className="relative" ref={avatarDropdownRef}>
          <button
            type="button"
            onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-bg-surface transition-colors focus:outline-none"
            aria-label="Menu profil"
          >
            <div className="w-8 h-8 rounded-lg bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold font-mono text-accent-purple">
                {userInitial}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${isAvatarDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isAvatarDropdownOpen && (
            <div className="
              absolute right-0 top-full mt-2 w-56
              bg-bg-card border border-border-subtle rounded-2xl
              shadow-[0_20px_50px_rgba(0,0,0,0.35)]
              p-1.5 z-50 animate-scale-in
            ">
              {/* User Info Header */}
              <div className="px-3 py-2.5 border-b border-border-subtle/70">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {userName}
                </p>
                <p className="text-[11px] font-mono text-text-muted truncate mt-0.5">
                  {userEmail}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-accent-cyan/10 text-accent-cyan text-[10px] font-mono font-semibold">
                  {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                </span>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsAvatarDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-text-muted" />
                  <span>Pengaturan</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-status-live hover:bg-status-live/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
