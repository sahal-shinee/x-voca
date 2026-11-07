const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All dashboard routes are protected
router.use(authMiddleware);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// PATCH /api/dashboard/live-status - Toggle live broadcast status
router.patch('/live-status', dashboardController.updateLiveStatus);

module.exports = router;