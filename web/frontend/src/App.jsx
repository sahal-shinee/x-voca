import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import PrivateRoute from './components/admin/PrivateRoute';

// Viewer Pages - HomePage is loaded eagerly for instant LCP & initial render
import HomePage from './pages/viewer/HomePage';

// Lazy Loaded Secondary Viewer Pages
const VotingPage = lazy(() => import('./pages/viewer/VotingPage'));
const ContentGuidePage = lazy(() => import('./pages/viewer/ContentGuidePage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

// Admin Pages (Lazy loaded so public visitors never download heavy admin modules)
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const SchedulePage = lazy(() => import('./pages/admin/SchedulePage'));
const VotingModerationPage = lazy(() => import('./pages/admin/VotingModerationPage'));
const CollabRequestsPage = lazy(() => import('./pages/admin/CollabRequestsPage'));
const ContentManagementPage = lazy(() => import('./pages/admin/ContentManagementPage'));
const TodoPage = lazy(() => import('./pages/admin/TodoPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

/**
 * Cyber Route Loading Fallback
 */
const RouteLoader = () => (
  <div className="min-h-screen bg-[#0D0B14] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-2 border-[#7ee0d2]/20 border-t-[#7ee0d2] rounded-full animate-spin" />
    <span className="text-[11px] text-[#a89ec0] font-mono tracking-widest uppercase animate-pulse">
      Memuat Sistem...
    </span>
  </div>
);

/**
 * PublicAdminRoute - Redirects authenticated users away from login page
 */
function PublicAdminRoute({ children }) {
  const token = localStorage.getItem('xvoca_admin_token');

  // If token exists, user is likely logged in - redirect to dashboard
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

/**
 * AppRouter - Main router component with auth protection
 */
function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
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
          <Route path="/admin/todos" element={<TodoPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* ========== CATCH ALL / 404 ========== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </ErrorBoundary>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
