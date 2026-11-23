const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// All audit log routes are restricted to authenticated admins
router.use(authMiddleware, adminOnly);

// GET /api/audit-logs - Get audit logs
router.get('/', dashboardController.getAuditLogs);

module.exports = router;
