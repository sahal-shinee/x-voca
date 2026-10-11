import { TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatCard - Reusable stat card component
 * Modern, interactive stat card with gradient accents
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Main stat value
 * @param {string} props.subtitle - Subtitle text
 * @param {Object} props.trend - { value: number, label: string } - Trend info
 * @param {boolean} props.loading - Loading state
 * @param {string} props.variant - 'default' | 'highlight' - Color variant
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  loading = false,
  variant = 'default',
  className = ''
}) {
  const isPositiveTrend = trend?.value >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const ArrowIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;

  const variantStyles = {
    default: {
      card: 'border-border-subtle hover:border-border-active',
      iconBg: 'bg-bg-input',
      iconColor: 'text-text-secondary',
      valueColor: 'text-text-primary',
    },
    highlight: {
      card: 'border-accent-cyan/30 hover:border-accent-cyan/50 bg-gradient-to-br from-accent-cyan/5 to-transparent',
      iconBg: 'bg-accent-cyan/15',
      iconColor: 'text-accent-cyan',
      valueColor: 'text-accent-cyan',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        relative overflow-hidden
        bg-bg-card rounded-2xl p-5
        border transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-black/20
        ${styles.card}
        ${className}
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent-cyan/5 to-transparent rounded-bl-full opacity-50" />

      <div className="relative flex flex-col h-full">
        {/* Header: Icon + Trend Badge */}
        <div className="flex items-start justify-between mb-3">
          {/* Icon Container */}
          <div className={`
            w-11 h-11 rounded-xl
            flex items-center justify-center
            transition-transform duration-300
            group-hover:scale-105
            ${styles.iconBg}
          `}>
            {loading ? (
              <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
            ) : Icon && (
              <Icon className={`w-5 h-5 ${styles.iconColor}`} />
            )}
          </div>

          {/* Trend Badge */}
          {trend && !loading && (
            <div className={`
              flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium
              ${isPositiveTrend
                ? 'bg-accent-cyan/10 text-accent-cyan'
                : 'bg-status-live/10 text-status-live'
              }
            `}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value & Label */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-24 bg-bg-input rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-bg-input rounded animate-pulse" />
            </div>
          ) : (
            <>
              <p className={`
                font-bold font-mono
                text-3xl tracking-tight
                ${styles.valueColor}
              `}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-sm text-text-secondary mt-1 font-medium">{label}</p>
              {subtitle && (
                <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
              )}
              {trend?.label && !subtitle && (
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                  vs {trend.label}
                  <ArrowIcon className="w-3 h-3" />
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
