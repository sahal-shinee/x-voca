import { ArrowRight, Loader2, ChevronRight } from 'lucide-react';

/**
 * ActionCard - Reusable action card component
 * Modern, interactive action card with gradient icon container
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.accentColor - Accent color: 'cyan' | 'purple' | 'gold'
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 */
function ActionCard({
  icon: Icon,
  title,
  description,
  accentColor = 'cyan',
  onClick,
  loading = false,
  disabled = false,
  className = ''
}) {
  const colorMap = {
    cyan: {
      bg: 'bg-accent-cyan/10',
      border: 'hover:border-accent-cyan/30',
      text: 'text-accent-cyan',
      gradient: 'from-accent-cyan/20 to-accent-cyan/5',
      gradientHover: 'from-accent-cyan/30 to-accent-cyan/10',
      shadow: 'hover:shadow-accent-cyan/10',
    },
    purple: {
      bg: 'bg-accent-purple/10',
      border: 'hover:border-accent-purple/30',
      text: 'text-accent-purple',
      gradient: 'from-accent-purple/20 to-accent-purple/5',
      gradientHover: 'from-accent-purple/30 to-accent-purple/10',
      shadow: 'hover:shadow-accent-purple/10',
    },
    gold: {
      bg: 'bg-accent-gold/10',
      border: 'hover:border-accent-gold/30',
      text: 'text-accent-gold',
      gradient: 'from-accent-gold/20 to-accent-gold/5',
      gradientHover: 'from-accent-gold/30 to-accent-gold/10',
      shadow: 'hover:shadow-accent-gold/10',
    },
  };

  const colors = colorMap[accentColor] || colorMap.cyan;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-bg-input border border-border-subtle rounded-2xl p-5
        text-left transition-all duration-300 ease-out
        hover:bg-bg-card-hover
        ${colors.border}
        ${colors.shadow}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        group relative overflow-hidden
        ${className}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        bg-gradient-to-br ${colors.gradientHover}
        pointer-events-none
      `} />

      <div className="relative flex items-center gap-4">
        {/* Icon Container with Gradient Background */}
        <div className={`
          w-14 h-14 rounded-xl
          bg-gradient-to-br ${colors.gradient}
          flex items-center justify-center
          border border-border-subtle
          transition-all duration-300
          group-hover:scale-110 group-hover:shadow-lg
        `}>
          {loading ? (
            <Loader2 className={`w-6 h-6 ${colors.text} animate-spin`} />
          ) : Icon && (
            <Icon className={`w-6 h-6 ${colors.text}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors">
            {title}
          </p>
          <p className="text-xs text-text-muted mt-0.5 group-hover:text-text-secondary transition-colors">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <div className={`
          w-8 h-8 rounded-full
          bg-gradient-to-br ${colors.gradient}
          flex items-center justify-center
          transition-all duration-300
          group-hover:translate-x-1 group-hover:scale-110
        `}>
          <ChevronRight className={`w-4 h-4 ${colors.text}`} />
        </div>
      </div>

      {/* Bottom border accent */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-0.5
        bg-gradient-to-r from-transparent via-current to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${colors.text}
      `} />
    </button>
  );
}

export default ActionCard;
