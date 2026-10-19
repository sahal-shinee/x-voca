import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getSchedules } from '../../services/scheduleService';
import { CollabRequestModal } from './CollabRequestModal';

// ========== ICONS (PRESERVED) ==========

const CalendarIcon = () => (
  <svg width="12" height="13.33" viewBox="0 0 12 13.33" fill="none" aria-hidden="true">
    <path d="M10 1.5H2C1.45 1.5 1 1.95 1 2.5V11.83C1 12.38 1.45 12.83 2 12.83H10C10.55 12.83 11 12.38 11 11.83V2.5C11 1.95 10.55 1.5 10 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 0.5V2.5M4 0.5V2.5M1 4.5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12.5" viewBox="0 0 12 12.5" fill="none" aria-hidden="true">
    <circle cx="6" cy="6.25" r="5" stroke="#a89ec0" strokeWidth="1.2"/>
    <path d="M6 3.25V6.25L8 8.25" stroke="#a89ec0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="18.33" height="11" viewBox="0 0 18.33 11" fill="none" aria-hidden="true">
    <path d="M0.5 0.5V10.5L17.83 5.5L0.5 0.5Z" stroke="#a89ec0" strokeWidth="1"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="16.5" height="16.5" viewBox="0 0 16.5 16.5" fill="none" aria-hidden="true">
    <path d="M14 9.5C14.667 10.5 15 11 15 11C15 11 14.667 11.5 14 12.5C13.333 13.5 12 14.5 8.25 14.5C5.667 14.5 3.5 13.833 2 12.5C1.667 12.167 1 11.167 1 10C1 8.833 1.5 7.5 2.5 6C3.833 4 5.5 3.5 8.25 3.5C12 3.5 14.5 5.5 14.5 8.5C14.5 9 14.333 9.333 14 9.5Z" stroke="#a89ec0" strokeWidth="1.2"/>
  </svg>
);

const GameIcon = () => (
  <svg width="18.33" height="16.5" viewBox="0 0 18.33 16.5" fill="none" aria-hidden="true">
    <path d="M9.165 0H9C4.5 0 1 3.5 1 8C1 9.5 1.5 11 2.5 12L1 16H5.5L6.5 13.5H11.83L12.83 16H17.33L15.83 12C16.83 11 17.33 9.5 17.33 8C17.33 3.5 13.83 0 9.165 0ZM11.33 9.5H9.165L7.33 11.33V5.67L9.165 7.5H11.33L13.165 5.67V11.33L11.33 9.5Z" fill="#a89ec0"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="11" height="16.5" viewBox="0 0 11 16.5" fill="none" aria-hidden="true">
    <path d="M8.25 0V11L1.375 8.25V3L8.25 0Z" fill="#a89ec0"/>
    <path d="M10.5 0V14.5C10.5 15.05 10.05 15.5 9.5 15.5C8.95 15.5 8.5 15.05 8.5 14.5V3.5L1.375 1V13.5C1.375 14.05 0.925 14.5 0.375 14.5C-0.175 14.5 -0.625 14.05 -0.625 13.5V0H0.375V2.5L8.25 5V2.5H10.5V0Z" fill="#a89ec0"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
    <path d="M1 0C0.45 0 0 0.45 0 1V11C0 11.55 0.45 12 1 12H14C14.55 12 15 11.55 15 11V4C15 3.45 14.55 3 14 3H7.5L6 1.5C6 1.5 5.75 1 5.5 1H1Z" fill="#a89ec0"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExternalArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M3 12L12 3M12 3H6M12 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ScrollLeftIcon = () => (
  <svg width="10.5" height="6" viewBox="0 0 10.5 6" fill="none" aria-hidden="true">
    <path d="M1 5L5 1L9 5" stroke="#a89ec0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Additional icons
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="8" width="2.5" height="4" rx="1" fill="currentColor"/>
    <rect x="5.25" y="5" width="2.5" height="7" rx="1" fill="currentColor"/>
    <rect x="9.5" y="2" width="2.5" height="10" rx="1" fill="currentColor" opacity="0.4"/>
  </svg>
);

// Platform Icons
const YouTubeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
    <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitchIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#9146ff" aria-hidden="true">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

const GlobeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// ========== HOOKS ==========

// Custom hook for scroll reveal animation (PRESERVED)
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

// Drag-to-scroll hook
const useDragScroll = (containerRef) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const animFrame = useRef(null);

  const onMouseDown = useCallback((e) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    lastX.current = e.pageX;
    velocity.current = 0;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    containerRef.current.style.cursor = 'grabbing';
    containerRef.current.style.userSelect = 'none';
  }, [containerRef]);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    velocity.current = e.pageX - lastX.current;
    lastX.current = e.pageX;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, [containerRef]);

  const onMouseUp = useCallback(() => {
    if (!containerRef.current) return;
    isDragging.current = false;
    containerRef.current.style.cursor = 'grab';
    containerRef.current.style.userSelect = '';
    // Momentum scroll
    const momentum = () => {
      if (Math.abs(velocity.current) < 0.5 || !containerRef.current) return;
      containerRef.current.scrollLeft -= velocity.current * 0.9;
      velocity.current *= 0.88;
      animFrame.current = requestAnimationFrame(momentum);
    };
    momentum();
  }, [containerRef]);

  const onTouchStart = useCallback((e) => {
    if (!containerRef.current) return;
    startX.current = e.touches[0].pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    lastX.current = e.touches[0].pageX;
    velocity.current = 0;
  }, [containerRef]);

  const onTouchMove = useCallback((e) => {
    if (!containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.1;
    velocity.current = e.touches[0].pageX - lastX.current;
    lastX.current = e.touches[0].pageX;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.cursor = 'grab';
    const handleMouseLeave = () => {
      if (isDragging.current) onMouseUp();
    };
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [containerRef, onMouseUp]);

  return { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove };
};

// ========== HELPER FUNCTIONS ==========

// Safe parse date
const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Format tanggal ke format Indonesia (WIB) - safe version
const formatTanggalWIB = (dateString) => {
  const date = safeParseDate(dateString);
  if (!date) return '';
  try {
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      timeZoneName: 'short'
    };
    const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
    // Convert "00.00 WIB" format
    return formatted.replace(/\.\d{2}\s/, ':').replace(/\sWIB$/, ' WIB');
  } catch {
    return '';
  }
};

// Hitung countdown dan return string - safe version
const hitungCountdownString = (targetDateString) => {
  const target = safeParseDate(targetDateString);
  if (!target) return null;
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `in ${days}d ${hours}h`;
  } else if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  } else {
    return `in ${minutes}m`;
  }
};

// Get platform icon component
const getPlatformIcon = (platform) => {
  if (!platform) return <YouTubeIcon size={12} />;
  const lower = platform.toLowerCase();
  if (lower.includes('youtube')) return <YouTubeIcon size={12} />;
  if (lower.includes('twitch')) return <TwitchIcon size={12} />;
  return <GlobeIcon size={12} />;
};

// Map game category ke icon type
const getIconFromCategory = (category) => {
  if (!category) return 'folder';
  const lower = category.toLowerCase();
  if (lower.includes('chat') || lower.includes('zatsu') || lower.includes('chit')) return 'chat';
  if (lower.includes('music') || lower.includes('karaoke') || lower.includes('acoustic') || lower.includes('song')) return 'music';
  if (lower.includes('game') || lower.includes('play') || lower.includes('rpg') || lower.includes('horror') || lower.includes('exploration')) return 'game';
  return 'play';
};

// Transform API data ke format yang dibutuhkan component
const transformScheduleData = (data) => {
  if (!data || !data.id) return null;

  // Use scheduled_at (ISO format) for countdown calculations
  // Use scheduled_at_wib for display only
  const scheduledAtISO = data.scheduled_at; // ISO format for countdown
  const scheduledAtWIB = data.scheduled_at_wib || data.scheduled_at; // For display
  const liveStartedAt = data.live_started_at; // Real start time for live streams

  // Calculate countdown using ISO date
  const countdownString = hitungCountdownString(scheduledAtISO);

  return {
    id: data.id,
    status: data.status || 'upcoming',
    title: data.title || 'Untitled Stream',
    subtitle: data.description ? data.description.substring(0, 50) : '',
    tag: data.game_category || 'GENERAL',
    time: scheduledAtWIB ? formatTanggalWIB(scheduledAtWIB) : 'TBD',
    scheduled_at: scheduledAtISO, // Store ISO date for reference
    live_started_at: liveStartedAt, // Real start time for live streams
    countdown: countdownString,
    estimated_duration: data.estimated_duration || '±2-3 Jam',
    platform: data.stream_platform || 'YouTube',
    thumbnail_url: data.thumbnail_url,
    youtube_url: data.youtube_url,
    icon: getIconFromCategory(data.game_category),
    collab_guest: data.collab_guest,
    collab_social: data.collab_social,
    cta: data.status === 'live' ? 'Tonton Siaran Sekarang' :
         data.status === 'done' ? 'Buka Arsip' : 'Lihat Detail',
  };
};

// ========== LIVE TIMER (Real-time based on live_started_at) ==========
const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!startTime) return;

    const startDate = new Date(startTime);

    const calculateElapsed = () => {
      const now = new Date();
      const diff = Math.max(0, now - startDate); // Ensure non-negative

      const totalSeconds = Math.floor(diff / 1000);
      const s = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const m = totalMinutes % 60;
      const h = Math.floor(totalMinutes / 60);

      return { h, m, s };
    };

    // Initial calculation
    setElapsed(calculateElapsed());

    // Update every second
    const id = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(id);
  }, [startTime]);

  return (
    <span className="font-mono text-[10px] text-red-400/70 tabular-nums">
      {String(elapsed.h).padStart(2, '0')}:{String(elapsed.m).padStart(2, '0')}:{String(elapsed.s).padStart(2, '0')}
    </span>
  );
};

// ========== COUNTDOWN BADGE ==========
const CountdownBadge = ({ text }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wider">
    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
      <path d="M6.25 0L7.5 3.5H11.25L8 6L9.5 10L6.25 7.5L3 10L4.5 6L1.25 3.5H5L6.25 0Z" fill="#f59e0b"/>
    </svg>
    {text}
  </span>
);

// Loading Skeleton Card
const SkeletonCard = () => (
  <div className="relative flex-shrink-0 w-[320px] sm:w-[360px] lg:w-[380px] rounded-3xl overflow-hidden flex flex-col animate-pulse">
    <div className="h-[3px] bg-gradient-to-r from-violet-500/30 to-transparent"></div>
    <div className="flex flex-col flex-1 px-6 py-7">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-20 h-6 bg-white/5 rounded-full"></div>
        <div className="w-28 h-5 bg-white/5 rounded-full"></div>
      </div>
      {/* Icon + Title skeleton */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
        <div className="flex-1">
          <div className="w-48 h-5 bg-white/5 rounded mb-2"></div>
          <div className="w-32 h-4 bg-white/5 rounded"></div>
        </div>
      </div>
      {/* Meta info skeleton */}
      <div className="space-y-3">
        <div className="w-36 h-4 bg-white/5 rounded"></div>
        <div className="w-24 h-6 bg-white/5 rounded-lg"></div>
      </div>
      {/* CTA skeleton */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="w-32 h-4 bg-white/5 rounded"></div>
      </div>
    </div>
  </div>
);

// ========== MAIN COMPONENT ==========
const ScheduleSection = () => {
  const scrollContainerRef = useRef(null);
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragScroll = useDragScroll(scrollContainerRef);

  // State untuk data dari API
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // Fetch schedules dari API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[ScheduleSection] Fetching schedules...');

        // Fetch all schedules (live, upcoming, done)
        const [liveResult, upcomingResult, doneResult] = await Promise.all([
          getSchedules({ status: 'live', limit: 5 }).catch(() => ({ data: [] })),
          getSchedules({ status: 'upcoming', limit: 10 }).catch(() => ({ data: [] })),
          getSchedules({ status: 'done', limit: 5 }).catch(() => ({ data: [] })),
        ]);

        console.log('[ScheduleSection] liveResult:', liveResult);
        console.log('[ScheduleSection] upcomingResult:', upcomingResult);
        console.log('[ScheduleSection] doneResult:', doneResult);

        // Extract data arrays from response (service returns { success, data: [...] })
        const liveSchedules = Array.isArray(liveResult) ? liveResult : (liveResult?.data || []);
        const upcomingSchedules = Array.isArray(upcomingResult) ? upcomingResult : (upcomingResult?.data || []);
        const doneSchedules = Array.isArray(doneResult) ? doneResult : (doneResult?.data || []);

        console.log('[ScheduleSection] Extracted liveSchedules:', liveSchedules.length);
        console.log('[ScheduleSection] Extracted upcomingSchedules:', upcomingSchedules.length);
        console.log('[ScheduleSection] Extracted doneSchedules:', doneSchedules.length);

        // Combine dan transform data
        const allSchedules = [
          ...liveSchedules,
          ...upcomingSchedules,
          ...doneSchedules,
        ].map(transformScheduleData).filter(Boolean);

        console.log('[ScheduleSection] Final allSchedules count:', allSchedules.length);
        console.log('[ScheduleSection] allSchedules:', allSchedules);

        // Sort by scheduled_at (terdekat dulu) - safe version
        allSchedules.sort((a, b) => {
          const dateA = safeParseDate(a.scheduled_at)?.getTime() || 0;
          const dateB = safeParseDate(b.scheduled_at)?.getTime() || 0;
          return dateA - dateB;
        });

        setSchedules(allSchedules);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Gagal memuat jadwal');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Helper functions for card styling
  const getStatusBadge = (status) => {
    if (status === 'live') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444] shadow-[0px_0px_6px_rgba(239,68,68,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span className="font-bold text-white text-[11px] tracking-wider uppercase font-sans">LIVE NOW</span>
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent-cyan-light text-bg-base font-bold text-[11px] tracking-wider uppercase font-sans">
          UPCOMING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#3d3560] text-[#a89ec0] font-medium text-[11px] tracking-wider uppercase font-sans">
        DONE
      </span>
    );
  };

  const getTagClass = (status) => {
    if (status === 'done') {
      return 'bg-[#2c263f] text-[#a89ec0]';
    }
    return 'bg-[rgba(192,132,252,0.15)] text-accent-lilac';
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'play': return <PlayIcon />;
      case 'chat': return <ChatIcon />;
      case 'game': return <GameIcon />;
      case 'music': return <MusicIcon />;
      default: return <FolderIcon />;
    }
  };

  const getIconColorClass = (status) => {
    if (status === 'done') return 'opacity-60';
    return '';
  };

  const getTitleColorClass = (status) => {
    if (status === 'done') return 'text-[#a89ec0]';
    return 'text-white';
  };

  const getTextColorClass = (status) => {
    if (status === 'done') return 'text-[#5c5480]';
    return 'text-[#a89ec0]';
  };

  const getCtaColorClass = (status) => {
    if (status === 'live') return 'text-[#ef4444] hover:text-[#ef4444]';
    if (status === 'done') return 'text-[#a89ec0] hover:text-white';
    return 'text-accent-cyan-light hover:text-white';
  };

  // ========== SCROLL CONTROLS ==========
  const CARD_WIDTH = 360;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (i) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: i * CARD_WIDTH, behavior: 'smooth' });
    }
  };

  // Track scroll position for dots + button states
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / CARD_WIDTH);
    setActiveIndex(Math.max(0, Math.min(idx, schedules.length - 1)));
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, [schedules.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section
      id="schedule"
      className="relative w-full pt-20 sm:pt-18 lg:pt-20 pb-24 lg:pb-36 overflow-hidden"
      style={{ background: '#0f0a22' }}
    >
      {/* ── Decorative background elements ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal scan line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent top-0" />
        {/* Large ambient glow bottom-left */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[80px]" />
        {/* Right glow */}
        <div className="absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full bg-cyan-900/8 blur-[70px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div
          ref={headerRef}
          className={`mb-12 lg:mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Two-column header layout */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left: title block */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(192,132,252,0.1)] border border-[rgba(192,132,252,0.2)] mb-5">
                <span className="text-accent-lilac text-xs">✦</span>
                <span className="font-bold text-accent-lilac text-[11px] tracking-wider uppercase font-sans">
                  JADWAL STREAM
                </span>
              </div>
              <h2 className="text-3xl lg:text-[40px] font-bold text-white tracking-[-0.8px] mb-4 font-display leading-[1.1]">
                Upcoming Broadcast<br className="hidden sm:block" /> Transmission
              </h2>
              <p className="text-[#a89ec0] text-[15px] max-w-[460px] leading-relaxed">
                Frekuensi siaran langsung malam hari. Jadwal dapat bergeser sesuai stabilitas orbit.
              </p>
            </div>

            {/* Right: signal status panel */}
            <div className="flex items-center gap-3 lg:pb-2">
              <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2.5 min-w-[200px]">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Status Siaran</span>
                  <SignalIcon />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[12px] font-bold text-red-400 tracking-wide">ON AIR</span>
                  <span className="ml-auto text-[11px]">
                    <LiveTimer startTime={schedules.find(s => s.status === 'live')?.live_started_at} />
                  </span>
                </div>
                {/* Mini waveform */}
                <div className="flex items-end gap-[3px] h-5 mt-1">
                  {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.3, 0.7, 0.5, 0.9].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-red-400/50 animate-pulse"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Schedule count */}
              <div className="px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center min-w-[100px] h-full flex flex-col justify-center">
                {loading ? (
                  <>
                    <div className="w-12 h-8 bg-white/5 rounded animate-pulse mx-auto mb-1"></div>
                    <div className="w-16 h-3 bg-white/5 rounded animate-pulse mx-auto"></div>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white mb-1">{schedules.length}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Jadwal</p>
                    <div className="flex justify-center gap-1.5 mt-3">
                      {schedules.slice(0, 5).map((s) => (
                        <span
                          key={s.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'live' ? 'bg-red-400' :
                            s.status === 'upcoming' ? 'bg-cyan-400/70' :
                            'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Timeline Bar ── */}
        <div
          className={`flex items-center gap-3 mb-6 px-2 transition-all duration-500 delay-100 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center gap-2.5">
            <ScrollLeftIcon />
            <span className="font-semibold text-[#6d6494] text-[11px] tracking-widest uppercase font-sans">
              TRANS-SPECTRA FEED [UTC+07]
            </span>
          </div>

          {/* Timeline dots — clickable */}
          <div className="flex items-center gap-2 ml-4">
            {schedules.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? 'w-8 h-2 bg-violet-400'
                    : 'w-2 h-2 bg-white/15 hover:bg-white/35'
                }`}
                aria-label={`Scroll ke jadwal ${i + 1}`}
              />
            ))}
          </div>

          {/* Controls: Request Collab + Arrow controls — always pushed to end */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => setIsCollabModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-purple/10 border border-accent-purple/25 hover:border-accent-purple/50 text-accent-lilac hover:bg-accent-purple/20 text-xs font-semibold transition-all duration-150 shadow-sm"
              title="Request Collab Streamer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Request Collab</span>
            </button>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? 'bg-[#231f42] border-[#3d3560] hover:border-violet-400/50 hover:bg-[#2d2855] text-white/80 hover:text-white shadow-lg'
                  : 'bg-white/[0.03] border-white/[0.05] text-white/15 cursor-not-allowed'
              }`}
              aria-label="Geser kiri"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? 'bg-[#231f42] border-[#3d3560] hover:border-violet-400/50 hover:bg-[#2d2855] text-white/80 hover:text-white shadow-lg'
                  : 'bg-white/[0.03] border-white/[0.05] text-white/15 cursor-not-allowed'
              }`}
              aria-label="Geser kanan"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* ── Drag hint (first visit feel) ── */}
        <div className={`flex items-center gap-2 mb-4 px-2 transition-all duration-500 delay-150 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[10px] text-white/30 tracking-wide font-medium">
            ← Geser atau tarik kartu untuk menjelajahi jadwal →
          </span>
        </div>

        {/* ── Cards Scroll Area ── */}
        <div ref={cardsRef} className="relative">
          {/* Left fade mask */}
          <div
            className={`absolute left-0 top-0 bottom-4 w-20 z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to right, #0f0a22, transparent)' }}
          />
          {/* Right fade mask */}
          <div
            className={`absolute right-0 top-0 bottom-4 w-24 z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(to left, #0f0a22, transparent)' }}
          />

          <div
            ref={scrollContainerRef}
            className="flex gap-5 lg:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x snap-mandatory select-none"
            onMouseDown={dragScroll.onMouseDown}
            onMouseMove={dragScroll.onMouseMove}
            onMouseUp={dragScroll.onMouseUp}
            onTouchStart={dragScroll.onTouchStart}
            onTouchMove={dragScroll.onTouchMove}
            onTouchEnd={dragScroll.onMouseUp}
          >
            {/* Leading spacer for peek effect */}
            <div className="flex-shrink-0 w-0" />

            {/* Loading State - Show skeleton cards */}
            {loading && (
              <>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </>
            )}

            {/* Empty State */}
            {!loading && schedules.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <CalendarIcon />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Belum Ada Jadwal</h3>
                <p className="text-[#a89ec0] text-sm max-w-[300px]">
                  Saat ini belum ada jadwal stream yang tersedia. Silakan kembali lagi nanti.
                </p>
              </div>
            )}

            {/* Schedule Cards */}
            {!loading && schedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`
                  relative flex-shrink-0 w-[320px] sm:w-[360px] lg:w-[380px]
                  rounded-3xl overflow-hidden
                  flex flex-col
                  snap-start
                  transition-all duration-500 ease-out
                  group
                  ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                  ${schedule.status === 'done' ? 'opacity-60' : ''}
                `}
                style={{
                  transitionDelay: `${index * 80}ms`,
                  background: schedule.status === 'live'
                    ? 'linear-gradient(155deg, #271a3a 0%, #1e1530 55%, #191330 100%)'
                    : schedule.status === 'done'
                    ? '#141028'
                    : '#1a1530',
                  border: `1px solid ${
                    schedule.status === 'live'
                      ? 'rgba(239,68,68,0.22)'
                      : schedule.status === 'done'
                      ? 'rgba(61,53,96,0.35)'
                      : 'rgba(61,53,96,0.65)'
                  }`,
                  boxShadow: schedule.status === 'live'
                    ? '0 0 0 1px rgba(239,68,68,0.1), 0 24px 50px -12px rgba(0,0,0,0.65)'
                    : '0 12px 32px -8px rgba(0,0,0,0.4)',
                }}
              >
                {/* Thumbnail Background */}
                {schedule.thumbnail_url && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={schedule.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1530] via-[#1a1530]/80 to-transparent"></div>
                  </div>
                )}

                {/* Top accent line — all cards */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px] pointer-events-none z-20"
                  style={{
                    background: schedule.status === 'live'
                      ? 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(239,68,68,0.4), transparent 80%)'
                      : schedule.status === 'upcoming'
                      ? 'linear-gradient(90deg, rgba(167,139,250,0.7), rgba(94,234,212,0.4), transparent 80%)'
                      : 'linear-gradient(90deg, rgba(61,53,96,0.7), transparent 80%)',
                  }}
                />

                {/* Ambient glow for live card */}
                {schedule.status === 'live' && (
                  <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-red-500/[0.08] blur-[22px] pointer-events-none z-0" />
                )}

                {/* Uniform inner padding for all cards */}
                <div className="relative z-10 flex flex-col flex-1 px-6 py-7">

                  {/* Status + tag row */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    {getStatusBadge(schedule.status)}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold ${getTagClass(schedule.status)}`}>
                      {schedule.tag}
                    </span>
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-[#2d2855] border border-[rgba(61,53,96,0.8)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner ${getIconColorClass(schedule.status)}`}
                    >
                      {getIcon(schedule.icon)}
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <h3 className={`text-[16px] font-bold leading-tight font-display ${getTitleColorClass(schedule.status)}`}>
                        {schedule.title}
                      </h3>
                      {schedule.subtitle && (
                        <span className={`text-[13px] font-medium mt-1 ${getTextColorClass(schedule.status)}`}>
                          {schedule.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Collab Guest Indicator */}
                  {schedule.collab_guest && (
                    <div className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-xl bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.25)] text-xs text-accent-lilac">
                      <span className="text-accent-cyan text-xs">✦</span>
                      <span className="font-medium truncate">
                        Collab with: {schedule.collab_guest.startsWith('@') ? schedule.collab_guest : `@${schedule.collab_guest}`}
                      </span>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className={getTextColorClass(schedule.status)}>
                        {schedule.status === 'live' ? <ClockIcon /> : schedule.status === 'done' ? <FolderIcon /> : <CalendarIcon />}
                      </span>
                      <span className={`text-[13px] font-medium ${getTextColorClass(schedule.status)}`}>
                        {schedule.time}
                      </span>
                    </div>

                    {/* Platform + Duration */}
                    <div className="flex items-center gap-3">
                      {/* Platform Badge */}
                      <div className="flex items-center gap-1.5">
                        {getPlatformIcon(schedule.platform)}
                        <span className={`text-[11px] ${getTextColorClass(schedule.status)}`}>
                          {schedule.platform}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-1.5">
                        <ClockIcon />
                        <span className={`text-[11px] ${getTextColorClass(schedule.status)}`}>
                          {schedule.estimated_duration}
                        </span>
                      </div>
                    </div>

                    {schedule.countdown && (
                      <div className="mt-2">
                        <CountdownBadge text={schedule.countdown} />
                      </div>
                    )}

                    {schedule.status === 'live' && (
                      <div className="flex items-center gap-2 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 w-max">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                        </span>
                        <span className="font-bold text-[#ef4444] text-[11px] tracking-wider font-sans uppercase">Sedang Berlangsung</span>
                        <div className="ml-2 pl-3 border-l border-red-500/30 flex items-center">
                          <LiveTimer startTime={schedule.live_started_at} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA footer */}
                  <div className="mt-auto pt-6 border-t border-[rgba(61,53,96,0.5)]">
                    {/* Live streams - always show YouTube link */}
                    {schedule.status === 'live' ? (
                      <a
                        href={schedule.youtube_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between group/link ${getCtaColorClass(schedule.status)} ${!schedule.youtube_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (!schedule.youtube_url) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <span className="text-[13px] font-bold font-body flex items-center gap-2">
                          <YouTubeIcon size={14} className="text-red-500" />
                          Tonton di YouTube
                        </span>
                        <span className="transition-transform duration-300 group-hover/link:translate-x-1.5 bg-white/5 p-1.5 rounded-full">
                          <ExternalArrowIcon />
                        </span>
                      </a>
                    ) : schedule.status === 'done' ? (
                      <a
                        href={schedule.youtube_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between group/link ${getCtaColorClass(schedule.status)} ${!schedule.youtube_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (!schedule.youtube_url) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <span className="text-[13px] font-semibold font-body">Buka Arsip</span>
                        <span className="transition-transform duration-300 group-hover/link:translate-x-1.5 bg-white/5 p-1.5 rounded-full">
                          <ExternalArrowIcon />
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={schedule.youtube_url || '#'}
                        target={schedule.youtube_url ? '_blank' : '_self'}
                        rel={schedule.youtube_url ? 'noopener noreferrer' : ''}
                        className={`flex items-center justify-between group/link ${getCtaColorClass(schedule.status)} ${!schedule.youtube_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (!schedule.youtube_url) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <span className="text-[13px] font-semibold font-body group-hover/link:underline underline-offset-2">
                          {schedule.youtube_url ? 'Reserve Stream' : 'Link Belum Ada'}
                        </span>
                        <span className="transition-transform duration-300 group-hover/link:translate-x-1.5 bg-white/5 p-1.5 rounded-full">
                          <ArrowRightIcon />
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>

        {/* ── Bottom bar: dots + hint ── */}
        <div className={`flex items-center justify-between mt-3 px-1 transition-all duration-500 delay-200 ${cardsVisible && !loading ? 'opacity-100' : 'opacity-0'}`}>
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {!loading && schedules.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-8 h-2 bg-violet-400/80'
                    : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                }`}
                aria-label={`Jadwal ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress counter */}
          {!loading && schedules.length > 0 && (
            <span className="text-[10px] text-white/20 tabular-nums">
              {activeIndex + 1} / {schedules.length}
            </span>
          )}
        </div>

        {/* ── Collab Request Banner ── */}
        <div className={`mt-10 transition-all duration-500 delay-300 ${cardsVisible && !loading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(192,132,252,0.12)] border border-[rgba(192,132,252,0.25)] flex items-center justify-center text-accent-lilac flex-shrink-0 shadow-inner">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display">
                  Ingin Streamer Favoritmu Collab Bareng Xion?
                </h4>
                <p className="text-xs sm:text-sm text-[#a89ec0] mt-0.5 max-w-xl">
                  Beri tahu kami creator atau Vtuber mana yang ingin kamu tonton bersama Xion Regalia di siaran mendatang.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCollabModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase font-sans bg-gradient-to-r from-accent-cyan to-accent-lilac text-[#13111C] hover:opacity-95 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_20px_rgba(126,224,210,0.25)] flex items-center justify-center gap-2 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Request Collab</span>
            </button>
          </div>
        </div>

      </div>

      {/* Collab Request Modal */}
      <CollabRequestModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />
    </section>
  );
};

export default ScheduleSection;
