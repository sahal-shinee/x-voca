const { Game, Vote, AuditLog } = require('../models');
const firebaseDb = require('../config/firebase');
const { Op } = require('sequelize');

/**
 * Submit vote for a game
 * POST /api/votes/:gameId
 */
const submitVote = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { fingerprint } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Validate game ID
    const game = await Game.findByPk(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Game tidak ditemukan.'
      });
    }

    // Validate fingerprint
    if (!fingerprint) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Fingerprint wajib diisi.'
      });
    }

    const period_key = game.period_key;

    // Check if already voted (by IP or fingerprint)
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

    // Create vote record
    await Vote.create({
      game_id: gameId,
      ip_address: ipAddress,
      fingerprint,
      period_key
    });

    // Update game vote count
    game.vote_count += 1;
    await game.save();

    // Create audit log
    await AuditLog.create({
      action_type: 'vote_in',
      detail: 'Vote baru ditambahkan',
      sub_detail: game.title
    });

    // Update Firebase
    await firebaseDb.updateVoteCount(game.id, game.vote_count, game.status);

    return res.status(200).json({
      success: true,
      data: {
        game_id: game.id,
        vote_count: game.vote_count
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
 * Submit game request
 * POST /api/votes/request
 */
const submitGameRequest = async (req, res) => {
  try {
    const { title, genre, publisher, cover_url } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const fingerprint = req.body.fingerprint || ipAddress;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul game wajib diisi.'
      });
    }

    // Generate period key
    const period_key = new Date().toISOString().slice(0, 7);

    // Check if viewer already requested a game this period
    const existingRequest = await Vote.findOne({
      where: {
        ip_address: ipAddress,
        fingerprint,
        period_key
      }
    });

    if (existingRequest) {
      return res.status(429).json({
        success: false,
        data: null,
        message: 'Anda sudah mengajukan request game di periode ini.'
      });
    }

    // Create new game with requested status
    const game = await Game.create({
      title,
      genre,
      publisher,
      cover_url,
      vote_count: 0,
      status: 'requested',
      added_by: 'viewer',
      requester_info: `Viewer #${ipAddress.slice(-4)}`,
      period_key
    });

    // Create a placeholder vote record to track the request
    await Vote.create({
      game_id: game.id,
      ip_address: ipAddress,
      fingerprint,
      period_key
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'game_requested',
      detail: 'Viewer mengajukan usulan baru',
      sub_detail: title
    });

    return res.status(201).json({
      success: true,
      data: game,
      message: 'Request game berhasil diajukan.'
    });
  } catch (error) {
    console.error('Submit game request error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat submit request.'
    });
  }
};

/**
 * Reset voting period
 * POST /api/votes/reset-period
 */
const resetPeriod = async (req, res) => {
  try {
    // Generate new period key (next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const newPeriodKey = nextMonth.toISOString().slice(0, 7);

    // Get all games from current period
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const games = await Game.findAll({
      where: {
        period_key: currentPeriod,
        status: { [Op.ne]: 'done' }
      }
    });

    // Reset vote counts and update period keys
    for (const game of games) {
      game.vote_count = 0;
      game.status = 'requested';
      game.period_key = newPeriodKey;
      await game.save();
    }

    // Delete all vote records from current period
    await Vote.destroy({
      where: { period_key: currentPeriod }
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'period_reset',
      detail: 'Periode voting di-reset',
      sub_detail: `Periode baru: ${newPeriodKey}`
    });

    // Update Firebase with new period
    const newPeriodGames = {};
    games.forEach(game => {
      newPeriodGames[game.id] = {
        voteCount: 0,
        status: 'requested'
      };
    });
    await firebaseDb.updateVotingPeriod(newPeriodKey, newPeriodGames);

    return res.status(200).json({
      success: true,
      data: {
        new_period: newPeriodKey,
        games_reset: games.length
      },
      message: `Periode voting berhasil di-reset ke ${newPeriodKey}.`
    });
  } catch (error) {
    console.error('Reset period error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat reset periode.'
    });
  }
};

/**
 * Get voting stats
 * GET /api/votes/stats
 */
const getVotingStats = async (req, res) => {
  try {
    const period_key = req.query.period_key || new Date().toISOString().slice(0, 7);

    const games = await Game.findAll({
      where: { period_key },
      attributes: ['status']
    });

    const stats = {
      total_games: games.length,
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
      message: 'Terjadi kesalahan saat mengambil statistik.'
    });
  }
};

module.exports = {
  submitVote,
  submitGameRequest,
  resetPeriod,
  getVotingStats
};
