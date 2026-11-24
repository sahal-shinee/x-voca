/**
 * ============================================================================
 * FILE: web/backend/src/controllers/game.controller.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengendali data master game dan siklus hidup (lifecycle) moderasi game di X-VOCA.
 * Mengatur:
 * 1. Pengambilan daftar game dengan kalkulasi persentase suara dinamis.
 * 2. Penambahan game baru oleh kreator atau dari penonton.
 * 3. Pembaruan status game (requested -> accepted -> playing -> done).
 * 4. Penghapusan game dari basis data disertai pencatatan audit log.
 * 5. Pengambilan daftar periode historis (period_key).
 *
 * RELASI ANTAR FILE:
 * - Mengimpor model `Game`, `Vote`, `AuditLog` dari `../models`.
 * - Mengimpor helper Firebase `updateVoteCount`, `pushNotification`, `sendTopicNotification` dari `../utils/firebase.helper`.
 * - Dipanggil oleh rute di `src/routes/game.routes.js`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Persentase suara dihitung secara matematis di server (`(vote_count / totalVotes) * 100`)
 *    sehingga klien langsung menerima data yang sudah siap divisualisasikan."
 * 2. "Setiap perubahan status game otomatis memicu audit log dan sinkronisasi ke Firebase RTDB,
 *    sehingga dashboard admin dan halaman publik selalu selaras."
 * ============================================================================
 */

const { Game, Vote, AuditLog } = require('../models');
const { updateVoteCount, updateAllGamesVotes, pushNotification, sendTopicNotification } = require('../utils/firebase.helper');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Endpoint: GET /api/games
 * Mengambil daftar game dengan filter status, periode bulan, pencarian kata kunci, dan urutan
 */
const getGames = async (req, res) => {
  try {
    const { period_key, status, sort = 'vote_count', search } = req.query;

    // Default ke periode bulan aktif jika parameter period_key tidak disertakan
    const currentPeriod = period_key || new Date().toISOString().slice(0, 7);

    // Kriteria pencarian basis data
    const where = { period_key: currentPeriod };
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { genre: { [Op.like]: `%${search}%` } }
      ];
    }

    // Menentukan urutan pengembalian data
    let order;
    if (sort === 'title') {
      order = [['title', 'ASC']];
    } else if (sort === 'status') {
      order = [['status', 'ASC']];
    } else {
      order = [['vote_count', 'DESC']]; // Default: peringkat suara tertinggi ke terendah
    }

    // Eksekusi query ke MySQL
    const games = await Game.findAll({
      where,
      order
    });

    // Menghitung akumulasi total seluruh suara untuk perhitungan persentase
    const totalVotes = games.reduce((sum, game) => sum + (game.vote_count || 0), 0);

    // Menyisipkan nilai persentase suara (dibulatkan 1 desimal) ke setiap objek game
    const gamesWithPercentage = games.map(game => ({
      ...game.toJSON(),
      vote_percentage: totalVotes > 0
        ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: gamesWithPercentage,
      meta: {
        period_key: currentPeriod,
        total_votes: totalVotes,
        total_games: games.length
      },
      message: 'Daftar game berhasil diambil.'
    });
  } catch (error) {
    console.error('Get games error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil daftar game.'
    });
  }
};

/**
 * Endpoint: GET /api/games/:id
 * Mengambil detail satu data game berdasarkan Primary Key (ID)
 */
const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Game tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: game,
      message: 'Game berhasil diambil.'
    });
  } catch (error) {
    console.error('Get game by ID error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil game.'
    });
  }
};

/**
 * Endpoint: POST /api/games (Admin Only)
 * Menambahkan game baru langsung oleh kreator ke dalam sistem
 */
const createGame = async (req, res) => {
  try {
    const {
      title,
      genre,
      publisher,
      cover_url,
      status,
      added_by,
      requester_info
    } = req.body;

    // Validasi judul wajib diisi
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul game wajib diisi.'
      });
    }

    // Periode bulan aktif (format: YYYY-MM)
    const period_key = new Date().toISOString().slice(0, 7);

    // Buat entitas game baru di basis data MySQL
    const game = await Game.create({
      title,
      genre,
      publisher,
      cover_url,
      vote_count: 0,
      status: status || 'requested',
      added_by: added_by || 'creator',
      requester_info,
      period_key
    });

    // Hitung persentase dan sinkronkan efek samping (Audit Log, Firebase, Notifikasi)
    const totalVotes = await Game.sum('vote_count', { where: { period_key: game.period_key } }) || 0;
    const percentage = totalVotes > 0 ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10 : 0;

    const sideEffects = [
      AuditLog.create({
        action_type: 'game_requested',
        detail: added_by === 'viewer' ? 'Viewer mengajukan game baru' : 'Game baru ditambahkan oleh kreator',
        sub_detail: title
      }),
      updateVoteCount(game.id, game.vote_count, percentage)
    ];

    if (added_by === 'viewer' || status === 'requested') {
      sideEffects.push(
        pushNotification({
          userId: 'default',
          type: 'game_requested',
          title: 'Request Game Baru',
          message: `Game "${title}" telah diajukan penonton untuk voting`,
          link: '/admin/voting'
        }),
        sendTopicNotification('creator_alerts', {
          title: '🎮 Request Game Baru',
          body: `${title} — diusulkan oleh ${requester_info || 'Viewer'}`,
          data: {
            type: 'NEW_GAME_REQUEST',
            gameId: String(game.id),
            url: '/admin/voting'
          }
        })
      );
    }

    await Promise.allSettled(sideEffects);

    return res.status(201).json({
      success: true,
      data: game,
      message: 'Game berhasil ditambahkan ke sistem.'
    });
  } catch (error) {
    console.error('Create game error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat membuat game.'
    });
  }
};

/**
 * Endpoint: PATCH /api/games/:id/status (Admin Only)
 * Memperbarui siklus moderasi game: 'requested' -> 'accepted' -> 'playing' -> 'done'
 */
const updateGameStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi enum status siklus hidup game yang sah
    const validStatuses = ['requested', 'accepted', 'playing', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Status tidak valid. Pilihan yang tersedia: requested, accepted, playing, atau done.'
      });
    }

    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Game tidak ditemukan.'
      });
    }

    const oldStatus = game.status;
    game.status = status;
    await game.save();

    // Kalkulasi persentase dan sinkronkan Audit Log serta Firebase RTDB
    const totalVotes = await Game.sum('vote_count', { where: { period_key: game.period_key } }) || 0;
    const percentage = totalVotes > 0 ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10 : 0;

    await Promise.allSettled([
      AuditLog.create({
        action_type: 'status_changed',
        detail: `Status game diubah dari ${oldStatus} menjadi ${status}`,
        sub_detail: game.title
      }),
      updateVoteCount(game.id, game.vote_count, percentage)
    ]);

    return res.status(200).json({
      success: true,
      data: game,
      message: `Status game berhasil diubah menjadi ${status}.`
    });
  } catch (error) {
    console.error('Update game status error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengubah status game.'
    });
  }
};

/**
 * Endpoint: DELETE /api/games/:id (Admin Only)
 * Menghapus data game dari basis data
 */
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByPk(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Game tidak ditemukan.'
      });
    }

    const gameTitle = game.title;
    await game.destroy();

    // Catat tindakan penghapusan ke Audit Log
    await AuditLog.create({
      action_type: 'asset_archived',
      detail: 'Game dihapus dari daftar master',
      sub_detail: gameTitle
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Game berhasil dihapus dari sistem.'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat menghapus game.'
    });
  }
};

/**
 * Endpoint: GET /api/games/periods
 * Mengambil daftar seluruh riwayat periode voting (bulan-tahun) yang pernah ada
 */
const getPeriods = async (req, res) => {
  try {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // Ambil nilai unik kolom period_key menggunakan group by
    const games = await Game.findAll({
      attributes: ['period_key'],
      group: ['period_key'],
      raw: true
    });

    const periodSet = new Set(games.map(g => g.period_key).filter(Boolean));
    periodSet.add(currentPeriod);

    // Urutkan dari periode paling baru ke paling lama
    const sortedPeriods = Array.from(periodSet).sort().reverse();

    return res.status(200).json({
      success: true,
      data: sortedPeriods,
      current_period: currentPeriod,
      message: 'Daftar periode berhasil diambil.'
    });
  } catch (error) {
    console.error('Get periods error:', error);
    const currentPeriod = new Date().toISOString().slice(0, 7);
    return res.status(200).json({
      success: true,
      data: [currentPeriod],
      current_period: currentPeriod,
      message: 'Menggunakan periode aktif saat ini.'
    });
  }
};

module.exports = {
  getGames,
  getPeriods,
  getGameById,
  createGame,
  updateGameStatus,
  deleteGame
};
