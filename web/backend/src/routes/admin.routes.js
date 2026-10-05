const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const scheduleController = require('../controllers/schedule.controller');
const gameController = require('../controllers/game.controller');
const voteController = require('../controllers/vote.controller');
const contentController = require('../controllers/content.controller');
const dashboardController = require('../controllers/dashboard.controller');
const youtubeController = require('../controllers/youtube.controller');

const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// ============================================================
// ADMIN ROUTES
// ============================================================

// --- Schedule Management (Protected) ---
router.post('/schedules', adminOnly, scheduleController.createSchedule);
router.patch('/schedules/:id', adminOnly, scheduleController.updateSchedule);
router.delete('/schedules/:id', adminOnly, scheduleController.deleteSchedule);

// --- Game Management (Protected) ---
router.post('/games', adminOnly, gameController.createGame);
router.patch('/games/:id/status', adminOnly, gameController.updateGameStatus);
router.delete('/games/:id', adminOnly, gameController.deleteGame);

// --- Vote Management (Protected) ---
router.post('/votes/reset-period', adminOnly, voteController.resetPeriod);

// --- Content Management (Protected) ---
router.post('/content', adminOnly, contentController.createContent);
router.patch('/content/:id', adminOnly, contentController.updateContent);
router.delete('/content/:id', adminOnly, contentController.deleteContent);

// --- YouTube (Protected) ---
router.post('/youtube/fetch', adminOnly, youtubeController.fetchYouTubeInfo);

// --- Dashboard (Protected) ---
router.get('/dashboard/stats', adminOnly, dashboardController.getDashboardStats);
router.get('/audit-logs', adminOnly, dashboardController.getAuditLogs);

// --- Profile Management (Protected) ---
router.patch('/auth/profile', adminOnly, authController.updateProfile);
router.patch('/auth/password', adminOnly, authController.changePassword);
router.patch('/auth/broadcasting', adminOnly, authController.toggleBroadcasting);

module.exports = router;
