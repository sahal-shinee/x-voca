import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../../services/dashboardService';
import { getGames, createGame, updateGameStatus, deleteGame, resetVotingPeriod } from '../../services/gameService';
import { downloadVotingPDF } from '../../utils/pdfExport';
import Modal from '../../components/common/Modal';
import GameCard from '../../components/common/GameCard';
import GameFormPanel from '../../components/admin/GameFormPanel';
import {
  Gamepad2,
  Search,
  RefreshCw,
  Plus,
  Check,
  Play,
  CheckCircle,
  Circle,
  AlertCircle,
  Download,
  Clock,
  Loader2,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Trophy,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',       label: 'SEMUA' },
  { key: 'requested', label: 'REQUESTED' },
  { key: 'accepted',  label: 'ACCEPTED' },
  { key: 'playing',   label: 'PLAYING' },
  { key: 'done',      label: 'DONE' },
];

// Status label configs
const STATUS_META = {
  requested: {
    label: 'Menunggu Review',
    shortLabel: 'Requested',
    color: 'text-status-requested',
    bg: 'bg-status-requested/10',
    border: 'border-status-requested/30',
    bar: 'bg-status-requested',
  },
  accepted: {
    label: 'Diterima',
    shortLabel: 'Accepted',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple/30',
    bar: 'bg-accent-purple',
  },
  playing: {
    label: 'Sedang Dimainkan',
    shortLabel: 'Playing',
    color: 'text-accent-gold',
    bg: 'bg-accent-gold/10',
    border: 'border-accent-gold/30',
    bar: 'bg-accent-gold',
  },
  done: {
    label: 'Selesai',
    shortLabel: 'Done',
    color: 'text-status-done',
    bg: 'bg-status-done/10',
    border: 'border-status-done/30',
    bar: 'bg-status-done',
  },
};

// Format period key like "2026-10" → "Oktober 2026"
const formatPeriodLabel = (periodKey) => {
  if (!periodKey) return '-';
  try {
    const [year, month] = periodKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    return periodKey;
  }
};

// Days remaining in current month
const calcDaysRemaining = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
};

// ─── Vote Leaderboard Chart ────────────────────────────────────────────────────

function VoteLeaderboard({ games, maxVotes, loading }) {
  const top = [...games]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-5 h-4 bg-bg-surface rounded shrink-0" />
            <div className="h-4 flex-1 bg-bg-surface rounded" />
            <div className="w-12 h-4 bg-bg-surface rounded shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (top.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BarChart3 className="w-8 h-8 text-text-muted opacity-30 mb-2" />
        <p className="text-xs text-text-muted">Belum ada data voting</p>
      </div>
    );
  }

  const chartMax = Math.max(maxVotes, 1);

  return (
    <div className="space-y-2.5">
      {top.map((game, index) => {
        const meta = STATUS_META[game.status] || STATUS_META.requested;
        const pct = Math.round(((game.vote_count || 0) / chartMax) * 100);
        const rank = index + 1;

        return (
          <div key={game.id} className="flex items-center gap-3 group">
            {/* Rank */}
            <span className={`text-xs font-mono font-bold w-5 text-right shrink-0 ${
              rank === 1 ? 'text-accent-gold' :
              rank === 2 ? 'text-text-secondary' :
              rank === 3 ? 'text-accent-gold/60' :
              'text-text-muted'
            }`}>
              {rank}
            </span>

            {/* Bar + Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-text-primary truncate pr-2">{game.title}</p>
                <span className={`text-[10px] font-mono font-semibold shrink-0 ${meta.color}`}>
                  {(game.vote_count || 0).toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${meta.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Status badge */}
            <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${meta.bg} ${meta.border} ${meta.color}`}>
              {meta.shortLabel.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary Cards Row ────────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  {
    key: 'requested',
    label: 'Menunggu Review',
    icon: Circle,
    colorCard: 'border-status-requested/30 hover:border-status-requested/50',
    colorIcon: 'bg-status-requested/10 border-status-requested/20',
    colorIconText: 'text-status-requested',
    colorValue: 'text-status-requested',
  },
  {
    key: 'accepted',
    label: 'Diterima',
    icon: Check,
    colorCard: 'border-accent-purple/30 hover:border-accent-purple/50',
    colorIcon: 'bg-accent-purple/10 border-accent-purple/20',
    colorIconText: 'text-accent-purple',
    colorValue: 'text-accent-purple',
  },
  {
    key: 'playing',
    label: 'Sedang Dimainkan',
    icon: Play,
    colorCard: 'border-accent-gold/30 hover:border-accent-gold/50',
    colorIcon: 'bg-accent-gold/10 border-accent-gold/20',
    colorIconText: 'text-accent-gold',
    colorValue: 'text-accent-gold',
  },
  {
    key: 'done',
    label: 'Selesai',
    icon: CheckCircle,
    colorCard: 'border-status-done/30 hover:border-status-done/50',
    colorIcon: 'bg-status-done/10 border-status-done/20',
    colorIconText: 'text-status-done',
    colorValue: 'text-status-done',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

function VotingModerationPage() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentPeriodKey, setCurrentPeriodKey] = useState(new Date().toISOString().slice(0, 7));
  const [totalVotes, setTotalVotes] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [resetModal, setResetModal]   = useState({ open: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, game: null });
  const [actionModal, setActionModal] = useState({ open: false, game: null, action: null });
  const [loadingAction, setLoadingAction] = useState(false);

  // Game Form Panel
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameFormLoading, setGameFormLoading] = useState(false);

  // PDF export
  const [pdfExporting, setPdfExporting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchGames = useCallback(async (status = 'all') => {
    setGamesLoading(true);
    setSelectedIds(new Set());
    try {
      const response = await getGames({ status });
      let rawGames = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          rawGames = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          rawGames = response.data.data;
        }
      }
      const normalized = rawGames.map(game => ({
        id: game.id,
        title: game.title,
        genre: game.genre || game.category || '',
        publisher: game.publisher || '',
        cover_url: game.cover_url || game.coverUrl || '',
        vote_count: game.vote_count || game.voteCount || 0,
        vote_percentage: game.vote_percentage || game.votePercentage || 0,
        status: game.status,
        added_by: game.added_by || game.addedBy || 'creator',
        requester_info: game.requester_info || game.requesterInfo || '',
        period_key: game.period_key || game.periodKey || currentPeriodKey,
        isOfficial: game.added_by === 'creator' || game.addedBy === 'creator',
        addedBy: game.added_by === 'creator' ? 'Creator' : (game.requester_info || game.requesterInfo || 'Viewer'),
        category: game.genre || game.category || '',
      }));
      const sorted = normalized.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      setGames(sorted);

      // Compute total votes from all games (not filtered)
      const voteSum = sorted.reduce((sum, g) => sum + (g.vote_count || 0), 0);
      setTotalVotes(voteSum);

      // Extract period key from first game if available
      if (sorted.length > 0 && sorted[0].period_key) {
        setCurrentPeriodKey(sorted[0].period_key);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  }, [currentPeriodKey]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      if (response?.data?.stats?.active_period) {
        setCurrentPeriodKey(response.data.stats.active_period);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Initialize — fetch once, NO auto-refresh (avoids disruptive reloads) ───
  useEffect(() => {
    fetchStats();
    fetchGames(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filter tab changes
  useEffect(() => {
    fetchGames(activeFilter);
  }, [activeFilter, fetchGames]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const filteredGames = games.filter((g) =>
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxVotes = Math.max(...games.map((g) => g.vote_count || 0), 1);

  const countByStatus = games.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});

  const topGame = games.find(g => g.status === 'playing') ||
                  games.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0] || null;

  // Bulk helpers
  const selectedCount = selectedIds.size;
  const visibleIds = filteredGames.map((g) => g.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Game Form ──────────────────────────────────────────────────────────────
  const handleAddGame = () => {
    setEditingGame(null);
    setGameFormOpen(true);
  };

  const handleSaveGame = async (data) => {
    setGameFormLoading(true);
    try {
      await createGame(data);
      setGameFormOpen(false);
      fetchGames(activeFilter);
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    } finally {
      setGameFormLoading(false);
    }
  };

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleStatusAction = async (game, newStatus) => {
    setLoadingAction(true);
    try {
      await updateGameStatus(game.id, newStatus);
      setActionModal({ open: false, game: null, action: null });
      fetchGames(activeFilter);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.game) return;
    setLoadingAction(true);
    try {
      await deleteGame(deleteModal.game.id);
      setDeleteModal({ open: false, game: null });
      fetchGames(activeFilter);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPeriod = async () => {
    setLoadingAction(true);
    try {
      const response = await resetVotingPeriod();
      setResetModal({ open: false });
      if (response?.data?.new_period || response?.periodKey) {
        setCurrentPeriodKey(response.data?.new_period || response.periodKey);
      }
      fetchGames('all');
      setActiveFilter('all');
    } catch (error) {
      console.error('Error resetting period:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkAccept = async () => {
    setLoadingAction(true);
    try {
      const targets = filteredGames.filter((g) => selectedIds.has(g.id) && g.status === 'requested');
      await Promise.all(targets.map((g) => updateGameStatus(g.id, 'accepted')));
      clearSelection();
      fetchGames(activeFilter);
    } catch (error) {
      console.error('Bulk accept error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkDelete = async () => {
    setLoadingAction(true);
    try {
      const targets = filteredGames.filter((g) => selectedIds.has(g.id) && g.status !== 'playing');
      await Promise.all(targets.map((g) => deleteGame(g.id)));
      clearSelection();
      fetchGames(activeFilter);
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (games.length === 0) {
      alert('Tidak ada data game untuk diekspor.');
      return;
    }

    const periodLabel = formatPeriodLabel(currentPeriodKey);
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }) + ' WIB';

    const statusMap = {
      requested: 'Menunggu Review',
      accepted: 'Diterima',
      playing: 'Sedang Dimainkan',
      done: 'Selesai'
    };

    // Sorted by vote count
    const sortedGames = [...games].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    // Structured metadata header for clarity in spreadsheet viewers
    const metaRows = [
      ['LAPORAN REKAPITULASI VOTING GAME X-VOCA'],
      ['Periode Voting', `${periodLabel} (${currentPeriodKey})`],
      ['Tanggal Ekspor', nowStr],
      ['Total Suara Terkumpul', `${totalVotes.toLocaleString('id-ID')} Suara`],
      ['Total Usulan Game', `${games.length} Game`],
      [] // empty line separator
    ];

    const tableHeaders = [
      'Peringkat',
      'Judul Game',
      'Kategori / Genre',
      'Status',
      'Jumlah Suara',
      'Rasio Suara',
      'Diusulkan Oleh'
    ];

    const dataRows = sortedGames.map((game, index) => {
      const votes = game.vote_count || 0;
      const pct = maxVotes > 0 ? `${Math.round((votes / maxVotes) * 100)}%` : '0%';
      const statusLabel = statusMap[game.status] || game.status || '-';
      const submitter = game.isOfficial ? 'Creator (Admin)' : (game.addedBy || 'Viewer');

      return [
        index + 1,
        game.title || '-',
        game.genre || game.category || '-',
        statusLabel,
        votes,
        pct,
        submitter
      ];
    });

    const escapeCSV = (cell) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = '\uFEFF' + [
      ...metaRows,
      tableHeaders,
      ...dataRows
    ].map(row => row.map(escapeCSV).join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rekap_voting_${currentPeriodKey}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (games.length === 0) {
      alert('Tidak ada data game untuk diekspor.');
      return;
    }
    setPdfExporting(true);
    try {
      await downloadVotingPDF({
        games,
        periodKey: currentPeriodKey,
        stats: { totalVotes, maxVotes, totalGames: games.length },
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF: ' + (error.message || 'Terjadi kesalahan sistem'));
    } finally {
      setPdfExporting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const daysRemaining = calcDaysRemaining();

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Moderasi Voting</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Kelola usulan game, moderasi voting, dan tentukan game untuk stream berikutnya
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh manual */}
          <button
            onClick={() => { fetchGames(activeFilter); fetchStats(); }}
            disabled={gamesLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-xl hover:bg-bg-surface transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${gamesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={games.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-xl hover:bg-bg-surface transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>
          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={pdfExporting || games.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-purple border border-accent-purple/30 rounded-xl hover:bg-accent-purple/10 transition-colors disabled:opacity-50"
          >
            {pdfExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
          {/* Tambah Game */}
          <button
            onClick={handleAddGame}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Game
          </button>
        </div>
      </div>

      {/* ── Period Info + Summary Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Period Info Card */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Periode Voting Aktif</p>
              <h3 className="text-lg font-bold text-text-primary mt-1">
                {formatPeriodLabel(currentPeriodKey)}
              </h3>
              <p className="text-sm text-text-muted mt-0.5">
                Sisa {daysRemaining} hari dalam periode ini
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
              <CalendarDays className="w-5 h-5 text-accent-purple" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <div>
              <p className="text-xs text-text-muted">Total suara masuk</p>
              <p className="text-xl font-bold text-text-primary mt-0.5">
                {totalVotes.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setResetModal({ open: true })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-status-live border border-status-live/30 rounded-xl hover:bg-status-live/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Periode
            </button>
          </div>
        </div>

        {/* Summary Cards — 4 status */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {SUMMARY_CARDS.map(({ key, label, icon: Icon, colorCard, colorIcon, colorIconText, colorValue }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={`
                bg-bg-card rounded-2xl p-4 border text-left transition-all duration-150
                hover:bg-bg-card-hover hover:shadow-md hover:-translate-y-px
                ${colorCard}
                ${activeFilter === key ? 'ring-2 ring-offset-2 ring-offset-bg-base ring-accent-cyan' : ''}
              `}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border mb-3 ${colorIcon}`}>
                <Icon className={`w-4 h-4 ${colorIconText}`} />
              </div>
              {statsLoading ? (
                <div className="h-7 w-8 bg-bg-surface rounded animate-pulse mb-1" />
              ) : (
                <p className={`text-2xl font-bold font-mono ${colorValue}`}>
                  {String(countByStatus[key] || 0).padStart(2, '0')}
                </p>
              )}
              <p className="text-xs text-text-muted mt-1">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts + Game List Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: Vote Leaderboard Chart */}
        <div className="xl:col-span-1">
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                  <BarChart3 className="w-4 h-4 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Peringkat Vote</h3>
                  <p className="text-[11px] text-text-muted">Top game berdasarkan suara</p>
                </div>
              </div>
              {topGame && (
                <div className="flex items-center gap-1 px-2 py-1 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                  <Trophy className="w-3 h-3 text-accent-gold" />
                  <span className="text-[10px] font-semibold text-accent-gold">Top</span>
                </div>
              )}
            </div>

            <VoteLeaderboard games={games} maxVotes={maxVotes} loading={gamesLoading} />

            {/* Summary footer */}
            {!gamesLoading && games.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{games.length}</p>
                  <p className="text-[10px] text-text-muted">Total Game</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{totalVotes.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Total Suara</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Filter + Game Cards */}
        <div className="xl:col-span-2">
          <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden h-full">

            {/* Search + Filter row */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul atau genre..."
                  className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {filteredGames.length} game
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pt-3 pb-0 flex items-center gap-0.5 border-b border-border-subtle overflow-x-auto">
              {FILTER_TABS.map((tab) => {
                const count = tab.key === 'all' ? games.length : (countByStatus[tab.key] || 0);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFilter(tab.key)}
                    className={`
                      px-3 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px
                      ${activeFilter === tab.key
                        ? 'text-accent-cyan border-accent-cyan bg-accent-cyan/5'
                        : 'text-text-muted border-transparent hover:text-text-secondary hover:border-border-subtle'}
                    `}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                      activeFilter === tab.key
                        ? 'bg-accent-cyan/20 text-accent-cyan'
                        : 'bg-bg-surface text-text-muted'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bulk Actions Bar */}
            {selectedCount > 0 && (
              <div className="px-4 py-2.5 bg-accent-cyan/5 border-b border-accent-cyan/20 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-accent-cyan">
                  {selectedCount} dipilih
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleBulkAccept}
                    disabled={loadingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-cyan border border-accent-cyan/40 rounded-lg hover:bg-accent-cyan/10 disabled:opacity-50 transition-colors"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Terima Semua
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={loadingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-status-live border border-status-live/40 rounded-lg hover:bg-status-live/10 disabled:opacity-50 transition-colors"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Hapus Semua
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            )}

            {/* Game List */}
            <div className="p-4">
              {/* Select All row */}
              {!gamesLoading && filteredGames.length > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1.5 transition-colors"
                  >
                    {allVisibleSelected ? (
                      <CheckCircle className="w-3.5 h-3.5 text-accent-cyan" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                    {allVisibleSelected ? 'Batalkan semua' : 'Pilih semua'}
                  </button>
                  <span className="text-xs text-text-muted">
                    {filteredGames.length} dari {games.length} game
                  </span>
                </div>
              )}

              {/* Loading */}
              {gamesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-bg-surface rounded-xl border border-border-subtle p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-bg-card" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-2.5 w-14 bg-bg-card rounded" />
                          <div className="h-3.5 w-full bg-bg-card rounded" />
                          <div className="h-2.5 w-2/3 bg-bg-card rounded" />
                          <div className="h-1.5 w-full bg-bg-card rounded-full mt-2" />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <div className="h-6 w-16 bg-bg-card rounded-lg" />
                        <div className="h-6 w-20 bg-bg-card rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center">
                    <Gamepad2 className="w-7 h-7 text-text-muted opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-secondary">Tidak ada game ditemukan</p>
                    <p className="text-xs text-text-muted mt-1">
                      {searchQuery
                        ? `Tidak ada hasil untuk "${searchQuery}"`
                        : 'Belum ada game untuk filter yang dipilih'}
                    </p>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-accent-cyan hover:underline"
                    >
                      Hapus pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredGames.map((game, index) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      rank={index + 1}
                      maxVotes={maxVotes}
                      selected={selectedIds.has(game.id)}
                      onSelect={toggleSelect}
                      onAccept={(g) => setActionModal({ open: true, game: g, action: 'accept' })}
                      onPlaying={(g) => setActionModal({ open: true, game: g, action: 'playing' })}
                      onDone={(g) => setActionModal({ open: true, game: g, action: 'done' })}
                      onDelete={(g) => setDeleteModal({ open: true, game: g })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reset Period Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false })}
        title="Reset Periode Voting"
        confirmText="Reset Sekarang"
        cancelText="Batal"
        onConfirm={handleResetPeriod}
        variant="danger"
        loading={loadingAction}
      >
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin memulai periode voting baru untuk bulan ini?
          </p>
          <div className="bg-status-live/10 border border-status-live/20 rounded-xl p-4 space-y-2">
            <p className="flex items-center gap-2 text-sm text-status-live font-semibold">
              <AlertCircle className="w-4 h-4" />
              Perhatian — tindakan ini tidak bisa dibatalkan
            </p>
            <ul className="text-xs text-text-muted space-y-1 list-disc list-inside ml-1">
              <li>Semua vote akan di-reset menjadi 0</li>
              <li>Game berstatus "Playing" dan "Done" akan dikembalikan ke "Accepted"</li>
              <li>Game berstatus "Requested" tetap ada</li>
              <li>Periode baru dimulai secara otomatis</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ── Action Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, game: null, action: null })}
        title="Konfirmasi Ubah Status"
        confirmText="Konfirmasi"
        cancelText="Batal"
        onConfirm={() => {
          if (actionModal.game && actionModal.action) {
            const statusMap = { accept: 'accepted', playing: 'playing', done: 'done' };
            handleStatusAction(actionModal.game, statusMap[actionModal.action]);
          }
        }}
        variant="default"
        loading={loadingAction}
      >
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Ubah status game <span className="text-text-primary font-semibold">"{actionModal.game?.title}"</span>?
          </p>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
            <p className="text-xs text-text-muted mb-2">Aksi yang akan dilakukan:</p>
            <p className={`text-sm font-semibold flex items-center gap-2 ${
              actionModal.action === 'accept'  ? 'text-accent-cyan' :
              actionModal.action === 'playing' ? 'text-accent-gold' : 'text-status-done'
            }`}>
              {actionModal.action === 'accept'  && <><Check       className="w-4 h-4" /> Terima — Game masuk daftar kandidat tayang</>}
              {actionModal.action === 'playing' && <><Play        className="w-4 h-4" /> Set Dimainkan — Game sedang ditayangkan</>}
              {actionModal.action === 'done'    && <><CheckCircle className="w-4 h-4" /> Tandai Selesai — Game sudah selesai ditayangkan</>}
            </p>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, game: null })}
        title="Konfirmasi Hapus Game"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        variant="danger"
        loading={loadingAction}
      >
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin menghapus game{' '}
            <span className="text-text-primary font-semibold">"{deleteModal.game?.title}"</span>?
          </p>
          <p className="text-xs text-text-muted">
            Game yang dihapus tidak bisa dikembalikan. Semua vote untuk game ini akan ikut dihapus.
          </p>
        </div>
      </Modal>

      {/* ── Game Form Panel ───────────────────────────────────────────────── */}
      <GameFormPanel
        isOpen={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
        onSave={handleSaveGame}
        game={editingGame}
        loading={gameFormLoading}
      />

    </div>
  );
}

export default VotingModerationPage;
