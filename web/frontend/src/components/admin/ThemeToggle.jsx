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
    <div
      className={`flex items-center gap-2 ${className}`}
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
  );
}

export default ThemeToggle;
