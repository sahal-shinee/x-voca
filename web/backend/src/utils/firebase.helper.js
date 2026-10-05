/**
 * Firebase Helper Functions for X-VOCA
 *
 * Helper functions untuk update Firebase Realtime Database
 * Dipanggil oleh controllers setelah setiap write operation
 */

const admin = require('firebase-admin');
const path = require('path');

// Lazy initialization untuk Firebase Admin SDK
let firebaseAdmin = null;

const getFirebaseAdmin = () => {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      const serviceAccount = require(path.resolve(serviceAccountPath));

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      }
      firebaseAdmin = admin;
    }

    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    return null;
  }
};

/**
 * Update next schedule di Firebase
 * Called setelah: schedule baru dibuat atau diupdate
 *
 * @param {Object} scheduleData - Data jadwal stream
 * @param {number} scheduleData.id - Schedule ID
 * @param {string} scheduleData.title - Judul stream
 * @param {string} scheduleData.game_category - Kategori game
 * @param {Date|string} scheduleData.scheduled_at - Waktu stream
 * @param {boolean} scheduleData.countdown_enabled - Apakah countdown enabled
 * @returns {Promise<boolean>} Success status
 */
const updateNextSchedule = async (scheduleData) => {
  const fb = getFirebaseAdmin();
  if (!fb) {
    console.warn('⚠️ Firebase not available, skipping schedule update');
    return false;
  }

  try {
    const ref = fb.database().ref('/schedules/next');

    await ref.set({
      id: scheduleData.id,
      title: scheduleData.title,
      game: scheduleData.game_category || null,
      datetime: scheduleData.scheduled_at,
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
 * Called setelah: viewer vote atau vote direset
 *
 * @param {number} gameId - Game ID
 * @param {number} voteCount - Total vote count
 * @param {number} percentage - Persentase vote (0-100)
 * @param {number} totalVotes - Total semua vote di periode ini
 * @returns {Promise<boolean>} Success status
 */
const updateVoteCount = async (gameId, voteCount, percentage, totalVotes) => {
  const fb = getFirebaseAdmin();
  if (!fb) {
    console.warn('⚠️ Firebase not available, skipping vote update');
    return false;
  }

  try {
    const db = fb.database();
    const gameRef = db.ref(`/votes/games/${gameId}`);
    const totalRef = db.ref('/votes/totalVotes');

    // Update game vote count
    await gameRef.set({
      voteCount: voteCount,
      percentage: percentage,
      updatedAt: new Date().toISOString()
    });

    // Also update totalVotes at root level for frontend useVotes hook
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
 * Called setelah: Creator toggle broadcasting status
 *
 * @param {boolean} isReady - Apakah sedang broadcasting/live
 * @returns {Promise<boolean>} Success status
 */
const updateBroadcastingStatus = async (isReady) => {
  const fb = getFirebaseAdmin();
  if (!fb) {
    console.warn('⚠️ Firebase not available, skipping broadcasting status update');
    return false;
  }

  try {
    // Note: Frontend useBroadcastingStatus listens to /broadcasting
    // and expects isReady property at root level
    const ref = fb.database().ref('/broadcasting');

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
 * Called setelah: Creator reset voting period
 *
 * @param {string} periodKey - Period key baru (format: YYYY-MM)
 * @returns {Promise<boolean>} Success status
 */
const resetVotingPeriod = async (periodKey) => {
  const fb = getFirebaseAdmin();
  if (!fb) {
    console.warn('⚠️ Firebase not available, skipping voting period reset');
    return false;
  }

  try {
    const ref = fb.database().ref('/votes');

    // Reset seluruh node votes dengan struktur baru
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
 * Called setelah: Reset period atau fetch games ranking
 *
 * @param {Array} games - Array of game objects
 * @param {string} periodKey - Period key saat ini
 * @returns {Promise<boolean>} Success status
 */
const updateAllGamesVotes = async (games, periodKey) => {
  const fb = getFirebaseAdmin();
  if (!fb) {
    console.warn('⚠️ Firebase not available, skipping bulk vote update');
    return false;
  }

  try {
    const db = fb.database();

    // Hitung total votes untuk persentase
    const totalVotes = games.reduce((sum, g) => sum + (g.vote_count || 0), 0);

    // Build games object
    const gamesData = {};
    games.forEach((game) => {
      const percentage = totalVotes > 0
        ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10
        : 0;

      gamesData[game.id] = {
        title: game.title,
        voteCount: game.vote_count,
        percentage: percentage,
        status: game.status
      };
    });

    // Update entire votes node at once for consistency
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

module.exports = {
  updateNextSchedule,
  updateVoteCount,
  updateBroadcastingStatus,
  resetVotingPeriod,
  updateAllGamesVotes,
  getFirebaseAdmin
};
