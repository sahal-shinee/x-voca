import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';

/**
 * Toast Context - untuk global toast notifications
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();

    setToasts((prev) => {
      // Prevent duplicate identical message stacking
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      // Keep at most 3 active toasts
      const next = [...prev, { id, message, type }];
      return next.slice(-3);
    });

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shorthand methods
  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }), [toasts, addToast, removeToast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return noop functions if used outside provider
    return {
      toasts: [],
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
}

/**
 * Toast Container - renders all active toasts
 */
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

/**
 * Individual Toast component
 */
function Toast({ toast, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };

  const typeStyles = {
    success: {
      border: 'border-accent-cyan/50',
      icon: '✓',
      iconBg: 'bg-accent-cyan/20',
      iconColor: 'text-accent-cyan',
    },
    error: {
      border: 'border-status-live/50',
      icon: '✕',
      iconBg: 'bg-status-live/20',
      iconColor: 'text-status-live',
    },
    warning: {
      border: 'border-accent-gold/50',
      icon: '⚠',
      iconBg: 'bg-accent-gold/20',
      iconColor: 'text-accent-gold',
    },
    info: {
      border: 'border-accent-purple/50',
      icon: 'ℹ',
      iconBg: 'bg-accent-purple/20',
      iconColor: 'text-accent-purple',
    },
  };

  const styles = typeStyles[toast.type] || typeStyles.info;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3
        px-4 py-3
        bg-bg-card border ${styles.border}
        rounded-lg shadow-lg
        min-w-[280px] max-w-md
        transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={`${styles.iconColor} text-sm font-bold`}>{styles.icon}</span>
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors flex-shrink-0"
      >
        <span className="text-xs">✕</span>
      </button>
    </div>
  );
}

export default Toast;
