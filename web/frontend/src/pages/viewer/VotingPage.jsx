import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getGames, voteGame, requestGame } from '../../services/gameService';
import { getFingerprint, hasVoted, markVoted, getCurrentPeriodKey } from '../../utils/fingerprint';
import { useVotes } from '../../hooks/useFirebase';
import GameCard, { GameCardSkeleton } from '../../components/viewer/GameCard';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import TopNav from '../../components/viewer/TopNav';
import Footer from '../../components/viewer/Footer';

// ========== ICONS (CLEAN VECTOR SVGS - ZERO EMOJIS / ZERO AI SLOP) ==========
const SearchIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlusIcon = ({ className = '' }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrophyIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const ShareIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const GamepadIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h4" />
    <path d="M8 10v4" />
    <circle cx="15.5" cy="11.5" r=".75" fill="currentColor" />
    <circle cx="17.5" cy="13.5" r=".75" fill="currentColor" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

// ========== AMBIENT BACKGROUND (CALM & PROFESSIONAL - ZERO DIZZYING NEON PARTICLES) ==========
const AmbientBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[#7ee0d2]/[0.02] blur-[140px]" />
    <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-[#c084fc]/[0.02] blur-[140px]" />
  </div>
);

// ========== QUICK VOTE CARD COMPONENT ==========
const QuickVoteCard = ({ game, rank, onVote, hasVoted, voting }) => {
  const isPlaying = game.status === 'playing';
  const isDone = game.status === 'done';

  return (
    <div className={`
      group relative bg-[#141126] hover:bg-[#1a1633] rounded-xl p-4 
      border border-white/10 hover:border-[#7ee0d2]/30
      transition-all duration-200 flex flex-col justify-between gap-3
      ${hasVoted ? 'opacity-85' : ''}
      ${voting ? 'scale-[0.99]' : ''}
    `}>
      <div className="flex items-center gap-3">
        {/* Cover / Icon Thumbnail */}
        <div className="relative w-12 h-12 rounded-lg bg-[#1f1b3a] border border-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
          {game.cover_url ? (
            <img 
              src={game.cover_url} 
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <GamepadIcon className="w-5 h-5 text-[#8E8AAB]" />
          )}
          {rank && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-black/75 text-[#7ee0d2]">
              #{rank}
            </span>
          )}
        </div>

        {/* Game Title & Genre */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#7ee0d2] transition-colors">
            {game.title}
          </h4>
          <p className="text-xs text-[#8E8AAB] truncate">{game.genre || 'Game'}</p>
        </div>

        {/* Vote Count & Action Button */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold font-mono text-[#7ee0d2]">
              {game.votes || 0}
            </span>
            <span className="text-[10px] text-[#8E8AAB]">suara</span>
          </div>
          <button
            type="button"
            onClick={() => !hasVoted && !voting && !isPlaying && !isDone && onVote(game)}
            disabled={hasVoted || voting || isPlaying || isDone}
            className={`
              px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150
              ${hasVoted 
                ? 'bg-white/10 text-[#7ee0d2] border border-[#7ee0d2]/30 cursor-default'
                : isPlaying
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-default text-[10px]'
                : isDone
                ? 'bg-white/5 text-[#8E8AAB] border border-white/10 cursor-default text-[10px]'
                : 'bg-[#7ee0d2] text-[#0a0718] font-semibold hover:bg-[#7ee0d2]/90 active:scale-95 shadow-sm'
              }
            `}
          >
            {voting ? '...' : hasVoted ? 'Sudah Vote' : isPlaying ? 'Playing' : isDone ? 'Selesai' : 'Vote'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#7ee0d2] to-[#c084fc] rounded-full transition-all duration-500"
          style={{ width: `${Math.min(game.percentage || 0, 100)}%` }}
        />
      </div>
    </div>
  );
};

// ========== MAIN VOTING PAGE ==========
function VotingPage() {
  const toast = useToast();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodKey, setPeriodKey] = useState(getCurrentPeriodKey());
  const [totalVotesGlobal, setTotalVotesGlobal] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationGame, setCelebrationGame] = useState(null);

  const { votes: firebaseVotes, period: firebasePeriod, totalVotes: firebaseTotal } = useVotes();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sortBy, setSortBy] = useState('votes');
  const [votingGameId, setVotingGameId] = useState(null);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', genre: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Refs
  const searchRef = useRef(null);
  const quickVoteRef = useRef(null);

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGames();

      if (response.success) {
        const gamesData = response.data?.data || response.data || [];
        const metaData = response.data?.meta || {};

        setGames(gamesData);

        if (metaData.period_key) {
          setPeriodKey(metaData.period_key);
        }

        // Calculate total votes from games list
        const total = gamesData.reduce((sum, g) => sum + (g.vote_count || 0), 0);
        setTotalVotesGlobal(total);
      } else {
        throw new Error(response.message || 'Gagal mengambil data');
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      setGames([]);
      setError('Data tidak tersedia');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (firebasePeriod) {
      setPeriodKey(firebasePeriod);
    }
  }, [firebasePeriod]);

  useEffect(() => {
    if (firebaseTotal) {
      setTotalVotesGlobal(firebaseTotal);
    }
  }, [firebaseTotal]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Top 3 games for quick voting (only active non-done games)
  const topGames = useMemo(() => {
    return [...gamesWithVotes]
      .filter((g) => g.status !== 'done')
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3);
  }, [gamesWithVotes]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return gamesWithVotes
      .filter(
        (g) =>
          g.title?.toLowerCase().includes(query) ||
          g.genre?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, gamesWithVotes]);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = [...gamesWithVotes];

    if (filter !== 'all') {
      result = result.filter((game) => game.status === filter);
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
  const handleVote = useCallback((game) => {
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
        setCelebrationGame(game);
        setShowCelebration(true);
        toast.success(`Terima kasih! Vote untuk "${game.title}" sudah tercatat.`);
        
        setTimeout(() => setShowCelebration(false), 2400);
        fetchGames();
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
  }, [confirmData, periodKey, toast, fetchGames]);

  // Handle game request
  const handleSubmitRequest = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

  // Handle share
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'X-VOCA Voting Game',
        text: 'Vote game favoritmu di X-VOCA!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link voting berhasil disalin!');
    }
  }, [toast]);

  // Format period key to display name
  const formatPeriodName = (key) => {
    if (!key) return 'Memuat...';
    const [year, month] = key.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex] || ''} ${year || ''}`.trim() || key;
  };

  // Filter tabs configuration (clean, cohesive palette)
  const filterTabs = [
    { key: 'all', label: 'Semua Status' },
    { key: 'requested', label: 'Request' },
    { key: 'accepted', label: 'Diterima' },
    { key: 'playing', label: 'Sedang Dimainkan', highlight: true },
    { key: 'done', label: 'Selesai' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0B1A] relative overflow-x-hidden text-white">
      {/* Calm Ambient Background */}
      <AmbientBackground />

      {/* Clean Celebration Modal Badge */}
      {showCelebration && celebrationGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="absolute inset-0 bg-[#0d0b1a]/60 backdrop-blur-xs" />
          <div className="relative bg-[#151226] border border-[#7ee0d2]/40 rounded-2xl p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)] max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#7ee0d2]/15 border border-[#7ee0d2]/40 flex items-center justify-center mx-auto mb-3 text-[#7ee0d2]">
              <CheckCircleIcon className="w-7 h-7" />
            </div>
            <p className="text-white font-bold text-base mb-1">Vote Berhasil Dikirim!</p>
            <p className="text-[#7ee0d2] font-semibold text-sm truncate">{celebrationGame.title}</p>
            <p className="text-xs text-[#8e8aab] mt-1">Terima kasih atas partisipasi kamu</p>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopNav />

      {/* ========== HEADER ========== */}
      <header className="relative bg-gradient-to-b from-[#141126] to-[#0D0B1A] pt-24 pb-8 px-4 sm:px-6 lg:px-12 z-10 border-b border-white/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Clean Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                <span className="text-[#7ee0d2] text-[11px] font-semibold tracking-wider uppercase">Voting Game Komunitas</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-sans tracking-tight">
                Pilih Game{' '}
                <span className="bg-gradient-to-r from-[#7ee0d2] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
                  Selanjutnya
                </span>
              </h1>
              <p className="text-[#A09BB8] text-sm max-w-xl leading-relaxed">
                Tentukan game yang akan dimainkan di sesi live streaming berikutnya. Setiap suara kamu berkontribusi langsung pada konten siaran.
              </p>
            </div>

            {/* Period Info Card - Sleek Dark Theme */}
            <div className="bg-[#141126] border border-white/10 rounded-xl p-4 min-w-[260px] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#8E8AAB] uppercase tracking-wider">Periode Aktif</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                  <span className="text-[#7ee0d2] text-[10px] font-semibold">Berjalan</span>
                </div>
              </div>
              
              <div className="text-base font-bold text-white mb-2">
                {formatPeriodName(periodKey)}
              </div>
              
              <div className="pt-2.5 border-t border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#7ee0d2] font-mono">
                    {totalVotesGlobal.toLocaleString()}
                  </span>
                  <span className="text-[#8E8AAB] text-xs">Total Suara</span>
                </div>
              </div>

              {/* Status Mini Badges */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-center p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-xs font-bold text-amber-300 font-mono">{statusCounts.playing || 0}</div>
                  <div className="text-[9px] text-[#8E8AAB] uppercase">Playing</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-xs font-bold text-[#7ee0d2] font-mono">{statusCounts.accepted || 0}</div>
                  <div className="text-[9px] text-[#8E8AAB] uppercase">Accepted</div>
                </div>
                <div className="text-center p-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-xs font-bold text-[#c084fc] font-mono">{statusCounts.requested || 0}</div>
                  <div className="text-[9px] text-[#8E8AAB] uppercase">Requested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== QUICK VOTE SECTION ========== */}
      <section ref={quickVoteRef} className="px-4 sm:px-6 lg:px-12 py-6 bg-[#110e22] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrophyIcon className="text-[#7ee0d2]" />
              <h2 className="text-sm font-bold text-white">Quick Vote</h2>
              <span className="text-[10px] text-[#8E8AAB] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-medium">Top 3</span>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-[#8E8AAB] hover:text-[#7ee0d2] transition-colors"
            >
              <ShareIcon />
              <span>Bagikan</span>
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#141126] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topGames.map((game, index) => (
                <QuickVoteCard
                  key={game.id}
                  rank={index + 1}
                  game={game}
                  onVote={handleVote}
                  hasVoted={hasVoted(game.id, periodKey)}
                  voting={votingGameId === game.id}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 px-4 rounded-xl bg-[#141126] border border-white/5 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-[#8E8AAB]">
                Belum ada game aktif dalam nominasi voting cepat saat ini. Kamu dapat mengajukan usulan game baru melalui tombol Request Game di bawah.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========== QUICK REQUEST SECTION (REPLACED AI SLOP LOGO WITH CLEAN GAMEPAD) ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-5 relative overflow-hidden bg-gradient-to-r from-[#17142d] via-[#141226] to-[#121024] border-b border-white/5">
        <div className="max-w-[1280px] mx-auto relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-3.5">
              {/* Icon box - Gamepad Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 text-[#7ee0d2]">
                  <GamepadIcon className="w-5 h-5" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7ee0d2] border-2 border-[#0D0B1A]" />
              </div>

              {/* Text group */}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Ajukan Usulan Game Baru</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-[#7ee0d2] bg-[#7ee0d2]/10 border border-[#7ee0d2]/20">
                    Buka
                  </span>
                </div>
                <p className="text-xs text-[#8E8AAB] leading-relaxed max-w-lg">
                  Tidak menemukan game favoritmu? Kirim usulan game dan biarkan komunitas memberikan suara untuk sesi stream berikutnya.
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-[#0a0718] bg-[#7ee0d2] hover:bg-[#7ee0d2]/90 transition-all duration-200 shadow-sm active:scale-95"
            >
              <PlusIcon />
              <span>Request Game</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========== FILTER SECTION (CLEAN PILL TABS) ========== */}
      <section className="bg-[#121024]/95 border-b border-white/5 px-4 sm:px-6 lg:px-12 py-3 sticky top-[60px] z-20 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {filterTabs.map((tab) => {
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`
                      px-3.5 py-1.5 rounded-lg text-xs transition-all duration-200 whitespace-nowrap flex items-center gap-1.5
                      ${isActive
                        ? 'bg-[#7ee0d2]/15 text-[#7ee0d2] border border-[#7ee0d2]/40 font-semibold shadow-xs'
                        : 'bg-white/[0.03] text-[#8e8aab] hover:text-white hover:bg-white/[0.06] border border-white/5'
                      }
                    `}
                  >
                    {tab.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-[#7ee0d2]/80' : 'text-[#8e8aab]/60'}`}>
                      ({statusCounts[tab.key] || 0})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-wrap gap-2">
              {/* Search with autocomplete */}
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Cari judul game..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full lg:w-56 pl-9 pr-3 py-2 bg-[#141126] border border-white/10 rounded-xl text-xs text-white placeholder-[#8E8AAB]/60 focus:border-[#7ee0d2]/50 focus:outline-none transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8AAB]">
                  <SearchIcon />
                </div>
                
                {/* Search Suggestions Dropdown */}
                {showSearchResults && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#141126] border border-white/10 rounded-xl overflow-hidden shadow-xl z-30 divide-y divide-white/5">
                    {searchSuggestions.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => {
                          setSearchQuery(game.title);
                          setShowSearchResults(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-white/[0.04] transition-colors flex items-center gap-2.5"
                      >
                        <GamepadIcon className="w-4 h-4 text-[#8E8AAB] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate font-medium">{game.title}</p>
                          <p className="text-[10px] text-[#8E8AAB]">{game.genre || 'Game'}</p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-[#7ee0d2]">{game.votes} suara</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 bg-[#141126] border border-white/10 rounded-xl text-xs text-white focus:border-[#7ee0d2]/50 focus:outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238E8AAB'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '12px',
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
      <section className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-[#141126] border border-white/10 rounded-xl p-8 text-center">
              <p className="text-[#8E8AAB]">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredGames.length === 0 && (
            <div className="bg-[#141126] border border-white/10 rounded-xl p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#7ee0d2]">
                <GamepadIcon className="w-6 h-6" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">
                {searchQuery ? 'Game tidak ditemukan' : 'Belum ada game untuk voting'}
              </p>
              <p className="text-[#8E8AAB] text-xs">
                {searchQuery ? 'Coba gunakan kata kunci lain atau reset filter' : 'Kamu bisa mengajukan request game baru di atas'}
              </p>
            </div>
          )}

          {/* Games Grid */}
          {!loading && !error && filteredGames.length > 0 && (
            <>
              {/* Info Bar */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[#8E8AAB] text-xs">
                  Menampilkan <span className="text-white font-medium">{filteredGames.length}</span> dari {games.length} game
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#8E8AAB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                  <span>Real-time sync aktif</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="transform transition-all duration-200"
                  >
                    <GameCard
                      game={game}
                      votes={game.votes}
                      totalVotes={firebaseTotal || totalVotesGlobal}
                      percentage={game.percentage}
                      hasVoted={hasVoted(game.id, periodKey)}
                      onVote={handleVote}
                      voting={votingGameId === game.id}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />

      {/* ========== CONFIRM VOTE MODAL ========== */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setConfirmData(null); }}
        title="Konfirmasi Pilihan Suara"
        confirmText="Ya, Beri Suara"
        variant="success"
        onConfirm={confirmVote}
      >
        <p className="text-[#8E8AAB] text-sm leading-relaxed">
          Kamu akan memberikan 1 suara untuk <span className="text-white font-semibold">"{confirmData?.title}"</span>.
          Pilihan suara kamu tidak dapat diubah setelah dikonfirmasi.
        </p>
      </Modal>

      {/* ========== REQUEST SUCCESS MODAL ========== */}
      <Modal
        isOpen={showRequestSuccessModal}
        onClose={() => setShowRequestSuccessModal(false)}
        title="Request Berhasil Dikirim"
        confirmText="Tutup"
        variant="success"
        onConfirm={() => setShowRequestSuccessModal(false)}
        showClose={false}
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-[#7ee0d2]/15 border border-[#7ee0d2]/30 flex items-center justify-center mx-auto mb-3 text-[#7ee0d2]">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <p className="text-white font-semibold text-sm mb-1">Terima Kasih atas Usulanmu!</p>
          <p className="text-[#8E8AAB] text-xs leading-relaxed max-w-xs mx-auto">
            Usulan game kamu telah tercatat dan akan ditinjau oleh Creator sebelum dibuka untuk voting komunitas.
          </p>
        </div>
      </Modal>

      {/* ========== REQUEST GAME MODAL ========== */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Ajukan Usulan Game Baru"
        confirmText="Kirim Usulan"
        variant="default"
        onConfirm={handleSubmitRequest}
        loading={submittingRequest}
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#8E8AAB] leading-relaxed">
            Usulan game akan diverifikasi oleh Creator sebelum tampil di daftar voting publik.
          </div>

          {/* Game Title Input */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              Judul Game <span className="text-[#7ee0d2]">*</span>
            </label>
            <input
              type="text"
              value={requestForm.title}
              onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Resident Evil 4, Hollow Knight, Elden Ring..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[#8E8AAB]/50 bg-[#141126] border border-white/10 focus:border-[#7ee0d2]/60 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              Genre <span className="text-[#8E8AAB] font-normal">(opsional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Action', 'Adventure', 'RPG', 'Horror', 'Survival', 'Simulation', 'Indie', 'Lainnya'].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setRequestForm((p) => ({ ...p, genre: p.genre === genre ? '' : genre }))}
                  className={`
                    px-3 py-1 rounded-lg text-xs transition-all duration-150
                    ${requestForm.genre === genre
                      ? 'bg-[#7ee0d2] text-[#0a0718] font-semibold shadow-xs'
                      : 'bg-white/5 text-[#8E8AAB] hover:text-white border border-white/5'
                    }
                  `}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VotingPage;
