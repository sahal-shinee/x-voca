const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const scheduleRoutes = require('./schedule.routes');
const gameRoutes = require('./game.routes');
const voteRoutes = require('./vote.routes');
const contentRoutes = require('./content.routes');
const dashboardRoutes = require('./dashboard.routes');
const auditLogRoutes = require('./auditLog.routes');
const collabRequestRoutes = require('./collabRequest.routes');
const todoRoutes = require('./todo.routes');
const youtubeRoutes = require('./youtube.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/games', gameRoutes);
router.use('/votes', voteRoutes);
router.use('/content', contentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/collab-requests', collabRequestRoutes);
router.use('/todos', todoRoutes);
router.use('/youtube', youtubeRoutes);

module.exports = {
  router,
  authRoutes,
  adminRoutes,
  scheduleRoutes,
  gameRoutes,
  voteRoutes,
  contentRoutes,
  dashboardRoutes,
  auditLogRoutes,
  collabRequestRoutes,
  todoRoutes,
  youtubeRoutes
};

