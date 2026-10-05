import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../utils/firebase';

/**
 * useFirebase - Custom hook untuk Firebase Realtime Database listener
 *
 * @param {string} path - Path di Firebase database (e.g., 'votes/games')
 * @returns {Object} { data, loading, error }
 */
export function useFirebase(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip if not configured or path is empty
    if (!isFirebaseConfigured() || !path) {
      setLoading(false);
      return;
    }

    try {
      const database = getFirebaseDatabase();
      if (!database) {
        setLoading(false);
        setError('Firebase not initialized');
        return;
      }

      const dataRef = ref(database, path);

      const unsubscribe = onValue(
        dataRef,
        (snapshot) => {
          setData(snapshot.val());
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firebase listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Cleanup on unmount or path change
      return () => {
        off(dataRef);
      };
    } catch (err) {
      console.error('Firebase hook error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [path]);

  return { data, loading, error };
}

/**
 * useVotes - Hook untuk real-time voting data
 * Listen ke /votes di Firebase
 *
 * @returns {Object} { votes, period, totalVotes, loading, error }
 */
export function useVotes() {
  const { data, loading, error } = useFirebase('votes');

  return {
    votes: data?.games || {},
    period: data?.period || null,
    totalVotes: data?.totalVotes || 0,
    loading,
    error,
  };
}

/**
 * useNextSchedule - Hook untuk next schedule countdown
 * Listen ke /schedules/next di Firebase
 *
 * @returns {Object} { schedule, loading, error }
 */
export function useNextSchedule() {
  const { data, loading, error } = useFirebase('schedules/next');

  return {
    schedule: data,
    loading,
    error,
  };
}

/**
 * useBroadcastingStatus - Hook untuk broadcasting status
 * Listen ke /broadcasting/isReady di Firebase
 *
 * @returns {Object} { isLive, isReady, loading, error }
 */
export function useBroadcastingStatus() {
  const { data, loading, error } = useFirebase('broadcasting');

  return {
    isLive: data?.isReady || false,
    isReady: data?.isReady || false,
    updatedAt: data?.updatedAt || null,
    loading,
    error,
  };
}

/**
 * useVoteCounts - Hook untuk vote counts per game
 * Listen ke /votes/games di Firebase
 *
 * @returns {Object} { voteCounts, loading, error }
 */
export function useVoteCounts() {
  const { data, loading, error } = useFirebase('votes/games');

  return {
    voteCounts: data || {},
    loading,
    error,
  };
}

/**
 * useFirebaseWrite - Hook untuk menulis data ke Firebase
 * Tidak auto-subscribe, hanya untuk write operations
 *
 * @param {string} path - Path untuk write
 * @returns {Object} { write, loading, error }
 */
export function useFirebaseWrite(path) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const write = useCallback(async (value) => {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase not configured');
    }

    const database = getFirebaseDatabase();
    if (!database) {
      throw new Error('Firebase not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const { get, set, ref: dbRef } = await import('firebase/database');
      const dataRef = dbRef(database, path);
      await set(dataRef, value);
      return true;
    } catch (err) {
      console.error('Firebase write error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { write, loading, error };
}

export default useFirebase;
