import { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input - Reusable accessible input field component
 * Soft Dark design with full WCAG accessibility (labels, ARIA, states)
 */
function Input({
  id,
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightElement,
  type = 'text',
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const reactGeneratedId = useId();
  const inputId = id || props.id || reactGeneratedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`
            w-full
            bg-bg-input
            text-text-primary placeholder:text-text-muted
            border rounded-xl
            transition-all duration-150 ease-out
            outline-none
            ${error
              ? 'border-status-live/50 focus:border-status-live'
              : 'border-border-subtle focus:border-accent-cyan/50'
            }
            focus:ring-2 focus:ring-accent-cyan/10
            ${LeftIcon ? 'pl-10' : ''}
            ${isPassword || rightElement ? 'pr-10' : ''}
            ${sizeStyles[size] || sizeStyles.md}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors focus:outline-none focus:text-accent-cyan"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {!isPassword && rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-status-live flex items-center gap-1 font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}

Input.defaultProps = {
  type: 'text',
  size: 'md',
};

export default Input;
