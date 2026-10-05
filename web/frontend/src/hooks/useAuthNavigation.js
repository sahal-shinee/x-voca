import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to protect route navigation
 * Validates auth before allowing navigation to protected routes
 */
export function useAuthNavigation() {
  const { isAuthenticated, loading, isTokenExpired, tokenExpiresAt, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if navigation to a protected route is allowed
  const canNavigateTo = useCallback(
    (path) => {
      // Protected admin routes
      const protectedPaths = ['/admin/dashboard', '/admin/schedules', '/admin/voting', '/admin/content'];
      const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

      if (!isProtectedPath) {
        return true; // Allow navigation to public paths
      }

      // Check if authenticated and token is valid
      if (loading) {
        return false; // Don't navigate while checking auth
      }

      if (!isAuthenticated) {
        return false; // Not authenticated
      }

      // Check token expiration
      if (tokenExpiresAt && isTokenExpired(tokenExpiresAt)) {
        return false; // Token expired
      }

      return true; // Allowed
    },
    [isAuthenticated, loading, isTokenExpired, tokenExpiresAt]
  );

  // Protect navigation to admin routes
  useEffect(() => {
    // Only check on admin route changes
    if (!location.pathname.startsWith('/admin')) {
      return;
    }

    // Skip if still loading (auth check in progress)
    if (loading) {
      return;
    }

    // If not authenticated, navigate to login
    if (!isAuthenticated) {
      navigate('/admin/login', {
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    // Check token expiration
    if (tokenExpiresAt && isTokenExpired(tokenExpiresAt)) {
      console.log('Token expired during navigation, logging out...');
      logout();
      navigate('/admin/login', {
        state: { from: location.pathname, reason: 'expired' },
        replace: true,
      });
    }
  }, [location.pathname, loading, isAuthenticated, isTokenExpired, tokenExpiresAt, logout, navigate]);

  return {
    canNavigateTo,
    isAllowed: !loading && isAuthenticated && (!tokenExpiresAt || !isTokenExpired(tokenExpiresAt)),
  };
}

export default useAuthNavigation;
