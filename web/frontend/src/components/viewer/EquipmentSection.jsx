// ========== EQUIPMENT SECTION ==========

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

// Salin teks ke clipboard. Mengembalikan true/false agar UI bisa menampilkan hasilnya.
// Ada fallback untuk konteks tanpa Clipboard API (mis. http non-localhost).
const copyText = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // lanjut ke fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (err) {
    return false;
  }
};

// Format satu kartu menjadi teks biasa untuk disalin
const cardToText = (card) =>
  [
    `${card.label} (${card.system})`,
    ...card.items.map((item) => `- ${item.label}: ${item.title} - ${item.subtitle}`),
    ...(card.specs || []).map((spec) => `- ${spec.label}: ${spec.value}`),
  ].join('\n');

// Icon Components
const PcIcon = ({ size = 16.5, className = '' }) => (
  <svg
    width={size}
    height={size * 0.68}
    viewBox="0 0 16.5 11.25"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M14.85 0H1.65C0.74 0 0 0.74 0 1.65V8.1C0 9.01 0.74 9.75 1.65 9.75H6.6L5.775 11.25H4.125V9.75H1.65C1.31 9.75 1.035 9.475 1.035 9.135V1.65C1.035 1.31 1.31 1.035 1.65 1.035H14.85C15.19 1.035 15.465 1.31 15.465 1.65V9.135C15.465 9.475 15.19 9.75 14.85 9.75H12.375V11.25H10.725L9.9 9.75H14.85C15.76 9.75 16.5 9.01 16.5 8.1V1.65C16.5 0.74 15.76 0 14.85 0Z" fill="currentColor"/>
  </svg>
);

const MicrophoneIcon = ({ size = 8.75, className = '' }) => (
  <svg
    width={size}
    height={size * 1.36}
    viewBox="0 0 8.75 11.875"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M4.375 0C3.41 0 2.625 0.785 2.625 1.75V7C2.625 7.965 3.41 8.75 4.375 8.75C5.34 8.75 6.125 7.965 6.125 7V1.75C6.125 0.785 5.34 0 4.375 0Z" fill="currentColor"/>
    <path d="M1.75 7V7.875C1.75 9.541 3.084 10.875 4.75 10.875H4.375C3.084 10.875 1.75 9.541 1.75 7.875V7Z" fill="currentColor"/>
    <path d="M0.875 7.875H7.875V10.5C7.875 11.052 7.427 11.5 6.875 11.5H1.875C1.323 11.5 0.875 11.052 0.875 10.5V7.875Z" fill="currentColor"/>
  </svg>
);

const EyeIcon = ({ size = 12.5, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12.5 12.5"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M1.25 6.25C1.25 6.25 2.875 2.5 6.25 2.5C9.625 2.5 11.25 6.25 11.25 6.25C11.25 6.25 9.625 10 6.25 10C2.875 10 1.25 6.25 1.25 6.25Z" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="6.25" cy="6.25" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const CheckIcon = ({ size = 12, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CopyIcon = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M10 4V3C10 2.448 9.552 2 9 2H3C2.448 2 2 2.448 2 3V9C2 9.552 2.448 10 3 10H4" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const ChevronDownIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Sparkle particle component
const SparkleParticle = ({ style }) => (
  <div
    className="absolute w-1 h-1 rounded-full bg-white/20 animate-pulse motion-reduce:animate-none"
    style={style}
  />
);

// Progress Bar Component (bar terisi saat kartu dibuka, bukan sudah penuh sejak awal)
const ProgressBar = ({ value, max, color, label, showLabel = false, active = true, delay = 0 }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-[#a89ec0] uppercase tracking-wide">{label}</span>
          <span className="text-[10px] text-[#7ee0d2] font-medium">{value}/{max}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-1.5 bg-[#1d1830] rounded-full overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${active ? percentage : 0}%`,
            transitionDelay: `${delay}ms`,
            background: color || 'linear-gradient(90deg, #7ee0d2, #4ade80)'
          }}
        />
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status, label }) => {
  const statusConfig = {
    online: { color: 'bg-[#4ade80]', text: 'text-[#4ade80]', border: 'border-[rgba(74,222,128,0.25)]', bg: 'bg-[rgba(74,222,128,0.08)]' },
    warning: { color: 'bg-[#fbbf24]', text: 'text-[#fbbf24]', border: 'border-[rgba(251,191,36,0.25)]', bg: 'bg-[rgba(251,191,36,0.08)]' },
    offline: { color: 'bg-[#ef4444]', text: 'text-[#ef4444]', border: 'border-[rgba(239,68,68,0.25)]', bg: 'bg-[rgba(239,68,68,0.08)]' },
  };

  const config = statusConfig[status] || statusConfig.online;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg} border ${config.border} text-[10px] uppercase tracking-wider ${config.text} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color} ${status === 'online' ? 'animate-pulse motion-reduce:animate-none' : ''}`} />
      {label}
    </span>
  );
};

// Tooltip Component (juga muncul saat fokus keyboard)
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute ${positionClasses[position]} z-50 px-2 py-1 text-[10px] text-white bg-[#2d2855] border border-[rgba(61,53,96,0.8)] rounded shadow-lg whitespace-nowrap`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Animated Background Pattern
const AnimatedBackground = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${(i * 7.3) % 100}%`,
    top: `${(i * 13.7) % 100}%`,
    delay: `${(i * 0.4) % 3}s`,
    duration: `${3 + (i % 3)}s`,
    size: 2 + (i % 3),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {particles.map((particle) => (
        <SparkleParticle
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d2855]/30 via-transparent to-[#1d1830]/40" />
    </div>
  );
};

// Equipment Card Component
const EquipmentCard = ({ card, index, isVisible, isExpanded, onToggle }) => {
  const [copied, setCopied] = useState(null); // 'item-0' | 'all' | 'err-item-0' | 'err-all'
  const [settled, setSettled] = useState(false);
  const cardRef = useRef(null);
  const timerRef = useRef(0);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Setelah animasi muncul selesai, hapus delay bertahap supaya efek hover terasa langsung
  useEffect(() => {
    if (!isVisible) return undefined;
    const t = setTimeout(() => setSettled(true), index * 120 + 700);
    return () => clearTimeout(t);
  }, [isVisible, index]);

  const flash = useCallback((key) => {
    setCopied(key);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleCopy = useCallback(
    async (text, key) => {
      const ok = await copyText(text);
      flash(ok ? key : `err-${key}`);
    },
    [flash]
  );

  // Sorot cahaya mengikuti kursor di dalam kartu (CSS variable, tanpa re-render)
  const handleMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${e.clientX - r.left}px`);
    el.style.setProperty('--py', `${e.clientY - r.top}px`);
  };

  const accentColors = {
    'accent-lilac': {
      primary: '#c084fc',
      glow: 'rgba(192,132,252,0.2)',
      glowStrong: 'rgba(192,132,252,0.35)',
      bg: 'rgba(192,132,252,0.1)',
      border: 'rgba(192,132,252,0.35)',
      gradient: 'from-[#c084fc]/10 to-transparent',
    },
    'accent-cyan-light': {
      primary: '#7ee0d2',
      glow: 'rgba(126,224,210,0.2)',
      glowStrong: 'rgba(126,224,210,0.35)',
      bg: 'rgba(126,224,210,0.1)',
      border: 'rgba(126,224,210,0.35)',
      gradient: 'from-[#7ee0d2]/10 to-transparent',
    },
    'accent-gold': {
      primary: '#fbbf24',
      glow: 'rgba(251,191,36,0.2)',
      glowStrong: 'rgba(251,191,36,0.35)',
      bg: 'rgba(251,191,36,0.1)',
      border: 'rgba(251,191,36,0.35)',
      gradient: 'from-[#fbbf24]/10 to-transparent',
    },
  };

  const colors = accentColors[card.accentColor] || accentColors['accent-lilac'];

  const tip = (key) => {
    if (copied === key) return 'Tersalin!';
    if (copied === `err-${key}`) return 'Gagal menyalin';
    return 'Salin spesifikasi';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      className={`relative flex flex-col bg-[#1d1830] border rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${
        isExpanded
          ? 'shadow-2xl'
          : 'hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5'
      }`}
      style={{
        transitionDelay: settled ? '0ms' : `${index * 120}ms`,
        borderColor: isExpanded ? colors.border : 'rgba(61,53,96,0.6)',
      }}
      onClick={onToggle}
    >
      {/* Top accent bar (samar saat tertutup, penuh saat terbuka) */}
      <div
        className="h-[3px] w-full transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${colors.primary}, transparent 70%)`,
          opacity: isExpanded ? 1 : 0.3,
        }}
      />

      {/* Hover/expand glow overlay */}
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none ${
          isExpanded ? 'opacity-100' : 'group-hover:opacity-60'
        }`}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${colors.glow}, transparent 65%)`,
        }}
      />

      {/* Sorot cahaya mengikuti kursor */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(260px circle at var(--px, 50%) var(--py, 0%), ${colors.glow}, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-5 pt-5 pb-4 border-b border-[rgba(61,53,96,0.4)]">
        {/* Category row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: colors.bg, color: colors.primary }}
            >
              {card.icon}
            </div>
            <div>
              <span
                className="font-bold text-[11px] tracking-widest uppercase font-sans block leading-tight"
                style={{ color: colors.primary }}
              >
                {card.label}
              </span>
              <span className="text-[10px] text-[#5c5480] font-medium tracking-wider uppercase">
                {card.system}
              </span>
            </div>
          </div>
          <StatusBadge status="online" label="Aktif" />
        </div>

        {/* Expand indicator (tombol sungguhan agar bisa dipakai dengan keyboard) */}
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={`eq-panel-${card.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="flex w-full items-center justify-between text-left rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
        >
          <span className="text-[10px] text-[#5c5480]">
            {isExpanded ? 'Klik untuk tutup' : 'Klik untuk detail'}
          </span>
          <span
            className={`w-6 h-6 rounded-full bg-[#2d2855] border border-[rgba(61,53,96,0.6)] flex items-center justify-center transition-all duration-300 ${
              isExpanded ? 'rotate-180 border-[rgba(126,224,210,0.3)]' : 'group-hover:border-[rgba(126,224,210,0.3)]'
            }`}
          >
            <ChevronDownIcon size={13} className="text-[#7ee0d2]" />
          </span>
        </button>
      </div>

      {/* Main Items */}
      <div className="relative z-10 px-5 py-4 space-y-4 flex-1">
        {card.items.map((item, itemIndex) => {
          const key = `item-${itemIndex}`;
          return (
            <div key={itemIndex}>
              {itemIndex > 0 && (
                <div className="border-t border-[rgba(61,53,96,0.35)] mb-4" />
              )}
              <div className="group/item">
                <p className="font-medium text-[#5c5480] text-[10px] uppercase tracking-widest mb-1.5 font-sans">
                  {item.label}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-[13px] leading-snug font-display group-hover/item:text-[#7ee0d2] transition-colors duration-200">
                      {item.title}
                    </p>
                    <p className="text-[#a89ec0] text-[11px] mt-0.5 leading-relaxed">{item.subtitle}</p>
                  </div>
                  <Tooltip content={tip(key)} position="left">
                    <button
                      type="button"
                      aria-label={`Salin spesifikasi ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(`${item.title} - ${item.subtitle}`, key);
                      }}
                      className="p-1.5 rounded-lg bg-[#2d2855] border border-[rgba(61,53,96,0.6)] opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-200 hover:border-[rgba(126,224,210,0.4)] hover:bg-[#3d3566] text-[#a89ec0] hover:text-[#7ee0d2] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
                    >
                      {copied === key ? (
                        <CheckIcon size={12} className="text-[#4ade80]" />
                      ) : (
                        <CopyIcon size={12} />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded content */}
      <div
        id={`eq-panel-${card.id}`}
        aria-hidden={!isExpanded}
        className={`relative z-10 overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="mx-5 mb-5 pt-4 border-t border-[rgba(61,53,96,0.4)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Specs Grid */}
          {card.specs && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {card.specs.map((spec, specIndex) => (
                <div
                  key={specIndex}
                  className="px-3 py-2.5 bg-[#2d2855]/60 rounded-xl border border-[rgba(61,53,96,0.4)] transition-colors duration-200 hover:bg-[#2d2855] hover:border-[rgba(126,224,210,0.25)]"
                >
                  <p className="text-[9px] text-[#5c5480] uppercase tracking-wider mb-1">{spec.label}</p>
                  <p className="text-[12px] font-semibold text-white leading-tight">{spec.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Performance Bars */}
          {card.performance && (
            <div className="space-y-2.5">
              <p className="text-[10px] text-[#a89ec0] uppercase tracking-widest mb-3">Metrik Performa</p>
              {card.performance.map((perf, perfIndex) => (
                <ProgressBar
                  key={perfIndex}
                  label={perf.label}
                  value={perf.value}
                  max={perf.max}
                  color={colors.primary}
                  showLabel
                  active={isExpanded}
                  delay={perfIndex * 120}
                />
              ))}
            </div>
          )}

          {/* Salin semua spesifikasi kartu ini */}
          <button
            type="button"
            tabIndex={isExpanded ? 0 : -1}
            onClick={() => handleCopy(cardToText(card), 'all')}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-semibold tracking-wide transition-all duration-200 hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
            style={{ color: colors.primary, borderColor: colors.border, backgroundColor: colors.bg }}
          >
            {copied === 'all' ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
            {copied === 'all'
              ? 'Spesifikasi tersalin'
              : copied === 'err-all'
              ? 'Gagal menyalin'
              : 'Salin semua spesifikasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Equipment Section Component
const EquipmentSection = () => {
  const [sectionRef, sectionVisible] = useScrollReveal({ threshold: 0.05 });
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.05 });
  const [expandedCards, setExpandedCards] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedAll, setCopiedAll] = useState(null); // 'ok' | 'err' | null
  const [updatedAt] = useState(() => new Date());
  const tabRefs = useRef([]);
  const copyAllTimer = useRef(0);

  useEffect(() => () => clearTimeout(copyAllTimer.current), []);

  const equipmentCards = [
    {
      id: 1,
      icon: <PcIcon size={12} />,
      label: 'PC & PEMROSESAN',
      system: 'SIS 01',
      accentColor: 'accent-lilac',
      items: [
        {
          label: 'PROSESOR (CPU)',
          title: 'Intel Core i7-13620H',
          subtitle: '10 Inti (6P + 4E) / 16 Thread @ Up to 4.9GHz',
        },
        {
          label: 'KARTU GRAFIS (GPU)',
          title: 'NVIDIA GeForce RTX 4060',
          subtitle: '8GB GDDR6 VRAM',
        },
      ],
      specs: [
        { label: 'Memori', value: '64GB DDR5' },
        { label: 'VRAM', value: '8GB GDDR6' },
        { label: 'Penyimpanan', value: '1TB NVMe SSD' },
        { label: 'Operasional', value: 'Siaran & Rendering' },
      ],
      performance: [
        { label: 'Performa CPU', value: 95, max: 100 },
        { label: 'Performa GPU', value: 92, max: 100 },
        { label: 'Penggunaan Memori', value: 24, max: 64 },
      ],
    },
    {
      id: 2,
      icon: <MicrophoneIcon size={10} />,
      label: 'AUDIO & SIARAN',
      system: 'AUDIO 02',
      accentColor: 'accent-cyan-light',
      items: [
        {
          label: 'MIKROFON UTAMA',
          title: 'Shure MV7+',
          subtitle: 'Dynamic Podcast & Broadcast Microphone',
        },
        {
          label: 'INTERFACE & PENGOLAHAN',
          title: 'Hybrid USB-C / XLR',
          subtitle: 'Onboard DSP Reverb & Real-time Denoiser',
        },
      ],
      specs: [
        { label: 'Konektivitas', value: 'USB-C & XLR Hybrid' },
        { label: 'Sample Rate', value: '48kHz / 24-bit' },
        { label: 'Pola Tangkap', value: 'Cardioid Unidirectional' },
        { label: 'Fitur Khusus', value: 'Digital Popper Stopper' },
      ],
      performance: [
        { label: 'Kualitas Vokal', value: 98, max: 100 },
        { label: 'Noise Floor', value: 5, max: 100 },
        { label: 'Stabilitas Sinyal', value: 99, max: 100 },
      ],
    },
    {
      id: 3,
      icon: <EyeIcon size={10} />,
      label: 'RIG & PELACAKAN',
      system: 'MODEL 03',
      accentColor: 'accent-gold',
      items: [
        {
          label: 'MODEL LIVE2D RIG',
          title: 'Obsidian Rig #03',
          subtitle: 'ARKit 52 Blendshape + Fisika XYZ',
        },
        {
          label: 'MESIN TANGKAP OPTIS',
          title: 'iPhone 15 Pro TrueDepth',
          subtitle: '60 FPS VTube Studio + Pelacakan Presisi',
        },
      ],
      specs: [
        { label: 'FPS Pelacakan', value: '60 FPS' },
        { label: 'Blendshape', value: '52 Titik ARKit' },
        { label: 'Latensi', value: '< 16ms' },
        { label: 'Debut Siaran', value: '8 Februari 2025' },
      ],
      performance: [
        { label: 'Akurasi Pelacakan', value: 97, max: 100 },
        { label: 'Deteksi Wajah', value: 99, max: 100 },
        { label: 'Penghalusan Gerak', value: 95, max: 100 },
      ],
    },
  ];

  const filters = [
    { id: 'all', label: 'Semua Sistem' },
    { id: 'pc', label: 'Pemrosesan' },
    { id: 'audio', label: 'Audio' },
    { id: 'rig', label: 'Pelacakan' },
  ];

  const filteredCards = equipmentCards.filter((card) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pc') return card.id === 1;
    if (activeFilter === 'audio') return card.id === 2;
    if (activeFilter === 'rig') return card.id === 3;
    return true;
  });

  // Ringkasan dihitung langsung dari data di atas
  const totalComponents = equipmentCards.reduce((n, c) => n + c.items.length, 0);
  const totalSpecs = equipmentCards.reduce((n, c) => n + (c.specs ? c.specs.length : 0), 0);

  // Kartu bisa dibuka lebih dari satu agar spesifikasi bisa dibandingkan
  const toggleCard = (id) =>
    setExpandedCards((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const allOpen = filteredCards.length > 0 && filteredCards.every((c) => expandedCards.includes(c.id));

  const toggleAll = () =>
    setExpandedCards((prev) =>
      allOpen
        ? prev.filter((id) => !filteredCards.some((c) => c.id === id))
        : Array.from(new Set([...prev, ...filteredCards.map((c) => c.id)]))
    );

  const handleCopyAll = async () => {
    const ok = await copyText(equipmentCards.map(cardToText).join('\n\n'));
    setCopiedAll(ok ? 'ok' : 'err');
    clearTimeout(copyAllTimer.current);
    copyAllTimer.current = setTimeout(() => setCopiedAll(null), 2000);
  };

  // Navigasi tab dengan panah kiri/kanan
  const handleFilterKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : filters.length - 1)) % filters.length;
    setActiveFilter(filters[next].id);
    if (tabRefs.current[next]) tabRefs.current[next].focus();
  };

  const headerButton =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide bg-[#1d1830] text-[#a89ec0] border border-[rgba(61,53,96,0.6)] transition-all duration-300 hover:border-[rgba(126,224,210,0.35)] hover:text-white hover:bg-[#2d2855]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]';

  return (
    <section id="equipment" className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-12 lg:pb-20">
      <style>{`
        @keyframes eq-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .eq-fade { animation: eq-fade .4s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .eq-fade { animation: none !important; } }
      `}</style>

      <div
        ref={sectionRef}
        className={`max-w-6xl mx-auto transition-all duration-700 ${
          sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Main Card */}
        <div className="bg-[#130f24] border border-[rgba(61,53,96,0.7)] rounded-2xl p-5 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xl">
          {/* Animated Background */}
          <AnimatedBackground />

          {/* Grid halus ala lembar spesifikasi */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(168,158,192,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168,158,192,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at top, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse at top, black 20%, transparent 75%)',
            }}
          />

          {/* Header */}
          <div className="relative z-10 border-b border-[rgba(61,53,96,0.5)] pb-5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left: Icon + Title */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1d1830] border border-[rgba(126,224,210,0.3)] flex items-center justify-center shadow-inner shrink-0">
                  <PcIcon size={20} className="text-[#7ee0d2]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-[22px] font-bold text-white tracking-wide font-display leading-tight">
                    Spesifikasi Peralatan
                  </h3>
                  <p className="mt-1 text-[10px] font-mono tracking-wider uppercase text-[#5c5480]">
                    {equipmentCards.length} sistem · {totalComponents} komponen · {totalSpecs} spesifikasi
                  </p>
                </div>
              </div>

              {/* Right: aksi untuk seluruh daftar */}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleCopyAll} className={headerButton}>
                  {copiedAll === 'ok' ? <CheckIcon size={12} className="text-[#4ade80]" /> : <CopyIcon size={12} />}
                  {copiedAll === 'ok' ? 'Tersalin' : copiedAll === 'err' ? 'Gagal menyalin' : 'Salin semua'}
                </button>
                <button
                  type="button"
                  onClick={toggleAll}
                  disabled={filteredCards.length === 0}
                  className={headerButton}
                >
                  <ChevronDownIcon
                    size={12}
                    className={`transition-transform duration-300 ${allOpen ? 'rotate-180' : ''}`}
                  />
                  {allOpen ? 'Tutup semua' : 'Buka semua'}
                </button>
              </div>
            </div>
            <span className="sr-only" role="status">
              {copiedAll === 'ok' ? 'Semua spesifikasi tersalin' : copiedAll === 'err' ? 'Gagal menyalin spesifikasi' : ''}
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 mb-5">
            <div role="tablist" aria-label="Filter sistem peralatan" className="flex flex-wrap items-center gap-2">
              {filters.map((filter, i) => (
                <button
                  key={filter.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.id}
                  tabIndex={activeFilter === filter.id ? 0 : -1}
                  onClick={() => setActiveFilter(filter.id)}
                  onKeyDown={(e) => handleFilterKey(e, i)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2] ${
                    activeFilter === filter.id
                      ? 'bg-[#7ee0d2] text-[#1d1830] shadow-lg shadow-[#7ee0d2]/25'
                      : 'bg-[#1d1830] text-[#a89ec0] border border-[rgba(61,53,96,0.6)] hover:border-[rgba(126,224,210,0.35)] hover:text-white hover:bg-[#2d2855]/60'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10px] font-mono tracking-wider uppercase text-[#5c5480]" aria-live="polite">
              Menampilkan {filteredCards.length} / {equipmentCards.length} sistem
            </span>
          </div>

          {/* Equipment Cards */}
          <div ref={cardsRef}>
            <div
              key={activeFilter}
              role="tabpanel"
              className={`eq-fade grid gap-4 ${
                filteredCards.length === 1
                  ? 'grid-cols-1 sm:max-w-md sm:mx-auto'
                  : filteredCards.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredCards.map((card, index) => (
                <EquipmentCard
                  key={card.id}
                  card={card}
                  index={index}
                  isVisible={cardsVisible}
                  isExpanded={expandedCards.includes(card.id)}
                  onToggle={() => toggleCard(card.id)}
                />
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 mt-5 pt-4 border-t border-[rgba(61,53,96,0.4)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-[#5c5480]">
              <span>
                Diperbarui:{' '}
                {updatedAt.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse motion-reduce:animate-none" />
                  Semua sistem beroperasi
                </span>
                <span className="text-[#7ee0d2]">|</span>
                <span>Perbarui otomatis: 30d</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquipmentSection;