import { TrendingUp, TrendingDown, Loader2, ArrowUpRight } from 'lucide-react';

/**
 * StatCard - Modernized, interactive stat metric card
 * Features:
 * - Glassmorphism surface with ambient variant glow
 * - Clickable navigation support with hover lift & subtle arrow indicator
 * - Smart trend logic (neutral/custom period badge or percentage)
 * - Zero AI slop / clean professional typography
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  loading = false,
  variant = 'default',
  onClick,
  className = ''
}) {
  const isPositive = trend?.value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const variantStyles = {
    default: {
      card: 'border-border-subtle hover:border-emerald-500/40 bg-bg-card/90',
      glow: 'from-emerald-500/10 via-transparent to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
      iconColor: 'text-emerald-400',
      valueColor: 'text-text-primary',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-gradient-to-r from-emerald-500/80 to-transparent',
      hoverArrow: 'text-emerald-400',
    },
    highlight: {
      card: 'border-accent-cyan/25 hover:border-accent-cyan/60 bg-bg-card/90',
      glow: 'from-accent-cyan/15 via-transparent to-transparent',
      iconBg: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30',
      iconColor: 'text-accent-cyan',
      valueColor: 'text-accent-cyan',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-gradient-to-r from-accent-cyan via-accent-cyan/80 to-transparent',
      hoverArrow: 'text-accent-cyan',
    },
    purple: {
      card: 'border-accent-purple/25 hover:border-accent-purple/60 bg-bg-card/90',
      glow: 'from-accent-purple/15 via-transparent to-transparent',
      iconBg: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30',
      iconColor: 'text-accent-purple',
      valueColor: 'text-accent-purple',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-gradient-to-r from-accent-purple via-accent-purple/80 to-transparent',
      hoverArrow: 'text-accent-purple',
    },
    gold: {
      card: 'border-accent-gold/25 hover:border-accent-gold/60 bg-bg-card/90',
      glow: 'from-accent-gold/15 via-transparent to-transparent',
      iconBg: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
      iconColor: 'text-accent-gold',
      valueColor: 'text-accent-gold',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-gradient-to-r from-accent-gold via-accent-gold/80 to-transparent',
      hoverArrow: 'text-accent-gold',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={`
        relative rounded-2xl p-5 overflow-hidden
        border backdrop-blur-sm transition-all duration-300
        ${styles.card}
        ${isClickable ? 'cursor-pointer group hover:-translate-y-1 hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent-cyan/40' : ''}
        ${className}
      `}
    >
      {/* Ambient Radial Backlight Glow on Hover */}
      <div
        className={`
          absolute -right-12 -top-12 w-36 h-36 rounded-full bg-gradient-to-br
          ${styles.glow} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        `}
      />

      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${styles.topLine}`} />

      {/* Header Row: Icon + Trend/Action Indicator */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-transform duration-300 group-hover:scale-105 shadow-inner
          ${styles.iconBg}
        `}>
          {loading ? (
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          ) : Icon ? (
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          ) : null}
        </div>

        {/* Right slot: Trend badge or Quick Arrow for clickable cards */}
        <div className="flex items-center gap-2">
          {trend && !loading && (
            <div className={`
              flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium shadow-sm
              ${trend.neutral
                ? 'bg-bg-surface/80 text-text-secondary border border-border-subtle'
                : isPositive ? styles.trendPos : styles.trendNeg}
            `}>
              {!trend.neutral && <TrendIcon className="w-3 h-3" />}
              {trend.label || `${Math.abs(trend.value)}%`}
            </div>
          )}

          {isClickable && !loading && (
            <div className={`
              w-7 h-7 rounded-lg bg-bg-surface/60 border border-border-subtle flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5
              ${styles.hoverArrow}
            `}>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Content: Value, Label, and Subtitle */}
      <div className="relative z-10">
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-bg-surface/80 rounded animate-pulse" />
            <div className="h-4 w-32 bg-bg-surface/80 rounded animate-pulse" />
            <div className="h-3 w-20 bg-bg-surface/60 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${styles.valueColor}`}>
              {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
            <p className="text-sm font-semibold text-text-primary mt-1.5 flex items-center gap-1.5">
              <span>{label}</span>
            </p>
            {subtitle && (
              <p className="text-xs text-text-muted mt-1 truncate">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StatCard;
