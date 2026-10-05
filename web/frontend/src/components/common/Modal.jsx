import { useState, useEffect, useCallback } from 'react';

/**
 * Modal Component - Confirmation dialog
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.confirmText - Text for confirm button (default: 'Konfirmasi')
 * @param {string} props.cancelText - Text for cancel button (default: 'Batal')
 * @param {Function} props.onConfirm - Callback when confirm is clicked
 * @param {string} props.variant - 'default' | 'danger' | 'success'
 * @param {boolean} props.showClose - Show X button (default: true)
 * @param {boolean} props.loading - Show loading state on confirm button
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  variant = 'default',
  showClose = true,
  loading = false,
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

  // Variant styles
  const variantStyles = {
    default: {
      confirm: 'bg-gradient-cta text-text-on-cta hover:opacity-90',
      icon: 'text-accent-purple',
    },
    success: {
      confirm: 'bg-accent-cyan text-bg-base hover:bg-accent-cyan/90',
      icon: 'text-accent-cyan',
    },
    danger: {
      confirm: 'bg-status-live text-white hover:bg-status-live/90',
      icon: 'text-status-live',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center p-4
        transition-opacity duration-200
        ${isOpen && !isAnimatingOut ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`
          relative w-full max-w-md
          bg-bg-card border border-border-subtle
          rounded-2xl shadow-2xl
          transform transition-all duration-200
          ${isOpen && !isAnimatingOut ? 'scale-100' : 'scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl ${styles.icon}/20 flex items-center justify-center`}>
              <span className={`${styles.icon} text-xl`}>
                {variant === 'success' ? '✓' : variant === 'danger' ? '!' : '✦'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          </div>

          {/* Close Button */}
          {showClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
            >
              <span className="text-lg">✕</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-bg-card-hover border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                px-5 py-2.5 rounded-lg font-semibold
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
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
        </div>
      </div>
    </div>
  );
}

export default Modal;
