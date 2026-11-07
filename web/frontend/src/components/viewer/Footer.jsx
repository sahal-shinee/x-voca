import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Clock,
  Copy,
  Check,
  ArrowUp,
  ChevronRight,
  ArrowUpRight,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import logoXion from '../../assets/logo_xion.png';
import logoSaweriaLines from '../../assets/logo_saweria_lines.png';

// Platform Vector Icons for Official Channels
const DiscordIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const XIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const ThreadsIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.186 24C5.452 24 0 18.675 0 12.08 0 5.484 5.452.16 12.186.16c6.643 0 11.968 5.176 11.968 11.92 0 1.257-.184 2.457-.52 3.593-.243.82-1.107 1.272-1.927 1.026-.816-.242-1.27-1.103-1.028-1.925.267-.9.41-1.848.41-2.694 0-5.467-4.226-9.61-9.923-9.61-5.698 0-9.878 4.143-9.878 9.61 0 5.468 4.18 9.61 9.878 9.61 3.54 0 6.64-1.636 8.358-4.27a1.536 1.536 0 0 1 2.133-.427c.71.46.906 1.42.443 2.128C19.467 21.996 15.992 24 12.186 24z"/>
    <path d="M12.186 17.68c-2.912 0-5.188-2.28-5.188-5.6 0-3.32 2.276-5.6 5.188-5.6 2.912 0 5.188 2.28 5.188 5.6 0 1.055-.262 2.05-.758 2.87-.58.958-1.488 1.543-2.558 1.646-.867.084-1.572-.34-1.868-.96-.454.673-1.173 1.044-2.022 1.044zm0-2.31c1.554 0 2.878-1.326 2.878-3.29 0-1.965-1.324-3.29-2.878-3.29-1.554 0-2.878 1.325-2.878 3.29 0 1.964 1.324 3.29 2.878 3.29z"/>
  </svg>
);

const TikTokIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SaweriaIcon = ({ size = 14 }) => (
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

const TrakteerIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const SociaBuzzIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// Exactly 8 Official Social & Support Channels (Arranged in balanced 4x2 grid)
const FOOTER_SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/5YGyzjSsuC', Icon: DiscordIcon, color: '#5865F2' },
  { name: 'X (Twitter)', href: 'https://x.com/xionregalia', Icon: XIcon, color: '#ffffff' },
  { name: 'Instagram', href: 'https://instagram.com/xionregalia', Icon: InstagramIcon, color: '#E1306C' },
  { name: 'TikTok', href: 'https://tiktok.com/@xionregalia', Icon: TikTokIcon, color: '#25f4ee' },
  { name: 'Threads', href: 'https://threads.net/@xionregalia', Icon: ThreadsIcon, color: '#ffffff' },
  { name: 'Saweria', href: 'https://saweria.co/xionregalia', Icon: SaweriaIcon, color: '#fbbf24' },
  { name: 'Trakteer', href: 'https://trakteer.id/xion_regalia', Icon: TrakteerIcon, color: '#f43f5e' },
  { name: 'SociaBuzz', href: 'https://sociabuzz.com/xionregalia/tribe', Icon: SociaBuzzIcon, color: '#38bdf8' },
];

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

// Main Footer Component
const Footer = () => {
  const [footerRef, footerVisible] = useScrollReveal({ threshold: 0.05 });
  const [currentTime, setCurrentTime] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'fan-policy' | null

  const location = useLocation();
  const navigate = useNavigate();

  // Real-time WIB Clock (Asia/Jakarta UTC+7)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setCurrentTime(new Intl.DateTimeFormat('id-ID', options).format(now));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll position & circular progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
      setShowScrollTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };

    if (activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  // Smooth scroll to top
  const handleScrollTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Navigation to section anchors on home page
  const handleSectionJump = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Copy portal link to clipboard
  const handleCopyPortal = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    });
  };

  // SVG Circle calculation for circular progress ring (r = 18, circumference = 113.1)
  const circleRadius = 18;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      <footer
        ref={footerRef}
        className={`relative bg-bg-base border-t border-border-subtle pt-12 pb-8 px-4 sm:px-6 lg:px-10 overflow-hidden transition-all duration-700 ${
          footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-36 bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-40 bg-accent-purple/5 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-[1240px] mx-auto relative z-10">
          {/* ================= 1. TOP UTILITY STRIP ================= */}
          <div className="mb-10 pb-6 border-b border-border-subtle/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Live Clock & Operating Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-border-subtle shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  Portal Terhubung
                </span>
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-text-secondary bg-bg-surface px-3.5 py-1.5 rounded-full border border-border-subtle shadow-xs">
                <Clock className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                <span className="font-mono tabular-nums text-text-primary">
                  {currentTime || 'Memuat waktu...'}
                </span>
                <span className="text-border-subtle">•</span>
                <span className="text-accent-cyan font-medium">WIB</span>
              </div>
            </div>

            {/* Quick Share Utility */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyPortal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-surface border border-border-subtle hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs font-medium transition-all active:scale-95 shadow-xs"
                title="Salin tautan portal halaman saat ini"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Tautan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                    <span>Salin Tautan Portal</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================= 2. MAIN 4-COLUMN GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12">
            {/* Column 1: Brand & Official Channels (5 cols = ~42%) */}
            <div className="sm:col-span-2 lg:col-span-5 flex flex-col gap-4 pr-0 lg:pr-8">
              <Link to="/" onClick={handleScrollTop} className="inline-flex items-center gap-3.5 group w-fit">
                <div className="w-11 h-11 rounded-2xl bg-bg-surface border border-accent-cyan/25 flex items-center justify-center p-1.5 group-hover:scale-105 group-hover:border-accent-cyan transition-all shadow-xs">
                  <img src={logoXion} alt="Xion Regalia" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-bold text-base sm:text-lg font-display text-text-primary tracking-wide group-hover:text-accent-cyan transition-colors block leading-tight">
                    X-VOCA PORTAL
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Official Fansite & Community Hub
                  </span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
                Pusat siaran interaktif, voting konten mingguan, serta arsip data resmi untuk virtual talent <strong className="text-text-primary font-semibold">Xion Regalia</strong>.
              </p>

              {/* Official Channels Grid (Balanced 4x2) */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-text-secondary block mb-2.5">
                  Kanal Resmi & Komunitas
                </span>
                <div className="grid grid-cols-4 gap-2 w-fit">
                  {FOOTER_SOCIALS.map(({ name, href, Icon, color }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="group relative w-10 h-10 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center text-text-muted hover:text-white transition-all duration-200 active:scale-95 shadow-xs hover:border-transparent"
                    >
                      {/* Smooth Brand Accent Backdrop on Hover */}
                      <span
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"
                        style={{ backgroundColor: color }}
                      />
                      <span className="relative z-10 group-hover:scale-110 transition-transform">
                        <Icon size={15} />
                      </span>
                      {/* Clean Hover Tooltip */}
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-bg-card border border-border-subtle text-[11px] font-medium text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-lg -translate-y-1 group-hover:translate-y-0 z-20">
                        {name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Clean Subtle Fansite Release Tag */}
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-bg-surface/70 border border-border-subtle text-[11px] text-text-muted font-medium">
                  <Sparkles className="w-3 h-3 text-accent-cyan" />
                  <span>v2.4 • X-VOCA Fansite</span>
                </span>
              </div>
            </div>

            {/* Column 2: Halaman Utama (2 cols) */}
            <div className="flex flex-col gap-3.5 lg:col-span-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Halaman Utama
              </h4>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <Link
                    to="/"
                    onClick={handleScrollTop}
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                  >
                    <span>Beranda</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-cyan" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/voting"
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                  >
                    <span>Voting Interaktif</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-cyan" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/content"
                    className="group flex items-center justify-between py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-cyan transition-colors"
                  >
                    <span>Panduan Konten</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-cyan" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Bagian Halaman (2 cols) */}
            <div className="flex flex-col gap-3.5 lg:col-span-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Eksplorasi
              </h4>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionJump('about')}
                    className="group flex items-center justify-between w-full text-left py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    <span>Profil & Lore Xion</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-purple" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionJump('equipment')}
                    className="group flex items-center justify-between w-full text-left py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    <span>Spesifikasi Rig</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-purple" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionJump('schedule')}
                    className="group flex items-center justify-between w-full text-left py-1.5 text-xs sm:text-sm text-text-secondary hover:text-accent-purple transition-colors"
                  >
                    <span>Jadwal Tayang</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-accent-purple" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Panduan & Kebijakan Interaktif (3 cols) */}
            <div className="flex flex-col gap-3.5 lg:col-span-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Panduan Komunitas
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Pelajari pedoman karya turunan dan etika interaksi dalam siaran langsung.
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                {/* Interactive Card 1: Fan Work Policy */}
                <button
                  type="button"
                  onClick={() => setActiveModal('fan-policy')}
                  className="w-full p-3 rounded-2xl bg-bg-surface border border-border-subtle hover:border-accent-purple/40 hover:bg-bg-surface/80 transition-all text-left group active:scale-[0.98] shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-text-primary group-hover:text-accent-purple transition-colors">
                      Kebijakan Karya Penggemar
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Pedoman fan art, klip video, dan karya non-komersial.
                  </p>
                </button>

                {/* Interactive Card 2: Terms of Service */}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="w-full p-3 rounded-2xl bg-bg-surface border border-border-subtle hover:border-accent-cyan/40 hover:bg-bg-surface/80 transition-all text-left group active:scale-[0.98] shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">
                      Ketentuan Layanan Siaran
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Etika siaran, ketentuan voting, dan hak kekayaan intelektual.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* ================= 3. COPYRIGHT & LEGAL BAR ================= */}
          <div className="border-t border-border-subtle/70 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <div className="text-center md:text-left">
              <span>© {new Date().getFullYear()} X-VOCA Project. Seluruh hak cipta dilindungi.</span>
            </div>

            <div className="text-center">
              <span>Didedikasikan untuk Xion Regalia & Komunitas Stargazer</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="hover:text-accent-cyan transition-colors"
              >
                Ketentuan Layanan
              </button>
              <span className="text-border-subtle">•</span>
              <button
                type="button"
                onClick={() => setActiveModal('fan-policy')}
                className="hover:text-accent-purple transition-colors"
              >
                Kebijakan Fan Art
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= 4. FLOATING BACK TO TOP WITH CIRCULAR PROGRESS RING ================= */}
      <button
        type="button"
        onClick={handleScrollTop}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-bg-card/90 backdrop-blur-md border border-border-subtle shadow-xl flex items-center justify-center text-text-primary hover:text-accent-cyan transition-all duration-300 group active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        aria-label="Kembali ke atas"
        title={`Kembali ke atas (${Math.round(scrollProgress)}%)`}
      >
        {/* SVG Circular Scroll Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={circleRadius}
            fill="none"
            className="stroke-border-subtle/40"
            strokeWidth="2.5"
          />
          <circle
            cx="22"
            cy="22"
            r={circleRadius}
            fill="none"
            stroke="currentColor"
            className="text-accent-cyan transition-all duration-150"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <ArrowUp className="w-4 h-4 text-text-secondary group-hover:text-accent-cyan group-hover:-translate-y-0.5 transition-all duration-200 z-10" />
      </button>

      {/* ================= 5. INTERACTIVE POLICY & TERMS MODAL ================= */}
      {activeModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 sm:px-7 sm:py-5.5 border-b border-border-subtle flex items-center justify-between bg-bg-surface/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base font-display leading-tight">
                    {activeModal === 'fan-policy' ? 'Kebijakan Karya Penggemar' : 'Ketentuan Layanan Siaran'}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {activeModal === 'fan-policy' ? 'Pedoman Fan Art, Musik, & Video Klip' : 'Syarat & Tata Tertib Komunitas X-VOCA'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle shrink-0"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed overscroll-contain">
              {activeModal === 'fan-policy' ? (
                <>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">1. Karya Seni & Fan Art</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Penggemar diperbolehkan membuat ilustrasi, komik, dan musik derivatif non-komersial bertema Xion Regalia. Mohon sertakan kredit ke X-VOCA Project pada unggahan publik.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">2. Klip Siaran (Clips & Highlights)</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Klip video dari siaran langsung bebas dibuat dan dibagikan dengan ketentuan tidak mengubah konteks atau menimbulkan misinformasi.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">3. Larangan Komersialisasi Tanpa Izin</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Penjualan barang fisik, figur, atau aset 3D untuk keuntungan komersial memerlukan konfirmasi izin resmi dari manajemen X-VOCA.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">1. Etika Interaksi Siaran</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Penonton diharapkan menjaga suasana siaran yang ramah, santun, dan bebas dari ujaran kebencian, spamming berlebihan, maupun doxxing.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">2. Sistem Voting & Permintaan</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Hasil voting dalam portal bersifat resmi dan akan diproses sesuai kesiapan produksi dan jadwal siaran talent.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-1">
                    <h4 className="font-semibold text-text-primary text-sm">3. Hak Kekayaan Intelektual</h4>
                    <p className="text-text-muted text-xs leading-relaxed">
                      Seluruh aset visual, desain karakter, dan audio original X-VOCA dilindungi oleh hak cipta tim pengembang X-VOCA Project.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-subtle bg-bg-surface/80 backdrop-blur-md flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-accent-cyan text-white font-semibold text-xs hover:bg-accent-cyan-hover active:scale-95 transition-all shadow-sm"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Footer;
