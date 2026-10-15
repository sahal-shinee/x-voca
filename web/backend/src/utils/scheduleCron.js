/**
 * Schedule Cron Jobs
 *
 * Automatically update schedule statuses based on time:
 * - upcoming → live: when scheduled_at <= now
 * - live stays live until admin manually changes to done
 */

const { Schedule } = require('../models');
const { updateNextSchedule } = require('./firebase.helper');
const { Op } = require('sequelize');

/**
 * Update schedule statuses automatically
 *
 * Logic:
 * 1. Find all 'upcoming' schedules where scheduled_at <= now
 * 2. Update them to 'live'
 * 3. Also update Firebase for real-time sync
 */
const updateScheduleStatuses = async () => {
  try {
    const now = new Date();

    // Find schedules that should be 'live' (scheduled_at has passed)
    const schedulesToGoLive = await Schedule.findAll({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.lte]: now
        }
      }
    });

    // Update each schedule to 'live'
    for (const schedule of schedulesToGoLive) {
      schedule.status = 'live';
      await schedule.save();

      console.log(`✅ Schedule auto-updated to LIVE: "${schedule.title}" (ID: ${schedule.id})`);

      // Update Firebase for real-time sync
      await updateNextSchedule(schedule);
    }

    if (schedulesToGoLive.length > 0) {
      console.log(`📊 Auto-update complete: ${schedulesToGoLive.length} schedules changed to LIVE`);
    }

    return schedulesToGoLive.length;
  } catch (error) {
    console.error('❌ Error in schedule auto-status update:', error.message);
    return 0;
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
