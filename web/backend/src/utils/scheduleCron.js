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
const STREAM_DURATION_HOURS = 10;

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
      const oldStatus = schedule.status;
      schedule.status = 'live';
      await schedule.save();
      changes.toLive++;

      console.log(`✅ Schedule LIVE: "${schedule.title}" (ID: ${schedule.id}, Game: "${schedule.game_category}")`);

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
    const streamCutoffTime = new Date(now.getTime() - STREAM_DURATION_HOURS * 60 * 60 * 1000);
    console.log(`[Cron] Part 2: Archive cutoff time: ${streamCutoffTime.toISOString()} (${STREAM_DURATION_HOURS} hours ago)`);

    const schedulesToArchive = await Schedule.findAll({
      where: {
        status: 'live',
        scheduled_at: {
          [Op.lte]: streamCutoffTime
        }
      }
    });

    console.log(`[Cron] Part 2: Found ${schedulesToArchive.length} schedules to archive to DONE`);

    for (const schedule of schedulesToArchive) {
      schedule.status = 'done';
      await schedule.save();
      changes.toDone++;

      console.log(`📁 Schedule DONE: "${schedule.title}" (ID: ${schedule.id}, Game: "${schedule.game_category}")`);

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
