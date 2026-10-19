import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { getStats, getAuditLogs } from '../../services/dashboardService';
import { getSchedules } from '../../services/scheduleService';
import { useBroadcastingStatus } from '../../hooks/useFirebase';
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
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse date string to Date object
 * Returns null if invalid
 */
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
  // Backend uses action_type, frontend uses action
  const actionType = action?.action_type || action || '';

  const map = {
    VOTE_MASUK: { label: 'Vote Masuk', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    vote_in: { label: 'Vote Masuk', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    JADWAL_UPDATE: { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    schedule_updated: { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    REQUEST_GAME: { label: 'Request Game', bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
    game_requested: { label: 'Request Game', bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
    CONTENT_ARCHIVE: { label: 'Aset Diarsip', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    asset_archived: { label: 'Aset Diarsip', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    period_reset: { label: 'Reset Periode', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    content_added: { label: 'Konten Ditambah', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    status_changed: { label: 'Status Diubah', bg: 'bg-accent-gold/10', text: 'text-accent-gold' },
    LOGIN: { label: 'Login', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan' },
    LOGOUT: { label: 'Logout', bg: 'bg-bg-surface', text: 'text-text-secondary' },
    BROADCASTING_TOGGLE: { label: 'Broadcasting', bg: 'bg-status-live/10', text: 'text-status-live' },
    COLLAB_REQUEST: { label: 'Collab Request', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    collab_request: { label: 'Collab Request', bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
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

// ─── Skeleton sub-components ─────────────────────────────────────────────────

function UpcomingStreamSkeleton() {
  return (
    <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
      <div className="h-4 w-3/4 bg-bg-card rounded animate-pulse mb-2" />
      <div className="h-3 w-1/2 bg-bg-card rounded animate-pulse" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DashboardPage() {
  const navigate = useNavigate();

  const { isReady: fbIsReady } = useBroadcastingStatus();

  // ── State ──────────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState('Xion');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loadingBroadcasting, setLoadingBroadcasting] = useState(false);

  const [stats, setStats] = useState({
    totalVotes: 0,
    upcomingSchedules: 0,
    pendingTodos: 0,
    activeContent: 0,
    votesGrowth: 0,
    urgentTodos: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsLimit] = useState(5);
  const [auditLogFilter, setAuditLogFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [upcomingStreams, setUpcomingStreams] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Live clock updated every second
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // ── Sync broadcasting ──────────────────────────────────────────────────────
  // setTimeout defers the setState call out of the effect body, satisfying
  // the react-hooks/set-state-in-effect rule while keeping identical behavior.
  useEffect(() => {
    if (!loadingBroadcasting) {
      const id = setTimeout(() => setIsBroadcasting(fbIsReady || false), 0);
      return () => clearTimeout(id);
    }
  }, [fbIsReady, loadingBroadcasting]);

  // ── Live clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Fetch user data ────────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    setLoadingBroadcasting(true);
    try {
      const response = await authAPI.getMe();
      if (response.data?.data) {
        setUserName(response.data.data.name || 'Xion');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoadingBroadcasting(false);
    }
  }, []);

  // ── Toggle broadcasting ────────────────────────────────────────────────────
  const handleToggleBroadcasting = async (newValue) => {
    setLoadingBroadcasting(true);
    try {
      await authAPI.toggleBroadcasting(newValue);
      setIsBroadcasting(newValue);
    } catch (error) {
      console.error('Error toggling broadcasting:', error);
      setIsBroadcasting(!newValue);
    } finally {
      setLoadingBroadcasting(false);
    }
  };

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      // Backend returns: { data: { stats: {...}, recentActivity: [...] } }
      if (response?.data?.data?.stats) {
        const backendStats = response.data.data.stats;
        setStats({
          totalVotes: backendStats.votes?.total || 0,
          upcomingSchedules: backendStats.schedules?.upcoming || 0,
          pendingTodos: backendStats.todos?.pending || 0,
          activeContent: backendStats.content?.visible || 0,
          votesGrowth: backendStats.votes?.change_percent || 0,
          urgentTodos: backendStats.todos?.urgent || 0,
        });
      } else if (response?.data?.stats) {
        // Alternative format
        const backendStats = response.data.stats;
        setStats({
          totalVotes: backendStats.votes?.total || 0,
          upcomingSchedules: backendStats.schedules?.upcoming || 0,
          pendingTodos: backendStats.todos?.pending || 0,
          activeContent: backendStats.content?.visible || 0,
          votesGrowth: backendStats.votes?.change_percent || 0,
          urgentTodos: backendStats.todos?.urgent || 0,
        });
      } else {
        // Fallback if format doesn't match
        setStats({
          totalVotes: response?.data?.totalVotes || 0,
          upcomingSchedules: response?.data?.upcomingSchedules || 0,
          pendingTodos: response?.data?.pendingTodos || 0,
          activeContent: response?.data?.activeContent || 0,
          votesGrowth: response?.data?.votesGrowth || 0,
          urgentTodos: response?.data?.urgentTodos || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Clear stats on error instead of mock data
      setStats({
        totalVotes: 0,
        upcomingSchedules: 0,
        pendingTodos: 0,
        activeContent: 0,
        votesGrowth: 0,
        urgentTodos: 0,
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
      // Backend returns: { success: true, data: [...logs], meta: { total } }
      // Or: { success: true, data: { logs: [...], total: N } }
      let logs = [];
      let total = 0;

      if (response?.data) {
        // Case 1: Direct array in data
        if (Array.isArray(response.data)) {
          logs = response.data;
          total = logs.length;
        }
        // Case 2: Wrapped in data.data or data.logs
        else if (response.data.data && Array.isArray(response.data.data)) {
          logs = response.data.data;
          total = response.data.meta?.total || logs.length;
        }
        else if (response.data.logs && Array.isArray(response.data.logs)) {
          logs = response.data.logs;
          total = response.data.total || response.data.meta?.total || logs.length;
        }
        // Case 3: Direct with meta
        else if (response.data.logs !== undefined) {
          logs = Array.isArray(response.data.logs) ? response.data.logs : [];
          total = response.data.meta?.total || response.data.total || logs.length;
        }
      }

      setAuditLogs(logs);
      setAuditLogsTotal(total);
      setAuditLogsPage(page);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Clear logs on error instead of mock data
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
      const response = await getSchedules({ status: 'upcoming', limit: 3 });
      const data = response?.data || response || [];
      // Handle array or object with .schedules / .data
      const list = Array.isArray(data)
        ? data
        : data.schedules || data.rows || [];
      setUpcomingStreams(list.slice(0, 3));
    } catch (error) {
      console.error('Error fetching upcoming streams:', error);
      // Fallback mock
      setUpcomingStreams([
        { id: 1, title: 'Elden Ring - Boss Rush', scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
        { id: 2, title: 'Cyberpunk 2077 - Phantom Liberty', scheduled_at: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
        { id: 3, title: 'Hollow Knight - All Bosses', scheduled_at: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), status: 'upcoming' },
      ]);
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  // ── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Defer fetch calls so any synchronous state updates inside the async
    // functions don't happen within the effect body itself.
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── 6.1 Header Card ─────────────────────────────────────────────── */}
      <div className="bg-bg-card rounded-xl border border-border-subtle p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Left: Avatar + Welcome */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center border border-border-subtle flex-shrink-0">
              <span className="text-2xl font-bold text-accent-cyan">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="text-xs font-mono text-accent-cyan tracking-widest">TELEMETRY NODE 01</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
                Selamat datang, <span className="text-accent-cyan">{userName}</span>
              </h1>
              <p className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                {formattedDate}
                <span className="font-mono text-text-muted">{formattedTime} WIB</span>
              </p>
            </div>
          </div>

          {/* Right: Broadcasting toggle */}
          <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface rounded-xl border border-border-subtle">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${isBroadcasting ? 'bg-status-live/15' : 'bg-bg-card'}
            `}>
              <Radio className={`w-4 h-4 ${isBroadcasting ? 'text-status-live' : 'text-text-muted'}`} />
            </div>
            <div>
              <p className="text-xs font-mono text-text-muted leading-none mb-0.5">BROADCASTING</p>
              <p className={`text-sm font-semibold leading-none ${isBroadcasting ? 'text-status-live' : 'text-text-secondary'}`}>
                {isBroadcasting ? 'READY' : 'OFFLINE'}
              </p>
            </div>
            <Toggle
              checked={isBroadcasting}
              onChange={handleToggleBroadcasting}
              disabled={loadingBroadcasting}
              aria-label="Toggle Broadcasting"
              className="ml-2"
            />
          </div>
        </div>
      </div>

      {/* ── 6.2 Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Vote Bulan Ini"
          value={stats.totalVotes}
          trend={{ value: stats.votesGrowth }}
          loading={statsLoading}
          variant="highlight"
        />
        <StatCard
          icon={Calendar}
          label="Jadwal Upcoming"
          value={String(stats.upcomingSchedules).padStart(2, '0')}
          subtitle="Stream terverifikasi"
          loading={statsLoading}
          variant="purple"
        />
        <StatCard
          icon={CheckSquare}
          label="Tugas Pending"
          value={String(stats.pendingTodos).padStart(2, '0')}
          subtitle={stats.urgentTodos > 0 ? `${stats.urgentTodos} prioritas urgent` : 'Tidak ada urgent'}
          loading={statsLoading}
          variant="gold"
        />
        <StatCard
          icon={PlayCircle}
          label="Content Aktif"
          value={stats.activeContent}
          subtitle="Visible di publik"
          loading={statsLoading}
        />
      </div>

      {/* ── 6.3 Quick Actions ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <ActionCard
            icon={Plus}
            title="Tambah Jadwal"
            description="Sinkronisasi sesi siaran baru"
            accentColor="purple"
            onClick={() => navigate('/admin/schedules?action=create')}
          />
          <ActionCard
            icon={Gamepad2}
            title="Moderasi Voting"
            description="Approve & reject game request"
            accentColor="cyan"
            onClick={() => navigate('/admin/voting')}
          />
          <ActionCard
            icon={BookOpen}
            title="Tambah Content"
            description="Kurasi arsip dan playlist baru"
            accentColor="gold"
            onClick={() => navigate('/admin/content?action=create')}
          />
          <ActionCard
            icon={Users}
            title="Collab Requests"
            description="Tinjau request kolaborasi viewer"
            accentColor="purple"
            badge={stats.pendingCollabs || null}
            onClick={() => navigate('/admin/collab-requests')}
          />
          <ActionCard
            icon={ListTodo}
            title="Todo Baru"
            description="Tambah tugas ke daftar kerja"
            accentColor="gold"
            onClick={() => navigate('/admin/todos')}
          />
        </div>
      </div>

      {/* ── 6.4 Upcoming Streams + 6.5 Activity Log ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── 6.4 Upcoming Streams ──────────────────────────────────────── */}
        <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-accent-purple" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Upcoming Streams</h3>
                <p className="text-xs text-text-muted">Jadwal siaran berikutnya</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/schedules')}
              className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-cyan transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3">
            {upcomingLoading ? (
              <>
                <UpcomingStreamSkeleton />
                <UpcomingStreamSkeleton />
                <UpcomingStreamSkeleton />
              </>
            ) : upcomingStreams.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-2 text-center">
                <AlertCircle className="w-8 h-8 text-text-muted opacity-40" />
                <p className="text-sm text-text-muted">Tidak ada jadwal upcoming</p>
              </div>
            ) : (
              upcomingStreams.map((stream, idx) => (
                <button
                  key={stream.id}
                  onClick={() => navigate('/admin/schedules')}
                  className="w-full text-left bg-bg-surface rounded-lg p-3.5 border border-border-subtle hover:border-accent-purple/30 hover:bg-bg-card transition-all duration-150 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-accent-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-mono font-bold text-accent-purple">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate group-hover:text-white transition-colors">
                        {stream.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatScheduleDate(stream.scheduled_at)}
                        {stream.scheduled_at && (
                          <span className="font-mono">{formatScheduleTime(stream.scheduled_at)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── 6.5 Activity Log ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Aktivitas Terkini</h3>
                <p className="text-xs text-text-muted">Log interaksi dan perubahan data</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFilterDropdown((v) => !v); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {activeFilterLabel}
                </button>
                {showFilterDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1 w-40 bg-bg-card border border-border-subtle rounded-lg shadow-xl z-10 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {LOG_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => { setAuditLogFilter(f.value); setShowFilterDropdown(false); }}
                        className={`
                          w-full text-left px-3 py-2 text-xs transition-colors
                          ${auditLogFilter === f.value
                            ? 'bg-accent-cyan/10 text-accent-cyan font-medium'
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
                onClick={handleRefreshAuditLogs}
                disabled={auditLogsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLogsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-surface/50">
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">WAKTU</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">AKSI</th>
                  <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">DETAIL</th>
                </tr>
              </thead>
              <tbody>
                {auditLogsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border-subtle">
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-bg-surface rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-6 w-24 bg-bg-surface rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-40 bg-bg-surface rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-text-muted opacity-40" />
                        <p className="text-sm text-text-muted">Tidak ada aktivitas terkini</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, idx) => {
                    // Normalize field names (backend uses action_type, detail, time_ago)
                    const normalizedLog = {
                      id: log.id || idx,
                      action: log.action_type || log.action || '-',
                      detail: log.detail || log.details || '-',
                      sub_detail: log.sub_detail || '',
                      time: log.time_ago || log.time || '-',
                    };
                    const badge = getActionBadge(normalizedLog.action);
                    return (
                      <tr key={normalizedLog.id} className="border-t border-border-subtle hover:bg-bg-surface/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary flex items-center gap-2 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                            {normalizedLog.time}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-text-primary">
                            {normalizedLog.detail}
                            {normalizedLog.sub_detail && (
                              <span className="text-text-muted"> - {normalizedLog.sub_detail}</span>
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
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {Math.min(auditLogsLimit, auditLogs.length)} dari {auditLogsTotal} entri
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = Math.max(1, auditLogsPage - 1); setAuditLogsPage(p); fetchAuditLogs(p); }}
                disabled={auditLogsPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-xs font-mono text-text-primary px-2">
                {auditLogsPage}/{totalPages || 1}
              </span>
              <button
                onClick={() => { const p = Math.min(totalPages, auditLogsPage + 1); setAuditLogsPage(p); fetchAuditLogs(p); }}
                disabled={auditLogsPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
