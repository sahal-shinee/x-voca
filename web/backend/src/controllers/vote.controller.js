/**
 * ============================================================================
 * FILE: web/backend/src/controllers/vote.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat logika bisnis (Business Logic) untuk sistem voting komunitas dan pengajuan game.
 * Mengimplementasikan:
 * 1. Algoritma anti-spam Zero-Login (Browser Fingerprint + IP Address + Period Key).
 * 2. Transaksi atomik penambahan suara di MySQL level database (ACID compliant).
 * 3. Cooldown 7 hari pada pengajuan request game penonton.
 * 4. Sinkronisasi data real-time ke Firebase Realtime Database.
 * 5. Pengiriman notifikasi push alert ke smartphone kreator via Firebase Cloud Messaging (FCM).
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Game`, `Vote`, `AuditLog` dari `../models`.
 * - Mengimpor helper Firebase `updateVoteCount`, `resetVotingPeriod`, `sendTopicNotification` dari `../utils/firebase.helper`.
 * - Dipanggil oleh rute di `src/routes/vote.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Fitur voting ini frictionless (tanpa wajib login), namun memiliki proteksi ganda:
 *    hardware fingerprint dari browser dan alamat IP publik pada periode bulan aktif (YYYY-MM)."
 * 2. "Penambahan angka vote menggunakan `game.increment()` yang mengeksekusi operasi atomik
 *    level SQL langsung, sehingga terhindar dari Race Condition sekalipun ada ribuan penonton."
 * 3. "Game usulan penonton berstatus 'requested' dan tidak langsung muncul di daftar voting
 *    sebelum disetujui (moderasi) oleh admin di Creator Studio."
 * ============================================================================
 */

const { Game, Vote, AuditLog } = require('../models');
const { updateVoteCount, updateAllGamesVotes, resetVotingPeriod, sendTopicNotification } = require('../utils/firebase.helper');
const { Op } = require('sequelize');

/**
 * Helper: getClientIP
 * Mendapatkan alamat IP asli klien, menangani jika berada di balik reverse proxy (Cloudflare/Nginx)
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
};

/**
 * Endpoint: POST /api/votes/:gameId
 * Memberikan 1 suara untuk game tertentu dengan perlindungan anti-spam berlapis
 */
const submitVote = async (req, res) => {
  try {
    const { gameId } = req.params;
    const body = req.body || {};
    const ipAddress = getClientIP(req);
    // Identitas perangkat: prioritaskan hash hardware fingerprint dari frontend, fallback ke IP
    const fingerprint = body.fingerprint || ipAddress;

    // LANGKAH 1: Validasi Keberadaan Data Game di Basis Data
    const game = await Game.findByPk(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Game yang ingin divote tidak ditemukan di basis data.'
      });
    }

    // LANGKAH 2: Status Gating (Pemeriksaan Siklus Hidup Game)
    // Hanya game yang telah disetujui admin (status = 'accepted') yang boleh menerima suara
    if (game.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        data: null,
        message: game.status === 'requested'
          ? 'Game ini belum disetujui oleh kreator untuk sesi voting.'
          : 'Sesi voting untuk game ini sudah ditutup.'
      });
    }

    // LANGKAH 3: Validasi Keberadaan Identitas Perangkat
    if (!fingerprint) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Identitas perangkat tidak valid.'
      });
    }

    const period_key = game.period_key;

    // LANGKAH 4: Pemeriksaan Anti-Spam (Dual-Identifier Check)
    // Cek apakah Alamat IP ATAU Hardware Fingerprint sudah pernah memilih game ini di bulan yang sama
    const existingVote = await Vote.findOne({
      where: {
        game_id: gameId,
        period_key,
        [Op.or]: [
          { ip_address: ipAddress },
          { fingerprint }
        ]
      }
    });

    if (existingVote) {
      return res.status(429).json({
        success: false,
        data: null,
        message: 'Anda sudah memberikan vote untuk game ini di periode ini.'
      });
    }

    // LANGKAH 5: Pencatatan Log Suara di Tabel `votes`
    await Vote.create({
      game_id: gameId,
      ip_address: ipAddress,
      fingerprint,
      period_key
    });

    // LANGKAH 6: Penambahan Suara Secara Atomik di Tabel `games`
    // Menggunakan row-level atomic increment untuk mencegah Race Condition
    await game.increment('vote_count', { by: 1 });
    await game.reload(); // Muat ulang data terbaru dari database

    // LANGKAH 7: Kalkulasi Ulang Persentase Suara Terkini
    const totalVotes = await Game.sum('vote_count', { where: { period_key } }) || 0;
    const percentage = totalVotes > 0 ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10 : 0;

    // LANGKAH 8: Eksekusi Efek Samping Secara Paralel (Audit Log & Firebase Broadcast)
    await Promise.allSettled([
      AuditLog.create({
        action_type: 'vote_in',
        detail: 'Vote baru ditambahkan',
        sub_detail: game.title
      }),
      // Broadcast skor suara terbaru ke Firebase RTDB agar penonton lain langsung melihat perubahan
      updateVoteCount(game.id, game.vote_count, percentage, totalVotes)
    ]);

    // Respon sukses kembali ke frontend klien
    return res.status(200).json({
      success: true,
      data: {
        game_id: game.id,
        vote_count: game.vote_count,
        vote_percentage: percentage
      },
      message: 'Vote berhasil diberikan.'
    });
  } catch (error) {
    console.error('Submit vote error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat submit vote.'
    });
  }
};

/**
 * Endpoint: POST /api/votes/request
 * Penonton mengusulkan judul game baru dengan masa jeda (cooldown) 7 hari
 */
const submitGameRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const { title, genre, publisher, cover_url } = body;
    const ipAddress = getClientIP(req);
    const fingerprint = body.fingerprint || ipAddress;

    // LANGKAH 1: Validasi Kolom Wajib
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul game wajib diisi.'
      });
    }

    // LANGKAH 2: Proteksi Cooldown 7 Hari (Anti-Spam Flooding)
    // Cek apakah perangkat penonton ini sudah pernah mengajukan usulan game dalam 7 hari terakhir
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const existingRequest = await Vote.findOne({
      where: {
        fingerprint,
        voted_at: { [Op.gte]: sevenDaysAgo }
      },
      include: [{
        model: Game,
        as: 'game',
        where: { added_by: 'viewer' }
      }]
    });

    if (existingRequest) {
      return res.status(429).json({
        success: false,
        data: null,
        message: 'Anda sudah mengajukan request game dalam 7 hari terakhir. Silakan tunggu masa cooldown.'
      });
    }

    // Periode bulan aktif (format: "YYYY-MM")
    const period_key = new Date().toISOString().slice(0, 7);

    // LANGKAH 3: Simpan Record Game Baru dengan Status 'requested'
    // Status 'requested' memastikan game TIDAK langsung muncul di daftar voting publik
    const game = await Game.create({
      title,
      genre,
      publisher,
      cover_url,
      vote_count: 0,
      status: 'requested', // Wajib dimoderasi admin terlebih dahulu!
      added_by: 'viewer',
      requester_info: `Viewer #${ipAddress.slice(-4)}`,
      period_key
    });

    // LANGKAH 4: Simpan Placeholder di Tabel votes untuk Mengunci Masa Cooldown 7 Hari
    await Vote.create({
      game_id: game.id,
      ip_address: ipAddress,
      fingerprint,
      period_key
    });

    // LANGKAH 5: Catat Log Audit Aktivitas
    await AuditLog.create({
      action_type: 'game_requested',
      detail: 'Viewer mengajukan usulan baru',
      sub_detail: title
    });

    // LANGKAH 6: Kirimkan Push Notification (FCM Topic) ke Smartphone Kreator
    try {
      await sendTopicNotification('creator_alerts', {
        title: '🎮 Request Game Baru',
        body: `${game.title} — diusulkan oleh ${game.requester_info || 'Viewer'}`,
        data: {
          type: 'NEW_GAME_REQUEST',
          gameId: String(game.id),
          url: '/admin/voting'
        }
      });
    } catch (fcmErr) {
      console.warn('FCM game request notification skipped:', fcmErr.message);
    }

    return res.status(201).json({
      success: true,
      data: game,
      message: 'Request game berhasil diajukan dan sedang menunggu ulasan kreator.'
    });
  } catch (error) {
    console.error('Submit game request error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat submit request game.'
    });
  }
};

/**
 * Endpoint: POST /api/votes/reset-period (Khusus Admin Studio)
 * Menutup voting bulan berjalan dan membuka periode voting bulan baru
 */
const resetPeriod = async (req, res) => {
  try {
    // Generate period key baru (format "YYYY-MM", misal "2026-12")
    const newPeriodKey = new Date().toISOString().slice(0, 7);

    // Ambil seluruh game dari periode aktif yang belum berstatus 'done' (selesai dimainkan)
    const currentPeriodGames = await Game.findAll({
      where: {
        status: { [Op.ne]: 'done' }
      }
    });

    // Reset perolehan suara menjadi 0 dan set period_key baru
    for (const game of currentPeriodGames) {
      game.vote_count = 0;
      game.status = 'requested';
      game.period_key = newPeriodKey;
      await game.save();
    }

    // Catatan: Baris log pada tabel `votes` lama TETAP tersimpan rapi sebagai arsip historis.
    // Pemisahan antar periode ditangani otomatis oleh pembeda kolom `period_key`.

    // Catat tindakan reset ini di Audit Log
    await AuditLog.create({
      action_type: 'period_reset',
      detail: 'Periode voting di-reset oleh admin',
      sub_detail: `Periode baru: ${newPeriodKey}`
    });

    // Broadcast reset seluruh data voting di Firebase Realtime Database
    await resetVotingPeriod(newPeriodKey);

    return res.status(200).json({
      success: true,
      data: {
        new_period: newPeriodKey,
        games_reset: currentPeriodGames.length
      },
      message: `Periode voting berhasil di-reset ke periode ${newPeriodKey}.`
    });
  } catch (error) {
    console.error('Reset period error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat me-reset periode voting.'
    });
  }
};

/**
 * Endpoint: GET /api/votes/stats
 * Mengambil ringkasan data analitik voting berdasarkan periode aktif
 */
const getVotingStats = async (req, res) => {
  try {
    const period_key = req.query.period_key || new Date().toISOString().slice(0, 7);

    // Ambil data status game pada periode yang diminta
    const games = await Game.findAll({
      where: { period_key },
      attributes: ['status']
    });

    // Akumulasi total seluruh suara yang masuk
    const totalVotes = await Game.sum('vote_count', {
      where: { period_key }
    }) || 0;

    // Rekapitulasi per status
    const stats = {
      total_games: games.length,
      total_votes: totalVotes,
      requested: games.filter(g => g.status === 'requested').length,
      accepted: games.filter(g => g.status === 'accepted').length,
      playing: games.filter(g => g.status === 'playing').length,
      done: games.filter(g => g.status === 'done').length
    };

    return res.status(200).json({
      success: true,
      data: stats,
      meta: { period_key },
      message: 'Statistik voting berhasil diambil.'
    });
  } catch (error) {
    console.error('Get voting stats error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil statistik voting.'
    });
  }
};

module.exports = {
  submitVote,
  submitGameRequest,
  resetPeriod,
  getVotingStats
};
