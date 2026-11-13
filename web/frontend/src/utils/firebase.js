/**
 * Firebase Configuration and Initialization
 *
 * Inisialisasi Firebase Realtime Database untuk X-VOCA
 * Config diambil dari environment variables (VITE_FIREBASE_*)
 */

// Firebase SDK imports
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

// Fallback Web Push config (FCM)
const FCM_FALLBACK_CONFIG = {
  apiKey: "AIzaSyAjymvKw1OcEVIh3uet6OFwp5tBj0XhLx4",
  authDomain: "x-voca.firebaseapp.com",
  projectId: "x-voca",
  storageBucket: "x-voca.firebasestorage.app",
  messagingSenderId: "74861176052",
  appId: "1:74861176052:web:6825086462e8210facaaa1"
};

const FCM_VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BJVmlLnOdpZQGAGj3ZSh0QTa_PQCYuHvYIip1wWcKKMPYBjB-9sY6n_Hw9xeSTEviCF-pWV45nP4eNbEIN5h5QY";

const RTDB_FALLBACK_URL = 'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';

// Firebase configuration dari environment (dengan fallback siap pakai ke project X-VOCA)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAjymvKw1OcEVIh3uet6OFwp5tBj0XhLx4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "x-voca.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || RTDB_FALLBACK_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "x-voca",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "x-voca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "74861176052",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:74861176052:web:6825086462e8210facaaa1",
};

// Singleton instances
let app = null;
let database = null;

/**
 * Get Firebase app instance (singleton)
 * @returns {Object} Firebase app instance
 */
export function getFirebaseApp() {
  if (!app) {
    // Validate config
    if (!firebaseConfig.databaseURL) {
      console.warn('Firebase databaseURL not configured. Real-time features will be disabled.');
      return null;
    }

    try {
      // Check if already initialized to avoid duplicate app error
      if (getApps().length > 0) {
        app = getApps()[0];
      } else {
        app = initializeApp(firebaseConfig);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return null;
    }
  }
  return app;
}

/**
 * Get Firebase Database instance (singleton)
 * @returns {Object} Firebase database instance
 */
export function getFirebaseDatabase() {
  if (!database) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      database = getDatabase(firebaseApp);
    }
  }
  return database;
}

/**
 * Check if Firebase is configured
 * @returns {boolean}
 */
export function isFirebaseConfigured() {
  return !!firebaseConfig.databaseURL;
}

/**
 * Request browser notification permission, register SW, and get FCM Web Push token
 * @returns {Promise<string>} FCM registration token
 */
export async function requestWebPushToken() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    throw new Error('Browser kamu belum mendukung notifikasi push.');
  }

  const supported = await isSupported().catch(() => false);
  if (!supported || !('serviceWorker' in navigator)) {
    throw new Error('Browser ini belum mendukung Firebase Cloud Messaging.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Izin notifikasi diblokir browser. Aktifkan izin notifikasi di pengaturan situs.'
        : 'Izin notifikasi belum disetujui.'
    );
  }

  const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  // Ensure a Firebase App instance exists for Messaging (using env config or FCM fallback)
  let messagingApp = getApps().find((a) => a.name === 'xvoca-fcm') || null;
  if (!messagingApp) {
    const fcmConfig = firebaseConfig.apiKey && firebaseConfig.projectId
      ? {
          apiKey: firebaseConfig.apiKey,
          authDomain: firebaseConfig.authDomain || FCM_FALLBACK_CONFIG.authDomain,
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket || FCM_FALLBACK_CONFIG.storageBucket,
          messagingSenderId: firebaseConfig.messagingSenderId || FCM_FALLBACK_CONFIG.messagingSenderId,
          appId: firebaseConfig.appId || FCM_FALLBACK_CONFIG.appId,
        }
      : FCM_FALLBACK_CONFIG;
    messagingApp = initializeApp(fcmConfig, 'xvoca-fcm');
  }

  const messaging = getMessaging(messagingApp);
  const token = await getToken(messaging, {
    vapidKey: FCM_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  });

  if (!token) {
    throw new Error('Gagal mendapatkan token notifikasi dari browser.');
  }

  return token;
}

/**
 * Listen to foreground FCM push notifications
 */
export function listenForegroundMessages(callback) {
  try {
    const messagingApp = getApps().find((a) => a.name === 'xvoca-fcm');
    if (!messagingApp) return () => {};
    const messaging = getMessaging(messagingApp);
    return onMessage(messaging, (payload) => {
      if (typeof callback === 'function') {
        callback(payload);
      }
    });
  } catch (_) {
    return () => {};
  }
}

// Export default instances
export default {
  getFirebaseApp,
  getFirebaseDatabase,
  isFirebaseConfigured,
  requestWebPushToken,
  firebaseConfig,
};
