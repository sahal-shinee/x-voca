// ========== EQUIPMENT SECTION ==========

import { useState, useEffect, useRef } from 'react';

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

// PC icon
const PcIcon = () => (
  <svg width="16.5" height="11.25" viewBox="0 0 16.5 11.25" fill="none" aria-hidden="true">
    <path d="M14.85 0H1.65C0.74 0 0 0.74 0 1.65V8.1C0 9.01 0.74 9.75 1.65 9.75H6.6L5.775 11.25H4.125V9.75H1.65C1.31 9.75 1.035 9.475 1.035 9.135V1.65C1.035 1.31 1.31 1.035 1.65 1.035H14.85C15.19 1.035 15.465 1.31 15.465 1.65V9.135C15.465 9.475 15.19 9.75 14.85 9.75H12.375V11.25H10.725L9.9 9.75H14.85C15.76 9.75 16.5 9.01 16.5 8.1V1.65C16.5 0.74 15.76 0 14.85 0Z" fill="#a89ec0"/>
  </svg>
);

// Microphone icon
const MicrophoneIcon = () => (
  <svg width="8.75" height="11.875" viewBox="0 0 8.75 11.875" fill="none" aria-hidden="true">
    <path d="M4.375 0C3.41 0 2.625 0.785 2.625 1.75V7C2.625 7.965 3.41 8.75 4.375 8.75C5.34 8.75 6.125 7.965 6.125 7V1.75C6.125 0.785 5.34 0 4.375 0Z" fill="#a89ec0"/>
    <path d="M1.75 7V7.875C1.75 9.541 3.084 10.875 4.75 10.875H4.375C3.084 10.875 1.75 9.541 1.75 7.875V7Z" fill="#a89ec0"/>
    <path d="M0.875 7.875H7.875V10.5C7.875 11.052 7.427 11.5 6.875 11.5H1.875C1.323 11.5 0.875 11.052 0.875 10.5V7.875Z" fill="#a89ec0"/>
  </svg>
);

// Eye/tracking icon
const EyeIcon = () => (
  <svg width="12.5" height="12.5" viewBox="0 0 12.5 12.5" fill="none" aria-hidden="true">
    <path d="M1.25 6.25C1.25 6.25 2.875 2.5 6.25 2.5C9.625 2.5 11.25 6.25 11.25 6.25C11.25 6.25 9.625 10 6.25 10C2.875 10 1.25 6.25 1.25 6.25Z" stroke="#a89ec0" strokeWidth="1.2"/>
    <circle cx="6.25" cy="6.25" r="1.5" stroke="#a89ec0" strokeWidth="1.2"/>
  </svg>
);

// Telemetry active icon
const TelemetryIcon = () => (
  <svg width="12.5" height="12" viewBox="0 0 12.5 12" fill="none" aria-hidden="true">
    <path d="M6.25 0L7.5 3.5H11.25L8 6L9.5 10L6.25 7.5L3 10L4.5 6L1.25 3.5H5L6.25 0Z" fill="#4ade80"/>
  </svg>
);

// Equipment Section Component
const EquipmentSection = () => {
  const [sectionRef, sectionVisible] = useScrollReveal({ threshold: 0.1 });
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.05 });

  const equipmentCards = [
    {
      id: 1,
      icon: <PcIcon />,
      label: 'PC & PROCESSING',
      system: 'SYS 01',
      accentColor: 'accent-lilac',
      items: [
        {
          label: 'PROCESSOR (CPU)',
          title: 'AMD Ryzen 9 7950X3D',
          subtitle: '16 Cores / 32 Threads @ 5.7GHz',
        },
        {
          label: 'GRAPHICS (GPU)',
          title: 'NVIDIA GeForce RTX 4090',
          subtitle: '24GB GDDR6X VRAM',
        },
      ],
    },
    {
      id: 2,
      icon: <MicrophoneIcon />,
      label: 'AUDIO & BROADCAST',
      system: 'AUDIO 02',
      accentColor: 'accent-cyan-light',
      items: [
        {
          label: 'MICROPHONE & INTERFACE',
          title: 'Shure SM7B + Elgato Wave XLR',
          subtitle: 'Cloudlifter CL-1 Inline Preamp',
        },
        {
          label: 'STUDIO MONITORING',
          title: 'Sennheiser HD 600',
          subtitle: 'Open-back Reference Headphones',
        },
      ],
    },
    {
      id: 3,
      icon: <EyeIcon />,
      label: 'RIG & TRACKING',
      system: 'MODEL 03',
      accentColor: 'accent-gold',
      items: [
        {
          label: 'LIVE2D RIG MODEL',
          title: 'Obsidian Rig #03',
          subtitle: 'ARKit 52 Blendshapes + Physics XYZ',
        },
        {
          label: 'OPTICAL CAPTURE ENGINE',
          title: 'iPhone 15 Pro TrueDepth',
          subtitle: '60 FPS VTube Studio + Hand Tracking',
        },
      ],
    },
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20">
      <div
        ref={sectionRef}
        className={`max-w-[898px] mx-auto transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      >
        {/* Main Card */}
        <div className="bg-[#231f42] border border-[rgba(61,53,96,0.7)] rounded-2xl p-6 lg:p-8">
          {/* Header */}
          <div className="border-b border-[rgba(61,53,96,0.6)] pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#2d2855] border border-[rgba(61,53,96,0.8)] flex items-center justify-center">
                  <PcIcon />
                </div>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white tracking-[-0.45px] font-display">
                      Equipment & Rig Specs
                    </h3>
                    <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#1d1830] border border-[rgba(126,224,210,0.3)]">
                      <span className="font-medium text-accent-cyan-light text-[10px] tracking-wider uppercase font-sans">
                        CALIBRATED
                      </span>
                    </span>
                  </div>
                  <p className="text-[#a89ec0] text-sm">
                    Konfigurasi stasiun penyiaran & telemetri avatar Xion Regalia
                  </p>
                </div>
              </div>

              {/* Telemetry Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1d1830] border border-[rgba(61,53,96,0.6)] self-start sm:self-auto">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div>
                <span className="font-medium text-[#a89ec0] text-[11px] tracking-wider uppercase font-sans">
                  TELEMETRY LINK ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Equipment Cards */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5"
          >
            {equipmentCards.map((card, index) => (
              <div
                key={card.id}
                className={`bg-[#1d1830] border border-[rgba(61,53,96,0.6)] rounded-xl p-4 lg:p-[17px] transition-all duration-500 hover:border-[rgba(126,224,210,0.3)] hover:shadow-lg hover:shadow-black/20 group ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-3 pb-3 border-b border-[rgba(61,53,96,0.4)]">
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {card.icon}
                      <span className={`font-bold text-${card.accentColor} text-xs tracking-wider uppercase font-sans`} style={{ color: card.accentColor === 'accent-lilac' ? '#c084fc' : card.accentColor === 'accent-cyan-light' ? '#7ee0d2' : '#fbbf24' }}>
                        {card.label}
                      </span>
                    </div>
                    <span className="font-medium text-[#5c5480] text-[11px] uppercase font-sans">{card.system}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {itemIndex > 0 && (
                        <div className="border-t border-[rgba(61,53,96,0.4)] my-3"></div>
                      )}
                      <div>
                        <p className="font-medium text-[#5c5480] text-[11px] uppercase mb-1 font-sans">{item.label}</p>
                        <p className="font-semibold text-white text-sm font-display group-hover:text-accent-cyan-light transition-colors">{item.title}</p>
                        <p className="text-[#a89ec0] text-xs">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquipmentSection;
