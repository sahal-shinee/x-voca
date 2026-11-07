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
  Sparkles,
} from 'lucide-react';

/**
 * Modern Studio Command Deck Sidebar
 * Rich interactive micro-animations, tactile spring feedback,
 * light sheen sweeps, and zero AI-slop template clichés.
 */
export function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  const userName = user?.name || 'Admin';

  // Hotkey listener: Ctrl+B / Cmd+B to toggle sidebar collapse
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  // Menu items with tailored micro-interaction styles per icon
  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconHoverClass: 'group-hover:scale-120 group-hover:rotate-6 group-hover:text-accent-cyan',
    },
    {
      path: '/admin/schedules',
      label: 'Jadwal Stream',
      icon: Calendar,
      iconHoverClass: 'group-hover:scale-115 group-hover:-translate-y-0.5 group-hover:text-accent-cyan',
    },
    {
      path: '/admin/voting',
      label: 'Game Voting',
      icon: Gamepad2,
      iconHoverClass: 'group-hover:scale-125 group-hover:rotate-12 group-hover:text-accent-purple',
    },
    {
      path: '/admin/collab-requests',
      label: 'Collab Requests',
      icon: Users,
      iconHoverClass: 'group-hover:scale-115 group-hover:-rotate-6 group-hover:text-accent-gold',
    },
    {
      path: '/admin/content',
      label: 'Content Guide',
      icon: BookOpen,
      iconHoverClass: 'group-hover:scale-115 group-hover:rotate-6 group-hover:text-accent-cyan',
    },
    {
      path: '/admin/todos',
      label: 'Todo List',
      icon: CheckSquare,
      iconHoverClass: 'group-hover:scale-120 group-hover:rotate-[-6deg] group-hover:text-status-done',
    },
  ];

  const NavItem = ({ path, label, icon: Icon, iconHoverClass }) => (
    <NavLink
      to={path}
      onClick={onCloseMobile}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `
        group relative flex items-center
        ${collapsed ? 'w-[calc(100%-1rem)] justify-center p-2.5 my-0.5 mx-2' : 'w-[calc(100%-1.5rem)] px-3.5 py-2.5 my-0.5 mx-3 gap-3.5'}
        rounded-xl text-sm font-medium
        transition-all duration-200 ease-out select-none
        hover-sheen active:scale-[0.98]
        ${
          isActive
            ? 'bg-gradient-to-r from-accent-cyan/[0.12] via-accent-cyan/[0.05] to-transparent text-accent-cyan font-semibold border border-accent-cyan/30 shadow-[0_0_20px_-3px_rgba(94,234,212,0.18)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* Tailored Icon with Micro-Animation */}
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-300 ease-out ${
              isActive
                ? 'text-accent-cyan scale-105 drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]'
                : `text-text-muted ${iconHoverClass}`
            }`}
          />

          {/* Label with Spring Glide */}
          {!collapsed && (
            <span className="truncate leading-none pt-0.5 tracking-tight transition-transform duration-200 ease-out group-hover:translate-x-1.5">
              {label}
            </span>
          )}

          {/* Floating Tooltip in Collapsed Mode */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-3 py-1.5
              bg-bg-card/95 backdrop-blur-md border border-border-subtle
              rounded-xl text-xs font-medium text-text-primary
              whitespace-nowrap opacity-0 invisible scale-95
              group-hover:opacity-100 group-hover:visible group-hover:scale-100
              transition-all duration-200 ease-out z-50 shadow-xl pointer-events-none
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
      {/* ── 1. LOGO & BRAND DECK (Interactive Studio Header) ── */}
      <div
        className={`
          h-16 flex items-center px-4
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
          {/* Logo Monogram Badge with Ambient Neon Glow */}
          <div className="relative flex-shrink-0">
            <div className="
              w-9 h-9 rounded-xl
              bg-gradient-to-br from-accent-cyan/20 via-accent-purple/15 to-transparent
              border border-accent-cyan/40 flex items-center justify-center
              shadow-sm group-hover:shadow-[0_0_20px_rgba(94,234,212,0.5)]
              group-hover:border-accent-cyan group-hover:scale-105 group-hover:rotate-1
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

              {/* Dynamic Soundwave Equalizer (5 Animated Wave Bars) */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-end gap-[2.5px] h-3.5 px-1.5 py-0.5 rounded bg-bg-surface/80 border border-border-subtle/60 group-hover:border-accent-cyan/40 transition-colors">
                  <span className="w-[2px] bg-gradient-to-t from-accent-cyan to-accent-cyan-hover rounded-full animate-eq-1" />
                  <span className="w-[2px] bg-gradient-to-t from-accent-cyan to-accent-purple rounded-full animate-eq-2" />
                  <span className="w-[2px] bg-gradient-to-t from-accent-purple to-accent-cyan rounded-full animate-eq-3" />
                  <span className="w-[2px] bg-gradient-to-t from-accent-purple to-accent-purple-hover rounded-full animate-eq-4" />
                  <span className="w-[2px] bg-gradient-to-t from-accent-cyan to-accent-purple rounded-full animate-eq-5" />
                </div>
                <span className="text-[9px] font-mono text-text-muted tracking-wider uppercase group-hover:text-accent-cyan transition-colors">
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

      {/* ── 2. USER PROFILE DECK (Interactive Flip & Breathing Aura) ── */}
      <div className="p-3">
        <Link
          to="/admin/settings"
          onClick={onCloseMobile}
          title={collapsed ? `${userName} - Buka Pengaturan` : undefined}
          className={`
            relative group/user flex items-center gap-3 p-2.5 rounded-2xl
            bg-gradient-to-b from-bg-surface/90 to-bg-card/40
            border border-border-subtle hover:border-accent-cyan/40
            hover:shadow-[0_4px_25px_-4px_rgba(94,234,212,0.2)]
            active:scale-[0.98] transition-all duration-200 block hover-sheen
            ${collapsed ? 'p-1.5 justify-center' : ''}
          `}
        >
          {/* Avatar: Clean Solid Circle with Breathing Aura on Hover */}
          <div className="relative flex-shrink-0">
            <div className="
              w-9 h-9 rounded-full
              bg-gradient-to-tr from-accent-cyan/20 to-accent-purple/20
              border border-accent-cyan/35 flex items-center justify-center
              font-bold font-mono text-sm text-accent-cyan shadow-sm
              group-hover/user:scale-110 group-hover/user:border-accent-cyan
              group-hover/user:shadow-[0_0_15px_rgba(94,234,212,0.4)]
              transition-all duration-300
            ">
              {userInitial}
            </div>
            {/* Live presence dot with ripple ping */}
            <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
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
                <Sparkles className="w-3 h-3 text-accent-purple opacity-0 group-hover/user:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>

              {/* Interactive Sliding Text on Hover */}
              <div className="flex items-center gap-1.5 mt-0.5 relative h-4 overflow-hidden">
                {/* State 1: Default status */}
                <div className="flex items-center gap-1.5 absolute inset-0 transition-transform duration-300 ease-out group-hover/user:-translate-y-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-done flex-shrink-0" />
                  <span className="text-[10px] font-mono text-text-muted truncate">
                    Administrator
                  </span>
                </div>
                {/* State 2: Hover invitation */}
                <div className="flex items-center gap-1 absolute inset-0 transition-transform duration-300 ease-out translate-y-full group-hover/user:translate-y-0 text-accent-cyan">
                  <span className="text-[10px] font-mono font-semibold tracking-tight truncate">
                    Pengaturan Akun
                  </span>
                  <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/user:translate-x-0.5" />
                </div>
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
          <div className="px-5 pt-1 mb-2">
            <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
              Menu Studio
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

        <div className="space-y-0.5 py-1">
          {/* Settings NavLink with 180° Spinning Gear */}
          <NavLink
            to="/admin/settings"
            onClick={onCloseMobile}
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) => `
              group relative flex items-center
              ${collapsed ? 'w-[calc(100%-1rem)] justify-center p-2.5 my-0.5 mx-2' : 'w-[calc(100%-1.5rem)] px-3.5 py-2.5 my-0.5 mx-3 gap-3.5'}
              rounded-xl text-sm font-medium
              transition-all duration-200 ease-out select-none
              hover-sheen active:scale-[0.98]
              ${
                isActive
                  ? 'bg-gradient-to-r from-accent-cyan/[0.12] via-accent-cyan/[0.05] to-transparent text-accent-cyan font-semibold border border-accent-cyan/30 shadow-[0_0_20px_-3px_rgba(94,234,212,0.18)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/80 border border-transparent'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-500 ease-out ${
                    isActive
                      ? 'text-accent-cyan scale-105 rotate-45 drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]'
                      : 'text-text-muted group-hover:text-text-primary group-hover:rotate-180 group-hover:scale-115'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate leading-none pt-0.5 tracking-tight transition-transform duration-200 ease-out group-hover:translate-x-1.5">
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
                    transition-all duration-200 ease-out z-50 shadow-xl pointer-events-none
                  ">
                    Settings
                  </div>
                )}
              </>
            )}
          </NavLink>

          {/* Logout Button with Unified Width & Recoil Animation */}
          <button
            type="button"
            onClick={logout}
            title={collapsed ? 'Keluar' : undefined}
            className={`
              flex items-center rounded-xl text-sm font-medium
              ${collapsed ? 'w-[calc(100%-1rem)] justify-center p-2.5 my-0.5 mx-2' : 'w-[calc(100%-1.5rem)] px-3.5 py-2.5 my-0.5 mx-3 gap-3.5'}
              text-text-muted hover:text-status-live hover:bg-status-live/10 hover:border-status-live/30
              border border-transparent transition-all duration-200 group relative select-none
              hover-sheen active:scale-[0.98]
            `}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ease-out group-hover:-translate-x-1 group-hover:scale-110" />

            {!collapsed && (
              <span className="text-sm truncate leading-none pt-0.5 transition-transform duration-200 ease-out group-hover:translate-x-1">
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
                transition-all duration-200 ease-out z-50 shadow-xl pointer-events-none
              ">
                Keluar
              </div>
            )}
          </button>
        </div>

        {/* ── 5. MODERN COLLAPSE TRIGGER DOCK ── */}
        <div className="p-3 pt-2 border-t border-border-subtle/50">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
            className={`
              hidden lg:flex w-full items-center rounded-xl py-2.5 px-3
              text-text-muted hover:text-text-primary hover:bg-bg-surface
              border border-border-subtle/60 hover:border-accent-cyan/30
              active:scale-[0.98] transition-all duration-200 group hover-sheen
              ${collapsed ? 'justify-center' : 'justify-start gap-3.5'}
            `}
          >
            <ChevronLeft
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                collapsed
                  ? 'rotate-180 text-accent-cyan'
                  : 'group-hover:-translate-x-1 text-text-muted group-hover:text-accent-cyan'
              }`}
            />
            {!collapsed && (
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Perkecil Panel
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;