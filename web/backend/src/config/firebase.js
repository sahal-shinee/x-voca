/**
 * Firebase Config - Re-exports from utils/firebase.helper.js
 *
 * NOTE: Main Firebase logic ada di src/utils/firebase.helper.js
 * File ini ada untuk backward compatibility dengan kode yang import dari './config/firebase'
 */

const firebaseHelper = require('../utils/firebase.helper');

// Re-export semua fungsi dari firebase.helper
module.exports = {
  // Firebase Admin instance
  getAdmin: firebaseHelper.getFirebaseAdmin,

  // Schedule operations
  updateNextSchedule: firebaseHelper.updateNextSchedule,

  // Vote operations
  updateVoteCount: firebaseHelper.updateVoteCount,
  updateVotingPeriod: firebaseHelper.updateVotingPeriod,
  resetVotingPeriod: firebaseHelper.resetVotingPeriod,
  updateAllGamesVotes: firebaseHelper.updateAllGamesVotes,

  // Broadcasting operations
  updateBroadcasting: firebaseHelper.updateBroadcastingStatus
};