import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../../services/dashboardService';
import { getGames, createGame, updateGameStatus, deleteGame, resetVotingPeriod } from '../../services/gameService';
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
  ChevronDown,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',       label: 'SEMUA' },
  { key: 'requested', label: 'REQUESTED' },
  { key: 'accepted',  label: 'ACCEPTED' },
  { key: 'playing',   label: 'PLAYING' },
  { key: 'done',      label: 'DONE' },
];

const PERIOD_OPTIONS = [
  { value: 'this',  label: 'Bulan Ini' },
  { value: 'last',  label: 'Bulan Lalu' },
];

// Summary card configurations aligned with planning doc 3.4
const SUMMARY_CARDS = [
  {
    key: 'requested',
    label: 'Requested',
    icon: Circle,
    colorCard: 'border-status-requested/30 hover:border-status-requested/50',
    colorIcon: 'bg-status-requested/10',
    colorIconText: 'text-status-requested',
    colorValue: 'text-status-requested',
  },
  {
    key: 'accepted',
    label: 'Accepted',
    icon: Check,
    colorCard: 'border-accent-purple/30 hover:border-accent-purple/50',
    colorIcon: 'bg-accent-purple/10',
    colorIconText: 'text-accent-purple',
    colorValue: 'text-accent-purple',
  },
  {
    key: 'playing',
    label: 'Playing',
    icon: Play,
    colorCard: 'border-accent-gold/30 hover:border-accent-gold/50',
    colorIcon: 'bg-accent-gold/10',
    colorIconText: 'text-accent-gold',
    colorValue: 'text-accent-gold',
  },
  {
    key: 'done',
    label: 'Done',
    icon: CheckCircle,
    colorCard: 'border-status-done/30 hover:border-status-done/50',
    colorIcon: 'bg-status-done/10',
    colorIconText: 'text-status-done',
    colorValue: 'text-status-done',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

function VotingModerationPage() {

  // ── Summary stats ──────────────────────────────────────────────────────────
  const [summaryStats, setSummaryStats] = useState({
    totalUsulan: 0,
    suaraTerkumpul: 0,
    quorumPercent: 0,
    sedangDimainkan: null,
    menungguReview: 0,
    periodKey: '',
    totalVotes: 0,
    daysRemaining: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Games ──────────────────────────────────────────────────────────────────
  const [games, setGames]           = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [activePeriod, setActivePeriod] = useState('this');
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);

  // ── Bulk selection ─────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [resetModal, setResetModal]   = useState({ open: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, game: null });
  const [actionModal, setActionModal] = useState({ open: false, game: null, action: null });
  const [loadingAction, setLoadingAction] = useState(false);

  // ── Game Form Panel ────────────────────────────────────────────────────────
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameFormLoading, setGameFormLoading] = useState(false);

  // ── Fetch summary stats ────────────────────────────────────────────────────
  const fetchSummaryStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      if (response?.data) {
        setSummaryStats({
          totalUsulan:      response.data.totalUsulan || response.data.totalGames || 0,
          suaraTerkumpul:   response.data.totalVotes || 0,
          quorumPercent:    response.data.quorumPercent || 0,
          sedangDimainkan:  response.data.sedangDimainkan || null,
          menungguReview:   response.data.menungguReview || 0,
          periodKey:        response.data.periodKey || new Date().toISOString().slice(0, 7),
          totalVotes:       response.data.totalVotes || 0,
          daysRemaining:    response.data.daysRemaining || 30,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setSummaryStats({
        totalUsulan: 18, suaraTerkumpul: 1480, quorumPercent: 84,
        sedangDimainkan: { title: 'Signalis', id: 1 }, menungguReview: 3,
        periodKey: '2026-10', totalVotes: 1480, daysRemaining: 6,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch games ────────────────────────────────────────────────────────────
  const fetchGames = useCallback(async (status = 'all') => {
    setGamesLoading(true);
    setSelectedIds(new Set()); // clear selection on refetch
    try {
      const response = await getGames({ status });
      if (response?.data) {
        const raw = Array.isArray(response.data) ? response.data : (response.data.games || []);
        setGames([...raw].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)));
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([
        { id: 1, title: 'Elden Ring: Shadow of the Erdtree', category: 'ACTION RPG', genre: 'Souls-like', publisher: 'FromSoftware', voteCount: 247, status: 'playing',   addedBy: 'Creator',      isOfficial: true },
        { id: 2, title: 'Signalis',                          category: 'SURVIVAL HORROR', genre: 'Retro Sci-Fi', publisher: 'Rose-Engine', voteCount: 186, status: 'playing',   addedBy: 'Viewer #4021', isOfficial: false },
        { id: 3, title: 'Outer Wilds',                       category: 'ADVENTURE',    genre: 'Exploration', publisher: 'Mobius Digital', voteCount: 142, status: 'accepted',  addedBy: 'Viewer #3891', isOfficial: false },
        { id: 4, title: 'Hollow Knight: Silksong',           category: 'METROIDVANIA', genre: 'Action',      publisher: 'Team Cherry',    voteCount: 98,  status: 'accepted',  addedBy: 'Regalia Crew', isOfficial: false },
        { id: 5, title: 'Stardew Valley',                    category: 'SIMULATION',   genre: 'Relaxing',    publisher: 'ConcernedApe',   voteCount: 76,  status: 'requested', addedBy: 'Viewer #2341', isOfficial: false },
        { id: 6, title: 'Death Stranding',                   category: 'ACTION',       genre: 'Walking Sim', publisher: 'Kojima Productions', voteCount: 65, status: 'requested', addedBy: 'Viewer #1234', isOfficial: false },
        { id: 7, title: 'Disco Elysium',                     category: 'RPG',          genre: 'Narrative',   publisher: 'ZA/UM',          voteCount: 54,  status: 'done',      addedBy: 'Creator',      isOfficial: true },
      ]);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  // ── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      fetchSummaryStats();
      fetchGames(activeFilter);
    }, 0);
    return () => clearTimeout(id);
  }, [fetchSummaryStats, fetchGames, activeFilter]);

  // Close period dropdown on outside click
  useEffect(() => {
    if (!showPeriodDrop) return;
    const handler = () => setShowPeriodDrop(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showPeriodDrop]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const filteredGames = games.filter((g) =>
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxVotes = Math.max(...games.map((g) => g.voteCount || 0), 1);

  // Count per status for summary cards
  const countByStatus = games.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});

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

  // ── Game Form handlers ─────────────────────────────────────────────────────
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
      fetchSummaryStats();
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
      fetchSummaryStats();
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
      fetchSummaryStats();
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
      if (response?.data?.periodKey) {
        setSummaryStats((prev) => ({ ...prev, periodKey: response.data.periodKey }));
      }
      fetchGames('all');
      fetchSummaryStats();
    } catch (error) {
      console.error('Error resetting period:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Bulk accept selected games
  const handleBulkAccept = async () => {
    setLoadingAction(true);
    try {
      const targets = filteredGames.filter((g) => selectedIds.has(g.id) && g.status === 'requested');
      await Promise.all(targets.map((g) => updateGameStatus(g.id, 'accepted')));
      clearSelection();
      fetchGames(activeFilter);
      fetchSummaryStats();
    } catch (error) {
      console.error('Bulk accept error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Bulk delete selected games
  const handleBulkDelete = async () => {
    setLoadingAction(true);
    try {
      const targets = filteredGames.filter((g) => selectedIds.has(g.id) && g.status !== 'playing');
      await Promise.all(targets.map((g) => deleteGame(g.id)));
      clearSelection();
      fetchGames(activeFilter);
      fetchSummaryStats();
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Title', 'Category', 'Vote Count', 'Percentage', 'Status', 'Added By'];
    const rows = games.map((game, index) => [
      index + 1,
      game.title,
      game.category || game.genre,
      game.voteCount || 0,
      maxVotes > 0 ? Math.round(((game.voteCount || 0) / maxVotes) * 100) : 0,
      game.status,
      game.addedBy || 'Unknown',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `voting_moderation_${summaryStats.periodKey}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-4 h-4 text-accent-purple" />
            <span className="text-xs font-mono text-accent-purple tracking-wider">AUDIENCE GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-display">Moderasi Voting</h1>
          <p className="text-sm text-text-muted mt-1">
            Kelola usulan game, moderasi voting, dan tentukan game untuk stream berikutnya
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setResetModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Periode
          </button>
          <button
            onClick={handleAddGame}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Tambah Game
          </button>
        </div>
      </div>

      {/* ── 7.1 Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map(({ key, label, icon: Icon, colorCard, colorIcon, colorIconText, colorValue }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`
              bg-bg-card rounded-xl p-4 border text-left transition-all duration-150
              hover:bg-bg-card-hover hover:shadow-md hover:-translate-y-px
              ${colorCard}
              ${activeFilter === key ? 'ring-2 ring-offset-1 ring-offset-bg-base ring-accent-cyan' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorIcon}`}>
                <Icon className={`w-4 h-4 ${colorIconText}`} />
              </div>
            </div>
            {statsLoading ? (
              <div className="h-8 w-10 bg-bg-surface rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-3xl font-bold font-mono ${colorValue}`}>
                {String(countByStatus[key] || 0).padStart(2, '0')}
              </p>
            )}
            <p className="text-xs text-text-muted mt-1 font-mono">{label}</p>
          </button>
        ))}
      </div>

      {/* ── 7.2 Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">

        {/* Search + Period row */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau genre game..."
              className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
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

          {/* Period dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPeriodDrop((v) => !v); }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-surface transition-colors whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              {PERIOD_OPTIONS.find((o) => o.value === activePeriod)?.label}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPeriodDrop && (
              <div
                className="absolute right-0 top-full mt-1 w-40 bg-bg-card border border-border-subtle rounded-lg shadow-xl z-10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setActivePeriod(opt.value); setShowPeriodDrop(false); }}
                    className={`
                      w-full text-left px-3 py-2.5 text-sm transition-colors
                      ${activePeriod === opt.value
                        ? 'bg-accent-cyan/10 text-accent-cyan font-medium'
                        : 'text-text-secondary hover:bg-bg-surface'}
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchGames(activeFilter)}
            disabled={gamesLoading}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors disabled:opacity-50"
            title="Reload"
          >
            <RefreshCw className={`w-4 h-4 ${gamesLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-accent-purple border border-accent-purple/30 rounded-lg hover:bg-accent-purple/10 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-0 flex items-center gap-1 border-b border-border-subtle overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const count = tab.key === 'all' ? games.length : (countByStatus[tab.key] || 0);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`
                  px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px
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

        {/* ── 7.4 Bulk Actions Bar ────────────────────────────────────── */}
        {selectedCount > 0 && (
          <div className="px-4 py-3 bg-accent-cyan/5 border-b border-accent-cyan/20 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-accent-cyan">
              {selectedCount} item dipilih
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkAccept}
                disabled={loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-cyan border border-accent-cyan/40 rounded-lg hover:bg-accent-cyan/10 disabled:opacity-50 transition-colors"
              >
                {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Accept All
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={loadingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-status-live border border-status-live/40 rounded-lg hover:bg-status-live/10 disabled:opacity-50 transition-colors"
              >
                {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Delete All
              </button>
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── 7.3 Card Grid ───────────────────────────────────────────── */}
        <div className="p-4">
          {/* Select All row */}
          {!gamesLoading && filteredGames.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleSelectAll}
                className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1.5 transition-colors"
              >
                {allVisibleSelected ? (
                  <CheckCircle className="w-3.5 h-3.5 text-accent-cyan" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
                {allVisibleSelected ? 'Deselect semua' : 'Select semua'}
              </button>
              <span className="text-xs text-text-muted">
                {filteredGames.length} dari {games.length} game
              </span>
            </div>
          )}

          {/* Loading skeleton */}
          {gamesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-bg-surface rounded-xl border border-border-subtle p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-bg-card" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 w-16 bg-bg-card rounded" />
                      <div className="h-4 w-full bg-bg-card rounded" />
                      <div className="h-3 w-2/3 bg-bg-card rounded" />
                      <div className="h-2 w-full bg-bg-card rounded-full mt-3" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-7 w-20 bg-bg-card rounded-lg" />
                    <div className="h-7 w-24 bg-bg-card rounded-lg" />
                    <div className="h-7 w-20 bg-bg-card rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-xl bg-bg-surface flex items-center justify-center mb-2">
                <Gamepad2 className="w-8 h-8 text-text-muted opacity-40" />
              </div>
              <p className="text-sm font-medium text-text-secondary">Tidak ada game ditemukan</p>
              <p className="text-xs text-text-muted">
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : 'Tidak ada game untuk filter yang dipilih'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-xs text-accent-cyan hover:underline"
                >
                  Hapus pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* ── Period Info Banner ───────────────────────────────────────────── */}
      <div className="bg-bg-card border-l-4 border-l-accent-purple rounded-r-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Periode Voting {summaryStats.periodKey} • Sisa {summaryStats.daysRemaining} Hari
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Total {summaryStats.totalVotes.toLocaleString()} suara sudah masuk.
              Reset periode akan mengosongkan semua vote dan memulai periode baru.
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Ekspor Data
        </button>
      </div>

      {/* ── Reset Period Modal ───────────────────────────────────────────── */}
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
            Apakah kamu yakin ingin mereset periode voting?
          </p>
          <div className="bg-status-live/10 border border-status-live/20 rounded-lg p-4">
            <p className="flex items-center gap-2 text-sm text-status-live font-medium">
              <AlertCircle className="w-4 h-4" />
              Peringatan:
            </p>
            <ul className="text-xs text-text-muted mt-2 space-y-1 list-disc list-inside">
              <li>Semua vote akan di-reset menjadi 0</li>
              <li>Game dengan status &quot;Requested&quot; akan tetap ada</li>
              <li>Game &quot;Playing&quot; dan &quot;Done&quot; akan berubah ke &quot;Accepted&quot;</li>
              <li>Periode baru akan dibuat secara otomatis</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ── Action Confirmation Modal ────────────────────────────────────── */}
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
            Ubah status game <span className="text-text-primary font-semibold">&quot;{actionModal.game?.title}&quot;</span>?
          </p>
          <div className="bg-bg-surface rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Aksi yang akan dilakukan:</p>
            <p className={`text-sm font-medium flex items-center gap-2 ${
              actionModal.action === 'accept'  ? 'text-accent-cyan' :
              actionModal.action === 'playing' ? 'text-accent-gold' : 'text-status-done'
            }`}>
              {actionModal.action === 'accept'  && <><Check       className="w-4 h-4" /> Accept — Game akan menjadi kandidat tayang</>}
              {actionModal.action === 'playing' && <><Play        className="w-4 h-4" /> Set Playing — Game sedang ditayangkan</>}
              {actionModal.action === 'done'    && <><CheckCircle className="w-4 h-4" /> Mark Done — Game sudah selesai ditayangkan</>}
            </p>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
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
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Apakah kamu yakin ingin menghapus game <span className="text-text-primary font-semibold">&quot;{deleteModal.game?.title}&quot;</span>?
          </p>
          <p className="text-xs text-text-muted">
            Game yang dihapus tidak bisa dikembalikan. Vote untuk game ini juga akan ikut dihapus.
          </p>
        </div>
      </Modal>

      {/* ── Game Form Panel ─────────────────────────────────────────────── */}
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
