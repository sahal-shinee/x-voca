import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { getStats, getAuditLogs } from '../../services/dashboardService';
import { useBroadcastingStatus } from '../../hooks/useFirebase';
import StatCard from '../../components/common/StatCard';
import ActionCard from '../../components/common/ActionCard';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  PlayCircle,
  Plus,
  Eye,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Radio,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';

// Format waktu relatif (time ago)
const formatTimeAgo = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// Badge warna berdasarkan aksi
const getActionBadge = (action) => {
  const actionMap = {
    'VOTE_MASUK': { label: 'Vote Masuk', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20', icon: TrendingUp },
    'JADWAL_UPDATE': { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/10', text: 'text-accent-purple', border: 'border-accent-purple/20', icon: Calendar },
    'REQUEST_GAME': { label: 'Request Game', bg: 'bg-accent-gold/10', text: 'text-accent-gold', border: 'border-accent-gold/20', icon: Users },
    'CONTENT_ARCHIVE': { label: 'Aset Diarsip', bg: 'bg-text-muted/10', text: 'text-text-secondary', border: 'border-border-subtle', icon: BookOpen },
    'LOGIN': { label: 'Login', bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20', icon: Activity },
    'LOGOUT': { label: 'Logout', bg: 'bg-text-muted/10', text: 'text-text-secondary', border: 'border-border-subtle', icon: Activity },
    'BROADCASTING_TOGGLE': { label: 'Broadcasting', bg: 'bg-status-live/10', text: 'text-status-live', border: 'border-status-live/20', icon: Radio },
  };
  return actionMap[action] || { label: action, bg: 'bg-text-muted/10', text: 'text-text-secondary', border: 'border-border-subtle', icon: Activity };
};

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Firebase real-time data
  const { isReady: fbIsReady, loading: fbBroadcastingLoading } = useBroadcastingStatus();

  // State untuk greeting dan broadcasting
  const [userName, setUserName] = useState('Xion');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loadingBroadcasting, setLoadingBroadcasting] = useState(false);

  // Sync broadcasting state with Firebase
  useEffect(() => {
    if (!loadingBroadcasting) {
      setIsBroadcasting(fbIsReady || false);
    }
  }, [fbIsReady, loadingBroadcasting]);

  // State untuk stats
  const [stats, setStats] = useState({
    totalVotes: 0,
    upcomingSchedules: 0,
    pendingTodos: 0,
    activeContent: 0,
    votesGrowth: 0,
    urgentTodos: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // State untuk audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsLimit] = useState(5);

  // Tanggal saat ini
  const [currentDate, setCurrentDate] = useState('');

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    setLoadingBroadcasting(true);
    try {
      const response = await authAPI.getMe();
      if (response.data?.data) {
        setUserName(response.data.data.name || 'Xion');
        if (fbIsReady === undefined) {
          setIsBroadcasting(response.data.data.isBroadcasting || false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingBroadcasting(false);
    }
  }, [fbIsReady]);

  // Toggle broadcasting
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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      if (response?.data) {
        setStats({
          totalVotes: response.data.totalVotes || 0,
          upcomingSchedules: response.data.upcomingSchedules || 0,
          pendingTodos: response.data.pendingTodos || 0,
          activeContent: response.data.activeContent || 0,
          votesGrowth: response.data.votesGrowth || 0,
          urgentTodos: response.data.urgentTodos || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalVotes: 1247,
        upcomingSchedules: 3,
        pendingTodos: 5,
        activeContent: 18,
        votesGrowth: 12,
        urgentTodos: 2,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async (page = 1) => {
    setAuditLogsLoading(true);
    try {
      const response = await getAuditLogs({ limit: auditLogsLimit, page });
      if (response?.data) {
        setAuditLogs(response.data.logs || response.data || []);
        setAuditLogsTotal(response.data.total || 0);
        setAuditLogsPage(page);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([
        { id: 1, action: 'VOTE_MASUK', details: 'New vote for Elden Ring', time: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { id: 2, action: 'JADWAL_UPDATE', details: 'Schedule updated: Cyberpunk 2077', time: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 3, action: 'REQUEST_GAME', details: 'New request: Signalis', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 4, action: 'CONTENT_ARCHIVE', details: 'Content archived: Minecraft Ep.42', time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 5, action: 'BROADCASTING_TOGGLE', details: 'Broadcasting set to READY', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ]);
      setAuditLogsTotal(42);
      setAuditLogsPage(page);
    } finally {
      setAuditLogsLoading(false);
    }
  }, [auditLogsLimit]);

  // Initialize data
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }));

    fetchUserData();
    fetchStats();
    fetchAuditLogs(1);
  }, [fetchUserData, fetchStats, fetchAuditLogs]);

  // Refresh audit logs
  const handleRefreshAuditLogs = () => {
    fetchAuditLogs(auditLogsPage);
  };

  // Pagination
  const totalPages = Math.ceil(auditLogsTotal / auditLogsLimit);
  const handlePrevPage = () => {
    if (auditLogsPage > 1) fetchAuditLogs(auditLogsPage - 1);
  };
  const handleNextPage = () => {
    if (auditLogsPage < totalPages) fetchAuditLogs(auditLogsPage + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== GREETING + BROADCASTING TOGGLE ========== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-bg-card to-bg-surface rounded-2xl border border-border-subtle">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 items-center justify-center border border-accent-cyan/20">
            <span className="text-2xl font-bold text-accent-cyan">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="text-xs font-mono text-accent-cyan tracking-wider">
                TELEMETRY NODE 01
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-text-muted">
                <Zap className="w-3 h-3" />
                Engine 4.19 Synced
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-display">
              Selamat datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">{userName}</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              {currentDate}
            </p>
          </div>
        </div>

        {/* Broadcasting Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 bg-bg-base/50 rounded-xl border border-border-subtle backdrop-blur-sm">
          <Radio className={`w-4 h-4 ${isBroadcasting ? 'text-status-live' : 'text-text-muted'}`} />
          <div className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-status-live animate-pulse' : 'bg-text-muted'}`} />
          <span className={`text-sm font-medium hidden sm:inline ${isBroadcasting ? 'text-status-live' : 'text-text-secondary'}`}>
            BROADCASTING {isBroadcasting ? 'READY' : 'OFFLINE'}
          </span>
          <button
            onClick={() => handleToggleBroadcasting(!isBroadcasting)}
            disabled={loadingBroadcasting}
            className={`
              relative w-12 h-6 rounded-full transition-all duration-300
              ${isBroadcasting ? 'bg-accent-cyan shadow-lg shadow-accent-cyan/30' : 'bg-bg-input border border-border-subtle'}
              ${loadingBroadcasting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300
                ${isBroadcasting ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* ========== 4 STAT CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Vote Bulan Ini"
          value={stats.totalVotes}
          trend={{ value: stats.votesGrowth, label: 'vs 30 hari lalu' }}
          loading={statsLoading}
          variant="highlight"
        />

        <StatCard
          icon={Calendar}
          label="Jadwal Upcoming"
          value={String(stats.upcomingSchedules).padStart(2, '0')}
          subtitle="Stream terverifikasi"
          loading={statsLoading}
        />

        <StatCard
          icon={CheckSquare}
          label="Tugas Pending"
          value={String(stats.pendingTodos).padStart(2, '0')}
          subtitle={`${stats.urgentTodos} prioritas urgent`}
          loading={statsLoading}
          trend={stats.urgentTodos > 0 ? { value: -stats.urgentTodos, label: 'urgent' } : undefined}
        />

        <StatCard
          icon={PlayCircle}
          label="Content Aktif"
          value={stats.activeContent}
          subtitle="Visible di publik"
          loading={statsLoading}
        />
      </div>

      {/* ========== 3 ACTION CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          icon={Plus}
          title="Tambah Jadwal"
          description="Sinkronisasi sesi siaran baru"
          accentColor="purple"
          onClick={() => navigate('/admin/schedules')}
        />

        <ActionCard
          icon={Eye}
          title="Lihat Voting"
          description="Moderasi game pilihan pemirsa"
          accentColor="cyan"
          onClick={() => navigate('/admin/voting')}
        />

        <ActionCard
          icon={BookOpen}
          title="Tambah Content"
          description="Kurasi arsip dan playlist baru"
          accentColor="gold"
          onClick={() => navigate('/admin/content')}
        />
      </div>

      {/* ========== AUDIT LOG ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-bg-input/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Aktivitas Terkini</h3>
              <p className="text-xs text-text-muted">Log interaksi dan perubahan data operasional</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button
              onClick={handleRefreshAuditLogs}
              disabled={auditLogsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-50"
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
              <tr className="bg-bg-input/50">
                <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">WAKTU</th>
                <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">AKSI</th>
                <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">DETAIL</th>
              </tr>
            </thead>
            <tbody>
              {auditLogsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-28 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-48 bg-bg-input rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Activity className="w-8 h-8 text-text-muted mb-2 opacity-50" />
                      <p className="text-sm text-text-muted">Tidak ada aktivitas terkini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => {
                  const badge = getActionBadge(log.action);
                  const BadgeIcon = badge.icon;

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border-subtle hover:bg-bg-input/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-secondary">
                            {formatTimeAgo(log.time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-text-primary">{log.details}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between bg-bg-input/20">
          <span className="text-xs text-text-muted">
            Menampilkan {Math.min(auditLogsLimit, auditLogs.length)} dari {auditLogsTotal} entri
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={auditLogsPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <div className="flex items-center gap-1 px-3 py-1 bg-bg-input rounded-lg">
              <span className="text-xs font-mono text-text-primary">{auditLogsPage}</span>
              <span className="text-xs text-text-muted">/</span>
              <span className="text-xs font-mono text-text-muted">{totalPages || 1}</span>
            </div>
            <button
              onClick={handleNextPage}
              disabled={auditLogsPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
