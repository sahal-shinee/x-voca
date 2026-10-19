import { useState, useEffect, useCallback } from 'react';
import { getContent, createContent, updateContent, deleteContent, toggleContentVisibility, toggleContentFeatured } from '../../services/contentService';
import ContentCard from '../../components/admin/ContentCard';
import ContentFormPanel from '../../components/admin/ContentFormPanel';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../../utils/firebase';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  EyeOff,
  Star,
  Grid3X3,
  Video,
  Archive,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Command,
  Loader2
} from 'lucide-react';

// Filter dropdown options
const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden / Draft' },
  { value: 'featured', label: 'Featured' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'sort_order', label: 'Sort Index (Asc)' },
  { value: 'sort_order_desc', label: 'Sort Index (Desc)' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

function ContentManagementPage() {
  const toast = useToast();

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    featured: 0,
    featuredTitle: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Content state
  const [contents, setContents] = useState([]);
  const [contentsLoading, setContentsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sort_order');

  // Form panel state
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({ open: false, content: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch contents with filters
  const fetchContents = useCallback(async (page = 1) => {
    setContentsLoading(true);
    try {
      // Build params
      const params = {
        page,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        admin: true, // Get all content including hidden
      };

      // getContent now returns: { success, data: [...contents], pagination }
      const response = await getContent(params);

      // Extract raw contents array from response
      const rawList = Array.isArray(response?.data) ? response.data : [];
      const pagination = response?.pagination;

      // Update stats using full rawList before client-side status filter
      const totalCount = rawList.length;
      const visibleCount = rawList.filter(c => c.is_visible !== false).length;
      const hiddenCount = rawList.filter(c => c.is_visible === false).length;
      const featuredCount = rawList.filter(c => c.is_featured).length;
      const featuredItem = rawList.find(c => c.is_featured);

      setStats({
        total: totalCount,
        visible: visibleCount,
        hidden: hiddenCount,
        featured: featuredCount,
        featuredTitle: featuredItem?.title || null,
      });

      // Apply client-side filters based on status filter
      let data = [...rawList];
      if (statusFilter === 'visible') {
        data = data.filter(c => c.is_visible !== false);
      } else if (statusFilter === 'hidden') {
        data = data.filter(c => c.is_visible === false);
      } else if (statusFilter === 'featured') {
        data = data.filter(c => c.is_featured);
      }

      // Apply sorting
      data = [...data].sort((a, b) => {
        if (sortBy === 'sort_order') {
          return (a.sort_order || 0) - (b.sort_order || 0);
        } else if (sortBy === 'sort_order_desc') {
          return (b.sort_order || 0) - (a.sort_order || 0);
        } else if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        } else {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
      });

      setContents(data);

      // Calculate pagination (after filtering)
      const filteredCount = data.length;
      setTotalItems(filteredCount);
      setTotalPages(Math.ceil(filteredCount / itemsPerPage) || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching contents:', error);
      // Remove fallback dummy data - show empty state instead
      setContents([]);
      setStats({
        total: 0,
        visible: 0,
        hidden: 0,
        featured: 0,
        featuredTitle: null,
      });
    } finally {
      setStatsLoading(false);
      setContentsLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy]);

  // Initialize data & Auto-refresh
  useEffect(() => {
    fetchContents(1);

    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchContents(currentPage);
    }, 60000);

    // Refresh when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchContents(currentPage);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchContents, currentPage]);

  // Real-time listener for content updates via Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    try {
      const database = getFirebaseDatabase();
      if (!database) return;

      const contentUpdatesRef = ref(database, 'content_updates');
      let isFirstMount = true;

      const unsubscribe = onValue(contentUpdatesRef, (snapshot) => {
        if (isFirstMount) {
          isFirstMount = false;
          return;
        }

        if (snapshot.exists()) {
          console.log('[AdminContent] Realtime update signal received from Firebase');
          fetchContents(currentPage);
        }
      });

      return () => {
        off(contentUpdatesRef);
      };
    } catch (err) {
      console.warn('[AdminContent] Firebase listener error:', err.message);
    }
  }, [fetchContents, currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortBy]);

  // Open form for new content
  const handleAddContent = () => {
    setEditingContent(null);
    setFormPanelOpen(true);
  };

  // Open form for edit
  const handleEditContent = (content) => {
    setEditingContent(content);
    setFormPanelOpen(true);
  };

  // Handle save content
  const handleSaveContent = async (data) => {
    setFormLoading(true);
    try {
      if (editingContent) {
        await updateContent(editingContent.id, data);
        toast.success('Konten katalog berhasil diperbarui.');
      } else {
        await createContent(data);
        toast.success('Konten katalog baru berhasil ditambahkan.');
      }
      setFormPanelOpen(false);
      setEditingContent(null);
      fetchContents(currentPage);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(error?.response?.data?.message || 'Gagal menyimpan konten.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = async (content) => {
    try {
      const nextVisible = !content.is_visible;
      await toggleContentVisibility(content.id, nextVisible);
      toast.success(nextVisible ? 'Konten kini tayang di portal publik.' : 'Konten dialihkan ke status Draft / Hidden.');
      fetchContents(currentPage);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Gagal mengubah visibilitas konten.');
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (content) => {
    try {
      const nextFeatured = !content.is_featured;
      await toggleContentFeatured(content.id, nextFeatured);
      toast.success(nextFeatured ? 'Konten dijadikan Sorotan Utama (Featured Banner).' : 'Konten dicopot dari Sorotan Utama.');
      fetchContents(currentPage);
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Gagal mengubah status sorotan.');
    }
  };

  // Handle delete
  const handleDeleteClick = (content) => {
    setDeleteModal({ open: true, content });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.content) return;

    setDeleteLoading(true);
    try {
      await deleteContent(deleteModal.content.id);
      setDeleteModal({ open: false, content: null });
      toast.success('Konten katalog berhasil dihapus.');
      fetchContents(currentPage);
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Gagal menghapus konten.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, content: null });
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchContents(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchContents(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-accent-purple" />
            <span className="text-xs font-mono text-accent-purple tracking-wider">CONTENT VAULT</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-display">Manajemen Content Guide</h1>
          <p className="text-sm text-text-muted mt-1">Kelola katalog konten, arsip video, dan playlist YouTube</p>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddContent}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Tambah Konten
        </button>
      </div>

      {/* ========== SUMMARY CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Konten */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Konten</p>
              {statsLoading ? (
                <div className="h-6 w-12 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <p className="text-xl font-bold font-mono text-text-primary">
                  {stats.total} Entries
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Publik Visible */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-done/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-status-done" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Publik Visible</p>
              {statsLoading ? (
                <div className="h-6 w-16 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <p className="text-xl font-bold font-mono text-status-done">
                  {stats.visible} Aktif
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Hidden / Draft */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-live/10 flex items-center justify-center">
              <Archive className="w-5 h-5 text-status-live" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Hidden / Draft</p>
              {statsLoading ? (
                <div className="h-6 w-8 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <p className="text-xl font-bold font-mono text-status-live">
                  {stats.hidden} Diarsipkan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Featured Series */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-muted">Featured Series</p>
              {statsLoading ? (
                <div className="h-6 w-20 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <p className="text-sm font-semibold text-accent-gold truncate">
                  {stats.featured > 0 ? stats.featuredTitle : 'Tidak ada'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== FILTER BAR ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left - Info */}
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-mono text-text-muted">GRID KURASI</span>
            <span className="text-xs text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">
              {contents.length} dari {stats.total} arsip
            </span>
          </div>

          {/* Right - Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau tag game..."
                className="pl-9 pr-10 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none w-56"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-bg-card border border-border-subtle rounded text-text-muted">
                <Command className="w-3 h-3 inline" />
              </kbd>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========== CONTENT GRID ========== */}
      {contentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
              <div className="aspect-video bg-bg-input animate-shimmer"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 w-20 bg-bg-input rounded animate-shimmer"></div>
                <div className="h-5 w-full bg-bg-input rounded animate-shimmer"></div>
                <div className="h-4 w-32 bg-bg-input rounded animate-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="bg-bg-card border border-border-subtle rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-purple/10 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-accent-purple opacity-50" />
          </div>
          <p className="text-text-muted mb-4">Tidak ada konten untuk ditampilkan</p>
          <button
            onClick={handleAddContent}
            className="flex items-center gap-2 px-4 py-2 mx-auto bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah Konten Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onEdit={handleEditContent}
              onToggleVisibility={handleToggleVisibility}
              onToggleFeatured={handleToggleFeatured}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* ========== PAGINATION ========== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-sm text-text-primary">
            Halaman <span className="font-mono font-semibold">{currentPage}</span> dari <span className="font-mono">{totalPages}</span>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========== CONTENT FORM PANEL ========== */}
      <ContentFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false);
          setEditingContent(null);
        }}
        onSave={handleSaveContent}
        content={editingContent}
        loading={formLoading}
      />

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <Modal
        isOpen={deleteModal.open}
        onClose={handleDeleteCancel}
        title="Konfirmasi Hapus Konten"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        variant="danger"
        loading={deleteLoading}
      >
        <p className="text-text-secondary text-sm">
          Apakah kamu yakin ingin menghapus konten <span className="text-text-primary font-semibold">"{deleteModal.content?.title}"</span>?
        </p>
        <p className="text-text-muted text-xs mt-2">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}

export default ContentManagementPage;
