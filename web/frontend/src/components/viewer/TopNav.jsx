import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { useBroadcastingStatus, useNextSchedule } from '../../hooks/useFirebase';
import logoXion from '../../assets/logo_xion.png';
import logoSaweria from '../../assets/logo_saweria.jpeg';

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Live broadcast status from Firebase RTDB
  const { isLive } = useBroadcastingStatus();
  const { schedule: nextSchedule } = useNextSchedule();
  const isCurrentlyLive = isLive || nextSchedule?.status === 'live';

  // Fluid sliding indicator for desktop nav tabs
  const tabRefs = useRef([]);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Pure typographic navigation links (Clean, zero emoji, zero AI-slop)
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/voting', label: 'Voting' },
    { path: '/content', label: 'Content Guide' },
  ];

  // Update sliding pill position smoothly
  useEffect(() => {
    const updateSlider = () => {
      const activeIdx = navLinks.findIndex((tab) => tab.path === location.pathname);
      if (activeIdx !== -1 && tabRefs.current[activeIdx]) {
        const el = tabRefs.current[activeIdx];
        setSliderStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      } else {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateSlider();
    const timer = setTimeout(updateSlider, 100);
    window.addEventListener('resize', updateSlider);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSlider);
    };
  }, [location.pathname]);

  // Scroll listener for dynamic floating island elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Jump smoothly to live stream section
  const handleLiveClick = () => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('schedule');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#schedule');
    }
  };

  return (
    <header className="fixed top-3.5 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none select-none">
      {/* ── Floating Dynamic Island Capsule (Dimensi Stabil & Elevated Glass Transition) ── */}
      <div
        className={`
          pointer-events-auto relative w-full transition-all duration-300 ease-out
          flex items-center justify-between rounded-full
          max-w-[1160px] h-[60px] sm:h-[64px] px-4.5 sm:px-6
          ${
            scrolled
              ? 'bg-[#0c081e]/96 backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_24px_rgba(94,234,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.18)]'
              : 'bg-[#0c081e]/80 backdrop-blur-xl border border-white/[0.10] shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.12)]'
          }
          hover:border-accent-cyan/35
        `}
      >
        {/* Ambient Top Hairline Highlight */}
        <div
          className={`absolute top-0 left-10 right-10 h-[1px] pointer-events-none rounded-full transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-70'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(94,234,212,0.5), rgba(167,139,250,0.5), transparent)',
          }}
        />

        {/* ── 1. Left: Brand & Chibi Logo (Proporsi Pas & True Circle Ring) ──── */}
        <div className="flex items-center gap-3 shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan rounded-full py-0.5"
            onClick={() => setIsMenuOpen(false)}
          >
            {/* Chibi Avatar with True-Circle Holographic Crest */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Ambient Backlight Breathing Glow */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent-cyan/40 via-accent-purple/30 to-transparent blur-md opacity-60 group-hover:opacity-100 group-hover:scale-115 transition-all duration-300 pointer-events-none" />

              {/* Holographic Circular Glass Crest (Guaranteed Perfect Circle) */}
              <div
                className={`
                  relative w-10 h-10 sm:w-10.5 sm:h-10.5 rounded-full p-[1.5px] bg-gradient-to-tr from-accent-cyan/60 via-white/25 to-accent-purple/50
                  shadow-[0_0_12px_rgba(94,234,212,0.25)] transition-all duration-300
                  group-hover:shadow-[0_0_20px_rgba(94,234,212,0.45)] group-hover:scale-105 shrink-0 flex items-center justify-center
                `}
              >
                <div className="w-full h-full rounded-full bg-[#120e28] overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src={logoXion}
                    alt="Xion Regalia Logo"
                    className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>
            </div>

            <span className="font-bold text-white text-base sm:text-lg tracking-wider font-display group-hover:text-accent-cyan transition-colors leading-none">
              X-VOCA
            </span>
          </Link>

          {/* Interactive Live Indicator Badge (Pusat Status Siaran - Klik untuk Menonton) */}
          {isCurrentlyLive && (
            <button
              type="button"
              onClick={handleLiveClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-status-live/15 hover:bg-status-live/25 text-status-live border border-status-live/40 hover:border-status-live shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:shadow-[0_0_16px_rgba(239,68,68,0.45)] transition-all duration-200 cursor-pointer active:scale-95 group/live"
              title="Siaran Sedang Berlangsung! Klik untuk langsung menonton"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-live" />
              </span>
              <span>LIVE</span>
            </button>
          )}
        </div>

        {/* ── 2. Center: Pure Typographic Fluid Sliding Navigation (Geometrically Centered & Spacious) ── */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center p-1.5 px-2.5 sm:px-3 gap-2 sm:gap-2.5 rounded-full bg-[#15102a]/85 border border-white/[0.08] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] z-10">
          {/* Fluid Sliding Frosted Glow Pill */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-accent-cyan/25 via-accent-cyan/15 to-accent-purple/20 border border-accent-cyan/45 shadow-[0_0_18px_rgba(94,234,212,0.25)] transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
              opacity: sliderStyle.opacity,
            }}
          />

          {/* Pure Typographic Interactive Tab Links (Tactile Hover & Spacious Typography) */}
          {navLinks.map((tab, idx) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                ref={(el) => (tabRefs.current[idx] = el)}
                to={tab.path}
                className={`
                  relative z-10 px-6 sm:px-7 h-[38px] sm:h-[40px] rounded-full text-[13px] sm:text-sm tracking-wide select-none group flex items-center justify-center transition-all duration-200
                  ${
                    isActive
                      ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(94,234,212,0.4)]'
                      : 'text-white/70 hover:text-white font-medium hover:bg-white/[0.06]'
                  }
                `}
              >
                <span className="transition-transform duration-200 group-hover:-translate-y-[0.5px]">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── 3. Right: Sleek Action Controls ───────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 z-20">
          {/* Saweria Creator Appreciation Button (Harmonious Idle Glass & Official Mascot Logo) */}
          <a
            href="https://saweria.co/xionregalia"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8.5 sm:h-9 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 rounded-full bg-white/[0.04] border border-amber-400/25 text-amber-200/90 hover:text-amber-300 hover:bg-amber-400/10 hover:border-amber-400/50 hover:shadow-[0_0_14px_rgba(251,191,36,0.22)] text-xs sm:text-[13px] font-semibold tracking-wide transition-all duration-200 active:scale-95 group shrink-0"
            title="Dukung Xion Regalia di Saweria"
          >
            <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full overflow-hidden bg-white/95 border border-amber-400/40 p-0.5 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0 flex items-center justify-center">
              <img
                src={logoSaweria}
                alt="Saweria Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="hidden sm:inline font-sans">Saweria</span>
          </a>

          {/* Admin / Staff Portal Key */}
          <Link
            to="/admin/login"
            aria-label="Portal Staff / Admin"
            title="Masuk ke Portal Admin / Staff"
            className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-accent-cyan hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:shadow-[0_0_12px_rgba(94,234,212,0.2)] active:scale-95 transition-all duration-200 shrink-0 group"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="md:hidden h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-white transition-colors shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Buka navigasi mobile"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* ── 4. Mobile Dynamic Island Drawer Dropdown ───────────────────────── */}
        <div
          className={`md:hidden absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0c081e]/96 backdrop-blur-2xl border border-white/[0.12] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100 py-3.5 px-3' : 'max-h-0 opacity-0 py-0 px-3 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`
                    flex items-center justify-between py-2 px-3.5 rounded-2xl text-sm font-semibold transition-all duration-200
                    ${
                      isActive
                        ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                        : 'text-[#a89ec0] hover:bg-white/[0.05] hover:text-white'
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{tab.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              );
            })}

            {/* Quick Schedule Jump */}
            <button
              onClick={handleLiveClick}
              className="flex items-center justify-between py-2 px-3.5 rounded-2xl text-sm font-semibold text-left text-[#a89ec0] hover:bg-white/[0.05] hover:text-accent-cyan transition-all"
            >
              <div className="flex items-center gap-3">
                <Radio className={`w-4 h-4 ${isCurrentlyLive ? 'text-status-live animate-pulse' : 'text-accent-purple'}`} />
                <span>{isCurrentlyLive ? '🔴 Tonton Siaran Langsung (Live)' : 'Jadwal & Agenda Siaran'}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            {/* Saweria Mobile Link */}
            <a
              href="https://saweria.co/xionregalia"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-2xl text-sm font-semibold flex items-center justify-between text-accent-gold bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold/20 transition-all mt-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white/95 border border-amber-400/40 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                  <img src={logoSaweria} alt="Saweria Logo" className="w-full h-full object-contain" />
                </div>
                <span>Dukung di Saweria</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
