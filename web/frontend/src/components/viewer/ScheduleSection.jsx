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

  // Calculate total broadcast duration dynamically from all schedules
  const totalBroadcastHours = useMemo(() => {
    let minutes = 0;
    schedules.forEach((s) => {
      if (s.status === 'live' && s.live_started_at) {
        const elapsed = Math.max(0, Date.now() - new Date(s.live_started_at).getTime());
        minutes += Math.floor(elapsed / 60000);
      } else if (s.status === 'done' || s.status === 'archived') {
        if (s.live_started_at && s.auto_done_at) {
          const diff = Math.max(0, new Date(s.auto_done_at).getTime() - new Date(s.live_started_at).getTime());
          minutes += Math.floor(diff / 60000);
        } else {
          minutes += 150; // standard 2.5 hours per completed session
        }
      } else {
        // planned upcoming session
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

        // Sort: Live first, Upcoming next (soonest first), Done last (most recent first)
        const priority = { live: 1, upcoming: 2, done: 3, archived: 3 };
        transformed.sort((a, b) => {
          const pA = priority[a.status] || 4;
          const pB = priority[b.status] || 4;
          if (pA !== pB) return pA - pB;

          const dateA = safeParseDate(a.scheduled_at)?.getTime() || 0;
          const dateB = safeParseDate(b.scheduled_at)?.getTime() || 0;
          if (a.status === 'done' || a.status === 'archived') {
            return dateB - dateA;
          }
          return dateA - dateB;
        });

        setSchedules(transformed);
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-[11px] tracking-wider uppercase font-mono">LIVE NOW</span>
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan">
          <Clock className="w-3 h-3" />
          <span className="font-bold text-[11px] tracking-wider uppercase font-mono">UPCOMING</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-done/15 border border-status-done/30 text-status-done">
        <CheckCircle className="w-3 h-3" />
        <span className="font-medium text-[11px] tracking-wider uppercase font-mono">SELESAI</span>
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
                Daftar siaran langsung, sesi reguler, dan arsip siaran Xion Regalia.
              </p>
            </div>

            {/* Schedule Counter Pill */}
            <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-5 flex-shrink-0 self-start sm:self-auto">
              <div>
                <p className="text-xs text-[#a89ec0] uppercase font-mono tracking-wider">Total Sesi</p>
                <p className="text-2xl font-bold text-white font-display">{schedules.length}</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <p className="text-xs text-[#a89ec0] uppercase font-mono tracking-wider">Est. Durasi Siaran</p>
                <p className="text-2xl font-bold text-accent-cyan font-display">±{totalBroadcastHours} Jam</p>
              </div>
              {schedules.length > 0 && (
                <div className="flex gap-1.5 pl-3 border-l border-white/10 hidden md:flex">
                  {schedules.slice(0, 5).map((s) => (
                    <span
                      key={s.id}
                      className={`w-2 h-2 rounded-full ${
                        s.status === 'live' ? 'bg-red-500 animate-pulse' :
                        s.status === 'upcoming' ? 'bg-accent-cyan' :
                        'bg-status-done'
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

            {/* Empty State */}
            {!loading && schedules.length === 0 && (
              <div className="w-full py-16 px-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-white text-base font-semibold mb-1">Belum Ada Jadwal Siaran</h3>
                <p className="text-[#a89ec0] text-sm max-w-sm">
                  Jadwal siaran terbaru akan segera diperbarui oleh Xion Regalia.
                </p>
              </div>
            )}

            {/* Schedule Cards */}
            {!loading && schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`
                  relative flex-shrink-0 w-full sm:w-[380px] lg:w-[400px]
                  rounded-2xl overflow-hidden flex flex-col snap-start
                  transition-all duration-300 group hover:-translate-y-1
                  ${schedule.status === 'live' ? 'shadow-[0_0_30px_rgba(239,68,68,0.25)]' : 'shadow-xl hover:shadow-2xl hover:border-accent-cyan/30'}
                `}
                style={{
                  background: schedule.status === 'live'
                    ? 'linear-gradient(155deg, #271634 0%, #1a1226 100%)'
                    : '#17122e',
                  border: `1px solid ${
                    schedule.status === 'live'
                      ? 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                {/* Top colored accent line */}
                <div
                  className="h-[3px] w-full"
                  style={{
                    background: schedule.status === 'live'
                      ? 'linear-gradient(90deg, #ef4444, #f87171, transparent)'
                      : schedule.status === 'upcoming'
                      ? 'linear-gradient(90deg, #7ee0d2, #c084fc, transparent)'
                      : 'linear-gradient(90deg, #10b981, #6ee7b7, transparent)',
                  }}
                />

                {/* Optional Stream Thumbnail Preview */}
                {schedule.thumbnail_url && (
                  <div className="relative w-full h-40 overflow-hidden bg-[#100d20]">
                    <img
                      src={schedule.thumbnail_url}
                      alt={schedule.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17122e] via-[#17122e]/40 to-transparent" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Status badge + Game category row */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    {getStatusBadge(schedule.status)}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-white/5 border border-white/10 text-[#a89ec0]">
                      {schedule.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white font-display line-clamp-2 leading-snug group-hover:text-accent-cyan transition-colors">
                      {schedule.title}
                    </h3>
                    {schedule.subtitle && (
                      <p className="text-xs text-[#a89ec0] mt-1 line-clamp-2 leading-relaxed">
                        {schedule.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Collab guest tag if exists */}
                  {schedule.collab_guest && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-xs text-accent-lilac">
                      <Users className="w-3.5 h-3.5 text-accent-lilac flex-shrink-0" />
                      <span className="font-medium truncate">
                        Tamu Collab: {schedule.collab_guest.startsWith('@') ? schedule.collab_guest : `@${schedule.collab_guest}`}
                      </span>
                    </div>
                  )}

                  {/* Meta info: Date & Platform */}
                  <div className="space-y-2.5 mb-5 mt-auto pt-2">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Calendar className="w-3.5 h-3.5 text-[#a89ec0] flex-shrink-0" />
                      <span className="font-medium text-white/90">{schedule.time}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#a89ec0]">
                      <div className="flex items-center gap-1.5">
                        {getPlatformIcon(schedule.platform)}
                        <span>{schedule.platform || 'YouTube'}</span>
                      </div>
                      <span className="text-[11px] text-white/50 font-mono">{formatScheduleDuration(schedule)}</span>
                    </div>

                    {/* Real-time Ticking Countdown for upcoming streams */}
                    {schedule.status === 'upcoming' && schedule.scheduled_at && (
                      <div className="pt-1">
                        <LiveCountdown targetDate={schedule.scheduled_at} />
                      </div>
                    )}

                    {schedule.status === 'live' && (
                      <div className="flex items-center gap-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 w-max">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
                          Sedang Berlangsung
                        </span>
                        {schedule.live_started_at && (
                          <div className="ml-2 pl-2 border-l border-red-500/30">
                            <LiveTimer startTime={schedule.live_started_at} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer with Real-time Utilities */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    {/* Utility Action Buttons: Copy link & Google Calendar */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, schedule)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-accent-cyan/50 hover:bg-accent-cyan/10 text-[#a89ec0] hover:text-accent-cyan transition-all active:scale-95"
                        title={copiedId === schedule.id ? "Tautan Berhasil Disalin!" : "Salin Tautan Siaran"}
                        aria-label="Salin tautan siaran"
                      >
                        {copiedId === schedule.id ? (
                          <Check className="w-3.5 h-3.5 text-accent-cyan" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {schedule.status === 'upcoming' && schedule.scheduled_at && (
                        <a
                          href={getGoogleCalendarUrl(schedule)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-accent-purple/50 hover:bg-accent-purple/10 text-[#a89ec0] hover:text-accent-lilac transition-all active:scale-95"
                          title="Simpan Jadwal ke Google Calendar"
                          aria-label="Simpan ke Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Primary Link Action */}
                    {schedule.status === 'done' ? (
                      <a
                        href={schedule.youtube_url || '#'}
                        target={schedule.youtube_url ? '_blank' : '_self'}
                        rel={schedule.youtube_url ? 'noopener noreferrer' : ''}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          schedule.youtube_url
                            ? 'text-accent-cyan hover:bg-accent-cyan/10 border border-transparent hover:border-accent-cyan/30'
                            : 'text-[#a89ec0] opacity-50 cursor-default'
                        }`}
                        onClick={(e) => { if (!schedule.youtube_url) e.preventDefault(); }}
                      >
                        <span>{schedule.youtube_url ? 'Tonton Rekaman' : 'Arsip Rekaman'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : schedule.status === 'live' ? (
                      <a
                        href={schedule.youtube_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-semibold shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                      >
                        <span>Tonton Siaran</span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </a>
                    ) : (
                      <a
                        href={schedule.youtube_url || '#'}
                        target={schedule.youtube_url ? '_blank' : '_self'}
                        rel={schedule.youtube_url ? 'noopener noreferrer' : ''}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          schedule.youtube_url
                            ? 'text-accent-cyan hover:bg-accent-cyan/10 border border-transparent hover:border-accent-cyan/30'
                            : 'text-[#a89ec0] opacity-50 cursor-default'
                        }`}
                        onClick={(e) => { if (!schedule.youtube_url) e.preventDefault(); }}
                      >
                        <span>{schedule.youtube_url ? 'Buka Tautan' : 'Jadwal Terdaftar'}</span>
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
