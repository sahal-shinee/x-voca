const { Game, Vote, AuditLog } = require('../models');
const { updateVoteCount, updateAllGamesVotes, resetVotingPeriod } = require('../utils/firebase.helper');
const { Op } = require('sequelize');

/**
 * Get client IP address
 */
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
};

/**
 * Submit vote for a game
 * POST /api/votes/:gameId
 * Anti-spam: IP + fingerprint check
 */
const submitVote = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { fingerprint } = req.body;
    const ipAddress = getClientIP(req);

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

    // Anti-spam check: IP OR fingerprint in votes table
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

    // Update Firebase with new percentage
    const totalVotes = await Game.sum('vote_count', { where: { period_key } }) || 0;
    const percentage = totalVotes > 0 ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10 : 0;
    await updateVoteCount(game.id, game.vote_count, percentage, totalVotes);

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
 * Submit game request
 * POST /api/votes/request
 * Rate limit: 1x per device per 7 days
 */
const submitGameRequest = async (req, res) => {
  try {
    const { title, genre, publisher, cover_url } = req.body;
    const ipAddress = getClientIP(req);
    const fingerprint = req.body.fingerprint || ipAddress;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul game wajib diisi.'
      });
    }

    // Check if viewer already requested within 7 days (rate limit)
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
        message: 'Anda sudah mengajukan request game dalam 7 hari terakhir.'
      });
    }

    // Generate period key
    const period_key = new Date().toISOString().slice(0, 7);

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
 * Generate new period_key (current month), reset all non-done games
 */
const resetPeriod = async (req, res) => {
  try {
    // Generate new period key (current month)
    const newPeriodKey = new Date().toISOString().slice(0, 7);

    // Get all games from current period that are NOT done
    const currentPeriodGames = await Game.findAll({
      where: {
        status: { [Op.ne]: 'done' }
      }
    });

    // Reset vote counts and update period keys
    for (const game of currentPeriodGames) {
      game.vote_count = 0;
      game.status = 'requested';
      game.period_key = newPeriodKey;
      await game.save();
    }

    // Delete all vote records (archived data stays, just reset active ones)
    await Vote.destroy({
      where: {}
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'period_reset',
      detail: 'Periode voting di-reset',
      sub_detail: `Periode baru: ${newPeriodKey}`
    });

    // Update Firebase with new period (reset all)
    await resetVotingPeriod(newPeriodKey);

    return res.status(200).json({
      success: true,
      data: {
        new_period: newPeriodKey,
        games_reset: currentPeriodGames.length
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

    // Hitung total votes dari semua game di periode ini
    const totalVotes = await Game.sum('vote_count', {
      where: { period_key }
    }) || 0;

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
