import { useState, useCallback, useRef } from 'react';
import { collabRequestService } from '../services/collabRequestService';

/**
 * useCollabRequests - Custom React hook for managing collab requests data & actions
 *
 * @param {Object} initialParams - Initial query parameters { status, period, search, page, limit }
 * @param {boolean} autoFetch - Whether to automatically fetch on mount
 */
export function useCollabRequests(initialParams = {}) {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep track of active query params
  const currentParamsRef = useRef(initialParams);

  /**
   * Fetch both collab requests list and summary statistics
   */
  const fetchRequests = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    const mergedParams = {
      ...currentParamsRef.current,
      ...params
    };
    currentParamsRef.current = mergedParams;

    try {
      // Fetch requests list and stats in parallel
      const [listRes, statsRes] = await Promise.all([
        collabRequestService.getCollabRequests(mergedParams),
        collabRequestService.getCollabRequestStats(mergedParams.period ? { period: mergedParams.period } : {})
      ]);

      if (listRes.data?.success) {
        setRequests(listRes.data.data || []);
        if (listRes.data.meta) {
          setPagination(listRes.data.meta);
        }
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          expired: 0
        });
      }

      return {
        requests: listRes.data?.data || [],
        stats: statsRes.data?.data || {}
      };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data request collab.';
      setError(errMsg);
      console.error('Error fetching collab requests:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Review (approve or reject) a collab request
   * @param {number|string} id
   * @param {Object} data - { action: 'approve'|'reject', notes?: string }
   */
  const reviewRequest = useCallback(async (id, data) => {
    try {
      const res = await collabRequestService.reviewCollabRequest(id, data);
      if (res.data?.success) {
        const updated = res.data.data;
        // Optimistically update list
        setRequests((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        // Refresh stats in background
        collabRequestService.getCollabRequestStats(
          currentParamsRef.current.period ? { period: currentParamsRef.current.period } : {}
        ).then((statsRes) => {
          if (statsRes.data?.success) {
            setStats(statsRes.data.data);
          }
        }).catch(() => {});

        return { success: true, data: updated, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Gagal mereview request.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat review.';
      return { success: false, message: errMsg };
    }
  }, []);

  /**
   * Delete a collab request
   * @param {number|string} id
   */
  const deleteRequest = useCallback(async (id) => {
    try {
      const res = await collabRequestService.deleteCollabRequest(id);
      if (res.data?.success) {
        // Remove item from state
        setRequests((prev) => prev.filter((item) => item.id !== id));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1)
        }));
        // Refresh stats
        collabRequestService.getCollabRequestStats(
          currentParamsRef.current.period ? { period: currentParamsRef.current.period } : {}
        ).then((statsRes) => {
          if (statsRes.data?.success) {
            setStats(statsRes.data.data);
          }
        }).catch(() => {});

        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Gagal menghapus request.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus.';
      return { success: false, message: errMsg };
    }
  }, []);

  /**
   * Refetch current view
   */
  const refetch = useCallback(() => {
    return fetchRequests(currentParamsRef.current);
  }, [fetchRequests]);

  return {
    requests,
    stats,
    pagination,
    loading,
    error,
    fetchRequests,
    reviewRequest,
    deleteRequest,
    refetch
  };
}

export default useCollabRequests;

