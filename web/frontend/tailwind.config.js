/** @type {import('tailwindcss').Config} */
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
        'bg-base': '#0D0B1A',
        'bg-surface': '#12102A',
        'bg-card': '#1A1730',
        'bg-card-hover': '#201D3A',
        'bg-input': '#1E1B35',
        'bg-nav': '#100E24',
        'bg-nav-active': '#1E1B38',
        'accent-cyan': '#2DFFC2',
        'accent-cyan-light': '#7EE0D2',
        'accent-purple': '#9B6DFF',
        'accent-lilac': '#C084FC',
        'accent-gold': '#F5A623',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A09BB8',
        'text-muted': '#5C5878',
        'text-on-cta': '#0D0B1A',
        'border-subtle': '#2A2645',
        'border-active': 'rgba(45, 255, 194, 0.25)',
        'status-live': '#FF4444',
        'status-upcoming': '#9B6DFF',
        'status-done': '#2DFFC2',
        'status-playing': '#F5A623',
        'status-requested': '#C084FC',
        // Hero specific colors
        'hero-bg': '#18132B',
        'hero-surface': '#231F42',
        'hero-border': '#3D3560',
      },
      fontFamily: {
        'sans': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
        'display': ['Sora', 'sans-serif'],
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
        'gradient-cta': 'linear-gradient(135deg, #2DFFC2 0%, #9B6DFF 100%)',
        'gradient-hero': 'linear-gradient(135deg, #2DFFC2 0%, #C084FC 50%, #9B6DFF 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #1A1730 0%, #0D0B1A 100%)',
        'gradient-xion': 'linear-gradient(to right, #7EE0D2, #C084FC)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease',
        'fade-in-up': 'fadeInUp 500ms ease',
        'fade-in-down': 'fadeInDown 400ms ease',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-gentle': 'bounce-gentle 1.5s ease-in-out infinite',
        'pulse-live': 'pulse-live 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in-left': 'slideInLeft 300ms ease',
        'slide-in-right': 'slideInRight 300ms ease',
        'scale-in': 'scaleIn 200ms ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
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
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(126, 224, 210, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(126, 224, 210, 0.5)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0px 10px 15px -3px rgba(126, 224, 210, 0.2), 0px 4px 6px -4px rgba(126, 224, 210, 0.2)',
        'glow-purple': '0px 0px 15px 0px rgba(192, 132, 252, 0.15)',
        'countdown': '0px 12px 36px 0px rgba(15, 10, 34, 0.65)',
        'live': '0px 0px 12px 0px rgba(239, 68, 68, 0.2)',
        'character': '0px 12px 20px 0px rgba(192, 132, 252, 0.25)',
        'card': '0px 4px 20px 0px rgba(0, 0, 0, 0.3)',
        'card-hover': '0px 8px 30px 0px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
