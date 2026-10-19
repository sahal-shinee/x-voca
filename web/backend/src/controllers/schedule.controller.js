const { Schedule, User, AuditLog } = require('../models');
const { updateNextSchedule } = require('../utils/firebase.helper');
const { Op } = require('sequelize');

/**
 * Convert UTC date to WIB (UTC+7)
 */
const toWIB = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

/**
 * Add scheduled_at_wib to schedule object
 */
const addWIBField = (schedule) => {
  if (!schedule) return null;
  const data = schedule.toJSON ? schedule.toJSON() : { ...schedule };
  data.scheduled_at_wib = toWIB(data.scheduled_at);
  return data;
};

/**
 * Add scheduled_at_wib to array of schedules
 */
const addWIBFieldToArray = (schedules) => {
  return schedules.map(addWIBField);
};

/**
 * Get all schedules
 * GET /api/schedules
 * Query params: status, limit, page
 */
const getSchedules = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [['scheduled_at', 'ASC']],
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({
      success: true,
      data: {
        schedules: addWIBFieldToArray(schedules),
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      },
      message: 'Daftar jadwal berhasil diambil.'
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil jadwal.'
    });
  }
};

/**
 * Get next schedule - prioritizes LIVE streams over upcoming
 * GET /api/schedules/next
 * Returns live stream if exists, otherwise upcoming schedule
 */
const getNextSchedule = async (req, res) => {
  try {
    const now = new Date();
    console.log('[getNextSchedule] Request received at:', now.toISOString());

    // Priority 1: Check for LIVE streams first
    let schedule = await Schedule.findOne({
      where: {
        status: 'live'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [['scheduled_at', 'DESC']] // Most recent live stream first
    });

    // Priority 2: If no live, get next upcoming schedule
    if (!schedule) {
      schedule = await Schedule.findOne({
        where: {
          status: 'upcoming',
          scheduled_at: {
            [Op.gt]: now
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }],
        order: [['scheduled_at', 'ASC']]
      });
    }

    console.log('[getNextSchedule] Query result:', schedule ? {
      id: schedule.id,
      title: schedule.title,
      scheduled_at: schedule.scheduled_at,
      status: schedule.status,
      countdown_enabled: schedule.countdown_enabled
    } : 'No schedule found');

    const responseData = schedule ? addWIBField(schedule) : null;
    console.log('[getNextSchedule] Response data:', responseData ? {
      id: responseData.id,
      title: responseData.title,
      scheduled_at: responseData.scheduled_at,
      scheduled_at_wib: responseData.scheduled_at_wib,
      status: responseData.status
    } : null);

    return res.status(200).json({
      success: true,
      data: responseData,
      message: schedule ? 'Jadwal ditemukan.' : 'Tidak ada jadwal upcoming.'
    });
  } catch (error) {
    console.error('Get next schedule error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil jadwal.'
    });
  }
};

/**
 * Get schedule by ID
 * GET /api/schedules/:id
 */
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }]
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Jadwal tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: addWIBField(schedule),
      message: 'Jadwal berhasil diambil.'
    });
  } catch (error) {
    console.error('Get schedule by ID error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil jadwal.'
    });
  }
};

/**
 * Create new schedule
 * POST /api/schedules
 */
const createSchedule = async (req, res) => {
  try {
    const {
      title,
      game_category,
      scheduled_at,
      description,
      youtube_url,
      thumbnail_url,
      stream_platform,
      countdown_enabled,
      status,
      collab_guest,
      collab_social
    } = req.body;

    // Validate required fields
    if (!title || !scheduled_at) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul dan waktu jadwal wajib diisi.'
      });
    }

    const schedule = await Schedule.create({
      user_id: req.userId,
      title,
      game_category,
      scheduled_at: new Date(scheduled_at),
      description,
      youtube_url,
      thumbnail_url,
      stream_platform,
      countdown_enabled,
      status,
      collab_guest: collab_guest || null,
      collab_social: collab_social || null
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal baru ditambahkan',
      sub_detail: title
    });

    // Update Firebase if this is the next upcoming schedule
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData && nextScheduleData.id === schedule.id) {
      await updateNextSchedule(schedule);
    }

    return res.status(201).json({
      success: true,
      data: addWIBField(schedule),
      message: 'Jadwal berhasil dibuat.'
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat membuat jadwal.'
    });
  }
};

/**
 * Update schedule
 * PATCH /api/schedules/:id
 */
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Jadwal tidak ditemukan.'
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'game_category', 'scheduled_at', 'description',
      'youtube_url', 'thumbnail_url', 'stream_platform',
      'countdown_enabled', 'status',
      'collab_guest', 'collab_social'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'scheduled_at') {
          schedule[field] = new Date(updates[field]);
        } else {
          schedule[field] = updates[field];
        }
      }
    });

    await schedule.save();

    // Create audit log
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal diperbarui',
      sub_detail: schedule.title
    });

    // Update Firebase if this schedule is the next one
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData && nextScheduleData.id === schedule.id) {
      await updateNextSchedule(schedule);
    }

    return res.status(200).json({
      success: true,
      data: addWIBField(schedule),
      message: 'Jadwal berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memperbarui jadwal.'
    });
  }
};

/**
 * Delete schedule
 * DELETE /api/schedules/:id
 */
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Jadwal tidak ditemukan.'
      });
    }

    const scheduleTitle = schedule.title;
    await schedule.destroy();

    // Create audit log
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal dihapus',
      sub_detail: scheduleTitle
    });

    // Update Firebase with next schedule
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData) {
      await updateNextSchedule(nextScheduleData);
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Jadwal berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat menghapus jadwal.'
    });
  }
};

// Helper function to get next schedule data (for Firebase)
// Prioritizes LIVE streams, then upcoming
const getNextScheduleData = async () => {
  // Priority 1: Check for LIVE streams first
  let schedule = await Schedule.findOne({
    where: {
      status: 'live'
    },
    order: [['scheduled_at', 'DESC']]
  });

  // Priority 2: If no live, get next upcoming
  if (!schedule) {
    schedule = await Schedule.findOne({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.gt]: new Date()
        }
      },
      order: [['scheduled_at', 'ASC']]
    });
  }

  return schedule;
};

module.exports = {
  getSchedules,
  getNextSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
