import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { getStats, getAuditLogs } from '../../services/dashboardService';
import { useBroadcastingStatus } from '../../hooks/useFirebase';

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
    'VOTE_MASUK': { label: 'Vote Masuk', bg: 'bg-accent-cyan/20', text: 'text-accent-cyan', border: 'border-accent-cyan/30' },
    'JADWAL_UPDATE': { label: 'Jadwal Diupdate', bg: 'bg-accent-purple/20', text: 'text-accent-purple', border: 'border-accent-purple/30' },
    'REQUEST_GAME': { label: 'Request Game', bg: 'bg-accent-gold/20', text: 'text-accent-gold', border: 'border-accent-gold/30' },
    'CONTENT_ARCHIVE': { label: 'Aset Diarsip', bg: 'bg-text-muted/20', text: 'text-text-secondary', border: 'border-border-subtle' },
    'LOGIN': { label: 'Login', bg: 'bg-accent-cyan/20', text: 'text-accent-cyan', border: 'border-accent-cyan/30' },
    'LOGOUT': { label: 'Logout', bg: 'bg-text-muted/20', text: 'text-text-secondary', border: 'border-border-subtle' },
    'BROADCASTING_TOGGLE': { label: 'Broadcasting', bg: 'bg-status-live/20', text: 'text-status-live', border: 'border-status-live/30' },
  };
  return actionMap[action] || { label: action, bg: 'bg-text-muted/20', text: 'text-text-secondary', border: 'border-border-subtle' };
};

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Firebase real-time broadcasting status
  const { isLive: fbIsLive, isReady: fbIsReady, loading: fbBroadcastingLoading } = useBroadcastingStatus();

  // State untuk greeting dan broadcasting
  const [userName, setUserName] = useState('Xion');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loadingBroadcasting, setLoadingBroadcasting] = useState(false);

  // Sync broadcasting state with Firebase
  useEffect(() => {
    if (!loadingBroadcasting) { // Don't override if user is toggling
      setIsBroadcasting(fbIsLive || fbIsReady);
    }
  }, [fbIsLive, fbIsReady, loadingBroadcasting]);

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
        // Only set from API if Firebase hasn't loaded yet
        if (fbIsLive === undefined && fbIsReady === undefined) {
          setIsBroadcasting(response.data.data.isBroadcasting || false);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingBroadcasting(false);
    }
  }, [fbIsLive, fbIsReady]);

  // Toggle broadcasting
  const handleToggleBroadcasting = async (newValue) => {
    setLoadingBroadcasting(true);
    try {
      await authAPI.toggleBroadcasting(newValue);
      setIsBroadcasting(newValue);
    } catch (error) {
      console.error('Error toggling broadcasting:', error);
      // Revert state on error
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
      // Set default values on error
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
      // Set mock data on error
      setAuditLogs([
        { id: 1, action: 'VOTE_MASUK', details: 'New vote from Viewer #4021', time: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { id: 2, action: 'JADWAL_UPDATE', details: 'Updated schedule: Elden Ring Rush', time: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 3, action: 'REQUEST_GAME', details: 'New game request: Signalis', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 4, action: 'CONTENT_ARCHIVE', details: 'Archived: Minecraft Episode 42', time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 5, action: 'BROADCASTING_TOGGLE', details: 'Broadcasting status changed to READY', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ]);
      setAuditLogsTotal(142);
      setAuditLogsPage(page);
    } finally {
      setAuditLogsLoading(false);
    }
  }, [auditLogsLimit]);

  // Initialize data
  useEffect(() => {
    // Set current date
    setCurrentDate(new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }) + ' UTC+07:00');

    fetchUserData();
    fetchStats();
    fetchAuditLogs(1);
  }, [fetchUserData, fetchStats, fetchAuditLogs]);

  // Handle refresh audit logs
  const handleRefreshAuditLogs = () => {
    fetchAuditLogs(auditLogsPage);
  };

  // Pagination handlers
  const totalPages = Math.ceil(auditLogsTotal / auditLogsLimit);
  const handlePrevPage = () => {
    if (auditLogsPage > 1) {
      fetchAuditLogs(auditLogsPage - 1);
    }
  };
  const handleNextPage = () => {
    if (auditLogsPage < totalPages) {
      fetchAuditLogs(auditLogsPage + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== GREETING + BROADCASTING TOGGLE ========== */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-accent-cyan">
              | TELEMETRY NODE 01 · Engine 4.19 Synced
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Selamat datang, {userName}
          </h1>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
            <span>📅</span>
            {currentDate}
          </p>
        </div>

        {/* Broadcasting Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border border-border-subtle rounded-lg">
          <div className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-status-live animate-pulse' : 'bg-text-muted'}`}></div>
          <span className={`text-sm font-medium ${isBroadcasting ? 'text-status-live' : 'text-text-secondary'}`}>
            BROADCASTING {isBroadcasting ? 'READY' : 'OFFLINE'}
          </span>
          <button
            onClick={() => handleToggleBroadcasting(!isBroadcasting)}
            disabled={loadingBroadcasting}
            className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${isBroadcasting ? 'bg-accent-cyan' : 'bg-bg-input border border-border-subtle'}
              ${loadingBroadcasting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                ${isBroadcasting ? 'translate-x-7' : 'translate-x-1'}
              `}
            ></span>
          </button>
        </div>
      </div>

      {/* ========== 4 STAT CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Vote */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-active transition-colors">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xl">📊</span>
            <span className="text-xs font-mono text-status-done bg-status-done/10 px-2 py-1 rounded">
              ↑ {stats.votesGrowth || 12}% vs 30 hari lalu
            </span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-20 bg-bg-input rounded animate-shimmer"></div>
          ) : (
            <p className="text-3xl font-bold font-mono text-accent-cyan">
              {stats.totalVotes.toLocaleString()}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">Total Vote Bulan Ini</p>
        </div>

        {/* Card 2: Jadwal Upcoming */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-active transition-colors">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xl">📅</span>
            <span className="text-xs font-mono text-accent-purple bg-accent-purple/10 px-2 py-1 rounded">
              Slot Terisi
            </span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-12 bg-bg-input rounded animate-shimmer"></div>
          ) : (
            <p className="text-3xl font-bold font-mono text-accent-purple">
              {String(stats.upcomingSchedules).padStart(2, '0')}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">Jadwal Upcoming</p>
          <p className="text-xs text-text-muted mt-1">Stream terverifikasi</p>
        </div>

        {/* Card 3: Tugas Pending */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-active transition-colors">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xl">✅</span>
            {stats.urgentTodos > 0 && (
              <span className="text-xs font-mono text-status-live bg-status-live/10 px-2 py-1 rounded">
                {stats.urgentTodos} Critical
              </span>
            )}
          </div>
          {statsLoading ? (
            <div className="h-8 w-12 bg-bg-input rounded animate-shimmer"></div>
          ) : (
            <p className="text-3xl font-bold font-mono text-accent-gold">
              {String(stats.pendingTodos).padStart(2, '0')}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">Tugas Pending</p>
          <p className="text-xs text-text-muted mt-1">
            Prioritas urgent: {stats.urgentTodos} Critical
          </p>
        </div>

        {/* Card 4: Content Aktif */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5 hover:border-border-active transition-colors">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xl">📺</span>
            <span className="text-xs font-mono text-status-done bg-status-done/10 px-2 py-1 rounded">
              100% VISIBLE
            </span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-12 bg-bg-input rounded animate-shimmer"></div>
          ) : (
            <p className="text-3xl font-bold font-mono text-text-primary">
              {stats.activeContent}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">Content Aktif</p>
        </div>
      </div>

      {/* ========== 3 ACTION CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action Card: Tambah Jadwal */}
        <button
          onClick={() => navigate('/admin/schedules')}
          className="bg-bg-input border border-border-subtle rounded-xl p-5 text-left hover:bg-bg-card-hover hover:border-accent-cyan/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">+ Tambah Jadwal</p>
              <p className="text-xs text-text-muted mt-0.5">Sinkronisasi sesi siaran baru</p>
            </div>
            <span className="text-accent-cyan group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Action Card: Lihat Voting */}
        <button
          onClick={() => navigate('/admin/voting')}
          className="bg-bg-card border border-border-subtle rounded-xl p-5 text-left hover:bg-bg-card-hover hover:border-accent-cyan/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
              <span className="text-2xl">🗳️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Lihat Voting</p>
              <p className="text-xs text-text-muted mt-0.5">Moderasi game pilihan pemirsa</p>
            </div>
            <span className="text-accent-cyan group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Action Card: Tambah Content */}
        <button
          onClick={() => navigate('/admin/content')}
          className="bg-bg-input border border-border-subtle rounded-xl p-5 text-left hover:bg-bg-card-hover hover:border-accent-gold/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent-gold/20 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">+ Tambah Content</p>
              <p className="text-xs text-text-muted mt-0.5">Kurasi arsip dan playlist baru</p>
            </div>
            <span className="text-accent-gold group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>

      {/* ========== AUDIT LOG + RIG WIDGET ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== AUDIT LOG ========== */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-text-muted">| AUDIT LOG</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Aktivitas Terkini</h3>
                <p className="text-xs text-text-muted mt-0.5">Log interaksi dan perubahan data operasional stasiun siaran</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors">
                  ⊟ Filter
                </button>
                <button
                  onClick={handleRefreshAuditLogs}
                  disabled={auditLogsLoading}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-50"
                >
                  ↺ Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-input">
                    <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">WAKTU</th>
                    <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">AKSI</th>
                    <th className="px-5 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">DETAIL</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle">
                        <td className="px-5 py-4"><div className="h-4 w-20 bg-bg-input rounded animate-shimmer"></div></td>
                        <td className="px-5 py-4"><div className="h-6 w-24 bg-bg-input rounded-full animate-shimmer"></div></td>
                        <td className="px-5 py-4"><div className="h-4 w-40 bg-bg-input rounded animate-shimmer"></div></td>
                      </tr>
                    ))
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-text-muted text-sm">
                        Tidak ada aktivitas terkini
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const badge = getActionBadge(log.action);
                      return (
                        <tr key={log.id} className="border-b border-border-subtle hover:bg-bg-input/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted">🕐</span>
                              <span className="text-sm text-text-secondary">
                                {formatTimeAgo(log.time)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
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
            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Menampilkan {Math.min(auditLogsLimit, auditLogs.length)} dari {auditLogsTotal} entri log
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={auditLogsPage <= 1}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-xs font-mono text-text-primary px-3">
                  {auditLogsPage}/{totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={auditLogsPage >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========== RIG CALIBRATION WIDGET ========== */}
        <div className="space-y-4">
          {/* Rig Card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">RIG CALIBRATION</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-done"></span>
              </div>
            </div>

            {/* Rig Image & Info */}
            <div className="p-4">
              <div className="relative bg-bg-input rounded-lg h-32 flex items-center justify-center mb-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10"></div>
                <div className="text-center z-10">
                  <span className="text-4xl">🎮</span>
                  <p className="text-xs text-text-muted mt-2">Virtual Rig Preview</p>
                </div>
                {/* Badges overlay */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <span className="text-[10px] font-mono bg-bg-base/80 text-accent-cyan px-2 py-0.5 rounded">
                    Xion_Rig_v3.4
                  </span>
                  <span className="text-[10px] font-mono bg-status-done/20 text-status-done px-2 py-0.5 rounded">
                    60 FPS
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-muted text-center mb-4">
                ARKit 52 Blendshapes · Active
              </p>

              {/* Metrics */}
              <div className="space-y-3">
                {/* Audio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">Audio Dynamic Range</span>
                    <span className="text-xs font-mono text-accent-cyan">-14.2 LUFS</span>
                  </div>
                  <div className="h-1.5 bg-bg-input rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Tracking */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">Tracking Latency</span>
                    <span className="text-xs font-mono text-text-primary">12.4 ms</span>
                  </div>
                  <div className="h-1.5 bg-bg-input rounded-full overflow-hidden">
                    <div className="h-full bg-accent-purple rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                {/* VRAM */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">VRAM Allocation</span>
                    <span className="text-xs font-mono text-text-primary">4.8 / 12 GB</span>
                  </div>
                  <div className="h-1.5 bg-bg-input rounded-full overflow-hidden">
                    <div className="h-full bg-accent-gold rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-text-primary bg-bg-input border border-border-subtle rounded-lg hover:bg-bg-card-hover transition-colors flex items-center justify-center gap-2">
                Reset Tracking
                <span>⚙</span>
              </button>
            </div>
          </div>

          {/* Poll Live Monitor */}
          <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle">
              <span className="text-xs font-mono text-text-muted">POLL LIVE MONITOR · Vote Velocity / Jam</span>
            </div>

            {/* Chart */}
            <div className="p-4">
              <svg className="w-full h-24" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="30" x2="200" y2="30" stroke="#2A2645" strokeWidth="0.5" strokeDasharray="2" />

                {/* Chart line */}
                <path
                  d="M0,50 Q20,45 40,35 T80,40 T120,20 T160,25 T200,15"
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Area fill */}
                <path
                  d="M0,50 Q20,45 40,35 T80,40 T120,20 T160,25 T200,15 L200,60 L0,60 Z"
                  fill="url(#areaGradient)"
                  opacity="0.3"
                />

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9B6DFF" />
                    <stop offset="100%" stopColor="#2DFFC2" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2DFFC2" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2DFFC2" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  ● Puncak: 21:00 (148 votes/h)
                </span>
                <span className="text-xs font-mono text-accent-cyan">
                  +24.8% spike
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
