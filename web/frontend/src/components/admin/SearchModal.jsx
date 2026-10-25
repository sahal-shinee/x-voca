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

/**
 * SearchModal - Clean & Minimalist Command Search
 * Simple, fast, distraction-free
 */
export function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Clean Minimalist Modal */}
      <div
        className="relative w-full max-w-lg bg-[#0e0a22]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar (Seamless & Border-free) */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-4.5 h-4.5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari jadwal, game, konten..."
            className="flex-1 bg-transparent text-white placeholder:text-text-muted/60 outline-none border-0 focus:outline-none focus:ring-0 text-sm shadow-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-accent-cyan animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-text-muted hover:text-white p-0.5 rounded transition-colors"
              title="Hapus"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 bg-white/[0.05] border border-white/[0.1] rounded text-[10px] font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Content Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() ? (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider">
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
                            ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                            : 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-accent-cyan/20 text-accent-cyan'
                              : 'bg-white/[0.04] text-text-muted group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
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
                              ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                              : 'text-text-secondary hover:text-white hover:bg-white/[0.04] border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-accent-cyan/20 text-accent-cyan'
                                : 'bg-white/[0.04] text-text-muted group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-text-muted shrink-0 ml-2">
                          {item.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                !loading && (
                  <div className="py-8 text-center text-text-muted text-xs">
                    Tidak ada hasil untuk "{query}"
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-black/20 flex items-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">↑↓</kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">↵</kbd>
            pilih
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">esc</kbd>
            tutup
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
