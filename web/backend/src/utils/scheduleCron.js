/**
 * Schedule Cron Jobs
 *
 * Automatically update schedule statuses based on time:
 * - upcoming → live: when scheduled_at <= now
 * - live → done: when live for more than STREAM_DURATION_HOURS
 *
 * Also auto-update game statuses:
 * - When schedule goes live → game status becomes 'playing'
 * - When schedule goes done → game status becomes 'done'
 */

const { Schedule, Game } = require('../models');
const { updateNextSchedule } = require('./firebase.helper');
const { Op } = require('sequelize');

// Stream duration before auto-archive (in hours)
const STREAM_DURATION_HOURS = 5;

/**
 * Find game by title that is in 'accepted' or 'playing' status
 * @param {string} gameTitle - Game title to search
 * @returns {Promise<Game|null>}
 */
const findGameByTitle = async (gameTitle) => {
  if (!gameTitle) return null;

  // First try to find exact match in accepted or playing status
  let game = await Game.findOne({
    where: {
      title: gameTitle,
      status: { [Op.in]: ['accepted', 'playing'] }
    }
  });

  // If not found, try partial match
  if (!game) {
    game = await Game.findOne({
      where: {
        title: { [Op.like]: `%${gameTitle}%` },
        status: { [Op.in]: ['accepted', 'playing'] }
      }
    });
  }

  return game;
};

/**
 * Update schedule statuses AND game statuses automatically
 *
 * Logic:
 * 1. upcoming → live: when scheduled_at <= now
 * 2. When schedule goes live → game status becomes 'playing'
 * 3. live → done: when live for more than STREAM_DURATION_HOURS
 * 4. When schedule goes done → game status becomes 'done'
 */
const updateScheduleStatuses = async () => {
  try {
    const now = new Date();
    let changes = { toLive: 0, toDone: 0, gamePlaying: 0, gameDone: 0 };

    // Track which games have been updated to prevent duplicate updates in same cron run
    // Key: game title, Value: 'playing' or 'done'
    const gamesUpdatedThisRun = new Map();

    // Track which schedules were just changed to 'live' in this cron run
    // Key: schedule ID, Value: true
    // These will be skipped by Part 2 to ensure proper state transition
    const justWentLiveThisRun = new Set();

    // ====== Part 1: upcoming → live ======
    const schedulesToGoLive = await Schedule.findAll({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.lte]: now
        }
      }
    });

    console.log(`[Cron] Part 1: Found ${schedulesToGoLive.length} schedules to go LIVE`);

    for (const schedule of schedulesToGoLive) {
      // Set live_started_at to now (when stream actually starts)
      const liveStartTime = new Date();
      schedule.status = 'live';
      schedule.live_started_at = liveStartTime;

      // Calculate auto_done_at (5 hours from now)
      const autoDoneTime = new Date(liveStartTime.getTime() + STREAM_DURATION_HOURS * 60 * 60 * 1000);
      schedule.auto_done_at = autoDoneTime;

      await schedule.save();
      changes.toLive++;

      console.log(`✅ Schedule LIVE: "${schedule.title}" (ID: ${schedule.id})`);
      console.log(`   📺 Stream started at: ${liveStartTime.toISOString()}`);
      console.log(`   ⏰ Auto-done scheduled at: ${autoDoneTime.toISOString()}`);

      // Mark this schedule as just went live - skip in Part 2 this run
      justWentLiveThisRun.add(schedule.id);

      // Auto-update game status to 'playing'
      // Skip if already updated in this cron run (prevents race condition)
      if (gamesUpdatedThisRun.has(schedule.game_category)) {
        console.log(`[Cron] Game "${schedule.game_category}" already updated this run, skipping`);
        await updateNextSchedule(schedule);
        continue;
      }

      const game = await findGameByTitle(schedule.game_category);
      if (game) {
        console.log(`[Cron] Game found: "${game.title}", current status: "${game.status}"`);

        if (game.status === 'accepted') {
          game.status = 'playing';
          await game.save();
          changes.gamePlaying++;
          gamesUpdatedThisRun.set(schedule.game_category, 'playing');
          console.log(`🎮 Game PLAYING: "${game.title}" (ID: ${game.id})`);
        } else {
          console.log(`[Cron] Game status is "${game.status}", skipping update to playing`);
        }
      } else {
        console.log(`[Cron] No game found for category: "${schedule.game_category}"`);
      }

      // Update Firebase for real-time sync
      await updateNextSchedule(schedule);
    }

    // ====== Part 2: live → done ======
    // Find schedules that should be archived:
    // - auto_done_at has passed (stream ran for 5 hours), OR
    // - live_started_at + 5 hours has passed (for schedules without auto_done_at)
    console.log(`[Cron] Part 2: Checking for schedules to archive (current time: ${now.toISOString()})`);

    // Get all live schedules
    const liveSchedules = await Schedule.findAll({
      where: {
        status: 'live'
      }
    });

    // Filter: schedule if auto_done_at has passed OR manually_ended is true
    const schedulesToArchive = liveSchedules.filter(schedule => {
      // Skip if manually ended
      if (schedule.manually_ended) {
        console.log(`[Cron] Schedule "${schedule.title}" (ID: ${schedule.id}) was manually ended, skipping`);
        return false;
      }

      // Archive if auto_done_at has passed
      if (schedule.auto_done_at && new Date(schedule.auto_done_at) <= now) {
        console.log(`[Cron] Schedule "${schedule.title}" (ID: ${schedule.id}): auto_done_at (${schedule.auto_done_at}) has passed`);
        return true;
      }

      // Fallback: if no auto_done_at, use live_started_at + 5 hours
      if (schedule.live_started_at) {
        const fallbackCutoff = new Date(new Date(schedule.live_started_at).getTime() + STREAM_DURATION_HOURS * 60 * 60 * 1000);
        if (fallbackCutoff <= now) {
          console.log(`[Cron] Schedule "${schedule.title}" (ID: ${schedule.id}): fallback cutoff (${fallbackCutoff.toISOString()}) has passed`);
          return true;
        }
      }

      return false;
    });

    console.log(`[Cron] Part 2: Found ${schedulesToArchive.length} schedules to archive to DONE`);

    for (const schedule of schedulesToArchive) {
      // Skip schedules that just went live this cron run (prevents skip from playing → done)
      if (justWentLiveThisRun.has(schedule.id)) {
        console.log(`[Cron] Schedule "${schedule.title}" (ID: ${schedule.id}) just went live this run, skipping archive`);
        continue;
      }

      // Skip if manually ended
      if (schedule.manually_ended) {
        console.log(`[Cron] Schedule "${schedule.title}" (ID: ${schedule.id}) was manually ended, skipping`);
        continue;
      }

      schedule.status = 'done';
      await schedule.save();
      changes.toDone++;

      console.log(`📁 Schedule DONE: "${schedule.title}" (ID: ${schedule.id}, Game: "${schedule.game_category}")`);
      console.log(`   ⏱️  Stream duration: ${schedule.live_started_at ? Math.round((new Date() - new Date(schedule.live_started_at)) / 60000) + ' minutes' : 'unknown'}`);

      // Auto-update game status to 'done'
      // Skip if already updated in this cron run (prevents race condition)
      if (gamesUpdatedThisRun.has(schedule.game_category)) {
        console.log(`[Cron] Game "${schedule.game_category}" already updated this run, skipping`);
        continue;
      }

      const game = await findGameByTitle(schedule.game_category);
      if (game) {
        console.log(`[Cron] Game found for archive: "${game.title}", current status: "${game.status}"`);

        if (game.status === 'playing') {
          game.status = 'done';
          await game.save();
          changes.gameDone++;
          gamesUpdatedThisRun.set(schedule.game_category, 'done');
          console.log(`✅ Game DONE: "${game.title}" (ID: ${game.id})`);
        } else {
          console.log(`[Cron] Game status is "${game.status}", skipping update to done`);
        }
      } else {
        console.log(`[Cron] No game found for archive category: "${schedule.game_category}"`);
      }
    }

    // Log summary
    if (changes.toLive > 0 || changes.toDone > 0) {
      console.log(`📊 Auto-update: ${changes.toLive} → LIVE, ${changes.toDone} → DONE | Games: ${changes.gamePlaying} → PLAYING, ${changes.gameDone} → DONE`);
    }

    return changes;
  } catch (error) {
    console.error('❌ Error in schedule auto-status update:', error.message);
    return { toLive: 0, toDone: 0, gamePlaying: 0, gameDone: 0 };
  }
};

/**
 * Initialize and start the schedule status cron job
 *
 * @param {Object} options - Configuration options
 * @param {number} options.intervalMinutes - Check interval in minutes (default: 1)
 */
const startScheduleCron = (options = {}) => {
  const intervalMinutes = options.intervalMinutes || 1;
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`⏰ Schedule status cron job starting (checks every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''})`);

  // Initial check
  updateScheduleStatuses();

  // Set interval
  const intervalId = setInterval(updateScheduleStatuses, intervalMs);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('⏰ Schedule cron job stopping...');
    clearInterval(intervalId);
  });

  process.on('SIGINT', () => {
    console.log('⏰ Schedule cron job stopping...');
    clearInterval(intervalId);
  });

  return intervalId;
};

module.exports = {
  updateScheduleStatuses,
  startScheduleCron
};
