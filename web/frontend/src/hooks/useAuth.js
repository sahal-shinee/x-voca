/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useAuth.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Shortcut hook untuk mengakses AuthContext secara bersih dan aman.
 * Menghindari pemanggilan `useContext(AuthContext)` berulang kali di banyak file.
 * ============================================================================
 */

import { useAuth } from '../context/AuthContext';

export function useAuth() {
  // This is a re-export for convenience
  return useAuth();
}

export default useAuth;
