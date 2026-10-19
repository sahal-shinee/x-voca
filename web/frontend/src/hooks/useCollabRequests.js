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
      // Build clean params (remove undefined values)
      const cleanParams = Object.fromEntries(
        Object.entries(mergedParams).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );

      // Fetch requests list and stats in parallel
      // For stats, only pass period if it's not 'all' or undefined
      const statsParams = cleanParams.period && cleanParams.period !== 'all'
        ? { period: cleanParams.period }
        : {};

      const [listRes, statsRes] = await Promise.all([
        collabRequestService.getCollabRequests(cleanParams),
        collabRequestService.getCollabRequestStats(statsParams)
      ]);

      console.log('[useCollabRequests] List response:', listRes?.data);
      console.log('[useCollabRequests] Stats response:', statsRes?.data);

      if (listRes.data?.success) {
        // Handle both array and wrapped response formats
        const data = listRes.data.data;
        if (Array.isArray(data)) {
          setRequests(data);
        } else if (data?.requests) {
          setRequests(data.requests);
        } else {
          setRequests([]);
        }
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
   * Quick update notes for a collab request
   * Compatible with both new backend and legacy Railway backend
   * @param {number|string} id
   * @param {string} notes
   */
  const updateNotes = useCallback(async (id, notes) => {
    try {
      let res;
      try {
        res = await collabRequestService.updateNotes(id, notes);
      } catch (firstErr) {
        // Fallback for legacy Railway backend that only accepts action: 'approve' or 'reject'
        const currentItem = requests.find((r) => r.id === id);
        const fallbackAction = currentItem?.status === 'rejected' ? 'reject' : 'approve';
        res = await collabRequestService.reviewCollabRequest(id, { action: fallbackAction, notes });
      }

      if (res.data?.success) {
        const updated = res.data.data;
        setRequests((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        return { success: true, data: updated, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Gagal memperbarui catatan.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan catatan.';
      return { success: false, message: errMsg };
    }
  }, [requests]);

  /**
   * Update status of collab request
   * Compatible with both new backend and legacy Railway backend
   * @param {number|string} id
   * @param {string} status - 'pending'|'approved'|'scheduled'|'rejected'
   * @param {string} notes - optional
   */
  const updateStatus = useCallback(async (id, status, notes) => {
    try {
      let res;
      try {
        // First try standard workflow payload
        res = await collabRequestService.updateStatus(id, status, notes);
      } catch (firstErr) {
        // Fallback for legacy Railway backend
        let fallbackAction = 'approve';
        let fallbackNotes = notes;
        if (status === 'rejected') {
          fallbackAction = 'reject';
        } else if (status === 'approved') {
          fallbackAction = 'approve';
        } else if (status === 'scheduled') {
          fallbackAction = 'approve';
          fallbackNotes = notes ? `${notes} (Dijadwalkan)` : '(Dijadwalkan)';
        } else if (status === 'pending') {
          fallbackAction = 'approve';
        }
        res = await collabRequestService.reviewCollabRequest(id, { action: fallbackAction, notes: fallbackNotes });
      }

      if (res.data?.success) {
        const updated = res.data.data;
        // Optimistically update list
        setRequests((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        // Refresh stats
        collabRequestService.getCollabRequestStats(
          currentParamsRef.current.period ? { period: currentParamsRef.current.period } : {}
        ).then((statsRes) => {
          if (statsRes.data?.success) {
            setStats(statsRes.data.data);
          }
        }).catch(() => {});

        return { success: true, data: updated, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Gagal mengubah status usulan.' };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengubah status.';
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
    updateStatus,
    updateNotes,
    deleteRequest,
    refetch
  };
}

export default useCollabRequests;

