import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/**
 * Modal Component - General purpose dialog
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.confirmText - Text for confirm button (default: 'Konfirmasi')
 * @param {string} props.cancelText - Text for cancel/close button
 * @param {Function} props.onConfirm - Callback when confirm is clicked
 * @param {string} props.variant - 'default' | 'danger' | 'success' | 'info'
 * @param {boolean} props.showClose - Show X button (default: true)
 * @param {boolean} props.loading - Show loading state on confirm button
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 * @param {React.ReactNode} props.icon - Custom header icon
 * @param {React.ReactNode} props.footer - Custom footer JSX or null to hide
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Konfirmasi',
  cancelText,
  onConfirm,
  variant = 'default',
  showClose = true,
  loading = false,
  size = 'md',
  icon,
  footer,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimatingOut(false);
        document.body.style.overflow = '';
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isVisible && !isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  };
  const modalSize = sizeClasses[size] || sizeClasses.md;

  // Variant styles
  const variantStyles = {
    default: {
      confirm: 'bg-gradient-cta text-text-on-cta hover:opacity-90',
      iconBox: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30',
      defaultIcon: <Info className="w-5 h-5 text-accent-purple" />,
    },
    success: {
      confirm: 'bg-accent-cyan text-bg-base hover:bg-accent-cyan/90',
      iconBox: 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30',
      defaultIcon: <Check className="w-5 h-5 text-accent-cyan" />,
    },
    danger: {
      confirm: 'bg-status-live text-white hover:bg-status-live/90',
      iconBox: 'bg-status-live/15 text-status-live border border-status-live/30',
      defaultIcon: <AlertTriangle className="w-5 h-5 text-status-live" />,
    },
    info: {
      confirm: 'bg-accent-purple text-white hover:bg-accent-purple/90',
      iconBox: 'bg-accent-purple/15 text-accent-purple border border-accent-purple/30',
      defaultIcon: <Info className="w-5 h-5 text-accent-purple" />,
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;
  const closeButtonText = cancelText !== undefined ? cancelText : (onConfirm ? 'Batal' : 'Tutup');

  let theme = 'dark';
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme) theme = themeCtx.theme;
  } catch {
    theme = 'dark';
  }

  return createPortal(
    <div
      data-admin-theme={theme}
      data-theme={theme}
      className={`
        fixed inset-0 z-50
        flex items-center justify-center p-4
        transition-opacity duration-200
        ${isOpen && !isAnimatingOut ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${modalSize}
          bg-bg-card border border-border-subtle
          rounded-3xl shadow-2xl overflow-hidden
          transform transition-all duration-200
          ${isOpen && !isAnimatingOut ? 'scale-100' : 'scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5.5 sm:px-8 sm:py-6 border-b border-border-subtle bg-bg-surface/85 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${styles.iconBox}`}>
              {icon || styles.defaultIcon}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary leading-tight">{title}</h2>
          </div>

          {/* Close Button */}
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-subtle transition-colors shrink-0"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-7 sm:p-8 max-h-[calc(85vh-140px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer !== null && (
          <div className="flex items-center justify-end gap-3.5 px-7 py-4.5 sm:px-8 sm:py-5 border-t border-border-subtle bg-bg-surface/85 backdrop-blur-md">
            {footer ? (
              footer
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {closeButtonText}
                </button>
                {onConfirm && (
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={`
                      px-6 py-2.5 rounded-xl text-xs font-bold
                      transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      shadow-sm hover:shadow
                      ${styles.confirm}
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      confirmText
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
