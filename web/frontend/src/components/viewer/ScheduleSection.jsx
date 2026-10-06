import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

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

const ScrollRightIcon = () => (
  <svg width="10.5" height="6" viewBox="0 0 10.5 6" fill="none" aria-hidden="true">
    <path d="M9 1L5.5 5L1 1" stroke="#a89ec0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
const useDragScroll = () => {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const animFrame = useRef(null);

  const onMouseDown = useCallback((e) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    lastX.current = e.pageX;
    velocity.current = 0;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    velocity.current = e.pageX - lastX.current;
    lastX.current = e.pageX;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = 'grab';
    ref.current.style.userSelect = '';
    // Momentum scroll
    const momentum = () => {
      if (Math.abs(velocity.current) < 0.5 || !ref.current) return;
      ref.current.scrollLeft -= velocity.current * 0.9;
      velocity.current *= 0.88;
      animFrame.current = requestAnimationFrame(momentum);
    };
    momentum();
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!ref.current) return;
    startX.current = e.touches[0].pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    lastX.current = e.touches[0].pageX;
    velocity.current = 0;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!ref.current) return;
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.1;
    velocity.current = e.touches[0].pageX - lastX.current;
    lastX.current = e.touches[0].pageX;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  useEffect(() => {
    const el = ref.current;
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
  }, [onMouseUp]);

  return { ref, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove };
};

// ========== LIVE TIMER ==========
const LiveTimer = () => {
  const [elapsed, setElapsed] = useState({ h: 0, m: 37, s: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => {
        let s = prev.s + 1;
        let m = prev.m;
        let h = prev.h;
        if (s >= 60) { s = 0; m++; }
        if (m >= 60) { m = 0; h++; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[10px] text-red-400/70 tabular-nums">
      {String(elapsed.h).padStart(2, '0')}:{String(elapsed.m).padStart(2, '0')}:{String(elapsed.s).padStart(2, '0')}
    </span>
  );
};

// ========== COUNTDOWN DISPLAY ==========
const CountdownBadge = ({ text }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wider">
    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
      <path d="M6.25 0L7.5 3.5H11.25L8 6L9.5 10L6.25 7.5L3 10L4.5 6L1.25 3.5H5L6.25 0Z" fill="#f59e0b"/>
    </svg>
    {text}
  </span>
);

// ========== MAIN COMPONENT ==========
const ScheduleSection = () => {
  const scrollContainerRef = useRef(null);
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dragScroll = useDragScroll();

  // ========== DATA (PRESERVED) ==========
  const schedules = [
    {
      id: 1,
      status: 'live',
      title: 'Signalis: Solitary Resonance',
      subtitle: '& Midnight Lore',
      tag: 'SURVIVAL HORROR',
      time: 'Hari ini · 23:00 WIB',
      cta: 'Tonton Siaran Sekarang',
      icon: 'play',
    },
    {
      id: 2,
      status: 'upcoming',
      title: 'Midnight Zatsu & Tea:',
      subtitle: 'Reading Fan Letters #14',
      tag: 'CHIT-CHAT / ZATSU',
      time: 'Jumat, 28 Okt · 23:30 WIB',
      countdown: 'in 2d 14h',
      cta: 'Lihat Detail',
      icon: 'chat',
    },
    {
      id: 3,
      status: 'upcoming',
      title: 'Subnautica: Void Depths',
      subtitle: 'Endurance Run',
      tag: 'EXPLORATION',
      time: 'Minggu, 30 Okt · 22:00 WIB',
      countdown: 'in 4d 12h',
      cta: 'Lihat Detail',
      icon: 'game',
    },
    {
      id: 4,
      status: 'done',
      title: 'Acoustic Karaoke:',
      subtitle: 'Melancholic Night Vocals',
      tag: 'KARAOKE / UTASOU',
      time: '24 Okt · Archived',
      duration: 'Durasi: 2j 48m',
      cta: 'Buka Arsip',
      icon: 'music',
    },
  ];

  // ========== HELPERS (PRESERVED) ==========
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'play': return <PlayIcon />;
      case 'chat': return <ChatIcon />;
      case 'game': return <GameIcon />;
      case 'music': return <MusicIcon />;
      default: return <FolderIcon />;
    }
  };

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

  const getBorderClass = (status) => {
    if (status === 'done') return 'border-[rgba(61,53,96,0.5)]';
    return 'border-[rgba(61,53,96,0.8)]';
  };

  // ========== SCROLL CONTROLS (PRESERVED + ENHANCED) ==========
  const CARD_WIDTH = 360; // px

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



  // Assign scrollContainerRef to both dragScroll.ref and scrollContainerRef
  const setScrollRef = useCallback((el) => {
    scrollContainerRef.current = el;
    dragScroll.ref.current = el;
    if (cardsRef) cardsRef.current = el;
  }, [dragScroll.ref, cardsRef]);

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
                    <LiveTimer />
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
                <p className="text-3xl font-bold text-white mb-1">{schedules.length}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Jadwal</p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {schedules.map((s) => (
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

          {/* Arrow controls — always pushed to end */}
          <div className="flex items-center gap-2 ml-auto">
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
        <div className="relative">
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
            ref={setScrollRef}
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

            {schedules.map((schedule, index) => (
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
                {/* Top accent line — all cards */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px] pointer-events-none z-10"
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
                  <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-red-500/[0.08] blur-[22px] pointer-events-none" />
                )}

                {/* Uniform inner padding for all cards */}
                <div className="flex flex-col flex-1 px-6 py-7">

                  {/* Status + tag row */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    {getStatusBadge(schedule.status)}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-semibold ${getTagClass(schedule.status)}`}>
                      {schedule.tag}
                    </span>
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-start gap-4 mb-6">
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

                    {schedule.countdown && (
                      <div className="mt-2">
                        <CountdownBadge text={schedule.countdown} />
                      </div>
                    )}

                    {schedule.duration && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#5c5480] text-[11px] tracking-wider font-sans">{schedule.duration}</span>
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
                          <LiveTimer />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* CTA footer */}
                  <div className="mt-auto pt-6 border-t border-[rgba(61,53,96,0.5)]">
                    <Link
                      to="#"
                      className={`flex items-center justify-between group/link ${getCtaColorClass(schedule.status)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className={`text-[13px] ${schedule.status === 'live' ? 'font-bold' : 'font-semibold'} font-body group-hover/link:underline underline-offset-2 transition-all tracking-wide`}>
                        {schedule.cta}
                      </span>
                      <span className="transition-transform duration-300 group-hover/link:translate-x-1.5 bg-white/5 p-1.5 rounded-full">
                        {schedule.status === 'done' ? <ExternalArrowIcon /> : <ArrowRightIcon />}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>

        {/* ── Bottom bar: dots + hint ── */}
        <div className={`flex items-center justify-between mt-3 px-1 transition-all duration-500 delay-200 ${cardsVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {schedules.map((_, i) => (
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
          <span className="text-[10px] text-white/20 tabular-nums">
            {activeIndex + 1} / {schedules.length}
          </span>
        </div>

      </div>
    </section>
  );
};

export default ScheduleSection;
