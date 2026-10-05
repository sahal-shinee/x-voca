import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getContent, getFeatured } from '../../services/contentService';
import { useToast } from '../../components/common/Toast';

// ========== ICONS ==========

// Logo Icon
const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="currentColor"/>
  </svg>
);

// Star Icon
const StarIcon = ({ className = "" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="currentColor"/>
  </svg>
);

// Play Icon
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
  </svg>
);

// YouTube Icon
const YouTubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Clock Icon
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Chat Icon
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Music Icon
const MusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Game Icon
const GameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 5.5A6.5 6.5 0 0 1 21.5 12v.5h-1A6.5 6.5 0 0 1 15 5.5zM3.5 12A6.5 6.5 0 0 1 10 5.5v1A6.5 6.5 0 0 1 3.5 12zm11 0A6.5 6.5 0 0 1 10 5.5h1A6.5 6.5 0 0 1 17.5 12z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 17v4m-2 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Eye Icon
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// ChevronRight Icon
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Search Icon
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// External Link Icon
const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom hook for scroll reveal animation
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
        rootMargin: options.rootMargin || '0px',
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

// ========== CONTENT DATA (Demo) ==========
const DEMO_CONTENT = {
  featured: {
    id: 1,
    title: "Midnight Zatsu & Tea: Reading Fan Letters",
    subtitle: "Chit-Chat Live",
    thumbnail: null,
    viewCount: "12.5K",
    duration: "2j 15m",
    category: "ZATSU"
  },
  categories: [
    { id: "zatsu", name: "ZATSU", icon: <ChatIcon />, color: "#c084fc", count: 24 },
    { id: "live2d", name: "LIVE2D", icon: <EyeIcon />, color: "#7ee0d2", count: 12 },
    { id: "indie", name: "INDIE GAMES", icon: <GameIcon />, color: "#fbbf24", count: 18 },
    { id: "karaoke", name: "KARAOKE", icon: <MusicIcon />, color: "#f472b6", count: 8 },
  ],
  contents: [
    { id: 1, title: "Late Night Gaming Session #47", category: "INDIE GAMES", thumbnail: null, duration: "3j 22m", views: "8.2K", status: "new" },
    { id: 2, title: "Fan Letter Reading Special", category: "ZATSU", thumbnail: null, duration: "2j 45m", views: "15.1K", status: "popular" },
    { id: 3, title: "Acoustic Covers Collection", category: "KARAOKE", thumbnail: null, duration: "1j 30m", views: "6.7K", status: "" },
    { id: 4, title: "New Model Debut Stream", category: "LIVE2D", thumbnail: null, duration: "4j 10m", views: "25.3K", status: "new" },
    { id: 5, title: "Horror Game Marathon", category: "INDIE GAMES", thumbnail: null, duration: "5j 05m", views: "18.9K", status: "popular" },
    { id: 6, title: "Birthday Celebration Stream", category: "ZATSU", thumbnail: null, duration: "3j 30m", views: "32.1K", status: "" },
    { id: 7, title: "Subnautica Endurance Run", category: "INDIE GAMES", thumbnail: null, duration: "4j 45m", views: "12.8K", status: "" },
    { id: 8, title: "J-Pop Karaoke Night", category: "KARAOKE", thumbnail: null, duration: "2j 20m", views: "9.4K", status: "" },
  ]
};

/**
 * ContentGuidePage - Enhanced Content Guide Page
 * Based on Figma Design - Content Guide with modern, interactive UI
 */
function ContentGuidePage() {
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for scroll reveal
  const headerRef = useRef(null);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const gridRef = useRef(null);

  // Scroll reveal states
  const [headerVisible, setHeaderVisible] = useState(false);
  const [featuredVisible, setFeaturedVisible] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);

  // Intersection Observer setup
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

    const observers = [
      { ref: headerRef, setVisible: setHeaderVisible },
      { ref: featuredRef, setVisible: setFeaturedVisible },
      { ref: categoriesRef, setVisible: setCategoriesVisible },
      { ref: gridRef, setVisible: setGridVisible },
    ];

    observers.forEach(({ ref, setVisible }) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      }, observerOptions);

      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observers.forEach(({ ref }) => {
        if (ref.current) {
          const observer = new IntersectionObserver(() => {});
          observer.disconnect();
        }
      });
    };
  }, []);

  // Filter contents by category
  const filteredContents = searchQuery
    ? DEMO_CONTENT.contents.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCategory === 'all'
      ? DEMO_CONTENT.contents
      : DEMO_CONTENT.contents.filter(c => c.category === activeCategory);

  // Handle watch click
  const handleWatch = (content) => {
    toast.info(`Opening: ${content.title}`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'new') {
      return (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#7ee0d2] text-[#0f0a22] text-[10px] font-bold uppercase">
          NEW
        </span>
      );
    }
    if (status === 'popular') {
      return (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#c084fc] text-white text-[10px] font-bold uppercase">
          HOT
        </span>
      );
    }
    return null;
  };

  // Get category color
  const getCategoryColor = (category) => {
    const cat = DEMO_CONTENT.categories.find(c => c.name === category);
    return cat?.color || '#a89ec0';
  };

  return (
    <div className="min-h-screen bg-[#0f0a22]">
      {/* ========== HEADER ========== */}
      <header
        ref={headerRef}
        className={`relative bg-[#0f0a22] pt-6 pb-8 px-4 sm:px-6 lg:px-12 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#7ee0d2] opacity-5 blur-[100px]" />
          <div className="absolute top-40 left-20 w-64 h-64 rounded-full bg-[#c084fc] opacity-5 blur-[80px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#7ee0d2] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-[#0f0a22] font-bold">✦</span>
              </div>
              <span className="font-bold text-white text-lg font-display">X-VOCA</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-[#a89ec0] hover:text-white text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/voting" className="text-[#a89ec0] hover:text-white text-sm font-medium transition-colors">
                Voting
              </Link>
              <Link to="/content" className="text-[#7ee0d2] text-sm font-semibold border-b-2 border-[#7ee0d2] pb-0.5">
                Content Guide
              </Link>
            </div>
          </nav>

          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(126,224,210,0.1)] border border-[rgba(126,224,210,0.2)] mb-4">
              <span className="text-[#7ee0d2]">✦</span>
              <span className="text-[#7ee0d2] text-xs font-bold tracking-wider uppercase">Content Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 font-display tracking-tight">
              Cosmic Archive & Media Vault
            </h1>
            <p className="text-[#a89ec0] max-w-xl mx-auto">
              Jelajahi semua perjalanan stream Xion. Dari zatsu santai hingga petualangan indie games.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <SearchIcon />
              <input
                type="text"
                placeholder="Cari konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a1730] border border-[#2a2645] rounded-xl text-white placeholder-[#5c5480] focus:border-[#7ee0d2] focus:outline-none transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5480]">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== FEATURED CONTENT ========== */}
      <section
        ref={featuredRef}
        className={`px-4 sm:px-6 lg:px-12 pb-8 transition-all duration-700 delay-100 ${featuredVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Section Label */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#7ee0d2]">✦</span>
            <span className="text-[#7ee0d2] text-xs font-bold tracking-widest uppercase">Featured Stream</span>
          </div>

          {/* Featured Card */}
          <div
            className="relative bg-[#231f42] border border-[rgba(61,53,96,0.7)] rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => handleWatch(DEMO_CONTENT.featured)}
          >
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d2855] via-[#231f42] to-[#1a1730]">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c084fc] blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7ee0d2] blur-[100px]" />
              </div>
            </div>

            {/* Content */}
            <div className="relative flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
              {/* Thumbnail */}
              <div className="lg:w-[400px] flex-shrink-0">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1730] border border-[rgba(61,53,96,0.5)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#7ee0d2]/20 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#7ee0d2] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayIcon />
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono">
                    {DEMO_CONTENT.featured.duration}
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444] shadow-[0px_0px_12px_rgba(239,68,68,0.4)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-[rgba(192,132,252,0.2)] text-[#c084fc] text-[10px] font-bold uppercase tracking-wider">
                    {DEMO_CONTENT.featured.category}
                  </span>
                  <span className="text-[#5c5480] text-xs">•</span>
                  <span className="text-[#a89ec0] text-xs">{DEMO_CONTENT.featured.viewCount} views</span>
                </div>

                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 font-display">
                  {DEMO_CONTENT.featured.title}
                </h2>
                <p className="text-[#a89ec0] mb-4">
                  {DEMO_CONTENT.featured.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7ee0d2] text-[#0f0a22] font-bold text-sm rounded-lg hover:bg-[#7ee0d2]/90 transition-colors"
                  >
                    <YouTubeIcon />
                    Watch Now
                  </a>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#3d3560] text-[#a89ec0] font-medium text-sm rounded-lg hover:border-[#7ee0d2] hover:text-white transition-colors">
                    <span>Details</span>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section
        ref={categoriesRef}
        className={`px-4 sm:px-6 lg:px-12 pb-6 transition-all duration-700 delay-200 ${categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-[#7ee0d2] text-[#0f0a22] font-bold'
                  : 'bg-[#1a1730] text-[#a89ec0] hover:bg-[#231f42]'
              }`}
            >
              All Content
            </button>
            {DEMO_CONTENT.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.name
                    ? 'text-[#0f0a22] font-bold'
                    : 'bg-[#1a1730] text-[#a89ec0] hover:bg-[#231f42]'
                }`}
                style={{
                  backgroundColor: activeCategory === cat.name ? cat.color : undefined,
                  color: activeCategory === cat.name ? '#0f0a22' : undefined
                }}
              >
                <span className="opacity-60">{cat.icon}</span>
                {cat.name}
                <span className="text-[10px] font-mono opacity-60">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTENT GRID ========== */}
      <section
        ref={gridRef}
        className={`px-4 sm:px-6 lg:px-12 pb-12 lg:pb-20 transition-all duration-700 delay-300 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#a89ec0] text-sm">
              Showing <span className="text-white font-semibold">{filteredContents.length}</span> content
              {searchQuery && <span> for "<span className="text-[#7ee0d2]">{searchQuery}</span>"</span>}
            </p>
          </div>

          {/* Content Grid */}
          {filteredContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredContents.map((content, index) => (
                <div
                  key={content.id}
                  className="group bg-[#1a1730] border border-[#2a2645] rounded-xl overflow-hidden hover:border-[rgba(126,224,210,0.3)] transition-all duration-300 hover:shadow-lg hover:shadow-black/20 cursor-pointer"
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={() => handleWatch(content)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-[#231f42] overflow-hidden">
                    {/* Gradient Placeholder */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ background: `linear-gradient(135deg, ${getCategoryColor(content.category)}33 0%, transparent 100%)` }}
                    />

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#7ee0d2] flex items-center justify-center">
                          <PlayIcon />
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {getStatusBadge(content.status)}

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                      {content.duration}
                    </div>

                    {/* Category Icon */}
                    <div
                      className="absolute bottom-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      style={{ backgroundColor: `${getCategoryColor(content.category)}33` }}
                    >
                      <span style={{ color: getCategoryColor(content.category) }}>
                        {content.category === 'ZATSU' && <ChatIcon />}
                        {content.category === 'LIVE2D' && <EyeIcon />}
                        {content.category === 'INDIE GAMES' && <GameIcon />}
                        {content.category === 'KARAOKE' && <MusicIcon />}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mb-2"
                      style={{ color: getCategoryColor(content.category) }}
                    >
                      {content.category}
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-[#7ee0d2] transition-colors">
                      {content.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#5c5480]">
                      <span className="flex items-center gap-1">
                        <EyeIcon />
                        {content.views}
                      </span>
                      <ExternalIcon />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1730] border border-[#2a2645] rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#231f42] flex items-center justify-center mx-auto mb-4">
                <SearchIcon />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No content found</h3>
              <p className="text-[#5c5480] text-sm mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-4 py-2 bg-[#7ee0d2] text-[#0f0a22] font-bold text-sm rounded-lg hover:bg-[#7ee0d2]/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========== FOOTER CTA ========== */}
      <section className="px-4 sm:px-6 lg:px-12 pb-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-[#1a1730] border border-[#2a2645] rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c084fc]/20 flex items-center justify-center">
                  <span className="text-[#c084fc] text-xl">✦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Mencari klip atau momen tertentu?</h3>
                  <p className="text-[#5c5480] text-sm">Temukan momen-momen terbaik di Discord Vault komunitas</p>
                </div>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#3d3560] text-white font-medium text-sm rounded-lg hover:bg-[#231f42] hover:border-[#7ee0d2] transition-all"
              >
                Buka Discord Vault
                <ExternalIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-[#0a0616] border-t border-[#2a2645] py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#5c5480] hover:text-[#7ee0d2] transition-colors text-sm">
              ← Back to Home
            </Link>
            <p className="text-[#5c5480] text-xs font-mono">
              © 2025 X-VOCA PROJECT. ALL BROADCAST RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ContentGuidePage;
