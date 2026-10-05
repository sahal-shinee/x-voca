import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getGames, voteGame, requestGame } from '../../services/gameService';
import { getFingerprint, hasVoted, markVoted, getCurrentPeriodKey } from '../../utils/fingerprint';
import { useVotes } from '../../hooks/useFirebase';
import GameCard, { GameCardSkeleton } from '../../components/viewer/GameCard';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

// ========== ICONS ==========

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="currentColor"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom hook for scroll reveal
const useScrollReveal = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.unobserve(entry.target);
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [ref, isVisible];
};

/**
 * VotingPage - Enhanced Game Voting Page
 * Based on Figma Design - Game Voting with modern, interactive UI
 */
function VotingPage() {
  const toast = useToast();

  // Game data state
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodKey, setPeriodKey] = useState(getCurrentPeriodKey());
  const [totalVotesGlobal, setTotalVotesGlobal] = useState(0);

  // Firebase real-time vote data
  const { votes: firebaseVotes, period: firebasePeriod, totalVotes: firebaseTotal, loading: fbLoading } = useVotes();

  // UI state
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [votingGameId, setVotingGameId] = useState(null);

  // Request form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', genre: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Refs for scroll reveal
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const gridRef = useRef(null);
  const ctaRef = useRef(null);

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGames();

      if (response.success) {
        setGames(response.data?.games || []);
        if (response.data?.meta?.period_key) {
          setPeriodKey(response.data.meta.period_key);
        }
        if (response.data?.meta?.total_votes) {
          setTotalVotesGlobal(response.data.meta.total_votes);
        }
      } else {
        setError(response.message || 'Gagal memuat data game');
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Gagal memuat data game. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Update period from Firebase if available
  useEffect(() => {
    if (firebasePeriod) {
      setPeriodKey(firebasePeriod);
    }
  }, [firebasePeriod]);

  // Update total votes from Firebase
  useEffect(() => {
    if (firebaseTotal) {
      setTotalVotesGlobal(firebaseTotal);
    }
  }, [firebaseTotal]);

  // Merge API votes with Firebase real-time data
  const gamesWithVotes = useMemo(() => {
    return games.map((game) => {
      const firebaseVote = firebaseVotes?.[game.id];
      const firebaseVoteCount = firebaseVote?.voteCount;
      const voteCount = firebaseVoteCount !== undefined ? firebaseVoteCount : game.vote_count || 0;
      const total = firebaseTotal || totalVotesGlobal || 1;
      const percentage = total > 0 ? (voteCount / total) * 100 : 0;

      return {
        ...game,
        votes: voteCount,
        percentage,
      };
    });
  }, [games, firebaseVotes, firebaseTotal, totalVotesGlobal]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = [...gamesWithVotes];

    if (filter !== 'all') {
      const statusMap = {
        requested: 'requested',
        accepted: 'accepted',
        playing: 'playing',
        done: 'done',
      };
      result = result.filter((game) => game.status === statusMap[filter]);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (game) =>
          game.title?.toLowerCase().includes(query) ||
          game.genre?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'votes':
        result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'percentage':
        result.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        break;
    }

    return result;
  }, [gamesWithVotes, filter, searchQuery, sortBy]);

  // Count games by status
  const statusCounts = useMemo(() => {
    const counts = { all: games.length, requested: 0, accepted: 0, playing: 0, done: 0 };
    games.forEach((game) => {
      const status = game.status || 'requested';
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [games]);

  // Handle vote
  const handleVote = useCallback(async (game) => {
    if (hasVoted(game.id, periodKey)) {
      toast.error('Kamu sudah vote game ini');
      return;
    }
    setConfirmData(game);
    setShowConfirmModal(true);
  }, [periodKey, toast]);

  // Confirm vote after modal
  const confirmVote = useCallback(async () => {
    if (!confirmData) return;
    const game = confirmData;
    setShowConfirmModal(false);

    try {
      const fingerprint = await getFingerprint();
      setVotingGameId(game.id);
      const response = await voteGame(game.id, fingerprint);

      if (response.success) {
        markVoted(game.id, periodKey);
        toast.success(`Terima kasih! Vote untuk "${game.title}" sudah tercatat.`);
      } else if (response.alreadyVoted) {
        markVoted(game.id, periodKey);
        toast.error('Kamu sudah vote game ini');
      } else {
        toast.error(response.message || 'Gagal mengirim vote');
      }
    } catch (err) {
      console.error('Vote error:', err);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setVotingGameId(null);
      setConfirmData(null);
    }
  }, [confirmData, periodKey, toast]);

  // Handle game request
  const handleSubmitRequest = useCallback(async (e) => {
    e.preventDefault();
    if (!requestForm.title.trim()) {
      toast.error('Judul game harus diisi');
      return;
    }

    try {
      setSubmittingRequest(true);
      const fingerprint = await getFingerprint();
      const resp = await requestGame({
        title: requestForm.title.trim(),
        genre: requestForm.genre,
        fingerprint,
      });

      if (resp.success) {
        setShowRequestModal(false);
        setShowRequestSuccessModal(true);
        setRequestForm({ title: '', genre: '' });
        fetchGames();
      } else {
        toast.error(resp.message || 'Gagal mengirim request');
      }
    } catch (err) {
      console.error('Request error:', err);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmittingRequest(false);
    }
  }, [requestForm, toast, fetchGames]);

  // Format period key to display name
  const formatPeriodName = (key) => {
    if (!key) return 'Loading...';
    const [year, month] = key.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  // Filter tabs configuration
  const filterTabs = [
    { key: 'all', label: 'Semua', color: '#7ee0d2' },
    { key: 'requested', label: 'Requested', color: '#c084fc' },
    { key: 'accepted', label: 'Accepted', color: '#a78bfa' },
    { key: 'playing', label: '● Playing', color: '#fbbf24', highlight: true },
    { key: 'done', label: 'Done', color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0a22]">
      {/* ========== HEADER ========== */}
      <header
        ref={headerRef}
        className="relative bg-[#151028] pt-6 pb-8 px-4 sm:px-6 lg:px-12"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#fbbf24] opacity-[0.05] blur-[100px]" />
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-[#c084fc] opacity-[0.05] blur-[80px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#7ee0d2] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-[#0f0a22] font-bold text-lg">✦</span>
              </div>
              <span className="font-bold text-white text-lg font-display">X-VOCA</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-[#a89ec0] hover:text-white text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/voting" className="text-[#fbbf24] text-sm font-semibold border-b-2 border-[#fbbf24] pb-0.5">
                Voting
              </Link>
              <Link to="/content" className="text-[#a89ec0] hover:text-white text-sm font-medium transition-colors">
                Content Guide
              </Link>
            </div>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)] mb-4">
                <span className="text-[#fbbf24]">✦</span>
                <span className="text-[#fbbf24] text-xs font-bold tracking-wider uppercase">Game Voting</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-display tracking-tight">
                Cosmic Democracy & Telemetry
              </h1>
              <p className="text-[#a89ec0] max-w-xl">
                Pilih game yang ingin kamu tonton. Suara kamu menentukan live dan playthrough berikutnya.
              </p>
            </div>

            {/* Period Info Card - Figma Design */}
            <div className="bg-[#1d1830] border border-[rgba(61,53,96,0.5)] rounded-xl px-5 py-4 min-w-[280px] lg:self-start">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-[#a89ec0] uppercase tracking-wider">Periode:</span>
                <span className="text-sm font-mono text-white font-semibold">
                  {formatPeriodName(periodKey)}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#7ee0d2] animate-pulse" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono text-[#5c5480]">
                  ↺ Reset berkala oleh Creator
                </span>
              </div>
              <div className="pt-3 border-t border-[rgba(61,53,96,0.5)]">
                <span className="text-[#7ee0d2] font-bold text-lg font-mono">
                  {totalVotesGlobal.toLocaleString()}
                </span>
                <span className="text-[#5c5480] text-xs ml-1">Suara Terkumpul</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== FILTER SECTION ========== */}
      <section
        ref={filterRef}
        className="bg-[#151028] border-b border-[#2a2645] px-4 sm:px-6 lg:px-12 py-4"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${filter === tab.key
                      ? 'font-bold shadow-lg'
                      : 'hover:bg-[#1a1730]'
                    }
                  `}
                  style={{
                    backgroundColor: filter === tab.key ? tab.color : 'transparent',
                    color: filter === tab.key ? '#0f0a22' : '#a89ec0',
                    boxShadow: filter === tab.key ? `0 4px 15px ${tab.color}40` : 'none',
                  }}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-60">({statusCounts[tab.key] || 0})</span>
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari judul game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 pl-10 pr-4 py-2.5 bg-[#1a1730] border border-[#2a2645] rounded-xl text-sm text-white placeholder-[#5c5480] focus:border-[#7ee0d2] focus:outline-none transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5480]">
                  <SearchIcon />
                </div>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-[#1a1730] border border-[#2a2645] rounded-xl text-sm text-white focus:border-[#7ee0d2] focus:outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239B97C0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px',
                }}
              >
                <option value="votes">Suara Terbanyak</option>
                <option value="percentage">Persentase Tertinggi</option>
                <option value="title">Nama A-Z</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ========== GAME GRID ========== */}
      <section
        ref={gridRef}
        className="px-4 sm:px-6 lg:px-12 py-8 lg:py-12"
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-[#1a1730] border border-[#ef4444]/40 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#ef4444] text-xl">✕</span>
              </div>
              <p className="text-white font-semibold mb-2">{error}</p>
              <button onClick={fetchGames} className="mt-4 px-6 py-2 bg-[#7ee0d2] text-[#0f0a22] font-bold rounded-lg hover:bg-[#7ee0d2]/90 transition-colors">
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredGames.length === 0 && (
            <div className="bg-[#1a1730] border border-[#2a2645] rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2645] flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎮</span>
              </div>
              <p className="text-white font-semibold mb-2">
                {searchQuery ? 'Game tidak ditemukan' : 'Belum ada game untuk voting'}
              </p>
              <p className="text-[#5c5480] text-sm">
                {searchQuery ? 'Coba kata kunci lain atau hapus filter' : 'Request game baru atau tunggu Creator menambahkan game'}
              </p>
            </div>
          )}

          {/* Games Grid */}
          {!loading && !error && filteredGames.length > 0 && (
            <>
              {/* Real-time indicator */}
              {fbLoading && (
                <div className="mb-4 flex items-center gap-2 text-xs text-[#5c5480]">
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sinkronisasi data real-time...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    votes={game.votes}
                    totalVotes={firebaseTotal || totalVotesGlobal}
                    percentage={game.percentage}
                    hasVoted={hasVoted(game.id, periodKey)}
                    onVote={handleVote}
                    voting={votingGameId === game.id}
                  />
                ))}
              </div>

              {/* Show more hint */}
              <div className="mt-8 text-center">
                <p className="text-[#5c5480] text-sm">
                  Menampilkan {filteredGames.length} dari {games.length} game
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ========== REQUEST GAME SECTION ========== */}
      <section
        ref={ctaRef}
        className="px-4 sm:px-6 lg:px-12 pb-12"
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Request Game Card - Figma Design */}
          <div className="bg-[#231f42] border border-[rgba(61,53,96,0.7)] rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: Icon + Content */}
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-[#2d2855] border border-[rgba(61,53,96,0.8)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c084fc] text-lg">✦</span>
                </div>

                {/* Text Content */}
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 font-display">
                    Request Game Baru
                  </h2>
                  <p className="text-[#a89ec0] text-sm max-w-lg leading-relaxed">
                    Tidak menemukan game favoritmu? Request game baru dan biarkan komunitas vote untuk game tersebut.
                  </p>
                </div>
              </div>

              {/* Right: Request Button */}
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fbbf24] text-[#0f0a22] font-bold text-sm rounded-xl hover:bg-[#fbbf24]/90 transition-all shadow-lg self-start"
                style={{
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.25)',
                }}
              >
                <span className="text-lg font-bold">+</span>
                Request Game
              </button>
            </div>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-[rgba(61,53,96,0.6)]">
              <p className="text-xs text-[#a89ec0] flex items-center gap-2">
                <span className="text-[#7ee0d2] text-sm">✦</span>
                Maksimum 1 request per pemirsa per sesi mingguan
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-[#a89ec0] flex items-center gap-2">
              <span className="text-[#c084fc] text-sm">✦</span>
              Request akan masuk ke antrean moderasi sebelum ditampilkan ke voting
            </p>
            <p className="text-xs text-[#a89ec0] flex items-center gap-2">
              <span className="text-[#c084fc] text-sm">✦</span>
              Game yang sudah ada di voting tidak bisa di-request ulang
            </p>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#0a0616] border-t border-[#2a2645] py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-[#5c5480] hover:text-[#7ee0d2] transition-colors text-sm flex items-center gap-2">
              ← Kembali ke Beranda
            </Link>
            <p className="text-[#5c5480] text-xs font-mono">
              © 2025 X-VOCA PROJECT. ALL BROADCAST RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>

      {/* ========== CONFIRM VOTE MODAL ========== */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setConfirmData(null); }}
        title="Konfirmasi Vote"
        confirmText="Ya, Vote Sekarang"
        variant="success"
        onConfirm={confirmVote}
      >
        <p className="text-[#a89ec0]">
          Kamu akan memberikan vote untuk game <span className="text-white font-semibold">"{confirmData?.title}"</span>.
          Vote tidak bisa dibatalkan setelah dikirim.
        </p>
      </Modal>

      {/* ========== REQUEST SUCCESS MODAL ========== */}
      <Modal
        isOpen={showRequestSuccessModal}
        onClose={() => setShowRequestSuccessModal(false)}
        title="Request Terkirim!"
        confirmText="Selesai"
        variant="success"
        onConfirm={() => setShowRequestSuccessModal(false)}
        showClose={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#7ee0d2]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#7ee0d2] text-3xl">✓</span>
          </div>
          <p className="text-[#a89ec0]">
            Request game kamu sudah tercatat. Game akan muncul di voting setelah dimoderasi oleh Creator.
          </p>
        </div>
      </Modal>

      {/* ========== REQUEST GAME MODAL ========== */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Game Baru"
        confirmText="Kirim Request"
        variant="default"
        onConfirm={handleSubmitRequest}
        loading={submittingRequest}
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#a89ec0] uppercase tracking-wider mb-2">Judul Game *</label>
            <input
              type="text"
              value={requestForm.title}
              onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Nama game yang ingin kamu request..."
              className="w-full px-4 py-3 bg-[#1a1730] border border-[#2a2645] rounded-xl text-white placeholder-[#5c5480] focus:border-[#7ee0d2] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#a89ec0] uppercase tracking-wider mb-2">Genre / Kategori (Opsional)</label>
            <select
              value={requestForm.genre}
              onChange={(e) => setRequestForm((p) => ({ ...p, genre: e.target.value }))}
              className="w-full px-4 py-3 bg-[#1a1730] border border-[#2a2645] rounded-xl text-white focus:border-[#7ee0d2] focus:outline-none cursor-pointer"
            >
              <option value="">Pilih Kategori...</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="RPG">RPG</option>
              <option value="Horror">Horror</option>
              <option value="Survival">Survival</option>
              <option value="Simulation">Simulation</option>
              <option value="Indie">Indie</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>
          <p className="text-xs text-[#5c5480] pt-2 flex items-center gap-2">
            <span className="text-[#7ee0d2]">✦</span>
            Request akan ditinjau oleh Creator sebelum ditampilkan ke voting publik.
          </p>
        </form>
      </Modal>
    </div>
  );
}

export default VotingPage;
