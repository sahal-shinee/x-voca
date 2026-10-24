/**
 * Firebase Helper Functions for X-VOCA
 *
 * Helper functions untuk update Firebase Realtime Database
 * Dipanggil oleh controllers setelah setiap write operation
 *
 * SUPPORTED ENV VARS:
 * - FIREBASE_SERVICE_ACCOUNT: JSON string dari service account (Production/Railway)
 * - FIREBASE_SERVICE_ACCOUNT_PATH: Path ke file service account JSON (Development)
 * - FIREBASE_DATABASE_URL: Firebase Realtime Database URL
 */

const adminModule = require('firebase-admin');
const admin = adminModule.default || adminModule;
const { getDatabase } = require('firebase-admin/database');
const path = require('path');
const fs = require('fs');

// Debug Firebase admin module loading
console.log('[Firebase] Module loaded:', !!adminModule);
console.log('[Firebase] Admin module keys:', adminModule ? Object.keys(adminModule).slice(0, 10) : 'none');
console.log('[Firebase] Has apps:', admin?.apps !== undefined);
console.log('[Firebase] Apps type:', typeof admin?.apps);

// Lazy initialization untuk Firebase Admin SDK
let firebaseAdmin = null;
let initializationAttempted = false;

const getFirebaseAdmin = () => {
  // Return cached instance if available
  if (firebaseAdmin) return firebaseAdmin;

  // Prevent multiple initialization attempts
  if (initializationAttempted) {
    return null;
  }
  initializationAttempted = true;

  console.log('[Firebase] Starting initialization...');
  console.log('[Firebase] FIREBASE_SERVICE_ACCOUNT env set:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('[Firebase] FIREBASE_SERVICE_ACCOUNT length:', process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0);

  // Safety check - pastikan firebase-admin loaded dengan benar
  if (!admin) {
    console.error('⚠️ Firebase Admin SDK not available');
    return null;
  }

  // Jika sudah ada app instance, reuse
  if (admin.apps && admin.apps.length > 0) {
    firebaseAdmin = admin;
    console.log('✅ Firebase Admin reused existing app instance');
    return firebaseAdmin;
  }

  try {
    let serviceAccount = null;

    // 1. Opsi Utama (Production/Railway): Membaca teks JSON dari environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;

        // Handle escaped newlines in Railway environment variables
        let cleanValue = envValue;
        if (typeof envValue === 'string' && envValue.includes('\\n')) {
          cleanValue = envValue.replace(/\\n/g, '\n');
          console.log('[Firebase] Detected escaped newlines, cleaned for Railway');
        }

        serviceAccount = JSON.parse(cleanValue);
        console.log('[Firebase] Service account parsed from env var:', !!serviceAccount);
        console.log('[Firebase] Has private_key:', !!(serviceAccount?.private_key));
        console.log('[Firebase] Project ID:', serviceAccount?.project_id);
      } catch (err) {
        console.error('❌ Firebase: Gagal parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
        console.error('[Firebase] Env value preview:', process.env.FIREBASE_SERVICE_ACCOUNT?.substring(0, 100) + '...');
      }
    }
    // 2. Development: Path ke file service account JSON
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(resolvedPath)) {
        serviceAccount = require(resolvedPath);
        console.log(`📡 Firebase: Loading service account from file: ${resolvedPath}`);
      } else {
        console.warn(`⚠️ Firebase: File service account tidak ditemukan di path: ${resolvedPath}`);
      }
    }
    // 3. Default: cari di root project
    else {
      const defaultPath = path.resolve(__dirname, '../../firebase-service-account.json');
      if (fs.existsSync(defaultPath)) {
        serviceAccount = require(defaultPath);
        console.log(`📡 Firebase: Loading service account from default file: ${defaultPath}`);
      } else {
        console.warn('⚠️ Firebase: Tidak ada service account configured');
      }
    }

    // Initialize jika service account berhasil dimuat
    if (serviceAccount && serviceAccount.private_key) {
      const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';

      const certCredential = admin.credential?.cert
        ? admin.credential.cert(serviceAccount)
        : (admin.cert ? admin.cert(serviceAccount) : adminModule.cert(serviceAccount));

      const app = admin.initializeApp({
        credential: certCredential,
        databaseURL: databaseURL
      });

      firebaseAdmin = app || admin;
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`📍 Database URL: ${databaseURL}`);
      return firebaseAdmin;
    } else {
      console.warn('⚠️ Firebase: Service account invalid or missing. Real-time features will be limited.');
      console.warn('[Firebase] serviceAccount:', !!serviceAccount);
      console.warn('[Firebase] private_key:', !!(serviceAccount?.private_key));
      return null;
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('[Firebase] Error stack:', error.stack);
    return null;
  }
};

/**
 * Get Realtime Database instance safely
 */
const getDb = () => {
  const fb = getFirebaseAdmin();
  if (!fb) return null;
  try {
    return getDatabase();
  } catch (err) {
    try {
      return getDatabase(fb);
    } catch (fallbackErr) {
      console.error('❌ Firebase getDb error:', fallbackErr.message);
      return null;
    }
  }
};

/**
 * Clear next schedule di Firebase
 * @returns {Promise<boolean>} Success status
 */
const clearNextSchedule = async () => {
  const db = getDb();
  if (!db) {
    return false;
  }

  try {
    const ref = db.ref('/schedules/next');
    await ref.remove();
    console.log('✅ Firebase: Cleared /schedules/next');
    return true;
  } catch (error) {
    console.error('❌ Firebase clearNextSchedule error:', error.message);
    return false;
  }
};

/**
 * Update next schedule di Firebase
 * @param {Object} scheduleData Data jadwal stream
 * @returns {Promise<boolean>} Success status
 */
const updateNextSchedule = async (scheduleData) => {
  if (!scheduleData) {
    return await clearNextSchedule();
  }

  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping schedule update');
    return false;
  }

  try {
    const ref = db.ref('/schedules/next');

    await ref.set({
      id: scheduleData.id,
      title: scheduleData.title,
      game: scheduleData.game_category || null,
      datetime: scheduleData.scheduled_at,
      status: scheduleData.status || 'upcoming',
      countdownEnabled: scheduleData.countdown_enabled !== false,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Firebase: Updated /schedules/next (ID: ${scheduleData.id})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase updateNextSchedule error:', error.message);
    return false;
  }
};

/**
 * Update vote count untuk game di Firebase
 * @param {number} gameId Game ID
 * @param {number} voteCount Total vote count
 * @param {number} percentage Persentase vote (0-100)
 * @param {number} totalVotes Total semua vote di periode ini
 * @returns {Promise<boolean>} Success status
 */
const updateVoteCount = async (gameId, voteCount, percentage, totalVotes) => {
  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping vote update');
    return false;
  }

  try {
    const gameRef = db.ref(`/votes/games/${gameId}`);
    const totalRef = db.ref('/votes/totalVotes');

    await gameRef.set({
      voteCount: voteCount,
      percentage: percentage,
      updatedAt: new Date().toISOString()
    });

    if (totalVotes !== undefined) {
      await totalRef.set(totalVotes);
    }

    console.log(`✅ Firebase: Updated /votes/games/${gameId} (votes: ${voteCount}, %: ${percentage}, total: ${totalVotes})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase updateVoteCount error:', error.message);
    return false;
  }
};

/**
 * Update broadcasting status di Firebase
 * @param {boolean} isReady Apakah sedang broadcasting/live
 * @returns {Promise<boolean>} Success status
 */
const updateBroadcastingStatus = async (isReady) => {
  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping broadcasting status update');
    return false;
  }

  try {
    const ref = db.ref('/broadcasting');

    await ref.set({
      isReady: isReady,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Firebase: Updated /broadcasting (isReady: ${isReady})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase updateBroadcastingStatus error:', error.message);
    return false;
  }
};

/**
 * Reset seluruh voting period di Firebase
 * @param {string} periodKey Period key baru (format: YYYY-MM)
 * @returns {Promise<boolean>} Success status
 */
const resetVotingPeriod = async (periodKey) => {
  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping voting period reset');
    return false;
  }

  try {
    const ref = db.ref('/votes');

    await ref.set({
      period: periodKey,
      games: {},
      totalVotes: 0,
      resetAt: new Date().toISOString()
    });

    console.log(`✅ Firebase: Reset /votes (new period: ${periodKey})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase resetVotingPeriod error:', error.message);
    return false;
  }
};

/**
 * Bulk update semua games vote di Firebase
 * @param {Array} games Array of game objects
 * @param {string} periodKey Period key saat ini
 * @returns {Promise<boolean>} Success status
 */
const updateAllGamesVotes = async (games, periodKey) => {
  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping bulk vote update');
    return false;
  }

  try {
    const totalVotes = games.reduce((sum, g) => sum + (g.vote_count || 0), 0);

    const gamesData = {};
    games.forEach((game) => {
      const percentage = totalVotes > 0
        ? Math.round((game.vote_count / totalVotes) * 1000) / 10
        : 0;

      gamesData[game.id] = {
        title: game.title,
        voteCount: game.vote_count,
        percentage: percentage,
        status: game.status
      };
    });

    await db.ref('/votes').set({
      period: periodKey,
      games: gamesData,
      totalVotes: totalVotes,
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Firebase: Updated all games votes (${games.length} games, ${totalVotes} total votes)`);
    return true;
  } catch (error) {
    console.error('❌ Firebase updateAllGamesVotes error:', error.message);
    return false;
  }
};

/**
 * Broadcast update event for content guides di Firebase
 * Dipanggil saat ada create, update, atau delete konten
 * @returns {Promise<boolean>} Success status
 */
const triggerContentUpdate = async () => {
  const db = getDb();
  if (!db) {
    return false;
  }

  try {
    const timestamp = new Date().toISOString();
    await db.ref('/content_updates').set({
      lastUpdated: timestamp
    });
    console.log(`✅ Firebase: Broadcasted /content_updates (lastUpdated: ${timestamp})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase triggerContentUpdate error:', error.message);
    return false;
  }
};

/**
 * Push real-time notification to Firebase
 * @param {Object} options
 * @param {string} options.userId - Target user ID (default: 'default')
 * @param {string} options.type - Notification type key
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.link - Internal navigation link in admin
 * @returns {Promise<boolean>}
 */
const pushNotification = async ({ userId = 'default', type = 'SYSTEM_UPDATE', title, message, link = null }) => {
  const db = getDb();
  if (!db) {
    console.warn('⚠️ Firebase not available, skipping pushNotification');
    return false;
  }

  try {
    const notifRef = db.ref(`notifications/${userId}`).push();
    await notifRef.set({
      type,
      title,
      message,
      link,
      read: false,
      createdAt: Date.now()
    });
    console.log(`✅ Firebase: Pushed notification [${type}] to notifications/${userId} (ID: ${notifRef.key})`);
    return true;
  } catch (error) {
    console.error('❌ Firebase pushNotification error:', error.message);
    return false;
  }
};

module.exports = {
  updateNextSchedule,
  clearNextSchedule,
  updateVoteCount,
  updateBroadcastingStatus,
  resetVotingPeriod,
  updateAllGamesVotes,
  triggerContentUpdate,
  pushNotification,
  getFirebaseAdmin,
  getDb
};
