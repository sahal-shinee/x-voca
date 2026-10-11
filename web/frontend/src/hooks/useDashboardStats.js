import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../utils/firebase';
import { getStats } from '../services/dashboardService';

/**
 * useDashboardStats - Real-time dashboard statistics hook
 *
 * Priority:
 * 1. Firebase real-time listener (primary)
 * 2. REST API fallback (if Firebase fails)
 * 3. Mock data (if API also fails)
 *
 * Auto-refreshes via Firebase listener or every 30s via API fallback
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalVotes: 0,
    votesToday: 0,
    votesGrowth: 0,
    upcomingSchedules: 0,
    pendingTodos: 0,
    activeContent: 0,
    urgentTodos: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synced, setSynced] = useState(false); // true if Firebase is connected
  const refreshTimerRef = useRef(null);

  // Fallback mock data
  const getMockStats = () => ({
    totalVotes: 1247,
    votesToday: 42,
    votesGrowth: 12,
    upcomingSchedules: 3,
    pendingTodos: 5,
    activeContent: 18,
    urgentTodos: 2,
    lastUpdated: new Date().toISOString(),
  });

  // Fetch from REST API
  const fetchFromAPI = useCallback(async () => {
    try {
      const response = await getStats();
      if (response?.data) {
        setStats({
          totalVotes: response.data.totalVotes || 0,
          votesToday: response.data.votesToday || 0,
          votesGrowth: response.data.votesGrowth || 0,
          upcomingSchedules: response.data.upcomingSchedules || 0,
          pendingTodos: response.data.pendingTodos || 0,
          activeContent: response.data.activeContent || 0,
          urgentTodos: response.data.urgentTodos || 0,
          lastUpdated: response.data.lastUpdated || new Date().toISOString(),
        });
        setError(null);
      }
    } catch (err) {
      console.error('useDashboardStats: API fetch failed, using mock data', err);
      setStats(getMockStats());
      setError('API unavailable - showing demo data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    if (!synced) {
      fetchFromAPI();
    }
    // If Firebase is synced, it refreshes automatically
  }, [synced, fetchFromAPI]);

  useEffect(() => {
    // Try Firebase first
    if (!isFirebaseConfigured()) {
      // No Firebase - use API with polling
      fetchFromAPI();
      refreshTimerRef.current = setInterval(fetchFromAPI, 30000);
      return () => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      };
    }

    try {
      const database = getFirebaseDatabase();
      if (!database) {
        fetchFromAPI();
        refreshTimerRef.current = setInterval(fetchFromAPI, 30000);
        return () => {
          if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        };
      }

      const statsRef = ref(database, 'dashboard_stats');

      const unsubscribe = onValue(
        statsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setStats({
              totalVotes: data.total_votes || data.totalVotes || 0,
              votesToday: data.votes_today || data.votesToday || 0,
              votesGrowth: data.votes_growth || data.votesGrowth || 0,
              upcomingSchedules: data.upcoming_schedules || data.upcomingSchedules || 0,
              pendingTodos: data.pending_todos || data.pendingTodos || 0,
              activeContent: data.active_content || data.activeContent || 0,
              urgentTodos: data.urgent_todos || data.urgentTodos || 0,
              lastUpdated: data.last_updated || new Date().toISOString(),
            });
            setError(null);
            setSynced(true);
          } else {
            // Firebase path exists but no data - fallback to API
            fetchFromAPI();
          }
          setLoading(false);
        },
        (err) => {
          console.error('useDashboardStats: Firebase error, falling back to API', err);
          setSynced(false);
          // Fallback to API polling
          fetchFromAPI();
          refreshTimerRef.current = setInterval(fetchFromAPI, 30000);
          setLoading(false);
        }
      );

      return () => {
        off(statsRef);
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      };
    } catch (err) {
      console.error('useDashboardStats: Setup error', err);
      fetchFromAPI();
      return () => {
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      };
    }
  }, [fetchFromAPI]);

  return { stats, loading, error, synced, refresh };
}

export default useDashboardStats;
