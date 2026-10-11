import api from './api';

/**
 * Collab Request API Service
 * Handles viewer collab requests and admin moderation endpoints
 */
export const collabRequestService = {
  /**
   * Get all collab requests with query filters & pagination
   * @param {Object} params - { status, period, period_key, search, page, limit }
   */
  getCollabRequests: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/collab-requests${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single collab request by ID
   * @param {number|string} id
   */
  getCollabRequestById: (id) =>
    api.get(`/api/collab-requests/${id}`),

  /**
   * Review collab request (approve/reject with optional notes)
   * @param {number|string} id
   * @param {Object} data - { action: 'approve'|'reject', notes?: string }
   */
  reviewCollabRequest: (id, data) =>
    api.patch(`/api/collab-requests/${id}/review`, data),

  /**
   * Delete collab request
   * @param {number|string} id
   */
  deleteCollabRequest: (id) =>
    api.delete(`/api/collab-requests/${id}`),

  /**
   * Get collab request statistics
   * @param {Object} params - { period?: string }
   */
  getCollabRequestStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/collab-requests/stats${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Public: Submit a collab request (Viewer side)
   * @param {Object} data - { requested_streamer_name, requested_streamer_social, message, viewer_identifier }
   */
  submitCollabRequest: (data) =>
    api.post('/api/collab-requests', data),
};

export default collabRequestService;

