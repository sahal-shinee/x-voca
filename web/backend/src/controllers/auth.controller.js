/**
 * ============================================================================
 * FILE: web/backend/src/controllers/auth.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali autentikasi administrator dan profil streamer X-VOCA.
 * Mengatur:
 * 1. Login admin dengan verifikasi kata sandi kriptografi Bcrypt & penerbitan token JWT.
 * 2. Pengambilan profil admin yang sedang login (`getMe`).
 * 3. Toggle status siaran langsung (`is_broadcasting`) beserta otomatisasi status jadwal & push alert FCM.
 * 4. Pembaruan informasi profil dan rig streaming.
 * 5. Penggantian kata sandi dengan re-hashing Bcrypt 12 rounds.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `User`, `Schedule`, `Game`, `AuditLog` dari `../models`.
 * - Mengimpor `generateToken` dari `../middleware/auth.middleware`.
 * - Mengimpor helper Firebase dari `../utils/firebase.helper` untuk broadcast status live.
 * - Dipanggil oleh rute `src/routes/auth.routes.js` dan `src/routes/admin.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Kata sandi tidak pernah disimpan mentah, melainkan di-hash dengan Bcrypt.
 *    Verifikasi menggunakan constant-time comparison untuk mencegah timing attack."
 * 2. "Saat admin menyalakan status 'broadcasting', sistem secara otomatis mengubah status
 *    jadwal siaran terdekat menjadi 'live' dan mengirim push notification ke fans."
 * ============================================================================
 */

const { User, Schedule, Game, AuditLog } = require('../models');
const { generateToken } = require('../middleware/auth.middleware');
const firebaseDb = require('../config/firebase');
const { updateNextSchedule, clearNextSchedule } = require('../utils/firebase.helper');

/**
 * Endpoint: POST /api/auth/login
 * Otentikasi masuk admin dan penerbitan token JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input wajib terisi
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email dan password wajib diisi.'
      });
    }

    // 2. Normalisasi format email (lowercase & pembersihan spasi)
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

    // 3. Verifikasi password menggunakan fungsi pembanding kriptografis Bcrypt
    const isValidPassword = await user.verifyPassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Email atau password salah.'
      });
    }

    // 4. Terbitkan token JWT yang berlaku selama 24 jam
    const { token } = generateToken(user);

    // Kembalikan token dan profil user (tanpa atribut password_hash)
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
 * Endpoint: GET /api/auth/me (Protected)
 * Mengambil informasi pengguna aktif berdasarkan decoded token di middleware
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
 * Endpoint: PATCH /api/auth/broadcasting (Admin Only)
 * Toggle status siaran langsung (Live ON / OFF) dengan sinkronisasi multi-tabel
 */
const toggleBroadcasting = async (req, res) => {
  try {
    const user = req.user;
    const is_broadcasting = req.body.is_broadcasting !== undefined
      ? Boolean(req.body.is_broadcasting)
      : Boolean(req.body.is_live);

    // Simpan status baru ke tabel users
    user.is_broadcasting = is_broadcasting;
    await user.save();

    // SINKRONISASI OTOMATIS STATUS JADWAL STREAMING
    if (is_broadcasting) {
      // KONDISI 1 (LIVE AKTIF): Cari jadwal 'upcoming' terdekat dan ubah statusnya menjadi 'live'
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
          // Update pointer jadwal live di Firebase RTDB
          await updateNextSchedule(targetSchedule);
        }
      }
    } else {
      // KONDISI 2 (LIVE SELESAI): Ubah seluruh jadwal berstatus 'live' menjadi 'done'
      const liveSchedules = await Schedule.findAll({ where: { status: 'live' } });
      for (const s of liveSchedules) {
        s.status = 'done';
        s.manually_ended = true;
        await s.save();

        // Jika ada game yang sedang dimainkan (status = 'playing'), ubah menjadi 'done'
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

      // Ambil jadwal siaran mendatang berikutnya untuk timer countdown di beranda
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

    // Broadcast flag broadcasting ke Firebase Realtime Database
    await firebaseDb.updateBroadcasting(is_broadcasting);

    // Kirim push notification ke seluruh subscriber topik 'stream_alerts'
    if (is_broadcasting) {
      try {
        const liveSchedule = await Schedule.findOne({
          where: { status: 'live' },
          order: [['scheduled_at', 'DESC']]
        });
        await firebaseDb.sendTopicNotification('stream_alerts', {
          title: '🔴 Xion Regalia Sedang LIVE!',
          body: liveSchedule?.title || 'Yuk gabung dan tonton siaran langsung sekarang!',
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
 * Endpoint: PATCH /api/auth/profile (Admin Only)
 * Memperbarui data identitas profil streamer dan perangkat rig
 */
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, avatar_url, rig_name, rig_version } = req.body;

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
 * Endpoint: PATCH /api/auth/password (Admin Only)
 * Mengubah kata sandi pengguna dengan verifikasi kata sandi lama
 */
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { current_password, new_password } = req.body;

    // 1. Validasi input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Current password dan new password wajib diisi.'
      });
    }

    // 2. Validasi panjang minimal kata sandi baru (minimal 6 karakter)
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Password baru minimal 6 karakter.'
      });
    }

    // 3. Verifikasi apakah kata sandi saat ini cocok
    const isValidPassword = await user.verifyPassword(current_password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Password saat ini salah.'
      });
    }

    // 4. Enkripsi password baru menggunakan Bcrypt dengan cost factor 12 rounds
    const bcrypt = require('bcrypt');
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // 5. Simpan hash baru ke basis data
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
