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
const STREAM_DURATION_HOURS = 2;

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

    // ====== Part 1: upcoming → live ======
    const schedulesToGoLive = await Schedule.findAll({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.lte]: now
        }
      }
    });

    for (const schedule of schedulesToGoLive) {
      schedule.status = 'live';
      await schedule.save();
      changes.toLive++;

      console.log(`✅ Schedule auto-updated to LIVE: "${schedule.title}" (ID: ${schedule.id})`);

      // Auto-update game status to 'playing'
      const game = await findGameByTitle(schedule.game_category);
      if (game && game.status === 'accepted') {
        game.status = 'playing';
        await game.save();
        changes.gamePlaying++;
        console.log(`🎮 Game auto-updated to PLAYING: "${game.title}" (ID: ${game.id})`);
      }

      // Update Firebase for real-time sync
      await updateNextSchedule(schedule);
    }

    // ====== Part 2: live → done ======
    const streamCutoffTime = new Date(now.getTime() - STREAM_DURATION_HOURS * 60 * 60 * 1000);

    const schedulesToArchive = await Schedule.findAll({
      where: {
        status: 'live',
        scheduled_at: {
          [Op.lte]: streamCutoffTime
        }
      }
    });

    for (const schedule of schedulesToArchive) {
      schedule.status = 'done';
      await schedule.save();
      changes.toDone++;

      console.log(`📁 Schedule auto-archived to DONE: "${schedule.title}" (ID: ${schedule.id})`);

      // Auto-update game status to 'done'
      const game = await findGameByTitle(schedule.game_category);
      if (game && game.status === 'playing') {
        game.status = 'done';
        await game.save();
        changes.gameDone++;
        console.log(`✅ Game auto-updated to DONE: "${game.title}" (ID: ${game.id})`);
      }
    }

    // Log summary
    if (changes.toLive > 0 || changes.toDone > 0) {
      console.log(`📊 Auto-update complete: ${changes.toLive} schedules → LIVE, ${changes.toDone} schedules → DONE`);
      if (changes.gamePlaying > 0 || changes.gameDone > 0) {
        console.log(`🎮 Game status updated: ${changes.gamePlaying} → PLAYING, ${changes.gameDone} → DONE`);
      }
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
