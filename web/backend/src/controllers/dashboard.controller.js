const { Game, Schedule, Todo, ContentGuide, AuditLog, User, Vote } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Calculate time_ago string from date
 */
const getTimeAgo = (date) => {
  if (!date) return null;
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} hari lalu`;
  if (diffHours > 0) return `${diffHours} jam lalu`;
  if (diffMins > 0) return `${diffMins} menit lalu`;
  return 'Baru saja';
};

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // Get previous month period
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const previousPeriod = prevDate.toISOString().slice(0, 7);

    // Get total votes for current period
    const currentVotes = await Game.sum('vote_count', {
      where: { period_key: currentPeriod }
    }) || 0;

    // Get total votes for previous period
    const previousVotes = await Game.sum('vote_count', {
      where: { period_key: previousPeriod }
    }) || 0;

    // Calculate vote change percentage
    const voteChange = previousVotes > 0
      ? Math.round(((currentVotes - previousVotes) / previousVotes) * 100)
      : currentVotes > 0 ? 100 : 0;

    // Get upcoming schedules count (next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingSchedules = await Schedule.count({
      where: {
        status: 'upcoming',
        scheduled_at: {
          [Op.gt]: new Date(),
          [Op.lte]: sevenDaysLater
        }
      }
    });

    // Get completed/archived schedules count
    const completedSchedules = await Schedule.count({
      where: {
        status: { [Op.in]: ['done', 'archived'] }
      }
    });

    // Get active broadcast (schedule with status 'live')
    const activeBroadcast = await Schedule.findOne({
      where: {
        status: 'live'
      },
      order: [['scheduled_at', 'DESC']],
      attributes: ['id', 'title', 'game_category', 'scheduled_at', 'youtube_url']
    });

    // Get top voted game for current period (only accepted/playing games)
    const topVotedGame = await Game.findOne({
      where: {
        period_key: currentPeriod,
        status: { [Op.in]: ['accepted', 'playing'] }
      },
      order: [['vote_count', 'DESC']],
      attributes: ['id', 'title', 'vote_count']
    });

    // Calculate total votes for percentage calculation
    const totalVotesForPeriod = await Game.sum('vote_count', {
      where: { period_key: currentPeriod }
    }) || 0;

    const topGamePercent = topVotedGame && totalVotesForPeriod > 0
      ? Math.round((topVotedGame.vote_count / totalVotesForPeriod) * 100)
      : 0;

    // Get pending and in_progress todos count
    const pendingTodos = await Todo.count({
      where: {
        user_id: req.userId,
        status: { [Op.in]: ['pending', 'in_progress'] }
      }
    });

    // Get urgent todos count
    const urgentTodos = await Todo.count({
      where: {
        user_id: req.userId,
        status: { [Op.in]: ['pending', 'in_progress'] },
        priority: 'urgent'
      }
    });

    // Get visible content count
    const visibleContent = await ContentGuide.count({
      where: { is_visible: true }
    });

    // Get requested games count (pending review)
    const requestedGames = await Game.count({
      where: {
        period_key: currentPeriod,
        status: 'requested'
      }
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
        total: currentVotes,
        previous_total: previousVotes,
        change_percent: voteChange,
        breakdown: gameStatusBreakdown.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      },
      schedules: {
        upcoming: upcomingSchedules,
        completed: completedSchedules
      },
      todos: {
        pending: pendingTodos,
        urgent: urgentTodos
      },
      content: {
        visible: visibleContent
      },
      games: {
        requested: requestedGames
      },
      active_period: currentPeriod,
      // NEW: Active broadcast info
      activeBroadcast: activeBroadcast ? {
        id: activeBroadcast.id,
        title: activeBroadcast.title,
        game_category: activeBroadcast.game_category,
        scheduled_at: activeBroadcast.scheduled_at,
        youtube_url: activeBroadcast.youtube_url
      } : null,
      // NEW: Top voted game info
      topVotedGame: topVotedGame ? {
        id: topVotedGame.id,
        title: topVotedGame.title,
        vote_count: topVotedGame.vote_count,
        percentage: topGamePercent
      } : null
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
 * Query: page, limit, action_type
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action_type, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (action_type) {
      where.action_type = action_type;
    }

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    // Add time_ago to each log
    const logsWithTimeAgo = logs.map(log => {
      const logData = log.toJSON ? log.toJSON() : { ...log };
      logData.time_ago = getTimeAgo(logData.created_at);
      return logData;
    });

    return res.status(200).json({
      success: true,
      data: {
        logs: logsWithTimeAgo,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      },
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
