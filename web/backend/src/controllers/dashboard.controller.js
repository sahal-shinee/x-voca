const { Game, Schedule, Todo, ContentGuide, AuditLog, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // Get total votes for current period
    const voteStats = await Game.findAll({
      where: { period_key: currentPeriod },
      attributes: [
        [fn('SUM', col('vote_count')), 'total_votes'],
        [fn('COUNT', col('id')), 'total_games']
      ],
      raw: true
    });

    // Get upcoming schedules count
    const upcomingSchedules = await Schedule.count({
      where: {
        status: 'upcoming',
        scheduled_at: { [Op.gt]: new Date() }
      }
    });

    // Get pending todos count
    const pendingTodos = await Todo.count({
      where: {
        user_id: req.userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    });

    // Get visible content count
    const visibleContent = await ContentGuide.count({
      where: { is_visible: true }
    });

    // Get recent audit logs
    const recentActivity = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get game status breakdown for current period
    const gameStatusBreakdown = await Game.findAll({
      where: { period_key: currentPeriod },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const stats = {
      votes: {
        total: parseInt(voteStats[0]?.total_votes) || 0,
        games: parseInt(voteStats[0]?.total_games) || 0,
        breakdown: gameStatusBreakdown.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      },
      schedules: {
        upcoming: upcomingSchedules
      },
      todos: {
        pending: pendingTodos
      },
      content: {
        visible: visibleContent
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivity
      },
      message: 'Statistik dashboard berhasil diambil.'
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil statistik dashboard.'
    });
  }
};

/**
 * Get audit logs
 * GET /api/audit-logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action_type, limit = 50 } = req.query;

    const where = {};
    if (action_type) {
      where.action_type = action_type;
    }

    const logs = await AuditLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      data: logs,
      message: 'Audit log berhasil diambil.'
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil audit log.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAuditLogs
};
