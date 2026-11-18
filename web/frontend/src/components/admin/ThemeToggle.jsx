import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import Toggle from '../common/Toggle';

/**
 * ThemeToggle - Toggle switch for dark/light theme
 *
 * Uses redesigned Toggle component with Sun/Moon icons
 */
export function ThemeToggle({ className = '', showIcons = true }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Compact Icon Button: prevents cramped Topbar on narrow screens */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`sm:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-subtle transition-all active:scale-95 ${className}`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-accent-gold" />
        ) : (
          <Moon className="w-5 h-5 text-accent-purple" />
        )}
      </button>

      {/* Desktop / Tablet Full Switch */}
      <div
        className={`hidden sm:flex items-center gap-2 ${className}`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {showIcons && (
          <Sun
            className={`w-4 h-4 transition-colors ${
              !isDark ? 'text-accent-cyan' : 'text-text-muted hover:text-text-secondary'
            }`}
          />
        )}
        <Toggle
          checked={isDark}
          onChange={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        />
        {showIcons && (
          <Moon
            className={`w-4 h-4 transition-colors ${
              isDark ? 'text-accent-purple' : 'text-text-muted hover:text-text-secondary'
            }`}
          />
        )}
      </div>
    </>
  );
}

export default ThemeToggle;
