import { useState, useEffect, useRef, useCallback } from 'react';
import { getContent, getFeatured } from '../../services/contentService';
import { useToast } from '../../components/common/Toast';
import TopNav from '../../components/viewer/TopNav';
import Footer from '../../components/viewer/Footer';
import api from '../../services/api';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../../utils/firebase';

// ========== ICONS ==========
const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const ChatIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MusicIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const GameIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 12h4m-2-2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="11" r="1" fill="currentColor"/>
    <circle cx="15" cy="13" r="1" fill="currentColor"/>
  </svg>
);
const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const CopyIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const UserIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TrendingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-2 border-[#7ee0d2] border-t-transparent rounded-full animate-spin" />
  </div>
);

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.01.043.027.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

// ========== DEMO DATA (Fallback if API fails) ==========
const FALLBACK_STATS = [
  { label: "Total Stream", value: "0", color: "#7ee0d2" },
  { label: "Jam Konten", value: "0j", color: "#c084fc" },
  { label: "Total Video", value: "0", color: "#fbbf24" },
  { label: "Konten Baru", value: "0", color: "#f472b6" },
];

const FALLBACK_CATEGORIES = [
  { id: "zatsu", name: "ZATSU", icon: <ChatIcon />, color: "#c084fc", count: 0, totalVideos: "0" },
  { id: "live2d", name: "LIVE2D", icon: <EyeIcon />, color: "#7ee0d2", count: 0, totalVideos: "0" },
  { id: "indie", name: "INDIE GAMES", icon: <GameIcon />, color: "#fbbf24", count: 0, totalVideos: "0" },
  { id: "karaoke", name: "KARAOKE", icon: <MusicIcon />, color: "#f472b6", count: 0, totalVideos: "0" },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'longest', label: 'Durasi Terpanjang' },
];

function ContentGuidePage() {
  const toast = useToast();

  // ========== REAL DATA STATE ==========
  const [featured, setFeatured] = useState(null);
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== UI STATE ==========
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [copied, setCopied] = useState(false);

  // Section visibility
  const [headerVisible, setHeaderVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(true);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [categoriesVisible, setCategoriesVisible] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);

  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const gridRef = useRef(null);

  // ========== FETCH REAL DATA ==========
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      // getContent returns: { success, data: [...contents], pagination }
      // getFeatured returns: { success, data: contentObject || null }
      const [featuredRes, contentsRes, statsRes, categoriesRes] = await Promise.allSettled([
        getFeatured(),
        getContent({ limit: 50 }),
        api.get('/api/content/stats'),
        api.get('/api/content/categories')
      ]);

      // Process featured content
      if (featuredRes.status === 'fulfilled' && featuredRes.value?.success && featuredRes.value?.data) {
        const fc = featuredRes.value.data;
        setFeatured({
          id: fc.id,
          title: fc.title,
          subtitle: fc.subtitle || `Stream oleh ${fc.streamer || fc.user?.name || 'X-VOCA'}`,
          streamer: fc.streamer || fc.user?.name || 'Admin',
          videoCount: fc.videoCount || fc.video_count || 1,
          duration: fc.duration || fc.total_duration,
          category: fc.category || fc.game_tag?.toUpperCase() || 'STREAM',
          categoryColor: fc.categoryColor || '#7ee0d2',
          date: fc.date,
          youtubeUrl: fc.youtubeUrl || fc.youtube_url,
          thumbnailUrl: fc.thumbnailUrl || fc.thumbnail_url || fc.thumbnail
        });
      } else {
        setFeatured(null);
      }

      // Process contents - getContent returns data directly as array now
      if (contentsRes.status === 'fulfilled' && contentsRes.value?.success) {
        const contentsData = contentsRes.value.data || [];
        setContents(Array.isArray(contentsData) ? contentsData : []);
      }

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        const s = statsRes.value.data.data;
        setStats([
          { label: "Total Stream", value: s.totalStreams || "0", color: "#7ee0d2" },
          { label: "Jam Konten", value: s.totalHours || "0j", color: "#c084fc" },
          { label: "Total Video", value: s.totalVideos || "0", color: "#fbbf24" },
          { label: "Konten Baru", value: s.newContent || "0", color: "#f472b6" },
        ]);
      } else {
        setStats(FALLBACK_STATS);
      }

      // Process categories with icons
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data?.data && Array.isArray(categoriesRes.value.data.data)) {
        const catsWithIcons = categoriesRes.value.data.data.map(cat => ({
          ...cat,
          icon: cat.icon === 'ChatIcon' ? <ChatIcon /> :
                cat.icon === 'EyeIcon' ? <EyeIcon /> :
                cat.icon === 'GameIcon' ? <GameIcon /> :
                cat.icon === 'MusicIcon' ? <MusicIcon /> : <ChatIcon />
        }));
        setCategories(catsWithIcons);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }

    } catch (err) {
      console.error('Error fetching content data:', err);
      setError(err);
      if (showLoading) {
        toast.error('Gagal memuat konten');
      }
      // Use fallback data
      setStats(FALLBACK_STATS);
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Real-time listener for content updates via Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    try {
      const database = getFirebaseDatabase();
      if (!database) return;

      const contentUpdatesRef = ref(database, 'content_updates');
      let isFirstMount = true;

      const unsubscribe = onValue(contentUpdatesRef, (snapshot) => {
        // Skip first trigger because initial fetch already executed
        if (isFirstMount) {
          isFirstMount = false;
          return;
        }

        if (snapshot.exists()) {
          console.log('[ContentGuide] Realtime change detected, syncing content...');
          fetchData(false);
        }
      });

      return () => {
        off(contentUpdatesRef);
      };
    } catch (err) {
      console.warn('[ContentGuide] Firebase listener warning:', err.message);
    }
  }, [fetchData]);

  useEffect(() => {
    const pairs = [
      [headerRef, setHeaderVisible],
      [statsRef, setStatsVisible],
      [featuredRef, setFeaturedVisible],
      [categoriesRef, setCategoriesVisible],
      [gridRef, setGridVisible],
    ];
    const observers = pairs.map(([ref, setter]) => {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setter(true); obs.disconnect(); }
      }, { threshold: 0.08 });
      if (ref.current) obs.observe(ref.current);
      return obs;
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Filter + sort
  const filteredContents = (() => {
    let result = contents;
    if (searchQuery) {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.gameTag?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (activeCategory !== 'all') {
      // Filter by category name or categoryId
      result = result.filter(c =>
        c.category === activeCategory ||
        c.categoryId === activeCategory
      );
    }
    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => {
        const aViews = parseFloat(a.viewCount?.replace(/[KMB]/g, '')) || 0;
        const bViews = parseFloat(b.viewCount?.replace(/[KMB]/g, '')) || 0;
        return bViews - aViews;
      });
    }
    return result;
  })();

  // Get category color from real data
  const getCategoryColor = (cat) => {
    const found = categories.find(c => c.name === cat || c.id === cat);
    return found?.color || '#a89ec0';
  };

  // Get category icon from real data
  const getCategoryIcon = (cat) => {
    const found = categories.find(c => c.name === cat || c.id === cat);
    return found?.icon || null;
  };

  const handleWatch = (content) => {
    if (content.youtubeUrl) {
      window.open(content.youtubeUrl, '_blank');
    } else {
      toast.info(`Opening: ${content.title}`);
    }
  };

  const handleCopyLink = (e, url) => {
    e.stopPropagation();
    if (!url) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          toast.success('Link stream berhasil disalin ke clipboard');
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => {
          toast.error('Gagal menyalin link');
        });
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success('Link stream berhasil disalin ke clipboard');
        setTimeout(() => setCopied(false), 2200);
      } catch {
        toast.error('Gagal menyalin link');
      }
    }
  };

  // Calculate total content from categories
  const totalContent = categories.reduce((s, c) => s + (c.count || 0), 0);

  return (
    <div className="min-h-screen bg-[#0f0a22]">
      <TopNav />

      {/* ========== HEADER ========== */}
      <header
        ref={headerRef}
        className={`relative pt-28 pb-10 px-4 sm:px-6 lg:px-12 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Subtle BG glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-[#7ee0d2] opacity-[0.04] blur-[120px]" />
          <div className="absolute top-20 left-0 w-80 h-80 rounded-full bg-[#c084fc] opacity-[0.04] blur-[100px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: 'rgba(126,224,210,0.08)', border: '1px solid rgba(126,224,210,0.18)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
            <span className="text-[#7ee0d2] text-[11px] font-bold tracking-widest uppercase">Content Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
            Cosmic Archive{' '}
            <span className="bg-gradient-to-r from-[#7ee0d2] to-[#c084fc] bg-clip-text text-transparent">
              & Media Vault
            </span>
          </h1>
          <p className="text-[#7c7898] text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
            Jelajahi semua perjalanan stream Xion — dari zatsu santai hingga petualangan indie games.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div
              className="group relative flex items-center rounded-2xl transition-all duration-300"
              style={{ background: 'rgba(22,19,42,0.95)', border: '1px solid rgba(42,38,69,0.9)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(126,224,210,0.45)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(126,224,210,0.07), 0 4px 32px rgba(0,0,0,0.35)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(42,38,69,0.9)';
                e.currentTarget.style.boxShadow = '0 4px 32px rgba(0,0,0,0.35)';
              }}
            >
              <div className="flex-shrink-0 pl-4 pr-3 text-[#5c5480] group-focus-within:text-[#7ee0d2] transition-colors duration-200">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari konten, kategori, atau judul stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-4 pr-3 bg-transparent text-sm text-white placeholder-[#5c5480] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="flex-shrink-0 mr-3 flex items-center justify-center w-6 h-6 rounded-full text-[#5c5480] hover:text-white hover:bg-[#2a2645] transition-all duration-200"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              ) : (
                <span className="hidden sm:flex flex-shrink-0 mr-3 items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono text-[#5c5480]" style={{ background: 'rgba(42,38,69,0.6)', border: '1px solid rgba(42,38,69,0.9)' }}>
                  /
                </span>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 flex items-center gap-2 px-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                <p className="text-xs text-[#5c5480]">
                  Hasil untuk{' '}
                  <span className="text-[#7ee0d2] font-medium">"{searchQuery}"</span>
                  {' — '}<span className="text-white font-medium">{filteredContents.length}</span> ditemukan
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========== STATS BAR ========== */}
      <section
        ref={statsRef}
        className={`px-4 sm:px-6 lg:px-12 pb-8 transition-all duration-700 delay-75 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(stats.length > 0 ? stats : FALLBACK_STATS).map((stat, idx) => (
              <div
                key={stat.label + idx}
                className="relative rounded-xl p-4 overflow-hidden"
                style={{ background: 'rgba(22,19,42,0.8)', border: '1px solid rgba(42,38,69,0.7)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}50, transparent)` }} />
                <div className="text-2xl font-bold font-mono mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-[#7c7898] uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED CONTENT ========== */}
      {featured && (
        <section
          ref={featuredRef}
          className="px-4 sm:px-6 lg:px-12 pb-8 transition-all duration-500 opacity-100 translate-y-0"
        >
          <div className="max-w-[1280px] mx-auto">
            {/* Section label */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-[#7ee0d2]" />
                <span className="text-[#7ee0d2] text-[11px] font-bold tracking-widest uppercase">Featured Stream</span>
              </div>
              <span className="text-[11px] text-[#7c7898] font-medium hidden sm:inline">Sorotan Utama Komunitas</span>
            </div>

            {/* Featured Card */}
            <div
              className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_12px_44px_rgba(0,0,0,0.55)]"
              style={{
                background: 'linear-gradient(135deg, rgba(22,18,44,0.92) 0%, rgba(14,11,28,0.96) 100%)',
                border: '1px solid rgba(126,224,210,0.22)',
              }}
              onClick={() => handleWatch(featured)}
            >
              {/* Top accent gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(126,224,210,0.6), rgba(192,132,252,0.4), transparent)' }} />

              {/* Ambient radial glow matching category color */}
              <div
                className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: featured.categoryColor || '#7ee0d2' }}
              />

              <div className="relative p-3.5 sm:p-4 lg:p-5 flex flex-col md:flex-row items-stretch gap-4 lg:gap-6">
                {/* Thumbnail Container (Strict 16:9 widescreen ratio, never bloats vertically) */}
                <div className="w-full md:w-[320px] lg:w-[380px] flex-shrink-0">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0d0b1a] shadow-inner">
                    {featured.thumbnailUrl ? (
                      <img
                        src={featured.thumbnailUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#151226] text-[#5c5480]">
                        <YouTubeIcon />
                      </div>
                    )}

                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

                    {/* Glowing Play button center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
                          style={{ background: 'rgba(15,10,34,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(126,224,210,0.4)' }}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow"
                            style={{ background: 'linear-gradient(135deg, #7ee0d2, #5bc4b8)' }}
                          >
                            <span className="text-[#0f0a22] ml-0.5"><PlayIcon size={16} /></span>
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: 'rgba(126,224,210,0.4)' }} />
                      </div>
                    </div>

                    {/* LIVE / FEATURED badge */}
                    <div
                      className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white"
                      style={{ background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(6px)', boxShadow: '0 2px 10px rgba(239,68,68,0.4)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      FEATURED
                    </div>

                    {/* Duration badge */}
                    {featured.duration && (
                      <div
                        className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-white/95"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
                      >
                        <ClockIcon />
                        {featured.duration}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                  {/* Top Meta Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Category pill */}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                      style={{
                        background: `${featured.categoryColor || '#c084fc'}18`,
                        border: `1px solid ${featured.categoryColor || '#c084fc'}40`,
                        color: featured.categoryColor || '#c084fc'
                      }}
                    >
                      {featured.category}
                    </span>

                    {/* Streamer pill */}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#c4bcdc]"
                      style={{ background: 'rgba(42,38,69,0.5)', border: '1px solid rgba(61,53,96,0.6)' }}
                    >
                      <UserIcon size={11} />
                      {featured.streamer || 'Admin'}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-[#7c7898] flex items-center gap-1">
                      <span>•</span>
                      {featured.date}
                    </span>

                    {/* Video count */}
                    <span className="text-xs text-[#7c7898] flex items-center gap-1">
                      <span>•</span>
                      <EyeIcon size={12} />
                      {featured.videoCount || 1} video
                    </span>
                  </div>

                  {/* Middle Content */}
                  <div className="my-auto py-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#7ee0d2] transition-colors leading-snug line-clamp-2 mb-1.5">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="text-xs sm:text-sm text-[#948db5] line-clamp-2 leading-relaxed">
                        {featured.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-[rgba(42,38,69,0.5)] mt-2">
                    <a
                      href={featured.youtubeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#0f0a22] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#7ee0d2]/20 hover:shadow-[#7ee0d2]/35"
                      style={{ background: 'linear-gradient(135deg, #7ee0d2, #5bc4b8)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <YouTubeIcon />
                      Tonton Sekarang
                    </a>

                    {featured.youtubeUrl && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95"
                        style={{
                          background: copied ? 'rgba(126,224,210,0.15)' : 'rgba(42,38,69,0.6)',
                          border: copied ? '1px solid rgba(126,224,210,0.5)' : '1px solid rgba(61,53,96,0.7)',
                          color: copied ? '#7ee0d2' : '#c4bcdc'
                        }}
                        onClick={(e) => handleCopyLink(e, featured.youtubeUrl)}
                        title="Salin link stream YouTube"
                      >
                        {copied ? (
                          <>
                            <CheckIcon size={13} />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={13} />
                            <span>Salin Link</span>
                          </>
                        )}
                      </button>
                    )}

                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#5c5480] ml-auto">
                      Klik kartu untuk memutar
                      <ExternalIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CATEGORIES ========== */}
      <section
        ref={categoriesRef}
        className={`px-4 sm:px-6 lg:px-12 pb-8 transition-all duration-700 delay-150 ${categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[#c084fc]" />
            <span className="text-[#c084fc] text-[11px] font-bold tracking-widest uppercase">Kategori</span>
          </div>

          {/* Category Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <button
              onClick={() => setActiveCategory('all')}
              className="relative text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: activeCategory === 'all' ? 'rgba(126,224,210,0.1)' : 'rgba(22,19,42,0.8)',
                border: activeCategory === 'all' ? '1px solid rgba(126,224,210,0.35)' : '1px solid rgba(42,38,69,0.7)',
              }}
            >
              <div className="text-xl font-bold font-mono mb-1" style={{ color: activeCategory === 'all' ? '#7ee0d2' : '#fff' }}>
                {totalContent}
              </div>
              <div className="text-xs font-semibold text-white mb-1">Semua</div>
              <div className="text-[10px] text-[#5c5480] uppercase tracking-wide">Semua Konten</div>
              {/* bottom progress fill */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl" style={{ background: activeCategory === 'all' ? '#7ee0d2' : 'transparent' }} />
            </button>

            {(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className="relative text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: activeCategory === cat.name ? `${cat.color}12` : 'rgba(22,19,42,0.8)',
                  border: activeCategory === cat.name ? `1px solid ${cat.color}40` : '1px solid rgba(42,38,69,0.7)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: cat.color }}>{cat.icon}</span>
                  <span className="text-[10px] font-mono text-[#5c5480]">{cat.totalVideos || '0'} vid</span>
                </div>
                <div className="text-xl font-bold font-mono mb-0.5" style={{ color: activeCategory === cat.name ? cat.color : '#fff' }}>
                  {cat.count || 0}
                </div>
                <div className="text-xs font-semibold text-white mb-1">{cat.name}</div>

                {/* Mini progress bar */}
                <div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(42,38,69,0.8)' }}>
                  <div className="h-0.5 rounded-full transition-all duration-500" style={{ width: `${totalContent > 0 ? ((cat.count || 0) / totalContent) * 100 : 0}%`, background: cat.color }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl" style={{ background: activeCategory === cat.name ? cat.color : 'transparent' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTENT GRID ========== */}
      <section
        ref={gridRef}
        className={`px-4 sm:px-6 lg:px-12 pb-14 transition-all duration-700 delay-200 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: activeCategory !== 'all' ? getCategoryColor(activeCategory) : '#fbbf24' }} />
              <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: activeCategory !== 'all' ? getCategoryColor(activeCategory) : '#fbbf24' }}>
                {activeCategory === 'all' ? 'Semua Konten' : activeCategory}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#7c7898]" style={{ background: 'rgba(42,38,69,0.7)' }}>
                {filteredContents.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-lg text-xs text-white focus:outline-none appearance-none cursor-pointer"
                style={{
                  background: 'rgba(22,19,42,0.9)',
                  border: '1px solid rgba(42,38,69,0.8)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239B97C0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '10px',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* View toggle */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(42,38,69,0.8)' }}>
                {(['grid', 'list']).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-2.5 py-1.5 transition-all duration-200"
                    style={{ background: viewMode === mode ? 'rgba(126,224,210,0.15)' : 'rgba(22,19,42,0.9)', color: viewMode === mode ? '#7ee0d2' : '#5c5480' }}
                  >
                    {mode === 'grid' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner />
              <p className="text-[#5c5480] text-sm mt-3">Memuat konten...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(18,15,35,0.8)', border: '1px solid rgba(42,38,69,0.7)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Gagal memuat konten</h3>
              <p className="text-sm text-[#5c5480] mb-5">Terjadi kesalahan saat mengambil data dari server</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-[#0f0a22] transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #7ee0d2, #5bc4b8)' }}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Grid / List */}
          {!loading && !error && (filteredContents.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
            }>
              {filteredContents.map((content, index) => {
                const catColor = content.categoryColor || getCategoryColor(content.category);
                const catIcon = getCategoryIcon(content.category);

                if (viewMode === 'list') {
                  return (
                    <div
                      key={content.id}
                      className="group flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-[rgba(126,224,210,0.2)]"
                      style={{ background: 'rgba(22,19,42,0.8)', border: '1px solid rgba(42,38,69,0.7)', transitionDelay: `${index * 30}ms` }}
                      onClick={() => handleWatch(content)}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-28 h-16 rounded-lg relative overflow-hidden" style={{ background: 'rgba(13,11,26,0.9)' }}>
                        {(content.thumbnailUrl || content.thumbnail_url || content.thumbnail) ? (
                          <img
                            src={content.thumbnailUrl || content.thumbnail_url || content.thumbnail}
                            alt={content.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse, ${catColor}, transparent 70%)` }} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: catColor }}>
                            <span className="text-[#0f0a22]"><PlayIcon size={12} /></span>
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>{content.duration}</div>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: catColor }}>{content.category}</div>
                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#7ee0d2] transition-colors">{content.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#5c5480]">
                          <span className="flex items-center gap-1"><EyeIcon size={11} />{content.videoCount} video</span>
                          <span>{content.date}</span>
                        </div>
                      </div>
                      {/* Badges */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                        {content.status === 'new' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-[#0f0a22] bg-[#7ee0d2]">NEW</span>}
                        {content.status === 'popular' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white" style={{ background: '#c084fc' }}>HOT</span>}
                        <ExternalIcon />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={content.id}
                    className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                    style={{ background: 'rgba(18,15,35,0.9)', border: '1px solid rgba(42,38,69,0.7)', transitionDelay: `${index * 40}ms` }}
                    onClick={() => handleWatch(content)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden" style={{ background: 'rgba(13,11,26,0.95)' }}>
                      {(content.thumbnailUrl || content.thumbnail_url || content.thumbnail) ? (
                        <img
                          src={content.thumbnailUrl || content.thumbnail_url || content.thumbnail}
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${catColor}, transparent 60%)` }} />

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                          style={{ background: catColor, boxShadow: `0 4px 20px ${catColor}50` }}>
                          <span className="text-[#0f0a22]"><PlayIcon size={14} /></span>
                        </div>
                      </div>

                      {/* Status badge */}
                      {content.status === 'new' && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-[#0f0a22] bg-[#7ee0d2]">NEW</span>
                      )}
                      {content.status === 'popular' && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white" style={{ background: '#c084fc' }}>
                          <TrendingIcon />HOT
                        </span>
                      )}

                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-white" style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <ClockIcon />{content.duration}
                      </div>

                      {/* Category icon */}
                      <div className="absolute bottom-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${catColor}18`, border: `1px solid ${catColor}30` }}>
                        <span style={{ color: catColor }}>{catIcon}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: catColor }}>
                        {content.category}
                      </div>
                      <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3 leading-snug group-hover:text-[#7ee0d2] transition-colors duration-200">
                        {content.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-[#5c5480]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><EyeIcon size={11} />{content.videoCount} video</span>
                          <span>{content.date}</span>
                        </div>
                        <span className="text-[#3d3560] group-hover:text-[#7ee0d2] transition-colors"><ExternalIcon /></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(18,15,35,0.8)', border: '1px solid rgba(42,38,69,0.7)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(42,38,69,0.6)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c5480" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Tidak ada konten ditemukan</h3>
              <p className="text-sm text-[#5c5480] mb-5">Coba sesuaikan kata kunci atau ubah filter kategori</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-[#0f0a22] transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #7ee0d2, #5bc4b8)' }}
              >
                Reset Filter
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========== DISCORD CTA ========== */}
      <section className="px-4 sm:px-6 lg:px-12 pb-14">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="relative rounded-2xl p-6 lg:p-8 overflow-hidden"
            style={{ background: 'rgba(18,15,35,0.95)', border: '1px solid rgba(42,38,69,0.7)' }}
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.06] blur-[80px]" style={{ background: '#5865f2' }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(88,101,242,0.4), rgba(192,132,252,0.3), transparent)' }} />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)' }}>
                  <span style={{ color: '#7289da' }}><DiscordIcon /></span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Cari klip atau momen tertentu?</h3>
                  <p className="text-sm text-[#7c7898]">Temukan highlight dan momen terbaik di Discord Vault komunitas X-VOCA.</p>
                </div>
              </div>
              <a
                href="#"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'rgba(88,101,242,0.2)', border: '1px solid rgba(88,101,242,0.4)' }}
              >
                <DiscordIcon />
                Buka Discord Vault
                <ExternalIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />
    </div>
  );
}

export default ContentGuidePage;
