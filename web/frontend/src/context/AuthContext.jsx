import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const logoutTimerRef = useRef(null);

  // Decode JWT token to get expiration time
  const decodeToken = (token) => {
    try {
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
        exp: payload.exp,
        iat: payload.iat,
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    return Date.now() >= expiresAt * 1000;
  };

  // Set logout timer based on token expiration
  const setLogoutTimer = useCallback((expiresAt) => {
    // Clear existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!expiresAt) return;

    const now = Date.now();
    const expiryTime = expiresAt * 1000;
    const timeUntilExpiry = expiryTime - now;

    // Set timer to logout 1 second before token expires
    if (timeUntilExpiry > 1000) {
      logoutTimerRef.current = setTimeout(() => {
        console.log('Token expired, logging out...');
        logout();
      }, timeUntilExpiry - 1000);
    } else if (timeUntilExpiry > 0) {
      // Token expires very soon, logout immediately
      logoutTimerRef.current = setTimeout(() => {
        console.log('Token expired, logging out...');
        logout();
      }, timeUntilExpiry);
    }
  }, []);

  // Perform logout
  const performLogout = useCallback(() => {
    localStorage.removeItem('xvoca_admin_token');
    setUser(null);
    setIsAuthenticated(false);
    setTokenExpiresAt(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // Redirect to login
    window.location.href = '/admin/login';
  }, []);

  // Validate current token with backend
  const validateToken = useCallback(async (token) => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setIsAuthenticated(true);

        // Decode token to get expiration
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

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('xvoca_admin_token');

      if (!token) {
        setLoading(false);
        return;
      }

      // First, check if token is already expired (client-side check)
      const decoded = decodeToken(token);
      if (decoded && decoded.exp && isTokenExpired(decoded.exp)) {
        console.log('Token expired (client-side check), clearing...');
        performLogout();
        return;
      }

      // Validate token with backend
      const isValid = await validateToken(token);

      if (!isValid) {
        performLogout();
        return;
      }

      setLoading(false);
    };

    checkAuth();

    // Cleanup on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [performLogout, validateToken]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        const { token, user: userData } = response.data.data;

        // Decode token to get expiration
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          setTokenExpiresAt(decoded.exp);
          setLogoutTimer(decoded.exp);
        }

        localStorage.setItem('xvoca_admin_token', token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }, [setLogoutTimer]);

  // Logout function
  const logout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // Re-validate auth (for manual checks)
  const revalidateAuth = useCallback(async () => {
    const token = localStorage.getItem('xvoca_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    // Check client-side expiration first
    const decoded = decodeToken(token);
    if (decoded && decoded.exp && isTokenExpired(decoded.exp)) {
      performLogout();
      return false;
    }

    return await validateToken(token);
  }, [performLogout, validateToken]);

  // Toggle broadcasting status
  const toggleBroadcasting = useCallback(async (isReady) => {
    try {
      const response = await authAPI.toggleBroadcasting(isReady);
      return response.data.success;
    } catch (error) {
      console.error('Failed to toggle broadcasting:', error);
      return false;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    tokenExpiresAt,
    login,
    logout,
    revalidateAuth,
    toggleBroadcasting,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
