import React, { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
  LayoutGrid,
  List,
  Plus,
  Download,
  X,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCollabRequests } from '../../hooks/useCollabRequests';
import CollabRequestRow, { STATUS_CONFIG } from '../../components/admin/CollabRequestRow';
import CollabRequestCard from '../../components/admin/CollabRequestCard';
import ScheduleFormPanel from '../../components/admin/ScheduleFormPanel';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import CustomSelect from '../../components/common/CustomSelect';
import { safeFormatTimeAgo, safeFormatDate } from '../../utils/dateUtils';
import { createSchedule } from '../../services/scheduleService';
import { collabRequestService } from '../../services/collabRequestService';

/**
 * Filter status tabs (Alur Kerja Kreator)
 */
const STATUS_TABS = [
  { key: 'all',       label: 'SEMUA',       statKey: 'total' },
  { key: 'pending',   label: 'BARU',        statKey: 'pending' },
  { key: 'approved',  label: 'DISIMPAN',    statKey: 'approved' },
  { key: 'scheduled', label: 'DIJADWALKAN', statKey: 'scheduled' },
  { key: 'rejected',  label: 'ARSIP',       statKey: 'rejected' },
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
 * CollabRequestsPage - Modern Studio Command Deck for Streamer Collaboration Management
 */
function CollabRequestsPage() {
  const toast = useToast();

  // View mode: 'cards' (rich visual studio cards) vs 'table' (compact spreadsheet)
  const [viewMode, setViewMode] = useState('cards');

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
    isSaving: false,
  });

  const [messageModal, setMessageModal] = useState({
    open: false,
    request: null,
  });

  // Manual Add Collab Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    social: '',
    message: '',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Inline schedule form panel state (opened from collab request row / card)
  const [schedulePanel, setSchedulePanel] = useState({
    open: false,
    collabData: null,
  });
  const [scheduleFormLoading, setScheduleFormLoading] = useState(false);

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
    refetch,
  } = useCollabRequests({
    status: activeStatus === 'all' ? undefined : activeStatus,
    period: selectedPeriod === 'all' ? undefined : selectedPeriod,
    search: activeSearch || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const periodOptions = useMemo(() => getPeriodOptions(), []);

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchRequests({
      status: activeStatus === 'all' ? undefined : activeStatus,
      period: selectedPeriod === 'all' ? undefined : selectedPeriod,
      search: activeSearch || undefined,
      page: currentPage,
      limit: pageSize,
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
      isSaving: false,
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
      request,
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

  // Manual Add Collab Submit
  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.name.trim()) {
      toast.error('Nama atau akun streamer wajib diisi.');
      return;
    }
    setIsSubmittingManual(true);
    try {
      await collabRequestService.submitCollabRequest({
        requested_streamer_name: addFormData.name.trim(),
        requested_streamer_social: addFormData.social.trim() || undefined,
        message: addFormData.message.trim() || 'Dicatat langsung oleh Admin/Kreator',
        viewer_identifier: 'admin_manual',
      });
      toast.success('Rencana kolaborasi streamer berhasil ditambahkan.');
      setAddModalOpen(false);
      setAddFormData({ name: '', social: '', message: '' });
      refetch();
    } catch (err) {
      console.error('Error adding collab:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan usulan kolaborasi.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Open inline schedule form drawer from Collab Request
  const handleAddToSchedule = async (request) => {
    // Optimistically update status to scheduled if not already
    if (request.status !== 'scheduled') {
      try {
        await updateStatus(request.id, 'scheduled');
      } catch (err) {
        console.warn('Auto update status to scheduled warning:', err);
      }
    }
    // Open inline ScheduleFormPanel with collab data pre-filled
    setSchedulePanel({
      open: true,
      collabData: {
        collab_guest: request.requested_streamer_name || '',
        collab_social: request.requested_streamer_social || '',
      },
    });
  };

  // Save schedule from inline panel
  const handleScheduleSave = async (data) => {
    setScheduleFormLoading(true);
    try {
      await createSchedule(data);
      setSchedulePanel({ open: false, collabData: null });
      toast.success('Jadwal siaran kolaborasi berhasil disimpan!');
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Gagal menyimpan jadwal.';
      toast.error(msg);
      throw err;
    } finally {
      setScheduleFormLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast.error('Tidak ada data usulan untuk diekspor.');
      return;
    }

    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) + ' WIB';

    const statusMap = {
      pending: 'Baru',
      approved: 'Disimpan (Shortlist)',
      scheduled: 'Dijadwalkan',
      rejected: 'Arsip',
    };

    const metaRows = [
      ['LAPORAN USULAN KOLABORASI STREAMER X-VOCA'],
      ['Tanggal Ekspor', nowStr],
      ['Total Usulan Ditampilkan', `${requests.length} Usulan`],
      [],
    ];

    const tableHeaders = [
      'No',
      'Nama Streamer',
      'Saluran / Sosmed',
      'Status',
      'Pesan Penonton',
      'Catatan Admin',
      'Waktu Usulan',
    ];

    const dataRows = requests.map((req, idx) => [
      idx + 1,
      req.requested_streamer_name || '-',
      req.requested_streamer_social || '-',
      statusMap[req.status] || req.status || '-',
      req.message ? `"${req.message.replace(/"/g, '""')}"` : '-',
      req.review_notes ? `"${req.review_notes.replace(/"/g, '""')}"` : '-',
      safeFormatDate(req.created_at, { day: 'numeric', month: 'short', year: 'numeric' }),
    ]);

    const escapeCSV = (cell) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell);
      if (str.startsWith('"') && str.endsWith('"')) return str;
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = '\uFEFF' + [
      ...metaRows,
      tableHeaders,
      ...dataRows,
    ].map((row) => row.map(escapeCSV).join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `collab_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── 1. Page Header & Command Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Collab Requests
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Koordinasi usulan kolaborasi streamer dari komunitas dan realisasikan siaran bersama
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-bg-surface border border-border-subtle rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-accent-cyan text-bg-base font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Kartu Studio"
              aria-label="Tampilan Kartu Studio"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Kartu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-accent-cyan text-bg-base font-bold shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Tabel Ringkas"
              aria-label="Tampilan Tabel Ringkas"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Tabel</span>
            </button>
          </div>

          {/* Refresh Manual */}
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            title="Muat ulang data usulan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Ekspor CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={requests.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            title="Unduh laporan usulan kolaborasi (.csv)"
          >
            <Download className="w-3.5 h-3.5 text-accent-purple" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          {/* Tambah Usulan Manual */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-accent-cyan via-accent-cyan to-accent-purple text-bg-base rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md shadow-accent-cyan/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Catat Collab</span>
          </button>
        </div>
      </div>

      {/* ── 2. Top Interactive Metric Ribbon (4 Clickable Cards) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Usulan */}
        <button
          type="button"
          onClick={() => { setActiveStatus('all'); setCurrentPage(1); }}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeStatus === 'all'
              ? 'border-accent-purple ring-2 ring-accent-purple/20 bg-accent-purple/5'
              : 'border-border-subtle hover:border-accent-purple/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Total Usulan</p>
            <div className="w-8 h-8 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-purple">
              {String(stats.total || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">usulan</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Semua riwayat rekomendasi</p>
        </button>

        {/* Usulan Baru (Pending) */}
        <button
          type="button"
          onClick={() => { setActiveStatus('pending'); setCurrentPage(1); }}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm relative overflow-hidden
            ${activeStatus === 'pending'
              ? 'border-accent-cyan ring-2 ring-accent-cyan/20 bg-accent-cyan/5'
              : 'border-border-subtle hover:border-accent-cyan/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Usulan Baru</p>
              {stats.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
              )}
            </div>
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-cyan">
              {String(stats.pending || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">pending</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Menunggu ditinjau creator</p>
        </button>

        {/* Disimpan (Shortlist / Approved) */}
        <button
          type="button"
          onClick={() => { setActiveStatus('approved'); setCurrentPage(1); }}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeStatus === 'approved'
              ? 'border-accent-gold ring-2 ring-accent-gold/20 bg-accent-gold/5'
              : 'border-border-subtle hover:border-accent-gold/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Disimpan (Shortlist)</p>
            <div className="w-8 h-8 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-gold">
              {String(stats.approved || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">kandidat</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Ide & talent potensial</p>
        </button>

        {/* Dijadwalkan (Scheduled) */}
        <button
          type="button"
          onClick={() => { setActiveStatus('scheduled'); setCurrentPage(1); }}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeStatus === 'scheduled'
              ? 'border-status-done ring-2 ring-status-done/20 bg-status-done/5'
              : 'border-border-subtle hover:border-status-done/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Dijadwalkan</p>
            <div className="w-8 h-8 rounded-xl bg-status-done/10 border border-status-done/20 flex items-center justify-center text-status-done">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-status-done">
              {String(stats.scheduled || 0).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">siaran</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Masuk agenda live stream</p>
        </button>
      </div>

      {/* ── 3. Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs with Live Count Badges */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const count = stats[tab.statKey] || 0;
              const isActive = activeStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveStatus(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`
                    px-3 py-2 text-xs font-mono font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5
                    ${isActive
                      ? 'bg-accent-cyan text-bg-base shadow-sm font-bold'
                      : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border-subtle'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-bg-base/20 text-bg-base' : 'bg-bg-card text-text-secondary'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Period Select & Search Bar */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Period Dropdown */}
            <div className="w-36">
              <CustomSelect
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setCurrentPage(1);
                }}
                options={periodOptions}
                size="sm"
                aria-label="Filter berdasarkan Periode"
              />
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari streamer / ide pesan..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setActiveSearch('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Reset Filter Button */}
            {(activeStatus !== 'all' || selectedPeriod !== 'all' || activeSearch !== '') && (
              <button
                type="button"
                onClick={handleResetFilters}
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
            Menampilkan <strong className="text-text-primary font-mono">{requests.length}</strong> usulan
            {pagination.total > 0 && ` dari total ${pagination.total}`}
          </span>
          <span className="font-mono text-[11px]">
            Mode: <strong className="text-text-secondary">{viewMode === 'cards' ? 'Kartu Studio' : 'Tabel Ringkas'}</strong>
          </span>
        </div>
      </div>

      {/* ── 4. Error Alert ───────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-status-live/10 border border-status-live/30 text-status-live text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 5. Main Content Area (Cards or Table) ────────────────────────────── */}
      {loading && requests.length === 0 ? (
        // Loading Skeleton
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg-card rounded-2xl border border-border-subtle p-5 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-bg-surface" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-bg-surface rounded" />
                    <div className="h-3 w-20 bg-bg-surface rounded" />
                  </div>
                  <div className="h-8 w-28 bg-bg-surface rounded-xl" />
                </div>
                <div className="h-16 bg-bg-surface rounded-xl" />
                <div className="h-8 bg-bg-surface rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        // Empty State
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
            <Users className="w-7 h-7 opacity-40" />
          </div>
          <h4 className="text-base font-bold text-text-primary">Tidak Ada Usulan Collab</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            {activeSearch || activeStatus !== 'all' || selectedPeriod !== 'all'
              ? 'Tidak ada usulan kolaborasi yang cocok dengan filter yang dipilih saat ini.'
              : 'Belum ada usulan streamer dari penonton untuk periode ini. Anda juga dapat mencatat streamer secara mandiri.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(activeSearch || activeStatus !== 'all' || selectedPeriod !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                Reset Semua Filter
              </button>
            )}
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base hover:opacity-95 transition-opacity"
            >
              + Catat Collab Baru
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        // ── Cards Grid View (Studio Cards) ──
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <CollabRequestCard
              key={request.id}
              request={request}
              onUpdateStatus={handleUpdateStatus}
              onOpenNoteModal={handleOpenNoteModal}
              onOpenMessageModal={handleOpenMessageModal}
              onAddToSchedule={handleAddToSchedule}
              onDelete={(id) => setDeleteModal({ open: true, id })}
            />
          ))}
        </div>
      ) : (
        // ── Table View (Compact Table) ──
        <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
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
        </div>
      )}

      {/* ── 6. Pagination Bar ─────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="bg-bg-card border border-border-subtle rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
            <span>
              Halaman <strong className="text-text-primary">{pagination.page}</strong> dari{' '}
              <strong className="text-text-primary">{pagination.totalPages}</strong>
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span>Per hal:</span>
              <div className="w-18">
                <CustomSelect
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 50, label: '50' },
                  ]}
                  size="sm"
                  aria-label="Jumlah item per halaman"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3 py-1 text-xs font-mono font-bold text-accent-cyan bg-accent-cyan/10 rounded-lg border border-accent-cyan/20">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 7. Manual Add Collab Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Catat Rencana Kolaborasi Streamer"
        confirmText="Simpan Usulan"
        cancelText="Batal"
        loading={isSubmittingManual}
        onConfirm={handleManualAddSubmit}
      >
        <form onSubmit={handleManualAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary">
              Nama / Akun Streamer <span className="text-status-live">*</span>
            </label>
            <input
              type="text"
              required
              value={addFormData.name}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: @streamer_name atau Kobo Kanaeru"
              className="w-full px-3.5 py-2.5 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary">
              Tautan Saluran / Sosmed (Opsional)
            </label>
            <input
              type="text"
              value={addFormData.social}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, social: e.target.value }))}
              placeholder="Contoh: https://youtube.com/@channel atau https://x.com/user"
              className="w-full px-3.5 py-2.5 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary">
              Catatan Ide Kolaborasi / Game
            </label>
            <textarea
              rows={3}
              value={addFormData.message}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Contoh: Rencana mabar Lethal Company / game horor bareng..."
              className="w-full px-3.5 py-2.5 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* ── 8. Admin Note Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={noteModal.open}
        onClose={() => setNoteModal({ open: false, request: null, notes: '', isSaving: false })}
        title="Catatan Koordinasi Admin"
        confirmText="Simpan Catatan"
        cancelText="Batal"
        loading={noteModal.isSaving}
        onConfirm={handleSaveNote}
      >
        <div className="space-y-4">
          {noteModal.request && (
            <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-text-muted">Target Streamer:</span>
              <strong className="text-text-primary font-mono">
                {noteModal.request.requested_streamer_name}
              </strong>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Tulis Catatan / Status Komunikasi:
            </label>
            <textarea
              rows={4}
              value={noteModal.notes}
              onChange={(e) => setNoteModal((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Contoh: Sudah di-DM via Twitter, menunggu balasan jadwal luang..."
              className="w-full px-3.5 py-2.5 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none resize-none"
            />
            <p className="text-[11px] text-text-muted">
              Catatan ini bersifat internal dan hanya dapat dibaca oleh tim kreator.
            </p>
          </div>
        </div>
      </Modal>

      {/* ── 9. Full Viewer Message Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={messageModal.open}
        onClose={() => setMessageModal({ open: false, request: null })}
        title="Detail Usulan & Pesan Penonton"
        cancelText="Tutup"
      >
        {messageModal.request && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-border-subtle">
              <span className="text-text-muted">Target Streamer:</span>
              <strong className="text-text-primary text-sm font-bold">
                {messageModal.request.requested_streamer_name}
              </strong>
            </div>

            {messageModal.request.requested_streamer_social && (
              <div className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-xs flex items-center justify-between">
                <span className="text-text-muted">Tautan Sosmed:</span>
                <a
                  href={messageModal.request.requested_streamer_social}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-cyan hover:underline inline-flex items-center gap-1 font-mono"
                >
                  <span>{messageModal.request.requested_streamer_social}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-accent-cyan font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Pesan & Ide dari Penonton:</span>
              </div>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed italic whitespace-pre-wrap">
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

      {/* ── 10. Delete Confirmation Modal ────────────────────────────────────── */}
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
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Apakah Anda yakin ingin menghapus usulan kolaborasi ini? Tindakan ini tidak dapat dibatalkan dan usulan beserta catatannya akan dihapus dari sistem.
        </p>
      </Modal>

      {/* ── 11. Inline Schedule Form Drawer (from Collab Request) ────────────── */}
      <ScheduleFormPanel
        isOpen={schedulePanel.open}
        onClose={() => setSchedulePanel({ open: false, collabData: null })}
        onSave={handleScheduleSave}
        schedule={null}
        loading={scheduleFormLoading}
        initialCollabData={schedulePanel.collabData}
      />

    </div>
  );
}

export default CollabRequestsPage;
