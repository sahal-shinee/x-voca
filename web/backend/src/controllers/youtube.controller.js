const axios = require('axios');

/**
 * Extract YouTube video ID from various URL formats
 */
const extractVideoId = (url) => {
  // Support: youtube.com/live/ID, youtu.be/ID, watch?v=ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extract YouTube playlist ID from URL
 */
const extractPlaylistId = (url) => {
  const match = url.match(/[?&]list=([^&\n?#]+)/);
  return match ? match[1] : null;
};

/**
 * Fetch YouTube video info
 * POST /api/youtube/fetch
 * Returns: { title, thumbnail_url, category, published_at }
 */
const fetchYouTubeInfo = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'URL YouTube wajib diisi.'
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'YouTube API key belum dikonfigurasi.'
      });
    }

    // Extract video ID
    const videoId = extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'URL YouTube tidak valid.'
      });
    }

    // Fetch video details using YouTube Data API v3
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        id: videoId,
        key: apiKey
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Video tidak ditemukan.'
      });
    }

    const snippet = response.data.items[0].snippet;

    return res.status(200).json({
      success: true,
      data: {
        title: snippet.title,
        thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        category: snippet.categoryId || null,
        published_at: snippet.publishedAt
      },
      message: 'Info video berhasil diambil.'
    });
  } catch (error) {
    console.error('YouTube fetch error:', error.response?.data || error.message);

    // Handle YouTube API errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Video tidak ditemukan.'
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'API key tidak memiliki akses.'
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil info YouTube.'
    });
  }
};

module.exports = {
  fetchYouTubeInfo,
  extractVideoId,
  extractPlaylistId
};
