/**
 * Badge - Reusable status/category badge component
 * Soft Dark design - minimal, border-based
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variantStyles = {
    default: 'bg-border-subtle/50 text-text-secondary border-border-subtle',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
    live: 'bg-status-live/10 text-status-live border-status-live/20',
    done: 'bg-status-done/10 text-status-done border-status-done/20',
    upcoming: 'bg-status-upcoming/10 text-status-upcoming border-status-upcoming/20',
    playing: 'bg-status-playing/10 text-status-playing border-status-playing/20',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider',
    md: 'px-2.5 py-1 text-[11px] tracking-wide',
    lg: 'px-3 py-1.5 text-xs',
  };

  const dotColors = {
    default: 'bg-text-secondary',
    cyan: 'bg-accent-cyan',
    purple: 'bg-accent-purple',
    gold: 'bg-accent-gold',
    live: 'bg-status-live',
    done: 'bg-status-done',
    upcoming: 'bg-status-upcoming',
    playing: 'bg-status-playing',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-mono font-semibold uppercase
        border rounded-md
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
}

Badge.defaultProps = {
  variant: 'default',
  size: 'md',
  dot: false,
};

export default Badge;
