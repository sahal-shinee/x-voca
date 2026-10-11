import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  TrendingUp,
  BarChart2,
  Gamepad2,
  Users,
  Calendar,
  AlertCircle,
  Radio,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const iconMap = {
  // Aliases & direct keys
  vote_received: BarChart2,
  VOTE_SPIKE: TrendingUp,
  game_requested: Gamepad2,
  NEW_GAME_REQUEST: Gamepad2,
  collab_requested: Users,
  NEW_COLLAB_REQUEST: Users,
  schedule_upcoming: Calendar,
  SCHEDULE_REMINDER: Calendar,
  TODO_DEADLINE: AlertCircle,
  BROADCASTING_START: Radio,
  VOTING_RESET: RefreshCw,
  SYSTEM_UPDATE: Bell,
};

const typeConfigs = {
  vote_received: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', label: 'Vote Masuk' },
  VOTE_SPIKE: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', label: 'Vote Spike' },
  game_requested: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Game Request' },
  NEW_GAME_REQUEST: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Game Request' },
  collab_requested: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Collab Request' },
  NEW_COLLAB_REQUEST: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Collab Request' },
  schedule_upcoming: { bg: 'bg-accent-gold/10', text: 'text-accent-gold', label: 'Jadwal' },
  SCHEDULE_REMINDER: { bg: 'bg-accent-gold/10', text: 'text-accent-gold', label: 'Reminder' },
  TODO_DEADLINE: { bg: 'bg-status-live/10', text: 'text-status-live', label: 'Deadline' },
  BROADCASTING_START: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', label: 'Broadcast' },
  VOTING_RESET: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', label: 'Reset' },
  SYSTEM_UPDATE: { bg: 'bg-bg-surface', text: 'text-text-secondary', label: 'System' },
};

function formatTime(ts) {
  if (!ts) return '';
  const now = Date.now();
  const diff = now - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m}m lalu`;
  if (h < 24) return `${h}j lalu`;
  return `${d}h lalu`;
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    loading,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Lihat notifikasi"
        className={`
          relative p-2 rounded-xl transition-all duration-150
          ${
            isOpen
              ? 'bg-bg-surface text-accent-cyan shadow-sm border border-border-subtle'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent'
          }
        `}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold font-mono text-white bg-status-live rounded-full shadow-[0_0_8px_rgba(248,113,113,0.5)]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-50" />
            <span className="relative z-10">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2
          w-80 sm:w-96
          bg-bg-card border border-border-subtle
          rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)]
          overflow-hidden animate-scale-in z-50
        ">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-surface/60 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary leading-tight">Notifikasi</h3>
                <p className="text-[11px] font-mono text-text-muted mt-0.5">
                  {unreadCount > 0 ? (
                    <span className="text-accent-cyan font-medium">{unreadCount} belum dibaca</span>
                  ) : (
                    'Semua sudah dibaca'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1.5 text-text-muted hover:text-accent-cyan hover:bg-bg-surface rounded-lg transition-colors"
                  title="Tandai semua dibaca"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="p-1.5 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
                  title="Hapus semua"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-hide divide-y divide-border-subtle/50">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-accent-cyan animate-spin mx-auto mb-2" />
                <p className="text-xs text-text-muted">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-text-muted opacity-50" />
                </div>
                <p className="text-sm font-medium text-text-primary">Belum ada notifikasi</p>
                <p className="text-xs text-text-muted mt-1">Aktivitas baru akan muncul di sini</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = typeConfigs[notif.type] || typeConfigs.SYSTEM_UPDATE;
                const IconComponent = iconMap[notif.type] || Bell;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      group relative p-3.5 hover:bg-bg-surface/70 cursor-pointer transition-colors
                      ${!notif.read ? 'bg-accent-cyan/[0.03]' : ''}
                    `}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <span className="absolute left-1 top-3.5 bottom-3.5 w-1 rounded-full bg-accent-cyan" />
                    )}

                    <div className="flex items-start gap-3 pl-1">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                        <IconComponent className={`w-4 h-4 ${config.text}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug line-clamp-1 ${notif.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-mono text-text-muted whitespace-nowrap flex-shrink-0">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                className="p-1 text-text-muted hover:text-accent-cyan rounded transition-colors"
                                title="Tandai dibaca"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 text-text-muted hover:text-status-live rounded transition-colors"
                              title="Hapus notifikasi"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border-subtle bg-bg-surface/30 flex items-center justify-between text-xs text-text-muted">
              <span className="font-mono text-[11px]">{notifications.length} notifikasi tersimpan</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-accent-cyan hover:underline font-medium text-[11px]"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
