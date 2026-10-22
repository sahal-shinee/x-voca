import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle,
  Copy,
  Check,
  CalendarPlus,
} from 'lucide-react';
import { getSchedules } from '../../services/scheduleService';
import { CollabRequestModal } from './CollabRequestModal';

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

// Safe parse date helper
const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Format date to Indonesian WIB format safely
const formatTanggalWIB = (dateInput) => {
  if (!dateInput) return '-';
  const date = safeParseDate(dateInput);
  if (!date) return '-';
  try {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const wib = new Date(utc + (3600000 * 7));

    const dayName = days[wib.getDay()];
    const day = wib.getDate();
    const month = months[wib.getMonth()];
    const year = wib.getFullYear();
    const hours = String(wib.getHours()).padStart(2, '0');
    const minutes = String(wib.getMinutes()).padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes} WIB`;
  } catch {
    return '-';
  }
};

// Countdown string calculation
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
    return `Dalam ${days} hari ${hours} jam`;
  } else if (hours > 0) {
    return `Dalam ${hours} jam ${minutes} mnt`;
  } else {
    return `Dalam ${minutes} menit`;
  }
};

// Get platform icon component
const getPlatformIcon = (platform) => {
  if (!platform) return <YouTubeIcon size={14} />;
  const lower = platform.toLowerCase();
  if (lower.includes('youtube')) return <YouTubeIcon size={14} />;
  if (lower.includes('twitch')) return <TwitchIcon size={14} />;
  return <GlobeIcon size={14} />;
};

// Transform API data to component format
const transformScheduleData = (data) => {
  if (!data || !data.id) return null;

  const scheduledAtISO = data.scheduled_at;
  const liveStartedAt = data.live_started_at;
  const countdownString = hitungCountdownString(scheduledAtISO);

  return {
    id: data.id,
    status: (data.status || 'upcoming').toLowerCase(),
    title: data.title || 'Siaran Tanpa Judul',
    subtitle: data.description ? data.description.substring(0, 80) : '',
    tag: data.game_category || 'UMUM',
    time: formatTanggalWIB(scheduledAtISO),
    scheduled_at: scheduledAtISO,
    live_started_at: liveStartedAt,
    auto_done_at: data.auto_done_at,
    countdown: countdownString,
    estimated_duration: data.estimated_duration || 'Durasi ±2-3 Jam',
    platform: data.stream_platform || 'YouTube',
    thumbnail_url: data.thumbnail_url,
    youtube_url: data.youtube_url,
    collab_guest: data.collab_guest,
    collab_social: data.collab_social,
  };
};

// Calculate duration for completed or upcoming streams
const formatScheduleDuration = (schedule) => {
  if (!schedule) return 'Durasi ±2-3 Jam';
  if ((schedule.status === 'done' || schedule.status === 'archived') && schedule.live_started_at && schedule.auto_done_at) {
    const diff = Math.max(0, new Date(schedule.auto_done_at).getTime() - new Date(schedule.live_started_at).getTime());
    const totalMinutes = Math.floor(diff / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `Durasi: ${h}j ${m > 0 ? `${m}m` : ''}`.trim();
    return `Durasi: ${m}m`;
  }
  return schedule.estimated_duration || 'Durasi ±2-3 Jam';
};

// Live Timer Component (real-time ticking seconds)
const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!startTime) return;

    const startDate = new Date(startTime);

    const calculateElapsed = () => {
      const now = new Date();
      const diff = Math.max(0, now - startDate);
      const totalSeconds = Math.floor(diff / 1000);
      const s = totalSeconds % 60;
      const m = Math.floor((totalSeconds / 60) % 60);
      const h = Math.floor(totalSeconds / 3600);
      return { h, m, s };
    };

    setElapsed(calculateElapsed());
    const id = setInterval(() => setElapsed(calculateElapsed()), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return (
    <span className="text-[11px] font-mono text-red-400 font-semibold tracking-wider">
      {elapsed.h > 0 ? `${elapsed.h}j ` : ''}{String(elapsed.m).padStart(2, '0')}m {String(elapsed.s).padStart(2, '0')}s
    </span>
  );
};

// Calculate exact countdown components
const calculateTimeRemaining = (targetDateString) => {
  const target = safeParseDate(targetDateString);
  if (!target) return null;
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

// Real-time ticking countdown badge
const LiveCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeRemaining(targetDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium">
        <Clock className="w-3 h-3 text-emerald-400" />
        Segera Tayang
      </span>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 text-[#7ee0d2] text-[11px] font-mono font-semibold">
      <Clock className="w-3 h-3 text-[#7ee0d2] animate-pulse" />
      <span>
        {days > 0 ? `${days}h ` : ''}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// Google Calendar URL generator
const getGoogleCalendarUrl = (schedule) => {
  if (!schedule.scheduled_at) return null;
  const d = safeParseDate(schedule.scheduled_at);
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const formatGDate = (dt) =>
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  const start = formatGDate(d);
  const end = formatGDate(new Date(d.getTime() + 2.5 * 60 * 60 * 1000));
  const title = encodeURIComponent(`[STREAM] ${schedule.title} - Xion Regalia`);
  const details = encodeURIComponent(
    `${schedule.subtitle || schedule.title}\n\nTonton Siaran: ${schedule.youtube_url || 'https://youtube.com'}\nPlatform: X-VOCA Ops`
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
};

// Loading Skeleton Card
const SkeletonCard = () => (
  <div className="relative flex-shrink-0 w-full sm:w-[380px] lg:w-[400px] rounded-2xl bg-white/[0.02] border border-white/5 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-20 h-5 bg-white/5 rounded-full" />
      <div className="w-24 h-5 bg-white/5 rounded-full" />
    </div>
    <div className="w-3/4 h-5 bg-white/5 rounded mb-2" />
    <div className="w-1/2 h-4 bg-white/5 rounded mb-6" />
    <div className="space-y-3 pt-4 border-t border-white/5">
      <div className="w-40 h-4 bg-white/5 rounded" />
      <div className="w-28 h-4 bg-white/5 rounded" />
    </div>
  </div>
);

// Main Schedule Section Component
const ScheduleSection = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragScroll = useDragScroll(scrollContainerRef);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Calculate total broadcast duration dynamically from active schedules
  const totalBroadcastHours = useMemo(() => {
    let minutes = 0;
    schedules.forEach((s) => {
      if (s.status === 'live' && s.live_started_at) {
        const elapsed = Math.max(0, Date.now() - new Date(s.live_started_at).getTime());
        minutes += Math.floor(elapsed / 60000);
      } else {
        // upcoming stream default ~2 hours
        minutes += 120;
      }
    });
    const hours = minutes / 60;
    return hours > 0 ? hours.toFixed(1) : '0';
  }, [schedules]);

  const handleCopyLink = async (e, schedule) => {
    e.preventDefault();
    e.stopPropagation();
    const url = schedule.youtube_url || window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(schedule.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Fetch all schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);

        const response = await getSchedules({ limit: 30 });
        let rawData = [];
        if (response?.data) {
          if (Array.isArray(response.data)) {
            rawData = response.data;
          } else if (response.data.schedules) {
            rawData = response.data.schedules;
          } else if (response.data.data) {
            rawData = Array.isArray(response.data.data) ? response.data.data : [];
          }
        } else if (Array.isArray(response)) {
          rawData = response;
        }

        const transformed = rawData.map(transformScheduleData).filter(Boolean);

        // Filter: ONLY live and upcoming schedules.
        // Finished or archived streams are excluded from the viewer schedule section.
        const activeOnly = transformed.filter((s) => s.status === 'live' || s.status === 'upcoming');

        // Sort: Live first, Upcoming next (soonest first)
        activeOnly.sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;

          const dateA = safeParseDate(a.scheduled_at)?.getTime() || 0;
          const dateB = safeParseDate(b.scheduled_at)?.getTime() || 0;
          return dateA - dateB;
        });

        setSchedules(activeOnly);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    if (status === 'live') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold text-[11px] tracking-wider uppercase font-mono">LIVE SEKARANG</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7ee0d2]/15 border border-[#7ee0d2]/35 text-[#7ee0d2] backdrop-blur-md shadow-sm">
        <Clock className="w-3 h-3 text-[#7ee0d2]" />
        <span className="font-bold text-[11px] tracking-wider uppercase font-mono">AKAN DATANG</span>
      </span>
    );
  };

  // Scroll controls
  const CARD_WIDTH = 400;

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

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / CARD_WIDTH);
    setActiveIndex(Math.max(0, Math.min(idx, schedules.length - 1)));
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
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
      className="relative w-full pt-16 sm:pt-20 pb-20 sm:pb-28 overflow-hidden bg-[#0c081e]"
    >
      {/* Decorative ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent top-0" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[90px]" />
        <div className="absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full bg-cyan-900/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-3.5">
                <Calendar className="w-3.5 h-3.5 text-accent-lilac" />
                <span className="font-semibold text-accent-lilac text-xs tracking-wider uppercase font-mono">
                  JADWAL STREAM
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2 font-display">
                Jadwal Siaran & Streaming
              </h2>
              <p className="text-[#a89ec0] text-sm sm:text-base max-w-xl leading-relaxed">
                Jadwal siaran langsung dan sesi streaming interaktif mendatang dari Xion Regalia.
              </p>
            </div>

            {/* Schedule Counter Pill */}
            <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-5 flex-shrink-0 self-start sm:self-auto backdrop-blur-md">
              <div>
                <p className="text-xs text-[#a89ec0] uppercase font-mono tracking-wider">Sesi Mendatang</p>
                <p className="text-2xl font-bold text-white font-display">{schedules.length}</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <p className="text-xs text-[#a89ec0] uppercase font-mono tracking-wider">Est. Durasi</p>
                <p className="text-2xl font-bold text-accent-cyan font-display">±{totalBroadcastHours} Jam</p>
              </div>
              {schedules.length > 0 && (
                <div className="flex gap-1.5 pl-3 border-l border-white/10 hidden md:flex">
                  {schedules.slice(0, 5).map((s) => (
                    <span
                      key={s.id}
                      className={`w-2 h-2 rounded-full ${
                        s.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-accent-cyan'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Bar & Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <span className="font-mono text-xs text-[#a89ec0] uppercase tracking-wider">
              Zona Waktu: Asia/Jakarta (WIB)
            </span>
          </div>

          {/* Navigation buttons: only shown if there are multiple cards */}
          {schedules.length > 2 && (
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'bg-[#1b1536] border-[#3d3560] hover:border-accent-purple/50 text-white hover:bg-[#251e48]'
                    : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                }`}
                aria-label="Geser kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'bg-[#1b1536] border-[#3d3560] hover:border-accent-purple/50 text-white hover:bg-[#251e48]'
                    : 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
                }`}
                aria-label="Geser kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cards Area */}
        <div className="relative">
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
            {/* Loading State */}
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {/* Modern Standby / Empty State */}
            {!loading && schedules.length === 0 && (
              <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
                {/* Background decorative ambient lights */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 right-1/4 w-60 h-40 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
                  {/* Standby Pulse Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan text-xs font-mono font-medium mb-5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
                    <span>SANCTUARY STANDBY • MENUNGGU JADWAL BARU</span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-accent-cyan mb-5 shadow-inner">
                    <Calendar className="w-8 h-8 text-accent-cyan" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2.5 tracking-tight">
                    Belum Ada Jadwal Siaran Mendatang
                  </h3>
                  <p className="text-[#a89ec0] text-sm sm:text-base leading-relaxed mb-8">
                    Seluruh sesi siaran sebelumnya telah selesai dan diarsipkan. Xion Regalia sedang mempersiapkan sesi siaran berikutnya. Anda dapat menjelajahi rekaman siaran di Panduan Konten atau mengajukan ide kolaborasi stream.
                  </p>

                  {/* Action CTAs */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                    <a
                      href="#content"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-cyan text-[#0c081e] font-semibold text-xs tracking-wider uppercase font-mono hover:bg-accent-cyan/90 active:scale-95 transition-all shadow-lg shadow-accent-cyan/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Lihat Panduan Konten</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsCollabModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/[0.1] hover:border-accent-purple/40 text-xs font-semibold tracking-wider uppercase font-mono active:scale-95 transition-all"
                    >
                      <Users className="w-3.5 h-3.5 text-accent-lilac" />
                      <span>Request Collab</span>
                    </button>

                    <a
                      href="https://www.youtube.com/channel/UCtOvoDqWorYc6NqkuGmZgEg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 text-xs font-semibold tracking-wider uppercase font-mono active:scale-95 transition-all"
                    >
                      <YouTubeIcon size={14} />
                      <span>Kanal YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Cards */}
            {!loading && schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`
                  relative flex-shrink-0 w-full sm:w-[380px] lg:w-[400px]
                  rounded-2xl overflow-hidden flex flex-col snap-start
                  transition-all duration-300 group hover:-translate-y-1.5
                  bg-[#15102a]/85 border backdrop-blur-md
                  ${schedule.status === 'live'
                    ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
                    : 'border-white/[0.08] hover:border-accent-cyan/40 shadow-xl hover:shadow-2xl'
                  }
                `}
              >
                {/* Top colored accent line */}
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: schedule.status === 'live'
                      ? 'linear-gradient(90deg, #ef4444, #f87171, transparent)'
                      : 'linear-gradient(90deg, #7ee0d2, #c084fc, transparent)',
                  }}
                />

                {/* 16:9 Thumbnail Preview / Header */}
                <div className="relative w-full aspect-video overflow-hidden bg-[#0e0a1f]">
                  {schedule.thumbnail_url ? (
                    <img
                      src={schedule.thumbnail_url}
                      alt={schedule.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1435] via-[#120d26] to-[#0c081e] p-6 text-center">
                      <Radio className="w-10 h-10 text-accent-cyan/30 mb-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                        {schedule.tag || 'Siaran Langsung'}
                      </span>
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15102a] via-[#15102a]/30 to-black/20" />

                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                    {getStatusBadge(schedule.status)}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono">
                      {getPlatformIcon(schedule.platform)}
                      <span className="text-white/90">{schedule.platform || 'YouTube'}</span>
                    </div>
                  </div>

                  {/* Game category pill on bottom-left */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-mono uppercase tracking-wider font-semibold text-accent-cyan">
                      {schedule.tag}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white font-display line-clamp-2 leading-snug group-hover:text-accent-cyan transition-colors duration-200">
                      {schedule.title}
                    </h3>
                    {schedule.subtitle && (
                      <p className="text-xs text-[#a89ec0] mt-1.5 line-clamp-2 leading-relaxed">
                        {schedule.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Collab guest tag if exists */}
                  {schedule.collab_guest && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-xs text-accent-lilac">
                      <Users className="w-3.5 h-3.5 text-accent-lilac flex-shrink-0" />
                      <span className="font-medium truncate">
                        Kolaborasi: {schedule.collab_guest.startsWith('@') ? schedule.collab_guest : `@${schedule.collab_guest}`}
                      </span>
                    </div>
                  )}

                  {/* Meta info block */}
                  <div className="space-y-2.5 mb-5 mt-auto pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-white/90 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
                        <span>{schedule.time}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#a89ec0]">{formatScheduleDuration(schedule)}</span>
                    </div>

                    {/* Real-time Ticking Countdown for upcoming streams */}
                    {schedule.status === 'upcoming' && schedule.scheduled_at && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#a89ec0]">Countdown:</span>
                        <LiveCountdown targetDate={schedule.scheduled_at} />
                      </div>
                    )}

                    {/* Real-time Live Timer */}
                    {schedule.status === 'live' && (
                      <div className="flex items-center justify-between pt-1 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
                            Sedang Berlangsung
                          </span>
                        </div>
                        {schedule.live_started_at && (
                          <LiveTimer startTime={schedule.live_started_at} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    {/* Utility buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, schedule)}
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-accent-cyan/40 hover:bg-accent-cyan/10 text-[#a89ec0] hover:text-accent-cyan transition-all active:scale-95"
                        title={copiedId === schedule.id ? "Tautan Berhasil Disalin!" : "Salin Tautan Siaran"}
                        aria-label="Salin tautan siaran"
                      >
                        {copiedId === schedule.id ? (
                          <Check className="w-4 h-4 text-accent-cyan" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {schedule.status === 'upcoming' && schedule.scheduled_at && (
                        <a
                          href={getGoogleCalendarUrl(schedule)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-accent-purple/40 hover:bg-accent-purple/10 text-[#a89ec0] hover:text-accent-lilac transition-all active:scale-95"
                          title="Simpan Jadwal ke Google Calendar"
                          aria-label="Simpan ke Google Calendar"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Primary CTA */}
                    {schedule.status === 'live' ? (
                      <a
                        href={schedule.youtube_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider uppercase font-mono shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                      >
                        <span>Tonton Siaran</span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </a>
                    ) : (
                      <a
                        href={schedule.youtube_url || '#'}
                        target={schedule.youtube_url ? '_blank' : '_self'}
                        rel={schedule.youtube_url ? 'noopener noreferrer' : ''}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase transition-all active:scale-95 ${
                          schedule.youtube_url
                            ? 'bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/30 text-accent-cyan hover:border-accent-cyan/50'
                            : 'bg-white/[0.04] border border-white/10 text-[#a89ec0] opacity-60 cursor-default'
                        }`}
                        onClick={(e) => { if (!schedule.youtube_url) e.preventDefault(); }}
                      >
                        <span>{schedule.youtube_url ? 'Buka Siaran' : 'Jadwal Siaran'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicator dots if multiple schedules */}
        {schedules.length > 1 && (
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5">
              {schedules.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'w-6 h-1.5 bg-accent-cyan'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Jadwal ${i + 1}`}
                />
              ))}
            </div>

            <span className="text-[11px] font-mono text-white/30">
              {activeIndex + 1} / {schedules.length}
            </span>
          </div>
        )}

        {/* Collab Request Banner */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-lilac flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display">
                  Ingin Streamer Favoritmu Collab Bareng Xion?
                </h4>
                <p className="text-xs sm:text-sm text-[#a89ec0] mt-0.5 max-w-xl leading-relaxed">
                  Beri tahu kami creator atau Vtuber mana yang ingin kamu tonton bersama Xion Regalia di siaran mendatang.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCollabModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase font-mono bg-gradient-to-r from-accent-cyan to-accent-lilac text-[#13111C] hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Users className="w-4 h-4" />
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
