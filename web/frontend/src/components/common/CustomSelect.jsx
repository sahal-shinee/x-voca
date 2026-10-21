import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - Modern, accessible dropdown replacing native <select>
 *
 * Fully theme-adaptive (dark & light mode)
 *
 * @param {Object} props
 * @param {string|number} props.value - Currently selected value
 * @param {Function} props.onChange - Value change handler (receives raw value or synthetic event-like object)
 * @param {Array<{value: any, label: string, icon?: React.ReactNode, description?: string, badge?: string}>} props.options - Selectable options
 * @param {string} [props.placeholder='Pilih...'] - Placeholder when no value selected
 * @param {string} [props.size='md'] - 'sm' | 'md'
 * @param {boolean} [props.disabled=false] - Whether dropdown is disabled
 * @param {string} [props.className=''] - Additional class names for trigger
 * @param {string} [props.menuClassName=''] - Additional class names for menu dropdown
 * @param {string} [props.name=''] - Name identifier
 * @param {string} [props.id] - Optional ID
 */
export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  size = 'md',
  disabled = false,
  className = '',
  menuClassName = '',
  name = '',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);

  // Normalize options: support either strings or { value, label } objects
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.key || '',
        label: opt.label !== undefined ? opt.label : String(opt.value || ''),
        icon: opt.icon,
        description: opt.description,
        badge: opt.badge,
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle select action
  const handleSelect = useCallback(
    (val) => {
      if (onChange) {
        // Also support synthetic-event shape if parent expects e.target.value
        const syntheticEvent = {
          target: { name, value: val },
          currentTarget: { name, value: val },
        };
        // If onChange has arity expecting raw value vs event, call with synthetic event that also acts as value
        try {
          onChange(syntheticEvent);
        } catch {
          onChange(val);
        }
      }
      setIsOpen(false);
    },
    [onChange, name]
  );

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      } else {
        setIsOpen((prev) => !prev);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(normalizedOptions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left w-full ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      id={id}
    >
      {/* Hidden input for standard forms */}
      {name && <input type="hidden" name={name} value={value ?? ''} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between gap-2 text-left
          bg-bg-input border border-border-input
          hover:border-accent-cyan/50 focus:border-accent-cyan
          focus:outline-none focus:ring-2 focus:ring-accent-cyan/20
          rounded-xl text-text-primary transition-all duration-150 shadow-sm
          ${isSmall ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2.5 text-sm'}
          ${isOpen ? 'border-accent-cyan/60 ring-2 ring-accent-cyan/20 shadow-md' : ''}
          ${className}
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-accent-cyan">
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate ${selectedOption ? 'font-medium' : 'text-text-muted'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
              {selectedOption.badge}
            </span>
          )}
        </span>

        <ChevronDown
          className={`
            text-text-muted flex-shrink-0 transition-transform duration-200
            ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}
            ${isOpen ? 'rotate-180 text-accent-cyan' : 'hover:text-text-secondary'}
          `}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          className={`
            absolute z-50 left-0 right-0 mt-1.5
            bg-bg-card border border-border-subtle
            rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]
            overflow-hidden max-h-60 overflow-y-auto
            p-1 animate-fade-in backdrop-blur-md
            ${menuClassName}
          `}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted text-center">
              Tidak ada pilihan
            </div>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`
                    w-full flex items-center justify-between gap-2.5
                    px-3 py-2 rounded-lg text-left transition-colors duration-100
                    ${isSmall ? 'text-xs py-1.5' : 'text-sm'}
                    ${
                      isSelected
                        ? 'bg-accent-cyan/15 text-accent-cyan font-semibold'
                        : isHighlighted
                        ? 'bg-bg-surface text-text-primary'
                        : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                    }
                  `}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <span className="flex-shrink-0 text-text-muted">
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-surface border border-border-subtle text-text-muted">
                        {opt.badge}
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <Check
                      className={`text-accent-cyan flex-shrink-0 ${
                        isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
