const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    let serviceAccount = null;

    // 1. Opsi Utama (Production/Railway): Membaca teks JSON dari environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          : process.env.FIREBASE_SERVICE_ACCOUNT;
      } catch (err) {
        console.error('❌ Gagal parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
      }
    } 
    // 2. Opsi Kedua: Membaca file dari path variabel env (jika filenya ada)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(resolvedPath)) {
        serviceAccount = require(resolvedPath);
      } else {
        console.warn(`⚠️ File service account tidak ditemukan di path: ${resolvedPath}`);
      }
    } 
    // 3. Opsi Ketiga: Fallback file lokal untuk development
    else {
      const defaultPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      if (fs.existsSync(defaultPath)) {
        serviceAccount = require(defaultPath);
      }
    }

    // Inisialisasi jika service account berhasil dimuat
    if (serviceAccount) {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      console.log('✅ Firebase Admin SDK initialized successfully.');
      return getDatabase();
    } else {
      console.warn('⚠️ Firebase service account not configured. Real-time features will be limited.');
      return null;
    }

  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    return null;
  }
};

// Firebase Admin instance
let firebaseAdmin = null;

try {
  firebaseAdmin = initializeFirebase();
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, continuing without Firebase:', error.message);
}

// Helper functions for Firebase operations
const firebaseDb = {
  // Update next schedule in Firebase
  updateNextSchedule: async (schedule) => {
    if (!firebaseAdmin) return null;
    try {
      return await firebaseAdmin.ref('/schedules/next').set({
        id: schedule.id,
        title: schedule.title,
        game: schedule.game_category,
        datetime: schedule.scheduled_at,
        countdownEnabled: schedule.countdown_enabled
      });
    } catch (error) {
      console.error('Firebase updateNextSchedule error:', error.message);
      return null;
    }
  },

  // Update vote count for a game
  updateVoteCount: async (gameId, voteCount, status) => {
    if (!firebaseAdmin) return null;
    try {
      return await firebaseAdmin.ref(`/votes/games/${gameId}`).set({
        voteCount,
        status
      });
    } catch (error) {
      console.error('Firebase updateVoteCount error:', error.message);
      return null;
    }
  },

  // Update voting period
  updateVotingPeriod: async (periodKey, games) => {
    if (!firebaseAdmin) return null;
    try {
      await firebaseAdmin.ref('/votes').set({
        period: periodKey,
        games: games || {},
        totalVotes: 0
      });
      return true;
    } catch (error) {
      console.error('Firebase updateVotingPeriod error:', error.message);
      return null;
    }
  },

  // Update broadcasting status
  updateBroadcasting: async (isReady) => {
    if (!firebaseAdmin) return null;
    try {
      return await firebaseAdmin.ref('/broadcasting').set({
        isReady: isReady,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase updateBroadcasting error:', error.message);
      return null;
    }
  },

  // Get Firebase Admin instance
  getAdmin: () => firebaseAdmin
};

module.exports = firebaseDb;