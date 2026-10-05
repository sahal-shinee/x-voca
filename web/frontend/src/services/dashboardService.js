import api from './api';

/**
 * Dashboard Service
 * Fungsi untuk mengambil data dashboard dari API
 */

// Ambil statistik dashboard
export const getStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Ambil audit logs dengan pagination
export const getAuditLogs = async (params = {}) => {
  try {
    const { limit = 5, page = 1 } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);

    const response = await api.get(`/api/audit-logs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

export default {
  getStats,
  getAuditLogs,
};
