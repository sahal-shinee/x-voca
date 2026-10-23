import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { getStats, getAuditLogs } from '../../services/dashboardService';
import { getSchedules } from '../../services/scheduleService';
import { getGames } from '../../services/gameService';
import { todoService } from '../../services/todoService';
import { useBroadcastingStatus } from '../../hooks/useFirebase';
import { useToast } from '../../components/common/Toast';
import Toggle from '../../components/common/Toggle';
import {
  Calendar,
  CalendarPlus,
  CheckSquare,
  PlayCircle,
  Plus,
  Eye,
  BookOpen,
  Clock,
  Radio,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Gamepad2,
  ArrowRight,
  AlertCircle,
  Trophy,
  Flame,
  ExternalLink,
  ShieldAlert,
  Loader2,
  X
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safely parse date string to Date object */
const safeParseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/** Format relative time for audit log entries */
const formatTimeAgo = (dateString) => {
  if (!dateString) return '-';
  const date = safeParseDate(dateString);
  if (!date) return '-';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

/** Format schedule date display */
const formatScheduleDate = (dateString) => {
  if (!dateString) return '-';
  const date = safeParseDate(dateString);
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/** Format schedule time */
const formatScheduleTime = (dateString) => {
  if (!dateString) return '';
  const date = safeParseDate(dateString);
  if (!date) return '';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

/** Format day and date block for calendar list */
const formatScheduleDay = (dateString) => {
  const d = safeParseDate(dateString);
  if (!d) return { dayName: '-', dayNum: '-', month: '-' };
  return {
    dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase(),
    dayNum: d.getDate(),
    month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()
  };
};

/** Calculate relative countdown string */
const getCountdownText = (targetDateString) => {
  if (!targetDateString) return null;
  const target = safeParseDate(targetDateString);
  if (!target) return null;
  const now = new Date();
  const diffMs = target - now;
  if (diffMs <= 0) return 'Waktu siaran telah tiba';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays} hari ${remainingHours > 0 ? `${remainingHours} jam lagi` : 'lagi'}`;
  }
  if (diffHours > 0) {
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours} jam ${diffMins > 0 ? `${diffMins} mnt lagi` : 'lagi'}`;
  }
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return `${Math.max(1, diffMins)} menit lagi`;
};

/** Map action code to timeline badge */
const getActionMeta = (action) => {
  const actionType = action?.action_type || action || '';

  const map = {
    VOTE_MASUK: { label: 'Vote Masuk', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    vote_in: { label: 'Vote Masuk', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    JADWAL_UPDATE: { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    schedule_updated: { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    schedule_created: { label: 'Jadwal Dibuat', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    REQUEST_GAME: { label: 'Request Game', bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
    game_requested: { label: 'Request Game', bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
    CONTENT_ARCHIVE: { label: 'Aset Diarsip', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    asset_archived: { label: 'Aset Diarsip', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    content_added: { label: 'Konten Baru', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    content_updated: { label: 'Konten Diupdate', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    BROADCASTING_TOGGLE: { label: 'Broadcasting', bg: 'bg-status-live/15', text: 'text-status-live' },
    COLLAB_REQUEST: { label: 'Collab Request', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    collab_request: { label: 'Collab Request', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    todo_created: { label: 'Todo Baru', bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
    todo_completed: { label: 'Todo Selesai', bg: 'bg-emerald-500/15', text: 'text-emerald-500' },
  };

  const found = map[actionType] || map[actionType.toUpperCase()] || map[actionType.toLowerCase()];
  return found || { label: actionType || 'Aktivitas', bg: 'bg-bg-surface', text: 'text-text-secondary' };
};

/** Filter options for audit log */
const LOG_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: '24h', label: '24 Jam Terakhir' },
  { value: 'week', label: 'Minggu Ini' },
];

function SkeletonCard() {
  return (
    <div className="bg-bg-card rounded-2xl p-5 border border-border-subtle animate-pulse space-y-3">
      <div className="h-4 w-1/3 bg-bg-surface rounded" />
      <div className="h-8 w-1/2 bg-bg-surface rounded" />
      <div className="h-3 w-3/4 bg-bg-surface/60 rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isReady: fbIsReady } = useBroadcastingStatus();

  // ── State ──────────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState('Admin');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loadingBroadcasting, setLoadingBroadcasting] = useState(false);

  // Broadcast toggle confirmation modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [pendingBroadcastVal, setPendingBroadcastVal] = useState(false);

  const [stats, setStats] = useState({
    totalVotes: 0,
    upcomingSchedules: 0,
    pendingTodos: 0,
    activeContent: 0,
    votesGrowth: 0,
    urgentTodos: 0,
    pendingCollabs: 0,
    pendingGames: 0,
    topVotedGame: null,
    activeBroadcast: null,
    activePeriod: '',
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Top games list for the voting race
  const [topGamesList, setTopGamesList] = useState([]);

  // Top pending todos for prep checklist
  const [recentTodos, setRecentTodos] = useState([]);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsLimit] = useState(6);
  const [auditLogFilter, setAuditLogFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Live clock updated every second
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // ── Sync broadcasting status from Firebase ─────────────────────────────────
  useEffect(() => {
    if (!loadingBroadcasting) {
      const id = setTimeout(() => setIsBroadcasting(fbIsReady || false), 0);
      return () => clearTimeout(id);
    }
  }, [fbIsReady, loadingBroadcasting]);

  // Combined live state: either manual toggle is active, Firebase reports ready, or there is an active stream
  const isLiveState = Boolean(isBroadcasting || fbIsReady || stats.activeBroadcast);

  // ── Live clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Fetch user data ────────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data?.data) {
        setUserName(response.data.data.name || 'Admin');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  // ── Initiate toggle broadcasting (open modal for confirmation) ─────────────
  const requestToggleBroadcasting = (newVal) => {
    setPendingBroadcastVal(newVal);
    setShowBroadcastModal(true);
  };

  // ── Execute broadcasting status change upon confirmation ───────────────────
  const confirmToggleBroadcasting = async () => {
    const targetVal = pendingBroadcastVal;
    setShowBroadcastModal(false);
    setLoadingBroadcasting(true);

    try {
      await authAPI.toggleBroadcasting(targetVal);
      setIsBroadcasting(targetVal);

      if (targetVal) {
        toast.success('Status siaran diaktifkan: LIVE ON AIR!');
      } else {
        toast.info('Status siaran dinonaktifkan (STANDBY).');
      }
    } catch (error) {
      console.error('Error toggling broadcasting:', error);
      toast.error('Gagal memperbarui status siaran. Silakan coba lagi.');
      setIsBroadcasting(!targetVal);
    } finally {
      setLoadingBroadcasting(false);
    }
  };

  // ── Fetch stats ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      const b = response?.data?.data?.stats || response?.data?.stats || response?.data || {};

      setStats({
        totalVotes: b.votes?.total || 0,
        upcomingSchedules: b.schedules?.upcoming || 0,
        pendingTodos: b.todos?.pending || 0,
        activeContent: b.content?.visible || 0,
        votesGrowth: b.votes?.change_percent || 0,
        urgentTodos: b.todos?.urgent || 0,
        pendingCollabs: b.collabs?.pending || 0,
        pendingGames: b.games?.requested || 0,
        topVotedGame: b.topVotedGame || null,
        activeBroadcast: b.activeBroadcast || null,
        activePeriod: b.active_period || '',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalVotes: 0,
        upcomingSchedules: 0,
        pendingTodos: 0,
        activeContent: 0,
        votesGrowth: 0,
        urgentTodos: 0,
        pendingCollabs: 0,
        pendingGames: 0,
        topVotedGame: null,
        activeBroadcast: null,
        activePeriod: '',
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch top games for the live voting race ───────────────────────────────
  const fetchTopGames = useCallback(async () => {
    try {
      const res = await getGames();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        const sorted = [...list].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        setTopGamesList(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching games for race:', err);
    }
  }, []);

  // ── Fetch pending todos for prep checklist ──────────────────────────────────
  const fetchRecentTodos = useCallback(async () => {
    try {
      const res = await todoService.getAll();
      let items = [];
      if (res?.data?.todos) items = res.data.todos;
      else if (res?.data?.data?.todos) items = res.data.data.todos;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res)) items = res;

      const pending = items.filter(t => t.status !== 'completed');
      setRecentTodos(pending.slice(0, 3));
    } catch (err) {
      console.error('Error fetching recent todos:', err);
    }
  }, []);

  // ── Fetch audit logs ───────────────────────────────────────────────────────
  const fetchAuditLogs = useCallback(async (page = 1) => {
    setAuditLogsLoading(true);
    try {
      const response = await getAuditLogs({ limit: auditLogsLimit, page });
      let logs = [];
      let total = 0;

      if (response?.data) {
        if (Array.isArray(response.data)) {
          logs = response.data;
          total = logs.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          logs = response.data.data;
          total = response.data.meta?.total || logs.length;
        } else if (response.data.logs && Array.isArray(response.data.logs)) {
          logs = response.data.logs;
          total = response.data.pagination?.total || response.data.total || logs.length;
        }
      }

      setAuditLogs(logs);
      setAuditLogsTotal(total);
      setAuditLogsPage(page);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setAuditLogs([]);
      setAuditLogsTotal(0);
      setAuditLogsPage(page);
    } finally {
      setAuditLogsLoading(false);
    }
  }, [auditLogsLimit]);

  // ── Fetch upcoming streams ─────────────────────────────────────────────────
  const fetchUpcomingStreams = useCallback(async () => {
    setUpcomingLoading(true);
    try {
      const response = await getSchedules({ status: 'upcoming', limit: 4 });
      const data = response?.data || response || [];
      const list = Array.isArray(data) ? data : data.schedules || data.rows || [];
      setUpcomingStreams(list.slice(0, 4));
    } catch (error) {
      console.error('Error fetching upcoming streams:', error);
      setUpcomingStreams([]);
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  // ── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      fetchUserData();
      fetchStats();
      fetchTopGames();
      fetchRecentTodos();
      fetchAuditLogs(1);
      fetchUpcomingStreams();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchUserData, fetchStats, fetchTopGames, fetchRecentTodos, fetchAuditLogs, fetchUpcomingStreams]);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!showFilterDropdown) return;
    const handler = () => setShowFilterDropdown(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showFilterDropdown]);

  const handleRefreshAuditLogs = () => fetchAuditLogs(auditLogsPage);
  const totalPages = Math.ceil(auditLogsTotal / auditLogsLimit);

  // Filter audit logs by date in memory
  const displayedLogs = useMemo(() => {
    if (auditLogFilter === 'all') return auditLogs;
    const now = new Date();
    const thresholdMs = auditLogFilter === '24h'
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    return auditLogs.filter(log => {
      if (!log.created_at) return true;
      const diff = now - new Date(log.created_at);
      return diff <= thresholdMs;
    });
  }, [auditLogs, auditLogFilter]);

  // Format live clock
  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const activeFilterLabel = LOG_FILTERS.find((f) => f.value === auditLogFilter)?.label || 'Semua';

  // Check if any items need urgent attention
  const hasPendingItems = stats.pendingCollabs > 0 || stats.pendingGames > 0 || stats.urgentTodos > 0;

  // The very next upcoming stream
  const nextStream = upcomingStreams[0] || null;
  const nextStreamCountdown = nextStream ? getCountdownText(nextStream.scheduled_at) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── 1. Studio Cockpit & Master On-Air Header ───────────────────────── */}
      <div className="relative rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6 overflow-hidden shadow-sm">
        {/* Soft Accent Line on Top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan via-accent-purple to-transparent" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Streamer Identity & Studio Clock */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-xl sm:text-2xl font-bold font-mono text-accent-cyan">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${isLiveState ? 'bg-status-live animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest font-semibold">
                  {isLiveState ? 'Sinyal Siaran Aktif' : 'Studio Siap Beroperasi'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Halo, <span className="text-accent-cyan">{userName}</span>
              </h1>
              <p className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <span>{formattedDate}</span>
                <span className="font-mono text-text-primary font-medium">{formattedTime} WIB</span>
              </p>
            </div>
          </div>

          {/* Right: Master On-Air Broadcast Console */}
          <div className={`
            flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-200 self-stretch lg:self-auto
            ${isLiveState
              ? 'bg-status-live/10 border-status-live/30'
              : 'bg-bg-surface border-border-subtle hover:border-border-active'}
          `}>
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center flex-shrink-0">
                <Radio className={`w-5 h-5 ${isLiveState ? 'text-status-live animate-pulse' : 'text-text-muted'}`} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold">
                    Master Broadcast
                  </span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border
                    ${isLiveState
                      ? 'bg-status-live/15 text-status-live border-status-live/30 animate-pulse'
                      : 'bg-bg-card text-text-muted border-border-subtle'}
                  `}>
                    {isLiveState ? 'LIVE ON AIR' : 'STANDBY'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 max-w-xs truncate font-medium">
                  {isLiveState
                    ? (stats.activeBroadcast?.title
                        ? `Tayang: ${stats.activeBroadcast.title}`
                        : 'Sinyal streaming aktif di web publik')
                    : (nextStream
                        ? `Siaran terdekat: ${nextStream.title}`
                        : 'Belum ada jadwal tayang aktif')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isLiveState && stats.activeBroadcast?.youtube_url && (
                <a
                  href={stats.activeBroadcast.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-status-live/15 hover:bg-status-live/25 text-status-live border border-status-live/30 transition-colors"
                  title="Tonton di YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Room</span>
                </a>
              )}

              <Toggle
                checked={isLiveState}
                onChange={requestToggleBroadcasting}
                disabled={loadingBroadcasting}
                aria-label="Toggle Master Broadcasting"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full-Width Quick-Action Grid (Proporsi Rapi & Bebas Icon AI Slop) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {/* Action 1: Jadwal Baru */}
        <button
          type="button"
          onClick={() => navigate('/admin/schedules?action=create')}
          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-purple/50 hover:bg-bg-card-hover transition-all duration-150 shadow-sm group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CalendarPlus className="w-4 h-4 text-text-muted group-hover:text-accent-purple transition-colors flex-shrink-0" />
            <span className="text-xs font-semibold text-text-primary truncate">
              Jadwal Baru
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>

        {/* Action 2: Moderasi Voting */}
        <button
          type="button"
          onClick={() => navigate('/admin/voting')}
          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-cyan/50 hover:bg-bg-card-hover transition-all duration-150 shadow-sm group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Gamepad2 className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors flex-shrink-0" />
            <span className="text-xs font-semibold text-text-primary truncate">
              Moderasi Suara
            </span>
          </div>
          {stats.pendingGames > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 flex-shrink-0">
              {stats.pendingGames}
            </span>
          ) : (
            <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          )}
        </button>

        {/* Action 3: Collab Requests */}
        <button
          type="button"
          onClick={() => navigate('/admin/collab-requests')}
          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-purple/50 hover:bg-bg-card-hover transition-all duration-150 shadow-sm group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Users className="w-4 h-4 text-text-muted group-hover:text-accent-purple transition-colors flex-shrink-0" />
            <span className="text-xs font-semibold text-text-primary truncate">
              Collab Request
            </span>
          </div>
          {stats.pendingCollabs > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-accent-purple/15 text-accent-purple border border-accent-purple/30 flex-shrink-0">
              {stats.pendingCollabs}
            </span>
          ) : (
            <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          )}
        </button>

        {/* Action 4: Tambah Konten */}
        <button
          type="button"
          onClick={() => navigate('/admin/content?action=create')}
          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-gold/50 hover:bg-bg-card-hover transition-all duration-150 shadow-sm group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-text-muted group-hover:text-accent-gold transition-colors flex-shrink-0" />
            <span className="text-xs font-semibold text-text-primary truncate">
              Tambah Konten
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>

        {/* Action 5: Daftar Tugas */}
        <button
          type="button"
          onClick={() => navigate('/admin/todos')}
          className="flex items-center justify-between p-3.5 rounded-xl bg-bg-card border border-border-subtle hover:border-emerald-500/50 hover:bg-bg-card-hover transition-all duration-150 shadow-sm group text-left col-span-2 sm:col-span-1 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckSquare className="w-4 h-4 text-text-muted group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            <span className="text-xs font-semibold text-text-primary truncate">
              Daftar Tugas
            </span>
          </div>
          {stats.urgentTodos > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30 flex-shrink-0">
              {stats.urgentTodos} Urgent
            </span>
          ) : (
            <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          )}
        </button>
      </div>

      {/* ── Action Alert Strip (Only rendered when there are pending actions) ── */}
      {hasPendingItems && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-bg-card border border-amber-500/30 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-text-primary">Perlu Tindakan Admin</div>
              <div className="text-[11px] text-text-muted">Terdapat pengajuan atau tugas yang membutuhkan respon Anda</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats.pendingCollabs > 0 && (
              <button
                type="button"
                onClick={() => navigate('/admin/collab-requests')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/30 rounded-xl text-xs font-semibold text-accent-purple transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{stats.pendingCollabs} Collab Request</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {stats.pendingGames > 0 && (
              <button
                type="button"
                onClick={() => navigate('/admin/voting')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded-xl text-xs font-semibold text-accent-cyan transition-all"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{stats.pendingGames} Request Game</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {stats.urgentTodos > 0 && (
              <button
                type="button"
                onClick={() => navigate('/admin/todos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-500 transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.urgentTodos} Todo Urgent</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Bento Studio Grid (Asymmetric & Informative) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ── 3.1 Card 1 (Span 2 Kolom): Live Voting Race & Community Pulse ─── */}
        <div className="lg:col-span-2 relative rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-accent-cyan/40 transition-all group">
          {/* Top row */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent-gold flex-shrink-0" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-text-secondary">
                  Voting Pilihan Komunitas
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-bg-surface text-text-secondary border border-border-subtle">
                  {stats.totalVotes === 0 ? 'Periode Baru' : `${stats.totalVotes.toLocaleString('id-ID')} Suara`}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/admin/voting')}
                  className="p-1 rounded-lg text-text-muted hover:text-accent-cyan transition-colors"
                  title="Buka Halaman Voting"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voting Race Details */}
            {statsLoading ? (
              <div className="space-y-3 py-2">
                <div className="h-6 w-3/4 bg-bg-surface rounded animate-pulse" />
                <div className="h-3 w-full bg-bg-surface rounded animate-pulse" />
              </div>
            ) : stats.topVotedGame ? (
              <div className="space-y-3 mt-2">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-base sm:text-lg font-bold text-text-primary truncate">
                      {stats.topVotedGame.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-accent-gold whitespace-nowrap">
                      #1 Teratas • {stats.topVotedGame.vote_count} suara ({stats.topVotedGame.percentage}%)
                    </span>
                  </div>

                  {/* Gradient progress race bar */}
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden border border-border-subtle p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(12, stats.topVotedGame.percentage || 100))}%` }}
                    />
                  </div>
                </div>

                {/* Second runner up if exists */}
                {topGamesList.length > 1 && topGamesList[1].id !== stats.topVotedGame.id && (
                  <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
                    <span className="truncate max-w-[200px] flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-text-muted">#2</span>
                      <span className="truncate font-medium text-text-secondary">{topGamesList[1].title}</span>
                    </span>
                    <span className="font-mono text-text-secondary whitespace-nowrap">
                      {topGamesList[1].vote_count || 0} suara
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-3 text-xs text-text-muted">
                Belum ada suara masuk untuk periode ini. Sesi voting siap menerima pilihan penonton.
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {stats.pendingGames > 0 ? `${stats.pendingGames} request game menunggu review` : (stats.activePeriod ? `Periode: ${stats.activePeriod}` : 'Voting aktif')}
            </span>
            {stats.topVotedGame && (
              <button
                type="button"
                onClick={() => navigate(`/admin/schedules?action=create&game=${encodeURIComponent(stats.topVotedGame.title)}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent-gold/15 hover:bg-accent-gold/25 border border-accent-gold/30 text-accent-gold transition-all active:scale-95 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Jadwalkan Game Ini</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3.2 Card 2 (Span 1 Kolom): Sesi Siaran Terdekat ────────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/admin/schedules')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/schedules'); }}
          className="relative rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-accent-purple/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-purple flex-shrink-0" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-text-secondary">
                  Jadwal Siaran
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-bg-surface text-text-secondary border border-border-subtle">
                {stats.upcomingSchedules} Sesi
              </span>
            </div>

            {nextStream ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold font-mono text-accent-purple">
                    {formatScheduleTime(nextStream.scheduled_at)} WIB
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    • {formatScheduleDate(nextStream.scheduled_at)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-purple transition-colors">
                  {nextStream.title}
                </h4>
                {nextStreamCountdown && (
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {nextStreamCountdown}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 text-xs text-text-muted">
                Belum ada jadwal streaming 7 hari ke depan.
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs text-accent-purple group-hover:text-accent-purple-hover transition-colors">
            <span className="font-semibold">Buka Kalender Siaran</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* ── 3.3 Card 3 (Span 1 Kolom): Persiapan Siaran & Tugas ─────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigate('/admin/todos')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/todos'); }}
          className="relative rounded-2xl border border-border-subtle bg-bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-text-secondary">
                  Persiapan Siaran
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${
                stats.urgentTodos > 0
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/25 font-bold'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {stats.urgentTodos > 0 ? `${stats.urgentTodos} Urgent` : 'Aman'}
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-text-primary">
                  {stats.pendingTodos}
                </span>
                <span className="text-xs text-text-secondary">Tugas Belum Selesai</span>
              </div>

              {recentTodos.length > 0 ? (
                <div className="space-y-1 pt-1">
                  {recentTodos.slice(0, 2).map((todo) => (
                    <p key={todo.id} className="text-xs text-text-muted truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="truncate">{todo.title}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">
                  Semua checklist persiapan streaming selesai.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors">
            <span className="font-semibold">Review Daftar Todo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ── 4. Dual Studio Hub: Agenda Siaran + Live Activity Timeline ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── 4.1 Agenda Siaran (2 Kolom di Desktop) ───────────────────────── */}
        <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-accent-purple flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Agenda Siaran</h3>
                <p className="text-xs text-text-muted">Sesi siaran terjadwal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/schedules')}
              className="flex items-center gap-1 text-xs font-semibold text-accent-purple hover:text-accent-cyan transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Schedule List */}
          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-center">
            {upcomingLoading ? (
              <div className="space-y-2.5">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : upcomingStreams.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <Calendar className="w-8 h-8 text-text-muted opacity-40 mb-2" />
                <p className="text-sm font-semibold text-text-primary">Belum ada agenda siaran</p>
                <p className="text-xs text-text-muted mt-1 max-w-xs mb-4">
                  Rencanakan jadwal live stream berikutnya agar tampil di halaman publik.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/schedules?action=create')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent-purple/15 hover:bg-accent-purple/25 border border-accent-purple/30 text-accent-purple rounded-xl text-xs font-semibold transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Stream Baru</span>
                </button>
              </div>
            ) : (
              upcomingStreams.map((stream) => {
                const dayInfo = formatScheduleDay(stream.scheduled_at);
                return (
                  <div
                    key={stream.id}
                    onClick={() => navigate('/admin/schedules')}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-bg-surface hover:bg-bg-card-hover border border-border-subtle cursor-pointer transition-all duration-150 group"
                  >
                    {/* Calendar Day Block */}
                    <div className="w-11 h-11 rounded-xl bg-bg-card border border-border-subtle flex flex-col items-center justify-center flex-shrink-0 group-hover:border-accent-purple/40 transition-colors shadow-sm">
                      <span className="text-[9px] font-mono font-bold text-accent-purple uppercase">{dayInfo.dayName}</span>
                      <span className="text-base font-extrabold font-mono text-text-primary leading-none">{dayInfo.dayNum}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatScheduleTime(stream.scheduled_at)} WIB
                        </span>
                        {stream.game_category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-bg-card border border-border-subtle text-text-secondary truncate max-w-[120px]">
                            {stream.game_category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate group-hover:text-accent-purple transition-colors">
                        {stream.title}
                      </h4>
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-purple group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── 4.2 Live Activity Timeline (3 Kolom di Desktop - Tanpa Tabel Kaku) ── */}
        <div className="lg:col-span-3 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-bg-surface">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Aktivitas Terkini</h3>
                <p className="text-xs text-text-muted">Feed interaksi sistem & penonton secara real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {/* Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowFilterDropdown((v) => !v); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary border border-border-subtle rounded-xl hover:bg-bg-surface transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{activeFilterLabel}</span>
                </button>
                {showFilterDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1 w-40 bg-bg-card border border-border-subtle rounded-xl shadow-xl z-20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {LOG_FILTERS.map((f) => (
                      <button
                        type="button"
                        key={f.value}
                        onClick={() => { setAuditLogFilter(f.value); setShowFilterDropdown(false); }}
                        className={`
                          w-full text-left px-3 py-2 text-xs transition-colors
                          ${auditLogFilter === f.value
                            ? 'bg-accent-cyan/15 text-accent-cyan font-semibold'
                            : 'text-text-secondary hover:bg-bg-surface'}
                        `}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefreshAuditLogs}
                disabled={auditLogsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary border border-border-subtle rounded-xl hover:bg-bg-surface transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLogsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Timeline Feed (Bukan Tabel SQL) */}
          <div className="p-5 flex-1 overflow-y-auto">
            {auditLogsLoading ? (
              <div className="space-y-3">
                <div className="h-14 bg-bg-surface rounded-xl animate-pulse" />
                <div className="h-14 bg-bg-surface rounded-xl animate-pulse" />
                <div className="h-14 bg-bg-surface rounded-xl animate-pulse" />
              </div>
            ) : displayedLogs.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-text-muted opacity-30" />
                <p className="text-sm font-semibold text-text-primary">Tidak ada aktivitas pada rentang ini</p>
                <p className="text-xs text-text-muted">Aktivitas sistem dan penonton akan dicatat otomatis di sini.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-subtle">
                {displayedLogs.map((log, idx) => {
                  const normalizedLog = {
                    id: log.id || idx,
                    action: log.action_type || log.action || '-',
                    detail: log.detail || log.details || '-',
                    sub_detail: log.sub_detail || '',
                    time: log.time_ago || (log.created_at ? formatTimeAgo(log.created_at) : '-'),
                  };
                  const meta = getActionMeta(normalizedLog.action);

                  return (
                    <div key={normalizedLog.id} className="relative group">
                      {/* Timeline Node */}
                      <div className="absolute -left-6 top-3 w-2.5 h-2.5 rounded-full bg-border-subtle group-hover:bg-accent-cyan border border-bg-card transition-all" />

                      {/* Content Card */}
                      <div className="p-3 rounded-xl bg-bg-surface hover:bg-bg-card-hover border border-border-subtle transition-all">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold font-mono rounded-full border ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {normalizedLog.time}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-medium">
                          {normalizedLog.detail}
                          {normalizedLog.sub_detail && (
                            <span className="text-text-muted font-normal"> — {normalizedLog.sub_detail}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline Pagination */}
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between bg-bg-surface">
            <span className="text-xs text-text-muted">
              Menampilkan {displayedLogs.length} dari {auditLogsTotal} log aktivitas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { const p = Math.max(1, auditLogsPage - 1); setAuditLogsPage(p); fetchAuditLogs(p); }}
                disabled={auditLogsPage <= 1 || auditLogsLoading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-mono text-text-primary px-2">
                {auditLogsPage} / {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => { const p = Math.min(totalPages, auditLogsPage + 1); setAuditLogsPage(p); fetchAuditLogs(p); }}
                disabled={auditLogsPage >= totalPages || auditLogsLoading}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── 5. Broadcasting Confirmation Modal ─────────────────────────────── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-scale-up">
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border
                ${pendingBroadcastVal
                  ? 'bg-status-live/15 border-status-live/30 text-status-live'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-500'}
              `}>
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div className="pr-4">
                <h3 className="text-base font-bold text-text-primary">
                  {pendingBroadcastVal ? 'Aktifkan Sinyal Siaran?' : 'Hentikan Sinyal Siaran?'}
                </h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {pendingBroadcastVal
                    ? 'Status siaran di web publik dan Firebase akan diubah menjadi LIVE ON AIR. Pengunjung akan melihat badge siaran langsung aktif.'
                    : 'Status siaran akan dikembalikan ke STANDBY. Tanda siaran langsung di portal publik akan dinonaktifkan.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmToggleBroadcasting}
                disabled={loadingBroadcasting}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95
                  ${pendingBroadcastVal
                    ? 'bg-status-live hover:bg-status-live/90 text-white shadow-rose-500/20'
                    : 'bg-bg-surface border border-border-subtle hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 text-text-primary'}
                `}
              >
                {loadingBroadcasting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5" />
                    <span>{pendingBroadcastVal ? 'Ya, Mulai Siaran' : 'Ya, Hentikan Siaran'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardPage;
