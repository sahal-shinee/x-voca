import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2,
  X,
  FileText,
  BarChart3,
  CalendarDays,
  CalendarPlus,
  Trophy,
  Medal,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',       label: 'SEMUA' },
  { key: 'requested', label: 'MENUNGGU' },
  { key: 'accepted',  label: 'DITERIMA' },
  { key: 'playing',   label: 'DIMAINKAN' },
  { key: 'done',      label: 'SELESAI' },
];

const STATUS_META = {
  requested: {
    label: 'Menunggu Review',
    shortLabel: 'Requested',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    bar: 'bg-amber-500',
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
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-500',
  },
};

// Format period key "2026-10" → "Oktober 2026"
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

// Calculate days remaining in current month
const calcDaysRemaining = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, lastDay.getDate() - now.getDate());
};

// ─── Main Component ───────────────────────────────────────────────────────────

function VotingModerationPage() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentPeriodKey, setCurrentPeriodKey] = useState(new Date().toISOString().slice(0, 7));
  const [totalVotes, setTotalVotes] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // All games dataset (master list to ensure metric counts never zero out)
  const [allGames, setAllGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Export dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modals
  const [resetModal, setResetModal] = useState({ open: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, game: null });
  const [actionModal, setActionModal] = useState({ open: false, game: null, action: null });
  const [loadingAction, setLoadingAction] = useState(false);

  // Game Form Panel
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameFormLoading, setGameFormLoading] = useState(false);

  // PDF Export
  const [pdfExporting, setPdfExporting] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Fetch Master Games Data ─────────────────────────────────────────────────
  const fetchAllGames = useCallback(async () => {
    setGamesLoading(true);
    setSelectedIds(new Set());
    try {
      const response = await getGames();
      let rawGames = [];
      if (response?.data) {
        if (Array.isArray(response.data)) {
          rawGames = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          rawGames = response.data.data;
        }
      }
      const normalized = rawGames.map((game) => ({
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

      // Sort descending by vote count
      const sorted = normalized.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
      setAllGames(sorted);

      // Compute total votes
      const voteSum = sorted.reduce((sum, g) => sum + (g.vote_count || 0), 0);
      setTotalVotes(voteSum);

      if (sorted.length > 0 && sorted[0].period_key) {
        setCurrentPeriodKey(sorted[0].period_key);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setAllGames([]);
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

  // Initialize once on mount
  useEffect(() => {
    fetchStats();
    fetchAllGames();
  }, [fetchStats, fetchAllGames]);

  // ── Computed Variables ───────────────────────────────────────────────────────
  // Status counts calculated permanently from allGames (never drops to 0 on tab change!)
  const countByStatus = {
    all: allGames.length,
    requested: allGames.filter((g) => g.status === 'requested').length,
    accepted:  allGames.filter((g) => g.status === 'accepted').length,
    playing:   allGames.filter((g) => g.status === 'playing').length,
    done:      allGames.filter((g) => g.status === 'done').length,
  };

  const maxVotes = Math.max(...allGames.map((g) => g.vote_count || 0), 1);

  // #1 Top game by votes
  const topGame = allGames.length > 0 ? allGames[0] : null;

  // Filtered games based on active tab and search query
  const filteredGames = allGames.filter((g) => {
    const matchesTab = activeFilter === 'all' || g.status === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesTab;
    const matchesSearch =
      g.title?.toLowerCase().includes(q) ||
      g.category?.toLowerCase().includes(q) ||
      g.genre?.toLowerCase().includes(q) ||
      g.publisher?.toLowerCase().includes(q) ||
      g.addedBy?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddGame = () => {
    setEditingGame(null);
    setGameFormOpen(true);
  };

  const handleSaveGame = async (data) => {
    setGameFormLoading(true);
    try {
      await createGame(data);
      setGameFormOpen(false);
      fetchAllGames();
      fetchStats();
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    } finally {
      setGameFormLoading(false);
    }
  };

  const handleStatusAction = async (game, newStatus) => {
    setLoadingAction(true);
    try {
      await updateGameStatus(game.id, newStatus);
      setActionModal({ open: false, game: null, action: null });
      fetchAllGames();
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
      fetchAllGames();
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
      fetchAllGames();
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
      fetchAllGames();
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
      fetchAllGames();
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Direct fast-link to Schedule
  const handleScheduleGame = (game) => {
    navigate(`/admin/schedules?action=create&game=${encodeURIComponent(game.title)}`);
  };

  // ── Export Handlers ─────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    setExportDropdownOpen(false);
    if (allGames.length === 0) {
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
      timeZone: 'Asia/Jakarta',
    }) + ' WIB';

    const statusMap = {
      requested: 'Menunggu Review',
      accepted: 'Diterima',
      playing: 'Sedang Dimainkan',
      done: 'Selesai',
    };

    const sortedGames = [...allGames].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    const metaRows = [
      ['LAPORAN REKAPITULASI VOTING GAME X-VOCA'],
      ['Periode Voting', `${periodLabel} (${currentPeriodKey})`],
      ['Tanggal Ekspor', nowStr],
      ['Total Suara Terkumpul', `${totalVotes.toLocaleString('id-ID')} Suara`],
      ['Total Usulan Game', `${allGames.length} Game`],
      [],
    ];

    const tableHeaders = [
      'Peringkat',
      'Judul Game',
      'Kategori / Genre',
      'Status',
      'Jumlah Suara',
      'Rasio Suara',
      'Diusulkan Oleh',
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
        submitter,
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
      ...dataRows,
    ].map((row) => row.map(escapeCSV).join(',')).join('\r\n');

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
    setExportDropdownOpen(false);
    if (allGames.length === 0) {
      alert('Tidak ada data game untuk diekspor.');
      return;
    }
    setPdfExporting(true);
    try {
      await downloadVotingPDF({
        games: allGames,
        periodKey: currentPeriodKey,
        stats: { totalVotes, maxVotes, totalGames: allGames.length },
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal mengekspor PDF: ' + (error.message || 'Terjadi kesalahan sistem'));
    } finally {
      setPdfExporting(false);
    }
  };

  const daysRemaining = calcDaysRemaining();

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── Page Header & Command Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Moderasi Voting Game
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Kelola usulan komunitas, pantau voting real-time, dan jadwalkan game siaran
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Refresh Manual */}
          <button
            type="button"
            onClick={() => { fetchAllGames(); fetchStats(); }}
            disabled={gamesLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            title="Muat ulang data voting"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${gamesLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setExportDropdownOpen((prev) => !prev)}
              disabled={pdfExporting || allGames.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            >
              {pdfExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-purple" />
              ) : (
                <Download className="w-3.5 h-3.5 text-accent-purple" />
              )}
              <span>Ekspor Data</span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-border-subtle rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-border-subtle">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Format Laporan</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Unduh Ringkasan CSV</p>
                    <p className="text-[10px] text-text-muted">Format spreadsheet & Excel</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-accent-purple shrink-0" />
                  <div>
                    <p className="font-semibold">Cetak Laporan PDF</p>
                    <p className="text-[10px] text-text-muted">Rekap resmi siap cetak</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Tambah Game */}
          <button
            type="button"
            onClick={handleAddGame}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-accent-cyan via-accent-cyan to-accent-purple text-bg-base rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md shadow-accent-cyan/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Game</span>
          </button>
        </div>
      </div>

      {/* ── Top Metric Ribbon (Symmetric 5-card deck) ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* 1. Periode Voting Aktif */}
        <div className="col-span-2 md:col-span-1 bg-bg-card border border-border-subtle rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-accent-purple/40 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Periode Aktif</p>
              <h3 className="text-base font-bold text-text-primary mt-0.5 truncate">
                {formatPeriodLabel(currentPeriodKey)}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-live animate-ping" />
              <span className="text-xs font-mono font-semibold text-text-primary">
                {totalVotes.toLocaleString('id-ID')} <span className="text-[10px] text-text-muted font-normal">suara</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResetModal({ open: true })}
              className="text-[11px] font-semibold text-status-live hover:text-status-live/80 hover:underline transition-colors"
            >
              Reset Periode
            </button>
          </div>
        </div>

        {/* 2. Menunggu Review (Requested) */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === 'requested' ? 'all' : 'requested')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeFilter === 'requested'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
              : 'border-border-subtle hover:border-amber-500/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Menunggu Review</p>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {String(countByStatus.requested).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">usulan</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Perlu verifikasi admin</p>
        </button>

        {/* 3. Diterima (Accepted) */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === 'accepted' ? 'all' : 'accepted')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeFilter === 'accepted'
              ? 'border-accent-purple ring-2 ring-accent-purple/20 bg-accent-purple/5'
              : 'border-border-subtle hover:border-accent-purple/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Diterima</p>
            <div className="w-8 h-8 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-purple">
              {String(countByStatus.accepted).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">kandidat</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Siap tayang & masuk voting</p>
        </button>

        {/* 4. Sedang Dimainkan (Playing) */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === 'playing' ? 'all' : 'playing')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeFilter === 'playing'
              ? 'border-accent-gold ring-2 ring-accent-gold/20 bg-accent-gold/5'
              : 'border-border-subtle hover:border-accent-gold/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Sedang Dimainkan</p>
            <div className="w-8 h-8 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
              <Play className="w-4 h-4 fill-accent-gold/20" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-accent-gold">
              {String(countByStatus.playing).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">game</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Sedang aktif di sesi live</p>
        </button>

        {/* 5. Selesai (Done) */}
        <button
          type="button"
          onClick={() => setActiveFilter(activeFilter === 'done' ? 'all' : 'done')}
          className={`
            bg-bg-card border rounded-2xl p-4 text-left transition-all hover:bg-bg-card-hover shadow-sm
            ${activeFilter === 'done'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
              : 'border-border-subtle hover:border-emerald-500/40'}
          `}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Selesai</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {String(countByStatus.done).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-text-muted">selesai</span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 truncate">Sudah ditayangkan</p>
        </button>
      </div>

      {/* ── Main 2-Column Command Workspace ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ── Left Column: Leaderboard & Community Spotlight (5 cols on xl) ── */}
        <div className="xl:col-span-4 space-y-5">

          {/* 1. Podium #1 Winner Spotlight Card */}
          <div className="relative overflow-hidden bg-bg-card border border-accent-gold/30 rounded-2xl p-5 shadow-md">
            <div className="absolute top-0 right-0 w-36 h-36 bg-accent-gold/10 rounded-full blur-2xl pointer-events-none" />

            {/* Spotlight Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/30 text-accent-gold text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>JUARA VOTING #1</span>
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                Sisa {daysRemaining} Hari
              </span>
            </div>

            {topGame && topGame.vote_count > 0 ? (
              <div className="space-y-4">
                {/* Cover & Title */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-bg-surface border border-accent-gold/30 overflow-hidden flex-shrink-0 shadow-sm relative">
                    {topGame.cover_url || topGame.thumbnail ? (
                      <img
                        src={topGame.cover_url || topGame.thumbnail}
                        alt={topGame.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <Gamepad2 className="w-8 h-8 text-accent-gold/40 m-auto mt-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-text-primary leading-snug truncate">
                      {topGame.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {topGame.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-bg-surface border border-border-subtle text-text-secondary truncate">
                          {topGame.category}
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted truncate">
                        Oleh: {topGame.addedBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vote Ratio Progress */}
                <div className="bg-bg-surface border border-border-subtle rounded-xl p-3">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-accent-gold text-sm">
                      {topGame.vote_count.toLocaleString('id-ID')}{' '}
                      <span className="text-xs text-text-muted font-normal">suara</span>
                    </span>
                    <span className="font-mono text-xs text-text-secondary font-semibold">
                      {totalVotes > 0 ? Math.round((topGame.vote_count / totalVotes) * 100) : 0}% suara
                    </span>
                  </div>
                  <div className="h-2 bg-bg-base rounded-full overflow-hidden border border-border-subtle p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-accent-gold to-amber-500 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, Math.max(10, totalVotes > 0 ? (topGame.vote_count / totalVotes) * 100 : 0))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Instant CTA to Schedule */}
                <button
                  type="button"
                  onClick={() => handleScheduleGame(topGame)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-cyan via-accent-cyan to-accent-purple text-bg-base rounded-xl font-bold text-xs hover:opacity-95 transition-all shadow-md active:scale-98"
                >
                  <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Jadwalkan Stream Game Ini</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto mb-2 text-text-muted">
                  <Flame className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-text-secondary">Belum ada suara bulan ini</p>
                <p className="text-[11px] text-text-muted mt-1 max-w-[240px] mx-auto">
                  Bagikan tautan voting ke penonton live untuk mulai mengumpulkan usulan dan suara.
                </p>
              </div>
            )}
          </div>

          {/* 2. Top Leaderboard List (Top 5) */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Peringkat Suara Teratas</h3>
                  <p className="text-[11px] text-text-muted">Top usulan game terfavorit</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                {allGames.length} Game
              </span>
            </div>

            {/* List */}
            {gamesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-6 h-6 rounded bg-bg-surface shrink-0" />
                    <div className="h-4 flex-1 bg-bg-surface rounded" />
                    <div className="w-12 h-4 bg-bg-surface rounded shrink-0" />
                  </div>
                ))}
              </div>
            ) : allGames.length === 0 ? (
              <div className="py-8 text-center text-text-muted">
                <p className="text-xs">Belum ada usulan game terdaftar</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allGames.slice(0, 5).map((game, idx) => {
                  const rank = idx + 1;
                  const votes = game.vote_count || 0;
                  const pct = maxVotes > 0 ? Math.round((votes / maxVotes) * 100) : 0;
                  const meta = STATUS_META[game.status] || STATUS_META.requested;

                  return (
                    <div
                      key={game.id}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle"
                    >
                      {/* Rank Medal / Number */}
                      <div className="w-6 text-center shrink-0">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-bold">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-300/20 text-slate-300 text-xs font-bold">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/20 text-amber-500 text-xs font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-text-muted font-semibold">
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Mini Thumbnail */}
                      <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center">
                        {game.cover_url || game.thumbnail ? (
                          <img
                            src={game.cover_url || game.thumbnail}
                            alt={game.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Gamepad2 className="w-4 h-4 text-text-muted opacity-40" />
                        )}
                      </div>

                      {/* Title & Vote Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {game.title}
                          </p>
                          <span className="text-xs font-mono font-bold text-text-primary shrink-0">
                            {votes.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden border border-border-subtle">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick schedule icon */}
                      <button
                        type="button"
                        onClick={() => handleScheduleGame(game)}
                        title="Jadwalkan stream untuk game ini"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-accent-cyan hover:bg-accent-cyan/10 transition-all shrink-0"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Summary Pill */}
            {allGames.length > 0 && (
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span>Total Partisipasi Suara</span>
                <span className="font-mono font-bold text-text-primary">
                  {totalVotes.toLocaleString('id-ID')} Suara
                </span>
              </div>
            )}
          </div>

        </div>

        {/* ── Right Column: Moderation & Filter Deck (7 cols on xl) ────────── */}
        <div className="xl:col-span-8 space-y-4">

          {/* Search, Filter Tabs & Bulk Actions Deck */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 shadow-sm space-y-3">

            {/* Row 1: Search & Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul game, genre, atau pengusul..."
                  className="w-full pl-9 pr-8 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {FILTER_TABS.map((tab) => {
                  const count = countByStatus[tab.key] || 0;
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveFilter(tab.key)}
                      className={`
                        px-3 py-2 text-xs font-mono font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5
                        ${isActive
                          ? 'bg-accent-cyan text-bg-base shadow-sm'
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
            </div>

            {/* Row 2: Select All & Counters */}
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-text-muted">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 hover:text-text-primary transition-colors font-medium"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {allVisibleSelected ? (
                    <CheckCircle className="w-4 h-4 text-accent-cyan" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </span>
                <span>{allVisibleSelected ? 'Batalkan Pilih Semua' : 'Pilih Semua Game Terlihat'}</span>
              </button>

              <span>
                Menampilkan <strong className="text-text-primary font-mono">{filteredGames.length}</strong> dari{' '}
                <strong className="text-text-primary font-mono">{allGames.length}</strong> game
              </span>
            </div>

            {/* Row 3: Bulk Actions Ribbon (When items selected) */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  <span className="text-xs font-bold text-accent-cyan">
                    {selectedCount} game dipilih
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBulkAccept}
                    disabled={loadingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-cyan bg-bg-card border border-accent-cyan/40 rounded-lg hover:bg-accent-cyan/15 disabled:opacity-50 transition-colors"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Terima Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={loadingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-status-live bg-bg-card border border-status-live/40 rounded-lg hover:bg-status-live/15 disabled:opacity-50 transition-colors"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    <span>Hapus Semua</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Game Cards Grid */}
          {gamesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-bg-card rounded-2xl border border-border-subtle p-5 animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-bg-surface rounded" />
                    <div className="h-4 w-10 bg-bg-surface rounded" />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-bg-surface shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-bg-surface rounded" />
                      <div className="h-3 w-1/2 bg-bg-surface rounded" />
                      <div className="h-2 w-full bg-bg-surface rounded mt-2" />
                    </div>
                  </div>
                  <div className="h-8 w-full bg-bg-surface rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
                <Gamepad2 className="w-7 h-7 opacity-40" />
              </div>
              <h4 className="text-base font-bold text-text-primary">Tidak Ada Game Ditemukan</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada game yang cocok dengan kata kunci "${searchQuery}". Coba gunakan judul atau genre lain.`
                  : activeFilter !== 'all'
                  ? `Belum ada game berstatus "${activeFilter}". Klik tab lain untuk melihat usulan yang tersedia.`
                  : 'Belum ada usulan game yang terdaftar pada periode voting ini.'}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Hapus Pencarian
                  </button>
                )}
                {activeFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Tampilkan Semua Tab
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddGame}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base hover:opacity-95 transition-opacity"
                >
                  + Tambah Game Baru
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                  onSchedule={handleScheduleGame}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* ── Reset Period Confirmation Modal ───────────────────────────────── */}
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
              <li>Semua akumulasi perolehan suara akan di-reset menjadi 0</li>
              <li>Game berstatus "Playing" dan "Done" akan dikembalikan ke "Accepted"</li>
              <li>Game berstatus "Requested" tetap tersimpan</li>
              <li>Periode baru dimulai secara otomatis</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ── Status Change Confirmation Modal ──────────────────────────────── */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, game: null, action: null })}
        title="Konfirmasi Status Game"
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
            Ubah status game <strong className="text-text-primary">"{actionModal.game?.title}"</strong>?
          </p>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
            <p className="text-xs text-text-muted mb-2">Aksi yang akan dilakukan:</p>
            <p className={`text-sm font-semibold flex items-center gap-2 ${
              actionModal.action === 'accept'  ? 'text-accent-cyan' :
              actionModal.action === 'playing' ? 'text-accent-gold' : 'text-emerald-500'
            }`}>
              {actionModal.action === 'accept'  && <><Check       className="w-4 h-4" /> Terima Usulan — Game resmi masuk daftar kandidat tayang</>}
              {actionModal.action === 'playing' && <><Play        className="w-4 h-4" /> Set Dimainkan — Game sedang aktif ditayangkan di stream</>}
              {actionModal.action === 'done'    && <><CheckCircle className="w-4 h-4" /> Tandai Selesai — Game telah selesai ditayangkan</>}
            </p>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, game: null })}
        title="Konfirmasi Hapus Game"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        onConfirm={handleDelete}
        variant="danger"
        loading={loadingAction}
      >
        <div className="space-y-3">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin menghapus game{' '}
            <strong className="text-text-primary">"{deleteModal.game?.title}"</strong>?
          </p>
          <p className="text-xs text-text-muted">
            Game yang dihapus tidak bisa dikembalikan. Semua voting untuk game ini akan ikut terhapus.
          </p>
        </div>
      </Modal>

      {/* ── Game Form Slide-over Panel ────────────────────────────────────── */}
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
