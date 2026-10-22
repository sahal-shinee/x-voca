const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/youtube/stats - Fetch channel statistics (public, cached 5 min)
router.get('/stats', youtubeController.getChannelStats);

// POST /api/youtube/fetch - Fetch YouTube video/playlist info (protected)
router.post('/fetch', authMiddleware, youtubeController.fetchYouTubeInfo);

module.exports = router;
