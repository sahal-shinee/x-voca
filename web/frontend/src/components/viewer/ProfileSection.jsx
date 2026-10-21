import { useState, useEffect, useRef } from 'react';
import heroCharacter from '../../assets/hero-character.png';

// ========== ICONS ==========

const DiscordIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.186 24C5.452 24 0 18.675 0 12.08 0 5.484 5.452.16 12.186.16c6.643 0 11.968 5.176 11.968 11.92 0 1.257-.184 2.457-.52 3.593-.243.82-1.107 1.272-1.927 1.026-.816-.242-1.27-1.103-1.028-1.925.267-.9.41-1.848.41-2.694 0-5.467-4.226-9.61-9.923-9.61-5.698 0-9.878 4.143-9.878 9.61 0 5.468 4.18 9.61 9.878 9.61 3.54 0 6.64-1.636 8.358-4.27a1.536 1.536 0 0 1 2.133-.427c.71.46.906 1.42.443 2.128C19.467 21.996 15.992 24 12.186 24z"/>
    <path d="M12.186 17.68c-2.912 0-5.188-2.28-5.188-5.6 0-3.32 2.276-5.6 5.188-5.6 2.912 0 5.188 2.28 5.188 5.6 0 1.055-.262 2.05-.758 2.87-.58.958-1.488 1.543-2.558 1.646-.867.084-1.572-.34-1.868-.96-.454.673-1.173 1.044-2.022 1.044zm0-2.31c1.554 0 2.878-1.326 2.878-3.29 0-1.965-1.324-3.29-2.878-3.29-1.554 0-2.878 1.325-2.878 3.29 0 1.964 1.324 3.29 2.878 3.29z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SaweriaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const TrakteerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const SociaBuzzIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ========== DATA RESMI ==========

const SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/5YGyzjSsuC', Icon: DiscordIcon, brand: '#5865F2' },
  { name: 'X', href: 'https://x.com/xionregalia', Icon: XIcon, brand: '#f1f0f5' },
  { name: 'Instagram', href: 'https://instagram.com/xionregalia', Icon: InstagramIcon, brand: '#E1306C' },
  { name: 'Threads', href: 'https://threads.net/@xionregalia', Icon: ThreadsIcon, brand: '#e5e7eb' },
  { name: 'TikTok', href: 'https://tiktok.com/@xionregalia', Icon: TikTokIcon, brand: '#25f4ee' },
  { name: 'Saweria', href: 'https://saweria.co/xionregalia', Icon: SaweriaIcon, brand: '#fbbf24' },
  { name: 'Trakteer', href: 'https://trakteer.id/xion_regalia', Icon: TrakteerIcon, brand: '#f43f5e' },
  { name: 'SociaBuzz', href: 'https://sociabuzz.com/xionregalia/tribe', Icon: SociaBuzzIcon, brand: '#38bdf8' },
];

// Target subscriber berikutnya untuk progress bar
const SUB_GOAL = 5000;

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

  const frameRef = useRef(null);
  const glowRef = useRef(null);
  const rafRef = useRef(0);

  // Dynamic real-time calculation of active days from Debut Date (8 Feb 2025)
  const totalActiveDays = Math.max(0, Math.floor((new Date() - DEBUT_DATE) / (1000 * 60 * 60 * 24)));
  const activeDaysCount = useCountUp(totalActiveDays, 1500, statsVisible);
  const videoCount = useCountUp(703, 1500, statsVisible);
  const subCount = useCountUp(4650, 2000, statsVisible);
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

                    {/* Official Channels & Support Links */}
                    <div className="mb-6">
                      <p className="text-[11px] font-semibold text-[#a89ec0] uppercase tracking-wider font-mono mb-2.5">
                        Kanal Resmi & Media Sosial
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SOCIALS.map(({ name, href, Icon, brand }) => (
                          <a
                            key={name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ '--brand': brand }}
                            className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#231f42]/90 border border-[#3d3560] hover:border-[var(--brand)] hover:bg-[#2b2552] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_-4px_var(--brand)] transition-all duration-200"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="text-white/80 group-hover:text-[var(--brand)] transition-colors flex-shrink-0">
                                <Icon />
                              </span>
                              <span className="font-medium text-white text-xs truncate group-hover:text-[var(--brand)] transition-colors">
                                {name}
                              </span>
                            </span>
                            <span className="text-[#a89ec0] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0">
                              <ArrowUpRightIcon />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[rgba(61,53,96,0.6)] my-5"></div>

                  {/* Stats Row - Real-time & Dynamic */}
                  <div ref={statsRef}>
                    <div className="grid grid-cols-3 gap-3 sm:gap-6">
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#7ee0d2] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-105 origin-left transition-transform duration-300">
                          {videoCount.toLocaleString()}+
                        </p>
                        <p className="text-[#a89ec0] text-xs sm:text-sm font-sans">Total Video</p>
                      </div>
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#c084fc] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-105 origin-left transition-transform duration-300">
                          {subCount >= 1000 ? `${(subCount / 1000).toFixed(1)}k+` : subCount}
                        </p>
                        <p className="text-[#a89ec0] text-xs sm:text-sm font-sans">Subscribers</p>
                      </div>
                      <div className="group text-center sm:text-left rounded-xl p-2 sm:p-3 -m-2 sm:-m-3 hover:bg-[rgba(35,31,66,0.55)] transition-colors duration-300">
                        <p className="text-[#fbbf24] text-2xl lg:text-[32px] font-bold font-display group-hover:scale-105 origin-left transition-transform duration-300">
                          {activeDaysCount} Hari
                        </p>
                        <p className="text-[#a89ec0] text-xs sm:text-sm font-sans">Debut 8 Feb 2025</p>
                      </div>
                    </div>

                    {/* Progress menuju milestone subscriber */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2 font-sans">
                        <span className="text-[#a89ec0] text-[10px] font-bold tracking-wider uppercase">
                          Target Milestone · {SUB_GOAL / 1000}k subscribers
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
      </div>
    </section>
  );
};

export default ProfileSection;