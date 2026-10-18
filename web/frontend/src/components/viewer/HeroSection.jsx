import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import heroCharacter from '../../assets/hero-character.png';
import TopNav from './TopNav';
import { getNextSchedule } from '../../services/scheduleService';
import { Users } from 'lucide-react';

// ========== ICONS ==========

const ArrowRightIcon = () => (
  <svg width="9.469" height="3.75" viewBox="0 0 9.469 3.75" fill="none" aria-hidden="true">
    <path d="M9.219 1.875L5.625 0.469M9.219 1.875L7.813 5.219M9.219 1.875L5.625 3.281M0 1.875H9.219" stroke="#18132B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M9 11V8C9 7.45 9.45 7 10 7H14V13H4V3H10V4H11V3H5V12H9V11Z" fill="currentColor"/>
    <path d="M14 2H10V7H14V2Z" fill="currentColor"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M12 2H11V1C11 0.45 10.55 0 10 0C9.45 0 9 0.45 9 1V2H5V1C5 0.45 4.55 0 4 0C3.45 0 3 0.45 3 1V2H2C1.45 2 1 2.45 1 3V13C1 13.55 1.45 14 2 14H12C12.55 14 13 13.55 13 13V3C13 2.45 12.55 2 12 2ZM12 13H2V6H12V13Z" fill="#a89ec0"/>
  </svg>
);

const ScrollChevronIcon = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1L5 5L9 1" stroke="#7ee0d2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AudioIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 0V14M2 4V10M11 3V11M5 5.5V8.5M9 4.5V9.5" stroke="#a89ec0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UserIcon = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const YouTubeIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

// ========== MOOD DATA ==========

// Ubah teks / warna di sini untuk menyesuaikan persona Xion.
// Mood yang dipilih juga mengubah warna background interaktif.
const MOODS = [
  {
    id: 'nocturne',
    label: 'Nocturne',
    status: 'Midnight calm',
    color: '#7ee0d2',
    glow: '126,224,210',
    lines: [
      'Selamat malam. Duduk dulu, malam ini kita pelan-pelan saja.',
      'Ada lagu yang pengin kamu dengar sambil ngobrol?',
      'Sunyi juga punya suara. Dengarkan bareng aku.',
    ],
  },
  {
    id: 'aurora',
    label: 'Aurora',
    status: 'Sing-along',
    color: '#c084fc',
    glow: '192,132,252',
    lines: [
      'Langit lagi cantik. Mau request lagu apa malam ini?',
      'Siap-siap, nanti kita nyanyi bareng di chat!',
      'Kalau suaraku fals, pura-pura nggak dengar ya.',
    ],
  },
  {
    id: 'ember',
    label: 'Ember',
    status: 'Game night',
    color: '#fb923c',
    glow: '251,146,60',
    lines: [
      'Mode semangat aktif! Voting game berikutnya sekarang.',
      'Satu level lagi, janji. Eh, satu lagi deh.',
      'Pilihan kamu menentukan stream berikutnya.',
    ],
  },
];

// ========== INTERACTIVE BACKGROUND ==========

// Pergeseran berbasis posisi kursor (--px / --py bernilai -0.5 sampai 0.5)
const parallax = (px) => ({
  transform: `translate3d(calc(var(--px, 0) * ${px}px), calc(var(--py, 0) * ${px}px), 0)`,
  transition: 'transform 0.9s ease-out',
});

function InteractiveBackground({ mood }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const moodRef = useRef(mood);
  moodRef.current = mood;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const host = wrap.parentElement;
    const ctx = canvas.getContext('2d');
    if (!host || !ctx) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TAU = Math.PI * 2;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let inView = true;
    let nextShooter = 0;
    let stars = [];
    let shooters = [];
    let ripples = [];
    let sparks = [];
    const mouse = { x: 0, y: 0, active: false, px: 0, py: 0, tx: 0, ty: 0 };

    function buildStars() {
      const count = Math.min(150, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75; // kedalaman: kecil = jauh
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.4 + z * 1.2,
          ph: Math.random() * TAU,
          sp: 0.01 + Math.random() * 0.02,
          tint: Math.random() < 0.28,
        };
      });
    }

    function spawnShooter() {
      const angle = ((20 + Math.random() * 20) * Math.PI) / 180;
      const speed = 9 + Math.random() * 5;
      shooters.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 55 + Math.random() * 25,
      });
    }

    function draw(now, dt) {
      ctx.clearRect(0, 0, w, h);
      const { glow } = moodRef.current;

      // Parallax dihaluskan (lerp) menuju posisi kursor
      mouse.px += (mouse.tx - mouse.px) * 0.06 * dt;
      mouse.py += (mouse.ty - mouse.py) * 0.06 * dt;

      // Bintang: berkedip, hanyut pelan, bergeser sesuai kedalaman, menjauh dari kursor
      const near = [];
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        if (!reduce) {
          s.x += s.z * 0.12 * dt;
          if (s.x > w + 5) s.x = -5;
          s.ph += s.sp * dt;
        }
        let x = s.x - mouse.px * 26 * s.z;
        let y = s.y - mouse.py * 26 * s.z;
        let grow = 1;
        if (mouse.active) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 140 && d > 0.1) {
            const f = (1 - d / 140) * 16 * s.z;
            x += (dx / d) * f;
            y += (dy / d) * f;
            grow = 1 + (1 - d / 140) * 0.9;
          }
          if (d < 150 && near.length < 40) near.push({ x, y });
        }
        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        ctx.beginPath();
        ctx.arc(x, y, s.r * grow, 0, TAU);
        ctx.fillStyle = s.tint
          ? `rgba(${glow},${0.35 + 0.55 * tw * s.z})`
          : `rgba(226,220,255,${0.25 + 0.6 * tw * s.z})`;
        ctx.fill();
      }

      // Rasi bintang: garis antar bintang di sekitar kursor
      if (near.length > 1) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < near.length; i += 1) {
          for (let j = i + 1; j < near.length; j += 1) {
            const d = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
            if (d < 95) {
              ctx.strokeStyle = `rgba(${glow},${(1 - d / 95) * 0.45})`;
              ctx.beginPath();
              ctx.moveTo(near[i].x, near[i].y);
              ctx.lineTo(near[j].x, near[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Bintang jatuh sesekali
      if (!reduce) {
        if (now > nextShooter) {
          spawnShooter();
          nextShooter = now + 3500 + Math.random() * 4500;
        }
        shooters = shooters.filter((s) => s.life < s.max && s.x < w + 60 && s.y < h + 60);
        for (let i = 0; i < shooters.length; i += 1) {
          const s = shooters[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.life += dt;
          const alpha = 1 - s.life / s.max;
          const g = ctx.createLinearGradient(s.x - s.vx * 7, s.y - s.vy * 7, s.x, s.y);
          g.addColorStop(0, `rgba(${glow},0)`);
          g.addColorStop(1, `rgba(255,255,255,${alpha})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x - s.vx * 7, s.y - s.vy * 7);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.4, 0, TAU);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }

      // Riak gelombang saat background diklik
      ripples = ripples.filter((r) => r.t < 50);
      for (let i = 0; i < ripples.length; i += 1) {
        const r = ripples[i];
        r.t += dt;
        const k = r.t / 50;
        ctx.beginPath();
        ctx.arc(r.x, r.y, k * 150, 0, TAU);
        ctx.strokeStyle = `rgba(${r.glow},${(1 - k) * 0.5})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Percikan bintang saat diklik
      sparks = sparks.filter((p) => p.life < p.max);
      for (let i = 0; i < sparks.length; i += 1) {
        const p = sparks[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life += dt;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.fillStyle = `rgba(${p.glow},${1 - p.life / p.max})`;
        ctx.fill();
      }
    }

    function tick(now) {
      const dt = Math.min(2.5, last ? (now - last) / 16.667 : 1);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (reduce || raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function sync() {
      if (inView && !document.hidden) start();
      else stop();
    }

    function resize() {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (reduce) draw(0, 1); // pengguna reduced motion: cukup satu frame statis
    }

    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
      mouse.tx = x / r.width - 0.5;
      mouse.ty = y / r.height - 0.5;
      wrap.style.setProperty('--sx', `${x}px`);
      wrap.style.setProperty('--sy', `${y}px`);
      wrap.style.setProperty('--so', '1');
      wrap.style.setProperty('--px', mouse.tx.toFixed(3));
      wrap.style.setProperty('--py', mouse.ty.toFixed(3));
    };

    const onLeave = () => {
      mouse.active = false;
      mouse.tx = 0;
      mouse.ty = 0;
      wrap.style.setProperty('--so', '0');
      wrap.style.setProperty('--px', '0');
      wrap.style.setProperty('--py', '0');
    };

    const onDown = (e) => {
      // Klik pada tombol / link tidak memicu efek background
      if (e.target.closest && e.target.closest('a, button')) return;
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const { glow } = moodRef.current;
      ripples.push({ x, y, t: 0, glow });
      for (let i = 0; i < 10; i += 1) {
        const a = (TAU * i) / 10 + Math.random() * 0.4;
        const sp = 2 + Math.random() * 3;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: 0.8 + Math.random() * 1.4,
          life: 0,
          max: 45 + Math.random() * 20,
          glow,
        });
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    const ro = new ResizeObserver(resize);

    resize();
    ro.observe(host);
    io.observe(host);

    if (!reduce) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('pointercancel', onLeave);
      host.addEventListener('pointerdown', onDown);
      document.addEventListener('visibilitychange', sync);
      sync();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointercancel', onLeave);
      host.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={{ '--sx': '50%', '--sy': '40%', '--so': 0, '--px': 0, '--py': 0 }}
    >
      {/* Nebula: warna pertama mengikuti mood */}
      <div style={parallax(-46)} className="absolute -left-[10%] top-[8%] w-[48vw] h-[48vw] max-w-[720px] max-h-[720px]">
        <div
          className="xv-drift w-full h-full rounded-full blur-[90px]"
          style={{ background: `rgba(${mood.glow},0.16)`, transition: 'background 1.2s ease' }}
        />
      </div>
      <div style={parallax(34)} className="absolute -right-[8%] top-[18%] w-[44vw] h-[44vw] max-w-[680px] max-h-[680px]">
        <div className="xv-drift-rev w-full h-full rounded-full blur-[100px]" style={{ background: 'rgba(192,132,252,0.14)' }} />
      </div>
      <div style={parallax(-22)} className="absolute left-[30%] -bottom-[12%] w-[40vw] h-[26vw] max-w-[620px] max-h-[400px]">
        <div className="xv-drift w-full h-full rounded-full blur-[90px]" style={{ background: 'rgba(76,102,220,0.12)' }} />
      </div>

      {/* Bulan sabit (hanya layar lebar) */}
      <div style={parallax(18)} className="hidden lg:block absolute right-[7%] top-[12%]">
        <div className="xv-moon" style={{ filter: `drop-shadow(0 0 18px rgba(${mood.glow},0.4))`, transition: 'filter 1.2s ease' }}>
          <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
            <defs>
              <mask id="xv-moon-mask">
                <rect width="92" height="92" fill="white" />
                <circle cx="62" cy="36" r="32" fill="black" />
              </mask>
              <linearGradient id="xv-moon-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f3efff" />
                <stop offset="1" stopColor="#b9a8f0" />
              </linearGradient>
            </defs>
            <circle cx="42" cy="48" r="32" fill="url(#xv-moon-grad)" mask="url(#xv-moon-mask)" />
          </svg>
        </div>
      </div>

      {/* Sorot cahaya mengikuti kursor */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 'var(--so)',
          transition: 'opacity 0.5s ease',
          background: `radial-gradient(420px circle at var(--sx) var(--sy), rgba(${mood.glow},0.11), transparent 65%)`,
        }}
      />

      {/* Bintang, rasi, bintang jatuh, riak klik */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

// ========== CHARACTER STAGE ==========

// Posisi tetap (tanpa Math.random) agar render konsisten
const SPARKLES = [
  { left: '6%', top: '22%', size: 12, delay: 0, dur: 3.4 },
  { left: '90%', top: '30%', size: 10, delay: 0.8, dur: 4 },
  { left: '14%', top: '68%', size: 9, delay: 1.5, dur: 3.8 },
  { left: '84%', top: '74%', size: 13, delay: 0.4, dur: 4.4 },
  { left: '50%', top: '4%', size: 9, delay: 1.1, dur: 3.6 },
];

function useTypewriter(text, speed = 28) {
  const [out, setOut] = useState('');

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setOut(text);
      return undefined;
    }

    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return out;
}

// Pergeseran ringan per layer untuk efek kedalaman (parallax)
const depth = (px) => ({
  transform: `translate3d(calc(var(--mx, 0) * ${px}px), calc(var(--my, 0) * ${px}px), 0)`,
  transition: 'transform 0.3s ease-out',
});

function CharacterStage({ moodIndex, onMoodChange }) {
  const stageRef = useRef(null);
  const frameRef = useRef(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [bursts, setBursts] = useState([]);

  const mood = MOODS[moodIndex];
  const line = mood.lines[lineIndex % mood.lines.length];
  const typed = useTypewriter(line);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Pakai ref + CSS variable, bukan state, supaya tidak re-render setiap gerakan mouse
  const handleMove = (e) => {
    const el = stageRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const mx = ((clientX - r.left) / r.width - 0.5) * 2;
      const my = ((clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty('--mx', mx.toFixed(3));
      el.style.setProperty('--my', my.toFixed(3));
    });
  };

  const handleLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    cancelAnimationFrame(frameRef.current);
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  const handleGreet = (e) => {
    setLineIndex((i) => i + 1);

    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // e.detail === 0 berarti diaktifkan lewat keyboard -> pakai titik tengah
    const x = e.detail === 0 ? r.width / 2 : e.clientX - r.left;
    const y = e.detail === 0 ? r.height / 2 : e.clientY - r.top;
    const base = Date.now() + Math.random();
    const items = Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI * 2 * k) / 6;
      return { id: base + k, x, y, bx: Math.cos(a) * 52, by: Math.sin(a) * 52 };
    });
    setBursts((b) => [...b, ...items]);
    setTimeout(() => {
      setBursts((b) => b.filter((i) => !items.some((n) => n.id === i.id)));
    }, 900);
  };

  const selectMood = (index) => {
    onMoodChange(index);
    setLineIndex(0);
  };

  return (
    <div className="w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[700px]">
      <div
        ref={stageRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative"
        style={{ '--mx': 0, '--my': 0 }}
      >
        {/* Aura */}
        <div
          aria-hidden="true"
          className="xv-aura absolute inset-[8%] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${mood.glow},0.32) 0%, rgba(${mood.glow},0.08) 45%, transparent 70%)`,
            transition: 'background 0.6s ease',
          }}
        />

        {/* Cincin orbit */}
        <svg aria-hidden="true" viewBox="0 0 100 100" className="xv-spin absolute inset-[4%] w-[92%] h-[92%] pointer-events-none" style={{ opacity: 0.55 }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke={mood.color} strokeWidth="0.25" strokeDasharray="0.6 2.4" strokeLinecap="round" style={{ transition: 'stroke 0.6s ease' }} />
          <circle cx="50" cy="2" r="1.1" fill={mood.color} style={{ transition: 'fill 0.6s ease' }} />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 100 100" className="xv-spin-rev absolute inset-[12%] w-[76%] h-[76%] pointer-events-none" style={{ opacity: 0.35 }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke="#c084fc" strokeWidth="0.25" strokeDasharray="4 3" />
          <circle cx="50" cy="98" r="0.9" fill="#c084fc" />
        </svg>

        {/* Kilau */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="xv-twinkle absolute pointer-events-none"
            style={{
              left: s.left,
              top: s.top,
              fontSize: s.size,
              color: i % 2 ? '#c084fc' : mood.color,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
              ...depth(i % 2 ? 26 : 18),
            }}
          >
            ✦
          </span>
        ))}

        {/* Karakter (klik untuk menyapa) */}
        <div style={depth(8)}>
          <div
            style={{
              transform: 'perspective(1000px) rotateY(calc(var(--mx, 0) * 5deg)) rotateX(calc(var(--my, 0) * -5deg))',
              transition: 'transform 0.3s ease-out',
            }}
          >
            <button
              type="button"
              onClick={handleGreet}
              aria-label="Sapa Xion"
              className="block w-full cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
            >
              <div className="xv-float">
                <img
                  src={heroCharacter}
                  alt="XION Regalia - Nocturne Alternate Persona"
                  draggable={false}
                  className="relative w-full h-auto object-contain select-none"
                  style={{
                    filter: `drop-shadow(0 0 28px rgba(${mood.glow},0.35))`,
                    transition: 'filter 0.6s ease',
                  }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Ledakan kilau saat diklik */}
        {bursts.map((b) => (
          <span
            key={b.id}
            aria-hidden="true"
            className="xv-burst absolute pointer-events-none text-sm"
            style={{ left: b.x, top: b.y, color: mood.color, '--bx': `${b.bx}px`, '--by': `${b.by}px` }}
          >
            ✦
          </span>
        ))}

        {/* Pill protokol (ikut berubah sesuai mood) */}
        <div
          className="absolute left-[15%] sm:left-[20%] lg:left-[120px] top-[8%] sm:top-[5%] lg:top-[60px]"
          style={depth(22)}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[rgba(24,19,43,0.9)] backdrop-blur-sm border border-[rgba(192,132,252,0.4)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse"></div>
            <span className="font-bold text-[#c084fc] text-[8px] sm:text-[9px] lg:text-[11px] tracking-wider uppercase whitespace-nowrap font-sans">
              REGALIA PROTOCOL : {mood.label}
            </span>
          </div>
        </div>

        {/* Bubble ucapan */}
        <div
          className="absolute right-[2%] sm:right-0 top-[24%] w-[170px] sm:w-[210px]"
          style={depth(28)}
          aria-live="polite"
        >
          <div
            key={`${moodIndex}-${lineIndex}`}
            className="xv-pop relative px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-[rgba(35,31,66,0.92)] backdrop-blur-sm border"
            style={{ borderColor: `rgba(${mood.glow},0.45)`, transition: 'border-color 0.6s ease' }}
          >
            <p className="relative text-[11px] sm:text-xs leading-[1.5] text-[#f1f0f5] font-body">
              <span className="invisible block" aria-hidden="true">{line}</span>
              <span className="absolute inset-0 block" aria-hidden="true">{typed}</span>
            </p>
            <span className="sr-only">{line}</span>
          </div>
        </div>
      </div>

      {/* Pemilih mood */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <div role="group" aria-label="Pilih mood Xion" className="inline-flex items-center gap-1 p-1 rounded-full bg-[rgba(35,31,66,0.85)] border border-[rgba(61,53,96,0.6)]">
          {MOODS.map((m, i) => {
            const active = i === moodIndex;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectMood(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold font-sans transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2] ${active ? 'text-[#18132B]' : 'text-[#a89ec0] hover:text-white'}`}
                style={active ? { backgroundColor: m.color } : undefined}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? '#18132B' : m.color }}></span>
                {m.label}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] sm:text-xs text-[#a89ec0] font-body">
          Klik Xion untuk menyapa · Sekarang: {mood.status}
        </span>
      </div>
    </div>
  );
}

// ========== HELPER FUNCTIONS ==========

// Safe parse date
const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Format tanggal ke format Indonesia (safe version)
const formatTanggalWIB = (dateString) => {
  const date = safeParseDate(dateString);
  if (!date) return '';
  try {
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      timeZoneName: 'short'
    };
    const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
    // Convert "00.00 WIB" format
    return formatted.replace(/\.\d{2}\s/, ':').replace(/\sWIB$/, ' WIB');
  } catch {
    return '';
  }
};

// Hitung countdown dari target date (safe version)
const hitungCountdown = (targetDateString) => {
  const target = safeParseDate(targetDateString);
  if (!target) return null;
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, diff };
};

// Format countdown untuk display
const formatCountdownDisplay = (countdownData) => {
  if (!countdownData) return { hours: '00', minutes: '00', seconds: '00', isLive: false, isEmpty: true };
  if (countdownData.diff <= 0) return { hours: '00', minutes: '00', seconds: '00', isLive: true, isEmpty: false };

  const totalSeconds = Math.floor(countdownData.diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isLive: false,
    isEmpty: false
  };
};

// ========== HERO SECTION ==========

function HeroSection({ onRequestCollab }) {
  const [moodIndex, setMoodIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00', isLive: false, isEmpty: true });

  const mood = MOODS[moodIndex];
  const timerRef = useRef(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch next schedule dari API
  useEffect(() => {
    const fetchNextSchedule = async () => {
      try {
        setLoading(true);
        // getNextSchedule returns: { success, data: scheduleObject || null }
        const result = await getNextSchedule();
        console.log("[HeroSection] Next schedule API response:", result);

        if (result?.success && result?.data?.id) {
          // Extract schedule data from response
          setNextSchedule(result.data);
        } else {
          setNextSchedule(null);
        }
      } catch (err) {
        console.error('Error fetching next schedule:', err);
        setNextSchedule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextSchedule();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!nextSchedule?.scheduled_at_wib && !nextSchedule?.scheduled_at) {
      setCountdown({ hours: '00', minutes: '00', seconds: '00', isLive: false, isEmpty: true });
      return;
    }

    const updateCountdown = () => {
      const targetDate = nextSchedule.scheduled_at_wib || nextSchedule.scheduled_at;
      const countdownData = hitungCountdown(targetDate);
      setCountdown(formatCountdownDisplay(countdownData));
    };

    // Initial update
    updateCountdown();

    // Update setiap detik
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [nextSchedule]);

  // Format tanggal untuk display
  const scheduleDateDisplay = nextSchedule
    ? formatTanggalWIB(nextSchedule.scheduled_at_wib || nextSchedule.scheduled_at)
    : null;

  // Scroll mulus ke section berikutnya (memakai #features jika ada, jika tidak section tepat di bawah hero)
  const handleScrollDown = (e) => {
    const heroRoot = e.currentTarget.closest('section')?.parentElement;
    const target = document.getElementById('features') || heroRoot?.nextElementSibling;
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#18132B] overflow-hidden">
      {/* Keyframes khusus hero (otomatis mati jika pengguna memilih reduced motion) */}
      <style>{`
        @keyframes xv-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes xv-aura { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes xv-spin { to { transform: rotate(360deg); } }
        @keyframes xv-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes xv-twinkle { 0%,100% { opacity: .15; scale: .8; } 50% { opacity: .9; scale: 1.15; } }
        @keyframes xv-pop { from { opacity: 0; transform: translateY(6px) scale(.96); } to { opacity: 1; transform: none; } }
        @keyframes xv-burst { from { opacity: 1; transform: translate(0,0) scale(1); } to { opacity: 0; transform: translate(var(--bx), var(--by)) scale(.4); } }
        @keyframes xv-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(3%,-4%) scale(1.08); } }
        @keyframes xv-drift-rev { from { transform: translate(0,0) scale(1.05); } to { transform: translate(-4%,3%) scale(1); } }
        @keyframes xv-moon { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes xv-wheel { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
        @keyframes xv-chev { 0%,100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(3px); } }
        .xv-float { animation: xv-float 6s ease-in-out infinite; }
        .xv-aura { animation: xv-aura 5s ease-in-out infinite; }
        .xv-spin { animation: xv-spin 60s linear infinite; }
        .xv-spin-rev { animation: xv-spin-rev 45s linear infinite; }
        .xv-twinkle { animation: xv-twinkle 3.5s ease-in-out infinite; }
        .xv-pop { animation: xv-pop .35s ease-out both; }
        .xv-burst { animation: xv-burst .8s ease-out forwards; }
        .xv-drift { animation: xv-drift 18s ease-in-out infinite alternate; }
        .xv-drift-rev { animation: xv-drift-rev 22s ease-in-out infinite alternate; }
        .xv-moon { animation: xv-moon 9s ease-in-out infinite; }
        .xv-wheel { animation: xv-wheel 1.8s ease-in-out infinite; }
        .xv-chev { display: flex; animation: xv-chev 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .xv-float, .xv-aura, .xv-spin, .xv-spin-rev, .xv-twinkle, .xv-pop, .xv-burst,
          .xv-drift, .xv-drift-rev, .xv-moon, .xv-wheel, .xv-chev { animation: none !important; }
        }
      `}</style>

      {/* TOP NAVIGATION BAR */}
      <TopNav />

      {/* HERO MAIN SECTION */}
      <section id="hero" className="relative min-h-screen pt-[70px] lg:pt-[90px]">
        {/* Background interaktif: nebula, bulan, sorot kursor, bintang, rasi, bintang jatuh, riak klik */}
        <InteractiveBackground mood={mood} />

        {/* Fade ke warna section berikutnya (tanpa class Tailwind agar tidak bentrok dengan CSS global) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[100px] sm:h-[120px] pointer-events-none z-[1]"
          style={{ background: 'linear-gradient(to top, #12102A, transparent)' }}
        />

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-28 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 pt-8 sm:pt-12 lg:pt-0 lg:items-center min-h-[calc(100vh-70px)] lg:min-h-[calc(100vh-70px-112px)]">
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start justify-center text-center lg:text-left order-2 lg:order-1 pt-12 lg:pt-8 pb-12 lg:pb-0">
              {/* Pill Badge */}
              <div className="mb-4 sm:mb-5 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[rgba(192,132,252,0.12)] border border-[#c084fc] shadow-[0px_0px_15px_0px_rgba(192,132,252,0.15)]">
                  <span className="text-[#c084fc] text-xs">✦</span>
                  <span className="font-semibold text-[#c084fc] text-[10px] sm:text-xs tracking-wider uppercase font-sans">
                    Virtual Creator
                  </span>
                </div>
              </div>

              {/* Heading */}
              <div className="drop-shadow-[0px_4px_12px_rgba(126,224,210,0.22)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h1 className="font-extrabold tracking-[-1px] sm:tracking-[-2.1px] text-gradient-xion font-display" style={{ fontSize: 'clamp(48px, 10vw, 84px)', lineHeight: 1 }}>
                  XION
                </h1>
              </div>

              <div className="mt-0 sm:mt-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-light text-[#f1f0f5] tracking-[0.3em] uppercase font-display" style={{ fontSize: 'clamp(20px, 5vw, 38px)', lineHeight: 1.25 }}>
                  REGALIA
                </h2>
              </div>

              <div className="max-w-[320px] sm:max-w-[400px] lg:max-w-[448px] mt-4 sm:mt-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="font-normal text-[#a89ec0] text-sm sm:text-base leading-6 lg:leading-[26px] font-body">
                  Your space to follow every stream, vote for what comes next, and discover every journey.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-6 sm:mt-7 w-full sm:w-auto px-4 sm:px-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Link to="/voting" className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] sm:h-[46px] px-5 sm:px-6 rounded-[10px] bg-[#7ee0d2] shadow-[0px_10px_15px_-3px_rgba(126,224,210,0.2),0px_4px_6px_-4px_rgba(126,224,210,0.2)] hover:shadow-[0px_10px_20px_-3px_rgba(126,224,210,0.3),0px_4px_8px_-4px_rgba(126,224,210,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <span className="font-bold text-[#18132B] text-sm font-body">Lihat Voting</span>
                  <ArrowRightIcon />
                </Link>

                <Link to="/content" className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] sm:h-[46px] px-4 sm:px-[25px] rounded-[10px] border border-[#c084fc] hover:bg-[rgba(192,132,252,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <span className="text-[#c084fc]"><DocumentIcon /></span>
                  <span className="font-semibold text-[#c084fc] text-sm font-body">Content Guide</span>
                </Link>

                {/* Request Collab Button */}
                {onRequestCollab && (
                  <button
                    onClick={onRequestCollab}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-[44px] sm:h-[46px] px-5 sm:px-6 rounded-[10px]
                      bg-accent-purple/10 border border-accent-purple/30
                      text-accent-lilac hover:bg-accent-purple/20 hover:border-accent-purple/50
                      transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-sm font-body">Request Collab</span>
                  </button>
                )}
              </div>

              {/* Countdown Widget */}
              <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[448px] mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-[#231f42] border border-[#3d3560] shadow-[0px_12px_36px_0px_rgba(15,10,34,0.65)] relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="absolute -right-4 sm:-right-8 -top-4 sm:-top-8 w-[80px] sm:w-[112px] h-[80px] sm:h-[112px] rounded-full bg-[rgba(126,224,210,0.1)] blur-[10px] sm:blur-[12px]"></div>

                {/* Header Section */}
                <div className="border-b border-[rgba(61,53,96,0.6)] pb-3 sm:pb-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon />
                      <span className="font-bold text-[#a89ec0] text-[9px] sm:text-[11px] tracking-wider uppercase font-sans">
                        STREAM BERIKUTNYA
                      </span>
                    </div>

                    {/* Status Badge - Dynamic based on data */}
                    {loading ? (
                      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-[rgba(24,19,43,0.8)] border border-[rgba(192,132,252,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a89ec0] animate-pulse"></div>
                        <span className="font-medium text-[#a89ec0] text-[8px] sm:text-[10px] tracking-wider font-sans">
                          MEMUAT...
                        </span>
                      </div>
                    ) : countdown.isEmpty ? (
                      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-[rgba(24,19,43,0.8)] border border-[rgba(192,132,252,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a89ec0]"></div>
                        <span className="font-medium text-[#a89ec0] text-[8px] sm:text-[10px] tracking-wider font-sans">
                          TIDAK ADA JADWAL
                        </span>
                      </div>
                    ) : countdown.isLive ? (
                      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.4)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></div>
                        <span className="font-medium text-[#ef4444] text-[8px] sm:text-[10px] tracking-wider font-sans">
                          LIVE NOW
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-[rgba(24,19,43,0.8)] border border-[rgba(74,222,128,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></div>
                        <span className="font-medium text-[#4ade80] text-[8px] sm:text-[10px] tracking-wider font-sans">
                          {scheduleDateDisplay || 'SYNCED'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail & Countdown Section */}
                <div className="flex items-start gap-3 py-3 sm:py-4">
                  {/* Thumbnail Preview */}
                  {nextSchedule?.thumbnail_url && !loading && !countdown.isEmpty && (
                    <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border border-[rgba(61,53,96,0.5)]">
                      <img
                        src={nextSchedule.thumbnail_url}
                        alt="Stream thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg bg-[rgba(61,53,96,0.3)] animate-pulse border border-[rgba(61,53,96,0.5)]"></div>
                  )}

                  {/* Countdown Display */}
                  <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2">
                    {loading ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex flex-col items-center px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-lg bg-[rgba(24,19,43,0.6)] border border-[rgba(61,53,96,0.5)] w-[70px] sm:w-[90px] lg:w-[110px]">
                            <div className="w-8 sm:w-10 h-6 sm:h-8 bg-[rgba(61,53,96,0.4)] rounded animate-pulse mb-1"></div>
                            <div className="w-6 sm:w-8 h-2 bg-[rgba(61,53,96,0.3)] rounded animate-pulse"></div>
                          </div>
                        ))}
                      </>
                    ) : countdown.isEmpty ? (
                      <div className="text-center py-4 w-full">
                        <p className="text-[#a89ec0] text-sm">Tidak ada jadwal upcoming</p>
                        <p className="text-[#5c5480] text-xs mt-1">Pastikan admin menambahkan jadwal</p>
                      </div>
                    ) : (
                      <>
                        {[
                          { value: countdown.hours, label: 'JAM', pulse: false },
                          { value: countdown.minutes, label: 'MIN', pulse: false },
                          { value: countdown.seconds, label: 'DET', pulse: true },
                        ].map((unit) => (
                          <div key={unit.label} className="flex flex-col items-center px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-lg bg-[rgba(24,19,43,0.6)] border border-[rgba(61,53,96,0.5)] w-[70px] sm:w-[90px] lg:w-[110px]">
                            <span className={`font-bold text-[#7ee0d2] text-2xl sm:text-[28px] lg:text-[32px] tracking-[-0.5px] sm:tracking-[-0.8px] font-display text-center ${unit.pulse ? 'animate-pulse' : ''}`}>
                              {unit.value}
                            </span>
                            <span className="pt-1 sm:pt-1.5 font-bold text-[#a89ec0] text-[8px] sm:text-[10px] tracking-wider uppercase text-center font-sans">
                              {unit.label}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Section - Stream Info */}
                <div className="border-t border-[rgba(61,53,96,0.4)] pt-3 sm:pt-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      {/* Title dari database */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="text-[#c084fc] text-xs">✦</span>
                        <span className="font-normal text-[#a89ec0] text-[10px] sm:text-xs font-body line-clamp-1">
                          {loading ? (
                            <span className="inline-block w-32 h-4 bg-[rgba(61,53,96,0.4)] rounded animate-pulse"></span>
                          ) : nextSchedule?.title ? (
                            nextSchedule.title
                          ) : (
                            'Tidak ada jadwal'
                          )}
                        </span>
                      </div>

                      {/* Platform & Duration */}
                      {!loading && nextSchedule && (
                        <div className="flex items-center gap-2 ml-5 sm:ml-6">
                          {/* Platform Badge */}
                          <div className="flex items-center gap-1">
                            <YouTubeIcon size={12} className="text-red-500" />
                            <span className="text-[#a89ec0] text-[10px]">
                              {nextSchedule.stream_platform || 'YouTube'}
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-1">
                            <ClockIcon />
                            <span className="text-[#a89ec0] text-[10px]">
                              ±{nextSchedule.estimated_duration || '2-3 Jam'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={nextSchedule?.youtube_url || '/content'}
                      className={`font-bold text-[#7ee0d2] text-[9px] sm:text-[11px] tracking-wider uppercase font-sans hover:underline hover:text-white transition-colors ${countdown.isEmpty || !nextSchedule?.youtube_url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      target={nextSchedule?.youtube_url ? '_blank' : '_self'}
                      rel={nextSchedule?.youtube_url ? 'noopener noreferrer' : ''}
                    >
                      RESERVE
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE HERO AREA */}
            <div className="lg:col-span-7 flex items-center justify-center relative order-1 lg:order-2 min-h-[300px] sm:min-h-[400px] lg:min-h-0">
              <CharacterStage moodIndex={moodIndex} onMoodChange={setMoodIndex} />
            </div>
          </div>
        </div>

        {/* Scroll Indicator: ikon mouse, chevron berkedip, hover glow, klik = scroll mulus, memudar saat halaman di-scroll */}
        <div className={`absolute bottom-4 sm:bottom-6 left-0 right-0 z-10 flex justify-center transition-all duration-500 ${scrolled ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100'}`}>
          <button
            type="button"
            onClick={handleScrollDown}
            aria-label="Scroll ke bagian About Xion"
            className="group flex flex-col items-center gap-2 p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ee0d2]"
          >
            <span className="font-bold text-[#a89ec0] text-[8px] sm:text-[10px] tracking-[3px] uppercase font-sans transition-all duration-300 group-hover:text-[#7ee0d2] group-hover:tracking-[5px]">
              SCROLL
            </span>

            <span className="relative flex justify-center w-[22px] h-[36px] rounded-full border border-[#3d3560] transition-all duration-300 group-hover:border-[#7ee0d2] group-hover:shadow-[0_0_14px_rgba(126,224,210,0.35)]">
              <span className="xv-wheel mt-2 w-[3px] h-[7px] rounded-full bg-[#7ee0d2]"></span>
            </span>

            <span className="flex flex-col items-center -space-y-1">
              <span className="xv-chev"><ScrollChevronIcon /></span>
              <span className="xv-chev" style={{ animationDelay: '0.2s' }}><ScrollChevronIcon /></span>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default HeroSection;