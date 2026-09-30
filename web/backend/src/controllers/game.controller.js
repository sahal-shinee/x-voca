const { Game, Vote, AuditLog } = require('../models');
const firebaseDb = require('../config/firebase');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Get all games with voting stats
 * GET /api/games
 */
const getGames = async (req, res) => {
  try {
    const { period_key, status, limit = 100 } = req.query;

    // Default to current month if no period_key provided
    const currentPeriod = period_key || new Date().toISOString().slice(0, 7);

    const where = { period_key: currentPeriod };
    if (status) {
      where.status = status;
    }

    // Get all games with total vote count in current period
    const games = await Game.findAll({
      where,
      order: [['vote_count', 'DESC']],
      limit: parseInt(limit)
    });

    // Calculate total votes for percentage
    const totalVotes = games.reduce((sum, game) => sum + game.vote_count, 0);

    // Add percentage to each game
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
        total_votes: totalVotes
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
 * Get game by ID
 * GET /api/games/:id
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
 * Create new game
 * POST /api/games
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

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul game wajib diisi.'
      });
    }

    // Generate period key (YYYY-MM format)
    const period_key = new Date().toISOString().slice(0, 7);

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

    // Create audit log
    await AuditLog.create({
      action_type: 'game_requested',
      detail: added_by === 'viewer' ? 'Viewer mengajukan game baru' : 'Game baru ditambahkan',
      sub_detail: title
    });

    // Update Firebase
    await firebaseDb.updateVoteCount(game.id, game.vote_count, game.status);

    return res.status(201).json({
      success: true,
      data: game,
      message: 'Game berhasil dibuat.'
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
 * Update game status
 * PATCH /api/games/:id/status
 */
const updateGameStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['requested', 'accepted', 'playing', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Status tidak valid. Pilih: requested, accepted, playing, atau done.'
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

    // Create audit log
    await AuditLog.create({
      action_type: 'status_changed',
      detail: `Status game diubah dari ${oldStatus} menjadi ${status}`,
      sub_detail: game.title
    });

    // Update Firebase
    await firebaseDb.updateVoteCount(game.id, game.vote_count, game.status);

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
 * Delete game
 * DELETE /api/games/:id
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

    // Create audit log
    await AuditLog.create({
      action_type: 'asset_archived',
      detail: 'Game dihapus dari daftar',
      sub_detail: gameTitle
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Game berhasil dihapus.'
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

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGameStatus,
  deleteGame
};
