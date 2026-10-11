import { Loader2 } from 'lucide-react';

/**
 * Button - Reusable button component
 * Soft Dark design
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disabled state
 * @param {React.ReactNode} leftIcon - Icon on the left
 * @param {React.ReactNode} rightIcon - Icon on the right
 */
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variantStyles = {
    primary: `
      bg-accent-cyan text-text-on-cta font-semibold
      hover:bg-accent-cyan-hover
      border border-accent-cyan/50
    `,
    secondary: `
      bg-bg-card text-text-secondary
      hover:bg-bg-card-hover hover:text-text-primary
      border border-border-subtle
    `,
    ghost: `
      bg-transparent text-text-secondary
      hover:bg-bg-card hover:text-text-primary
      border border-transparent
    `,
    outline: `
      bg-transparent text-accent-cyan
      hover:bg-accent-cyan/10
      border border-accent-cyan/40
    `,
    danger: `
      bg-status-live/10 text-status-live
      hover:bg-status-live/20
      border border-status-live/30
    `,
    purple: `
      bg-accent-purple/10 text-accent-purple
      hover:bg-accent-purple/20
      border border-accent-purple/30
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl',
  };

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50
        ${variantStyles[variant] || variantStyles.secondary}
        ${sizeStyles[size] || sizeStyles.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSize[size]} animate-spin`} />
      ) : LeftIcon && (
        <LeftIcon className={iconSize[size]} />
      )}
      {children}
      {!loading && RightIcon && (
        <RightIcon className={iconSize[size]} />
      )}
    </button>
  );
}

Button.defaultProps = {
  variant: 'secondary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
};

export default Button;
