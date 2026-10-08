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
  Command,
  X,
  Loader2,
  Hash,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

/**
 * SearchModal - Command palette style search
 * Features:
 * - Keyboard shortcut: Cmd+K / Ctrl+K
 * - Debounced search
 * - Recent searches
 * - Quick navigation
 * - Keyboard navigation
 */
const SearchModal = ({ isOpen, onClose }) => {
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

  // Search categories
  const searchCategories = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'cyan' },
    { key: 'schedules', label: 'Jadwal Stream', icon: Calendar, path: '/admin/schedules', color: 'purple' },
    { key: 'voting', label: 'Game Voting', icon: Gamepad2, path: '/admin/voting', color: 'gold' },
    { key: 'content', label: 'Content Guide', icon: BookOpen, path: '/admin/content', color: 'cyan' },
  ];

  // Color map for categories
  const colorMap = {
    cyan: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    purple: { bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    gold: { bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const [schedulesRes, gamesRes, contentRes] = await Promise.allSettled([
        api.get(`/api/schedules?search=${encodeURIComponent(searchQuery)}`),
        api.get(`/api/games?search=${encodeURIComponent(searchQuery)}`),
        api.get(`/api/content?search=${encodeURIComponent(searchQuery)}`),
      ]);

      const searchResults = [];

      // Parse schedules
      if (schedulesRes.status === 'fulfilled' && schedulesRes.value.data?.data) {
        const schedules = Array.isArray(schedulesRes.value.data.data)
          ? schedulesRes.value.data.data
          : schedulesRes.value.data.data.schedules || [];
        schedules.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `schedule_${item.id}`,
            type: 'schedules',
            title: item.title || 'Untitled Schedule',
            subtitle: item.category || 'Jadwal',
            icon: Calendar,
            path: '/admin/schedules',
            color: 'purple',
          });
        });
      }

      // Parse games
      if (gamesRes.status === 'fulfilled' && gamesRes.value.data?.data) {
        const games = Array.isArray(gamesRes.value.data.data)
          ? gamesRes.value.data.data
          : gamesRes.value.data.data.games || [];
        games.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `game_${item.id}`,
            type: 'games',
            title: item.title || item.name || 'Untitled Game',
            subtitle: item.genre || 'Game',
            icon: Gamepad2,
            path: '/admin/voting',
            color: 'gold',
          });
        });
      }

      // Parse content
      if (contentRes.status === 'fulfilled' && contentRes.value.data?.data) {
        const content = Array.isArray(contentRes.value.data.data)
          ? contentRes.value.data.data
          : contentRes.value.data.data.content || [];
        content.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `content_${item.id}`,
            type: 'content',
            title: item.title || 'Untitled Content',
            subtitle: item.category || item.gameTag || 'Content',
            icon: BookOpen,
            path: '/admin/content',
            color: 'cyan',
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result) => {
    // Save to recent searches
    const newRecent = [
      result,
      ...recentSearches.filter(r => r.id !== result.id)
    ].slice(0, 5);
    setRecentSearches(newRecent);
    try {
      localStorage.setItem('xvoca_recent_searches', JSON.stringify(newRecent));
    } catch {}

    // Navigate
    navigate(result.path);
    onClose();
  };

  const handleRecentClick = (recent) => {
    navigate(recent.path);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('xvoca_recent_searches');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-base/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 text-accent-cyan animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-accent-cyan" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schedules, games, content..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-base"
          />
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 text-xs text-text-muted bg-bg-input border border-border-subtle rounded-lg hover:bg-bg-card transition-colors"
          >
            <kbd>Esc</kbd>
          </button>
        </div>

        {/* Results / Recent */}
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
          {/* Recent Searches (when no query) */}
          {!query && (
            <div className="p-3">
              {/* Quick Links */}
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Quick Navigate
                  </span>
                </div>
                <div className="space-y-1">
                  {searchCategories.map((cat) => {
                    const colors = colorMap[cat.color];
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          navigate(cat.path);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-input transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <cat.icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <span className="flex-1 text-sm text-text-primary">{cat.label}</span>
                        <ArrowUpRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        Recent
                      </span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((recent, index) => {
                    const colors = colorMap[recent.color] || colorMap.cyan;
                    return (
                      <button
                        key={`${recent.id}-${index}`}
                        onClick={() => handleRecentClick(recent)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-bg-input transition-colors group"
                      >
                        <Clock className="w-4 h-4 text-text-muted" />
                        <div className="flex-1 text-left">
                          <p className="text-sm text-text-primary">{recent.title}</p>
                          <p className="text-xs text-text-muted">{recent.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="p-3">
              {results.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Hash className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Results ({results.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.map((result, index) => {
                      const colors = colorMap[result.color] || colorMap.cyan;
                      const isSelected = index === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isSelected
                              ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                              : 'hover:bg-bg-input border border-transparent'
                            }
                          `}
                        >
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                            <result.icon className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`text-sm ${isSelected ? 'text-accent-cyan' : 'text-text-primary'}`}>
                              {result.title}
                            </p>
                            <p className="text-xs text-text-muted">{result.subtitle}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                            {result.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : !loading && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-bg-input flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">No results found for "{query}"</p>
                  <p className="text-xs text-text-muted mt-1">Try searching for schedules, games, or content</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle bg-bg-input/50">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-bg-card border border-border-subtle rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-bg-card border border-border-subtle rounded text-[10px]">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-bg-card border border-border-subtle rounded text-[10px]">Enter</kbd>
              select
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Command className="w-3 h-3" />
            <span>K</span>
            <span className="ml-1">to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
