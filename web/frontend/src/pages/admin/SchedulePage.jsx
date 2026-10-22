import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../../services/dashboardService';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, endStream } from '../../services/scheduleService';
import ScheduleFormPanel from '../../components/admin/ScheduleFormPanel';
import Modal from '../../components/common/Modal';
import { safeParseDate, safeFormatDate, safeFormatTime } from '../../utils/dateUtils';
import { isFirebaseConfigured } from '../../utils/firebase';
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
  Clock,
  Power,
  Tv,
  ExternalLink,
  Users,
  BookPlus
} from 'lucide-react';

// YouTube Icon Component
const YouTubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
    <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Helper to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Normalize schedule data from backend to frontend expected format
const normalizeSchedule = (schedule) => ({
  id: schedule.id,
  title: schedule.title || '-',
  game_category: schedule.game_category || schedule.game || '-',
  scheduled_at: schedule.scheduled_at || null,
  description: schedule.description || '',
  collab_guest: schedule.collab_guest || null,
  collab_social: schedule.collab_social || null,
  youtube_url: schedule.youtube_url || null,
  thumbnail_url: schedule.thumbnail_url || null,
  stream_platform: schedule.stream_platform || 'YouTube',
  countdown_enabled: schedule.countdown_enabled !== false,
  status: schedule.status || 'upcoming',
  created_at: schedule.created_at || schedule.createdAt || null,
  updated_at: schedule.updated_at || schedule.updatedAt || null,
});

// Tab filter options
const FILTER_TABS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'live', label: 'LIVE' },
  { key: 'upcoming', label: 'UPCOMING' },
  { key: 'done', label: 'SELESAI' },
];

// Status badge configuration
const getStatusBadge = (status) => {
  const statusMap = {
    live: { label: 'LIVE NOW', class: 'bg-status-live/10 text-status-live border-status-live/20', icon: Radio },
    upcoming: { label: 'UPCOMING', class: 'bg-status-upcoming/10 text-status-upcoming border-status-upcoming/20', icon: Clock },
    done: { label: 'SELESAI', class: 'bg-status-done/10 text-status-done border-status-done/20', icon: CheckCircle },
    archived: { label: 'SELESAI', class: 'bg-status-done/10 text-status-done border-status-done/20', icon: CheckCircle },
  };
  return statusMap[status] || statusMap.upcoming;
};

function SchedulePage() {
  const navigate = useNavigate();

  // Summary cards state
  const [summaryStats, setSummaryStats] = useState({
    activeBroadcast: null,
    scheduledSlots: 0,
    completedSlots: 0,
    syncStatus: 'Tersambung',
    syncLatency: 'Realtime Aktif',
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

  // End stream confirmation state
  const [endStreamModal, setEndStreamModal] = useState({ open: false, schedule: null });
  const [endStreamLoading, setEndStreamLoading] = useState(false);

  // Convert to Content Guide modal state
  const [convertModal, setConvertModal] = useState({ open: false, schedule: null, isPostEndStream: false });

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({ open: false, schedule: null });

  // Preview handler
  const handlePreview = (schedule) => {
    setPreviewModal({ open: true, schedule });
  };

  // Fetch summary stats
  const fetchSummaryStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      const isConfigured = isFirebaseConfigured();
      if (response?.data?.stats) {
        // Extract from nested structure: response.data.stats
        const stats = response.data.stats;
        setSummaryStats({
          activeBroadcast: stats.activeBroadcast || null,
          scheduledSlots: stats.schedules?.upcoming || 0,
          completedSlots: stats.schedules?.completed || 0,
          syncStatus: isConfigured ? 'Tersambung' : 'Lokal',
          syncLatency: isConfigured ? 'Realtime Aktif' : 'Offline',
        });
      }
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      const isConfigured = isFirebaseConfigured();
      setSummaryStats({
        activeBroadcast: null,
        scheduledSlots: 0,
        completedSlots: 0,
        syncStatus: isConfigured ? 'Tersambung' : 'Lokal',
        syncLatency: isConfigured ? 'Realtime Aktif' : 'Offline',
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
      // Handle multiple response formats
      let rawData = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          rawData = response.data;
        } else if (response.data.schedules) {
          rawData = response.data.schedules;
        } else if (response.data.data) {
          rawData = Array.isArray(response.data.data) ? response.data.data : [];
        }
      }
      // Normalize all schedules
      const normalized = rawData.map(normalizeSchedule);
      setSchedules(normalized);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]); // Clear on error instead of mock data
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

  // Handle end stream
  const handleEndStreamClick = (schedule) => {
    setEndStreamModal({ open: true, schedule });
  };

  const handleEndStreamConfirm = async () => {
    if (!endStreamModal.schedule) return;
    const endedSchedule = endStreamModal.schedule;

    setEndStreamLoading(true);
    try {
      await endStream(endedSchedule.id);
      setEndStreamModal({ open: false, schedule: null });
      fetchSchedules(activeFilter);
      fetchSummaryStats();

      // Offer to immediately convert finished stream to Content Guide
      setConvertModal({
        open: true,
        schedule: endedSchedule,
        isPostEndStream: true
      });
    } catch (error) {
      console.error('Error ending stream:', error);
    } finally {
      setEndStreamLoading(false);
    }
  };

  const handleEndStreamCancel = () => {
    setEndStreamModal({ open: false, schedule: null });
  };

  // Handle Convert to Content Guide
  const handleConvertClick = (schedule) => {
    setConvertModal({ open: true, schedule, isPostEndStream: false });
  };

  const handleConvertConfirm = () => {
    if (!convertModal.schedule) return;
    const s = convertModal.schedule;
    setConvertModal({ open: false, schedule: null, isPostEndStream: false });

    navigate('/admin/content', {
      state: {
        prefillSchedule: {
          title: s.title || '',
          game_tag: s.game_category || 'Gaming',
          youtube_url: s.youtube_url || '',
          thumbnail_url: s.thumbnail_url || '',
          total_duration: s.estimated_duration || '2-3 Jam',
        }
      }
    });
  };

  const handleConvertCancel = () => {
    setConvertModal({ open: false, schedule: null, isPostEndStream: false });
  };

  // Filter schedules by search
  const filteredSchedules = schedules.filter(schedule =>
    schedule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.game_category?.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!schedule) return 'upcoming';
    const rawStatus = (schedule.status || '').toLowerCase();
    if (rawStatus === 'done' || rawStatus === 'archived') return 'done';
    if (rawStatus === 'live') return 'live';
    if (rawStatus === 'upcoming') return 'upcoming';

    if (!schedule.scheduled_at) return 'upcoming';
    const now = new Date();
    const scheduleDate = safeParseDate(schedule.scheduled_at);
    if (scheduleDate && scheduleDate <= now && scheduleDate > new Date(now - 60 * 60 * 1000)) {
      return 'live';
    }
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

        {/* Card 4: Siaran Selesai */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-done/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-status-done" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted">Siaran Selesai</p>
              {statsLoading ? (
                <div className="h-5 w-16 bg-bg-input rounded animate-shimmer mt-1" />
              ) : (
                <>
                  <p className="text-sm font-semibold text-text-primary">
                    {summaryStats.completedSlots || schedules.filter(s => getScheduleStatus(s) === 'done').length} Sesi
                  </p>
                  <p className="text-xs text-text-muted">Tersimpan dalam arsip</p>
                </>
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
                          {schedule.game_category || 'LAINNYA'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-secondary">
                            {formatDateTime(schedule.scheduled_at)}
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
                          {/* End Stream Button - Only for LIVE schedules */}
                          {isLive && (
                            <button
                              onClick={() => handleEndStreamClick(schedule)}
                              className="p-2 text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
                              title="Akhiri Siaran"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                          {/* Jadikan Content Guide - Only for completed / archived schedules */}
                          {(schedule.status === 'done' || schedule.status === 'archived') && (
                            <button
                              onClick={() => handleConvertClick(schedule)}
                              className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                              title="Jadikan Content Guide"
                            >
                              <BookPlus className="w-4 h-4" />
                            </button>
                          )}
                          {/* Preview */}
                          <button
                            onClick={() => handlePreview(schedule)}
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

      {/* ========== PREVIEW MODAL ========== */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, schedule: null })}
        title="Detail Jadwal Siaran"
        size="lg"
        icon={<Tv className="w-5 h-5 text-accent-purple" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setPreviewModal({ open: false, schedule: null })}
              className="px-4 py-2.5 rounded-xl bg-bg-card-hover border border-border-subtle text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                const scheduleToEdit = previewModal.schedule;
                setPreviewModal({ open: false, schedule: null });
                handleEditSchedule(scheduleToEdit);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-cta text-text-on-cta hover:opacity-90 text-sm font-semibold transition-opacity shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Jadwal</span>
            </button>
          </div>
        }
      >
        {previewModal.schedule && (() => {
          const s = previewModal.schedule;
          const statusKey = getScheduleStatus(s);
          const statusBadge = getStatusBadge(statusKey);
          const StatusIcon = statusBadge.icon;
          const videoId = getYouTubeVideoId(s.youtube_url);
          const thumbnailSrc = s.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

          return (
            <div className="space-y-4">
              {/* Media Thumbnail or Title Banner */}
              {thumbnailSrc ? (
                <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-surface">
                  <div className="aspect-video w-full max-h-52 overflow-hidden bg-black/60 relative">
                    <img
                      src={thumbnailSrc}
                      alt={s.title}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-transparent to-black/30" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md shadow-sm ${statusBadge.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-bg-base/80 border border-border-subtle text-text-primary backdrop-blur-md shadow-sm">
                        {s.game_category || 'UMUM'}
                      </span>
                    </div>

                    {s.youtube_url && (
                      <div className="absolute bottom-3 right-3">
                        <a
                          href={s.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold backdrop-blur-md transition-colors shadow-sm"
                        >
                          <YouTubeIcon size={14} />
                          <span>Buka Siaran</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-bg-card">
                    <h3 className="text-base font-bold text-text-primary leading-snug">
                      {s.title}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge.class}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusBadge.label}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-bg-input text-text-secondary border border-border-subtle">
                      {s.game_category || 'UMUM'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary leading-snug">
                    {s.title}
                  </h3>
                </div>
              )}

              {/* 2-Column Schedule & Countdown Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Waktu Siaran</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      {formatDateTime(s.scheduled_at)}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                    s.countdown_enabled
                      ? 'bg-status-upcoming/10 text-status-upcoming border-status-upcoming/20'
                      : 'bg-bg-input text-text-muted border-border-subtle'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Countdown Fansite</p>
                    <p className={`text-sm font-semibold mt-0.5 ${
                      s.countdown_enabled ? 'text-status-upcoming' : 'text-text-muted'
                    }`}>
                      {s.countdown_enabled ? 'Aktif di Beranda' : 'Nonaktif'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collab Streamer Info */}
              {s.collab_guest && (
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Kolaborasi</p>
                      <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
                        @{s.collab_guest.replace(/^@/, '')}
                      </p>
                    </div>
                  </div>
                  {s.collab_social && (
                    <a
                      href={s.collab_social.startsWith('http') ? s.collab_social : `https://${s.collab_social}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary transition-colors shrink-0"
                    >
                      <span>Kanal Tamu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Description */}
              {s.description && (
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle space-y-1.5">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Deskripsi Siaran</p>
                  <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                    {s.description}
                  </p>
                </div>
              )}

              {/* YouTube Card (when no thumbnail was shown above) */}
              {s.youtube_url && !thumbnailSrc && (
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                      <YouTubeIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Tautan YouTube</p>
                      <p className="text-xs font-mono text-text-secondary truncate mt-0.5">{s.youtube_url}</p>
                    </div>
                  </div>
                  <a
                    href={s.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
                  >
                    <span>Buka YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Metadata Footer: ID, Platform, Timestamps */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border-subtle text-xs text-text-muted">
                <div className="flex items-center gap-3">
                  <span>ID Jadwal: #{s.id}</span>
                  <span>Platform: {s.stream_platform || 'YouTube'}</span>
                </div>
                <div>
                  <span>Dibuat: {s.created_at ? formatDateTime(s.created_at) : 'Tercatat di sistem'}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

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

      {/* ========== END STREAM CONFIRMATION MODAL ========== */}
      <Modal
        isOpen={endStreamModal.open}
        onClose={handleEndStreamCancel}
        title="Akhiri Siaran?"
        confirmText="Akhiri Siaran"
        cancelText="Batal"
        onConfirm={handleEndStreamConfirm}
        variant="danger"
        loading={endStreamLoading}
      >
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin mengakhiri siaran <span className="text-text-primary font-semibold">"{endStreamModal.schedule?.title}"</span>?
          </p>
          <div className="p-3 bg-status-live/10 border border-status-live/20 rounded-lg">
            <p className="text-status-live text-xs font-medium flex items-center gap-2">
              <Power className="w-4 h-4" />
              Siaran akan segera ditandai selesai
            </p>
          </div>
          <p className="text-text-muted text-xs">
            Stream akan otomatis berakhir setelah 5 jam jika tidak diakhiri manual.
          </p>
        </div>
      </Modal>

      {/* ========== CONVERT TO CONTENT GUIDE MODAL ========== */}
      <Modal
        isOpen={convertModal.open}
        onClose={handleConvertCancel}
        title="Jadikan Content Guide"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-start gap-3">
            <BookPlus className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {convertModal.isPostEndStream
                  ? 'Siaran Telah Selesai'
                  : 'Buat Konten Katalog dari Jadwal Siaran'}
              </p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Apakah Anda ingin menambahkan siaran{' '}
                <span className="font-semibold text-text-primary">
                  "{convertModal.schedule?.title}"
                </span>{' '}
                ke formulir Content Guide? Data judul, kategori, URL video, dan thumbnail akan otomatis diisikan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleConvertCancel}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-input rounded-xl transition-colors"
            >
              Nanti Saja
            </button>
            <button
              type="button"
              onClick={handleConvertConfirm}
              className="px-4 py-2 text-sm font-semibold bg-accent-cyan text-bg-base hover:bg-accent-cyan/90 rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-accent-cyan/20"
            >
              <BookPlus className="w-4 h-4" />
              <span>Buka Form Content Guide</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SchedulePage;
