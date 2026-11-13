import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured, listenForegroundMessages } from '../utils/firebase';

const NotificationContext = createContext(null);

// Notification types configuration
export const NOTIFICATION_TYPES = {
  VOTE_SPIKE: {
    label: 'Vote Spike',
    icon: 'TrendingUp',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  vote_received: {
    label: 'Vote Masuk',
    icon: 'TrendingUp',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  NEW_GAME_REQUEST: {
    label: 'Game Request Baru',
    icon: 'Gamepad2',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
  game_requested: {
    label: 'Game Request Baru',
    icon: 'Gamepad2',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
  NEW_COLLAB_REQUEST: {
    label: 'Collab Request Baru',
    icon: 'Users',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
  collab_requested: {
    label: 'Collab Request Baru',
    icon: 'Users',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
  TODO_DEADLINE: {
    label: 'Deadline Mendekat',
    icon: 'AlertCircle',
    color: 'red',
    bgColor: 'bg-status-live/10',
    borderColor: 'border-status-live/30',
    iconColor: 'text-status-live'
  },
  SCHEDULE_REMINDER: {
    label: 'Reminder Jadwal',
    icon: 'Calendar',
    color: 'gold',
    bgColor: 'bg-accent-gold/10',
    borderColor: 'border-accent-gold/30',
    iconColor: 'text-accent-gold'
  },
  schedule_upcoming: {
    label: 'Jadwal Siaran',
    icon: 'Calendar',
    color: 'gold',
    bgColor: 'bg-accent-gold/10',
    borderColor: 'border-accent-gold/30',
    iconColor: 'text-accent-gold'
  },
  SYSTEM_UPDATE: {
    label: 'Update Sistem',
    icon: 'Bell',
    color: 'muted',
    bgColor: 'bg-text-muted/10',
    borderColor: 'border-border-subtle',
    iconColor: 'text-text-muted'
  },
  BROADCASTING_START: {
    label: 'Broadcasting Dimulai',
    icon: 'Radio',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  VOTING_RESET: {
    label: 'Periode Voting Direset',
    icon: 'RefreshCw',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
};

export function NotificationProvider({ children, userId = 'default' }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from Firebase RTDB & API fallback
  useEffect(() => {
    // 1. Initial hydration from REST API (with audit log fallback)
    import('../services/api').then(({ default: api }) => {
      api.get(`/api/notifications?userId=${userId}`).then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setNotifications((prev) => (prev.length === 0 ? res.data.data : prev));
        }
      }).catch((e) => console.warn('API notification fallback skipped:', e.message));
    });

    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const database = getFirebaseDatabase();
      if (!database) {
        setLoading(false);
        return;
      }

      const notificationsRef = ref(database, `notifications/${userId}`);

      const unsubscribe = onValue(
        notificationsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const notificationList = Object.entries(data).map(([id, notification]) => ({
              id,
              ...notification,
              createdAt: notification.createdAt || Date.now(),
            })).sort((a, b) => b.createdAt - a.createdAt);
            setNotifications(notificationList);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('RTDB notifications listener warning:', err.message);
          setError(err.message);
          setLoading(false);
        }
      );

      // Listen to foreground FCM messages
      const unsubscribeFCM = listenForegroundMessages((payload) => {
        const notif = payload.notification || {};
        const data = payload.data || {};
        const newNotif = {
          id: payload.messageId || `fcm_${Date.now()}`,
          type: data.type || 'SYSTEM_UPDATE',
          title: notif.title || data.title || 'Notifikasi Baru',
          message: notif.body || data.body || '',
          link: data.url || null,
          read: false,
          createdAt: Date.now()
        };
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        off(notificationsRef);
        unsubscribe();
        if (typeof unsubscribeFCM === 'function') unsubscribeFCM();
      };
    } catch (err) {
      console.warn('Notification setup error:', err.message);
      setError(err.message);
      setLoading(false);
    }
  }, [userId]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!isFirebaseConfigured()) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
      const { update } = await import('firebase/database');
      await update(notificationRef, { read: true, readAt: Date.now() });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: Date.now() } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const updates = {};

      notifications.forEach(n => {
        if (!n.read) {
          updates[`notifications/${userId}/${n.id}/read`] = true;
          updates[`notifications/${userId}/${n.id}/readAt`] = Date.now();
        }
      });

      if (Object.keys(updates).length > 0) {
        const { update } = await import('firebase/database');
        await update(ref(database), updates);
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: Date.now() })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [notifications, userId]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setNotifications([]);
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const { set, ref: dbRef } = await import('firebase/database');
      await set(dbRef(database, `notifications/${userId}`), null);
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [userId]);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isFirebaseConfigured()) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const { remove, ref: dbRef } = await import('firebase/database');
      await remove(dbRef(database, `notifications/${userId}/${notificationId}`));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [userId]);

  // Add a new notification (for internal use)
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notif_${Date.now()}`,
      ...notification,
      read: false,
      createdAt: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
