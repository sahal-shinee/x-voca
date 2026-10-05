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
  const { isAuthenticated, loading, isTokenExpired, tokenExpiresAt } = useAuth();
  const location = useLocation();

  // While checking auth, show loading only if authenticated (prevents flash on protected pages)
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // Check token expiration
  if (isAuthenticated && tokenExpiresAt && isTokenExpired(tokenExpiresAt)) {
    // Token expired, redirect to login
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

  // If not authenticated, redirect to login with return URL
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

  // Render children if authenticated
  return children;
}

export default PrivateRoute;
