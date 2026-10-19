import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Bookmark,
  CalendarCheck,
  CalendarPlus,
  Search,
  RefreshCw,
  Inbox,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useCollabRequests } from '../../hooks/useCollabRequests';
import CollabRequestRow, { STATUS_CONFIG } from '../../components/admin/CollabRequestRow';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { safeFormatTimeAgo, safeFormatDate } from '../../utils/dateUtils';

/**
 * Filter status tabs (Opsi B: Alur Kerja Kreator)
 */
const STATUS_TABS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'pending', label: 'BARU' },
  { key: 'approved', label: 'DISIMPAN' },
  { key: 'scheduled', label: 'DIJADWALKAN' },
  { key: 'rejected', label: 'ARSIP' },
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
 * CollabRequestsPage - Admin page for managing viewer collab requests in a compact, informative list
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

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [noteModal, setNoteModal] = useState({
    open: false,
    request: null,
    notes: '',
    isSaving: false
  });

  const [messageModal, setMessageModal] = useState({
    open: false,
    request: null
  });

  // Custom hook for requests & stats
  const {
    requests,
    stats,
    pagination,
    loading,
    error,
    fetchRequests,
    updateStatus,
    updateNotes,
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

  // Fetch when filters or pagination change
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

  // Update status action (Baru, Disimpan, Dijadwalkan, Arsip)
  const handleUpdateStatus = async (id, newStatus) => {
    const res = await updateStatus(id, newStatus);
    if (res.success) {
      const label = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`Status berhasil diubah menjadi ${label}.`);
    } else {
      toast.error(res.message || 'Gagal mengubah status usulan.');
    }
  };

  // Open note modal
  const handleOpenNoteModal = (request) => {
    setNoteModal({
      open: true,
      request,
      notes: request.review_notes || '',
      isSaving: false
    });
  };

  // Save note action
  const handleSaveNote = async () => {
    if (!noteModal.request) return;
    setNoteModal((prev) => ({ ...prev, isSaving: true }));
    try {
      const res = await updateNotes(noteModal.request.id, noteModal.notes);
      if (res.success) {
        toast.success('Catatan admin berhasil disimpan.');
        setNoteModal({ open: false, request: null, notes: '', isSaving: false });
      } else {
        toast.error(res.message || 'Gagal menyimpan catatan.');
      }
    } finally {
      setNoteModal((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Open full message modal
  const handleOpenMessageModal = (request) => {
    setMessageModal({
      open: true,
      request
    });
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteRequest(deleteModal.id);
      if (res.success) {
        toast.success('Usulan collab berhasil dihapus.');
      } else {
        toast.error(res.message || 'Gagal menghapus usulan.');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, id: null });
    }
  };

  // Add to Schedule action (auto mark as scheduled & open drawer)
  const handleAddToSchedule = async (request) => {
    if (request.status !== 'scheduled') {
      try {
        await updateStatus(request.id, 'scheduled');
      } catch (err) {
        console.warn('Auto update status to scheduled warning:', err);
      }
    }
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
            Daftar usulan kolaborasi streamer dari penonton dan koordinasi rencana live stream
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

      {/* 2. STATS CARDS (Alur Kerja Kreator) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Usulan */}
        <StatCard
          icon={Users}
          label="Total Usulan"
          value={stats.total || 0}
          subtitle="Semua usulan masuk"
          loading={loading && requests.length === 0}
          variant="default"
        />

        {/* Usulan Baru */}
        <StatCard
          icon={Clock}
          label="Usulan Baru"
          value={stats.pending || 0}
          subtitle="Menunggu ditinjau creator"
          loading={loading && requests.length === 0}
          variant={stats.pending > 0 ? 'highlight' : 'default'}
        />

        {/* Disimpan (Shortlist) */}
        <StatCard
          icon={Bookmark}
          label="Disimpan (Shortlist)"
          value={stats.approved || 0}
          subtitle="Rencana & ide potensial"
          loading={loading && requests.length === 0}
          variant="default"
        />

        {/* Dijadwalkan */}
        <StatCard
          icon={CalendarCheck}
          label="Dijadwalkan"
          value={stats.scheduled || 0}
          subtitle="Masuk agenda live stream"
          loading={loading && requests.length === 0}
          variant="default"
        />
      </div>

      {/* 3. FILTER BAR */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-4 shadow-sm">
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
                  transition-all duration-150 flex items-center gap-1.5
                  ${
                    activeStatus === tab.key
                      ? 'bg-accent-cyan text-text-on-cta shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                  }
                `}
              >
                <span>{tab.label}</span>
                {tab.key === 'pending' && stats.pending > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeStatus === tab.key
                        ? 'bg-bg-dark text-accent-cyan'
                        : 'bg-status-live text-white'
                    }`}
                  >
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

      {/* 4. ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5. TABLE LIST VIEW */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-card">
        {loading && requests.length === 0 ? (
          // SKELETON TABLE
          <div className="p-6 space-y-4">
            <div className="h-6 w-48 bg-bg-surface rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-bg-surface/60 rounded-xl border border-border-subtle/50 animate-pulse flex items-center px-4 gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-bg-surface" />
                  <div className="h-4 w-32 bg-bg-surface rounded" />
                  <div className="h-4 w-48 bg-bg-surface rounded hidden md:block" />
                  <div className="h-6 w-20 bg-bg-surface rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : requests.length === 0 ? (
          // EMPTY STATE
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Inbox className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              Tidak Ada Usulan Collab
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              {activeSearch || activeStatus !== 'all' || selectedPeriod !== 'all'
                ? 'Tidak ada usulan yang cocok dengan filter pencarian yang diterapkan saat ini.'
                : 'Belum ada viewer yang mengajukan rekomendasi streamer untuk collab.'}
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
          // DATA TABLE
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface/50 text-[11px] font-mono uppercase text-text-muted">
                  <th className="py-3 px-4 font-semibold">Streamer</th>
                  <th className="py-3 px-4 font-semibold">Saluran / Sosmed</th>
                  <th className="py-3 px-4 font-semibold">Pesan Viewer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Catatan Admin</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {requests.map((request) => (
                  <CollabRequestRow
                    key={request.id}
                    request={request}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenNoteModal={handleOpenNoteModal}
                    onOpenMessageModal={handleOpenMessageModal}
                    onAddToSchedule={handleAddToSchedule}
                    onDelete={(id) => setDeleteModal({ open: true, id })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. PAGINATION BAR */}
      {pagination.totalPages > 1 && (
        <div className="bg-bg-card border border-border-subtle rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
            <span>
              Menampilkan <span className="text-text-primary">{requests.length}</span> dari{' '}
              <span className="text-text-primary">{pagination.total}</span> usulan
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

      {/* 7. ADMIN NOTE MODAL */}
      <Modal
        isOpen={noteModal.open}
        onClose={() => setNoteModal({ open: false, request: null, notes: '', isSaving: false })}
        title="Catatan Admin & Rencana Live"
        confirmText="Simpan Catatan"
        cancelText="Batal"
        loading={noteModal.isSaving}
        onConfirm={handleSaveNote}
      >
        <div className="space-y-4">
          {noteModal.request && (
            <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-text-muted">Target Streamer:</span>
              <span className="font-semibold text-text-primary font-display">
                {noteModal.request.requested_streamer_name}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-text-secondary">
              Tulis Catatan / Rencana Collab:
            </label>
            <textarea
              rows={4}
              value={noteModal.notes}
              onChange={(e) => setNoteModal((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Contoh: Sudah kontak via Discord, rencana main game multiplayer Jumat depan..."
              className="w-full px-3.5 py-2.5 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-cyan font-mono resize-none"
            />
            <p className="text-[11px] text-text-muted">
              Catatan ini bersifat internal dan hanya dapat dilihat oleh admin/kreator.
            </p>
          </div>
        </div>
      </Modal>

      {/* 8. FULL VIEWER MESSAGE MODAL */}
      <Modal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ open: false, request: null })}
        title="Pesan Lengkap Viewer"
        cancelText="Tutup"
      >
        {messageModal.request && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border-subtle">
              <span className="text-text-muted">Rekomendasi Streamer:</span>
              <strong className="text-text-primary font-display">
                {messageModal.request.requested_streamer_name}
              </strong>
            </div>

            <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-accent-purple font-mono">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Pesan Viewer:</span>
              </div>
              <p className="text-sm text-text-primary leading-relaxed italic whitespace-pre-wrap">
                "{messageModal.request.message}"
              </p>
            </div>

            <div className="text-[11px] text-text-muted font-mono flex items-center justify-between pt-1">
              <span>Diajukan: {safeFormatTimeAgo(messageModal.request.created_at)}</span>
              <span>{safeFormatDate(messageModal.request.created_at, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Hapus Usulan Collab"
        variant="danger"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Apakah Anda yakin ingin menghapus usulan collab ini? Tindakan ini tidak dapat dibatalkan dan usulan beserta catatannya akan dihapus dari sistem.
        </p>
      </Modal>
    </div>
  );
}

export default CollabRequestsPage;
