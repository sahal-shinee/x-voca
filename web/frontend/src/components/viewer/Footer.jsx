import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

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

// SVG Icons
const SparkleIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const ClockIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CopyIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowUpIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ArrowRightIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShieldCheckIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CloseIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HeartIcon = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

// Footer Component
const Footer = () => {
  const [footerRef, footerVisible] = useScrollReveal({ threshold: 0.05 });
  const [currentTime, setCurrentTime] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'fan-policy' | null

  const location = useLocation();
  const navigate = useNavigate();

  // Real-time WIB clock (Asia/Jakarta UTC+7)
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

  // Show floating scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
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

  // Real smooth navigation to section anchors
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

  // Real copy to clipboard
  const handleCopyPortal = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <>
      <footer
        ref={footerRef}
        className={`relative bg-[#0d091e] border-t border-[rgba(61,53,96,0.6)] pt-12 pb-8 px-4 sm:px-6 lg:px-10 overflow-hidden transition-all duration-700 ${
          footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-96 h-36 bg-[#7ee0d2]/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-40 bg-[#c084fc]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto relative z-10">
          {/* ================= TOP TELEMETRY & ACTIONS ================= */}
          <div className="mb-10 pb-6 border-b border-[rgba(61,53,96,0.45)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Live Clock & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17122e] border border-[rgba(74,222,128,0.3)] shadow-[0_0_10px_rgba(74,222,128,0.12)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
                </span>
                <span className="text-[11px] font-semibold text-[#4ade80] uppercase tracking-wider font-sans">
                  Sistem Aktif
                </span>
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] text-[#a89ec0] bg-[#17122e] px-3.5 py-1.5 rounded-full border border-[rgba(61,53,96,0.5)] font-mono">
                <ClockIcon size={13} className="text-[#7ee0d2]" />
                <span>{currentTime || 'Memuat waktu...'}</span>
                <span className="text-[#5c5480]">•</span>
                <span className="text-[#7ee0d2]">WIB</span>
              </div>
            </div>

            {/* Quick Utility Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17122e] border border-[rgba(61,53,96,0.6)] text-[#a89ec0] hover:text-[#7ee0d2] hover:border-[rgba(126,224,210,0.4)] text-[11px] font-medium transition-all duration-200 active:scale-95 shadow-sm"
                title="Salin tautan portal saat ini"
              >
                {isCopied ? (
                  <>
                    <CheckIcon size={13} className="text-[#4ade80]" />
                    <span className="text-[#4ade80] font-semibold">Tautan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={13} />
                    <span>Salin Tautan Portal</span>
                  </>
                )}
              </button>

              <button
                onClick={handleScrollTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17122e] border border-[rgba(61,53,96,0.6)] text-[#a89ec0] hover:text-white hover:border-[rgba(192,132,252,0.4)] hover:bg-[#251e4a] text-[11px] font-medium transition-all duration-200 active:scale-95 shadow-sm"
              >
                <span>Ke Atas</span>
                <ArrowUpIcon size={12} />
              </button>
            </div>
          </div>

          {/* ================= MAIN CONTENT COLUMNS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
            {/* Column 1: Brand & Identity */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
              <Link to="/" onClick={handleScrollTop} className="inline-flex items-center gap-2 group w-fit">
                <span className="text-[#7ee0d2] text-lg group-hover:scale-110 transition-transform duration-200">✦</span>
                <span className="font-bold text-white text-lg font-display tracking-wide group-hover:text-[#7ee0d2] transition-colors">
                  X-VOCA PORTAL
                </span>
              </Link>
              <p className="text-[#a89ec0] text-[13px] leading-relaxed max-w-sm">
                Portal siaran interaktif, pusat voting, serta repositori data resmi untuk <strong className="text-white font-medium">Xion Regalia</strong>.
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-[#17122e] border border-[rgba(61,53,96,0.6)] text-[10px] text-[#c084fc] font-mono tracking-wider uppercase">
                  REGALIA OPS • VERSI 2.0
                </span>
              </div>
            </div>

            {/* Column 2: Navigasi Halaman */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
                Halaman Utama
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/"
                    onClick={handleScrollTop}
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#7ee0d2] transition-colors duration-200"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#7ee0d2] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Beranda (Home)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/voting"
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#7ee0d2] transition-colors duration-200"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#7ee0d2] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Voting Interaktif</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/content"
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#7ee0d2] transition-colors duration-200"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#7ee0d2] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Panduan Konten (Content Guide)</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Lompat ke Bagian Beranda */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                Bagian Halaman
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <button
                    onClick={() => handleSectionJump('about')}
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#c084fc] transition-colors duration-200 text-left"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#c084fc] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Profil & Karakter Xion</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionJump('equipment')}
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#c084fc] transition-colors duration-200 text-left"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#c084fc] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Spesifikasi Peralatan Rig</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionJump('schedule')}
                    className="group inline-flex items-center gap-2 text-[13px] text-[#a89ec0] hover:text-[#c084fc] transition-colors duration-200 text-left"
                  >
                    <ArrowRightIcon size={10} className="text-[#5c5480] group-hover:text-[#c084fc] group-hover:translate-x-1 transition-all duration-200" />
                    <span>Jadwal Siaran (Upcoming)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Informasi & Kebijakan Interaktif */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheckIcon size={14} className="text-[#4ade80]" />
                Pedoman & Kebijakan
              </h4>
              <p className="text-[12px] text-[#a89ec0] leading-relaxed">
                Pelajari pedoman pembuatan karya penggemar serta ketentuan operasional siaran.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setActiveModal('fan-policy')}
                  className="w-full px-3 py-2 rounded-xl bg-[#17122e] border border-[rgba(61,53,96,0.6)] hover:border-[#c084fc]/50 hover:bg-[#251e4a] text-[#c084fc] hover:text-white text-[12px] font-medium transition-all duration-200 flex items-center justify-between group active:scale-98"
                >
                  <span>Kebijakan Karya Penggemar</span>
                  <ArrowRightIcon size={11} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="w-full px-3 py-2 rounded-xl bg-[#17122e] border border-[rgba(61,53,96,0.6)] hover:border-[#7ee0d2]/50 hover:bg-[#1b253b] text-[#7ee0d2] hover:text-white text-[12px] font-medium transition-all duration-200 flex items-center justify-between group active:scale-98"
                >
                  <span>Ketentuan Layanan Siaran</span>
                  <ArrowRightIcon size={11} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* ================= COPYRIGHT & LEGAL BAR ================= */}
          <div className="border-t border-[rgba(61,53,96,0.35)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-[#5c5480] font-mono text-center md:text-left">
              <span>© {new Date().getFullYear()} X-VOCA PROJECT. ALL BROADCAST RIGHTS RESERVED.</span>
            </div>

            {/* Center Heart */}
            <div className="flex items-center gap-1.5 text-[#a89ec0]">
              <span>Dibuat dengan</span>
              <HeartIcon size={12} className="text-[#c084fc] animate-pulse" />
              <span>untuk Xion Regalia & Komunitas Stargazer</span>
            </div>

            {/* Quick Policy Triggers */}
            <div className="flex items-center gap-4 font-mono text-[#5c5480]">
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-[#7ee0d2] transition-colors"
              >
                KETENTUAN
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('fan-policy')}
                className="hover:text-[#c084fc] transition-colors"
              >
                KARYA FAN
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING SCROLL TO TOP ================= */}
      <button
        onClick={handleScrollTop}
        className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl bg-[#17122e]/90 backdrop-blur-md border border-[rgba(126,224,210,0.35)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#7ee0d2] hover:text-white hover:border-[#7ee0d2] hover:bg-[#251e4a] transition-all duration-300 group active:scale-90 ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
      >
        <ArrowUpIcon size={18} className="group-hover:-translate-y-1 transition-transform duration-200" />
      </button>

      {/* ================= INTERACTIVE POLICY MODAL ================= */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[85vh] bg-[#140f2e] border border-[rgba(126,224,210,0.3)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[rgba(61,53,96,0.6)] flex items-center justify-between bg-[#191338]">
              <div className="flex items-center gap-2">
                <span className="text-[#7ee0d2]">✦</span>
                <h3 className="font-bold text-white text-base font-display">
                  {activeModal === 'fan-policy' ? 'Kebijakan Karya Penggemar (Fan Work)' : 'Ketentuan Layanan Siaran'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg bg-[#251e4a] border border-[rgba(61,53,96,0.6)] flex items-center justify-center text-[#a89ec0] hover:text-white hover:border-[#7ee0d2] transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-[13px] text-[#a89ec0] leading-relaxed">
              {activeModal === 'fan-policy' ? (
                <>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">1. Karya Seni & Fan Art</h4>
                    <p>
                      Penggemar diperbolehkan membuat ilustrasi, komik, dan musik derivatif non-komersial bertema Xion Regalia. Mohon sertakan kredit ke X-VOCA Project.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">2. Klip Siaran (Clips & Highlights)</h4>
                    <p>
                      Klip video dari siaran langsung bebas dibuat dan dibagikan dengan ketentuan tidak mengubah konteks atau menimbulkan misinformasi.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">3. Larangan Komersialisasi Tanpa Izin</h4>
                    <p>
                      Penjualan barang fisik, figur, atau aset 3D untuk keuntungan pribadi dalam skala besar memerlukan konfirmasi izin resmi dari manajemen Regalia Ops.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">1. Etika Interaksi Siaran</h4>
                    <p>
                      Viewer diharapkan menjaga suasana siaran yang ramah, santun, dan bebas dari ujaran kebencian, spamming berlebihan, atau doxxing.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">2. Sistem Voting & Permintaan</h4>
                    <p>
                      Hasil voting dalam portal bersifat resmi dan akan diproses oleh Xion sesuai kapasitas jadwal produksi siaran.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-[14px]">3. Hak Kekayaan Intelektual</h4>
                    <p>
                      Seluruh aset visual, desain karakter, dan audio original X-VOCA dilindungi oleh hak cipta tim pengembang X-VOCA.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[rgba(61,53,96,0.6)] bg-[#191338] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-[#7ee0d2] text-[#0d091e] font-semibold text-[12px] hover:brightness-110 active:scale-95 transition-all"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
