import { ArrowRight, Loader2 } from 'lucide-react';

/**
 * ActionCard - Modernized quick action card component
 * Features:
 * - Ambient accent backlight glow on hover
 * - Smooth translate hover lift and interactive arrow motion
 * - Badge support for counts/urgent alerts
 * - Clean tactile design (no AI slop)
 */
export function ActionCard({
  icon: Icon,
  title,
  description,
  accentColor = 'cyan',
  onClick,
  loading = false,
  disabled = false,
  badge,
  className = ''
}) {
  const colorMap = {
    cyan: {
      bg: 'bg-accent-cyan/10',
      border: 'hover:border-accent-cyan/50 hover:shadow-cyan-500/5',
      glow: 'from-accent-cyan/15 via-transparent to-transparent',
      text: 'text-accent-cyan',
      iconBox: 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan',
      badgeBg: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
      arrow: 'text-accent-cyan',
    },
    purple: {
      bg: 'bg-accent-purple/10',
      border: 'hover:border-accent-purple/50 hover:shadow-purple-500/5',
      glow: 'from-accent-purple/15 via-transparent to-transparent',
      text: 'text-accent-purple',
      iconBox: 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple',
      badgeBg: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
      arrow: 'text-accent-purple',
    },
    gold: {
      bg: 'bg-accent-gold/10',
      border: 'hover:border-accent-gold/50 hover:shadow-amber-500/5',
      glow: 'from-accent-gold/15 via-transparent to-transparent',
      text: 'text-accent-gold',
      iconBox: 'bg-accent-gold/15 border-accent-gold/30 text-accent-gold',
      badgeBg: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
      arrow: 'text-accent-gold',
    },
    red: {
      bg: 'bg-status-live/10',
      border: 'hover:border-status-live/50 hover:shadow-rose-500/5',
      glow: 'from-status-live/15 via-transparent to-transparent',
      text: 'text-status-live',
      iconBox: 'bg-status-live/15 border-status-live/30 text-status-live',
      badgeBg: 'bg-status-live/15 text-status-live border-status-live/30',
      arrow: 'text-status-live',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
      glow: 'from-emerald-500/15 via-transparent to-transparent',
      text: 'text-emerald-400',
      iconBox: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      arrow: 'text-emerald-400',
    },
  };

  const colors = colorMap[accentColor] || colorMap.cyan;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-bg-card/90 border border-border-subtle rounded-2xl p-4
        text-left transition-all duration-200 backdrop-blur-sm
        hover:bg-bg-surface hover:shadow-lg hover:-translate-y-1
        active:scale-[0.99]
        ${colors.border}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        group relative overflow-hidden flex flex-col justify-between
        ${className}
      `}
    >
      {/* Ambient Radial Glow on Hover */}
      <div
        className={`
          absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br
          ${colors.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        `}
      />

      {/* Top row: Icon and Badge / Arrow */}
      <div className="flex items-start justify-between w-full mb-3 relative z-10">
        <div className={`
          w-11 h-11 rounded-xl
          ${colors.iconBox} border
          flex items-center justify-center
          transition-all duration-300 group-hover:scale-105 shadow-inner
        `}>
          {loading ? (
            <Loader2 className={`w-5 h-5 ${colors.text} animate-spin`} />
          ) : Icon ? (
            <Icon className={`w-5 h-5 ${colors.text}`} />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {badge != null && !loading && (
            <span className={`
              px-2 py-0.5 min-w-[20px] h-5
              flex items-center justify-center
              text-[11px] font-mono font-semibold rounded-full border
              ${colors.badgeBg}
            `}>
              {badge}
            </span>
          )}

          <div className={`
            w-7 h-7 rounded-lg bg-bg-surface/80 border border-border-subtle flex items-center justify-center
            transition-all duration-200 group-hover:border-border-active
          `}>
            <ArrowRight
              className={`w-3.5 h-3.5 ${colors.arrow} opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5`}
            />
          </div>
        </div>
      </div>

      {/* Bottom row: Title and Description */}
      <div className="relative z-10">
        <h4 className="text-sm font-bold text-text-primary group-hover:text-white transition-colors tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-text-muted mt-1 group-hover:text-text-secondary transition-colors line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

export default ActionCard;
