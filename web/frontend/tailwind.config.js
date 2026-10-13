/** @type {import('tailwindcss').Config} */
const withOpacity = (variableName) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
  }
  return `var(${variableName})`;
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // === THEME-ADAPTIVE PALETTE (Backed by CSS Variables in index.css) ===
        'bg-base': withOpacity('--bg-base'),
        'bg-surface': withOpacity('--bg-surface'),
        'bg-card': withOpacity('--bg-card'),
        'bg-card-hover': withOpacity('--bg-card-hover'),
        'bg-input': withOpacity('--bg-input'),
        'bg-nav': withOpacity('--bg-nav'),
        'bg-nav-active': withOpacity('--bg-nav-active'),
        'bg-overlay': withOpacity('--bg-overlay'),

        // Text
        'text-primary': withOpacity('--text-primary'),
        'text-secondary': withOpacity('--text-secondary'),
        'text-muted': withOpacity('--text-muted'),
        'text-accent': withOpacity('--text-accent'),
        'text-on-cta': withOpacity('--text-on-cta'),

        // Accent
        'accent-cyan': withOpacity('--accent-cyan'),
        'accent-cyan-hover': withOpacity('--accent-cyan-hover'),
        'accent-purple': withOpacity('--accent-purple'),
        'accent-purple-hover': withOpacity('--accent-purple-hover'),
        'accent-gold': withOpacity('--accent-gold'),
        'accent-gold-hover': withOpacity('--accent-gold-hover'),

        // Status
        'status-live': withOpacity('--status-live'),
        'status-upcoming': withOpacity('--status-upcoming'),
        'status-done': withOpacity('--status-done'),
        'status-playing': withOpacity('--status-playing'),
        'status-requested': withOpacity('--status-requested'),

        // Border
        'border-subtle': withOpacity('--border-subtle'),
        'border-active': withOpacity('--border-active'),
        'border-input': withOpacity('--border-input'),
        'border-input-focus': withOpacity('--border-input-focus'),
        'border-danger': withOpacity('--border-danger'),

        // === LIGHT MODE PALETTE (Task 1.4 spec) ===
        light: {
          bg: {
            base: '#FFFFFF',
            surface: '#F8FAFB',
            card: '#F1F5F9',
            nav: '#FFFFFF',
          },
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            muted: '#94A3B8',
          },
          accent: {
            cyan: '#0D9488',
            cyanHover: '#0F766E',
            purple: '#7C3AED',
            purpleHover: '#6D28D9',
          },
          border: {
            subtle: '#E2E4EB',
            active: 'rgba(13, 148, 136, 0.3)',
          },
        },

        // === FLAT LIGHT MODE PALETTE (For explicit light- utility classes) ===
        'light-bg-base': '#FFFFFF',
        'light-bg-surface': '#F8FAFB',
        'light-bg-card': '#F1F5F9',
        'light-bg-card-hover': '#E8EBF3',
        'light-bg-input': '#FFFFFF',
        'light-bg-nav': '#FFFFFF',
        'light-bg-nav-active': '#E8EBF3',
        'light-text-primary': '#0F172A',
        'light-text-secondary': '#475569',
        'light-text-muted': '#94A3B8',
        'light-text-accent': '#0D9488',
        'light-text-on-cta': '#FFFFFF',
        'light-accent-cyan': '#0D9488',
        'light-accent-cyan-hover': '#0F766E',
        'light-accent-purple': '#7C3AED',
        'light-accent-purple-hover': '#6D28D9',
        'light-accent-gold': '#B45309',
        'light-accent-gold-hover': '#92400E',
        'light-status-live': '#DC2626',
        'light-status-upcoming': '#7C3AED',
        'light-status-done': '#0D9488',
        'light-status-playing': '#D97706',
        'light-status-requested': '#8B5CF6',
        'light-border-subtle': '#E2E4EB',
        'light-border-active': 'rgba(13, 148, 136, 0.3)',

        // Legacy hero colors (pertahankan untuk public pages)
        'hero-bg': '#18132B',
        'hero-surface': '#231F42',
        'hero-border': '#3D3560',
        'accent-lilac': '#C084FC',
        'accent-cyan-light': '#7EE0D2',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Space Mono', 'monospace'],
        // Legacy for public viewer pages
        'grotesk': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
        'gradient-hero': 'linear-gradient(135deg, #5EEAD4 0%, #C084FC 50%, #A78BFA 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-base) 100%)',
        'gradient-xion': 'linear-gradient(to right, #7EE0D2, #C084FC)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease',
        'fade-in-up': 'fadeInUp 300ms ease',
        'fade-in-down': 'fadeInDown 300ms ease',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-gentle': 'bounce-gentle 1.5s ease-in-out infinite',
        'pulse-live': 'pulse-live 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 200ms ease',
        'slide-in-right': 'slideInRight 200ms ease',
        'scale-in': 'scaleIn 150ms ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(94, 234, 212, 0.15)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.15)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'modal': '0 25px 50px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
