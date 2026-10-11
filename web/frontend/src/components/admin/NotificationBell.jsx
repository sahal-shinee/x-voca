import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Clock, TrendingUp, Gamepad2, AlertCircle, Calendar, Radio, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../../context/NotificationContext';

const iconMap = {
  TrendingUp,
  Gamepad2,
  AlertCircle,
  Calendar,
  Radio,
  RefreshCw,
  Bell,
};

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m lalu`;
    if (hours < 24) return `${hours}j lalu`;
    return `${days}h lalu`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-xl transition-all duration-200
          ${isOpen
            ? 'bg-accent-cyan/10 text-accent-cyan'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'
          }
        `}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-status-live rounded-full animate-pulse shadow-lg shadow-status-live/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-scale-in z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-gradient-to-r from-bg-card to-bg-input">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-accent-cyan">{unreadCount} unread</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-text-muted hover:text-accent-cyan hover:bg-bg-input rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-2 text-text-muted hover:text-status-live hover:bg-bg-input rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-input rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-2" />
                <p className="text-sm text-text-muted">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-bg-input flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-text-muted opacity-50" />
                </div>
                <p className="text-sm text-text-muted">No notifications yet</p>
                <p className="text-xs text-text-muted mt-1">Updates will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle/50">
                {notifications.map((notification, index) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.SYSTEM_UPDATE;
                  const IconComponent = iconMap[typeConfig.icon] || Bell;

                  return (
                    <div
                      key={notification.id}
                      className={`
                        relative p-4 hover:bg-bg-input/50 transition-all duration-200 cursor-pointer group
                        ${!notification.read ? 'bg-gradient-to-r from-accent-cyan/5 to-transparent' : ''}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                      )}

                      <div className={`flex items-start gap-3 ${!notification.read ? 'pl-3' : ''}`}>
                        {/* Icon */}
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          ${typeConfig.bgColor}
                        `}>
                          <IconComponent className={`w-5 h-5 ${typeConfig.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium ${notification.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-text-muted whitespace-nowrap">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`
                              text-[10px] px-2 py-0.5 rounded-full
                              ${typeConfig.bgColor} ${typeConfig.iconColor}
                            `}>
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-bg-card rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 text-text-muted hover:text-status-live hover:bg-bg-card rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {notification.link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.link;
                              }}
                              className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-bg-card rounded-lg transition-colors"
                              title="Go to"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-border-subtle bg-bg-input/30">
              <p className="text-xs text-text-muted text-center">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
