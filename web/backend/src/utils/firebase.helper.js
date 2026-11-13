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
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

// Debug Firebase admin module loading
console.log('[Firebase] Module loaded:', !!adminModule);
console.log('[Firebase] Admin module keys:', adminModule ? Object.keys(adminModule).slice(0, 10) : 'none');
console.log('[Firebase] Has apps:', admin?.apps !== undefined);
console.log('[Firebase] Apps type:', typeof admin?.apps);

// Lazy initialization untuk Firebase Admin SDK
let firebaseAdmin = null;
let rtdbApp = null;
let fcmApp = null;
let initializationAttempted = false;

const getCredentials = () => {
  let primaryKey = null;
  let rtdbKey = null;

  // 1. Production/Railway: Membaca teks JSON dari environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
      let cleanValue = envValue;
      if (typeof envValue === 'string' && envValue.includes('\\n')) {
        cleanValue = envValue.replace(/\\n/g, '\n');
      }
      primaryKey = JSON.parse(cleanValue);
    } catch (err) {
      console.error('❌ Firebase: Gagal parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  }

  // 2. Baca file lokal
  const serviceAccountKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  const legacyKeyPath = path.resolve(__dirname, '../../firebase-service-account.json');

  if (!primaryKey && fs.existsSync(serviceAccountKeyPath)) {
    try {
      primaryKey = require(serviceAccountKeyPath);
    } catch (_) {}
  }
  if (!primaryKey && fs.existsSync(legacyKeyPath)) {
    try {
      primaryKey = require(legacyKeyPath);
    } catch (_) {}
  }

  // RTDB key (khusus jika xvoca-project punya database terpisah)
  if (fs.existsSync(legacyKeyPath)) {
    try {
      rtdbKey = require(legacyKeyPath);
    } catch (_) {}
  }
  if (!rtdbKey) {
    rtdbKey = primaryKey;
  }

  return { primaryKey, rtdbKey };
};

const getFirebaseAdmin = () => {
  if (firebaseAdmin) return firebaseAdmin;
  if (initializationAttempted) return firebaseAdmin;
  initializationAttempted = true;

  if (!admin) {
    console.error('⚠️ Firebase Admin SDK not available');
    return null;
  }

  try {
    const { primaryKey, rtdbKey } = getCredentials();

    if (!primaryKey?.private_key && !rtdbKey?.private_key) {
      console.warn('⚠️ Firebase: Tidak ada service account credentials.');
      return null;
    }

    const certCredential = (acc) =>
      admin.credential?.cert
        ? admin.credential.cert(acc)
        : (admin.cert ? admin.cert(acc) : adminModule.cert(acc));

    // 1. Inisialisasi default / FCM app
    if (primaryKey?.private_key) {
      const existing = admin.apps?.find((a) => a.name === '[DEFAULT]');
      fcmApp = existing || admin.initializeApp({
        credential: certCredential(primaryKey),
        projectId: primaryKey.project_id || 'x-voca'
      });
      firebaseAdmin = fcmApp;
      console.log(`✅ Firebase FCM initialized for project: ${primaryKey.project_id || 'x-voca'}`);
    }

    // 2. Inisialisasi Realtime Database app
    if (rtdbKey?.private_key) {
      const rtdbUrl =
        process.env.FIREBASE_DATABASE_URL && !process.env.FIREBASE_DATABASE_URL.includes('xvoca-project.firebaseio.com')
          ? process.env.FIREBASE_DATABASE_URL
          : 'https://xvoca-project-default-rtdb.asia-southeast1.firebasedatabase.app';

      const existingRtdb = admin.apps?.find((a) => a.name === 'xvoca-rtdb');
      rtdbApp = existingRtdb || admin.initializeApp({
        credential: certCredential(rtdbKey),
        databaseURL: rtdbUrl
      }, 'xvoca-rtdb');
      console.log(`✅ Firebase RTDB initialized for URL: ${rtdbUrl}`);
    } else {
      rtdbApp = fcmApp;
    }

    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    return null;
  }
};

/**
 * Get Realtime Database instance safely
 */
const getDb = () => {
  getFirebaseAdmin();
  const targetApp = rtdbApp || fcmApp;
  if (!targetApp) return null;
  try {
    return getDatabase(targetApp);
  } catch (err) {
    console.error('❌ Firebase getDb error:', err.message);
    return null;
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

/**
 * Subscribe a Web/Mobile FCM registration token to a topic
 * @param {string} token - FCM registration token
 * @param {string} topic - Topic name (e.g. 'stream_alerts', 'creator_alerts')
 */
const subscribeTokenToTopic = async (token, topic = 'stream_alerts') => {
  try {
    const app = getFirebaseAdmin();
    if (!app) {
      return { success: false, message: 'Firebase Admin SDK belum dikonfigurasi.' };
    }
    const messaging = typeof app.messaging === 'function' ? app.messaging() : getMessaging(app);
    const response = await messaging.subscribeToTopic(token, topic);
    console.log(`✅ FCM: Subscribed token to topic "${topic}" (successCount: ${response.successCount})`);
    return { success: true, response };
  } catch (error) {
    console.error(`❌ FCM subscribeTokenToTopic(${topic}) error:`, error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send push notification via FCM to a topic
 * @param {string} topic - Target topic ('stream_alerts' | 'creator_alerts')
 * @param {{ title: string, body: string, data?: Record<string, string> }} payload
 */
const sendTopicNotification = async (topic, { title, body, data = {} }) => {
  try {
    const app = getFirebaseAdmin();
    if (!app) {
      console.warn(`⚠️ FCM: Skip topic "${topic}" notification (Firebase Admin belum siap).`);
      return false;
    }

    const messaging = typeof app.messaging === 'function' ? app.messaging() : getMessaging(app);
    const stringData = Object.fromEntries(
      Object.entries(data || {}).map(([k, v]) => [String(k), String(v ?? '')])
    );

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: stringData,
      android: {
        priority: 'high',
        notification: {
          channelId: 'xvoca_high_importance_channel',
          priority: 'max',
          sound: 'default',
          defaultSound: true,
          visibility: 'public',
        },
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title,
          body,
          icon: '/images/logo_xion.png',
          badge: '/images/logo_xion.png',
        },
        fcmOptions: {
          link: stringData.url || '/',
        },
      },
    };

    const messageId = await messaging.send(message);
    console.log(`✅ FCM: Sent notification to topic "${topic}" (ID: ${messageId})`);

    // Synchronously write to Realtime Database so Web & Mobile in-app bells receive it in real time
    try {
      await pushNotification({
        userId: 'default',
        type: stringData.type || (topic === 'stream_alerts' ? 'BROADCASTING_START' : 'SYSTEM_UPDATE'),
        title,
        message: body,
        link: stringData.url || null
      });
    } catch (pushErr) {
      console.warn('Realtime database pushNotification warning:', pushErr.message);
    }

    return true;
  } catch (error) {
    console.error(`❌ FCM sendTopicNotification(${topic}) error:`, error.message);
    return false;
  }
};

/**
 * Get all notifications from Firebase RTDB (with sorting by newest)
 */
const getNotificationsFromDb = async (userId = 'default', limit = 50) => {
  const db = getDb();
  if (!db) return [];
  try {
    const snapshot = await db.ref(`notifications/${userId}`).limitToLast(limit).once('value');
    const val = snapshot.val();
    if (!val) return [];
    return Object.entries(val).map(([id, notif]) => ({
      id,
      ...notif,
      createdAt: notif.createdAt || Date.now()
    })).sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('getNotificationsFromDb error:', err.message);
    return [];
  }
};

/**
 * Mark a single notification as read
 */
const markNotificationRead = async (notificationId, userId = 'default') => {
  const db = getDb();
  if (!db) return false;
  try {
    await db.ref(`notifications/${userId}/${notificationId}`).update({
      read: true,
      readAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error('markNotificationRead error:', err.message);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsRead = async (userId = 'default') => {
  const db = getDb();
  if (!db) return false;
  try {
    const snapshot = await db.ref(`notifications/${userId}`).once('value');
    const val = snapshot.val();
    if (!val) return true;
    const updates = {};
    Object.keys(val).forEach((k) => {
      updates[`notifications/${userId}/${k}/read`] = true;
      updates[`notifications/${userId}/${k}/readAt`] = Date.now();
    });
    await db.ref().update(updates);
    return true;
  } catch (err) {
    console.error('markAllNotificationsRead error:', err.message);
    return false;
  }
};

/**
 * Delete a single notification
 */
const deleteNotificationById = async (notificationId, userId = 'default') => {
  const db = getDb();
  if (!db) return false;
  try {
    await db.ref(`notifications/${userId}/${notificationId}`).remove();
    return true;
  } catch (err) {
    console.error('deleteNotificationById error:', err.message);
    return false;
  }
};

/**
 * Clear all notifications
 */
const clearAllNotifications = async (userId = 'default') => {
  const db = getDb();
  if (!db) return false;
  try {
    await db.ref(`notifications/${userId}`).remove();
    return true;
  } catch (err) {
    console.error('clearAllNotifications error:', err.message);
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
  subscribeTokenToTopic,
  sendTopicNotification,
  getNotificationsFromDb,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  clearAllNotifications,
  getFirebaseAdmin,
  getDb
};
