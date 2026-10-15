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

    const response = await api.get(`/api/schedules?${queryParams.toString()}`);

    // Backend returns: { success, data: { schedules: [...], pagination: {...} } }
    // Extract schedules array from nested data
    const schedules = response.data?.data?.schedules || [];

    return {
      success: response.data?.success ?? true,
      data: schedules,
      pagination: response.data?.data?.pagination,
      message: response.data?.message
    };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Ambil jadwal berikutnya (untuk countdown)
export const getNextSchedule = async () => {
  try {
    const response = await api.get(`/api/schedules/next`);

    // Backend returns: { success: true, data: schedule || null, message: "..." }
    // Return the schedule object directly or null
    return {
      success: response.data?.success ?? true,
      data: response.data?.data || null,
      message: response.data?.message
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

export default {
  getSchedules,
  getNextSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
