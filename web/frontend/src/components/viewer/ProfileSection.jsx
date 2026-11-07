import { useState, useEffect, useRef } from 'react';
import logoXion from '../../assets/logo_xion.png';
import logoSaweriaLines from '../../assets/logo_saweria_lines.png';
import { useNextSchedule, useBroadcastingStatus } from '../../hooks/useFirebase';
import { getContent } from '../../services/contentService';
import { getYoutubeStats } from '../../services/youtubeService';

// ========== ICONS ==========

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.186 24C5.452 24 0 18.675 0 12.08 0 5.484 5.452.16 12.186.16c6.643 0 11.968 5.176 11.968 11.92 0 1.257-.184 2.457-.52 3.593-.243.82-1.107 1.272-1.927 1.026-.816-.242-1.27-1.103-1.028-1.925.267-.9.41-1.848.41-2.694 0-5.467-4.226-9.61-9.923-9.61-5.698 0-9.878 4.143-9.878 9.61 0 5.468 4.18 9.61 9.878 9.61 3.54 0 6.64-1.636 8.358-4.27a1.536 1.536 0 0 1 2.133-.427c.71.46.906 1.42.443 2.128C19.467 21.996 15.992 24 12.186 24z"/>
    <path d="M12.186 17.68c-2.912 0-5.188-2.28-5.188-5.6 0-3.32 2.276-5.6 5.188-5.6 2.912 0 5.188 2.28 5.188 5.6 0 1.055-.262 2.05-.758 2.87-.58.958-1.488 1.543-2.558 1.646-.867.084-1.572-.34-1.868-.96-.454.673-1.173 1.044-2.022 1.044zm0-2.31c1.554 0 2.878-1.326 2.878-3.29 0-1.965-1.324-3.29-2.878-3.29-1.554 0-2.878 1.325-2.878 3.29 0 1.964 1.324 3.29 2.878 3.29z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SaweriaIcon = ({ size = 15 }) => (
  <span
    className="inline-block shrink-0 bg-current transition-colors duration-200"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      maskImage: `url(${logoSaweriaLines})`,
      WebkitMaskImage: `url(${logoSaweriaLines})`,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    }}
    aria-hidden="true"
  />
);

const TrakteerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const SociaBuzzIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// ========== DATA RESMI ==========

// Kanal komunitas (social media)
const COMMUNITY_SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/5YGyzjSsuC', Icon: DiscordIcon, brand: '#5865F2', label: 'Discord' },
  { name: 'X', href: 'https://x.com/xionregalia', Icon: XIcon, brand: '#f1f0f5', label: 'X (Twitter)' },
  { name: 'Instagram', href: 'https://instagram.com/xionregalia', Icon: InstagramIcon, brand: '#E1306C', label: 'Instagram' },
  { name: 'Threads', href: 'https://threads.net/@xionregalia', Icon: ThreadsIcon, brand: '#e5e7eb', label: 'Threads' },
  { name: 'TikTok', href: 'https://tiktok.com/@xionregalia', Icon: TikTokIcon, brand: '#25f4ee', label: 'TikTok' },
];

// Platform dukungan finansial
const SUPPORT_SOCIALS = [
  { name: 'Saweria', href: 'https://saweria.co/xionregalia', Icon: SaweriaIcon, brand: '#fbbf24', label: 'Saweria' },
  { name: 'Trakteer', href: 'https://trakteer.id/xion_regalia', Icon: TrakteerIcon, brand: '#f43f5e', label: 'Trakteer' },
  { name: 'SociaBuzz', href: 'https://sociabuzz.com/xionregalia/tribe', Icon: SociaBuzzIcon, brand: '#38bdf8', label: 'SociaBuzz' },
];

// Tanggal Debut Resmi: 8 Februari 2025
const DEBUT_DATE = new Date('2025-02-08T00:00:00+07:00');

// ========== CUSTOM HOOKS ==========

const useScrollReveal = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: options.threshold || 0.1 }
    );

    observer.observe(node);
    return () => observer.unobserve(node);
  }, [options.threshold, options.once]);

  return [ref, isVisible];
};

const useCountUp = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return undefined;
    }

    let raf = 0;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
};

// ========== SMALL PARTS ==========

const CORNERS = {
  tl: 'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
  tr: 'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
  bl: 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
  br: 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
};

const Bracket = ({ pos }) => (
  <span
    aria-hidden="true"
    className={`absolute w-4 h-4 border-[rgba(126,224,210,0.4)] transition-all duration-300 group-hover:w-7 group-hover:h-7 group-hover:border-[#7ee0d2] pointer-events-none ${CORNERS[pos]}`}
  />
);

// ========== PROFILE SECTION ==========

const ProfileSection = () => {
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.2 });
  const [cardRef, cardVisible] = useScrollReveal({ threshold: 0.1 });
  const [statsRef, statsVisible] = useScrollReveal({ threshold: 0.2 });

  const frameRef = useRef(null);
  const rafRef = useRef(0);

  // Real-time hooks from Firebase & Database
  const { schedule: nextSchedule } = useNextSchedule();
  const { isLive } = useBroadcastingStatus();
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);

  // Fetch YouTube subscriber count & total video count from backend proxy (public, cached 5 min)
  useEffect(() => {
    let cancelled = false;
    const fetchStats = () => {
      getYoutubeStats()
        .then((data) => {
          if (!cancelled && data) {
            if (data.subscriberCount != null) {
              setSubscriberCount(data.subscriberCount);
            }
            if (data.videoCount != null && data.videoCount > 0) {
              setTotalVideos(data.videoCount);
            }
          }
        })
        .catch(() => {});
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000); // re-fetch every 5 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Fallback: Fetch video count from ContentGuide if YouTube not available
  useEffect(() => {
    getContent({ limit: 1 })
      .then((res) => {
        const total = res?.pagination?.totalItems ?? res?.pagination?.total ?? 0;
        setTotalVideos((prev) => (prev > 0 ? prev : total));
      })
      .catch(() => {});
  }, []);

  // Days since debut — calculated dynamically
  const totalActiveDays = Math.max(0, Math.floor((new Date() - DEBUT_DATE) / (1000 * 60 * 60 * 24)));
  const activeDaysCount = useCountUp(totalActiveDays, 1500, statsVisible);
  const subsCount = useCountUp(subscriberCount, 1400, statsVisible);
  const videosCount = useCountUp(totalVideos, 1400, statsVisible);

  // Real-time next stream badge
  const getStreamBadgeInfo = () => {
    if (isLive || nextSchedule?.status === 'live') {
      return { type: 'live', label: 'LIVE NOW' };
    }
    if (nextSchedule?.scheduled_at) {
      try {
        const d = new Date(nextSchedule.scheduled_at);
        if (!isNaN(d.getTime())) {
          const hours = String(d.getHours()).padStart(2, '0');
          const mins = String(d.getMinutes()).padStart(2, '0');
          return { type: 'upcoming', label: `NEXT ${hours}:${mins} WIB` };
        }
      } catch {
        // fallback
      }
    }
    return { type: 'standby', label: 'STANDBY' };
  };

  const streamBadge = getStreamBadgeInfo();

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Mouse parallax tilt for logo
  const handleFrameMove = (e) => {
    const el = frameRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', (((clientX - r.left) / r.width - 0.5) * 8).toFixed(2));
      el.style.setProperty('--ty', (((clientY - r.top) / r.height - 0.5) * 8).toFixed(2));
    });
  };

  const handleFrameLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--tx', '0');
    el.style.setProperty('--ty', '0');
  };

  return (
    <section id="about" className="relative w-full py-12 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0f0a22]">
      <style>{`
        @keyframes ab-spin { to { transform: rotate(360deg); } }
        @keyframes ab-eq { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
        @keyframes ab-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,-6%) scale(1.1); } }
        @keyframes ab-drift-rev { from { transform: translate(0,0) scale(1.05); } to { transform: translate(-5%,4%) scale(1); } }
        @keyframes xion-breathe {
          0%, 100% { transform: translateY(0px) scale(1.15); }
          50% { transform: translateY(-8px) scale(1.20); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .xion-float { animation: xion-breathe 4.5s ease-in-out infinite; }
        .orbit-spin { animation: orbit-spin 22s linear infinite; }
        .shimmer-bar { animation: shimmer-sweep 2.5s ease-in-out infinite; }
        .ab-spin { animation: ab-spin 50s linear infinite; }
        .ab-eq { animation: ab-eq 1s ease-in-out infinite; }
        .ab-drift { animation: ab-drift 20s ease-in-out infinite alternate; }
        .ab-drift-rev { animation: ab-drift-rev 24s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .ab-spin, .ab-eq, .ab-drift, .ab-drift-rev, .xion-float, .orbit-spin, .shimmer-bar { animation: none !important; }
        }
      `}</style>

      {/* Ambient background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(168,158,192,0.14) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
          }}
        />
        <div className="ab-drift absolute -left-24 top-10 w-[360px] h-[360px] rounded-full blur-[90px] bg-[rgba(126,224,210,0.08)]" />
        <div className="ab-drift-rev absolute -right-24 bottom-0 w-[400px] h-[400px] rounded-full blur-[100px] bg-[rgba(192,132,252,0.10)]" />
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to bottom, #12102A, transparent)' }} />
      </div>

      <div className="max-w-[960px] mx-auto relative">
        {/* Section Tag */}
        <div ref={headerRef} className={`flex justify-center mb-3 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
            <span className="font-semibold text-white/90 text-[11px] tracking-wider uppercase font-mono">ABOUT XION</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className={`text-center text-2xl lg:text-[28px] font-bold text-white tracking-[-0.7px] mb-8 font-display transition-all duration-700 delay-100 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          The Solitary Voice in Deep Space
        </h2>

        {/* Bento Grid: Logo Card + Profile Card */}
        <div ref={cardRef} className={`grid grid-cols-1 lg:grid-cols-12 gap-5 transition-[opacity,transform] duration-700 delay-200 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

          {/* Card 1: Logo Xion — Visual Identity (4 cols) */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl p-px bg-[rgba(61,53,96,0.6)] relative overflow-hidden group">
            <div className="relative bg-[#191432] rounded-[15px] p-7 flex flex-col items-center justify-between h-full overflow-hidden gap-6 min-h-[360px]">
              <Bracket pos="tl" />
              <Bracket pos="tr" />
              <Bracket pos="bl" />
              <Bracket pos="br" />

              {/* Ambient aura behind logo */}
              <div
                aria-hidden="true"
                className="absolute inset-[10%] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(126,224,210,0.14) 0%, rgba(192,132,252,0.08) 50%, transparent 70%)' }}
              />

              {/* Top telemetry status */}
              <div className="w-full flex items-center justify-between z-10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7ee0d2]">SANCTUARY OPS</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0924]/80 backdrop-blur-sm border border-white/[0.08]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                  <span className="font-medium text-[#a89ec0] text-[10px] tracking-wider uppercase font-mono">TELEM: OPTIMAL</span>
                </div>
              </div>

              {/* Logo with parallax tilt & breathing float & orbital ring */}
              <div
                ref={frameRef}
                className="relative w-full max-w-[270px] sm:max-w-[300px] flex items-center justify-center cursor-pointer group/logo my-auto py-4"
                onMouseMove={handleFrameMove}
                onMouseLeave={handleFrameLeave}
                style={{ '--tx': 0, '--ty': 0 }}
              >
                {/* Holographic orbital ring */}
                <div
                  aria-hidden="true"
                  className="orbit-spin absolute w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] rounded-full border border-dashed border-[#7ee0d2]/25 pointer-events-none"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7ee0d2] shadow-[0_0_8px_#7ee0d2]" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7ee0d2]/60" />
                </div>

                <div
                  className="xion-float relative z-10"
                  style={{
                    transform: 'perspective(500px) rotateY(calc(var(--tx, 0) * 1deg)) rotateX(calc(var(--ty, 0) * -1deg))',
                    transition: 'transform 0.35s ease-out',
                  }}
                >
                  <img
                    src={logoXion}
                    alt="Logo Xion Regalia"
                    draggable={false}
                    className="w-full h-auto object-contain select-none drop-shadow-[0_8px_36px_rgba(126,224,210,0.35)] transition-transform duration-300 group-hover/logo:scale-105"
                  />
                </div>
              </div>

              {/* Real-time stream status badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0e0924]/90 backdrop-blur-md border border-white/10 shadow-lg z-10">
                {streamBadge.type === 'live' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold text-red-400 text-[10px] tracking-wider uppercase font-mono">{streamBadge.label}</span>
                  </>
                ) : streamBadge.type === 'upcoming' ? (
                  <>
                    <span className="flex items-end gap-[2px] h-2.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="ab-eq w-[2px] h-full rounded-full bg-[#7ee0d2] origin-bottom"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                    <span className="font-semibold text-white/90 text-[10px] tracking-wider uppercase font-mono">{streamBadge.label}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
                    <span className="font-semibold text-[#a89ec0] text-[10px] tracking-wider uppercase font-mono">{streamBadge.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Persona, Stats & Milestone (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl p-px bg-[rgba(61,53,96,0.6)] relative overflow-hidden">
            <div className="relative bg-[#191432] rounded-[15px] p-6 lg:p-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#7ee0d2] font-semibold block mb-1">
                      PERSONA PROFILE
                    </span>
                    <h3 className="text-3xl lg:text-[34px] font-bold text-white tracking-tight font-display">
                      Xion Regalia
                    </h3>
                  </div>
                  <div className="inline-flex px-3.5 py-1.5 rounded-full bg-[#231f42] border border-[rgba(192,132,252,0.3)] self-start sm:self-auto">
                    <span className="font-bold text-[#c084fc] text-[10px] lg:text-xs tracking-wider uppercase font-mono">
                      INDEPENDENT VTUBER
                    </span>
                  </div>
                </div>

                <p className="text-[#a89ec0] text-sm leading-relaxed mb-6 font-body">
                  A quiet sanctuary under midnight skies. Streaming late-night introspective journeys, atmospheric indie games, and acoustic soundscapes for those who seek solace in the quiet hours.
                </p>

                {/* Stats Grid: Total Sesi, Total Video, Debut */}
                <div ref={statsRef} className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-[#231f42]/70 border border-[#3d3560] hover:border-[#7ee0d2]/40 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300 group/stat">
                    <p className="text-[#fbbf24] text-2xl lg:text-3xl font-bold font-display leading-none mb-1 group-hover/stat:scale-105 transition-transform duration-200">
                      {subsCount >= 1000
                        ? `${(subsCount / 1000).toFixed(subsCount >= 10000 ? 0 : 1)}K`
                        : subsCount}
                    </p>
                    <p className="text-white text-xs font-semibold">Subscribers</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
                      <p className="text-[#a89ec0] text-[10px] font-mono">YouTube · Live</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#231f42]/70 border border-[#3d3560] hover:border-[#7ee0d2]/40 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300 group/stat">
                    <p className="text-[#7ee0d2] text-2xl lg:text-3xl font-bold font-display leading-none mb-1 group-hover/stat:scale-105 transition-transform duration-200">
                      {videosCount}
                    </p>
                    <p className="text-white text-xs font-semibold">Total Video</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
                      <p className="text-[#a89ec0] text-[10px] font-mono">YouTube · Arsip</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#231f42]/70 border border-[#3d3560] hover:border-[#7ee0d2]/40 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300 group/stat">
                    <p className="text-[#c084fc] text-xl lg:text-2xl font-bold font-display leading-none mb-1 group-hover/stat:scale-105 transition-transform duration-200">
                      8 Feb
                    </p>
                    <p className="text-white text-xs font-semibold">Tanggal Debut</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                      <p className="text-[#a89ec0] text-[10px] font-mono">{activeDaysCount} Hari Mengudara</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stargazer Milestone Progress — driven by real-time YouTube subscriber count */}
              <div className="pt-4 border-t border-white/[0.08]">
                {(() => {
                  const MILESTONE = 5000;
                  const pct = Math.min(100, Math.round((subscriberCount / MILESTONE) * 100));
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2 font-mono">
                        <span className="text-[#a89ec0] text-[11px] font-semibold tracking-wider uppercase">
                          Stargazer Milestone · {MILESTONE.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[#7ee0d2] text-xs font-bold font-mono">{pct}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progress menuju ${MILESTONE.toLocaleString('id-ID')} subscribers`}
                        className="relative h-2.5 rounded-full bg-[#120e26] overflow-hidden p-0.5 border border-white/10"
                      >
                        <div
                          className="relative h-full rounded-full transition-all duration-1000 overflow-hidden"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7ee0d2, #c084fc)' }}
                        >
                          <div
                            aria-hidden="true"
                            className="shimmer-bar absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Row — Full width, beneath bento cards */}
        <div className={`mt-5 rounded-2xl p-px bg-[rgba(61,53,96,0.6)] transition-[opacity,transform] duration-700 delay-300 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="bg-[#191432] rounded-[15px] px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-6">

            {/* Kanal Resmi group */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[#a89ec0] uppercase tracking-widest font-mono flex-shrink-0">
                Kanal Resmi
              </p>
              <div className="flex items-center flex-wrap gap-2">
                {COMMUNITY_SOCIALS.map(({ name, href, Icon, brand, label }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    style={{ '--brand': brand }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#231f42] border border-[#3d3560] hover:border-[var(--brand)] hover:text-[var(--brand)] text-[#a89ec0] text-xs font-medium transition-all duration-200 hover:shadow-[0_0_10px_-3px_var(--brand)] active:scale-95 whitespace-nowrap"
                  >
                    <Icon />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="hidden sm:block w-px self-stretch bg-white/[0.06] flex-shrink-0" />

            {/* Dukungan group */}
            <div className="flex flex-col gap-3 flex-shrink-0">
              <p className="text-[10px] font-semibold text-[#a89ec0] uppercase tracking-widest font-mono">
                Dukungan
              </p>
              <div className="flex items-center flex-wrap gap-2">
                {SUPPORT_SOCIALS.map(({ name, href, Icon, brand, label }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    style={{ '--brand': brand }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#231f42] border border-[#3d3560] hover:border-[var(--brand)] hover:text-[var(--brand)] text-[#a89ec0] text-xs font-medium transition-all duration-200 hover:shadow-[0_0_10px_-3px_var(--brand)] active:scale-95 whitespace-nowrap"
                  >
                    <Icon />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
