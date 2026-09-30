const { Schedule, User, AuditLog } = require('../models');
const firebaseDb = require('../config/firebase');
const { Op } = require('sequelize');

/**
 * Get all schedules
 * GET /api/schedules
 */
const getSchedules = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const schedules = await Schedule.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [['scheduled_at', 'ASC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      data: schedules,
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
 * Get next upcoming schedule
 * GET /api/schedules/next
 */
const getNextSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.gt]: new Date()
        },
        countdown_enabled: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [['scheduled_at', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: schedule,
      message: schedule ? 'Jadwal berikutnya berhasil diambil.' : 'Tidak ada jadwal mendatang.'
    });
  } catch (error) {
    console.error('Get next schedule error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil jadwal berikutnya.'
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
      data: schedule,
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
      status
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
      status
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal baru ditambahkan',
      sub_detail: title
    });

    // Update Firebase if this is the next upcoming schedule
    const nextSchedule = await getNextScheduleData();
    if (nextSchedule && nextSchedule.id === schedule.id) {
      await firebaseDb.updateNextSchedule(schedule);
    }

    return res.status(201).json({
      success: true,
      data: schedule,
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
      'countdown_enabled', 'status'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        schedule[field] = updates[field];
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
    const nextSchedule = await getNextScheduleData();
    if (nextSchedule && nextSchedule.id === schedule.id) {
      await firebaseDb.updateNextSchedule(schedule);
    }

    return res.status(200).json({
      success: true,
      data: schedule,
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

    // Update Firebase
    const nextSchedule = await getNextScheduleData();
    if (nextSchedule) {
      await firebaseDb.updateNextSchedule(nextSchedule);
    } else {
      // Clear the next schedule in Firebase
      await firebaseDb.updateNextSchedule(null);
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
const getNextScheduleData = async () => {
  return await Schedule.findOne({
    where: {
      status: 'upcoming',
      scheduled_at: {
        [Op.gt]: new Date()
      },
      countdown_enabled: true
    },
    order: [['scheduled_at', 'ASC']]
  });
};

module.exports = {
  getSchedules,
  getNextSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
