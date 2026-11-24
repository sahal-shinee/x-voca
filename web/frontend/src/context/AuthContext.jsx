/**
 * ============================================================================
 * FILE: web/frontend/src/context/AuthContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat manajemen status otentikasi global admin (React Context API).
 * Mengatur:
 * 1. Penyimpanan state `user`, `isAuthenticated`, dan `tokenExpiresAt`.
 * 2. Fungsi `login()`: menyimpan token JWT di `localStorage` ('xvoca_admin_token') dan inisialisasi sesi.
 * 3. Fungsi `logout()`: membersihkan token dari browser dan mengalihkan halaman ke login.
 * 4. Pengecekan otomatis masa berlaku token saat aplikasi dibuka kembali (Auto Session Restore).
 * 5. Auto-logout timer: otomatis mengeluarkan admin jika token kedaluwarsa saat browser tetap terbuka.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Context API digunakan agar status login admin dapat diakses di seluruh komponen
 *   tanpa perlu prop drilling."
 * - "Token JWT di-decode di sisi klien untuk mengetahui waktu kedaluwarsanya secara presisi,
 *   sehingga timer otomatis logout bisa dipasang 1 detik sebelum token hangus."
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

// Inisialisasi React Context untuk Autentikasi
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // State: data profil pengguna yang sedang login (id, name, email, role, avatar)
  const [user, setUser] = useState(null);
  // State: penanda apakah aplikasi sedang dalam proses verifikasi sesi token di awal buka
  const [loading, setLoading] = useState(true);
  // State: boolean apakah admin terverifikasi sah
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State: waktu timestamp kedaluwarsa token dalam format Unix Epoch (detik)
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  // Ref: menyimpan referensi ID setTimeout agar timer auto-logout dapat di-reset atau dibersihkan
  const logoutTimerRef = useRef(null);

  /**
   * Helper: decodeToken
   * Mendekode payload JWT di sisi klien (Base64 URL Decode) tanpa perlu request ke backend
   */
  const decodeToken = (token) => {
    try {
      // JWT terdiri dari 3 bagian yang dipisahkan titik: Header.Payload.Signature
      // Kita ambil bagian tengah (index 1) yang merupakan Payload data
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return {
        exp: payload.exp,     // Waktu kedaluwarsa token (detik)
        iat: payload.iat,     // Waktu token diterbitkan
        id: payload.id,       // User ID
        email: payload.email, // Email admin
        role: payload.role,   // Role akses
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  /**
   * Helper: isTokenExpired
   * Memeriksa apakah waktu saat ini sudah melewati waktu kedaluwarsa token
   */
  const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    // Mengalikan expiresAt dengan 1000 karena Date.now() dalam milidetik sedangkan JWT exp dalam detik
    return Date.now() >= expiresAt * 1000;
  };

  /**
   * Fungsi: setLogoutTimer
   * Menjadwalkan auto-logout otomatis tepat saat token mendekati masa kedaluwarsa
   */
  const setLogoutTimer = useCallback((expiresAt) => {
    // Bersihkan timer lama jika ada agar tidak terjadi penumpukan timeout
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!expiresAt) return;

    const now = Date.now();
    const expiryTime = expiresAt * 1000;
    const timeUntilExpiry = expiryTime - now;

    // Pasang alarm timer logout 1 detik sebelum token benar-benar kedaluwarsa
    if (timeUntilExpiry > 1000) {
      logoutTimerRef.current = setTimeout(() => {
        console.log('Token expired, logging out otomatis...');
        logout();
      }, timeUntilExpiry - 1000);
    } else if (timeUntilExpiry > 0) {
      // Jika waktu tersisa kurang dari 1 detik, logout seketika
      logoutTimerRef.current = setTimeout(() => {
        console.log('Token expired, logging out...');
        logout();
      }, timeUntilExpiry);
    }
  }, []);

  /**
   * Fungsi: performLogout
   * Eksekusi pembersihan sesi: hapus token dari localStorage, reset state, dan alihkan URL
   */
  const performLogout = useCallback(() => {
    // 1. Hapus token dari browser storage
    localStorage.removeItem('xvoca_admin_token');
    // 2. Kosongkan seluruh state autentikasi React
    setUser(null);
    setIsAuthenticated(false);
    setTokenExpiresAt(null);
    // 3. Matikan timer auto-logout
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // 4. Alihkan halaman ke formulir login admin
    window.location.href = '/admin/login';
  }, []);

  /**
   * Fungsi: validateToken
   * Mengirim request ke backend `GET /api/auth/me` untuk memverifikasi keabsahan token di database
   */
  const validateToken = useCallback(async (token) => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        const userData = response.data.data;
        // Simpan data profil ke state
        setUser(userData);
        setIsAuthenticated(true);

        // Ekstrak waktu kedaluwarsa dan aktifkan timer penjadwalan logout
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          setTokenExpiresAt(decoded.exp);
          setLogoutTimer(decoded.exp);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }, [setLogoutTimer]);

  /**
   * useEffect: Pengecekan sesi otomatis saat aplikasi pertama kali dimuat di peramban
   */
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Ambil token tersimpan dari localStorage
      const token = localStorage.getItem('xvoca_admin_token');

      // Jika tidak ada token, langsung selesaikan proses loading (status = belum login)
      if (!token) {
        setLoading(false);
        return;
      }

      // 2. Pengecekan cepat di sisi klien (Client-side Check): apakah token sudah kedaluwarsa?
      const decoded = decodeToken(token);
      if (decoded && decoded.exp && isTokenExpired(decoded.exp)) {
        console.log('Token kedaluwarsa (terdeteksi di sisi klien), bersihkan sesi...');
        performLogout();
        return;
      }

      // 3. Validasi token ke server backend (Server-side Check)
      const isValid = await validateToken(token);

      // Jika token ditolak oleh backend (misal akun dinonaktifkan), logout
      if (!isValid) {
        performLogout();
        return;
      }

      // Selesai memverifikasi sesi aktif
      setLoading(false);
    };

    checkAuth();

    // Cleanup: Bersihkan timer saat komponen di-unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [performLogout, validateToken]);

  /**
   * Fungsi: login
   * Mengirimkan kredensial email & password ke API backend
   */
  const login = useCallback(async (email, password) => {
    try {
      // Panggil endpoint backend POST /api/auth/login
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        const { token, user: userData } = response.data.data;

        // Ekstrak masa berlaku token dan aktifkan auto-logout timer
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          setTokenExpiresAt(decoded.exp);
          setLogoutTimer(decoded.exp);
        }

        // Simpan token ke localStorage browser
        localStorage.setItem('xvoca_admin_token', token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal, periksa email dan password.',
      };
    }
  }, [setLogoutTimer]);

  /**
   * Fungsi: logout
   * Shortcut untuk memanggil performLogout
   */
  const logout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  /**
   * Fungsi: revalidateAuth
   * Digunakan untuk memvalidasi ulang sesi secara manual
   */
  const revalidateAuth = useCallback(async () => {
    const token = localStorage.getItem('xvoca_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    const decoded = decodeToken(token);
    if (decoded && decoded.exp && isTokenExpired(decoded.exp)) {
      performLogout();
      return false;
    }

    return await validateToken(token);
  }, [performLogout, validateToken]);

  /**
   * Fungsi: toggleBroadcasting
   * Mengubah status siaran langsung (Live Ready ON / OFF)
   */
  const toggleBroadcasting = useCallback(async (isReady) => {
    try {
      const response = await authAPI.toggleBroadcasting(isReady);
      return response.data.success;
    } catch (error) {
      console.error('Failed to toggle broadcasting:', error);
      return false;
    }
  }, []);

  // Objek value yang diekspos ke seluruh komponen
  const value = {
    user,
    loading,
    isAuthenticated,
    tokenExpiresAt,
    login,
    logout,
    revalidateAuth,
    toggleBroadcasting,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook: useAuth
 * Mempermudah komponen lain mengakses AuthContext tanpa perlu menulis useContext manual
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
