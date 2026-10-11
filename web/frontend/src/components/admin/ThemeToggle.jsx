import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle - Toggle switch for dark/light theme
 *
 * Size: 40x40px button
 * Icon: Sun (light) / Moon (dark)
 * Smooth transition animation
 */
export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        w-10 h-10 rounded-xl
        flex items-center justify-center
        transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        bg-bg-card hover:bg-bg-card-hover
        text-text-secondary hover:text-accent-cyan
        border border-border-subtle hover:border-accent-cyan/50
        focus:outline-none focus:ring-2 focus:ring-accent-cyan/40
        shadow-sm group
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-accent-purple transition-transform duration-200 group-hover:-rotate-12" />
      ) : (
        <Sun className="w-5 h-5 text-accent-cyan transition-transform duration-200 group-hover:rotate-45" />
      )}
    </button>
  );
}

export default ThemeToggle;
