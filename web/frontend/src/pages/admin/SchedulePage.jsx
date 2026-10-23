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
  CalendarPlus,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Power,
  ExternalLink,
  Users,
  BookPlus,
  LayoutGrid,
  List,
  CheckCircle,
  ArrowRight,
  Sparkles,
  PlayCircle
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
    live: { label: 'LIVE ON AIR', class: 'bg-status-live/15 text-status-live border-status-live/30', icon: Radio },
    upcoming: { label: 'UPCOMING', class: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30', icon: Clock },
    done: { label: 'SELESAI', class: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', icon: CheckCircle },
    archived: { label: 'SELESAI', class: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', icon: CheckCircle },
  };
  return statusMap[status] || statusMap.upcoming;
};

// Format day and date block for calendar list
const formatScheduleDay = (dateString) => {
  const d = safeParseDate(dateString);
  if (!d) return { dayName: '-', dayNum: '-', month: '-' };
  return {
    dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase(),
    dayNum: d.getDate(),
    month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
  };
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

  // View Mode: 'cards' (rich horizontal cards) vs 'table' (compact spreadsheet)
  const [viewMode, setViewMode] = useState('cards');

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
      const normalized = rawData.map(normalizeSchedule);
      setSchedules(normalized);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
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

  // Handle direct navigation to Content Guide with prefill
  const handleDirectConvertToContent = (schedule) => {
    if (!schedule) return;
    navigate('/admin/content', {
      state: {
        prefillSchedule: {
          title: schedule.title || '',
          game_tag: schedule.game_category || 'Gaming',
          youtube_url: schedule.youtube_url || '',
          thumbnail_url: schedule.thumbnail_url || '',
          total_duration: schedule.estimated_duration || '2-3 Jam',
        }
      }
    });
  };

  const handleConvertConfirm = () => {
    if (!convertModal.schedule) return;
    const s = convertModal.schedule;
    setConvertModal({ open: false, schedule: null, isPostEndStream: false });
    handleDirectConvertToContent(s);
  };

  const handleConvertCancel = () => {
    setConvertModal({ open: false, schedule: null, isPostEndStream: false });
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

  // Filter schedules by search and active status tab
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.game_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    return getScheduleStatus(schedule) === activeFilter;
  });

  // Count finished streams ready for content guide
  const completedStreamsCount = schedules.filter(s => {
    const st = getScheduleStatus(s);
    return st === 'done' || st === 'archived';
  }).length;

  // Format date time (safe version)
  const formatDateTime = (datetime) => {
    const date = safeParseDate(datetime);
    if (!date) return '-';
    const dateStr = safeFormatDate(datetime, {
      weekday: 'short',
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

  const formatTimeOnly = (datetime) => {
    const timeStr = safeFormatTime(datetime, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }, '');
    return timeStr ? timeStr + ' WIB' : '';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">

      {/* ========== 1. HEADER SECTION ========== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-cyan" />
            <span className="text-xs font-mono text-accent-cyan font-semibold tracking-wider uppercase">
              Siaran & Penjadwalan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Manajemen Jadwal
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Kelola sesi streaming Xion, koordinasi kolaborasi, dan sinkronisasi hitung mundur publik.
          </p>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAddSchedule}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta font-semibold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Tambah Jadwal</span>
        </button>
      </div>

      {/* ========== 2. SUMMARY METRIC CARDS (Bebas AI Slop & Ramah Light Mode) ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status Siaran Saat Ini */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-border-active transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Status Siaran
            </span>
            <Radio className={`w-4 h-4 ${summaryStats.activeBroadcast ? 'text-status-live animate-pulse' : 'text-text-muted'}`} />
          </div>
          <div className="mt-2">
            {statsLoading ? (
              <div className="h-6 w-24 bg-bg-surface rounded animate-pulse" />
            ) : summaryStats.activeBroadcast ? (
              <>
                <p className="text-base font-bold text-status-live flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-status-live animate-ping" />
                  LIVE ON AIR
                </p>
                <p className="text-xs text-text-secondary truncate mt-0.5" title={summaryStats.activeBroadcast.title}>
                  {summaryStats.activeBroadcast.title}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-text-primary">STANDBY</p>
                <p className="text-xs text-text-muted mt-0.5">Tidak ada siaran aktif</p>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Slot Terjadwal */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveFilter('upcoming')}
          onKeyDown={(e) => { if (e.key === 'Enter') setActiveFilter('upcoming'); }}
          className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-accent-purple/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Slot Terjadwal (7 Hari)
            </span>
            <Calendar className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="mt-2">
            {statsLoading ? (
              <div className="h-6 w-16 bg-bg-surface rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-extrabold font-mono text-text-primary group-hover:text-accent-purple transition-colors">
                  {summaryStats.scheduledSlots} <span className="text-xs font-normal font-sans text-text-secondary">Sesi</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">Sesi siaran siap tayang</p>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Siaran Selesai */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveFilter('done')}
          onKeyDown={(e) => { if (e.key === 'Enter') setActiveFilter('done'); }}
          className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Siaran Selesai
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            {statsLoading ? (
              <div className="h-6 w-16 bg-bg-surface rounded animate-pulse" />
            ) : (
              <>
                <p className="text-2xl font-extrabold font-mono text-text-primary group-hover:text-emerald-500 transition-colors">
                  {summaryStats.completedSlots || completedStreamsCount} <span className="text-xs font-normal font-sans text-text-secondary">Sesi</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">Tersimpan dalam arsip rekaman</p>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Siap Dijadikan Content Guide */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/admin/content')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/content'); }}
          className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-accent-cyan/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Katalog Content Guide
            </span>
            <BookPlus className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold font-mono text-accent-cyan">
              {completedStreamsCount} <span className="text-xs font-normal font-sans text-text-secondary">Arsip</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5 flex items-center justify-between">
              <span>Siap diarsipkan ke panduan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-accent-cyan" />
            </p>
          </div>
        </div>
      </div>

      {/* ========== 3. MAIN SCHEDULE HUB (Rich Stream Cards vs Compact Table) ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-bg-surface">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-bg-card border border-border-subtle rounded-xl overflow-x-auto scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const count = tab.key === 'all'
                ? schedules.length
                : schedules.filter(s => getScheduleStatus(s) === tab.key).length;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleFilterChange(tab.key)}
                  className={`
                    px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5
                    ${activeFilter === tab.key
                      ? 'bg-accent-cyan text-text-on-cta shadow-sm font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeFilter === tab.key ? 'bg-black/20 text-white' : 'bg-bg-surface text-text-muted'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar: Search, View Mode Switcher, Refresh */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, game, atau deskripsi..."
                className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  &times;
                </button>
              )}
            </div>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-bg-card border border-border-subtle rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-accent-cyan text-text-on-cta shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Tampilan Kartu Siaran (Rapi & Proporsional)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-accent-cyan text-text-on-cta shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Tampilan Tabel Ringkas"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Reload button */}
            <button
              type="button"
              onClick={() => {
                fetchSchedules(activeFilter);
                fetchSummaryStats();
              }}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-card border border-border-subtle rounded-xl transition-colors shrink-0"
              title="Refresh Jadwal"
            >
              <RefreshCw className={`w-4 h-4 ${schedulesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body: Cards View vs Table View */}
        {schedulesLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-20 bg-bg-surface rounded-2xl animate-pulse" />
            <div className="h-20 bg-bg-surface rounded-2xl animate-pulse" />
            <div className="h-20 bg-bg-surface rounded-2xl animate-pulse" />
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <Calendar className="w-7 h-7 opacity-40" />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              {searchQuery ? 'Tidak ada jadwal yang cocok' : 'Belum ada jadwal pada kategori ini'}
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm mt-1 mb-5 leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan hasil dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Buat agenda streaming baru agar muncul di antrean dan portal penonton.'}
            </p>
            <button
              type="button"
              onClick={handleAddSchedule}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-cyan text-text-on-cta text-xs font-semibold shadow-sm hover:bg-accent-cyan-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Stream Baru</span>
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ================================================================= */
          /* 3.A RICH STREAM CARDS VIEW (Mengatasi Ruang Kosong Melompong)     */
          /* ================================================================= */
          <div className="p-4 sm:p-5 space-y-3">
            {filteredSchedules.map((schedule) => {
              const status = getScheduleStatus(schedule);
              const statusBadge = getStatusBadge(status);
              const StatusIcon = statusBadge.icon;
              const isLive = status === 'live';
              const isDone = status === 'done';
              const dayInfo = formatScheduleDay(schedule.scheduled_at);
              const videoId = getYouTubeVideoId(schedule.youtube_url);
              const thumbnailSrc = schedule.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

              return (
                <div
                  key={schedule.id}
                  className={`
                    flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200
                    ${isLive
                      ? 'bg-status-live/5 border-status-live/30 shadow-md ring-1 ring-status-live/20'
                      : 'bg-bg-surface hover:bg-bg-card-hover border-border-subtle hover:border-border-active shadow-sm'}
                  `}
                >
                  {/* Left: Date Block + Thumbnail Preview + Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Calendar Date Block */}
                    <div className={`
                      w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border shadow-sm
                      ${isLive
                        ? 'bg-status-live/15 border-status-live/30 text-status-live'
                        : 'bg-bg-card border-border-subtle'}
                    `}>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-accent-purple">
                        {dayInfo.dayName}
                      </span>
                      <span className="text-xl font-extrabold font-mono text-text-primary leading-none mt-0.5">
                        {dayInfo.dayNum}
                      </span>
                      <span className="text-[8px] font-mono text-text-muted uppercase mt-0.5">
                        {dayInfo.month}
                      </span>
                    </div>

                    {/* Thumbnail Preview (Hidden on small mobile) */}
                    {thumbnailSrc && (
                      <div className="w-24 h-14 rounded-xl overflow-hidden bg-black/40 border border-border-subtle flex-shrink-0 hidden md:block relative shadow-inner">
                        <img
                          src={thumbnailSrc}
                          alt={schedule.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {isLive && (
                          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-status-live animate-ping" />
                        )}
                      </div>
                    )}

                    {/* Stream Content Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>

                        {/* Schedule Time */}
                        <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeOnly(schedule.scheduled_at)}
                        </span>

                        {/* Game Category Chip */}
                        {schedule.game_category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-bg-card border border-border-subtle text-text-secondary truncate max-w-[130px]">
                            {schedule.game_category}
                          </span>
                        )}

                        {/* Collab Guest Chip */}
                        {schedule.collab_guest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                            <Users className="w-3 h-3" />
                            @{schedule.collab_guest.replace(/^@/, '')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                        {schedule.title}
                      </h3>

                      {schedule.description ? (
                        <p className="text-xs text-text-muted truncate mt-0.5 max-w-2xl">
                          {schedule.description}
                        </p>
                      ) : (
                        <p className="text-xs text-text-muted italic mt-0.5">
                          Tidak ada deskripsi tambahan
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons (User Friendly & Prominent) */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-border-subtle">
                    {/* Prominent CTA for Finished Streams: + Content Guide */}
                    {isDone && (
                      <button
                        type="button"
                        onClick={() => handleDirectConvertToContent(schedule)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/35 text-accent-cyan text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap"
                        title="Buat Content Guide dari siaran ini"
                      >
                        <BookPlus className="w-3.5 h-3.5" />
                        <span>+ Content Guide</span>
                      </button>
                    )}

                    {/* Live Streamer End Button */}
                    {isLive && (
                      <button
                        type="button"
                        onClick={() => handleEndStreamClick(schedule)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-status-live/15 hover:bg-status-live/25 text-status-live border border-status-live/30 transition-colors shadow-sm"
                        title="Akhiri Siaran Langsung"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Akhiri</span>
                      </button>
                    )}

                    {/* YouTube Link */}
                    {schedule.youtube_url && (
                      <a
                        href={schedule.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-border-subtle"
                        title="Buka YouTube"
                      >
                        <YouTubeIcon size={16} />
                      </a>
                    )}

                    {/* Preview Detail */}
                    <button
                      type="button"
                      onClick={() => handlePreview(schedule)}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-card rounded-xl transition-colors border border-transparent hover:border-border-subtle"
                      title="Lihat Detail Siaran"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleEditSchedule(schedule)}
                      className="p-2 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-xl transition-colors border border-transparent hover:border-accent-cyan/30"
                      title="Edit Jadwal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(schedule)}
                      className="p-2 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-xl transition-colors border border-transparent hover:border-status-live/30"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================================================================= */
          /* 3.B COMPACT TABLE VIEW                                           */
          /* ================================================================= */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface border-b border-border-subtle">
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-16">NO</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">JUDUL STREAM</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-36">KATEGORI</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-52">TANGGAL & WAKTU</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-32">STATUS</th>
                  <th className="px-5 py-3 text-right text-xs font-mono text-text-muted uppercase tracking-wider w-56">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredSchedules.map((schedule, index) => {
                  const status = getScheduleStatus(schedule);
                  const statusBadge = getStatusBadge(status);
                  const isLive = status === 'live';
                  const isDone = status === 'done';

                  return (
                    <tr
                      key={schedule.id}
                      className={`
                        transition-colors
                        ${isLive ? 'bg-status-live/5' : 'hover:bg-bg-surface'}
                      `}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="min-w-0 max-w-md">
                          <p className="text-sm font-bold text-text-primary truncate">{schedule.title}</p>
                          {schedule.description && (
                            <p className="text-xs text-text-muted truncate mt-0.5">{schedule.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-md bg-bg-surface border border-border-subtle text-text-secondary truncate max-w-[120px]">
                          {schedule.game_category || 'UMUM'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-text-secondary flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                          {formatDateTime(schedule.scheduled_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${statusBadge.class} whitespace-nowrap`}>
                          <statusBadge.icon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDone && (
                            <button
                              type="button"
                              onClick={() => handleDirectConvertToContent(schedule)}
                              className="px-2.5 py-1 rounded-lg bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/35 text-accent-cyan text-xs font-semibold transition-all whitespace-nowrap"
                            >
                              + Guide
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePreview(schedule)}
                            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-1.5 text-text-muted hover:text-accent-cyan rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(schedule)}
                            className="p-1.5 text-text-muted hover:text-status-live rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted bg-bg-surface">
          <span>Menampilkan {filteredSchedules.length} dari {schedules.length} jadwal streaming</span>
          <span className="font-mono">Zona Waktu: Asia/Jakarta (WIB)</span>
        </div>
      </div>

      {/* ========== 4. SCHEDULE FORM PANEL ========== */}
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

      {/* ========== 5. DETAIL MODAL (Redesign Total: Rapi & Media Card Studio) ========== */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, schedule: null })}
        title="Detail Jadwal Siaran"
        size="lg"
        icon={<PlayCircle className="w-5 h-5 text-accent-cyan" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setPreviewModal({ open: false, schedule: null })}
              className="px-4 py-2 rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const scheduleToEdit = previewModal.schedule;
                  setPreviewModal({ open: false, schedule: null });
                  handleEditSchedule(scheduleToEdit);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-cyan text-text-on-cta hover:bg-accent-cyan-hover text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Jadwal</span>
              </button>
            </div>
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
          const isDone = statusKey === 'done';

          return (
            <div className="space-y-4">
              {/* Media Preview Header */}
              <div className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-surface shadow-sm">
                {thumbnailSrc ? (
                  <div className="aspect-video w-full max-h-56 sm:max-h-64 overflow-hidden bg-black/70 relative group">
                    <img
                      src={thumbnailSrc}
                      alt={s.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-black/25 to-black/40" />

                    {/* Status & Category Badges */}
                    <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 z-10">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md shadow-md ${statusBadge.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                      {s.game_category && (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md shadow-md">
                          {s.game_category}
                        </span>
                      )}
                    </div>

                    {/* YouTube Watch Pill */}
                    {s.youtube_url && (
                      <div className="absolute bottom-3.5 right-3.5 z-10">
                        <a
                          href={s.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md active:scale-95"
                        >
                          <YouTubeIcon size={14} />
                          <span>Buka Siaran</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border-b border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                      {s.game_category && (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-bg-card border border-border-subtle text-text-secondary">
                          {s.game_category}
                        </span>
                      )}
                    </div>
                    {s.youtube_url && (
                      <a
                        href={s.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                      >
                        <YouTubeIcon size={14} />
                        <span>YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Title & Collab Info */}
                <div className="p-4 sm:p-5 bg-bg-card">
                  <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight leading-snug">
                    {s.title}
                  </h2>

                  {s.collab_guest && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle text-xs">
                      <Users className="w-4 h-4 text-accent-purple flex-shrink-0" />
                      <span className="text-text-muted">Streaming Bersama:</span>
                      <span className="font-semibold text-text-primary">@{s.collab_guest.replace(/^@/, '')}</span>
                      {s.collab_social && (
                        <a
                          href={s.collab_social.startsWith('http') ? s.collab_social : `https://${s.collab_social}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-accent-purple hover:underline"
                        >
                          <span>Kanal Tamu</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Metadata Ribbon (Compact & Balanced) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-surface border border-border-subtle">
                  <Calendar className="w-4 h-4 text-accent-purple flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">Waktu Pelaksanaan</p>
                    <p className="text-xs sm:text-sm font-semibold text-text-primary mt-0.5 truncate">
                      {formatDateTime(s.scheduled_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-surface border border-border-subtle">
                  <Clock className={`w-4 h-4 flex-shrink-0 ${s.countdown_enabled ? 'text-accent-cyan' : 'text-text-muted'}`} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">Countdown Fansite</p>
                    <p className={`text-xs sm:text-sm font-semibold mt-0.5 truncate ${
                      s.countdown_enabled ? 'text-accent-cyan' : 'text-text-muted'
                    }`}>
                      {s.countdown_enabled ? 'Aktif Tayang di Beranda' : 'Nonaktif (Selesai / Diarsipkan)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Block (Adaptive Height, No Dead Space) */}
              {s.description && (
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border-subtle space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">Deskripsi Siaran</p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {s.description}
                  </p>
                </div>
              )}

              {/* Conversion to Content Guide Banner for Completed Streams */}
              {isDone && (
                <div className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <BookPlus className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-accent-cyan uppercase tracking-wider font-mono">
                        Siaran Telah Selesai
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Tambahkan rekaman siaran ini langsung ke katalog panduan konten penonton.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewModal({ open: false, schedule: null });
                      handleDirectConvertToContent(s);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent-cyan hover:bg-accent-cyan-hover text-text-on-cta text-xs font-bold transition-all shadow-md shrink-0 active:scale-95 whitespace-nowrap"
                  >
                    <BookPlus className="w-4 h-4" />
                    <span>Jadikan Content Guide</span>
                  </button>
                </div>
              )}

              {/* Metadata Footer: ID, Platform, Timestamps */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs text-text-muted">
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

      {/* ========== 6. DELETE CONFIRMATION MODAL ========== */}
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

      {/* ========== 7. END STREAM CONFIRMATION MODAL ========== */}
      <Modal
        isOpen={endStreamModal.open}
        onClose={handleEndStreamCancel}
        title="Akhiri Siaran Langsung"
        confirmText="Ya, Akhiri Siaran"
        cancelText="Batal"
        onConfirm={handleEndStreamConfirm}
        variant="danger"
        loading={endStreamLoading}
      >
        <p className="text-text-secondary text-sm">
          Apakah kamu yakin ingin mengakhiri sesi live stream <span className="text-text-primary font-semibold">"{endStreamModal.schedule?.title}"</span> sekarang?
        </p>
        <p className="text-text-muted text-xs mt-2">
          Status jadwal akan diubah menjadi SELESAI dan sinyal siaran di portal publik akan dinonaktifkan.
        </p>
      </Modal>

      {/* ========== 8. POST-STREAM CONVERT TO CONTENT GUIDE MODAL ========== */}
      <Modal
        isOpen={convertModal.open}
        onClose={handleConvertCancel}
        title="Siaran Selesai &bull; Jadikan Content Guide?"
        confirmText="Ya, Buka Formulir Content Guide"
        cancelText="Nanti Saja"
        onConfirm={handleConvertConfirm}
        variant="success"
      >
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">
            Siaran <span className="text-text-primary font-semibold">"{convertModal.schedule?.title}"</span> telah berhasil diakhiri!
          </p>
          <p className="text-text-muted text-xs leading-relaxed">
            Apakah Anda ingin langsung menambahkan rekaman siaran ini ke katalog <strong>Content Guide</strong>? Sistem akan mengisi otomatis judul, kategori game, tautan video YouTube, dan thumbnail.
          </p>
        </div>
      </Modal>

    </div>
  );
}

export default SchedulePage;
