import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getContent, getFeatured } from '../../services/contentService';
import { useToast } from '../../components/common/Toast';
import TopNav from '../../components/viewer/TopNav';
import Footer from '../../components/viewer/Footer';
import api from '../../services/api';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../../utils/firebase';

// ========== CLEAN VECTOR SVG ICONS (ZERO EMOJIS / ZERO AI SLOP) ==========
const PlayIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const YouTubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const VideoIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);

const ExternalIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

const ClockIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CopyIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UserIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-[#7ee0d2] border-t-transparent rounded-full animate-spin" />
  </div>
);

// Fallback statistics
const FALLBACK_STATS = [
  { label: "Total Stream", value: "0", color: "#7ee0d2" },
  { label: "Jam Konten", value: "0j", color: "#c084fc" },
  { label: "Total Video", value: "0", color: "#fbbf24" },
  { label: "Konten Baru", value: "0", color: "#f472b6" },
];

const FALLBACK_CATEGORIES = [
  { id: "zatsu", name: "ZATSU", color: "#c084fc", count: 0 },
  { id: "live2d", name: "LIVE2D", color: "#7ee0d2", count: 0 },
  { id: "indie", name: "INDIE GAMES", color: "#fbbf24", count: 0 },
  { id: "karaoke", name: "KARAOKE", color: "#f472b6", count: 0 },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'longest', label: 'Durasi Terpanjang' },
];

// ========== MODERN CUSTOM DROPDOWN (ZERO NATIVE OS STIFFNESS) ==========
function CustomDropdown({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200
          ${isOpen
            ? 'bg-[#181432] border-[#7ee0d2]/60 text-white shadow-[0_0_14px_rgba(126,224,210,0.18)] ring-1 ring-[#7ee0d2]/30'
            : 'bg-[#141126] border-white/10 text-white hover:border-[#7ee0d2]/40 hover:bg-[#181432]'
          } border
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#7ee0d2]' : 'text-[#8E8AAB]'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Floating Menu with Glassmorphism */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#141128]/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-1 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between text-left transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? 'bg-[#7ee0d2]/15 text-[#7ee0d2] font-semibold'
                    : 'text-[#A09BB8] hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-[#7ee0d2] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentGuidePage() {
  const toast = useToast();

  // Real Data State
  const [featured, setFeatured] = useState(null);
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [copiedId, setCopiedId] = useState(null);

  // Fetch real data
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [featuredRes, contentsRes, statsRes, categoriesRes] = await Promise.allSettled([
        getFeatured(),
        getContent({ limit: 50 }),
        api.get('/api/content/stats'),
        api.get('/api/content/categories')
      ]);

      // Featured Content
      if (featuredRes.status === 'fulfilled' && featuredRes.value?.success && featuredRes.value?.data) {
        const fc = featuredRes.value.data;
        setFeatured({
          id: fc.id,
          title: fc.title,
          subtitle: fc.subtitle || `Stream oleh ${fc.streamer || fc.user?.name || 'X-VOCA'}`,
          streamer: fc.streamer || fc.user?.name || 'Xion Regalia',
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

      // Content list
      if (contentsRes.status === 'fulfilled' && contentsRes.value?.success) {
        const contentsData = contentsRes.value.data || [];
        setContents(Array.isArray(contentsData) ? contentsData : []);
      }

      // Stats
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

      // Categories
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data?.data && Array.isArray(categoriesRes.value.data.data)) {
        setCategories(categoriesRes.value.data.data);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch (err) {
      console.error('Error fetching content data:', err);
      setError(err);
      if (showLoading) toast.error('Gagal memuat arsip konten');
      setStats(FALLBACK_STATS);
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Real-time Firebase listener
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    try {
      const database = getFirebaseDatabase();
      if (!database) return;

      const contentUpdatesRef = ref(database, 'content_updates');
      let isFirstMount = true;

      const unsubscribe = onValue(contentUpdatesRef, (snapshot) => {
        if (isFirstMount) {
          isFirstMount = false;
          return;
        }
        if (snapshot.exists()) {
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

  // Filter & sort contents
  const filteredContents = useMemo(() => {
    let result = [...contents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.gameTag?.toLowerCase().includes(q) ||
        c.game_tag?.toLowerCase().includes(q)
      );
    } else if (activeCategory !== 'all') {
      result = result.filter(c =>
        c.category?.toLowerCase() === activeCategory.toLowerCase() ||
        c.categoryId?.toLowerCase() === activeCategory.toLowerCase() ||
        c.game_tag?.toLowerCase() === activeCategory.toLowerCase() ||
        c.gameTag?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => {
        const aViews = parseFloat(String(a.viewCount || a.view_count || '0').replace(/[KMB]/g, '')) || 0;
        const bViews = parseFloat(String(b.viewCount || b.view_count || '0').replace(/[KMB]/g, '')) || 0;
        return bViews - aViews;
      });
    } else if (sortBy === 'longest') {
      result.sort((a, b) => (b.duration || '').localeCompare(a.duration || ''));
    }

    return result;
  }, [contents, searchQuery, activeCategory, sortBy]);

  // Total content count
  const totalContent = useMemo(() => {
    return contents.length || categories.reduce((s, c) => s + (c.count || 0), 0);
  }, [contents, categories]);

  // Category color helper
  const getCategoryColor = useCallback((catName) => {
    const found = categories.find(c => c.name?.toLowerCase() === catName?.toLowerCase() || c.id === catName);
    return found?.color || '#7ee0d2';
  }, [categories]);

  // Open stream in YouTube
  const handleWatch = (content) => {
    const url = content.youtubeUrl || content.youtube_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(`Membuka: ${content.title}`);
    }
  };

  // Copy stream URL
  const handleCopyLink = (e, content) => {
    e.stopPropagation();
    const url = content.youtubeUrl || content.youtube_url;
    if (!url) return;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedId(content.id);
          toast.success('Link stream berhasil disalin ke clipboard');
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => toast.error('Gagal menyalin link'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B1A] relative overflow-x-hidden text-white">
      {/* Top Navigation */}
      <TopNav />

      {/* ========== HEADER ========== */}
      <header className="relative pt-28 pb-8 px-4 sm:px-6 lg:px-12 border-b border-white/5 bg-gradient-to-b from-[#141126] to-[#0D0B1A]">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-[#7ee0d2]/[0.025] blur-[140px]" />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-[#c084fc]/[0.02] blur-[120px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
            <span className="text-[#7ee0d2] text-[11px] font-semibold tracking-wider uppercase">Content Guide</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight font-sans">
            Arsip Siaran{' '}
            <span className="bg-gradient-to-r from-[#7ee0d2] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">
              & Direktori Konten
            </span>
          </h1>
          <p className="text-[#8E8AAB] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            Kumpulan rekaman siaran langsung, playthrough game, dan arsip tayangan Xion Regalia.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-xl bg-[#141126] border border-white/10 shadow-sm focus-within:border-[#7ee0d2]/50 focus-within:ring-1 focus-within:ring-[#7ee0d2]/20 transition-all">
              <div className="pl-4 pr-3 text-[#8E8AAB]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari konten, kategori, atau topik stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-3 pr-3 bg-transparent text-sm text-white placeholder-[#8E8AAB]/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-3 p-1 rounded-full text-[#8E8AAB] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs text-[#8E8AAB]">
                Menampilkan hasil untuk <span className="text-[#7ee0d2] font-medium">"{searchQuery}"</span> ({filteredContents.length} ditemukan)
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ========== COMPACT STATS STRIP ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-5 border-b border-white/5 bg-[#110e22]">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(stats.length > 0 ? stats : FALLBACK_STATS).map((stat, idx) => (
              <div
                key={stat.label + idx}
                className="rounded-xl p-3.5 bg-[#141126] border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-[#8E8AAB] uppercase tracking-wider font-medium mb-0.5">{stat.label}</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white" style={{ color: stat.color }}>{stat.value}</div>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED SPOTLIGHT CARD (IF AVAILABLE) ========== */}
      {featured && (
        <section className="px-4 sm:px-6 lg:px-12 py-6 border-b border-white/5">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                <span className="text-[#7ee0d2] text-xs font-bold tracking-wider uppercase">Sorotan Utama</span>
              </div>
            </div>

            <div
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#141126] border border-white/10 hover:border-[#7ee0d2]/40 transition-all duration-300 shadow-md"
              onClick={() => handleWatch(featured)}
            >
              <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch gap-4 lg:gap-6">
                {/* 16:9 Thumbnail */}
                <div className="w-full md:w-[340px] lg:w-[400px] flex-shrink-0">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#0D0B1A] border border-white/5">
                    {featured.thumbnailUrl ? (
                      <img
                        src={featured.thumbnailUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E8AAB]">
                        <VideoIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Glowing Play Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#0D0B1A]/80 border border-[#7ee0d2]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-9 h-9 rounded-full bg-[#7ee0d2] text-[#0D0B1A] flex items-center justify-center">
                          <PlayIcon size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-white bg-red-600/90 shadow-sm">
                      FEATURED
                    </div>

                    {/* Duration Badge */}
                    {featured.duration && (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-white bg-black/80">
                        <ClockIcon />
                        <span>{featured.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info & Details */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#7ee0d2]/15 text-[#7ee0d2] border border-[#7ee0d2]/30">
                        {featured.category}
                      </span>
                      <span className="text-xs text-[#8E8AAB] flex items-center gap-1">
                        <UserIcon />
                        {featured.streamer || 'Xion Regalia'}
                      </span>
                      {featured.date && (
                        <span className="text-xs text-[#8E8AAB]">• {featured.date}</span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#7ee0d2] transition-colors line-clamp-2 mb-2">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="text-xs sm:text-sm text-[#8E8AAB] line-clamp-2 leading-relaxed">
                        {featured.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-white/5 mt-3">
                    <a
                      href={featured.youtubeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#0D0B1A] bg-[#7ee0d2] hover:bg-[#6bd6c7] transition-all shadow-sm active:scale-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <YouTubeIcon />
                      <span>Tonton Sekarang</span>
                    </a>

                    {featured.youtubeUrl && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
                        onClick={(e) => handleCopyLink(e, featured)}
                      >
                        {copiedId === featured.id ? <CheckIcon /> : <CopyIcon />}
                        <span>{copiedId === featured.id ? 'Tersalin' : 'Salin Link'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CATEGORIES (SLEEK PILL FILTER TABS) ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-4 sticky top-[60px] z-20 bg-[#0D0B1A]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* 'Semua' Pill */}
            <button
              onClick={() => setActiveCategory('all')}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 flex-shrink-0
                ${activeCategory === 'all'
                  ? 'bg-[#7ee0d2] text-[#0D0B1A] font-semibold shadow-sm'
                  : 'bg-[#141126] text-[#8E8AAB] hover:text-white hover:bg-white/5 border border-white/10'
                }
              `}
            >
              <span>Semua Konten</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${activeCategory === 'all' ? 'bg-[#0D0B1A]/20 text-[#0D0B1A]' : 'bg-white/10 text-[#8E8AAB]'}`}>
                {totalContent}
              </span>
            </button>

            {/* Category Pills */}
            {(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 flex-shrink-0
                    ${isActive
                      ? 'bg-[#7ee0d2] text-[#0D0B1A] font-semibold shadow-sm'
                      : 'bg-[#141126] text-[#8E8AAB] hover:text-white hover:bg-white/5 border border-white/10'
                    }
                  `}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color || '#7ee0d2' }} />
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${isActive ? 'bg-[#0D0B1A]/20 text-[#0D0B1A]' : 'bg-white/10 text-[#8E8AAB]'}`}>
                    {cat.count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== CONTENT DIRECTORY ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {activeCategory === 'all' ? 'Semua Konten' : activeCategory}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#8E8AAB] bg-white/5 border border-white/10">
                {filteredContents.length} video
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#8E8AAB] ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                <span>Real-time sync</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Modern Custom Sort Dropdown */}
              <CustomDropdown
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
              />

              {/* View Mode Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-white/10 bg-[#141126]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#7ee0d2]/15 text-[#7ee0d2]' : 'text-[#8E8AAB] hover:text-white'}`}
                  title="Grid View"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#7ee0d2]/15 text-[#7ee0d2]' : 'text-[#8E8AAB] hover:text-white'}`}
                  title="List View"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-16 rounded-2xl bg-[#141126] border border-white/10 max-w-md mx-auto">
              <p className="text-sm text-[#8E8AAB] mb-4">Gagal memuat arsip konten dari server.</p>
              <button
                onClick={() => fetchData(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7ee0d2] text-[#0D0B1A] hover:bg-[#6bd6c7] transition-all"
              >
                Coba Muat Ulang
              </button>
            </div>
          )}

          {/* Content Listing */}
          {!loading && !error && filteredContents.length > 0 && (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
            }>
              {filteredContents.map((content) => {
                const catColor = content.categoryColor || getCategoryColor(content.category || content.game_tag);
                const thumb = content.thumbnailUrl || content.thumbnail_url || content.thumbnail;

                if (viewMode === 'list') {
                  return (
                    <div
                      key={content.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#141126] border border-white/5 hover:border-[#7ee0d2]/30 transition-all cursor-pointer"
                      onClick={() => handleWatch(content)}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-28 h-16 rounded-lg bg-[#0D0B1A] overflow-hidden flex-shrink-0 border border-white/5">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={content.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8E8AAB]">
                              <VideoIcon className="w-5 h-5 opacity-40" />
                            </div>
                          )}
                          {content.duration && (
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono text-white bg-black/80">
                              {content.duration}
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: catColor }}>
                            {content.category || content.game_tag}
                          </span>
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#7ee0d2] transition-colors">
                            {content.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#8E8AAB] mt-0.5">
                            <span>{content.date}</span>
                            {content.videoCount > 1 && <span>• {content.videoCount} video</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7ee0d2] text-[#0D0B1A] hover:bg-[#6bd6c7] transition-all flex items-center gap-1.5"
                          onClick={(e) => { e.stopPropagation(); handleWatch(content); }}
                        >
                          <YouTubeIcon />
                          <span>Tonton</span>
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-xs text-[#8E8AAB] hover:text-white hover:bg-white/10 transition-colors"
                          onClick={(e) => handleCopyLink(e, content)}
                          title="Salin link"
                        >
                          {copiedId === content.id ? <CheckIcon /> : <CopyIcon />}
                        </button>
                      </div>
                    </div>
                  );
                }

                // Grid Card
                return (
                  <div
                    key={content.id}
                    className="group rounded-2xl overflow-hidden cursor-pointer bg-[#141126] border border-white/5 hover:border-[#7ee0d2]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                    onClick={() => handleWatch(content)}
                  >
                    {/* 16:9 Thumbnail container */}
                    <div className="relative aspect-video overflow-hidden bg-[#0D0B1A] border-b border-white/5">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8E8AAB]">
                          <VideoIcon className="w-6 h-6 opacity-30" />
                        </div>
                      )}

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Glowing Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[#0D0B1A]/80 border border-[#7ee0d2]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200">
                          <span className="text-[#7ee0d2]"><PlayIcon size={16} /></span>
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs" style={{ background: `${catColor}25`, border: `1px solid ${catColor}40`, color: catColor }}>
                        {content.category || content.game_tag}
                      </div>

                      {/* Duration */}
                      {content.duration && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-white bg-black/80">
                          <ClockIcon />
                          <span>{content.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 leading-snug group-hover:text-[#7ee0d2] transition-colors">
                          {content.title}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8E8AAB]">
                        <span>{content.date || 'Arsip'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-1 rounded text-[#8E8AAB] hover:text-white transition-colors"
                            onClick={(e) => handleCopyLink(e, content)}
                            title="Salin link"
                          >
                            {copiedId === content.id ? <CheckIcon /> : <CopyIcon />}
                          </button>
                          <ExternalIcon className="w-3.5 h-3.5 text-[#8E8AAB] group-hover:text-[#7ee0d2] transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredContents.length === 0 && (
            <div className="py-16 px-6 rounded-2xl bg-[#141126] border border-white/5 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 flex items-center justify-center mb-4 text-[#7ee0d2]">
                <VideoIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                {searchQuery ? 'Tidak Ada Konten Ditemukan' : 'Belum Ada Konten di Kategori Ini'}
              </h3>
              <p className="text-xs text-[#8E8AAB] leading-relaxed mb-5 max-w-sm">
                {searchQuery
                  ? `Tidak ada arsip video yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain atau reset filter.`
                  : 'Arsip tayangan untuk kategori ini akan diperbarui secara otomatis setelah sesi siaran selesai.'}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7ee0d2] text-[#0D0B1A] hover:bg-[#6bd6c7] transition-all"
                >
                  Reset Pencarian
                </button>
              ) : (
                <Link
                  to="/#schedule"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                >
                  <span>Lihat Jadwal Siaran</span>
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />
    </div>
  );
}

export default ContentGuidePage;
