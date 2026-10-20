import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

/**
 * StatCard - Enhanced stat card component
 * Design: Soft Dark, High Contrast, Professional
 * Supports: default, highlight (cyan), purple, gold variants
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  loading = false,
  variant = 'default',
  className = ''
}) {
  const isPositive = trend?.value >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const variantStyles = {
    default: {
      card: 'border-border-subtle hover:border-border-active bg-bg-card/95',
      iconBg: 'bg-bg-surface text-text-secondary border border-border-subtle',
      iconColor: 'text-text-secondary',
      valueColor: 'text-text-primary',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-border-subtle/50',
    },
    highlight: {
      card: 'border-accent-cyan/25 hover:border-accent-cyan/50 bg-bg-card/95 shadow-sm',
      iconBg: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25',
      iconColor: 'text-accent-cyan',
      valueColor: 'text-accent-cyan',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-accent-cyan',
    },
    purple: {
      card: 'border-accent-purple/25 hover:border-accent-purple/50 bg-bg-card/95 shadow-sm',
      iconBg: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/25',
      iconColor: 'text-accent-purple',
      valueColor: 'text-accent-purple',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-accent-purple',
    },
    gold: {
      card: 'border-accent-gold/25 hover:border-accent-gold/50 bg-bg-card/95 shadow-sm',
      iconBg: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/25',
      iconColor: 'text-accent-gold',
      valueColor: 'text-accent-gold',
      trendPos: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      trendNeg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      topLine: 'bg-accent-gold',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        relative rounded-xl p-5 overflow-hidden
        border transition-all duration-200
        hover:bg-bg-card-hover hover:shadow-lg hover:-translate-y-0.5
        ${styles.card}
        ${className}
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${styles.topLine}`} />

      <div className="flex items-start justify-between mb-3">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${styles.iconBg}
        `}>
          {loading ? (
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          ) : Icon ? (
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          ) : null}
        </div>

        {/* Trend Badge */}
        {trend && !loading && (
          <div className={`
            flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium
            ${isPositive ? styles.trendPos : styles.trendNeg}
          `}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-20 bg-bg-surface rounded animate-pulse" />
          <div className="h-4 w-28 bg-bg-surface rounded animate-pulse" />
          <div className="h-3 w-20 bg-bg-surface rounded animate-pulse opacity-60" />
        </div>
      ) : (
        <>
          <p className={`text-2xl font-bold font-mono tracking-tight ${styles.valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm font-medium text-text-secondary mt-1">{label}</p>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}

export default StatCard;
