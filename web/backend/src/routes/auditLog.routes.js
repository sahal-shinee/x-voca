const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All audit log routes are protected
router.use(authMiddleware);

// GET /api/audit-logs - Get audit logs
router.get('/', dashboardController.getAuditLogs);

module.exports = router;
