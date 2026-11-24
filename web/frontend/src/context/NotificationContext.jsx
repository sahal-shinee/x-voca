/**
 * ============================================================================
 * FILE: web/frontend/src/context/NotificationContext.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat pengelolaan sistem notifikasi interaktif (Notification Hub) aplikasi X-VOCA.
 * Mengatur:
 * 1. Penyimpanan daftar notifikasi realtime yang diterima dari Firebase RTDB dan FCM.
 * 2. Pemfilteran jenis notifikasi (misal: alert vote masuk, request game baru, kolaborasi).
 * 3. Fitur tandai sudah dibaca (markAsRead / markAllAsRead), hapus, dan hitung pesan belum dibaca.
 * 4. Sinkronisasi data dua arah: mendengarkan perubahan realtime dan update langsung ke Firebase.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Context ini bertindak sebagai jembatan yang menangkap push alert dari server
 *   dan menampilkannya pada ikon lonceng di Studio Admin secara real-time."
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured, listenForegroundMessages } from '../utils/firebase';
import api from '../services/api';

// Inisialisasi Context React untuk notifikasi
const NotificationContext = createContext(null);

/**
 * Konfigurasi Visual Jenis-Jenis Notifikasi
 * Menentukan ikon, warna teks aksen, background badge, dan label Bahasa Indonesia untuk setiap tipe event.
 */
export const NOTIFICATION_TYPES = {
  // Notifikasi ketika terjadi lonjakan voting game yang signifikan
  VOTE_SPIKE: {
    label: 'Vote Spike',
    icon: 'TrendingUp',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  // Notifikasi ketika ada penonton yang memberikan suara baru
  vote_received: {
    label: 'Vote Masuk',
    icon: 'TrendingUp',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  // Notifikasi ketika penonton mengajukan request judul game baru
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
  // Notifikasi ketika penonton mengirimkan usulan kolaborasi streamer
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
  // Pengingat batas waktu penyelesaian to-do list internal
  TODO_DEADLINE: {
    label: 'Deadline Mendekat',
    icon: 'AlertCircle',
    color: 'red',
    bgColor: 'bg-status-live/10',
    borderColor: 'border-status-live/30',
    iconColor: 'text-status-live'
  },
  // Pengingat jadwal siaran streaming yang akan segera dimulai
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
  // Pembaruan sistem umum
  SYSTEM_UPDATE: {
    label: 'Update Sistem',
    icon: 'Bell',
    color: 'muted',
    bgColor: 'bg-text-muted/10',
    borderColor: 'border-border-subtle',
    iconColor: 'text-text-muted'
  },
  // Siaran streaming resmi dimulai
  BROADCASTING_START: {
    label: 'Broadcasting Dimulai',
    icon: 'Radio',
    color: 'cyan',
    bgColor: 'bg-accent-cyan/10',
    borderColor: 'border-accent-cyan/30',
    iconColor: 'text-accent-cyan'
  },
  // Pemberitahuan bahwa admin telah mereset periode voting bulanan
  VOTING_RESET: {
    label: 'Periode Voting Direset',
    icon: 'RefreshCw',
    color: 'purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/30',
    iconColor: 'text-accent-purple'
  },
};

/**
 * Helper: isViewerLiveAlert
 * Menyaring notifikasi "Sedang Live" agar tidak muncul di lonceng admin sendiri
 * (karena notifikasi siaran live ditujukan untuk penonton, bukan kreator yang sedang siaran).
 */
const isViewerLiveAlert = (notif) => {
  const typeUpper = String(notif?.type || '').toUpperCase();
  const titleLower = String(notif?.title || '').toLowerCase();
  return typeUpper === 'BROADCASTING_START' || titleLower.includes('sedang live');
};

/**
 * Komponen Provider: NotificationProvider
 * Membungkus tree komponen React agar state notifikasi bisa diakses secara global.
 */
export function NotificationProvider({ children, userId = 'default' }) {
  // State untuk menyimpan daftar objek notifikasi aktif
  const [notifications, setNotifications] = useState([]);
  // State status pemuatan awal data
  const [loading, setLoading] = useState(true);
  // State pencatatan pesan kesalahan jika koneksi gagal
  const [error, setError] = useState(null);

  /**
   * useEffect: Mengambil data awal (Hydration) dan mendaftarkan listener realtime Firebase
   */
  useEffect(() => {
    // 1. Mengambil data awal (Initial Data) melalui REST API backend sebagai fallback
    api.get(`/api/notifications?userId=${userId}`).then((res) => {
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Filter notifikasi agar tidak menampilkan self-live alert ke admin
        const filtered = res.data.data.filter((n) => !isViewerLiveAlert(n));
        setNotifications((prev) => (prev.length === 0 ? filtered : prev));
      }
    }).catch((e) => console.warn('API notification fallback skipped:', e.message));

    // Jika konfigurasi Firebase belum lengkap, hentikan proses loading
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      // 2. Dapatkan instance database Firebase Realtime
      const database = getFirebaseDatabase();
      if (!database) {
        setLoading(false);
        return;
      }

      // Arahkan pointer ke node database spesifik pengguna: `/notifications/{userId}`
      const notificationsRef = ref(database, `notifications/${userId}`);

      // 3. Pasang listener 'onValue' untuk mendengarkan setiap perubahan data secara real-time via WebSocket
      const unsubscribe = onValue(
        notificationsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Ubah objek hash Firebase menjadi array JavaScript yang terurut
            const notificationList = Object.entries(data)
              .map(([id, notification]) => ({
                id,
                ...notification,
                createdAt: notification.createdAt || Date.now(),
              }))
              .filter((n) => !isViewerLiveAlert(n))
              .sort((a, b) => b.createdAt - a.createdAt); // Urutkan dari yang terbaru ke terlama
            setNotifications(notificationList);
          } else {
            setNotifications([]);
          }
          setLoading(false);
        },
        (err) => {
          console.warn('RTDB notifications listener warning:', err.message);
          setError(err.message);
          setLoading(false);
        }
      );

      // 4. Dengarkan push notification foreground dari Firebase Cloud Messaging (FCM)
      const unsubscribeFCM = listenForegroundMessages((payload) => {
        const notif = payload.notification || {};
        const data = payload.data || {};
        const newNotif = {
          id: payload.messageId || `fcm_${Date.now()}`,
          type: data.type || 'SYSTEM_UPDATE',
          title: notif.title || data.title || 'Notifikasi Baru',
          message: notif.body || data.body || '',
          link: data.url || null,
          read: false, // Default status pesan baru: belum dibaca
          createdAt: Date.now()
        };
        if (isViewerLiveAlert(newNotif)) return;
        // Sisipkan notifikasi baru ke urutan paling atas
        setNotifications((prev) => [newNotif, ...prev]);
      });

      // 5. Fungsi Pembersihan (Cleanup): Menutup listener saat komponen dilepas untuk mencegah Memory Leak
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

  // Menghitung jumlah pesan yang belum dibaca (badge counter merah di ikon lonceng)
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Fungsi: markAsRead
   * Menandai satu notifikasi tertentu sebagai telah dibaca
   */
  const markAsRead = useCallback(async (notificationId) => {
    // Jika offline / tanpa Firebase: perbarui state lokal saja
    if (!isFirebaseConfigured()) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
      // Lakukan pembaruan field `read: true` langsung ke Firebase RTDB
      const { update } = await import('firebase/database');
      await update(notificationRef, { read: true, readAt: Date.now() });

      // Sinkronkan state React lokal agar UI langsung berubah tanpa delay
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: Date.now() } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [userId]);

  /**
   * Fungsi: markAllAsRead
   * Menandai SELURUH notifikasi yang belum dibaca menjadi sudah dibaca sekaligus
   */
  const markAllAsRead = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const updates = {};

      // Siapkan payload pembaruan massal untuk semua notifikasi yang berstatus unread
      notifications.forEach(n => {
        if (!n.read) {
          updates[`notifications/${userId}/${n.id}/read`] = true;
          updates[`notifications/${userId}/${n.id}/readAt`] = Date.now();
        }
      });

      // Kirim pembaruan satu kali request ke Firebase (atomic multi-path update)
      if (Object.keys(updates).length > 0) {
        const { update } = await import('firebase/database');
        await update(ref(database), updates);
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: Date.now() })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [notifications, userId]);

  /**
   * Fungsi: clearAll
   * Menghapus seluruh riwayat notifikasi dari database
   */
  const clearAll = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setNotifications([]);
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const { set, ref: dbRef } = await import('firebase/database');
      // Set nilai node menjadi null untuk menghapus seluruh data di Firebase
      await set(dbRef(database, `notifications/${userId}`), null);
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [userId]);

  /**
   * Fungsi: deleteNotification
   * Menghapus satu pesan notifikasi spesifik berdasarkan ID
   */
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isFirebaseConfigured()) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      return;
    }

    try {
      const database = getFirebaseDatabase();
      const { remove, ref: dbRef } = await import('firebase/database');
      // Hapus node notifikasi dari Firebase
      await remove(dbRef(database, `notifications/${userId}/${notificationId}`));
      // Hapus dari state React lokal
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [userId]);

  /**
   * Fungsi: addNotification
   * Menyisipkan notifikasi baru secara programatis dari dalam aplikasi
   */
  const addNotification = useCallback((notification) => {
    if (isViewerLiveAlert(notification)) return;
    const newNotification = {
      id: `notif_${Date.now()}`,
      ...notification,
      read: false,
      createdAt: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Objek yang diekspos ke seluruh komponen konsumen via context
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

/**
 * Custom Hook: useNotifications
 * Mempermudah komponen lain mengakses state dan fungsi NotificationContext secara aman
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
