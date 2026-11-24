/**
 * ============================================================================
 * FILE: web/backend/src/controllers/schedule.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali agenda siaran streaming mingguan Xion Regalia.
 * Mengatur:
 * 1. Pengambilan jadwal siaran dengan filter status ('upcoming', 'live', 'done').
 * 2. Ekstraksi otomatis thumbnail YouTube dari tautan streaming.
 * 3. Konversi zona waktu UTC ke Waktu Indonesia Barat (WIB / UTC+7).
 * 4. Pembuatan jadwal baru, pembaruan status live, dan penghapusan jadwal.
 * 5. Fitur 'Archive Schedule': menyalin jadwal yang selesai langsung ke Content Guide.
 * 6. Lazy cron throttle untuk sinkronisasi otomatis jadwal live di lingkungan serverless.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Schedule`, `User`, `Game`, `AuditLog` dari `../models`.
 * - Mengimpor helper Firebase dari `../utils/firebase.helper` untuk broadcast status.
 * - Mengimpor `updateScheduleStatuses` dari `../utils/scheduleCron`.
 * - Dipanggil oleh `src/routes/schedule.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Jadwal disimpan dalam format UTC standar di database, lalu dikonversi ke WIB
 *   sehingga akurat diakses dari wilayah mana pun."
 * - "Saat siaran dimulai, sistem secara otomatis memperbarui banner siaran di Firebase RTDB."
 * ============================================================================
 */

const { Schedule, User, Game, AuditLog } = require('../models');
const { updateNextSchedule, clearNextSchedule, updateBroadcastingStatus, sendTopicNotification } = require('../utils/firebase.helper');
const { updateScheduleStatuses } = require('../utils/scheduleCron');
const { Op } = require('sequelize');

/**
 * Ekstrak video ID dari URL YouTube dan kembalikan URL thumbnail mqdefault.
 * Mendukung berbagai format link: youtube.com/watch?v=ID, youtube.com/live/ID, youtu.be/ID, youtube.com/embed/ID
 */
const deriveYouTubeThumbnail = (youtubeUrl) => {
  // Jika URL tidak disediakan, kembalikan null
  if (!youtubeUrl) return null;
  try {
    // Pola regex untuk mencocokkan berbagai variasi URL YouTube yang sering diinput pengguna
    const patterns = [
      /youtu\.be\/([^?&#]+)/,
      /youtube\.com\/live\/([^?&#]+)/,
      /youtube\.com\/embed\/([^?&#]+)/,
      /[?&]v=([^&#]+)/,
    ];
    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern);
      // Jika ID video (11 karakter) ditemukan, buat URL thumbnail statis beresolusi sedang (mqdefault)
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
      }
    }
  } catch {
    // Abaikan jika terjadi parsing error pada URL yang cacat
  }
  return null;
};

// Lazy Cron Throttle (berjalan maksimal sekali setiap 30 detik pada request serverless)
// Penting di lingkungan hosting seperti Vercel di mana tidak ada background process daemon yang standby terus-menerus
let lastLazyCronRun = 0;
const runLazyCronCheck = async () => {
  const now = Date.now();
  // Hanya jalankan sync jika selisih waktu dari pemanggilan terakhir sudah lebih dari 30 detik (30000 ms)
  if (now - lastLazyCronRun > 30000) {
    lastLazyCronRun = now;
    try {
      // Periksa dan perbarui status jadwal yang sudah melewati jam tayang (upcoming -> live -> done)
      await updateScheduleStatuses();
    } catch (err) {
      console.error('[LazyCron] Auto-sync error:', err.message);
    }
  }
};

/**
 * Konversi tanggal UTC standar database ke Waktu Indonesia Barat (WIB / UTC+7)
 */
const toWIB = (date) => {
  if (!date) return null;
  // Format tanggal sesuai zona waktu Jakarta (WIB) dengan locale Indonesia
  return new Date(date).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

/**
 * Tambahkan properti scheduled_at_wib ke objek jadwal tunggal untuk kemudahan konsumsi frontend
 */
const addWIBField = (schedule) => {
  if (!schedule) return null;
  // Konversi model instance Sequelize ke plain JSON object agar aman dimanipulasi
  const data = schedule.toJSON ? schedule.toJSON() : { ...schedule };
  // Tambahkan field kalkulasi WIB
  data.scheduled_at_wib = toWIB(data.scheduled_at);
  return data;
};

/**
 * Tambahkan properti scheduled_at_wib ke seluruh elemen array jadwal
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
    // Sinkronisasi status jadwal secara otomatis sebelum query dijalankan (Lazy Cron)
    await runLazyCronCheck();

    // Ambil parameter paginasi dan filter dari query string
    const { status, limit = 10, page = 1 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // Hitung offset database: (page - 1) * limit
    const offset = (pageNum - 1) * limitNum;

    // Filter status jika diminta oleh client
    const where = {};
    if (status) {
      if (status === 'archived' || status === 'done') {
        // Gabungkan status selesai dan arsip
        where.status = { [Op.in]: ['done', 'archived'] };
      } else {
        where.status = status;
      }
    }

    // Eksekusi query dengan paginasi dan join ke tabel User (pembuat jadwal)
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url'] // Batasi field user demi keamanan & performa
      }],
      order: [['scheduled_at', 'ASC']], // Jadwal terdekat diletakkan di urutan teratas
      limit: limitNum,
      offset: offset
    });

    // Kembalikan data yang telah dilengkapi informasi jam WIB beserta metadata paginasi
    return res.status(200).json({
      success: true,
      data: {
        schedules: addWIBFieldToArray(schedules),
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum) // Hitung total halaman pembulatan ke atas
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
 * Get next schedule - memprioritaskan jadwal yang berstatus LIVE dibanding upcoming
 * GET /api/schedules/next
 * Mengembalikan jadwal siaran langsung jika ada, atau jadwal yang akan datang terdekat
 */
const getNextSchedule = async (req, res) => {
  try {
    // Sinkronisasi status jadwal secara otomatis sebelum mengambil jadwal berikutnya
    await runLazyCronCheck();

    const now = new Date();
    console.log('[getNextSchedule] Request received at:', now.toISOString());

    // Prioritas 1: Periksa apakah ada jadwal yang sedang berstatus 'live' saat ini
    let schedule = await Schedule.findOne({
      where: {
        status: 'live' // Siaran yang sedang live diprioritaskan tampil di hero banner
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [['scheduled_at', 'DESC']] // Ambil live stream terbaru jika ada beberapa
    });

    // Prioritas 2: Jika tidak ada siaran yang sedang live, cari jadwal 'upcoming' paling dekat
    if (!schedule) {
      schedule = await Schedule.findOne({
        where: {
          status: 'upcoming',
          scheduled_at: {
            [Op.gt]: now // Waktu siaran harus lebih besar dari waktu saat ini
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }],
        order: [['scheduled_at', 'ASC']] // Urutkan tanggal terdekat (paling awal tayang)
      });
    }

    console.log('[getNextSchedule] Query result:', schedule ? {
      id: schedule.id,
      title: schedule.title,
      scheduled_at: schedule.scheduled_at,
      status: schedule.status,
      countdown_enabled: schedule.countdown_enabled
    } : 'No schedule found');

    // Format tanggal jadwal ke WIB sebelum dikirim ke response
    const responseData = schedule ? addWIBField(schedule) : null;
    if (!schedule) {
      // Jika di MySQL tidak ada live maupun upcoming stream, pastikan Firebase juga bersih dari data usang
      clearNextSchedule().catch(() => {});
    }
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

    // Validasi field wajib diisi: Judul agenda dan tanggal/jam tayang
    if (!title || !scheduled_at) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul dan waktu jadwal wajib diisi.'
      });
    }

    // Buat record jadwal baru di database MySQL melalui Sequelize ORM
    const schedule = await Schedule.create({
      user_id: req.userId, // ID admin/kreator yang terotentikasi dari JWT middleware
      title,
      game_category,
      scheduled_at: new Date(scheduled_at), // Parsing tanggal ke objek Date UTC
      description,
      youtube_url,
      // Jika thumbnail_url tidak diberikan pengguna, ekstrak otomatis dari tautan YouTube
      thumbnail_url: thumbnail_url || deriveYouTubeThumbnail(youtube_url),
      stream_platform,
      countdown_enabled,
      status,
      collab_guest: collab_guest || null,
      collab_social: collab_social || null
    });

    // Catat riwayat penambahan jadwal ke tabel AuditLog untuk transparansi keamanan sistem
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal baru ditambahkan',
      sub_detail: title
    });

    // Periksa apakah jadwal baru ini merupakan agenda siaran berikutnya yang paling dekat
    // Jika ya, sinkronkan langsung node Firebase RTDB agar penonton langsung melihatnya secara realtime
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData && nextScheduleData.id === schedule.id) {
      await updateNextSchedule(schedule);
    }

    // Kirim notifikasi push FCM ke topik 'stream_alerts' untuk memberitahu seluruh penonton yang subscribe
    try {
      const wibTime = toWIB(schedule.scheduled_at);
      await sendTopicNotification('stream_alerts', {
        title: '📅 Jadwal Stream Baru!',
        body: `${schedule.title}${wibTime ? ` • ${wibTime} WIB` : ''}`,
        data: {
          type: 'SCHEDULE_CREATED',
          scheduleId: String(schedule.id),
          url: '/#schedule'
        }
      });
    } catch (fcmErr) {
      // Gunakan catch terpisah agar kegagalan notifikasi Firebase tidak membatalkan pembuatan jadwal di MySQL
      console.warn('FCM new schedule notification skipped:', fcmErr.message);
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

    const previousStatus = schedule.status;

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

    // Auto-derive thumbnail dari youtube_url jika thumbnail_url masih kosong
    const finalYoutubeUrl = schedule.youtube_url;
    if (!schedule.thumbnail_url && finalYoutubeUrl) {
      const derived = deriveYouTubeThumbnail(finalYoutubeUrl);
      if (derived) schedule.thumbnail_url = derived;
    }

    await schedule.save();

    // Send FCM notification if status transitioned to 'live'
    if (previousStatus !== 'live' && schedule.status === 'live') {
      try {
        await sendTopicNotification('stream_alerts', {
          title: '🔴 Xion Regalia Sedang LIVE!',
          body: schedule.title || 'Yuk gabung dan nonton siaran langsung sekarang!',
          data: {
            type: 'BROADCASTING_START',
            scheduleId: String(schedule.id),
            url: '/#schedule'
          }
        });
      } catch (fcmErr) {
        console.warn('FCM live schedule notification skipped:', fcmErr.message);
      }
    }

    // Create audit log
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Jadwal diperbarui',
      sub_detail: schedule.title
    });

    // Perbarui Firebase dengan jadwal aktif/mendatang berikutnya (atau bersihkan jika tidak ada jadwal aktif)
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData) {
      await updateNextSchedule(nextScheduleData);
    } else {
      await clearNextSchedule();
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
    } else {
      await clearNextSchedule();
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

/**
 * End stream manually (admin action)
 * POST /api/admin/schedules/:id/end-stream
 */
const endStream = async (req, res) => {
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

    // Validasi pencegahan: Jangan izinkan mengakhiri jadwal yang sudah selesai
    if (schedule.status === 'done' || schedule.status === 'archived') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Jadwal sudah selesai.'
      });
    }

    // Validasi pencegahan: Jangan izinkan mengakhiri jadwal yang belum dimulai
    if (schedule.status === 'upcoming') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Jadwal belum dimulai.'
      });
    }

    // Tandai jadwal sebagai diakhiri secara manual oleh kreator/admin
    schedule.manually_ended = true;
    schedule.status = 'done';
    await schedule.save();

    // Cascading Status Update: Ubah status game terkait dari 'playing' menjadi 'done'
    // Memastikan siklus game (requested -> accepted -> playing -> done) tuntas
    const game = await Game.findOne({
      where: {
        title: schedule.game_category,
        status: 'playing'
      }
    });

    if (game) {
      game.status = 'done';
      await game.save();
      console.log(`✅ Game "${game.title}" manually ended to DONE`);
    }

    // Catat log audit aktivitas penghentian siaran manual
    await AuditLog.create({
      action_type: 'schedule_updated',
      detail: 'Siaran diakhiri manual',
      sub_detail: schedule.title
    });

    // Perbarui Firebase RTDB dengan jadwal aktif/mendatang berikutnya (atau hapus jika tidak ada lagi)
    const nextScheduleData = await getNextScheduleData();
    if (nextScheduleData) {
      await updateNextSchedule(nextScheduleData);
    } else {
      await clearNextSchedule();
    }

    // Reset status live kreator di Firebase RTDB menjadi false agar banner live di frontend mati
    await updateBroadcastingStatus(false);

    return res.status(200).json({
      success: true,
      data: addWIBField(schedule),
      message: 'Siaran berhasil diakhiri.'
    });
  } catch (error) {
    console.error('End stream error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengakhiri siaran.'
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
  deleteSchedule,
  endStream
};
