import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../../services/dashboardService';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../services/scheduleService';
import ScheduleFormPanel from '../../components/admin/ScheduleFormPanel';
import Modal from '../../components/common/Modal';
import { safeParseDate, safeFormatDate, safeFormatTime } from '../../utils/dateUtils';
import {
  Radio,
  Calendar,
  RefreshCw,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Tab filter options
const FILTER_TABS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'live', label: 'LIVE' },
  { key: 'upcoming', label: 'UPCOMING' },
  { key: 'archived', label: 'ARSIP' },
];

// Status badge configuration
const getStatusBadge = (status) => {
  const statusMap = {
    live: { label: 'LIVE NOW', class: 'bg-status-live/10 text-status-live border-status-live/20', icon: Radio },
    upcoming: { label: 'UPCOMING', class: 'bg-status-upcoming/10 text-status-upcoming border-status-upcoming/20', icon: Clock },
    archived: { label: 'DONE', class: 'bg-status-done/10 text-status-done border-status-done/20', icon: CheckCircle },
  };
  return statusMap[status] || statusMap.upcoming;
};

function SchedulePage() {
  // Summary cards state
  const [summaryStats, setSummaryStats] = useState({
    activeBroadcast: null,
    scheduledSlots: 0,
    syncStatus: 'Tersambung',
    syncLatency: '0.4s',
    selectedGame: null,
    selectedGamePercent: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form panel state
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch summary stats
  const fetchSummaryStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      if (response?.data) {
        setSummaryStats({
          activeBroadcast: response.data.activeBroadcast || null,
          scheduledSlots: response.data.upcomingSchedules || 0,
          syncStatus: 'Tersambung',
          syncLatency: '0.4s',
          selectedGame: response.data.selectedGame || null,
          selectedGamePercent: response.data.selectedGamePercent || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      setSummaryStats({
        activeBroadcast: null,
        scheduledSlots: 4,
        syncStatus: 'Tersambung',
        syncLatency: '0.4s',
        selectedGame: 'Outer Wilds',
        selectedGamePercent: 64,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch schedules
  const fetchSchedules = useCallback(async (status = 'all') => {
    setSchedulesLoading(true);
    try {
      const response = await getSchedules({ status: status === 'all' ? undefined : status });
      if (response?.data) {
        setSchedules(Array.isArray(response.data) ? response.data : response.data.schedules || []);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([
        { id: 1, title: 'Elden Ring Rush', category: 'ACTION RPG', datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), status: 'upcoming', description: 'Exploring the Lands Between' },
        { id: 2, title: 'Signalis: Solitary Resonance', category: 'SURVIVAL HORROR', datetime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), status: 'live', description: 'Survival horror streaming session' },
        { id: 3, title: 'Stardew Valley Chill', category: 'SIMULATION', datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming', description: 'Relaxing farming session' },
        { id: 4, title: 'Minecraft Building Stream', category: 'SURVIVAL', datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'archived', description: 'Building a castle' },
      ]);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchSummaryStats();
    fetchSchedules(activeFilter);
  }, [fetchSummaryStats, fetchSchedules, activeFilter]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Open form for new schedule
  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setFormPanelOpen(true);
  };

  // Open form for edit
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormPanelOpen(true);
  };

  // Handle save schedule
  const handleSaveSchedule = async (data) => {
    setFormLoading(true);
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, data);
      } else {
        await createSchedule(data);
      }
      setFormPanelOpen(false);
      setEditingSchedule(null);
      fetchSchedules(activeFilter);
      fetchSummaryStats();
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (schedule) => {
    setDeleteModal({ open: true, schedule });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.schedule) return;

    setDeleteLoading(true);
    try {
      await deleteSchedule(deleteModal.schedule.id);
      setDeleteModal({ open: false, schedule: null });
      fetchSchedules(activeFilter);
      fetchSummaryStats();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, schedule: null });
  };

  // Filter schedules by search
  const filteredSchedules = schedules.filter(schedule =>
    schedule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date time (safe version)
  const formatDateTime = (datetime) => {
    const date = safeParseDate(datetime);
    if (!date) return '-';
    const dateStr = safeFormatDate(datetime, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }, '-');
    const timeStr = safeFormatTime(datetime, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }, '');
    return dateStr + (timeStr ? ', ' + timeStr + ' WIB' : '');
  };

  // Get status badge for schedule (safe version)
  const getScheduleStatus = (schedule) => {
    if (!schedule.datetime) return 'upcoming';
    const now = new Date();
    const scheduleDate = safeParseDate(schedule.datetime);

    if (schedule.status === 'archived') return 'archived';
    if (schedule.status === 'live' || (scheduleDate && scheduleDate <= now && scheduleDate > new Date(now - 60 * 60 * 1000))) return 'live';
    return 'upcoming';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-xs font-mono text-accent-cyan tracking-wider">SIARAN & PENJADWALAN</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-display">Manajemen Jadwal</h1>
          <p className="text-sm text-text-muted mt-1">Kelola jadwal stream Xion, sinkronisasi countdown publik</p>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddSchedule}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </button>
      </div>

      {/* ========== SUMMARY CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Siaran Aktif */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-live/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-status-live" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">Siaran Aktif</p>
              {statsLoading ? (
                <div className="h-5 w-24 bg-bg-input rounded animate-shimmer mt-1" />
              ) : summaryStats.activeBroadcast ? (
                <p className="text-sm font-semibold text-text-primary truncate">
                  {summaryStats.activeBroadcast.title || 'Tidak ada'}
                </p>
              ) : (
                <p className="text-sm text-text-muted">Tidak ada</p>
              )}
            </div>
            {summaryStats.activeBroadcast && (
              <span className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            )}
          </div>
        </div>

        {/* Card 2: Slot Terjadwal */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Slot Terjadwal 7 Hari</p>
              {statsLoading ? (
                <div className="h-5 w-16 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <p className="text-sm font-semibold text-text-primary">
                  {summaryStats.scheduledSlots} Sesi
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Sinkronisasi */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Sinkronisasi Fansite</p>
              <p className="text-sm font-semibold text-accent-cyan">
                {summaryStats.syncStatus} ({summaryStats.syncLatency})
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Voting Terpilih */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Voting Terpilih</p>
              {summaryStats.selectedGame ? (
                <p className="text-sm font-semibold text-accent-gold">
                  {summaryStats.selectedGame} ({summaryStats.selectedGamePercent}%)
                </p>
              ) : (
                <p className="text-sm text-text-muted">Belum ada</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== TABLE SECTION ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-mono text-text-muted">MASTER QUEUE</span>
            <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">
              Asia/Jakarta (WIB)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau game..."
                className="pl-9 pr-4 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none w-48"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>

            {/* Reload */}
            <button
              onClick={() => fetchSchedules(activeFilter)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-4 flex items-center gap-2 border-b border-border-subtle overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`
                px-4 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap
                ${activeFilter === tab.key
                  ? 'bg-bg-input text-text-primary border-t border-x border-border-subtle'
                  : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              {tab.label} ({tab.key === 'all' ? schedules.length : schedules.filter(s => getScheduleStatus(s) === tab.key).length})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-input">
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-12">NO</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">JUDUL STREAM</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-32">KATEGORI</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-48">TANGGAL & WAKTU</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-28">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-28">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {schedulesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-4 py-4"><div className="h-4 w-6 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-40 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-24 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-20 bg-bg-input rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    Tidak ada jadwal stream
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule, index) => {
                  const status = getScheduleStatus(schedule);
                  const statusBadge = getStatusBadge(status);
                  const isLive = status === 'live';
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr
                      key={schedule.id}
                      className={`
                        border-b border-border-subtle transition-colors
                        ${isLive ? 'bg-status-live/5 border-l-2 border-l-status-live' : 'hover:bg-bg-input/30'}
                      `}
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono text-text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{schedule.title}</p>
                          {schedule.description && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{schedule.description}</p>
                          )}
                          {isLive && (
                            <p className="flex items-center gap-1.5 text-xs text-status-live mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-live animate-pulse" />
                              Sedang Berlangsung
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`
                          inline-flex px-3 py-1 text-xs font-medium rounded-full
                          ${isLive ? 'bg-status-live/20 text-status-live' : 'bg-bg-input text-text-secondary'}
                        `}>
                          {schedule.category || 'LAINNYA'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-secondary">
                            {formatDateTime(schedule.datetime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {/* Preview */}
                          <button
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-2 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(schedule)}
                            className="p-2 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted">
            Menampilkan {filteredSchedules.length} dari {schedules.length} jadwal
          </p>
        </div>
      </div>

      {/* ========== SCHEDULE FORM PANEL ========== */}
      <ScheduleFormPanel
        isOpen={formPanelOpen}
        onClose={() => {
          setFormPanelOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        loading={formLoading}
      />

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <Modal
        isOpen={deleteModal.open}
        onClose={handleDeleteCancel}
        title="Konfirmasi Hapus Jadwal"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        variant="danger"
        loading={deleteLoading}
      >
        <p className="text-text-secondary text-sm">
          Apakah kamu yakin ingin menghapus jadwal <span className="text-text-primary font-semibold">"{deleteModal.schedule?.title}"</span>?
        </p>
        <p className="text-text-muted text-xs mt-2">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}

export default SchedulePage;
