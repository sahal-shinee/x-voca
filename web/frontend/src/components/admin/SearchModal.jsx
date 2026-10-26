import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  LayoutDashboard,
  Calendar,
  Gamepad2,
  BookOpen,
  X,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { useTheme } from '../../hooks/useTheme';

/**
 * SearchModal - Clean & Minimalist Command Search
 * Fully theme-adaptive (supports Dark & Light mode) with warm, harmonious colors.
 */
export function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Safe theme detection
  let isDark = true;
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme) {
      isDark = themeCtx.isDark;
    }
  } catch {
    isDark = true;
  }

  // 4 Primary Quick Links
  const quickLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { key: 'schedules', label: 'Jadwal', icon: Calendar, path: '/admin/schedules' },
    { key: 'voting', label: 'Game Voting', icon: Gamepad2, path: '/admin/voting' },
    { key: 'content', label: 'Content Guide', icon: BookOpen, path: '/admin/content' },
  ];

  const activeItems = query.trim() ? results : quickLinks;

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => performSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (activeItems.length > 0 ? (prev + 1) % activeItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (activeItems.length > 0 ? (prev - 1 + activeItems.length) % activeItems.length : 0));
      } else if (e.key === 'Enter') {
        if (activeItems[selectedIndex]) {
          e.preventDefault();
          handleSelect(activeItems[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, activeItems, selectedIndex, onClose]);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const [schedules, games, content] = await Promise.allSettled([
        api.get(`/api/schedules?search=${encodeURIComponent(q)}`),
        api.get(`/api/games?search=${encodeURIComponent(q)}`),
        api.get(`/api/content?search=${encodeURIComponent(q)}`),
      ]);

      const items = [];

      if (schedules.status === 'fulfilled' && schedules.value.data?.data) {
        const data = Array.isArray(schedules.value.data.data)
          ? schedules.value.data.data
          : schedules.value.data.data.schedules || [];
        data.slice(0, 3).forEach((item) => {
          items.push({
            id: `s_${item.id}`,
            label: item.title || 'Untitled',
            type: 'Jadwal',
            icon: Calendar,
            path: '/admin/schedules',
          });
        });
      }

      if (games.status === 'fulfilled' && games.value.data?.data) {
        const data = Array.isArray(games.value.data.data)
          ? games.value.data.data
          : games.value.data.data.games || [];
        data.slice(0, 3).forEach((item) => {
          items.push({
            id: `g_${item.id}`,
            label: item.title || item.name || 'Untitled',
            type: 'Voting',
            icon: Gamepad2,
            path: '/admin/voting',
          });
        });
      }

      if (content.status === 'fulfilled' && content.value.data?.data) {
        const data = Array.isArray(content.value.data.data)
          ? content.value.data.data
          : content.value.data.data.content || [];
        data.slice(0, 3).forEach((item) => {
          items.push({
            id: `c_${item.id}`,
            label: item.title || 'Untitled',
            type: 'Konten',
            icon: BookOpen,
            path: '/admin/content',
          });
        });
      }

      setResults(items);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-admin-theme={isDark ? 'dark' : 'light'}
      data-theme={isDark ? 'dark' : 'light'}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity duration-200 backdrop-blur-sm ${
          isDark ? 'bg-black/60' : 'bg-stone-900/25'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Clean Minimalist Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-lg
          ${
            isDark
              ? 'bg-[#110e22]/95 border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-[#E5E0D6] shadow-[0_20px_50px_-12px_rgba(28,25,23,0.12),0_0_0_1px_rgba(0,0,0,0.03)]'
          }
          backdrop-blur-2xl border rounded-2xl overflow-hidden animate-scale-in
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b ${
            isDark ? 'border-white/[0.08]' : 'border-[#E5E0D6]'
          }`}
        >
          <Search
            className={`w-4.5 h-4.5 shrink-0 ${
              isDark ? 'text-text-muted' : 'text-[#78716C]'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jadwal, game, konten..."
            className={`flex-1 bg-transparent text-sm outline-none border-0 focus:outline-none focus:ring-0 shadow-none ${
              isDark
                ? 'text-[#F8F9FC] placeholder:text-[#8E8AA0]/60'
                : 'text-[#1C1917] placeholder:text-[#78716C]/60'
            }`}
          />
          {loading && (
            <Loader2
              className={`w-4 h-4 animate-spin shrink-0 ${
                isDark ? 'text-accent-cyan' : 'text-[#0D9488]'
              }`}
            />
          )}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`p-0.5 rounded transition-colors ${
                isDark ? 'text-text-muted hover:text-white' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
              title="Hapus"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              isDark
                ? 'bg-white/[0.05] border border-white/[0.1] text-text-muted'
                : 'bg-[#F5F3EF] border border-[#E5E0D6] text-[#78716C]'
            }`}
          >
            ESC
          </kbd>
        </div>

        {/* Content Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() ? (
            <div>
              <p
                className={`px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${
                  isDark ? 'text-text-muted' : 'text-[#78716C]'
                }`}
              >
                Pintasan
              </p>
              <div className="space-y-1 mt-0.5">
                {quickLinks.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-left group
                        ${
                          isSelected
                            ? isDark
                              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                              : 'bg-[#EFECE6] text-[#1C1917] border border-[#DDD7CD]'
                            : isDark
                              ? 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'
                              : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#F5F3EF] border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? isDark
                                ? 'bg-accent-cyan/20 text-accent-cyan'
                                : 'bg-[#0D9488]/15 text-[#0D9488]'
                              : isDark
                                ? 'bg-white/[0.04] text-text-muted group-hover:text-white'
                                : 'bg-[#F0EDE6] text-[#78716C] group-hover:text-[#1C1917]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 transition-all group-hover:translate-x-0.5 ${
                          isDark
                            ? 'text-text-muted/40 group-hover:text-white'
                            : 'text-[#78716C]/40 group-hover:text-[#1C1917]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-left group
                          ${
                            isSelected
                              ? isDark
                                ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                                : 'bg-[#EFECE6] text-[#1C1917] border border-[#DDD7CD]'
                              : isDark
                                ? 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'
                                : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#F5F3EF] border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? isDark
                                  ? 'bg-accent-cyan/20 text-accent-cyan'
                                  : 'bg-[#0D9488]/15 text-[#0D9488]'
                                : isDark
                                  ? 'bg-white/[0.04] text-text-muted group-hover:text-white'
                                  : 'bg-[#F0EDE6] text-[#78716C] group-hover:text-[#1C1917]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ml-2 ${
                            isDark
                              ? 'bg-white/[0.05] text-text-muted'
                              : 'bg-[#EFECE6] text-[#78716C] border border-[#E5E0D6]'
                          }`}
                        >
                          {item.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                !loading && (
                  <div
                    className={`py-8 text-center text-xs ${
                      isDark ? 'text-text-muted' : 'text-[#78716C]'
                    }`}
                  >
                    Tidak ada hasil untuk "{query}"
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div
          className={`px-4 py-2 border-t flex items-center gap-3 text-[11px] ${
            isDark
              ? 'border-white/[0.06] bg-black/25 text-text-muted'
              : 'border-[#E5E0D6] bg-[#FAF8F5] text-[#78716C]'
          }`}
        >
          <span className="flex items-center gap-1">
            <kbd
              className={`px-1 py-0.5 rounded text-[9px] font-mono ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-text-muted'
                  : 'bg-white border border-[#E5E0D6] text-[#78716C] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              }`}
            >
              ↑↓
            </kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className={`px-1 py-0.5 rounded text-[9px] font-mono ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-text-muted'
                  : 'bg-white border border-[#E5E0D6] text-[#78716C] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              }`}
            >
              ↵
            </kbd>
            pilih
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className={`px-1 py-0.5 rounded text-[9px] font-mono ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-text-muted'
                  : 'bg-white border border-[#E5E0D6] text-[#78716C] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              }`}
            >
              esc
            </kbd>
            tutup
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
