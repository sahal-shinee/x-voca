import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { getStats, getAuditLogs } from '../../services/dashboardService';
import { getSchedules } from '../../services/scheduleService';
import { useBroadcastingStatus } from '../../hooks/useFirebase';
import { useToast } from '../../components/common/Toast';
import StatCard from '../../components/common/StatCard';
import ActionCard from '../../components/common/ActionCard';
import Toggle from '../../components/common/Toggle';
import {
  BarChart3,
  Calendar,
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
  ListTodo,
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

/** Map action code to badge display */
const getActionBadge = (action) => {
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
    period_reset: { label: 'Reset Periode', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    content_added: { label: 'Konten Ditambah', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    content_updated: { label: 'Konten Diupdate', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    status_changed: { label: 'Status Diubah', bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
    LOGIN: { label: 'Login', bg: 'bg-accent-cyan/15', text: 'text-accent-cyan' },
    LOGOUT: { label: 'Logout', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    BROADCASTING_TOGGLE: { label: 'Broadcasting', bg: 'bg-status-live/15', text: 'text-status-live' },
    COLLAB_REQUEST: { label: 'Collab Request', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    collab_request: { label: 'Collab Request', bg: 'bg-accent-purple/15', text: 'text-accent-purple' },
    todo_created: { label: 'Todo Dibuat', bg: 'bg-accent-gold/15', text: 'text-accent-gold' },
    todo_completed: { label: 'Todo Selesai', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  };

  const found = map[actionType] || map[actionType.toUpperCase()] || map[actionType.toLowerCase()];
  return found || { label: actionType || '-', bg: 'bg-bg-surface', text: 'text-text-secondary' };
};

/** Filter options for audit log */
const LOG_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: '24h', label: '24 Jam Terakhir' },
  { value: 'week', label: 'Minggu Ini' },
];

function UpcomingStreamSkeleton() {
  return (
    <div className="bg-bg-surface/80 rounded-xl p-3.5 border border-border-subtle">
      <div className="h-4 w-3/4 bg-bg-card rounded animate-pulse mb-2" />
      <div className="h-3 w-1/2 bg-bg-card rounded animate-pulse" />
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
        toast.success('Status siaran berhasil diaktifkan: LIVE ON AIR!');
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

  // ── Fetch stats ────────────────────────────────────────────────────────────
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
      fetchAuditLogs(1);
      fetchUpcomingStreams();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchUserData, fetchStats, fetchAuditLogs, fetchUpcomingStreams]);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── 1. Welcome & Broadcasting Hero Section ─────────────────────────── */}
      <div className="relative rounded-2xl border border-border-subtle bg-bg-card/90 backdrop-blur-md p-5 sm:p-6 overflow-hidden shadow-lg">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan via-accent-purple to-transparent" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Avatar + Creator Greeting */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center border border-accent-cyan/30 flex-shrink-0 shadow-inner">
              <span className="text-2xl font-bold font-mono text-accent-cyan">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-xs font-mono text-accent-cyan font-bold tracking-wider uppercase">
                  Panel Kreator Xion Regalia
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Selamat datang, <span className="text-accent-cyan">{userName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                <span>{formattedDate}</span>
                <span className="font-mono text-text-primary font-medium">{formattedTime} WIB</span>
              </p>
            </div>
          </div>

          {/* Right: Modern Broadcasting Status Card */}
          <div className={`
            flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border backdrop-blur-md transition-all duration-300 self-stretch lg:self-auto
            ${isLiveState
              ? 'bg-status-live/10 border-status-live/30 shadow-[0_0_24px_rgba(244,63,94,0.15)]'
              : 'bg-bg-surface/90 border-border-subtle hover:border-border-active'}
          `}>
            <div className="flex items-center gap-3.5">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative flex-shrink-0
                ${isLiveState ? 'bg-status-live/20 border border-status-live/40 text-status-live' : 'bg-bg-card border border-border-subtle text-text-muted'}
              `}>
                <Radio className={`w-5 h-5 ${isLiveState ? 'animate-pulse' : ''}`} />
                {isLiveState && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-status-live" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-semibold">
                    Status Siaran
                  </span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border
                    ${isLiveState
                      ? 'bg-status-live/20 text-status-live border-status-live/30 animate-pulse'
                      : 'bg-bg-card text-text-muted border-border-subtle'}
                  `}>
                    {isLiveState ? 'LIVE ON AIR' : 'STANDBY (OFFLINE)'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 max-w-xs truncate">
                  {isLiveState
                    ? (stats.activeBroadcast?.title
                        ? `Tayang: ${stats.activeBroadcast.title}`
                        : 'Sinyal streaming aktif di portal publik')
                    : 'Siaran nonaktif. Menampilkan jadwal berikutnya.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isLiveState && stats.activeBroadcast?.youtube_url && (
                <a
                  href={stats.activeBroadcast.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-status-live/15 hover:bg-status-live/25 text-status-live border border-status-live/30 transition-colors"
                  title="Tonton di YouTube"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Stream</span>
                </a>
              )}

              <Toggle
                checked={isLiveState}
                onChange={requestToggleBroadcasting}
                disabled={loadingBroadcasting}
                aria-label="Toggle Broadcasting"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Action Alert Strip (Only rendered when there are pending actions) ── */}
      {hasPendingItems && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-bg-card/90 border border-amber-500/30 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-purple/15 hover:bg-accent-purple/25 border border-accent-purple/30 rounded-xl text-xs font-semibold text-accent-purple transition-all"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 rounded-xl text-xs font-semibold text-accent-cyan transition-all"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-400 transition-all"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.urgentTodos} Todo Urgent</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3. High-Contrast Interactive Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Suara Komunitas"
          value={stats.totalVotes}
          trend={
            stats.totalVotes === 0
              ? { label: 'Periode Baru', neutral: true }
              : { value: stats.votesGrowth }
          }
          subtitle={stats.activePeriod ? `Periode aktif: ${stats.activePeriod}` : 'Voting pilihan game'}
          loading={statsLoading}
          variant="highlight"
          onClick={() => navigate('/admin/voting')}
        />
        <StatCard
          icon={Calendar}
          label="Jadwal Siaran"
          value={String(stats.upcomingSchedules).padStart(2, '0')}
          subtitle="Sesi streaming 7 hari ke depan"
          loading={statsLoading}
          variant="purple"
          onClick={() => navigate('/admin/schedules')}
        />
        <StatCard
          icon={CheckSquare}
          label="Tugas & Catatan"
          value={String(stats.pendingTodos).padStart(2, '0')}
          subtitle={stats.urgentTodos > 0 ? `${stats.urgentTodos} prioritas mendesak` : 'Semua prioritas aman'}
          loading={statsLoading}
          variant="gold"
          onClick={() => navigate('/admin/todos')}
        />
        <StatCard
          icon={PlayCircle}
          label="Katalog Konten"
          value={stats.activeContent}
          subtitle="Panduan & arsip siaran publik"
          loading={statsLoading}
          variant="default"
          onClick={() => navigate('/admin/content')}
        />
      </div>

      {/* ── 4. Community Spotlight: Top Voted Game ───────────────────────────── */}
      {stats.topVotedGame && (
        <div className="relative rounded-2xl border border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 via-bg-card to-bg-card p-4 sm:p-5 overflow-hidden shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center text-accent-gold flex-shrink-0 shadow-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono text-accent-gold font-bold uppercase tracking-wider">
                    Game Teratas Pilihan Komunitas
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                    TOP VOTE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {stats.topVotedGame.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Memperoleh <span className="text-accent-gold font-semibold font-mono">{stats.topVotedGame.vote_count} suara</span> ({stats.topVotedGame.percentage}% dari total suara pemilih aktif)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/admin/schedules?action=create&game=${encodeURIComponent(stats.topVotedGame.title)}`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold/40 text-accent-gold rounded-xl font-semibold text-xs transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Jadwalkan Stream Game Ini</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Quick Actions ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">Pintasan Manajemen</h2>
            <p className="text-xs text-text-muted">Akses cepat ke modul operasional harian</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <ActionCard
            icon={Plus}
            title="Tambah Jadwal"
            description="Buat dan jadwalkan sesi live baru"
            accentColor="purple"
            onClick={() => navigate('/admin/schedules?action=create')}
          />
          <ActionCard
            icon={Gamepad2}
            title="Moderasi Suara"
            description="Tinjau usulan judul game pemilih"
            accentColor="cyan"
            badge={stats.pendingGames > 0 ? stats.pendingGames : null}
            onClick={() => navigate('/admin/voting')}
          />
          <ActionCard
            icon={BookOpen}
            title="Tambah Konten"
            description="Publikasi arsip dan panduan tontonan"
            accentColor="gold"
            onClick={() => navigate('/admin/content?action=create')}
          />
          <ActionCard
            icon={Users}
            title="Collab Requests"
            description="Kelola permohonan streaming gabungan"
            accentColor="purple"
            badge={stats.pendingCollabs > 0 ? stats.pendingCollabs : null}
            onClick={() => navigate('/admin/collab-requests')}
          />
          <ActionCard
            icon={ListTodo}
            title="Tugas Baru"
            description="Catat rencana tugas operasional"
            accentColor="emerald"
            badge={stats.urgentTodos > 0 ? 'Urgent' : null}
            onClick={() => navigate('/admin/todos')}
          />
        </div>
      </div>

      {/* ── 6. Upcoming Streams + Activity Log ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── 6.1 Upcoming Streams ────────────────────────────────────────────── */}
        <div className="bg-bg-card/90 rounded-2xl border border-border-subtle overflow-hidden flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Upcoming Streams</h3>
                <p className="text-xs text-text-muted">Jadwal siaran berikutnya</p>
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

          {/* List */}
          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-center">
            {upcomingLoading ? (
              <div className="space-y-2.5">
                <UpcomingStreamSkeleton />
                <UpcomingStreamSkeleton />
                <UpcomingStreamSkeleton />
              </div>
            ) : upcomingStreams.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center text-text-muted mb-3">
                  <Calendar className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Belum ada jadwal upcoming</p>
                <p className="text-xs text-text-muted mt-1 max-w-xs mb-4">
                  Jadwalkan sesi live stream berikutnya agar muncul di portal penonton.
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
              upcomingStreams.map((stream, idx) => (
                <button
                  type="button"
                  key={stream.id}
                  onClick={() => navigate('/admin/schedules')}
                  className="w-full text-left bg-bg-surface/80 rounded-xl p-3 border border-border-subtle hover:border-accent-purple/40 hover:bg-bg-surface transition-all duration-150 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-mono font-bold text-accent-purple">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-accent-purple transition-colors">
                        {stream.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-muted" />
                          {formatScheduleDate(stream.scheduled_at)}
                          {stream.scheduled_at && (
                            <span className="font-mono text-text-primary"> {formatScheduleTime(stream.scheduled_at)}</span>
                          )}
                        </span>
                        {stream.game_category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-bg-card border border-border-subtle text-text-muted">
                            {stream.game_category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── 6.2 Activity Log (Audit Log) ─────────────────────────────────── */}
        <div className="lg:col-span-2 bg-bg-card/90 rounded-2xl border border-border-subtle overflow-hidden flex flex-col shadow-sm">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-bg-surface/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Aktivitas Terkini</h3>
                <p className="text-xs text-text-muted">Log interaksi dan perubahan data sistem</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {/* Filter dropdown */}
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

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface/50 border-b border-border-subtle/60">
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">Waktu</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">Aksi</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">Detail Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {auditLogsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3.5"><div className="h-4 w-20 bg-bg-surface rounded animate-pulse" /></td>
                      <td className="px-5 py-3.5"><div className="h-5 w-24 bg-bg-surface rounded animate-pulse" /></td>
                      <td className="px-5 py-3.5"><div className="h-4 w-40 bg-bg-surface rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : displayedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-text-muted opacity-40" />
                        <p className="text-sm font-semibold text-text-primary">Tidak ada aktivitas pada rentang ini</p>
                        <p className="text-xs text-text-muted">Aktivitas sistem akan dicatat otomatis secara real-time.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedLogs.map((log, idx) => {
                    const normalizedLog = {
                      id: log.id || idx,
                      action: log.action_type || log.action || '-',
                      detail: log.detail || log.details || '-',
                      sub_detail: log.sub_detail || '',
                      time: log.time_ago || (log.created_at ? formatTimeAgo(log.created_at) : '-'),
                    };
                    const badge = getActionBadge(normalizedLog.action);

                    return (
                      <tr key={normalizedLog.id} className="hover:bg-bg-surface/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-text-secondary flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                            {normalizedLog.time}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-medium rounded-md whitespace-nowrap border border-border-subtle/40 ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs sm:text-sm text-text-primary">
                            {normalizedLog.detail}
                            {normalizedLog.sub_detail && (
                              <span className="text-text-muted font-normal"> - {normalizedLog.sub_detail}</span>
                            )}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between bg-bg-surface/20">
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

      {/* ── 7. Broadcasting Confirmation Modal ─────────────────────────────── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
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
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'}
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
                  inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95
                  ${pendingBroadcastVal
                    ? 'bg-status-live hover:bg-status-live/90 text-white shadow-rose-500/20'
                    : 'bg-bg-surface border border-border-subtle hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 text-text-primary'}
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
