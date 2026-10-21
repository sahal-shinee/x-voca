/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

/**
 * ThemeProvider - Manages dark/light theme state
 *
 * Persists theme preference to localStorage ('xvoc-admin-theme')
 * Applies 'data-theme' attribute to <html> element
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to 'dark'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xvoc-admin-theme');
      return stored === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Persist theme to localStorage and keep documentElement dark for viewer pages
  useEffect(() => {
    // Keep document root dark so viewer pages never turn white
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('xvoc-admin-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setThemeMode = (mode) => {
    if (mode === 'dark' || mode === 'light') {
      setTheme(mode);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
