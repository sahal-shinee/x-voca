/**
 * ============================================================================
 * FILE: web/frontend/src/services/api.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Klien HTTP terpusat berbasis pustaka Axios.
 * Mengatur:
 * 1. Base URL dinamis (localhost:3001 saat lokal, atau URL hosting dari `VITE_API_URL`).
 * 2. Request Interceptor: Otomatis menyisipkan header `Authorization: Bearer <token>`
 *    pada setiap request yang ditujukan ke endpoint privat.
 * 3. Response Interceptor: Menangkap kode status HTTP 401 Unauthorized dan otomatis
 *    membersihkan token kadaluwarsa serta mengarahkan admin ke `/admin/login`.
 * 4. Pustaka modular pemanggil API: `authAPI`, `scheduleAPI`, `gameAPI`, `voteAPI`,
 *    `contentAPI`, `todoAPI`, `dashboardAPI`, dan `youtubeAPI`.
 * ============================================================================
 */

import axios from 'axios';

// 1. Inisialisasi instance Axios dengan konfigurasi dasar
const api = axios.create({
  // Ambil URL backend dari file .env frontend (VITE_API_URL), default ke port 3001
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  // Batas waktu tunggu request maksimal 15 detik sebelum timeout
  timeout: 15000,
});

// Flag penanda untuk mencegah pemanggilan redirect logout berulang kali saat banyak request 401 bersamaan
let isHandling401 = false;

/**
 * Helper: clearAuthAndRedirect
 * Membersihkan sesi login yang kedaluwarsa dan mengalihkan peramban ke halaman login
 */
const clearAuthAndRedirect = () => {
  // Jika sedang dalam proses redirect, abaikan panggilan kedua
  if (isHandling401) return;
  isHandling401 = true;

  // Hapus token JWT dari localStorage
  localStorage.removeItem('xvoca_admin_token');

  // Gunakan setTimeout 0ms agar transisi halaman tidak memicu konflik render di React
  setTimeout(() => {
    // Alihkan paksa ke halaman login admin
    window.location.href = '/admin/login';

    // Reset flag setelah jeda 1 detik
    setTimeout(() => {
      isHandling401 = false;
    }, 1000);
  }, 0);
};

// ============================================================
// REQUEST INTERCEPTOR (Pencegat Request Keluar)
// ============================================================
// Dijalankan secara otomatis sebelum setiap request HTTP dikirimkan ke backend
api.interceptors.request.use(
  (config) => {
    // 1. Ambil token JWT dari localStorage
    const token = localStorage.getItem('xvoca_admin_token');

    // 2. Jika token ditemukan, tempelkan ke HTTP Header Authorization dengan skema Bearer
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Deteksi apakah request ini ditujukan ke endpoint privat yang memerlukan login
    const isProtectedRoute = config.url?.startsWith('/api/admin') ||
                             config.url?.startsWith('/api/dashboard') ||
                             config.url?.startsWith('/api/auth/me') ||
                             config.url?.startsWith('/api/auth/broadcasting') ||
                             config.url?.startsWith('/api/auth/profile') ||
                             config.url?.startsWith('/api/auth/password');

    // Jika endpoint privat tapi tidak ada token, batalkan request langsung di sisi klien
    if (isProtectedRoute && !token) {
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Token tidak tersedia di penyimpanan lokal.' }
        },
        __handled: true
      });
    }

    // Teruskan konfigurasi request yang sudah disisipi token ke server
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR (Pencegat Respons Masuk)
// ============================================================
// Dijalankan secara otomatis setelah respons diterima dari server backend
api.interceptors.response.use(
  (response) => {
    // Respons dengan status kode 2xx langsung dikembalikan tanpa halangan
    return response;
  },
  (error) => {
    // KONDISI 1: Terjadi kendala jaringan fisik (server mati / offline)
    if (!error.response) {
      console.error('Network error terdeteksi:', error.message);

      // Tangani kondisi request timeout (melebihi 15 detik)
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          response: {
            status: 408,
            data: { message: 'Waktu request habis (Timeout). Silakan periksa koneksi Anda.' }
          }
        });
      }

      return Promise.reject({
        response: {
          status: 0,
          data: { message: 'Tidak dapat terhubung ke server backend. Pastikan server Node.js aktif.' }
        }
      });
    }

    // KONDISI 2: Server merespons dengan status HTTP 401 Unauthorized (Token Kedaluwarsa)
    if (error.response?.status === 401) {
      // Jangan redirect jika error 401 terjadi saat mencoba login dengan password salah
      if (error.config?.url?.includes('/api/auth/login')) {
        return Promise.reject(error);
      }

      console.log('401 Unauthorized terdeteksi - sesi kedaluwarsa, membersihkan token...');
      clearAuthAndRedirect();

      return Promise.reject({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Sesi login Anda telah berakhir. Silakan login kembali.'
          }
        },
        __redirected: true
      });
    }

    // KONDISI 3: Server merespons dengan status HTTP 403 Forbidden (Akses Ditolak)
    if (error.response?.status === 403) {
      console.log('403 Forbidden - akses ke fitur ini ditolak');
      return Promise.reject({
        response: {
          status: 403,
          data: {
            success: false,
            message: 'Akses ditolak. Akun Anda tidak memiliki hak izin untuk fitur ini.'
          }
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// MODUL LAYANAN API SPESIFIK FITUR (FEATURE API SERVICES)
// ============================================================

// 1. Layanan API Autentikasi
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () =>
    api.get('/api/auth/me'),
  toggleBroadcasting: (isReady) =>
    api.patch('/api/auth/broadcasting', { is_broadcasting: isReady }),
  updateProfile: (data) =>
    api.patch('/api/auth/profile', data),
  changePassword: (current_password, new_password) =>
    api.patch('/api/auth/password', { current_password, new_password }),
};

// 2. Layanan API Jadwal Streaming
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

// 3. Layanan API Katalog Game
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

// 4. Layanan API Voting & Request
export const voteAPI = {
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/votes/stats${queryString ? `?${queryString}` : ''}`);
  },
  // Submit vote dengan payload fingerprint hardware
  vote: (gameId, fingerprint) =>
    api.post(`/api/votes/${gameId}`, { fingerprint }),
  // Submit usulan game baru dengan batas 7 hari
  request: (data) =>
    api.post('/api/votes/request', data),
  // Reset periode bulanan oleh admin
  resetPeriod: () =>
    api.post('/api/votes/reset-period'),
};

// 5. Layanan API Content Guide (VOD)
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

// 6. Layanan API To-Do List Internal
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

// 7. Layanan API Dashboard Analitik & Audit Log
export const dashboardAPI = {
  getStats: () =>
    api.get('/api/dashboard/stats'),
  getAuditLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/audit-logs${queryString ? `?${queryString}` : ''}`);
  },
};

// 8. Layanan API YouTube Metadata Fetch
export const youtubeAPI = {
  fetch: (url) =>
    api.post('/api/youtube/fetch', { url }),
  getStats: () =>
    api.get('/api/youtube/stats'),
};
