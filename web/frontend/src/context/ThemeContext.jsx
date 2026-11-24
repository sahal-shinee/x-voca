/**
 * ============================================================================
 * FILE: web/frontend/src/context/ThemeContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Mengatur konsistensi tema antarmuka Midnight Cyberpunk di seluruh komponen React.
 * ============================================================================
 */

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
  // Inisialisasi state tema: periksa localStorage terlebih dahulu, default ke tema 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xvoc-admin-theme');
      return stored === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Efek samping: Simpan preferensi tema ke localStorage dan kunci elemen <html> tetap dark
  useEffect(() => {
    // Memastikan elemen root dokumen selalu beraksen dark midnight agar halaman fansite tidak silau
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('xvoc-admin-theme', theme);
    }
  }, [theme]);

  // Fungsi toggle peralihan antara mode dark dan light
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fungsi set mode tema secara eksplisit ('dark' atau 'light')
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
