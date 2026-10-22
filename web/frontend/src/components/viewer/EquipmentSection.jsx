import { useState, useRef } from 'react';

// ========== ICONS ==========

const CpuIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
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

// ========== SPEC DATA (100% AUTHENTIC) ==========

const PC_SPECS = [
  {
    category: 'Prosesor (CPU)',
    model: 'Intel Core i7-13620H',
    detail: '10 Core (6 Performance + 4 Efficient) · 16 Threads · Up to 4.90 GHz Turbo',
    tag: 'Komputasi Utama',
  },
  {
    category: 'Kartu Grafis (GPU)',
    model: 'NVIDIA GeForce RTX 4060',
    detail: '8GB GDDR6 VRAM · Arsitektur Ada Lovelace · NVENC AV1 & H.264 Encoder',
    tag: 'Encoding & Rendering',
  },
  {
    category: 'Memori Utama (RAM)',
    model: '64GB DDR5 Dual Channel',
    detail: 'Bandwidth tinggi untuk multitasking siaran langsung dan game berat',
    tag: 'Kapasitas Ekstra',
  },
  {
    category: 'Penyimpanan (Storage)',
    model: '1TB NVMe PCIe 4.0 SSD',
    detail: 'Kecepatan baca tinggi untuk load time game cepat dan perekaman arsip',
    tag: 'Ultra-Fast Access',
  },
];

const AUDIO_SPECS = [
  {
    title: 'Mikrofon Siaran Utama',
    value: 'Shure MV7+',
    desc: 'Dynamic broadcast microphone kelas studio yang dirancang khusus untuk kejernihan vokal dan isolasi suara lingkungan.',
  },
  {
    title: 'Konektivitas Dual Interface',
    value: 'USB-C Digital & XLR Analog',
    desc: 'Mendukung pengolahan digital onboard simultan maupun integrasi mixer analog profesional.',
  },
  {
    title: 'Pemrosesan Sinyal Onboard (DSP)',
    value: 'Digital Popper Stopper & Real-time Denoiser',
    desc: 'Menghilangkan letupan plosif konsonan dan kebisingan latar tanpa latensi.',
  },
];

const AUDIO_PRESETS = [
  {
    id: 'warm',
    name: 'Warm Broadcast',
    desc: 'Karakter vokal hangat dan tebal untuk obrolan santai larut malam.',
    freq: '120Hz Boost · Neutral Mid',
    bars: [40, 65, 85, 70, 50, 45, 30],
  },
  {
    id: 'acoustic',
    name: 'Clear Acoustic',
    desc: 'Artikulasi jernih dan transparan untuk instrumen dan nyanyian akustik.',
    freq: 'High-pass 80Hz · Air 10kHz',
    bars: [25, 45, 70, 85, 95, 80, 60],
  },
  {
    id: 'solace',
    name: 'Midnight Solace',
    desc: 'Isolasi suara intim dengan noise-gate agresif untuk suasana hening.',
    freq: 'Deep Cardioid · -18dB Gate',
    bars: [30, 50, 60, 55, 40, 35, 20],
  },
];

const SOFTWARE_STACK = [
  { name: 'OBS Studio 30+', role: 'Compositing & Multi-track Output' },
  { name: 'NVIDIA Broadcast', role: 'AI Neural Audio Enhancement' },
  { name: 'Shure MOTIV Mix', role: 'DSP Management & Gain Staging' },
  { name: 'Discord Ops', role: 'Private Collaboration Routing' },
];

// ========== COMPONENT ==========

export default function EquipmentSection() {
  const [activePreset, setActivePreset] = useState('warm');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  const selectedPreset = AUDIO_PRESETS.find((p) => p.id === activePreset) || AUDIO_PRESETS[0];

  const handleCopySpecs = async () => {
    const text = [
      '=== SPESIFIKASI WORKSTATION & AUDIO XION REGALIA ===',
      '',
      '[KOMPUTASI & GRAFIS]',
      '- CPU: Intel Core i7-13620H (10C/16T, up to 4.90 GHz)',
      '- GPU: NVIDIA GeForce RTX 4060 (8GB GDDR6 VRAM)',
      '- RAM: 64GB DDR5 Dual Channel',
      '- Storage: 1TB NVMe PCIe 4.0 SSD',
      '',
      '[AUDIO & SIARAN]',
      '- Mikrofon: Shure MV7+ Dynamic Podcast/Broadcast',
      '- Antarmuka: Hybrid USB-C & XLR Dual Interface',
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

  return (
    <section id="equipment" className="relative w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0d091a] text-white overflow-hidden">
      {/* Background ambient pattern */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(126,224,210,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-[#7ee0d2]/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-[#7ee0d2]/5 blur-[120px]" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2]" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#94a3b8]">
              STUDIO & WORKSTATION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-display text-white">
            Spesifikasi Peralatan & Sistem Siaran
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#94a3b8] max-w-2xl leading-relaxed">
            Infrastruktur komputasi performa tinggi dan sistem audio kelas siaran untuk memastikan pengalaman streaming yang stabil, jernih, dan responsif.
          </p>
        </div>

        {/* Bento Grid: 2 Utama (PC 7-col + Audio 5-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* CARD 1: WORKSTATION PC (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#15102a] border border-white/[0.08] p-6 sm:p-7 hover:border-white/[0.15] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7ee0d2]/10 border border-[#7ee0d2]/30 flex items-center justify-center text-[#7ee0d2]">
                    <CpuIcon />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-display">Workstation Pemrosesan</h3>
                    <p className="text-xs text-[#94a3b8] font-mono">Arsitektur Komputasi & Grafis</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7ee0d2] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase text-[#7ee0d2] font-semibold">Siaran Aktif</span>
                </div>
              </div>

              {/* Hardware Spec Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {PC_SPECS.map((spec) => (
                  <div
                    key={spec.category}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#7ee0d2]/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono text-[#94a3b8] uppercase tracking-wider">
                        {spec.category}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#7ee0d2]">
                        {spec.tag}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white font-display mb-1">{spec.model}</p>
                    <p className="text-xs text-[#94a3b8] leading-relaxed font-body">{spec.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs font-mono text-[#94a3b8]">Encoding Engine</p>
                <p className="text-sm font-bold text-white mt-0.5">NVENC AV1 / H.264</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs font-mono text-[#94a3b8]">Resolusi Siaran</p>
                <p className="text-sm font-bold text-[#7ee0d2] mt-0.5">1080p 60 FPS</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs font-mono text-[#94a3b8]">Memori Alokasi</p>
                <p className="text-sm font-bold text-white mt-0.5">64GB Dual Ch.</p>
              </div>
            </div>
          </div>

          {/* CARD 2: AUDIO ENGINE - SHURE MV7+ (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#15102a] border border-white/[0.08] p-6 sm:p-7 hover:border-white/[0.15] transition-all duration-300">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7ee0d2]/10 border border-[#7ee0d2]/30 flex items-center justify-center text-[#7ee0d2]">
                    <MicIcon />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-display">Audio & Akustik</h3>
                    <p className="text-xs text-[#94a3b8] font-mono">Shure MV7+ Broadcast Rig</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <RadioIcon className="w-3.5 h-3.5 text-[#7ee0d2]" />
                  <span className="text-[10px] font-mono uppercase text-[#7ee0d2] font-semibold">Cardioid</span>
                </div>
              </div>

              {/* Audio Highlights */}
              <div className="space-y-3 mb-6">
                {AUDIO_SPECS.map((item) => (
                  <div key={item.title} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] font-mono text-[#7ee0d2]">{item.value}</span>
                    </div>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Mic Profile Switcher */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
                    Profil Suara Interaktif
                  </span>
                  <span className="text-[10px] font-mono text-[#7ee0d2]">{selectedPreset.freq}</span>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {AUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePreset(preset.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                        activePreset === preset.id
                          ? 'bg-[#7ee0d2] text-[#0d091a] font-semibold shadow-sm'
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

                {/* Animated Frequency Bars Simulator */}
                <div className="flex items-end justify-between gap-1.5 h-10 px-2 py-1.5 rounded-lg bg-[#0d091a] border border-white/5">
                  {selectedPreset.bars.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full rounded-sm bg-[#7ee0d2] transition-all duration-500 ease-out"
                        style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SOFTWARE STACK & SPILL SPEK (Full Width) */}
        <div className="rounded-2xl bg-[#15102a] border border-white/[0.08] p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8] block mb-2">
              Ekosistem Perangkat Lunak Pendukung
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {SOFTWARE_STACK.map((sw) => (
                <div
                  key={sw.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-[#7ee0d2]" />
                  <span className="text-[#7ee0d2]">Spesifikasi Berhasil Disalin!</span>
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
