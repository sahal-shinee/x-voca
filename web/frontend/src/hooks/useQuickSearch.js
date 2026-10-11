import { useState, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * useQuickSearch - Search hook with debouncing, recent searches, and multi-entity support
 *
 * Features:
 * - 300ms debounce
 * - Multi-entity search (schedules, games, content)
 * - Recent searches persistence (localStorage)
 * - Keyboard navigation support
 * - Category badges
 */
export function useQuickSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef(null);

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('xvoca_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Perform actual search
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [schedulesRes, gamesRes, contentRes] = await Promise.allSettled([
        api.get(`/api/schedules?search=${encodeURIComponent(searchQuery)}&limit=3`),
        api.get(`/api/games?search=${encodeURIComponent(searchQuery)}&limit=3`),
        api.get(`/api/content?search=${encodeURIComponent(searchQuery)}&limit=3`),
      ]);

      const searchResults = [];

      // Parse schedules
      if (schedulesRes.status === 'fulfilled' && schedulesRes.value.data?.data) {
        const items = Array.isArray(schedulesRes.value.data.data)
          ? schedulesRes.value.data.data
          : schedulesRes.value.data.data.schedules || [];
        items.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `schedule_${item.id}`,
            type: 'schedules',
            category: 'Jadwal',
            title: item.title || 'Untitled Schedule',
            subtitle: item.category || item.game || '',
            path: '/admin/schedules',
            color: 'purple',
          });
        });
      }

      // Parse games/votes
      if (gamesRes.status === 'fulfilled' && gamesRes.value.data?.data) {
        const items = Array.isArray(gamesRes.value.data.data)
          ? gamesRes.value.data.data
          : gamesRes.value.data.data.games || [];
        items.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `game_${item.id}`,
            type: 'games',
            category: 'Game',
            title: item.title || item.name || 'Untitled Game',
            subtitle: item.genre || `${item.voteCount || 0} votes`,
            path: '/admin/voting',
            color: 'gold',
          });
        });
      }

      // Parse content
      if (contentRes.status === 'fulfilled' && contentRes.value.data?.data) {
        const items = Array.isArray(contentRes.value.data.data)
          ? contentRes.value.data.data
          : contentRes.value.data.data.content || [];
        items.slice(0, 3).forEach(item => {
          searchResults.push({
            id: `content_${item.id}`,
            type: 'content',
            category: 'Content',
            title: item.title || 'Untitled Content',
            subtitle: item.category || item.gameTag || '',
            path: '/admin/content',
            color: 'cyan',
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (err) {
      console.error('useQuickSearch: search error', err);
      setError('Search failed. Try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced query update
  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!newQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(newQuery);
    }, 300);
  }, [performSearch]);

  // Keyboard navigation
  const navigateUp = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const navigateDown = useCallback(() => {
    setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
  }, [results.length]);

  // Save to recent searches
  const saveToRecent = useCallback((result) => {
    const newRecent = [
      result,
      ...recentSearches.filter(r => r.id !== result.id)
    ].slice(0, 5);
    setRecentSearches(newRecent);
    try {
      localStorage.setItem('xvoca_recent_searches', JSON.stringify(newRecent));
    } catch {}
  }, [recentSearches]);

  // Clear recent searches
  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('xvoca_recent_searches');
    } catch {}
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const selectedResult = results[selectedIndex] || null;

  return {
    query,
    results,
    loading,
    error,
    selectedIndex,
    selectedResult,
    recentSearches,
    updateQuery,
    navigateUp,
    navigateDown,
    saveToRecent,
    clearRecent,
    reset,
  };
}

export default useQuickSearch;
