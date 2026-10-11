import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import PrivateRoute from './components/admin/PrivateRoute';

// Viewer Pages
import HomePage from './pages/viewer/HomePage';
import VotingPage from './pages/viewer/VotingPage';
import ContentGuidePage from './pages/viewer/ContentGuidePage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SchedulePage from './pages/admin/SchedulePage';
import VotingModerationPage from './pages/admin/VotingModerationPage';
import CollabRequestsPage from './pages/admin/CollabRequestsPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';

/**
 * PublicAdminRoute - Redirects authenticated users away from login page
 */
function PublicAdminRoute({ children }) {
  const token = localStorage.getItem('xvoca_admin_token');

  // If token exists, user is likely logged in - redirect to dashboard
  if (token) {
    // Don't render children, redirect immediately
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

/**
 * AppRouter - Main router component with auth protection
 * This wrapper handles auth navigation protection
 */
function AppRouter() {
  return (
    <Routes>
      {/* ========== PUBLIC VIEWER ROUTES ========== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/voting" element={<VotingPage />} />
      <Route path="/content" element={<ContentGuidePage />} />
      <Route path="/games" element={<VotingPage />} />

      {/* ========== PUBLIC ADMIN ROUTES ========== */}
      <Route
        path="/admin/login"
        element={
          <PublicAdminRoute>
            <LoginPage />
          </PublicAdminRoute>
        }
      />

      {/* ========== PROTECTED ADMIN ROUTES ========== */}
      {/* All admin routes are wrapped in PrivateRoute for security */}
      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/schedules" element={<SchedulePage />} />
        <Route path="/admin/voting" element={<VotingModerationPage />} />
        <Route path="/admin/collab-requests" element={<CollabRequestsPage />} />
        <Route path="/admin/content" element={<ContentManagementPage />} />
      </Route>

      {/* ========== CATCH ALL ========== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
