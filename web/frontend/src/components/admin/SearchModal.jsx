import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  ArrowRight,
  LayoutDashboard,
  Calendar,
  Gamepad2,
  BookOpen,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

/**
 * SearchModal - Clean command palette search
 * Features: Cmd+K, keyboard nav, recent searches
 */
export function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('xvoca_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quick links
  const quickLinks = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'cyan' },
    { key: 'schedules', label: 'Jadwal', icon: Calendar, path: '/admin/schedules', color: 'purple' },
    { key: 'voting', label: 'Game Voting', icon: Gamepad2, path: '/admin/voting', color: 'gold' },
    { key: 'content', label: 'Content Guide', icon: BookOpen, path: '/admin/content', color: 'cyan' },
  ];

  const colorMap = {
    cyan: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    purple: { bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    gold: { bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus on open
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, results, selectedIndex, onClose]);

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
        data.slice(0, 3).forEach(item => {
          items.push({
            id: `s_${item.id}`,
            type: 'schedules',
            title: item.title || 'Untitled',
            subtitle: item.category || 'Jadwal',
            icon: Calendar,
            path: '/admin/schedules',
            color: 'purple',
          });
        });
      }

      if (games.status === 'fulfilled' && games.value.data?.data) {
        const data = Array.isArray(games.value.data.data)
          ? games.value.data.data
          : games.value.data.data.games || [];
        data.slice(0, 3).forEach(item => {
          items.push({
            id: `g_${item.id}`,
            type: 'games',
            title: item.title || item.name || 'Untitled',
            subtitle: item.genre || 'Game',
            icon: Gamepad2,
            path: '/admin/voting',
            color: 'gold',
          });
        });
      }

      if (content.status === 'fulfilled' && content.value.data?.data) {
        const data = Array.isArray(content.value.data.data)
          ? content.value.data.data
          : content.value.data.data.content || [];
        data.slice(0, 3).forEach(item => {
          items.push({
            id: `c_${item.id}`,
            type: 'content',
            title: item.title || 'Untitled',
            subtitle: item.category || item.gameTag || 'Content',
            icon: BookOpen,
            path: '/admin/content',
            color: 'cyan',
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
    const updated = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('xvoca_recent_searches', JSON.stringify(updated));
    } catch {}
    navigate(item.path);
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem('xvoca_recent_searches'); } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-bg-card border border-border-subtle rounded-xl shadow-modal overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schedules, games, content..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm"
          />
          {loading && <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query && (
            <div className="p-2">
              {/* Quick Links */}
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-muted uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Navigate
                </div>
                {quickLinks.map(link => {
                  const colors = colorMap[link.color];
                  return (
                    <button
                      key={link.key}
                      onClick={() => { navigate(link.path); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <link.icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <span className="flex-1 text-sm text-text-primary">{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                    </button>
                  );
                })}
              </div>

              {/* Recent */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-text-muted uppercase flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Recent
                    </span>
                    <button onClick={clearRecent} className="text-xs text-text-muted hover:text-text-primary">
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((item, i) => (
                    <button
                      key={`${item.id}-${i}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
                    >
                      <Clock className="w-4 h-4 text-text-muted" />
                      <div className="flex-1 text-left">
                        <p className="text-sm text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {query && (
            <div className="p-2">
              {results.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-text-muted uppercase">
                    Results ({results.length})
                  </div>
                  {results.map((item, index) => {
                    const colors = colorMap[item.color] || colorMap.cyan;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                          ${index === selectedIndex ? 'bg-bg-surface border border-border-subtle' : 'hover:bg-bg-surface'}
                        `}
                      >
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${index === selectedIndex ? 'text-accent-cyan' : 'text-text-primary'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-text-muted">{item.subtitle}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                          {item.type}
                        </span>
                      </button>
                    );
                  })}
                </>
              ) : !loading && (
                <div className="p-8 text-center text-text-muted">
                  <p className="text-sm">No results for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border-subtle bg-bg-surface/50 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-bg-card border border-border-subtle rounded text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-bg-card border border-border-subtle rounded text-[10px]">Enter</kbd>
            select
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
