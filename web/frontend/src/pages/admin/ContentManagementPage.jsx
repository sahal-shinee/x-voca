import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getContent,
  createContent,
  updateContent,
  deleteContent,
  toggleContentVisibility,
  toggleContentFeatured,
} from '../../services/contentService';
import ContentCard from '../../components/admin/ContentCard';
import ContentRow from '../../components/admin/ContentRow';
import ContentFormPanel from '../../components/admin/ContentFormPanel';
import Modal from '../../components/common/Modal';
import CustomSelect from '../../components/common/CustomSelect';
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
  Video,
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  LayoutGrid,
  List,
  Layers,
  Clock,
  Sparkles,
  X,
  Play,
} from 'lucide-react';

// Status tab definitions
const STATUS_TABS = [
  { key: 'all',      label: 'SEMUA',          statKey: 'total' },
  { key: 'visible',  label: 'PUBLIK AKTIF',   statKey: 'visible' },
  { key: 'hidden',   label: 'DRAFT / HIDDEN', statKey: 'hidden' },
  { key: 'featured', label: 'SOROTAN UTAMA',  statKey: 'featured' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'sort_order',      label: 'Urutan Indeks (Asc)' },
  { value: 'sort_order_desc', label: 'Urutan Indeks (Desc)' },
  { value: 'newest',          label: 'Terbaru Ditambahkan' },
  { value: 'oldest',          label: 'Terlama Ditambahkan' },
];

function ContentManagementPage() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const prefillProcessedRef = useRef(false);

  // View mode: 'cards' vs 'table'
  const [viewMode, setViewMode] = useState('cards');

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    featured: 0,
    featuredItem: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Content state
  const [contents, setContents] = useState([]);
  const [allRawContents, setAllRawContents] = useState([]);
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

  // Check if routed with prefilled schedule data from SchedulePage (runs strictly once)
  useEffect(() => {
    if (location.state?.prefillSchedule && !prefillProcessedRef.current) {
      prefillProcessedRef.current = true;
      const p = location.state.prefillSchedule;

      setEditingContent({
        isNew: true,
        title: p.title || '',
        game_tag: p.game_tag || 'Gaming',
        youtube_url: p.youtube_url || '',
        thumbnail_url: p.thumbnail_url || '',
        content_type: 'video',
        video_count: 1,
        total_duration: p.total_duration || '2-3 Jam',
        is_featured: false,
        is_visible: true,
        sort_order: 1,
      });
      setFormPanelOpen(true);
      toast.success(`Data siaran "${p.title}" berhasil dimuat ke formulir Content Guide.`);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({ open: false, content: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch contents with filters
  const fetchContents = useCallback(async (page = 1) => {
    setContentsLoading(true);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        admin: true,
      };

      const response = await getContent(params);
      const rawList = Array.isArray(response?.data) ? response.data : [];
      setAllRawContents(rawList);

      // Compute stats
      const totalCount = rawList.length;
      const visibleCount = rawList.filter((c) => c.is_visible !== false).length;
      const hiddenCount = rawList.filter((c) => c.is_visible === false).length;
      const featuredCount = rawList.filter((c) => c.is_featured).length;
      const featuredItem = rawList.find((c) => c.is_featured) || null;

      setStats({
        total: totalCount,
        visible: visibleCount,
        hidden: hiddenCount,
        featured: featuredCount,
        featuredItem,
      });

      // Filter
      let data = [...rawList];
      if (statusFilter === 'visible') {
        data = data.filter((c) => c.is_visible !== false);
      } else if (statusFilter === 'hidden') {
        data = data.filter((c) => c.is_visible === false);
      } else if (statusFilter === 'featured') {
        data = data.filter((c) => c.is_featured);
      }

      // Sort
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

      const filteredCount = data.length;
      setTotalItems(filteredCount);
      setTotalPages(Math.ceil(filteredCount / itemsPerPage) || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setContents([]);
      setStats({
        total: 0,
        visible: 0,
        hidden: 0,
        featured: 0,
        featuredItem: null,
      });
    } finally {
      setStatsLoading(false);
      setContentsLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy]);

  // Initial mount
  useEffect(() => {
    fetchContents(1);

    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchContents(currentPage);
    }, 60000);

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

  // Real-time listener via Firebase
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

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortBy]);

  // Action handlers
  const handleAddContent = () => {
    setEditingContent(null);
    setFormPanelOpen(true);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setFormPanelOpen(true);
  };

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

  const handleOpenPublicPortal = () => {
    window.open('/content-guide', '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── 1. Page Header & Command Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Manajemen Content Guide
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Kelola katalog konten, arsip video, dan playlist YouTube untuk portal penonton
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-bg-surface border border-border-subtle rounded-xl h-9">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`h-7 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-accent-cyan text-text-on-cta font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Grid Kartu"
              aria-label="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`h-7 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-accent-cyan text-text-on-cta font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Tabel Kurasi"
              aria-label="Tampilan Tabel Kurasi"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Tabel</span>
            </button>
          </div>

          {/* Refresh Manual */}
          <button
            type="button"
            onClick={() => fetchContents(currentPage)}
            disabled={contentsLoading}
            className="h-10 flex items-center gap-1.5 px-3.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            title="Muat ulang konten"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${contentsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Link ke Portal Publik */}
          <button
            type="button"
            onClick={handleOpenPublicPortal}
            className="h-10 flex items-center gap-1.5 px-3.5 text-xs font-semibold text-accent-purple bg-accent-purple/10 border border-accent-purple/30 rounded-xl hover:bg-accent-purple/20 transition-colors"
            title="Buka halaman Content Guide viewer di tab baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Publik</span>
          </button>

          {/* Tambah Konten */}
          <button
            type="button"
            onClick={handleAddContent}
            className="h-10 inline-flex items-center gap-2 px-4.5 bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap justify-center"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Konten</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Interactive Metric Ribbon (4 Clickable Cards) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Konten */}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${statusFilter === 'all'
              ? 'border-accent-purple ring-2 ring-accent-purple/20 bg-accent-purple/5'
              : 'border-border-subtle hover:border-accent-purple/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Total Konten</p>
            <div className="w-8 h-8 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-purple">
              {String(stats.total || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">entries</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Semua arsip katalog</p>
        </button>

        {/* Publik Visible */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'visible' ? 'all' : 'visible')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${statusFilter === 'visible'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
              : 'border-border-subtle hover:border-emerald-500/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Publik Visible</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {String(stats.visible || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">aktif</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Tayang di portal penonton</p>
        </button>

        {/* Hidden / Draft */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'hidden' ? 'all' : 'hidden')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${statusFilter === 'hidden'
              ? 'border-status-live ring-2 ring-status-live/20 bg-status-live/5'
              : 'border-border-subtle hover:border-status-live/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Hidden / Draft</p>
            <div className="w-8 h-8 rounded-xl bg-status-live/10 border border-status-live/20 flex items-center justify-center text-status-live">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-status-live">
              {String(stats.hidden || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">disimpan</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Disembunyikan dari publik</p>
        </button>

        {/* Sorotan Utama (Featured) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'featured' ? 'all' : 'featured')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${statusFilter === 'featured'
              ? 'border-accent-gold ring-2 ring-accent-gold/20 bg-accent-gold/5'
              : 'border-border-subtle hover:border-accent-gold/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Sorotan Utama</p>
            <div className="w-8 h-8 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Star className="w-4 h-4 fill-accent-gold/30" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-gold">
              {String(stats.featured || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">sorotan</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">
            {stats.featuredItem ? stats.featuredItem.title : 'Belum ditentukan'}
          </p>
        </button>
      </div>

      {/* ── 3. Filter Bar & Controls ─────────────────────────────────────────── */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs with Live Badges */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const count = stats[tab.statKey] || 0;
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`
                    px-3 py-2 text-xs font-mono font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5
                    ${isActive
                      ? 'bg-accent-cyan text-text-on-cta shadow-sm font-bold'
                      : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border-subtle'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black/15 text-text-on-cta' : 'bg-bg-card text-text-secondary'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau tag..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="w-44">
              <CustomSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
                size="sm"
                aria-label="Urutkan Konten"
              />
            </div>

            {/* Reset Filter Button */}
            {(statusFilter !== 'all' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-accent-cyan hover:underline whitespace-nowrap px-2 py-1 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Sub-counter */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <span>
            Menampilkan <strong className="text-text-primary font-mono">{contents.length}</strong> dari{' '}
            <strong className="text-text-primary font-mono">{stats.total}</strong> arsip
          </span>
          <span className="font-mono text-[11px]">
            Mode: <strong className="text-text-secondary">{viewMode === 'cards' ? 'Grid Visual' : 'Tabel Kurasi'}</strong>
          </span>
        </div>
      </div>

      {/* ── 4. Main Content Area ─────────────────────────────────────────────── */}
      {contentsLoading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-bg-surface" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-bg-surface rounded" />
                  <div className="h-5 w-full bg-bg-surface rounded" />
                  <div className="h-4 w-32 bg-bg-surface rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        )
      ) : contents.length === 0 ? (
        // Empty State
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
            <Video className="w-7 h-7 opacity-40" />
          </div>
          <h4 className="text-base font-bold text-text-primary">Tidak Ada Konten Ditemukan</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `Tidak ada konten yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
              : statusFilter !== 'all'
              ? `Belum ada konten dengan status filter "${statusFilter}".`
              : 'Belum ada konten katalog yang ditambahkan ke Content Guide.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(searchQuery || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Reset Semua Filter
              </button>
            )}
            <button
              type="button"
              onClick={handleAddContent}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Konten Pertama</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        // ── Grid Cards View ──
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      ) : (
        // ── Table Curation View ──
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface/50 text-[11px] font-mono uppercase text-text-muted">
                  <th className="py-3 px-4 font-semibold">Konten & Kategori</th>
                  <th className="py-3 px-4 font-semibold">Tipe</th>
                  <th className="py-3 px-4 font-semibold">Indeks</th>
                  <th className="py-3 px-4 font-semibold">Visibilitas</th>
                  <th className="py-3 px-4 font-semibold">Sorotan</th>
                  <th className="py-3 px-4 font-semibold">Tautan</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {contents.map((content) => (
                  <ContentRow
                    key={content.id}
                    content={content}
                    onEdit={handleEditContent}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleFeatured={handleToggleFeatured}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Pagination Bar ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="bg-bg-card border border-border-subtle rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:text-text-primary disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs font-mono text-text-muted">
            Halaman <strong className="text-text-primary">{currentPage}</strong> dari{' '}
            <strong className="text-text-primary">{totalPages}</strong>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:text-text-primary disabled:opacity-40 transition-colors"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 6. Content Form Slide-Over Panel ─────────────────────────────────── */}
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

      {/* ── 7. Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, content: null })}
        title="Konfirmasi Hapus Konten"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        variant="danger"
        loading={deleteLoading}
      >
        <div className="space-y-2">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin menghapus konten{' '}
            <strong className="text-text-primary">"{deleteModal.content?.title}"</strong>?
          </p>
          <p className="text-text-muted text-xs">
            Tindakan ini tidak dapat dibatalkan. Konten akan dihapus dari katalog Content Guide.
          </p>
        </div>
      </Modal>

    </div>
  );
}

export default ContentManagementPage;
