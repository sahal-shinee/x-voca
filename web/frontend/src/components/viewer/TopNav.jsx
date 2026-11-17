import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Radio,
  Bell,
  BellRing,
  Loader2,
} from 'lucide-react';
import { useBroadcastingStatus, useNextSchedule } from '../../hooks/useFirebase';
import api from '../../services/api';
import { requestWebPushToken } from '../../utils/firebase';
import { useToast } from '../common/Toast';
import logoXion from '../../assets/logo_xion.webp';
import logoSaweria from '../../assets/logo_saweria.webp';

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem('xvoca_stream_alerts_subscribed') === 'true' &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
  );

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

  // Subscribe browser to FCM stream alerts
  const handleSubscribeAlerts = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      const token = await requestWebPushToken();
      await api.post('/api/notifications/subscribe', { token });
      localStorage.setItem('xvoca_stream_alerts_subscribed', 'true');
      setIsSubscribed(true);
      toast.success('Pengingat siaran aktif! Kamu bakal dapet notif saat Xion LIVE atau ada jadwal baru.');
    } catch (err) {
      console.error('Web Push subscribe error:', err);
      let msg = 'Gagal mengaktifkan pengingat notifikasi.';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        if (err.message.includes('API key') || err.message.includes('installations') || err.message.includes('request-failed')) {
          msg = 'Layanan push notification sedang dioptimalkan. Silakan coba beberapa saat lagi.';
        } else {
          msg = err.message;
        }
      }
      toast.error(msg);
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <>
      {/* ── Dark Backdrop Overlay when Mobile Drawer is Open ────────────────── */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 pointer-events-auto"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none select-none">
        {/* ── Floating Capsule Header (Clean, Snug & Proportionate) ───────────── */}
        <div
          className={`
            pointer-events-auto relative w-full transition-all duration-300 ease-out
            flex items-center justify-between rounded-full
            max-w-[1160px] h-[52px] sm:h-[60px] md:h-[64px] px-3.5 sm:px-6
            ${
              scrolled
                ? 'bg-[#131024] border border-white/[0.10] shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
                : 'bg-[#131024]/95 border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
            }
            hover:border-accent-cyan/35
          `}
        >
          {/* ── 1. Left: Brand & Chibi Logo (Fully Proportionate & Visible) ───── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-20">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan rounded-full py-0.5"
              onClick={() => setIsMenuOpen(false)}
            >
              {/* Chibi Avatar Container */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-accent-cyan/50 via-white/20 to-accent-purple/40 shadow-[0_0_10px_rgba(94,234,212,0.2)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#120e28] overflow-hidden flex items-center justify-center">
                    <img
                      src={logoXion}
                      alt="Xion Regalia Logo"
                      width="40"
                      height="40"
                      decoding="async"
                      className="w-[85%] h-[85%] object-contain transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              <span className="font-bold text-white text-[15px] sm:text-lg tracking-wider font-display group-hover:text-accent-cyan transition-colors leading-none">
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

        {/* ── 3. Right: Uniform Circle Icon Set ─────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-20">

          {/* Bell / Notification - Circle Icon */}
          <button
            type="button"
            onClick={handleSubscribeAlerts}
            disabled={notifLoading}
            title={isSubscribed ? 'Pengingat siaran aktif' : 'Aktifkan notifikasi saat Xion LIVE'}
            aria-label={isSubscribed ? 'Pengingat siaran aktif' : 'Ingatkan Live'}
            className={`
              w-9 h-9 rounded-full flex items-center justify-center shrink-0
              border transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer
              ${isSubscribed
                ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan shadow-[0_0_12px_rgba(94,234,212,0.2)]'
                : 'bg-white/[0.04] border-white/[0.10] text-white/70 hover:text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/40 hover:shadow-[0_0_12px_rgba(94,234,212,0.15)]'
              }
            `}
          >
            {notifLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>

          {/* Saweria - Circle Icon (icon only, no text) */}
          <a
            href="https://saweria.co/xionregalia"
            target="_blank"
            rel="noopener noreferrer"
            title="Dukung Xion Regalia di Saweria"
            aria-label="Dukung di Saweria"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 group bg-white/[0.04] border border-amber-400/30 text-amber-200/90 hover:bg-amber-400/10 hover:border-amber-400/55 hover:shadow-[0_0_12px_rgba(251,191,36,0.2)] transition-all duration-200 active:scale-95"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/95 flex items-center justify-center p-[2px] group-hover:scale-110 transition-transform duration-200 shrink-0">
              <img
                src={logoSaweria}
                alt="Saweria"
                width="20"
                height="20"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
          </a>

          {/* Admin / Shield - Circle Icon */}
          <Link
            to="/admin/login"
            aria-label="Portal Staff / Admin"
            title="Masuk ke Portal Admin / Staff"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 group bg-white/[0.04] border border-white/[0.10] text-white/70 hover:text-accent-cyan hover:border-accent-cyan/40 hover:bg-accent-cyan/10 hover:shadow-[0_0_12px_rgba(94,234,212,0.15)] active:scale-95 transition-all duration-200"
          >
            <Shield className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </Link>

          {/* Hamburger - Mobile Only Circle Icon */}
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/[0.04] border border-white/[0.10] text-white/70 hover:text-white hover:border-white/20 active:scale-95 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Buka navigasi mobile"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* ── 4. Mobile Solid Opaque Drawer Dropdown (User Friendly & Zero Bleed) ── */}
        <div
          className={`md:hidden absolute top-[calc(100%+10px)] left-0 right-0 bg-[#151126] border border-[#2D264A] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] transition-all duration-300 overflow-hidden z-50 ${
            isMenuOpen ? 'max-h-[480px] opacity-100 py-3.5 px-3 pointer-events-auto' : 'max-h-0 opacity-0 py-0 px-3 pointer-events-none'
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
                    flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#221B3D] text-[#7ee0d2] border border-[#7ee0d2]/30'
                        : 'text-[#D0CCE0] hover:bg-white/[0.06] hover:text-white'
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
              className="flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm font-medium text-left text-[#D0CCE0] hover:bg-white/[0.06] hover:text-[#7ee0d2] transition-all"
            >
              <div className="flex items-center gap-3">
                <Radio className={`w-4 h-4 ${isCurrentlyLive ? 'text-status-live animate-pulse' : 'text-accent-purple'}`} />
                <span>{isCurrentlyLive ? '🔴 Tonton Siaran Langsung (Live)' : 'Jadwal & Agenda Siaran'}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            {/* Stream Alert Subscribe (Mobile) */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleSubscribeAlerts();
              }}
              disabled={notifLoading}
              className={`py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center justify-between transition-all border ${
                isSubscribed
                  ? 'text-[#7ee0d2] bg-[#221B3D] border-[#7ee0d2]/30'
                  : 'text-[#D0CCE0] bg-[#1B162E] border-white/[0.06] hover:border-[#7ee0d2]/30 hover:text-[#7ee0d2]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {notifLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
                ) : isSubscribed ? (
                  <BellRing className="w-4 h-4 text-accent-cyan" />
                ) : (
                  <Bell className="w-4 h-4 text-accent-cyan" />
                )}
                <span>{isSubscribed ? 'Pengingat Siaran Aktif' : 'Ingatkan Live'}</span>
              </span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            {/* Saweria Mobile Link */}
            <a
              href="https://saweria.co/xionregalia"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3.5 rounded-xl text-sm font-medium flex items-center justify-between text-amber-300 bg-[#251E33] border border-amber-400/20 hover:bg-[#2C243D] transition-all mt-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white/95 border border-amber-400/30 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                  <img src={logoSaweria} alt="Saweria Logo" width="20" height="20" className="w-full h-full object-contain" />
                </div>
                <span>Dukung di Saweria</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </header>
  </>
  );
};

export default TopNav;
