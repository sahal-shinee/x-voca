import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * useTheme - Custom hook for theme management
 *
 * Provides access to theme state ('dark' | 'light') and actions.
 *
 * @returns {{ theme: string, toggleTheme: () => void, setTheme: (mode: string) => void, isDark: boolean, isLight: boolean }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default useTheme;
