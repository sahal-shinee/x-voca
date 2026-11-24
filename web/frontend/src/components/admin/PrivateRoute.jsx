/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/PrivateRoute.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen pembungkus rute privat (Route Guard).
 * Memeriksa status login pengguna via `useAuth()`:
 * - Jika `isAuthenticated` bernilai true, merender halaman anak (`children`).
 * - Jika tidak memiliki sesi login aktif, otomatis mengarahkan ke `/admin/login`.
 * ============================================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute - Protected route wrapper
 *
 * Security features:
 * 1. Immediate redirect if not authenticated (no loading flash for unauthenticated users)
 * 2. Token expiration check
 * 3. Return URL preservation for post-login redirect
 */
function PrivateRoute({ children }) {
  // Ambil data status autentikasi dari AuthContext
  const { isAuthenticated, loading, isTokenExpired, tokenExpiresAt } = useAuth();
  // Tangkap lokasi URL saat ini agar pengguna bisa dikembalikan ke halaman ini setelah login
  const location = useLocation();

  // 1. TAHAP PEMERIKSAAN AWAL (Loading State)
  // Menampilkan spinner putar saat aplikasi sedang memverifikasi token di localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm font-medium">Memverifikasi keabsahan sesi admin...</p>
        </div>
      </div>
    );
  }

  // 2. TAHAP PEMERIKSAAN KEDALUWARSA TOKEN (Expiration Guard)
  // Jika token JWT sudah hangus (melewati batas waktu exp), tendang ke login dengan alasan 'expired'
  if (isAuthenticated && tokenExpiresAt && isTokenExpired(tokenExpiresAt)) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location.pathname,
          reason: 'expired'
        }}
        replace
      />
    );
  }

  // 3. TAHAP PEMERIKSAAN LOGIN (Authentication Guard)
  // Jika pengguna belum login sama sekali, blokir akses dan alihkan ke `/admin/login`
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location.pathname,
          reason: 'unauthenticated'
        }}
        replace
      />
    );
  }

  // 4. AKSES DIIZINKAN: Pengguna adalah admin yang sah, render komponen halaman privat
  return children;
}

export default PrivateRoute;
