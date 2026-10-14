export function Toggle({ checked, onChange, disabled = false, className = '', ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-[52px] h-[28px] rounded-full
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base
        ${checked 
          ? 'bg-accent-cyan shadow-[0_0_12px_rgba(94,234,212,0.4)] focus:ring-accent-cyan/50' 
          : 'bg-bg-input border-2 border-border-subtle focus:ring-text-muted/30'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          absolute top-1 left-1
          w-[20px] h-[20px] rounded-full
          bg-white shadow-lg
          transition-transform duration-200 ease-out
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

export default Toggle;

