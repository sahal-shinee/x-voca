import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useBroadcastingStatus, useNextSchedule } from '../../hooks/useFirebase';
import logoXion from '../../assets/logo_xion.png';

// Icons
const UserIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartHandIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
    <path d="M0 1H20M0 7H20M0 13H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Live broadcast status from Firebase
  const { isLive } = useBroadcastingStatus();
  const { schedule: nextSchedule } = useNextSchedule();
  const isCurrentlyLive = isLive || nextSchedule?.status === 'live';

  // Web Audio Ambient Synthesizer
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
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

  // Audio Toggle
  const toggleAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(196, ctx.currentTime); // G3
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.2);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        gainNodeRef.current = gain;
        setIsPlayingAudio(true);
      } else {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
          gainNodeRef.current?.gain.linearRampToValueAtTime(0.035, audioCtxRef.current.currentTime + 0.6);
          setIsPlayingAudio(true);
        } else if (audioCtxRef.current.state === 'running') {
          gainNodeRef.current?.gain.linearRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.4);
          setTimeout(() => {
            audioCtxRef.current?.suspend();
            setIsPlayingAudio(false);
          }, 400);
        }
      }
    } catch {
      // Audio fallback safely ignored
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Jump to live stream schedule
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

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? 'bg-[#231d3d] text-[#7ee0d2] border border-[rgba(126,224,210,0.35)] shadow-[0_0_12px_rgba(126,224,210,0.15)]'
        : 'text-[#a89ec0] hover:text-white hover:bg-white/[0.05]'
    }`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center ${
        scrolled
          ? 'h-[64px] bg-[#0c081e]/90 backdrop-blur-xl border-b border-[rgba(126,224,210,0.15)] shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
          : 'h-[72px] bg-[#0c081e]/60 backdrop-blur-md border-b border-white/[0.06]'
      }`}
    >
      {/* Hairline cosmic glow on top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(126,224,210,0.3), rgba(192,132,252,0.3), transparent)',
        }}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 sm:gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2] rounded-xl py-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#1b1536] border border-[rgba(126,224,210,0.35)] flex items-center justify-center p-1 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(126,224,210,0.35)] group-hover:border-[#7ee0d2] transition-all duration-300">
              <img src={logoXion} alt="Xion Regalia Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg sm:text-[22px] tracking-wider font-display group-hover:text-[#7ee0d2] transition-colors leading-none">
                X-VOCA
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#1b1536] border border-[#c084fc]/35 text-[#c084fc] font-mono text-[9px] font-semibold tracking-widest uppercase shadow-[0_0_10px_rgba(192,132,252,0.12)]">
                REGALIA OPS
              </span>
            </div>
          </Link>

          {/* Center: Floating Segmented Pill Navigation */}
          <div className="hidden md:flex items-center p-1 rounded-full bg-[#15102a]/85 backdrop-blur-md border border-[rgba(61,53,96,0.6)] shadow-inner">
            <Link to="/" className={getNavLinkClass('/')}>
              Home
            </Link>
            <Link to="/voting" className={getNavLinkClass('/voting')}>
              Voting
            </Link>
            <Link to="/content" className={getNavLinkClass('/content')}>
              Content Guide
            </Link>
          </div>

          {/* Right: Functional Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LIVE NOW Interactive Scroll Trigger - Only when actually live */}
            {isCurrentlyLive && (
              <button
                type="button"
                onClick={handleLiveClick}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 hover:border-red-500/60 hover:bg-red-500/20 text-red-400 text-[10px] sm:text-[11px] font-bold font-sans tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.2)] group cursor-pointer"
                title="Lihat Jadwal Siaran Langsung"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="hidden sm:inline">LIVE NOW</span>
                <span className="sm:hidden">LIVE</span>
              </button>
            )}

            {/* Interactive Audio Ambient Synthesizer Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 group ${
                isPlayingAudio
                  ? 'bg-[#7ee0d2]/15 border-[#7ee0d2] text-[#7ee0d2] shadow-[0_0_14px_rgba(126,224,210,0.25)]'
                  : 'bg-[#15102a] border-[rgba(61,53,96,0.7)] text-[#a89ec0] hover:text-[#7ee0d2] hover:border-[#7ee0d2]/50'
              }`}
              aria-label={isPlayingAudio ? 'Matikan audio ambien' : 'Nyalakan audio ambien'}
              title={isPlayingAudio ? 'Audio Ambien: Aktif (Klik untuk mematikan)' : 'Audio Ambien: Bisu (Klik untuk mendengarkan)'}
            >
              <div className="flex items-center gap-[2.5px] h-3.5">
                <span
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'h-3 bg-[#7ee0d2] animate-pulse' : 'h-1.5 bg-[#a89ec0]'
                  }`}
                />
                <span
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'h-3.5 bg-[#7ee0d2] animate-pulse [animation-delay:0.2s]' : 'h-2 bg-[#a89ec0]'
                  }`}
                />
                <span
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'h-2.5 bg-[#7ee0d2] animate-pulse [animation-delay:0.4s]' : 'h-3 bg-[#a89ec0]'
                  }`}
                />
                <span
                  className={`w-[2.5px] rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'h-3 bg-[#7ee0d2] animate-pulse [animation-delay:0.1s]' : 'h-1.5 bg-[#a89ec0]'
                  }`}
                />
              </div>
            </button>

            {/* Saweria Donation Action */}
            <a
              href="https://saweria.co/xionregalia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 hover:border-[#fbbf24]/60 hover:bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-[0_0_12px_rgba(251,191,36,0.12)] group"
              title="Dukung Xion Regalia di Saweria"
            >
              <HeartHandIcon size={14} className="text-[#fbbf24] group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline font-mono">Saweria</span>
            </a>

            {/* Admin Portal Button */}
            <Link
              to="/admin/login"
              aria-label="Portal Admin"
              title="Masuk ke Portal Admin / Staff"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#15102a] border border-[rgba(61,53,96,0.7)] flex items-center justify-center text-[#7ee0d2] hover:text-white hover:border-[#7ee0d2]/60 hover:bg-[#231d3d] hover:shadow-[0_0_12px_rgba(126,224,210,0.2)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <UserIcon size={14} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#15102a] border border-[rgba(61,53,96,0.7)] flex items-center justify-center text-[#a89ec0] hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Overlay */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-[#0c081e]/95 backdrop-blur-xl border-b border-[rgba(61,53,96,0.7)] shadow-2xl transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100 py-5 px-4' : 'max-h-0 opacity-0 py-0 px-4 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/'
                ? 'bg-[#231d3d] text-[#7ee0d2] border border-[rgba(126,224,210,0.35)]'
                : 'text-[#a89ec0] hover:bg-white/[0.05] hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home (Beranda)
          </Link>
          <Link
            to="/voting"
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/voting'
                ? 'bg-[#231d3d] text-[#7ee0d2] border border-[rgba(126,224,210,0.35)]'
                : 'text-[#a89ec0] hover:bg-white/[0.05] hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Voting Interaktif
          </Link>
          <Link
            to="/content"
            className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/content'
                ? 'bg-[#231d3d] text-[#7ee0d2] border border-[rgba(126,224,210,0.35)]'
                : 'text-[#a89ec0] hover:bg-white/[0.05] hover:text-white'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Panduan Konten (Content Guide)
          </Link>
          <button
            onClick={handleLiveClick}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-left text-[#a89ec0] hover:bg-white/[0.05] hover:text-[#7ee0d2] transition-all"
          >
            Jadwal Siaran (Upcoming)
          </button>
          <a
            href="https://saweria.co/xionregalia"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-between text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/30 hover:bg-[#fbbf24]/20 transition-all mt-1"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex items-center gap-2">
              <HeartHandIcon size={15} />
              <span>Dukung di Saweria</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#fbbf24]/80">Tautan Luar</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
