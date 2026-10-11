import { ArrowRight, Loader2 } from 'lucide-react';

/**
 * ActionCard - Enhanced action card component
 * Design: Soft Dark, Professional, User-Friendly
 * Supports: cyan, purple, gold, red accent colors
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
      border: 'hover:border-accent-cyan/40',
      text: 'text-accent-cyan',
      gradient: 'from-accent-cyan/15 to-transparent',
      badgeBg: 'bg-accent-cyan/15 text-accent-cyan',
    },
    purple: {
      bg: 'bg-accent-purple/10',
      border: 'hover:border-accent-purple/40',
      text: 'text-accent-purple',
      gradient: 'from-accent-purple/15 to-transparent',
      badgeBg: 'bg-accent-purple/15 text-accent-purple',
    },
    gold: {
      bg: 'bg-accent-gold/10',
      border: 'hover:border-accent-gold/40',
      text: 'text-accent-gold',
      gradient: 'from-accent-gold/15 to-transparent',
      badgeBg: 'bg-accent-gold/15 text-accent-gold',
    },
    red: {
      bg: 'bg-status-live/10',
      border: 'hover:border-status-live/40',
      text: 'text-status-live',
      gradient: 'from-status-live/15 to-transparent',
      badgeBg: 'bg-status-live/15 text-status-live',
    },
  };

  const colors = colorMap[accentColor] || colorMap.cyan;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-bg-surface border border-border-subtle rounded-xl p-4
        text-left transition-all duration-150
        hover:bg-bg-card hover:shadow-lg hover:-translate-y-px
        ${colors.border}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        group relative
        ${className}
      `}
    >
      {/* Badge */}
      {badge != null && !loading && (
        <span className={`
          absolute top-3 right-3 min-w-[20px] h-5 px-1.5
          flex items-center justify-center
          text-xs font-mono font-semibold rounded-full
          ${colors.badgeBg}
        `}>
          {badge}
        </span>
      )}

      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-lg
          bg-gradient-to-br ${colors.gradient}
          flex items-center justify-center
          border border-border-subtle
          transition-transform duration-150 group-hover:scale-105
        `}>
          {loading ? (
            <Loader2 className={`w-5 h-5 ${colors.text} animate-spin`} />
          ) : Icon ? (
            <Icon className={`w-5 h-5 ${colors.text}`} />
          ) : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
            {title}
          </p>
          <p className="text-xs text-text-muted mt-0.5 group-hover:text-text-secondary transition-colors">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <ArrowRight
          className={`w-4 h-4 ${colors.text} opacity-40 group-hover:opacity-100 transition-all duration-150 group-hover:translate-x-1 flex-shrink-0`}
        />
      </div>
    </button>
  );
}

export default ActionCard;
