import { useState, useRef, useEffect } from 'react';

// ========== ICONS ==========

const CpuIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);

const GpuIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="8" cy="12" r="2.5" />
    <circle cx="16" cy="12" r="2.5" />
    <path d="M2 10h2M2 14h2M20 10h2M20 14h2" />
  </svg>
);

const RamIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="6" y1="19" x2="6" y2="21" />
    <line x1="10" y1="19" x2="10" y2="21" />
    <line x1="14" y1="19" x2="14" y2="21" />
    <line x1="18" y1="19" x2="18" y2="21" />
    <line x1="6" y1="9" x2="6" y2="13" />
    <line x1="10" y1="9" x2="10" y2="13" />
    <line x1="14" y1="9" x2="14" y2="13" />
    <line x1="18" y1="9" x2="18" y2="13" />
  </svg>
);

const SsdIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="7" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="17" cy="12" r="1.5" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </svg>
);

const MicIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RadioIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

// ========== SPEC DATA ==========

const PC_SPECS = [
  {
    category: 'Prosesor (CPU)',
    model: 'Intel Core i7-13620H',
    detail: '10 Core (6P + 4E) · 16 Threads · Up to 4.90 GHz',
    benchmark: '4.9 GHz Turbo',
    Icon: CpuIcon,
  },
  {
    category: 'Kartu Grafis (GPU)',
    model: 'NVIDIA GeForce RTX 4060',
    detail: '8GB GDDR6 VRAM · Arsitektur Ada Lovelace',
    benchmark: 'Dual NVENC AV1',
    Icon: GpuIcon,
  },
  {
    category: 'Memori Utama (RAM)',
    model: '64GB DDR5 Dual Channel',
    detail: 'Bandwidth tinggi untuk multi-tasking siaran berat',
    benchmark: 'Dual-Channel High Speed',
    Icon: RamIcon,
  },
  {
    category: 'Penyimpanan (Storage)',
    model: '1TB NVMe PCIe 4.0 SSD',
    detail: 'Load time instan untuk game dan perekaman siaran',
    benchmark: 'PCIe 4.0 Ultra-Fast',
    Icon: SsdIcon,
  },
];

const AUDIO_SPECS = [
  {
    title: 'Kapsul Mikrofon Dinamis',
    value: 'Shure MV7+ Broadcast',
    desc: 'Menolak kebisingan latar belakang dan fokus pada vokal utama.',
  },
  {
    title: 'Koneksi Dual Output',
    value: 'USB-C & XLR Simultan',
    desc: 'Perekaman digital dengan DSP atau routing mixer analog independen.',
  },
  {
    title: 'Pemrosesan Akustik Digital',
    value: 'Digital Popper Stopper',
    desc: 'Menghilangkan letupan udara vokal secara real-time tanpa filter fisik.',
  },
];

const AUDIO_PRESETS = [
  {
    id: 'warm',
    name: 'Warm Broadcast',
    desc: 'Karakter vokal tebal, hangat, dan natural untuk obrolan santai.',
    freq: '120Hz Low-End Boost · Flat Mid',
    speeds: [0.8, 1.2, 0.9, 1.4, 0.7, 1.1, 0.9, 1.3, 0.8, 1.0, 1.2, 0.7],
    heights: [45, 60, 85, 95, 75, 60, 50, 40, 35, 30, 25, 20],
  },
  {
    id: 'acoustic',
    name: 'Clear Acoustic',
    desc: 'Artikulasi jernih dan transparan dengan ruang resonansi tinggi.',
    freq: 'High-Pass 80Hz · Air 10kHz',
    speeds: [1.1, 0.7, 1.3, 0.9, 1.2, 0.8, 1.4, 0.9, 1.1, 0.7, 1.0, 1.2],
    heights: [20, 35, 55, 70, 85, 100, 90, 80, 65, 55, 45, 35],
  },
  {
    id: 'solace',
    name: 'Midnight Solace',
    desc: 'Kedalaman suara intim dengan peredam desis latar agresif.',
    freq: 'Cardioid Tight · -18dB Gate',
    speeds: [0.6, 0.9, 0.8, 1.0, 0.7, 0.9, 0.8, 1.1, 0.7, 0.8, 0.9, 0.6],
    heights: [30, 45, 60, 70, 65, 50, 45, 35, 30, 25, 20, 15],
  },
];

const SOFTWARE_STACK = [
  { name: 'OBS Studio 30+', role: 'Multi-track Video Compositing' },
  { name: 'NVIDIA Broadcast', role: 'AI Neural Voice Enhancement' },
  { name: 'Shure MOTIV Mix', role: 'Hardware Gain & DSP Staging' },
  { name: 'Discord Ops', role: 'Private Collaboration Link' },
];

export default function EquipmentSection() {
  const [activePreset, setActivePreset] = useState('warm');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  // Mouse spotlight coordinates for interactive cards
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  const handleCardMouseMove = (e, ref) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
  };

  const selectedPreset = AUDIO_PRESETS.find((p) => p.id === activePreset) || AUDIO_PRESETS[0];

  const handleCopySpecs = async () => {
    const text = [
      '=== SPESIFIKASI WORKSTATION & AUDIO XION REGALIA ===',
      '',
      '[KOMPUTASI & GRAFIS]',
      '- CPU: Intel Core i7-13620H (10 Core: 6P+4E, 16T, Up to 4.90 GHz)',
      '- GPU: NVIDIA GeForce RTX 4060 (8GB GDDR6, Dedicated NVENC AV1/H.264)',
      '- RAM: 64GB DDR5 Dual Channel High-Speed',
      '- Storage: 1TB NVMe PCIe 4.0 SSD',
      '',
      '[AUDIO & SIARAN]',
      '- Mikrofon: Shure MV7+ Broadcast Dynamic Microphone',
      '- Koneksi: Dual Output USB-C & XLR Simultan',
      '- DSP Onboard: Digital Popper Stopper & Real-time Denoiser',
      '',
      '[PERANGKAT LUNAK]',
      '- OBS Studio 30+ · NVIDIA Broadcast · Shure MOTIV Mix',
    ].join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <section id="equipment" className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0817] text-white overflow-hidden">
      {/* Keyframe animations */}
      <style>{`
        @keyframes eq-pulse {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }
        @keyframes radar-scan {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes signal-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .eq-bar {
          transform-origin: bottom;
          animation: eq-pulse ease-in-out infinite alternate;
        }
        .radar-line {
          animation: radar-scan 8s linear infinite;
        }
        .signal-indicator {
          animation: signal-glow 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .eq-bar, .radar-line, .signal-indicator { animation: none !important; }
        }
      `}</style>

      {/* Background ambient lighting */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#7ee0d2 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-1/3 -left-36 w-[450px] h-[450px] rounded-full bg-[#7ee0d2]/[0.04] blur-[130px]" />
        <div className="absolute bottom-1/3 -right-36 w-[450px] h-[450px] rounded-full bg-[#7ee0d2]/[0.04] blur-[130px]" />
      </div>

      <div className="max-w-[1240px] mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] signal-indicator" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#94a3b8]">
              STUDIO & WORKSTATION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display text-white">
            Spesifikasi Peralatan & Sistem Siaran
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#94a3b8] max-w-2xl leading-relaxed">
            Infrastruktur komputasi berperforma tinggi dan sistem penangkapan audio studio untuk menjamin kualitas transmisi siaran langsung yang stabil dan imersif.
          </p>
        </div>

        {/* Bento Grid: 2 Primary Cards (PC 7-col + Audio 5-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* CARD 1: WORKSTATION PC (7 Cols) */}
          <div
            ref={leftCardRef}
            onMouseMove={(e) => handleCardMouseMove(e, leftCardRef)}
            className="lg:col-span-7 relative flex flex-col justify-between rounded-3xl bg-[#140f26]/85 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 hover:border-[#7ee0d2]/30 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.45)] group overflow-hidden"
            style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
          >
            {/* Interactive Spotlight Glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(126,224,210,0.08), transparent 70%)',
              }}
            />

            {/* Subtle top hairline highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#7ee0d2]/30 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 flex items-center justify-center text-[#7ee0d2] shadow-[0_0_15px_rgba(126,224,210,0.15)] group-hover:scale-105 transition-transform duration-300">
                    <CpuIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-display">Workstation Pemrosesan</h3>
                    <p className="text-xs text-[#94a3b8] font-mono">Arsitektur Komputasi & Grafis Siaran</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] signal-indicator" />
                  <span className="text-[10px] font-mono uppercase text-[#7ee0d2] font-semibold tracking-wider">
                    OPERASIONAL
                  </span>
                </div>
              </div>

              {/* Hardware Spec Grid: 4 items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {PC_SPECS.map(({ category, model, detail, benchmark, Icon }) => (
                  <div
                    key={category}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#7ee0d2]/30 hover:bg-white/[0.04] transition-all duration-200 group/spec hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-[#94a3b8] uppercase tracking-wider flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#7ee0d2]/80" />
                        {category}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#7ee0d2]/10 text-[#7ee0d2] border border-[#7ee0d2]/20">
                        {benchmark}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white font-display mb-1 group-hover/spec:text-[#7ee0d2] transition-colors">
                      {model}
                    </p>
                    <p className="text-xs text-[#94a3b8] leading-relaxed font-body">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Stream Performance Telemetry */}
            <div className="relative z-10 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Encoding Engine
                </span>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">
                  NVENC AV1 / H.264
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#7ee0d2]/30 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Resolusi Output
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#7ee0d2] font-mono">
                  1080p · 60 FPS Native
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] block mb-1">
                  Multitask Overhead
                </span>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">
                  64GB Dual Ch.
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: AUDIO ENGINE - SHURE MV7+ (5 Cols) */}
          <div
            ref={rightCardRef}
            onMouseMove={(e) => handleCardMouseMove(e, rightCardRef)}
            className="lg:col-span-5 relative flex flex-col justify-between rounded-3xl bg-[#140f26]/85 backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 hover:border-[#7ee0d2]/30 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.45)] group overflow-hidden"
            style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
          >
            {/* Interactive Spotlight Glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(126,224,210,0.08), transparent 70%)',
              }}
            />

            {/* Subtle top hairline highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#7ee0d2]/30 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#7ee0d2]/10 border border-[#7ee0d2]/25 flex items-center justify-center text-[#7ee0d2] shadow-[0_0_15px_rgba(126,224,210,0.15)] group-hover:scale-105 transition-transform duration-300">
                    <MicIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-display">Audio & Akustik</h3>
                    <p className="text-xs text-[#94a3b8] font-mono">Shure MV7+ Podcast Rig</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <RadioIcon className="w-3.5 h-3.5 text-[#7ee0d2]" />
                  <span className="text-[10px] font-mono uppercase text-[#7ee0d2] font-semibold tracking-wider">
                    CARDIOID
                  </span>
                </div>
              </div>

              {/* Audio Specifications List */}
              <div className="space-y-3 mb-6">
                {AUDIO_SPECS.map(({ title, value, desc }) => (
                  <div
                    key={title}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#7ee0d2]/20 hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-body">{title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#7ee0d2]">
                        {value}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Audio DSP Simulator with Animated Frequency Bars */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 font-medium">
                      Simulasi DSP Profil Vokal
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7ee0d2]">{selectedPreset.freq}</span>
                </div>

                {/* Preset Switcher Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {AUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                        activePreset === preset.id
                          ? 'bg-[#7ee0d2] text-[#0d091a] font-semibold shadow-[0_2px_10px_rgba(126,224,210,0.3)] scale-[1.02]'
                          : 'bg-white/[0.04] text-[#94a3b8] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {preset.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-[#cbd5e1] mb-3 leading-relaxed">
                  {selectedPreset.desc}
                </p>

                {/* Live Animated Sound Frequency Equalizer */}
                <div className="flex items-end justify-between gap-1.5 h-12 px-3 py-2 rounded-xl bg-[#090614] border border-white/[0.06] overflow-hidden">
                  {selectedPreset.heights.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="eq-bar w-full rounded-sm bg-gradient-to-t from-[#7ee0d2]/70 to-[#7ee0d2]"
                        style={{
                          height: `${h}%`,
                          animationDuration: `${selectedPreset.speeds[i]}s`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CARD 3: SOFTWARE STACK & SPILL SPEK (Full Width) */}
        <div className="rounded-3xl bg-[#140f26]/85 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <div className="flex-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8] block mb-2.5">
              Ekosistem Perangkat Lunak Pendukung
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {SOFTWARE_STACK.map((sw) => (
                <div
                  key={sw.name}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06] transition-all text-xs text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
                  <span className="font-semibold">{sw.name}</span>
                  <span className="text-[#94a3b8] hidden sm:inline text-[11px]">· {sw.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action: Copy Rig Specs */}
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleCopySpecs}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#7ee0d2]/40 text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-[#7ee0d2]" />
                  <span className="text-[#7ee0d2] font-mono">Spesifikasi Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 text-[#94a3b8]" />
                  <span>Salin Spesifikasi Lengkap</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
