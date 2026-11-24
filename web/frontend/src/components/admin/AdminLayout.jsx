/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/AdminLayout.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kerangka tata letak utama (Layout Shell) Studio Admin X-VOCA.
 * Menggabungkan `Sidebar` di sebelah kiri, `Topbar` di bagian atas, dan area konten dinamis
 * yang responsif baik di desktop maupun tablet/smartphone.
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SearchModal from './SearchModal';
import SkipToContent from '../common/SkipToContent';
import { useTheme } from '../../hooks/useTheme';

/**
 * AdminLayout Component
 * Root layout container for the admin panel.
 * Composes the modular Sidebar, Topbar, SearchModal, and route Outlet.
 */
export function AdminLayout() {
  const location = useLocation();
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Keyboard shortcut (Cmd+K or Ctrl+K) to open Quick Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on navigation
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }

  return (
    <div
      id="admin-root"
      data-theme={theme}
      className="min-h-screen bg-bg-base flex text-text-primary antialiased transition-colors duration-200"
    >
      {/* Keyboard Accessibility Bypass Link */}
      <SkipToContent targetId="main-content" />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modular Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] lg:h-screen overflow-hidden">
        {/* Modular Topbar */}
        <Topbar
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenSearch={() => setSearchModalOpen(true)}
        />

        {/* Routed Page Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 lg:p-6 overflow-y-auto focus:outline-none">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

export default AdminLayout;
