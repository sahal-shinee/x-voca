import api from './api';

/**
 * Schedule Service
 * Fungsi untuk operasi CRUD jadwal dari API
 *
 * Backend Response Format:
 * {
 *   success: true,
 *   data: { schedules: [...], pagination: {...} },
 *   message: "..."
 * }
 */

// Ambil semua jadwal dengan filter
export const getSchedules = async (params = {}) => {
  try {
    const { status, limit = 50, page = 1 } = params;
    const queryParams = new URLSearchParams();

    if (status) queryParams.append('status', status);
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);

    console.log('[scheduleService] getSchedules called:', { status, limit, page });
    const response = await api.get(`/api/schedules?${queryParams.toString()}`);

    console.log('[scheduleService] Raw response:', response);
    console.log('[scheduleService] response.data:', response?.data);

    // Backend returns: { success, data: { schedules: [...], pagination: {...} }
    // Extract schedules array - handle multiple formats
    const responseData = response.data;
    console.log('[scheduleService] responseData:', responseData);
    console.log('[scheduleService] responseData.data:', responseData?.data);

    let schedules = [];
    if (Array.isArray(responseData?.data)) {
      // Direct array format
      schedules = responseData.data;
      console.log('[scheduleService] Using direct array, count:', schedules.length);
    } else if (responseData?.data?.schedules) {
      // Nested { schedules: [...] } format
      schedules = responseData.data.schedules;
      console.log('[scheduleService] Using nested schedules array, count:', schedules.length);
    } else {
      schedules = [];
      console.log('[scheduleService] No schedules found');
    }

    return {
      success: responseData?.success ?? true,
      data: schedules,
      pagination: responseData?.data?.pagination,
      message: responseData?.message
    };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Ambil jadwal berikutnya (untuk countdown)
export const getNextSchedule = async () => {
  try {
    console.log('[scheduleService] getNextSchedule called');
    const response = await api.get(`/api/schedules/next`);

    console.log('[scheduleService] Raw API response:', response);
    console.log('[scheduleService] response.data:', response?.data);

    // Backend returns: { success: true, data: schedule || null, message: "..." }
    // Handle nested data structure: { data: { data: schedule } } or { data: schedule }
    const responseData = response.data;
    console.log('[scheduleService] responseData:', responseData);
    console.log('[scheduleService] responseData.data:', responseData?.data);
    console.log('[scheduleService] responseData.data?.data:', responseData?.data?.data);

    // Extract schedule from potentially nested structure
    let scheduleData = null;
    if (responseData?.data) {
      // Check if data.data exists (nested) or data directly (not nested)
      scheduleData = responseData.data.data || responseData.data;
    }

    console.log('[scheduleService] Final scheduleData:', scheduleData);

    return {
      success: responseData?.success ?? true,
      data: scheduleData,
      message: responseData?.message
    };
  } catch (error) {
    console.error('Error fetching next schedule:', error);
    throw error;
  }
};

// Ambil jadwal berdasarkan ID
export const getScheduleById = async (id) => {
  try {
    const response = await api.get(`/api/schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

// Buat jadwal baru
export const createSchedule = async (data) => {
  try {
    const response = await api.post('/api/schedules', data);
    return response.data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

// Update jadwal
export const updateSchedule = async (id, data) => {
  try {
    const response = await api.patch(`/api/schedules/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// Hapus jadwal
export const deleteSchedule = async (id) => {
  try {
    const response = await api.delete(`/api/schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// Akhiri streaming secara manual (admin)
export const endStream = async (id) => {
  try {
    const response = await api.post(`/api/admin/schedules/${id}/end-stream`);
    return response.data;
  } catch (error) {
    console.error('Error ending stream:', error);
    throw error;
  }
};

export default {
  getSchedules,
  getNextSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  endStream,
};
