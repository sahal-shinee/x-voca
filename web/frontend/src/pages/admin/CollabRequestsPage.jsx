import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Inbox,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useCollabRequests } from '../../hooks/useCollabRequests';
import CollabRequestCard from '../../components/admin/CollabRequestCard';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

/**
 * Filter status tabs
 */
const STATUS_TABS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'pending', label: 'PENDING' },
  { key: 'approved', label: 'APPROVED' },
  { key: 'rejected', label: 'REJECTED' },
];

/**
 * Generate period options (current and past 6 months)
 */
function getPeriodOptions() {
  const options = [{ value: 'all', label: 'Semua Periode' }];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }

  return options;
}

/**
 * CollabRequestsPage - Admin page for moderating viewer collab requests
 */
function CollabRequestsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Filters state
  const [activeStatus, setActiveStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom hook for requests & stats
  const {
    requests,
    stats,
    pagination,
    loading,
    error,
    fetchRequests,
    reviewRequest,
    deleteRequest,
    refetch
  } = useCollabRequests({
    status: activeStatus === 'all' ? undefined : activeStatus,
    period: selectedPeriod === 'all' ? undefined : selectedPeriod,
    search: activeSearch || undefined,
    page: currentPage,
    limit: pageSize
  });

  const periodOptions = useMemo(() => getPeriodOptions(), []);

  // Fetch when filters or pagination changes
  useEffect(() => {
    fetchRequests({
      status: activeStatus === 'all' ? undefined : activeStatus,
      period: selectedPeriod === 'all' ? undefined : selectedPeriod,
      search: activeSearch || undefined,
      page: currentPage,
      limit: pageSize
    });
  }, [activeStatus, selectedPeriod, activeSearch, currentPage, pageSize, fetchRequests]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchInput.trim());
  };

  // Clear all filters
  const handleResetFilters = () => {
    setActiveStatus('all');
    setSelectedPeriod('all');
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  // Approve action
  const handleApprove = async (id, notes) => {
    const res = await reviewRequest(id, { action: 'approve', notes });
    if (res.success) {
      toast.success(res.message || 'Request collab berhasil disetujui.');
    } else {
      toast.error(res.message || 'Gagal menyetujui request.');
    }
  };

  // Reject action
  const handleReject = async (id, notes) => {
    const res = await reviewRequest(id, { action: 'reject', notes });
    if (res.success) {
      toast.info(res.message || 'Request collab berhasil ditolak.');
    } else {
      toast.error(res.message || 'Gagal menolak request.');
    }
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteRequest(deleteModal.id);
      if (res.success) {
        toast.success('Request collab berhasil dihapus.');
      } else {
        toast.error(res.message || 'Gagal menghapus request.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, id: null });
    }
  };

  // Add to Schedule navigation
  const handleAddToSchedule = (request) => {
    const query = new URLSearchParams({
      action: 'create',
      collab_guest: request.requested_streamer_name || '',
      collab_social: request.requested_streamer_social || ''
    }).toString();
    navigate(`/admin/schedules?${query}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary tracking-tight">
            Collab Requests
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola dan moderasi permintaan collab streamer dari viewer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={RefreshCw}
            loading={loading}
            onClick={refetch}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <StatCard
          icon={Users}
          label="Total Permintaan"
          value={stats.total || 0}
          subtitle="Semua request periode aktif"
          loading={loading && requests.length === 0}
          variant="default"
        />

        {/* Pending Requests */}
        <StatCard
          icon={Clock}
          label="Menunggu Review"
          value={stats.pending || 0}
          subtitle="Perlu ditinjau admin"
          loading={loading && requests.length === 0}
          variant={stats.pending > 0 ? 'highlight' : 'default'}
        />

        {/* Approved Requests */}
        <StatCard
          icon={CheckCircle2}
          label="Telah Disetujui"
          value={stats.approved || 0}
          subtitle="Siap dijadwalkan stream"
          loading={loading && requests.length === 0}
          variant="default"
        />

        {/* Rejected Requests */}
        <StatCard
          icon={XCircle}
          label="Ditolak / Arsip"
          value={stats.rejected || 0}
          subtitle="Permintaan tidak disetujui"
          loading={loading && requests.length === 0}
          variant="default"
        />
      </div>

      {/* 3. FILTER BAR */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-bg-surface border border-border-subtle rounded-xl overflow-x-auto scrollbar-hide">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveStatus(tab.key);
                  setCurrentPage(1);
                }}
                className={`
                  px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap
                  transition-all duration-150
                  ${
                    activeStatus === tab.key
                      ? 'bg-accent-cyan text-text-on-cta shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                  }
                `}
              >
                {tab.label}
                {tab.key === 'pending' && stats.pending > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-status-live text-white rounded-full text-[10px]">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right side: Period select & Search bar */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Period Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted hidden sm:block" />
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter berdasarkan Periode"
                className="px-3 py-2 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer font-mono"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari streamer / pesan..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan"
              />
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Clear Filter Button */}
            {(activeStatus !== 'all' || selectedPeriod !== 'all' || activeSearch !== '') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-text-muted hover:text-accent-cyan whitespace-nowrap px-2 py-1 font-mono transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. REQUEST LIST & SKELETON */}
      {error && (
        <div className="p-4 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && requests.length === 0 ? (
        // Skeleton Loaders
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-bg-card rounded-2xl p-5 border border-border-subtle space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-surface" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-bg-surface rounded" />
                  <div className="h-3 w-20 bg-bg-surface rounded" />
                </div>
              </div>
              <div className="h-10 bg-bg-surface rounded-xl" />
              <div className="h-6 w-full bg-bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        // Empty State
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
            <Inbox className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            Tidak Ada Request Collab
          </h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {activeSearch || activeStatus !== 'all' || selectedPeriod !== 'all'
              ? 'Tidak ada permintaan collab yang cocok dengan filter pencarian yang diterapkan.'
              : 'Belum ada viewer yang mengajukan permintaan collab streamer saat ini.'}
          </p>
          {(activeSearch || activeStatus !== 'all' || selectedPeriod !== 'all') && (
            <div className="pt-2">
              <Button size="sm" variant="secondary" onClick={handleResetFilters}>
                Bersihkan Filter
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Cards Grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <CollabRequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={(id) => setDeleteModal({ open: true, id })}
              onAddToSchedule={handleAddToSchedule}
            />
          ))}
        </div>
      )}

      {/* 5. PAGINATION BAR */}
      {pagination.totalPages > 1 && (
        <div className="bg-bg-card border border-border-subtle rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
            <span>
              Menampilkan <span className="text-text-primary">{requests.length}</span> dari{' '}
              <span className="text-text-primary">{pagination.total}</span> permintaan
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span>Per hal:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-bg-surface border border-border-subtle rounded text-text-primary text-xs font-mono"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={ChevronLeft}
            >
              Sebelumnya
            </Button>

            <span className="px-3 py-1 text-xs font-mono text-text-secondary bg-bg-surface rounded-lg border border-border-subtle">
              {pagination.page} / {pagination.totalPages}
            </span>

            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              rightIcon={ChevronRight}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Hapus Request Collab"
        variant="danger"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-text-secondary">
          Apakah Anda yakin ingin menghapus request collab ini? Tindakan ini tidak dapat dibatalkan dan catatan request akan dihapus dari sistem.
        </p>
      </Modal>
    </div>
  );
}

export default CollabRequestsPage;

