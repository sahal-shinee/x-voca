/**
 * ============================================================================
 * FILE: web/backend/src/routes/vote.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Deklarasi rute API untuk pemungutan suara (Voting) dan pengajuan request game.
 * Menyematkan middleware `voteLimiter` untuk menangkal serangan bot spamming.
 * Endpoints:
 * - GET  /api/votes/stats         -> Statistik suara periode aktif (Publik)
 * - POST /api/votes/request       -> Pengajuan game baru dengan cooldown 7 hari (Publik + Limiter)
 * - POST /api/votes/reset-period  -> Reset periode bulanan (Khusus Admin)
 * - POST /api/votes/:gameId       -> Memberikan 1 suara dengan proteksi fingerprint (Publik + Limiter)
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller');
const { voteLimiter } = require('../middleware/rateLimit.middleware');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// GET /api/votes/stats - Get voting stats (public)
router.get('/stats', voteController.getVotingStats);

// POST /api/votes/request - Submit game request (public with rate limiting)
router.post('/request', voteLimiter.middleware(), voteController.submitGameRequest);

// POST /api/votes/reset-period - Reset voting period (admin only)
router.post('/reset-period', authMiddleware, adminOnly, voteController.resetPeriod);

// POST /api/votes/:gameId - Submit vote for a game (public with rate limiting)
router.post('/:gameId', voteLimiter.middleware(), voteController.submitVote);

module.exports = router;
