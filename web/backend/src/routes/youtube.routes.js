/**
 * ============================================================================
 * FILE: web/backend/src/routes/youtube.routes.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Rute pengambilan metadata YouTube via Google YouTube Data API v3.
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/youtube/stats - Ambil statistik channel YouTube (public, cached)
router.get('/stats', youtubeController.getChannelStats);

// POST /api/youtube/fetch - Fetch info thumbnail & title video/playlist (protected)
router.post('/fetch', authMiddleware, youtubeController.fetchYouTubeInfo);

module.exports = router;
