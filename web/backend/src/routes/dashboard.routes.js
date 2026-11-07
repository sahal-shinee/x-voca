const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All dashboard routes are protected
router.use(authMiddleware);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// PATCH /api/dashboard/live-status - Toggle broadcasting / live status (Mobile & Web compatibility alias)
router.patch('/live-status', (req, res, next) => {
  if (req.body.is_live !== undefined && req.body.is_broadcasting === undefined) {
    req.body.is_broadcasting = req.body.is_live;
  }
  return authController.toggleBroadcasting(req, res, next);
});

module.exports = router;
