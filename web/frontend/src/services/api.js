import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for slower connections
});

// Track if we're already handling a 401 to prevent multiple logout calls
let isHandling401 = false;

/**
 * Clear auth and redirect to login
 * Separated to allow both request interceptor (for retry logic) and response interceptor to use
 */
const clearAuthAndRedirect = () => {
  // Prevent multiple calls
  if (isHandling401) return;
  isHandling401 = true;

  localStorage.removeItem('xvoca_admin_token');

  // Use setTimeout to avoid React state update during render
  setTimeout(() => {
    // Redirect to login
    window.location.href = '/admin/login';

    // Reset flag after a delay to allow future 401s to be handled
    setTimeout(() => {
      isHandling401 = false;
    }, 1000);
  }, 0);
};

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('xvoca_admin_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For protected routes, check if we have a token
    const isProtectedRoute = config.url?.startsWith('/api/admin') ||
                             config.url?.startsWith('/api/dashboard') ||
                             config.url?.startsWith('/api/auth/me') ||
                             config.url?.startsWith('/api/auth/broadcasting') ||
                             config.url?.startsWith('/api/auth/profile') ||
                             config.url?.startsWith('/api/auth/password');

    if (isProtectedRoute && !token) {
      // Clear any queued requests
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'No token available' }
        },
        __handled: true
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 unauthorized and network errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors (no response)
    if (!error.response) {
      console.error('Network error:', error.message);

      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          response: {
            status: 408,
            data: { message: 'Request timeout. Silakan coba lagi.' }
          }
        });
      }

      return Promise.reject({
        response: {
          status: 0,
          data: { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' }
        }
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Don't redirect if already handled or if it's the login endpoint
      if (error.config?.url?.includes('/api/auth/login')) {
        return Promise.reject(error);
      }

      console.log('401 Unauthorized - clearing session and redirecting...');
      clearAuthAndRedirect();

      // Return a rejected promise with a user-friendly error
      return Promise.reject({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Sesi Anda telah berakhir. Silakan login kembali.'
          }
        },
        __redirected: true
      });
    }

    // Handle 403 Forbidden (access denied)
    if (error.response?.status === 403) {
      console.log('403 Forbidden - access denied');
      return Promise.reject({
        response: {
          status: 403,
          data: {
            success: false,
            message: 'Anda tidak memiliki akses ke resource ini.'
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () =>
    api.get('/api/auth/me'),
  toggleBroadcasting: (isReady) =>
    api.patch('/api/auth/broadcasting', { isReady }),
  updateProfile: (data) =>
    api.patch('/api/auth/profile', data),
  changePassword: (current_password, new_password) =>
    api.patch('/api/auth/password', { current_password, new_password }),
};

// Schedule API
export const scheduleAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/schedules${queryString ? `?${queryString}` : ''}`);
  },
  getNext: () =>
    api.get('/api/schedules/next'),
  getById: (id) =>
    api.get(`/api/schedules/${id}`),
  create: (data) =>
    api.post('/api/schedules', data),
  update: (id, data) =>
    api.patch(`/api/schedules/${id}`, data),
  delete: (id) =>
    api.delete(`/api/schedules/${id}`),
};

// Game API
export const gameAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/games${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) =>
    api.get(`/api/games/${id}`),
  create: (data) =>
    api.post('/api/games', data),
  updateStatus: (id, status) =>
    api.patch(`/api/games/${id}/status`, { status }),
  delete: (id) =>
    api.delete(`/api/games/${id}`),
};

// Vote API
export const voteAPI = {
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/votes/stats${queryString ? `?${queryString}` : ''}`);
  },
  vote: (gameId, fingerprint) =>
    api.post(`/api/votes/${gameId}`, { fingerprint }),
  request: (data) =>
    api.post('/api/votes/request', data),
  resetPeriod: () =>
    api.post('/api/votes/reset-period'),
};

// Content API
export const contentAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/content${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) =>
    api.get(`/api/content/${id}`),
  create: (data) =>
    api.post('/api/content', data),
  update: (id, data) =>
    api.patch(`/api/content/${id}`, data),
  delete: (id) =>
    api.delete(`/api/content/${id}`),
};

// Todo API
export const todoAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/todos${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) =>
    api.get(`/api/todos/${id}`),
  create: (data) =>
    api.post('/api/todos', data),
  update: (id, data) =>
    api.patch(`/api/todos/${id}`, data),
  delete: (id) =>
    api.delete(`/api/todos/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/api/dashboard/stats'),
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/audit-logs${queryString ? `?${queryString}` : ''}`);
  },
};

// YouTube API
export const youtubeAPI = {
  fetch: (url) =>
    api.post('/api/youtube/fetch', { url }),
};
