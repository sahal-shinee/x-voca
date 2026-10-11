import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../../services/dashboardService';
import { getGames, updateGameStatus, deleteGame, resetVotingPeriod } from '../../services/gameService';
import Modal from '../../components/common/Modal';
import {
  Gamepad2,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
  Play,
  CheckCircle,
  Circle,
  AlertCircle,
  Download,
  Settings,
  Loader2,
  ChevronUp,
  ChevronDown,
  Minus,
  Trophy
} from 'lucide-react';

// Filter tabs configuration
const FILTER_TABS = [
  { key: 'all', label: 'SEMUA' },
  { key: 'requested', label: 'REQUESTED' },
  { key: 'accepted', label: 'ACCEPTED' },
  { key: 'playing', label: 'PLAYING' },
  { key: 'done', label: 'DONE' },
];

// Status badge configuration
const getStatusBadge = (status) => {
  const statusMap = {
    requested: { label: 'REQUESTED', class: 'bg-status-requested/10 text-status-requested border-status-requested/20', icon: Circle },
    accepted: { label: 'ACCEPTED', class: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20', icon: Check },
    playing: { label: 'PLAYING', class: 'bg-status-playing/10 text-status-playing border-status-playing/20', icon: Play },
    done: { label: 'DONE', class: 'bg-status-done/10 text-status-done border-status-done/20', icon: CheckCircle },
  };
  return statusMap[status] || statusMap.requested;
};

// Rank medal
const getRankMedal = (rank) => {
  const medals = {
    1: { icon: Trophy, color: 'text-yellow-400' },
    2: { icon: ChevronUp, color: 'text-gray-300' },
    3: { icon: ChevronDown, color: 'text-amber-600' },
  };
  return medals[rank] || null;
};

function VotingModerationPage() {
  // Summary stats state
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

  // Games state
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [resetModal, setResetModal] = useState({ open: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, game: null });
  const [actionModal, setActionModal] = useState({ open: false, game: null, action: null });
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch summary stats
  const fetchSummaryStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getStats();
      if (response?.data) {
        setSummaryStats({
          totalUsulan: response.data.totalUsulan || response.data.totalGames || 0,
          suaraTerkumpul: response.data.totalVotes || 0,
          quorumPercent: response.data.quorumPercent || 0,
          sedangDimainkan: response.data.sedangDimainkan || null,
          menungguReview: response.data.menungguReview || 0,
          periodKey: response.data.periodKey || new Date().toISOString().slice(0, 7),
          totalVotes: response.data.totalVotes || 0,
          daysRemaining: response.data.daysRemaining || 30,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setSummaryStats({
        totalUsulan: 18,
        suaraTerkumpul: 1480,
        quorumPercent: 84,
        sedangDimainkan: { title: 'Signalis', id: 1 },
        menungguReview: 3,
        periodKey: '2026-10',
        totalVotes: 1480,
        daysRemaining: 6,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch games
  const fetchGames = useCallback(async (status = 'all') => {
    setGamesLoading(true);
    try {
      const response = await getGames({ status });
      if (response?.data) {
        const gamesData = Array.isArray(response.data) ? response.data : response.data.games || [];
        const sorted = [...gamesData].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        setGames(sorted);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([
        { id: 1, title: 'Elden Ring: Shadow of the Erdtree', category: 'ACTION RPG', genre: 'Souls-like', publisher: 'FromSoftware', voteCount: 247, status: 'playing', addedBy: 'Creator', isOfficial: true },
        { id: 2, title: 'Signalis', category: 'SURVIVAL HORROR', genre: 'Retro Sci-Fi', publisher: 'Rose-Engine', voteCount: 186, status: 'playing', addedBy: 'Viewer #4021', isOfficial: false },
        { id: 3, title: 'Outer Wilds', category: 'ADVENTURE', genre: 'Exploration', publisher: 'Mobius Digital', voteCount: 142, status: 'accepted', addedBy: 'Viewer #3891', isOfficial: false },
        { id: 4, title: 'Hollow Knight: Silksong', category: 'METROIDVANIA', genre: 'Action', publisher: 'Team Cherry', voteCount: 98, status: 'accepted', addedBy: 'Regalia Crew', isOfficial: false },
        { id: 5, title: 'Stardew Valley', category: 'SIMULATION', genre: 'Relaxing', publisher: 'ConcernedApe', voteCount: 76, status: 'requested', addedBy: 'Viewer #2341', isOfficial: false },
        { id: 6, title: 'Death Stranding', category: 'ACTION', genre: 'Walking Sim', publisher: 'Kojima Productions', voteCount: 65, status: 'requested', addedBy: 'Viewer #1234', isOfficial: false },
        { id: 7, title: 'Disco Elysium', category: 'RPG', genre: 'Narrative', publisher: 'ZA/UM', voteCount: 54, status: 'done', addedBy: 'Creator', isOfficial: true },
      ]);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchSummaryStats();
    fetchGames(activeFilter);
  }, [fetchSummaryStats, fetchGames, activeFilter]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Handle status action
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

  // Handle delete
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

  // Handle reset period
  const handleResetPeriod = async () => {
    setLoadingAction(true);
    try {
      const response = await resetVotingPeriod();
      setResetModal({ open: false });
      if (response?.data?.periodKey) {
        setSummaryStats(prev => ({ ...prev, periodKey: response.data.periodKey }));
      }
      fetchGames('all');
      fetchSummaryStats();
    } catch (error) {
      console.error('Error resetting period:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Rank', 'Title', 'Category', 'Vote Count', 'Percentage', 'Status', 'Added By'];
    const rows = games.map((game, index) => [
      index + 1,
      game.title,
      game.category || game.genre,
      game.voteCount || 0,
      games[0]?.voteCount ? Math.round(((game.voteCount || 0) / games[0].voteCount) * 100) : 0,
      game.status,
      game.addedBy || 'Unknown',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voting_moderation_${summaryStats.periodKey}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter games by search
  const filteredGames = games.filter(game =>
    game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate max votes for percentage
  const maxVotes = Math.max(...games.map(g => g.voteCount || 0), 1);

  // Get action buttons based on status
  const getActionButtons = (game) => {
    const { status } = game;

    return (
      <div className="flex items-center gap-1">
        {/* Accept */}
        <button
          onClick={() => setActionModal({ open: true, game, action: 'accept' })}
          disabled={status !== 'requested'}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            status === 'requested'
              ? 'border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10'
              : 'border border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
          }`}
        >
          <Check className="w-3 h-3" />
          Accept
        </button>

        {/* Playing */}
        <button
          onClick={() => setActionModal({ open: true, game, action: 'playing' })}
          disabled={status !== 'accepted'}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            status === 'accepted'
              ? 'border border-accent-gold text-accent-gold hover:bg-accent-gold/10'
              : 'border border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
          }`}
        >
          <Play className="w-3 h-3" />
          Playing
        </button>

        {/* Done */}
        <button
          onClick={() => setActionModal({ open: true, game, action: 'done' })}
          disabled={status !== 'playing'}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            status === 'playing'
              ? 'border border-status-done text-status-done hover:bg-status-done/10'
              : 'border border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          Done
        </button>

        {/* Delete */}
        <button
          onClick={() => setDeleteModal({ open: true, game })}
          disabled={status === 'playing'}
          className={`p-1.5 text-xs font-medium rounded-lg transition-colors ${
            status !== 'playing'
              ? 'text-status-live hover:bg-status-live/10'
              : 'text-text-muted opacity-40 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== HEADER ========== */}
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
          {/* Reset Period Button */}
          <button
            onClick={() => setResetModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Periode
          </button>

          {/* Add Game Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-base font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg">
            <Plus className="w-4 h-4" />
            Tambah Game
          </button>
        </div>
      </div>

      {/* ========== SUMMARY CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Usulan */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Total Usulan</span>
            <span className="flex items-center gap-1 text-xs font-mono text-status-done bg-status-done/10 px-2 py-0.5 rounded">
              <TrendingUp className="w-3 h-3" />
              +4 minggu ini
            </span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 bg-bg-input rounded animate-shimmer" />
          ) : (
            <p className="text-2xl font-bold font-mono text-text-primary">
              {summaryStats.totalUsulan} Game
            </p>
          )}
        </div>

        {/* Card 2: Suara Terkumpul */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Suara Terkumpul</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-20 bg-bg-input rounded animate-shimmer" />
          ) : (
            <p className="text-2xl font-bold font-mono text-accent-cyan">
              {summaryStats.suaraTerkumpul.toLocaleString()}
            </p>
          )}
          {summaryStats.quorumPercent > 0 && (
            <p className="text-xs text-status-done mt-1">Quorum {summaryStats.quorumPercent}% tercapai</p>
          )}
        </div>

        {/* Card 3: Sedang Dimainkan */}
        <div className="bg-bg-card border border-accent-gold/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Sedang Dimainkan</span>
            {summaryStats.sedangDimainkan && (
              <span className="flex items-center gap-1 text-xs font-mono text-accent-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                Live Campaign
              </span>
            )}
          </div>
          {statsLoading ? (
            <div className="h-8 w-24 bg-bg-input rounded animate-shimmer" />
          ) : summaryStats.sedangDimainkan ? (
            <p className="text-lg font-semibold text-accent-gold truncate">
              {summaryStats.sedangDimainkan.title}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Tidak ada</p>
          )}
        </div>

        {/* Card 4: Menunggu Review */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Menunggu Review</span>
          </div>
          {statsLoading ? (
            <div className="h-8 w-12 bg-bg-input rounded animate-shimmer" />
          ) : (
            <p className="text-2xl font-bold font-mono text-status-requested">
              {summaryStats.menungguReview} Request
            </p>
          )}
          <p className="text-xs text-text-muted mt-1">Butuh moderasi</p>
        </div>
      </div>

      {/* ========== TABLE SECTION ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-text-muted" />
            <span className="text-xs font-mono text-text-muted">MODERATION QUEUE</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul game..."
                className="pl-9 pr-4 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none w-56"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>

            {/* Reload */}
            <button
              onClick={() => fetchGames(activeFilter)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-4 flex items-center gap-2 border-b border-border-subtle flex-wrap overflow-x-auto scrollbar-hide">
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
              {tab.label} ({tab.key === 'all' ? games.length : games.filter(g => g.status === tab.key).length})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-input">
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-16">RANK</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-16">COVER</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">JUDUL GAME</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-32">JUMLAH VOTE</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-28">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider w-32">DITAMBAH OLEH</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-text-muted uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {gamesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-4 py-4"><div className="h-5 w-8 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-12 w-12 bg-bg-input rounded-lg animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-48 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-16 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 bg-bg-input rounded-full animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-5 w-20 bg-bg-input rounded animate-shimmer" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-36 bg-bg-input rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                    Tidak ada game untuk ditampilkan
                  </td>
                </tr>
              ) : (
                filteredGames.map((game, index) => {
                  const rank = index + 1;
                  const medal = getRankMedal(rank);
                  const statusBadge = getStatusBadge(game.status);
                  const percentage = maxVotes > 0 ? Math.round(((game.voteCount || 0) / maxVotes) * 100) : 0;
                  const isPlaying = game.status === 'playing';
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr
                      key={game.id}
                      className={`
                        border-b border-border-subtle transition-colors
                        ${isPlaying ? 'bg-bg-input/50 border-l-2 border-l-accent-gold' : 'hover:bg-bg-input/30'}
                      `}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {medal ? (
                            <medal.icon className={`w-5 h-5 ${medal.color}`} />
                          ) : (
                            <Minus className="w-4 h-4 text-text-muted" />
                          )}
                          <span className="text-sm font-mono text-text-muted">
                            #{rank}
                          </span>
                        </div>
                      </td>

                      {/* Cover */}
                      <td className="px-4 py-4">
                        <div className="w-12 h-12 rounded-lg bg-bg-input flex items-center justify-center overflow-hidden">
                          {game.thumbnail || game.cover ? (
                            <img src={game.thumbnail || game.cover} alt={game.title} className="w-full h-full object-cover" />
                          ) : (
                            <Gamepad2 className="w-6 h-6 text-text-muted" />
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{game.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {game.category || game.genre} {game.publisher && `• ${game.publisher}`}
                          </p>
                        </div>
                      </td>

                      {/* Vote Count */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {game.voteCount || 0} <span className="text-text-muted font-normal">• {percentage}%</span>
                          </p>
                          <div className="mt-1.5 h-1 bg-bg-input rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Added By */}
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-text-secondary">{game.addedBy || 'Unknown'}</p>
                          {game.isOfficial && (
                            <p className="text-xs text-accent-cyan flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3" />
                              Admin Official
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        {getActionButtons(game)}
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
            Menampilkan {filteredGames.length} dari {games.length} game
          </p>
        </div>
      </div>

      {/* ========== INFO PERIODE BANNER ========== */}
      <div className="bg-bg-card border-l-4 border-l-accent-purple rounded-r-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Periode Voting {summaryStats.periodKey} • Sisa {summaryStats.daysRemaining} Hari
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Total {summaryStats.totalVotes.toLocaleString()} suara sudah masuk. Reset periode akan mengosongkan semua vote dan memulai periode baru.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary border border-border-subtle rounded-lg hover:bg-bg-input transition-colors">
            <Settings className="w-4 h-4" />
            Konfigurasi
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Ekspor Data
          </button>
        </div>
      </div>

      {/* ========== RESET PERIOD MODAL ========== */}
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
              <li>Game dengan status "Requested" akan tetap ada</li>
              <li>Game "Playing" dan "Done" akan berubah ke "Accepted"</li>
              <li>Periode baru akan dibuat secara otomatis</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ========== ACTION CONFIRMATION MODAL ========== */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, game: null, action: null })}
        title="Konfirmasi Ubah Status"
        confirmText="Konfirmasi"
        cancelText="Batal"
        onConfirm={() => {
          if (actionModal.game && actionModal.action) {
            const statusMap = {
              accept: 'accepted',
              playing: 'playing',
              done: 'done',
            };
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
          <div className="bg-bg-input rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Aksi yang akan dilakukan:</p>
            <p className={`text-sm font-medium flex items-center gap-2 ${
              actionModal.action === 'accept' ? 'text-accent-cyan' :
              actionModal.action === 'playing' ? 'text-accent-gold' :
              'text-status-done'
            }`}>
              {actionModal.action === 'accept' && <><Check className="w-4 h-4" /> Accept — Game akan menjadi kandidat tayang</>}
              {actionModal.action === 'playing' && <><Play className="w-4 h-4" /> Set Playing — Game sedang ditayangkan</>}
              {actionModal.action === 'done' && <><CheckCircle className="w-4 h-4" /> Mark Done — Game sudah selesai ditayangkan</>}
            </p>
          </div>
        </div>
      </Modal>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
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
            Apakah kamu yakin ingin menghapus game <span className="text-text-primary font-semibold">"{deleteModal.game?.title}"</span>?
          </p>
          <p className="text-xs text-text-muted">
            Game yang dihapus tidak bisa dikembalikan. Vote untuk game ini juga akan ikut dihapus.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default VotingModerationPage;
