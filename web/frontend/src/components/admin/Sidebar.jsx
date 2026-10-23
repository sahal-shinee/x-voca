import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Gamepad2,
  Users,
  BookOpen,
  CheckSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * Modern Studio Command Deck Sidebar
 * Clean, tactile, interactive, and zero AI-slop template clichés.
 */
export function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  const userName = user?.name || 'Admin';

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
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/schedules', label: 'Jadwal Stream', icon: Calendar },
    { path: '/admin/voting', label: 'Game Voting', icon: Gamepad2 },
    { path: '/admin/collab-requests', label: 'Collab Requests', icon: Users },
    { path: '/admin/content', label: 'Content Guide', icon: BookOpen },
    { path: '/admin/todos', label: 'Todo List', icon: CheckSquare },
  ];

  const NavItem = ({ path, label, icon: Icon }) => (
    <NavLink
      to={path}
      onClick={onCloseMobile}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `
        group relative flex items-center
        ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2.5 gap-3'}
        rounded-xl text-sm font-medium
        transition-all duration-200 ease-out select-none
        active:scale-[0.97]
        ${
          isActive
            ? 'text-accent-cyan font-semibold bg-gradient-to-r from-accent-cyan/15 via-accent-cyan/5 to-transparent border border-accent-cyan/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Integrated Glowing Accent Bar (Inside item padding) */}
          {isActive && !collapsed && (
            <span
              className="
                absolute left-1.5 top-1/2 -translate-y-1/2
                w-1 h-4 rounded-full
                bg-accent-cyan shadow-[0_0_8px_rgba(94,234,212,0.85)]
                transition-all duration-200
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
                  ? 'text-accent-cyan bg-accent-cyan/20 ring-1 ring-accent-cyan/40 shadow-[0_0_12px_rgba(94,234,212,0.3)]'
                  : 'text-text-muted group-hover:text-text-primary group-hover:bg-bg-card'
              }
            `}
          >
            <Icon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-6" />
          </div>

          {/* Label (when expanded) with subtle slide on hover */}
          {!collapsed && (
            <span className="truncate leading-none pt-0.5 tracking-tight transition-transform duration-200 group-hover:translate-x-1">
              {label}
            </span>
          )}

          {/* Floating Tooltip in Collapsed Mode */}
          {collapsed && (
            <div className="
              absolute left-full ml-3.5 px-3 py-1.5
              bg-bg-card/95 backdrop-blur-md border border-border-subtle
              rounded-xl text-xs font-medium text-text-primary
              whitespace-nowrap opacity-0 invisible scale-95
              group-hover:opacity-100 group-hover:visible group-hover:scale-100
              transition-all duration-200 ease-out z-50 shadow-2xl pointer-events-none
            ">
              {label}
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
          className="group flex items-center gap-3 min-w-0 active:scale-[0.98] transition-transform"
        >
          {/* Logo Monogram Badge */}
          <div className="relative flex-shrink-0">
            <div className="
              w-9 h-9 rounded-xl
              bg-gradient-to-br from-accent-cyan/20 via-accent-purple/15 to-transparent
              border border-accent-cyan/40 flex items-center justify-center
              shadow-sm group-hover:shadow-[0_0_15px_rgba(94,234,212,0.4)]
              group-hover:border-accent-cyan group-hover:scale-105
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

              {/* Dynamic Soundwave Equalizer Bars (Real CSS wave animation) */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-end gap-[3px] h-3.5 px-1 py-0.5 rounded bg-bg-surface/80 border border-border-subtle/60">
                  <span className="w-[2.5px] bg-accent-cyan rounded-full animate-eq-1" />
                  <span className="w-[2.5px] bg-accent-cyan rounded-full animate-eq-2" />
                  <span className="w-[2.5px] bg-accent-purple rounded-full animate-eq-3" />
                  <span className="w-[2.5px] bg-accent-purple rounded-full animate-eq-4" />
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
              whitespace-nowrap opacity-0 invisible scale-95
              group-hover:opacity-100 group-hover:visible group-hover:scale-100
              transition-all duration-200 z-50 shadow-2xl pointer-events-none
            ">
              X-VOCA Studio
            </div>
          )}
        </Link>
      </div>

      {/* ── 2. USER PROFILE DECK (Clean & Non-redundant) ── */}
      <div className="p-3">
        <Link
          to="/admin/settings"
          onClick={onCloseMobile}
          title={collapsed ? `${userName} - Buka Pengaturan` : undefined}
          className={`
            relative group/user flex items-center gap-3 p-2.5 rounded-2xl
            bg-gradient-to-b from-bg-surface/90 to-bg-card/40
            border border-border-subtle hover:border-accent-cyan/40
            hover:shadow-[0_4px_20px_-4px_rgba(94,234,212,0.15)]
            active:scale-[0.98] transition-all duration-200 block
            ${collapsed ? 'p-1.5 justify-center' : ''}
          `}
        >
          {/* Avatar: Clean Solid Circle */}
          <div className="relative flex-shrink-0">
            <div className="
              w-9 h-9 rounded-full
              bg-gradient-to-tr from-accent-cyan/20 to-accent-purple/20
              border border-accent-cyan/35 flex items-center justify-center
              font-bold font-mono text-sm text-accent-cyan shadow-sm
              group-hover/user:scale-105 group-hover/user:border-accent-cyan
              transition-all duration-200
            ">
              {userInitial}
            </div>
            {/* Live presence dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-status-done ring-2 ring-bg-nav" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-text-primary truncate group-hover/user:text-accent-cyan transition-colors">
                  {userName}
                </p>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover/user:opacity-100 group-hover/user:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-done flex-shrink-0" />
                <span className="text-[10px] font-mono text-text-muted truncate">
                  Administrator
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
              whitespace-nowrap opacity-0 invisible scale-95
              group-hover/user:opacity-100 group-hover/user:visible group-hover/user:scale-100
              transition-all duration-200 z-50 shadow-2xl pointer-events-none min-w-[130px]
            ">
              <div className="font-semibold text-text-primary">{userName}</div>
              <div className="text-[10px] font-mono text-text-muted mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-done" />
                <span>Administrator</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* ── 3. NAVIGATION MENU ── */}
      <nav className="flex-1 py-1 overflow-y-auto scrollbar-hide">
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
              ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2.5 gap-3'}
              rounded-xl text-sm font-medium
              transition-all duration-200 ease-out select-none
              active:scale-[0.97]
              ${
                isActive
                  ? 'text-accent-cyan font-semibold bg-gradient-to-r from-accent-cyan/15 via-accent-cyan/5 to-transparent border border-accent-cyan/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span
                    className="
                      absolute left-1.5 top-1/2 -translate-y-1/2
                      w-1 h-4 rounded-full
                      bg-accent-cyan shadow-[0_0_8px_rgba(94,234,212,0.85)]
                      transition-all duration-200
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
                        ? 'text-accent-cyan bg-accent-cyan/20 ring-1 ring-accent-cyan/40 shadow-[0_0_12px_rgba(94,234,212,0.3)]'
                        : 'text-text-muted group-hover:text-text-primary group-hover:bg-bg-card'
                    }
                  `}
                >
                  <Settings className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                </div>

                {!collapsed && (
                  <span className="truncate leading-none pt-0.5 tracking-tight transition-transform duration-200 group-hover:translate-x-1">
                    Settings
                  </span>
                )}

                {collapsed && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5
                    bg-bg-card/95 backdrop-blur-md border border-border-subtle
                    rounded-xl text-xs font-medium text-text-primary
                    whitespace-nowrap opacity-0 invisible scale-95
                    group-hover:opacity-100 group-hover:visible group-hover:scale-100
                    transition-all duration-200 ease-out z-50 shadow-2xl pointer-events-none
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
              ${collapsed ? 'justify-center p-2.5 my-1 mx-2' : 'px-3 py-2.5 my-1 mx-2.5 gap-3'}
              text-text-muted hover:text-status-live hover:bg-status-live/10 hover:border-status-live/30
              border border-transparent transition-all duration-200 group relative select-none
              active:scale-[0.97]
            `}
          >
            <div className="
              relative flex items-center justify-center flex-shrink-0
              w-7 h-7 rounded-lg text-text-muted group-hover:text-status-live
              group-hover:bg-status-live/15 transition-all duration-200
            ">
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            </div>

            {!collapsed && (
              <span className="text-sm truncate leading-none pt-0.5 transition-transform duration-200 group-hover:translate-x-1">
                Keluar
              </span>
            )}

            {collapsed && (
              <div className="
                absolute left-full ml-3 px-3 py-1.5
                bg-bg-card/95 backdrop-blur-md border border-status-live/30
                rounded-xl text-xs font-medium text-status-live
                whitespace-nowrap opacity-0 invisible scale-95
                group-hover:opacity-100 group-hover:visible group-hover:scale-100
                transition-all duration-200 ease-out z-50 shadow-2xl pointer-events-none
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
              active:scale-[0.97] transition-all duration-200 group
              ${collapsed ? 'justify-center' : 'justify-between'}
            `}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-bg-surface/80 flex items-center justify-center text-text-muted group-hover:text-accent-cyan group-hover:scale-105 transition-all">
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    collapsed ? 'rotate-180 text-accent-cyan' : 'group-hover:-translate-x-0.5'
                  }`}
                />
              </div>
              {!collapsed && (
                <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
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