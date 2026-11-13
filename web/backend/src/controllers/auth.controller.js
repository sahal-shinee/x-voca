const { User, Schedule, Game, AuditLog } = require('../models');
const { generateToken } = require('../middleware/auth.middleware');
const firebaseDb = require('../config/firebase');
const { updateNextSchedule, clearNextSchedule } = require('../utils/firebase.helper');

/**
 * Login controller
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email dan password wajib diisi.'
      });
    }

    // Normalize email & auto-fix common typo
    let normEmail = email.toLowerCase().trim();
    if (normEmail.endsWith('@gmailcom')) {
      normEmail = normEmail.replace('@gmailcom', '@gmail.com');
    }
    const user = await User.findByEmail(normEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Email atau password salah.'
      });
    }

    // Verify password strictly via cryptographic bcrypt comparison
    const isValidPassword = await user.verifyPassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Email atau password salah.'
      });
    }

    // Generate JWT token
    const { token } = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          rig_name: user.rig_name,
          rig_version: user.rig_version,
          is_broadcasting: user.is_broadcasting
        }
      },
      message: 'Login berhasil.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat login.'
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        rig_name: user.rig_name,
        rig_version: user.rig_version,
        is_broadcasting: user.is_broadcasting
      },
      message: 'Data user berhasil diambil.'
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil data user.'
    });
  }
};

/**
 * Toggle broadcasting status
 * PATCH /api/auth/broadcasting
 * Supports both is_broadcasting and is_live (for mobile compatibility)
 */
const toggleBroadcasting = async (req, res) => {
  try {
    const user = req.user;
    const is_broadcasting = req.body.is_broadcasting !== undefined
      ? Boolean(req.body.is_broadcasting)
      : Boolean(req.body.is_live);

    // Update user broadcasting status
    user.is_broadcasting = is_broadcasting;
    await user.save();

    // Sinkronisasi status jadwal stream dan game terkait
    if (is_broadcasting) {
      // 1. Jika diaktifkan ke LIVE: cari jadwal upcoming terdekat untuk dijadikan live (jika belum ada yang live)
      const existingLive = await Schedule.findOne({ where: { status: 'live' } });
      if (!existingLive) {
        let targetSchedule = await Schedule.findOne({
          where: { status: 'upcoming' },
          order: [['scheduled_at', 'ASC']]
        });
        if (!targetSchedule) {
          targetSchedule = await Schedule.findOne({
            order: [['created_at', 'DESC']]
          });
        }
        if (targetSchedule) {
          targetSchedule.status = 'live';
          targetSchedule.live_started_at = new Date();
          await targetSchedule.save();
          await updateNextSchedule(targetSchedule);
        }
      }
    } else {
      // 2. Jika dimatikan (OFF): ubah semua jadwal berstatus 'live' menjadi 'done'
      const liveSchedules = await Schedule.findAll({ where: { status: 'live' } });
      for (const s of liveSchedules) {
        s.status = 'done';
        s.manually_ended = true;
        await s.save();

        if (s.game_category) {
          const game = await Game.findOne({
            where: { title: s.game_category, status: 'playing' }
          });
          if (game) {
            game.status = 'done';
            await game.save();
          }
        }
      }

      // Ambil jadwal upcoming berikutnya untuk ditampilkan di banner/countdown
      const nextUpcoming = await Schedule.findOne({
        where: { status: 'upcoming' },
        order: [['scheduled_at', 'ASC']]
      });
      if (nextUpcoming) {
        await updateNextSchedule(nextUpcoming);
      } else {
        await clearNextSchedule();
      }
    }

    // Update Firebase RTDB broadcasting flag
    await firebaseDb.updateBroadcasting(is_broadcasting);

    // Send FCM push notification when live status turns ON
    if (is_broadcasting) {
      try {
        const liveSchedule = await Schedule.findOne({
          where: { status: 'live' },
          order: [['scheduled_at', 'DESC']]
        });
        await firebaseDb.sendTopicNotification('stream_alerts', {
          title: '🔴 Xion Regalia Sedang LIVE!',
          body: liveSchedule?.title || 'Yuk gabung dan nonton siaran langsung sekarang!',
          data: {
            type: 'BROADCASTING_START',
            url: '/#schedule'
          }
        });
      } catch (fcmErr) {
        console.warn('FCM broadcast notification skipped:', fcmErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        is_broadcasting: user.is_broadcasting,
        is_live: user.is_broadcasting
      },
      message: `Status broadcasting ${is_broadcasting ? 'diaktifkan' : 'dinonaktifkan'}.`
    });
  } catch (error) {
    console.error('Toggle broadcasting error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengubah status broadcasting.'
    });
  }
};

/**
 * Update user profile
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, avatar_url, rig_name, rig_version } = req.body;

    // Update fields if provided
    if (name) user.name = name;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    if (rig_name !== undefined) user.rig_name = rig_name;
    if (rig_version !== undefined) user.rig_version = rig_version;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        rig_name: user.rig_name,
        rig_version: user.rig_version,
        is_broadcasting: user.is_broadcasting
      },
      message: 'Profil berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memperbarui profil.'
    });
  }
};

/**
 * Change user password
 * PATCH /api/auth/password
 */
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { current_password, new_password } = req.body;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Current password dan new password wajib diisi.'
      });
    }

    // Validate new password length
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password baru minimal 6 karakter.'
      });
    }

    // Verify current password
    const isValidPassword = await user.verifyPassword(current_password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Password saat ini salah.'
      });
    }

    // Hash new password with bcrypt rounds 12
    const bcrypt = require('bcrypt');
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // Update password in database
    user.password_hash = newPasswordHash;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Password berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengubah password.'
    });
  }
};

module.exports = {
  login,
  getMe,
  toggleBroadcasting,
  updateProfile,
  changePassword
};
