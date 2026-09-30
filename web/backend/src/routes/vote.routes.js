const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const { voteLimiter } = require('../middleware/rateLimit.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/votes/stats - Get voting stats (public)
router.get('/stats', voteController.getVotingStats);

// POST /api/votes/:gameId - Submit vote for a game (public with rate limiting)
router.post('/:gameId', voteLimiter.middleware(), voteController.submitVote);

// POST /api/votes/request - Submit game request (public with rate limiting)
router.post('/request', voteLimiter.middleware(), voteController.submitGameRequest);

// POST /api/votes/reset-period - Reset voting period (protected)
router.post('/reset-period', authMiddleware, voteController.resetPeriod);

module.exports = router;
