import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getGames, voteGame, requestGame } from '../../services/gameService';
import { getFingerprint, hasVoted, markVoted, getCurrentPeriodKey } from '../../utils/fingerprint';
import { useVotes } from '../../hooks/useFirebase';
import GameCard, { GameCardSkeleton } from '../../components/viewer/GameCard';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import TopNav from '../../components/viewer/TopNav';
import Footer from '../../components/viewer/Footer';

// ========== ICONS ==========
const SearchIcon = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const RefreshIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const PlusIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SparkleIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
  </svg>
);

const FireIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const TrophyIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const ChevronUpIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ArrowRightIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ShareIcon = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

// ========== PARTICLE BACKGROUND ==========
const ParticleBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
      isCyan: Math.random() > 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isCyan ? '#2DFFC2' : '#9B6DFF',
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// ========== QUICK VOTE CARD COMPONENT ==========
const QuickVoteCard = ({ game, onVote, hasVoted, voting }) => {
  const statusColors = {
    playing: { border: 'border-amber-500', badge: 'bg-amber-500', text: 'text-amber-400' },
    accepted: { border: 'border-purple-500', badge: 'bg-purple-500', text: 'text-purple-400' },
    requested: { border: 'border-cyan-500', badge: 'bg-cyan-500', text: 'text-cyan-400' },
    done: { border: 'border-gray-500', badge: 'bg-gray-500', text: 'text-gray-400' },
  };
  const colors = statusColors[game.status] || statusColors.requested;

  return (
    <div className={`
      group relative bg-[#1A1730] rounded-xl p-4 
      border ${colors.border} border-opacity-50
      hover:bg-[#201D3A] transition-all duration-200 cursor-pointer
      ${hasVoted ? 'opacity-70' : ''}
      ${voting ? 'scale-95' : ''}
    `}>
      <div className="flex items-center gap-3">
        {/* Game Icon */}
        <div className="w-10 h-10 rounded-lg bg-[#2A2645] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎮</span>
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#2DFFC2] transition-colors">
            {game.title}
          </h4>
          <p className="text-xs text-[#5C5878]">{game.genre}</p>
        </div>

        {/* Vote Count & Button */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold font-mono text-[#2DFFC2]">
            {game.votes}
          </span>
          <button
            onClick={() => !hasVoted && !voting && onVote(game)}
            disabled={hasVoted || voting}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
              ${hasVoted 
                ? 'bg-[#2DFFC2]/20 text-[#2DFFC2] cursor-default'
                : 'bg-[#2DFFC2] text-[#0D0B1A] hover:bg-[#2DFFC2]/90 hover:shadow-lg hover:shadow-[#2DFFC2]/20'
              }
            `}
          >
            {voting ? '...' : hasVoted ? 'Voted' : 'Vote'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-1 bg-[#2A2645] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#2DFFC2] to-[#9B6DFF] rounded-full transition-all duration-500"
          style={{ width: `${Math.min(game.percentage, 100)}%` }}
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

        // Hitung total votes dari games
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

  // Top 3 games for quick voting
  const topGames = useMemo(() => {
    return [...gamesWithVotes]
      .filter(g => g.status !== 'done')
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3);
  }, [gamesWithVotes]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return gamesWithVotes
      .filter(g => 
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
        
        setTimeout(() => setShowCelebration(false), 2000);
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
        setRequestForm({ title: '', genre: '', notes: '' });
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
        title: 'X-VOCA Voting',
        text: 'Vote game favoritmu di X-VOCA!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link voting berhasil disalin!');
    }
  }, [toast]);

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
    { key: 'all', label: 'Semua', color: '#2DFFC2' },
    { key: 'requested', label: 'Requested', color: '#C084FC' },
    { key: 'accepted', label: 'Accepted', color: '#9B6DFF' },
    { key: 'playing', label: 'Playing', color: '#F5A623', highlight: true },
    { key: 'done', label: 'Done', color: '#6B7280' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0B1A] relative overflow-x-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Celebration Animation */}
      {showCelebration && celebrationGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-[#2DFFC2]/10 animate-pulse" />
          <div className="bg-[#1A1730] border border-[#2DFFC2] rounded-2xl p-8 text-center animate-bounce-in">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-white font-bold text-lg">Vote Terkirim!</p>
            <p className="text-[#2DFFC2] font-semibold mt-2">{celebrationGame.title}</p>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopNav />
      {/* ========== HEADER ========== */}
      <header className="relative bg-gradient-to-b from-[#12102A] to-[#0D0B1A] pt-24 pb-8 px-4 sm:px-6 lg:px-12 z-10">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#2DFFC2] opacity-[0.03] blur-[100px]" />
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-[#9B6DFF] opacity-[0.03] blur-[80px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 mb-4">
                <SparkleIcon className="text-[#F5A623]" />
                <span className="text-[#F5A623] text-[10px] font-bold tracking-wider uppercase">Audience Governance</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-sans tracking-tight">
                Cosmic{' '}
                <span className="bg-gradient-to-r from-[#2DFFC2] to-[#9B6DFF] bg-clip-text text-transparent">
                  Democracy
                </span>
              </h1>
              <p className="text-[#A09BB8] text-sm max-w-xl leading-relaxed">
                Pilih game yang ingin kamu tonton. Suara kamu menentukan live dan playthrough berikutnya.
              </p>
            </div>

            {/* Period Info Card - Compact */}
            <div className="bg-[#1A1730] border border-[#2A2645] rounded-xl p-4 min-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#5C5878] uppercase tracking-wider">Periode</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DFFC2] animate-pulse" />
                  <span className="text-[#2DFFC2] text-[10px] font-medium">Active</span>
                </div>
              </div>
              
              <div className="text-lg font-bold text-white font-mono mb-1">
                {formatPeriodName(periodKey)}
              </div>
              
              <div className="pt-3 border-t border-[#2A2645]">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#2DFFC2] font-mono">
                    {totalVotesGlobal.toLocaleString()}
                  </span>
                  <span className="text-[#5C5878] text-xs">Suara</span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="mt-3 flex gap-2">
                <div className="flex-1 text-center p-1.5 rounded-lg bg-[#12102A]">
                  <div className="text-sm font-bold text-[#F5A623] font-mono">{statusCounts.playing || 0}</div>
                  <div className="text-[9px] text-[#5C5878] uppercase">Playing</div>
                </div>
                <div className="flex-1 text-center p-1.5 rounded-lg bg-[#12102A]">
                  <div className="text-sm font-bold text-[#2DFFC2] font-mono">{statusCounts.accepted || 0}</div>
                  <div className="text-[9px] text-[#5C5878] uppercase">Accepted</div>
                </div>
                <div className="flex-1 text-center p-1.5 rounded-lg bg-[#12102A]">
                  <div className="text-sm font-bold text-[#C084FC] font-mono">{statusCounts.requested || 0}</div>
                  <div className="text-[9px] text-[#5C5878] uppercase">Requested</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== QUICK VOTE SECTION ========== */}
      <section ref={quickVoteRef} className="px-4 sm:px-6 lg:px-12 py-6 bg-[#12102A] border-b border-[#2A2645]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrophyIcon className="text-[#F5A623]" />
              <h2 className="text-sm font-bold text-white">Quick Vote</h2>
              <span className="text-[10px] text-[#5C5878] bg-[#2A2645] px-2 py-0.5 rounded-full">Top 3</span>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-[#A09BB8] hover:text-[#2DFFC2] transition-colors"
            >
              <ShareIcon />
              <span>Bagikan</span>
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#1A1730] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topGames.map((game, index) => (
                <QuickVoteCard
                  key={game.id}
                  game={game}
                  onVote={handleVote}
                  hasVoted={hasVoted(game.id, periodKey)}
                  voting={votingGameId === game.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== QUICK REQUEST SECTION ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1235 0%, #160e30 50%, #0f1a2e 100%)' }}>
        {/* Animated background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#9B6DFF] opacity-[0.06] blur-[80px]" />
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#2DFFC2] opacity-[0.05] blur-[80px]" />
        </div>
        {/* Top border gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9B6DFF60, #2DFFC240, transparent)' }} />
        {/* Bottom border gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9B6DFF40, #2DFFC230, transparent)' }} />

        <div className="max-w-[1280px] mx-auto relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-4">
              {/* Icon box */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9B6DFF20, #2DFFC215)', border: '1px solid rgba(155,109,255,0.35)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B6DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2DFFC2] border-2 border-[#0D0B1A]" />
              </div>

              {/* Text group */}
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-bold text-white tracking-tight">Request Game Baru</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#9B6DFF]" style={{ background: 'rgba(155,109,255,0.12)', border: '1px solid rgba(155,109,255,0.25)' }}>Open</span>
                </div>
                <p className="text-xs text-[#7C7898] leading-relaxed max-w-sm">
                  Tidak menemukan game favoritmu di daftar? Ajukan request dan biarkan komunitas memilih.
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="group relative flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #9B6DFF, #7B4FE0)', boxShadow: '0 4px 20px rgba(155,109,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Request Game</span>
              {/* Shine effect */}
              <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ========== FILTER SECTION ========== */}
      <section className="bg-[#12102A] border-b border-[#2A2645] px-4 sm:px-6 lg:px-12 py-3 sticky top-[60px] z-20 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap
                    ${filter === tab.key ? 'font-bold shadow-lg' : 'hover:bg-[#1A1730]'}
                  `}
                  style={{
                    backgroundColor: filter === tab.key ? tab.color : 'transparent',
                    color: filter === tab.key ? '#0D0B1A' : '#A09BB8',
                    boxShadow: filter === tab.key ? `0 2px 10px ${tab.color}40` : 'none',
                  }}
                >
                  {tab.highlight && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F5A623] mr-1.5 animate-pulse" />
                  )}
                  {tab.label}
                  <span className="ml-1 opacity-60">({statusCounts[tab.key] || 0})</span>
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-wrap gap-2">
              {/* Search with autocomplete */}
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Cari game..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full lg:w-56 pl-9 pr-3 py-2 bg-[#1A1730] border border-[#2A2645] rounded-lg text-xs text-white placeholder-[#5C5878] focus:border-[#2DFFC2] focus:outline-none transition-colors"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5C5878]">
                  <SearchIcon />
                </div>
                
                {/* Search Suggestions Dropdown */}
                {showSearchResults && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1730] border border-[#2A2645] rounded-lg overflow-hidden shadow-xl z-30">
                    {searchSuggestions.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => {
                          setSearchQuery(game.title);
                          setShowSearchResults(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#2A2645] transition-colors flex items-center gap-2"
                      >
                        <span className="text-sm">🎮</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{game.title}</p>
                          <p className="text-[10px] text-[#5C5878]">{game.genre}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#2DFFC2]">{game.votes} votes</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 bg-[#1A1730] border border-[#2A2645] rounded-lg text-xs text-white focus:border-[#2DFFC2] focus:outline-none cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239B97C0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
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
            <div className="bg-[#1A1730] border border-[#2A2645] rounded-xl p-8 text-center">
              <p className="text-[#A09BB8]">Data tidak tersedia</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredGames.length === 0 && (
            <div className="bg-[#1A1730] border border-[#2A2645] rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#2A2645] flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎮</span>
              </div>
              <p className="text-white font-semibold mb-1">
                {searchQuery ? 'Game tidak ditemukan' : 'Belum ada game untuk voting'}
              </p>
              <p className="text-[#5C5878] text-xs">
                {searchQuery ? 'Coba kata kunci lain atau hapus filter' : 'Request game baru atau tunggu Creator'}
              </p>
            </div>
          )}

          {/* Games Grid */}
          {!loading && !error && filteredGames.length > 0 && (
            <>
              {/* Info Bar */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[#5C5878] text-xs">
                  Menampilkan {filteredGames.length} dari {games.length} game
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#5C5878]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DFFC2] animate-pulse" />
                  <span>Real-time sync</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
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
        title="Konfirmasi Vote"
        confirmText="Ya, Vote Sekarang"
        variant="success"
        onConfirm={confirmVote}
      >
        <p className="text-[#A09BB8] text-sm">
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
          <div className="w-12 h-12 rounded-full bg-[#2DFFC2]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-[#A09BB8] text-sm">
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
        <form onSubmit={handleSubmitRequest} className="space-y-5">

          {/* Header info bar */}
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(155,109,255,0.08)', border: '1px solid rgba(155,109,255,0.2)' }}>
            <div className="flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B6DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-[11px] text-[#9B97C0] leading-relaxed">
              Request kamu akan ditinjau oleh Creator sebelum ditambahkan ke daftar voting publik. Satu request per sesi.
            </p>
          </div>

          {/* Game Title Input */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#A09BB8] uppercase tracking-widest mb-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Judul Game <span className="text-[#9B6DFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5878]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                value={requestForm.title}
                onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Elden Ring, Hollow Knight, Silent Hill 2..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#5C5878] transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(26,23,48,0.8)',
                  border: '1px solid rgba(42,38,69,1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(155,109,255,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(155,109,255,0.1), inset 0 1px 3px rgba(0,0,0,0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(42,38,69,1)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3)';
                }}
                required
              />
            </div>
          </div>

          {/* Genre Selection Grid */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-[#A09BB8] uppercase tracking-widest mb-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h8m-8 6h16"/>
              </svg>
              Genre <span className="text-[#5C5878] font-normal normal-case tracking-normal ml-1">(opsional)</span>
            </label>

            {/* Genre pill buttons */}
            <div className="flex flex-wrap gap-2 mb-2">
              {['Action', 'Adventure', 'RPG', 'Horror', 'Survival', 'Simulation', 'Indie', 'Lainnya'].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setRequestForm((p) => ({ ...p, genre: p.genre === genre ? '' : genre }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={
                    requestForm.genre === genre
                      ? {
                          background: 'linear-gradient(135deg, #9B6DFF, #7B4FE0)',
                          color: '#fff',
                          border: '1px solid transparent',
                          boxShadow: '0 2px 10px rgba(155,109,255,0.4)',
                        }
                      : {
                          background: 'rgba(26,23,48,0.6)',
                          color: '#9B97C0',
                          border: '1px solid rgba(42,38,69,0.8)',
                        }
                  }
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Hidden select for form value */}
            <select
              value={requestForm.genre}
              onChange={(e) => setRequestForm((p) => ({ ...p, genre: e.target.value }))}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              <option value="">Pilih Kategori...</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="RPG">RPG</option>
              <option value="Horror">Horror</option>
              <option value="Survival">Survival</option>
              <option value="Simulation">Simulation</option>
              <option value="Indie">Indie</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>


          {/* Disclaimer */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,255,194,0.15)', border: '1px solid rgba(45,255,194,0.3)' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#2DFFC2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-[10px] text-[#5C5878] leading-relaxed">
              Setelah dimoderasi, game akan muncul di daftar voting dan komunitas bisa mulai vote.
            </p>
          </div>

        </form>
      </Modal>

    </div>
  );
}

export default VotingPage;