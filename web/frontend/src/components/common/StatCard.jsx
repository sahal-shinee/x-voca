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
      card: 'border-border-subtle hover:border-border-active',
      iconBg: 'bg-bg-surface',
      iconColor: 'text-text-secondary',
      valueColor: 'text-text-primary',
      trendPos: 'bg-accent-cyan/10 text-accent-cyan',
      trendNeg: 'bg-status-live/10 text-status-live',
    },
    highlight: {
      card: 'border-accent-cyan/30 hover:border-accent-cyan/50 bg-gradient-to-br from-accent-cyan/5 to-transparent',
      iconBg: 'bg-accent-cyan/15',
      iconColor: 'text-accent-cyan',
      valueColor: 'text-accent-cyan',
      trendPos: 'bg-accent-cyan/10 text-accent-cyan',
      trendNeg: 'bg-status-live/10 text-status-live',
    },
    purple: {
      card: 'border-accent-purple/30 hover:border-accent-purple/50 bg-gradient-to-br from-accent-purple/5 to-transparent',
      iconBg: 'bg-accent-purple/15',
      iconColor: 'text-accent-purple',
      valueColor: 'text-accent-purple',
      trendPos: 'bg-accent-purple/10 text-accent-purple',
      trendNeg: 'bg-status-live/10 text-status-live',
    },
    gold: {
      card: 'border-accent-gold/30 hover:border-accent-gold/50 bg-gradient-to-br from-accent-gold/5 to-transparent',
      iconBg: 'bg-accent-gold/15',
      iconColor: 'text-accent-gold',
      valueColor: 'text-accent-gold',
      trendPos: 'bg-accent-gold/10 text-accent-gold',
      trendNeg: 'bg-status-live/10 text-status-live',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        bg-bg-card rounded-xl p-5
        border transition-all duration-200
        hover:bg-bg-card-hover hover:shadow-md hover:-translate-y-px
        ${styles.card}
        ${className}
      `}
    >
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
            flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono
            ${isPositive ? styles.trendPos : styles.trendNeg}
          `}>
            <TrendIcon className="w-3.5 h-3.5" />
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
          <p className={`text-2xl font-bold font-mono ${styles.valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-text-secondary mt-1">{label}</p>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
}

export default StatCard;
