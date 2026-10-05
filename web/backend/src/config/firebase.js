const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if we have a service account path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      const serviceAccount = require(path.resolve(serviceAccountPath));

      // Check if already initialized
      if (getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
    } else {
      // For development without service account file
      console.warn('⚠️ Firebase service account not configured. Real-time features will be limited.');
    }

    console.log('✅ Firebase Admin SDK initialized successfully.');
    return getDatabase();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    // Return null instead of crashing - allows app to run without Firebase
    return null;
  }
};

// Firebase Admin instance
let firebaseAdmin = null;

// Initialize on module load
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
