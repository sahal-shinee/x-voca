import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
  LayoutDashboard,
  Calendar,
  Gamepad2,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from 'lucide-react';

/**
 * Modern Studio Command Deck Sidebar
 * Redesigned for high interactivity, tactile micro-animations,
 * and zero AI-slop template cliches.
 */
export function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { stats } = useDashboardStats();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'X';
  const userName = user?.name || 'Xion Regalia';
  const userRole = user?.role ? user.role.toUpperCase() : 'CREATOR OPS';

  // Hotkey listener: [ or Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input, textarea or select
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) ||
        e.target?.isContentEditable
      ) {
        return;
      }

      // Hotkey: Ctrl+B or Cmd+B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleCollapse?.();
      }
      // Hotkey: '[' key when no modifier is pressed
      else if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onToggleCollapse?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/schedules',
      label: 'Jadwal Stream',
      icon: Calendar,
      badge: stats?.upcomingSchedules > 0 ? stats.upcomingSchedules : null,
      badgeType: 'cyan',
    },
    {
      path: '/admin/voting',
      label: 'Game Voting',
      icon: Gamepad2,
      isLive: true,
    },
    {
      path: '/admin/collab-requests',
      label: 'Collab Requests',
      icon: Users,
    },
    {
      path: '/admin/content',
      label: 'Content Guide',
      icon: BookOpen,
    },
    {
      path: '/admin/todos',
      label: 'Todo List',
      icon: CheckSquare,
      badge: stats?.pendingTodos > 0 ? stats.pendingTodos : null,
      badgeType: 'purple',
    },
  ];

  const NavItem = ({ path, label, icon: Icon, badge, badgeType, isLive }) => (
    <NavLink
      to={path}
      onClick={onCloseMobile}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `
        group relative flex items-center
        ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2 gap-3'}
        rounded-xl text-sm font-medium
        transition-all duration-200 ease-out select-none
        ${
          isActive
            ? 'text-accent-cyan font-semibold bg-gradient-to-r from-accent-cyan/15 via-accent-cyan/8 to-transparent border border-accent-cyan/25 shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Active Glowing Notch Indicator */}
          {isActive && (
            <span
              className="
                absolute left-0 top-1/2 -translate-y-1/2
                w-1 h-5 rounded-r-full
                bg-accent-cyan shadow-[0_0_10px_rgba(94,234,212,0.9)]
                transition-all duration-300
              "
            />
          )}

          {/* Icon Container with Micro-Interactions */}
          <div
            className={`
              relative flex items-center justify-center flex-shrink-0
              w-7 h-7 rounded-lg transition-all duration-200
              group-hover:scale-110
              ${
                isActive
                  ? 'text-accent-cyan bg-accent-cyan/20 ring-1 ring-accent-cyan/40 shadow-inner'
                  : 'text-text-muted group-hover:text-text-primary group-hover:bg-bg-card'
              }
            `}
          >
            <Icon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-6" />

            {/* Live Indicator Dot on Icon when Collapsed */}
            {isLive && collapsed && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-live" />
              </span>
            )}

            {/* Number Dot Badge when Collapsed */}
            {badge && collapsed && (
              <span
                className={`
                  absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
                  text-[9px] font-mono font-bold flex items-center justify-center text-white
                  ${badgeType === 'purple' ? 'bg-accent-purple shadow-sm' : 'bg-accent-cyan text-bg-base shadow-sm'}
                `}
              >
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>

          {/* Expanded Label & Badges */}
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0 transition-transform duration-200 group-hover:translate-x-0.5">
              <span className="truncate leading-none pt-0.5 tracking-tight">
                {label}
              </span>

              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                {isLive && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-status-live/15 text-status-live border border-status-live/30 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
                    LIVE
                  </span>
                )}

                {badge && (
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold min-w-[20px] text-center
                      ${
                        badgeType === 'purple'
                          ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                          : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                      }
                    `}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Floating Glassmorphic Tooltip (Collapsed Mode) */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-3 py-1.5
              bg-bg-card/95 backdrop-blur-md border border-border-subtle
              rounded-xl text-xs font-medium text-text-primary
              whitespace-nowrap opacity-0 invisible -translate-x-2
              group-hover:opacity-100 group-hover:visible group-hover:translate-x-0
              transition-all duration-200 z-50 shadow-2xl pointer-events-none
              flex items-center gap-2
            ">
              <span className="font-medium">{label}</span>
              {isLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-status-live/15 text-status-live border border-status-live/30">
                  <span className="w-1 h-1 rounded-full bg-status-live animate-pulse" />
                  LIVE
                </span>
              )}
              {badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    badgeType === 'purple'
                      ? 'bg-accent-purple/20 text-accent-purple'
                      : 'bg-accent-cyan/20 text-accent-cyan'
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={`
        fixed lg:relative left-0 top-0 h-screen
        bg-bg-nav border-r border-border-subtle
        flex flex-col
        transition-all duration-300 ease-in-out
        z-50 select-none
        ${collapsed ? 'w-[76px]' : 'w-[264px]'}
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* ── 1. LOGO & BRAND DECK ── */}
      <div
        className={`
          h-16 flex items-center px-3.5
          border-b border-border-subtle/80
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}
      >
        <Link
          to="/admin/dashboard"
          onClick={onCloseMobile}
          title={collapsed ? 'X-VOCA Studio Dashboard' : undefined}
          className="group flex items-center gap-3 min-w-0"
        >
          {/* Logo Monogram Badge */}
          <div className="relative flex-shrink-0">
            <div className="
              w-9 h-9 rounded-xl
              bg-gradient-to-br from-accent-cyan/20 via-accent-purple/15 to-transparent
              border border-accent-cyan/40 flex items-center justify-center
              shadow-sm group-hover:shadow-[0_0_15px_rgba(94,234,212,0.35)]
              group-hover:border-accent-cyan
              transition-all duration-300
            ">
              <span className="text-xs font-bold font-mono bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                XV
              </span>
            </div>
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold font-display text-text-primary leading-tight tracking-tight group-hover:text-accent-cyan transition-colors">
                  X-VOCA
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-accent-purple/15 text-accent-purple border border-accent-purple/30 tracking-wider">
                  STUDIO
                </span>
              </div>

              {/* Dynamic Soundwave Visualizer Bars */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-end gap-[3px] h-3 px-1 py-0.5 rounded bg-bg-surface/80 border border-border-subtle/60">
                  <span className="w-[2.5px] h-1.5 bg-accent-cyan rounded-full animate-pulse" />
                  <span className="w-[2.5px] h-2.5 bg-accent-cyan rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-[2.5px] h-2 bg-accent-purple rounded-full animate-pulse [animation-delay:300ms]" />
                  <span className="w-[2.5px] h-1 bg-accent-purple rounded-full animate-pulse [animation-delay:450ms]" />
                </div>
                <span className="text-[9px] font-mono text-text-muted tracking-wider uppercase">
                  Deck Active
                </span>
              </div>
            </div>
          )}

          {/* Floating Tooltip in Collapsed State */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-3 py-1.5
              bg-bg-card/95 backdrop-blur-md border border-border-subtle
              rounded-xl text-xs font-semibold text-text-primary
              whitespace-nowrap opacity-0 invisible -translate-x-2
              group-hover:opacity-100 group-hover:visible group-hover:translate-x-0
              transition-all duration-200 z-50 shadow-2xl pointer-events-none
            ">
              X-VOCA Studio
            </div>
          )}
        </Link>
      </div>

      {/* ── 2. USER PROFILE DECK (Tactile Studio Identity) ── */}
      <div className="p-3">
        <Link
          to="/admin/settings"
          onClick={onCloseMobile}
          title={collapsed ? `${userName} (${userRole}) - Buka Pengaturan` : undefined}
          className={`
            relative group/user flex items-center gap-3 p-2 rounded-2xl
            bg-gradient-to-b from-bg-surface/90 to-bg-card/40
            border border-border-subtle/80 hover:border-accent-cyan/40
            hover:shadow-[0_4px_20px_-4px_rgba(94,234,212,0.15)]
            transition-all duration-200 cursor-pointer block
            ${collapsed ? 'p-1.5 justify-center' : ''}
          `}
        >
          {/* Avatar with Dual-Ring Gradient & Status Pulse */}
          <div className="relative flex-shrink-0">
            <div className="p-[1.5px] rounded-xl bg-gradient-to-tr from-accent-cyan via-accent-purple to-accent-cyan/40 shadow-sm group-hover/user:scale-105 transition-transform duration-200">
              <div className="w-8 h-8 rounded-[10px] bg-bg-surface flex items-center justify-center font-bold font-mono text-xs text-text-primary">
                {userInitial}
              </div>
            </div>
            {/* Live presence dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-done opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-done ring-2 ring-bg-nav" />
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-text-primary truncate group-hover/user:text-accent-cyan transition-colors">
                  {userName}
                </p>
                <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent-purple/15 text-accent-purple border border-accent-purple/30 uppercase flex-shrink-0">
                  {userRole}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-done flex-shrink-0 animate-pulse" />
                <span className="text-[10px] font-mono text-text-muted tracking-wide truncate">
                  STUDIO OPERATOR
                </span>
              </div>
            </div>
          )}

          {/* Floating Tooltip in Collapsed State */}
          {collapsed && (
            <div className="
              absolute left-full ml-3.5 px-3 py-2
              bg-bg-card/95 backdrop-blur-md border border-border-subtle
              rounded-xl text-xs text-text-primary
              whitespace-nowrap opacity-0 invisible -translate-x-2
              group-hover/user:opacity-100 group-hover/user:visible group-hover/user:translate-x-0
              transition-all duration-200 z-50 shadow-2xl pointer-events-none min-w-[150px]
            ">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-status-done" />
                <span className="font-semibold text-text-primary">{userName}</span>
              </div>
              <div className="text-[10px] font-mono text-text-muted flex items-center justify-between">
                <span>{userRole}</span>
                <span className="text-accent-cyan">Pengaturan ↗</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* ── 3. NAVIGATION MENU ── */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <div className="px-5 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
              Menu Studio
            </span>
            <span className="text-[9px] font-mono text-text-muted/60">
              v2.4
            </span>
          </div>
        )}

        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* ── 4. SYSTEM & UTILITY SECTION ── */}
      <div className="mt-auto border-t border-border-subtle/80 bg-bg-surface/15">
        {!collapsed && (
          <div className="px-5 pt-3 pb-1">
            <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
              Sistem & Akses
            </span>
          </div>
        )}

        <div className="space-y-1 py-1">
          {/* Settings NavLink */}
          <NavLink
            to="/admin/settings"
            onClick={onCloseMobile}
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) => `
              group relative flex items-center
              ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2 gap-3'}
              rounded-xl text-sm font-medium
              transition-all duration-200 ease-out select-none
              ${
                isActive
                  ? 'text-accent-cyan font-semibold bg-gradient-to-r from-accent-cyan/15 via-accent-cyan/8 to-transparent border border-accent-cyan/25 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="
                      absolute left-0 top-1/2 -translate-y-1/2
                      w-1 h-5 rounded-r-full
                      bg-accent-cyan shadow-[0_0_10px_rgba(94,234,212,0.9)]
                      transition-all duration-300
                    "
                  />
                )}
                <div
                  className={`
                    relative flex items-center justify-center flex-shrink-0
                    w-7 h-7 rounded-lg transition-all duration-200
                    group-hover:scale-110
                    ${
                      isActive
                        ? 'text-accent-cyan bg-accent-cyan/20 ring-1 ring-accent-cyan/40 shadow-inner'
                        : 'text-text-muted group-hover:text-text-primary group-hover:bg-bg-card'
                    }
                  `}
                >
                  <Settings className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0 transition-transform duration-200 group-hover:translate-x-0.5">
                    <span className="truncate leading-none pt-0.5 tracking-tight">Settings</span>
                    <span className="text-[10px] font-mono text-text-muted/60">Prefs</span>
                  </div>
                )}

                {collapsed && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5
                    bg-bg-card/95 backdrop-blur-md border border-border-subtle
                    rounded-xl text-xs font-medium text-text-primary
                    whitespace-nowrap opacity-0 invisible -translate-x-2
                    group-hover:opacity-100 group-hover:visible group-hover:translate-x-0
                    transition-all duration-200 z-50 shadow-2xl pointer-events-none
                  ">
                    Settings
                  </div>
                )}
              </>
            )}
          </NavLink>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Keluar' : undefined}
            className={`
              w-auto flex items-center rounded-xl text-sm font-medium
              ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2 gap-3'}
              text-text-muted hover:text-status-live hover:bg-status-live/10 hover:border-status-live/30
              border border-transparent transition-all duration-200 group relative select-none
            `}
          >
            <div className="
              relative flex items-center justify-center flex-shrink-0
              w-7 h-7 rounded-lg text-text-muted group-hover:text-status-live
              group-hover:bg-status-live/15 transition-all duration-200
            ">
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </div>

            {!collapsed && (
              <span className="text-sm truncate leading-none pt-0.5 transition-transform duration-200 group-hover:translate-x-0.5">
                Keluar
              </span>
            )}

            {collapsed && (
              <div className="
                absolute left-full ml-3 px-3 py-1.5
                bg-bg-card/95 backdrop-blur-md border border-status-live/30
                rounded-xl text-xs font-medium text-status-live
                whitespace-nowrap opacity-0 invisible -translate-x-2
                group-hover:opacity-100 group-hover:visible group-hover:translate-x-0
                transition-all duration-200 z-50 shadow-2xl pointer-events-none
              ">
                Keluar dari Sesi
              </div>
            )}
          </button>
        </div>

        {/* ── 5. MODERN COLLAPSE TRIGGER DOCK ── */}
        <div className="p-3 pt-2 border-t border-border-subtle/50">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas Sidebar ( [ )' : 'Perkecil Sidebar ( [ )'}
            className={`
              hidden lg:flex w-full items-center rounded-xl py-2 px-2.5
              text-text-muted hover:text-text-primary hover:bg-bg-surface
              border border-border-subtle/60 hover:border-border-subtle
              transition-all duration-200 group
              ${collapsed ? 'justify-center' : 'justify-between'}
            `}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-bg-surface/80 flex items-center justify-center text-text-muted group-hover:text-accent-cyan group-hover:scale-105 transition-all">
                {collapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                )}
              </div>
              {!collapsed && (
                <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">
                  Perkecil Panel
                </span>
              )}
            </div>

            {!collapsed && (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-text-muted/80 bg-bg-card rounded border border-border-subtle shadow-xs">
                [
              </kbd>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;