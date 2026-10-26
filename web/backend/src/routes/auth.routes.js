const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// POST /api/auth/login - User login
router.post('/login', authLimiter.middleware(), authController.login);

// GET /api/auth/me - Get current user info (protected)
router.get('/me', authMiddleware, authController.getMe);

// PATCH /api/auth/broadcasting - Toggle broadcasting status (protected)
router.patch('/broadcasting', authMiddleware, authController.toggleBroadcasting);

// PATCH & PUT /api/auth/profile - Update user profile (protected, supports both PATCH and PUT)
router.patch('/profile', authMiddleware, authController.updateProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// PATCH /api/auth/password - Change user password (protected)
router.patch('/password', authMiddleware, authController.changePassword);

module.exports = router;
