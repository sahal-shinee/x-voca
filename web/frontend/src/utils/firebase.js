/**
 * Firebase Configuration and Initialization
 *
 * Inisialisasi Firebase Realtime Database untuk X-VOCA
 * Config diambil dari environment variables (VITE_FIREBASE_*)
 */

// Firebase SDK imports
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration dari environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

// Export default instances
export default {
  getFirebaseApp,
  getFirebaseDatabase,
  isFirebaseConfigured,
  firebaseConfig,
};
