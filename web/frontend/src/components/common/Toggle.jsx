export function Toggle({
  checked,
  onChange,
  disabled = false,
  variant = 'cyan', // 'cyan' | 'live' | 'purple'
  className = '',
  ...props
}) {
  const getActiveClass = () => {
    switch (variant) {
      case 'live':
        return 'bg-status-live shadow-[0_0_12px_rgba(220,38,38,0.45)] focus:ring-status-live/40';
      case 'purple':
        return 'bg-accent-purple shadow-[0_0_12px_rgba(124,58,237,0.45)] focus:ring-accent-purple/40';
      default:
        return 'bg-accent-cyan shadow-[0_0_12px_rgba(13,148,136,0.4)] focus:ring-accent-cyan/40';
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-[50px] h-[28px] rounded-full p-1
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-card
        ${checked
          ? getActiveClass()
          : 'bg-[#DCD8CF] dark:bg-slate-800 border border-[#C5BFB4] dark:border-slate-700 focus:ring-slate-400/40'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          block w-[18px] h-[18px] rounded-full
          bg-white shadow-md
          transition-transform duration-200 ease-out
          ${checked ? 'translate-x-[22px]' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

export default Toggle;
