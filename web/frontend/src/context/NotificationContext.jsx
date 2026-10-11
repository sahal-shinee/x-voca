import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../utils/firebase';

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
  NEW_GAME_REQUEST: {
    label: 'Game Request Baru',
    icon: 'Gamepad2',
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

  // Fetch notifications from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      // Use mock notifications for development
      setNotifications(getMockNotifications());
      return;
    }

    try {
      const database = getFirebaseDatabase();
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
          } else {
            setNotifications([]);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching notifications:', err);
          setError(err.message);
          setLoading(false);
          // Fallback to mock data
          setNotifications(getMockNotifications());
        }
      );

      return () => {
        off(notificationsRef);
      };
    } catch (err) {
      console.error('Notification setup error:', err);
      setError(err.message);
      setLoading(false);
      // Fallback to mock data
      setNotifications(getMockNotifications());
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

// Mock notifications for development
function getMockNotifications() {
  return [
    {
      id: 'notif_1',
      type: 'VOTE_SPIKE',
      title: 'Vote Spike Terdeteksi',
      message: 'Game "Elden Ring" mendapat 50 vote dalam 10 menit terakhir',
      read: false,
      createdAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      link: '/admin/voting',
    },
    {
      id: 'notif_2',
      type: 'NEW_GAME_REQUEST',
      title: 'Request Game Baru',
      message: '"Signalis" telah diminta oleh viewer',
      read: false,
      createdAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      link: '/admin/voting',
    },
    {
      id: 'notif_3',
      type: 'TODO_DEADLINE',
      title: 'Deadline Mendekat',
      message: 'Tugas "Edit Thumbnail" harus selesai dalam 2 jam',
      read: true,
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      link: '/admin/todos',
    },
    {
      id: 'notif_4',
      type: 'SCHEDULE_REMINDER',
      title: 'Reminder Jadwal',
      message: 'Stream "Cyberpunk 2077" akan dimulai dalam 1 jam',
      read: true,
      createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      link: '/admin/schedules',
    },
  ];
}

export default NotificationContext;
