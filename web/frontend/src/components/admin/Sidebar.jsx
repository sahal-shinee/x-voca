import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import ThemeToggle from './ThemeToggle';

/**
 * Sidebar Component
 * Design: Minimalist Soft Dark / Clean Light, High Contrast, Border-based visual hierarchy
 * Dimensions: 260px expanded, 72px collapsed (per docs/PLANNING_DOCUMENT.md)
 */
export function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/schedules', label: 'Jadwal Stream', icon: Calendar },
    { path: '/admin/voting', label: 'Game Voting', icon: Gamepad2 },
    { path: '/admin/collab-requests', label: 'Collab Requests', icon: Users },
    { path: '/admin/content', label: 'Content Guide', icon: BookOpen },
    { path: '/admin/todos', label: 'Todo', icon: CheckSquare },
  ];

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'X';
  const userName = user?.name || 'Xion Regalia';
  const userRole = user?.role ? user.role.toUpperCase() : 'CREATOR OPS';

  const NavItem = ({ path, label, icon: Icon }) => (
    <NavLink
      to={path}
      onClick={onCloseMobile}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `
        flex items-center gap-3.5 rounded-xl
        ${collapsed ? 'px-2.5 py-3 justify-center' : 'px-3.5 py-2.5'}
        transition-all duration-150 ease-out
        group relative
        ${
          isActive
            ? 'bg-accent-cyan/10 text-accent-cyan border-l-[3px] border-accent-cyan font-semibold shadow-sm'
            : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary border-l-[3px] border-transparent font-medium'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
              isActive
                ? 'text-accent-cyan'
                : 'text-text-muted group-hover:text-text-secondary'
            }`}
          />

          {!collapsed && (
            <span className="text-sm truncate leading-none pt-0.5">{label}</span>
          )}

          {/* Floating Tooltip in Collapsed State */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-3 py-1.5
              bg-bg-card border border-border-subtle
              rounded-lg text-xs font-medium text-text-primary
              whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-150 z-50 shadow-xl
              pointer-events-none
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
        transition-all duration-200 ease-out
        z-50
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* ── 1. LOGO AREA ── */}
      <div
        className={`
          h-16 flex items-center px-4
          border-b border-border-subtle
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs font-bold font-mono text-accent-cyan">XV</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold font-display text-text-primary leading-tight tracking-tight">
                X-VOCA
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest truncate">
                  Admin Panel
                </span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && <ThemeToggle />}
      </div>

      {/* ── 2. USER SECTION ── */}
      <div className="p-3 border-b border-border-subtle">
        <div
          className={`
            relative flex items-center gap-3 p-2 rounded-xl
            bg-bg-surface/50 border border-border-subtle/50
            transition-colors
            ${collapsed ? 'justify-center px-2 py-2.5' : ''}
          `}
        >
          {/* Avatar with initial */}
          <div className="w-9 h-9 rounded-xl bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-xs font-bold font-mono text-accent-purple">
              {userInitial}
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate leading-tight">
                {userName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-done flex-shrink-0" />
                <span className="text-[10px] font-mono text-text-muted tracking-wider truncate">
                  ONLINE · {userRole}
                </span>
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors"
              title="User Options"
              aria-label="User menu"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Collapsed Theme Toggle fallback */}
        {collapsed && (
          <div className="mt-2.5 flex justify-center">
            <ThemeToggle />
          </div>
        )}

        {/* User dropdown popover */}
        {!collapsed && isUserMenuOpen && (
          <div className="mt-2 p-1.5 bg-bg-surface border border-border-subtle rounded-xl shadow-lg space-y-1 animate-scale-in">
            <NavLink
              to="/admin/settings"
              onClick={() => {
                setIsUserMenuOpen(false);
                onCloseMobile?.();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-text-muted" />
              <span>Pengaturan Akun</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-status-live hover:bg-status-live/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 3. NAVIGATION MENU ── */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <p className="px-5 mb-2 text-[10px] font-mono font-semibold text-text-muted uppercase tracking-widest">
            MENU
          </p>
        )}
        <div className={`space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* ── 4. BOTTOM SECTION ── */}
      <div className="p-3 border-t border-border-subtle">
        <div className="space-y-1">
          {/* Settings NavLink */}
          <NavLink
            to="/admin/settings"
            onClick={onCloseMobile}
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) => `
              flex items-center gap-3.5 rounded-xl
              ${collapsed ? 'px-2.5 py-3 justify-center' : 'px-3.5 py-2.5'}
              transition-all duration-150 ease-out
              group relative
              ${
                isActive
                  ? 'bg-accent-cyan/10 text-accent-cyan border-l-[3px] border-accent-cyan font-semibold shadow-sm'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary border-l-[3px] border-transparent font-medium'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                    isActive ? 'text-accent-cyan' : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                />
                {!collapsed && (
                  <span className="text-sm truncate leading-none pt-0.5">Settings</span>
                )}
                {collapsed && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5
                    bg-bg-card border border-border-subtle
                    rounded-lg text-xs font-medium text-text-primary
                    whitespace-nowrap opacity-0 invisible
                    group-hover:opacity-100 group-hover:visible
                    transition-all duration-150 z-50 shadow-xl
                    pointer-events-none
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
              w-full flex items-center gap-3.5 rounded-xl
              ${collapsed ? 'px-2.5 py-3 justify-center' : 'px-3.5 py-2.5'}
              text-text-muted hover:bg-status-live/10 hover:text-status-live
              transition-all duration-150 group relative font-medium border-l-[3px] border-transparent
            `}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm leading-none pt-0.5">Keluar</span>}
            {collapsed && (
              <div className="
                absolute left-full ml-3 px-3 py-1.5
                bg-bg-card border border-border-subtle
                rounded-lg text-xs font-medium text-text-primary
                whitespace-nowrap opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-all duration-150 z-50 shadow-xl
                pointer-events-none
              ">
                Keluar
              </div>
            )}
          </button>

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
            className={`
              hidden lg:flex w-full items-center gap-3.5 rounded-xl
              ${collapsed ? 'px-2.5 py-2.5 justify-center' : 'px-3.5 py-2.5'}
              text-text-muted hover:bg-bg-surface hover:text-text-secondary
              transition-all duration-150 mt-1.5 border-l-[3px] border-transparent
            `}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium leading-none pt-0.5">Perkecil Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
