import { useState, useEffect, useRef } from 'react';
import heroCharacter from '../../assets/hero-character.png';

// ========== ICONS ==========

const YouTubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

const GamepadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6.5 8h11a4 4 0 0 1 3.9 4.9l-.8 3.6a2.3 2.3 0 0 1-4 1l-1.6-2H9l-1.6 2a2.3 2.3 0 0 1-4-1l-.8-3.6A4 4 0 0 1 6.5 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M8 10.5v3M6.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="15.5" cy="11.5" r="0.9" fill="currentColor"/>
    <circle cx="17.5" cy="13.2" r="0.9" fill="currentColor"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

// ========== DATA (mudah diedit) ==========

const SOCIALS = [
  { name: 'YouTube', href: '#', Icon: YouTubeIcon, brand: '#ff4d4d' },
  { name: 'Twitter', href: '#', Icon: TwitterIcon, brand: '#f1f0f5' },
  { name: 'TikTok', href: '#', Icon: TikTokIcon, brand: '#25f4ee' },
];

const PILLARS = [
  {
    id: 'journeys',
    title: 'Midnight Journeys',
    tag: 'Late-night introspection',
    text: 'Slow, introspective streams for the hours when the world goes quiet. Talk, wander, and simply be here.',
    accent: '#7ee0d2',
    Icon: MoonIcon,
  },
  {
    id: 'games',
    title: 'Indie Worlds',
    tag: 'Atmospheric indie games',
    text: 'Atmospheric indie games explored at an unhurried pace, one quiet scene at a time.',
    accent: '#c084fc',
    Icon: GamepadIcon,
  },
  {
    id: 'acoustic',
    title: 'Acoustic Soundscapes',
    tag: 'Sing-along sets',
    text: 'Gentle acoustic sets and sing-alongs to settle into when the night feels long.',
    accent: '#fbbf24',
    Icon: MusicIcon,
  },
];

// Target subscriber berikutnya untuk progress bar (ubah sesuai target aslinya)
const SUB_GOAL = 5000;

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

    // Pengguna reduced motion: langsung tampilkan angka akhir
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

// Siku bergaya HUD yang melebar saat frame di-hover
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
  const [statsRef, statsVisible] = useScrollReveal({ threshold: 0.3 });
  const [pillarsRef, pillarsVisible] = useScrollReveal({ threshold: 0.15 });
  const [activePillar, setActivePillar] = useState(0);

  const frameRef = useRef(null);
  const glowRef = useRef(null);
  const rafRef = useRef(0);

  const videoCount = useCountUp(703, 1500, statsVisible);
  const subCount = useCountUp(4650, 2000, statsVisible);
  const debutCount = useCountUp(25, 1000, statsVisible);
  const milestone = Math.min(100, Math.round((subCount / SUB_GOAL) * 100));

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Tilt karakter: pakai ref + CSS variable (tanpa state) agar tidak re-render tiap gerakan mouse
  const handleFrameMove = (e) => {
    const el = frameRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', (((clientX - r.left) / r.width - 0.5) * 10).toFixed(2));
      el.style.setProperty('--ty', (((clientY - r.top) / r.height - 0.5) * 10).toFixed(2));
    });
  };

  const handleFrameLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.setProperty('--tx', '0');
    el.style.setProperty('--ty', '0');
  };

  // Glow border + sorot cahaya di dalam card mengikuti kursor
  const handleCardMove = (e) => {
    const el = glowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cx', `${e.clientX - r.left}px`);
    el.style.setProperty('--cy', `${e.clientY - r.top}px`);
    el.style.setProperty('--co', '1');
  };

  const handleCardLeave = () => {
    glowRef.current?.style.setProperty('--co', '0');
  };

  return (
    <section id="about" className="relative w-full py-12 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0f0a22]">
      {/* Keyframes khusus section ini (mati otomatis untuk reduced motion) */}
      <style>{`
        @keyframes ab-spin { to { transform: rotate(360deg); } }
        @keyframes ab-scan { from { top: 0%; } to { top: 100%; } }
        @keyframes ab-eq { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
        @keyframes ab-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,-6%) scale(1.1); } }
        @keyframes ab-drift-rev { from { transform: translate(0,0) scale(1.05); } to { transform: translate(-5%,4%) scale(1); } }
        .ab-spin { animation: ab-spin 50s linear infinite; }
        .ab-scan { animation: ab-scan 2.4s linear infinite; }
        .ab-eq { animation: ab-eq 1s ease-in-out infinite; }
        .ab-drift { animation: ab-drift 20s ease-in-out infinite alternate; }
        .ab-drift-rev { animation: ab-drift-rev 24s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .ab-spin, .ab-scan, .ab-eq, .ab-drift, .ab-drift-rev { animation: none !important; }
        }
      `}</style>

      {/* Ambient background: grid titik, nebula lembut, dan transisi halus dari hero */}
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
        <div
          className="absolute top-0 left-0 right-0 h-24"
          style={{ background: 'linear-gradient(to bottom, #12102A, transparent)' }}
        />
      </div>

      <div className="max-w-[900px] mx-auto relative">
        {/* Overline Pill Tag */}
        <div ref={headerRef} className={`flex justify-center mb-3 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(192,132,252,0.1)] border border-[rgba(192,132,252,0.2)]">
            <span className="text-[#c084fc] text-xs">✦</span>
            <span className="font-bold text-[#c084fc] text-[11px] tracking-wider uppercase font-sans">ABOUT XION</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className={`text-center text-2xl lg:text-[28px] font-bold text-white tracking-[-0.7px] mb-8 font-display transition-all duration-700 delay-100 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          The Solitary Voice in Deep Space
        </h2>

        {/* Main Profile Bento Card */}
        <div ref={cardRef} className={`transition-[opacity,transform] duration-700 delay-200 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div
            ref={glowRef}
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
            className="relative rounded-2xl p-px bg-[rgba(61,53,96,0.7)]"
            style={{ '--cx': '50%', '--cy': '50%', '--co': 0 }}
          >
            {/* Border glow mengikuti kursor */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
              style={{
                opacity: 'var(--co)',
                background: 'radial-gradient(320px circle at var(--cx) var(--cy), rgba(126,224,210,0.7), rgba(192,132,252,0.35) 45%, transparent 75%)',
              }}
            />

            <div className="relative bg-[#1d1830] rounded-[15px] p-5 lg:p-8 overflow-hidden">
              {/* Sorot cahaya halus di dalam card */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: 'var(--co)',
                  background: 'radial-gradient(420px circle at var(--cx) var(--cy), rgba(126,224,210,0.07), transparent 65%)',
                }}
              />

              <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Character Frame (Left) - Interactive */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <div
                    ref={frameRef}
                    className="group relative w-[260px] lg:w-[291.89px] cursor-pointer"
                    onMouseMove={handleFrameMove}
                    onMouseLeave={handleFrameLeave}
                    style={{ '--tx': 0, '--ty': 0 }}
                  >
                    {/* Aura + cincin putus-putus */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-[8%] rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(126,224,210,0.18) 0%, rgba(192,132,252,0.10) 45%, transparent 70%)' }}
                    />
                    <svg aria-hidden="true" viewBox="0 0 100 100" className="ab-spin absolute inset-[6%] w-[88%] h-[88%] pointer-events-none opacity-40">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="#7ee0d2" strokeWidth="0.3" strokeDasharray="1 3" strokeLinecap="round" />
                      <circle cx="50" cy="2" r="1.1" fill="#c084fc" />
                    </svg>

                    {/* Siku HUD */}
                    <Bracket pos="tl" />
                    <Bracket pos="tr" />
                    <Bracket pos="bl" />
                    <Bracket pos="br" />

                    {/* Karakter: tilt 3D + zoom saat hover (sama seperti sebelumnya) */}
                    <div className="relative transition-transform duration-300 group-hover:scale-105">
                      <div
                        style={{
                          transform: 'perspective(500px) rotateY(calc(var(--tx, 0) * 1deg)) rotateX(calc(var(--ty, 0) * -1deg))',
                          transition: 'transform 0.3s ease-out',
                        }}
                      >
                        <img
                          src={heroCharacter}
                          alt="Xion Regalia"
                          draggable={false}
                          className="w-full h-auto object-contain select-none"
                        />
                      </div>
                    </div>

                    {/* Garis scan muncul saat hover */}
                    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      <div
                        className="ab-scan absolute left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(126,224,210,0.85), transparent)',
                          boxShadow: '0 0 12px rgba(126,224,210,0.6)',
                        }}
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(15,10,34,0.9)] backdrop-blur-sm border border-[rgba(61,53,96,0.6)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse"></div>
                      <span className="font-medium text-[#a89ec0] text-[10px] tracking-wider uppercase font-sans">TELEM: STABLE</span>
                    </div>

                    {/* Chip stream berikutnya + equalizer */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(15,10,34,0.9)] backdrop-blur-sm border border-[rgba(61,53,96,0.6)]">
                      <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="ab-eq w-[2px] h-full rounded-full bg-[#c084fc] origin-bottom"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </span>
                      <span className="font-medium text-[#a89ec0] text-[10px] tracking-wider uppercase font-sans">NEXT 23:00 WIB</span>
                    </div>
                  </div>
                </div>

                {/* Info Block (Right) */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Header */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-2xl lg:text-[32px] font-bold text-white tracking-[-0.8px] font-display">Xion Regalia</h3>
                      <div className="inline-flex px-3 py-1.5 rounded bg-[#151028] border border-[rgba(61,53,96,0.5)] self-start sm:self-auto">
                        <span className="font-bold text-[#a89ec0] text-[10px] lg:text-xs tracking-wider uppercase font-sans">INDEPENDENT VTUBER · SINCE 2025</span>
                      </div>
                    </div>

                    <p className="text-[#a89ec0] text-sm leading-relaxed mb-4">
                      A quiet sanctuary under midnight skies. Streaming late-night introspective journeys, atmospheric indie games, and acoustic soundscapes for those who seek solace in the quiet hours.
                    </p>

                    {/* Chip vibe: klik untuk membuka pillar yang sesuai di bawah */}
                    <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Content focus">
                      {PILLARS.map((p, i) => {
                        const active = i === activePillar;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setActivePillar(i)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium font-sans transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
                            style={
                              active
                                ? { color: p.accent, borderColor: `${p.accent}99`, backgroundColor: `${p.accent}1a` }
                                : { color: '#a89ec0', borderColor: 'rgba(61,53,96,0.8)', backgroundColor: 'rgba(21,16,40,0.6)' }
                            }
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.accent }}></span>
                            {p.tag}
                          </button>
                        );
                      })}
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                      {SOCIALS.map(({ name, href, Icon, brand }) => (
                        <a
                          key={name}
                          href={href}
                          target={href !== '#' ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={href === '#' ? (e) => e.preventDefault() : undefined}
                          style={{ '--brand': brand }}
                          className="group inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-[#231f42] border border-[#3d3560] hover:border-[var(--brand)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_var(--brand)] transition-all duration-200"
                        >
                          <span className="text-white group-hover:text-[var(--brand)] transition-colors"><Icon /></span>
                          <span className="font-medium text-white text-sm group-hover:text-[var(--brand)] transition-colors">{name}</span>
                          <span className="w-0 opacity-0 overflow-hidden text-[var(--brand)] transition-all duration-200 group-hover:w-2.5 group-hover:opacity-100">
                            <ArrowUpRightIcon />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[rgba(61,53,96,0.6)] my-5"></div>

                  {/* Stats Row - Interactive */}
                  <div ref={statsRef}>
                    <div className="grid grid-cols-3 gap-4 sm:gap-6">
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#7ee0d2] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-110 origin-left transition-transform duration-300">
                          {videoCount.toLocaleString()}
                        </p>
                        <p className="text-[#a89ec0] text-sm">Total Video</p>
                      </div>
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#c084fc] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-110 origin-left transition-transform duration-300">
                          {subCount >= 1000 ? `${(subCount / 1000).toFixed(subCount >= 10000 ? 0 : 1)}k` : subCount}
                        </p>
                        <p className="text-[#a89ec0] text-sm">Subscribers</p>
                      </div>
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#fbbf24] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-110 origin-left transition-transform duration-300">
                          {debutCount > 12 ? 'Feb' : 'Jan'} '{debutCount.toString().padStart(2, '0')}
                        </p>
                        <p className="text-[#a89ec0] text-sm">Debut</p>
                      </div>
                    </div>

                    {/* Progress menuju milestone subscriber */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2 font-sans">
                        <span className="text-[#a89ec0] text-[10px] font-bold tracking-wider uppercase">
                          Next milestone · {SUB_GOAL / 1000}k subscribers
                        </span>
                        <span className="text-[#c084fc] text-xs font-bold">{milestone}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={milestone}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Progress menuju milestone subscriber berikutnya"
                        className="h-1.5 rounded-full bg-[#151028] overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${milestone}%`, background: 'linear-gradient(90deg, #7ee0d2, #c084fc)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Pillars: kartu yang melebar saat di-hover / diklik */}
        <div
          ref={pillarsRef}
          className={`mt-5 flex flex-col lg:flex-row gap-3 transition-all duration-700 ${pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {PILLARS.map((p, i) => {
            const active = i === activePillar;
            const { Icon } = p;
            return (
              <button
                key={p.id}
                type="button"
                aria-expanded={active}
                onClick={() => setActivePillar(i)}
                onMouseEnter={() => setActivePillar(i)}
                className="text-left rounded-2xl border p-5 lg:basis-0 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
                style={{
                  flexGrow: active ? 2 : 1,
                  borderColor: active ? `${p.accent}66` : 'rgba(61,53,96,0.7)',
                  background: active ? `linear-gradient(160deg, ${p.accent}14, #1d1830 65%)` : '#1d1830',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl border transition-colors duration-300"
                    style={{
                      color: p.accent,
                      borderColor: `${p.accent}${active ? '80' : '33'}`,
                      backgroundColor: `${p.accent}${active ? '1f' : '0f'}`,
                    }}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-white text-sm font-bold font-display leading-tight">{p.title}</span>
                    <span className="block text-[#a89ec0] text-xs mt-0.5">{p.tag}</span>
                  </span>
                </div>

                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="pt-3 text-[#a89ec0] text-sm leading-relaxed">{p.text}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;