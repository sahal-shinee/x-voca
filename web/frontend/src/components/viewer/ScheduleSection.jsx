import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// ========== ICONS ==========

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

const ScheduleSection = () => {
  const scrollContainerRef = useRef(null);
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.1 });

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pb-20 lg:pb-32">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-8 lg:mb-12 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(192,132,252,0.1)] border border-[rgba(192,132,252,0.2)] mb-3">
            <span className="text-accent-lilac text-xs text-center">✦</span>
            <span className="font-bold text-accent-lilac text-[11px] tracking-wider uppercase font-sans">
              JADWAL STREAM
            </span>
          </div>
          <h2 className="text-2xl lg:text-[28px] font-bold text-white tracking-[-0.7px] mb-2 font-display">
            Upcoming Broadcast Transmission
          </h2>
          <p className="text-[#a89ec0] text-sm max-w-md mx-auto">
            Frekuensi siaran langsung malam hari. Jadwal dapat bergeser sesuai stabilitas orbit.
          </p>
        </div>

        {/* Scroll Controls Header */}
        <div className="flex items-center justify-between px-1 mb-4">
          <div className="flex items-center gap-2">
            <ScrollLeftIcon />
            <span className="font-medium text-[#5c5480] text-[11px] tracking-wider uppercase font-sans">
              TRANS-SPECTRA FEED [UTC+07]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full bg-[#231f42] border border-[#3d3560] flex items-center justify-center hover:border-accent-cyan-light/50 hover:bg-[#2d2855] transition-all duration-200"
              aria-label="Scroll left"
            >
              <ScrollLeftIcon />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-full bg-[#231f42] border border-[#3d3560] flex items-center justify-center hover:border-accent-cyan-light/50 hover:bg-[#2d2855] transition-all duration-200"
              aria-label="Scroll right"
            >
              <ScrollRightIcon />
            </button>
          </div>
        </div>

        {/* Schedule Cards Container */}
        <div
          ref={(el) => {
            scrollContainerRef.current = el;
            if (cardsRef) cardsRef.current = el;
          }}
          className="flex gap-4 lg:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className={`flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[340px] bg-[#231f42] border rounded-2xl p-4 lg:p-5 ${getBorderClass(schedule.status)} ${schedule.status === 'done' ? 'opacity-80' : ''} ${schedule.status === 'live' ? 'relative overflow-hidden' : ''} flex flex-col justify-between snap-start hover:border-accent-cyan-light/30 transition-all duration-300 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {schedule.status === 'live' && (
                <div className="absolute -right-12 -top-12 w-28 h-28 rounded-full bg-[rgba(239,68,68,0.1)] blur-[12px]"></div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  {getStatusBadge(schedule.status)}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] tracking-wider uppercase font-medium ${getTagClass(schedule.status)}`}>
                    {schedule.tag}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-[#2d2855] border border-[rgba(61,53,96,0.8)] flex items-center justify-center flex-shrink-0 ${getIconColorClass(schedule.status)}`}>
                    {getIcon(schedule.icon)}
                  </div>
                  <h3 className={`text-base font-semibold leading-snug font-display ${getTitleColorClass(schedule.status)}`}>
                    {schedule.title}<br />{schedule.subtitle}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={getTextColorClass(schedule.status)}>
                      {schedule.status === 'live' ? <ClockIcon /> : schedule.status === 'done' ? <FolderIcon /> : <CalendarIcon />}
                    </span>
                    <span className={`text-sm ${getTextColorClass(schedule.status)}`}>
                      {schedule.time}
                    </span>
                  </div>
                  {schedule.countdown && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3">
                        <svg width="12.5" height="12" viewBox="0 0 12.5 12" fill="none">
                          <path d="M6.25 0L7.5 3.5H11.25L8 6L9.5 10L6.25 7.5L3 10L4.5 6L1.25 3.5H5L6.25 0Z" fill="#fbbf24"/>
                        </svg>
                      </span>
                      <span className="font-semibold text-accent-gold text-[11px]">{schedule.countdown}</span>
                    </div>
                  )}
                  {schedule.duration && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#5c5480] text-xs tracking-wider font-sans">{schedule.duration}</span>
                    </div>
                  )}
                  {schedule.status === 'live' && (
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                      </span>
                      <span className="font-bold text-[#ef4444] text-xs tracking-wider font-sans">Sedang Berlangsung</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[rgba(61,53,96,0.6)]">
                <Link
                  to="#"
                  className={`flex items-center justify-between group ${getCtaColorClass(schedule.status)}`}
                >
                  <span className={`font-semibold text-sm ${schedule.status === 'live' ? 'font-bold' : 'font-medium'} font-body group-hover:underline`}>
                    {schedule.cta}
                  </span>
                  {schedule.status === 'done' ? <ExternalArrowIcon /> : <ArrowRightIcon />}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
