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
    const videoId = extractVideoId(url);
    const playlistId = extractPlaylistId(url);

    if (!videoId && !playlistId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'URL YouTube tidak valid (bukan video atau playlist).'
      });
    }

    // Fallback info if API key is not configured or API fails
    const fallbackThumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        data: {
          title: '',
          thumbnail_url: fallbackThumbnail,
          type: playlistId ? 'playlist' : 'video',
          is_fallback: true
        },
        message: 'Thumbnail YouTube berhasil diekstrak (tanpa API key).'
      });
    }

    // If it's a playlist and no direct videoId, or specifically has playlistId
    if (playlistId && (!videoId || url.includes('/playlist'))) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
          params: {
            part: 'snippet,contentDetails',
            id: playlistId,
            key: apiKey
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          const snippet = item.snippet;
          const contentDetails = item.contentDetails;

          return res.status(200).json({
            success: true,
            data: {
              title: snippet.title,
              thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
              video_count: contentDetails?.itemCount || 1,
              type: 'playlist',
              published_at: snippet.publishedAt
            },
            message: 'Info playlist berhasil diambil.'
          });
        }
      } catch (plErr) {
        console.warn('YouTube playlist fetch failed, fallback if videoId available:', plErr.message);
      }
    }

    // Fetch video details using YouTube Data API v3
    if (videoId) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: videoId,
            key: apiKey
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          const snippet = response.data.items[0].snippet;

          return res.status(200).json({
            success: true,
            data: {
              title: snippet.title,
              thumbnail_url: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
              category: snippet.categoryId || null,
              type: 'video',
              published_at: snippet.publishedAt
            },
            message: 'Info video berhasil diambil.'
          });
        }
      } catch (vidErr) {
        console.warn('YouTube video fetch error:', vidErr.message);
      }
    }

    // If API returned 0 items or threw, return fallback thumbnail if videoId exists
    if (fallbackThumbnail) {
      return res.status(200).json({
        success: true,
        data: {
          title: '',
          thumbnail_url: fallbackThumbnail,
          type: 'video',
          is_fallback: true
        },
        message: 'Thumbnail video berhasil diekstrak.'
      });
    }

    return res.status(404).json({
      success: false,
      data: null,
      message: 'Video atau playlist YouTube tidak ditemukan.'
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

/**
 * In-memory cache for YouTube channel stats (5-minute TTL)
 */
let _statsCache = null;
let _statsCachedAt = 0;
const STATS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch YouTube channel statistics (subscribers, video count)
 * GET /api/youtube/stats  — public, no auth required
 * Returns: { subscriberCount, videoCount }
 */
const getChannelStats = async (req, res) => {
  try {
    const now = Date.now();

    // Serve from cache if fresh
    if (_statsCache && now - _statsCachedAt < STATS_CACHE_TTL_MS) {
      return res.status(200).json({ success: true, data: _statsCache, cached: true });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return res.status(503).json({
        success: false,
        data: null,
        message: 'YouTube API key atau Channel ID belum dikonfigurasi.'
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'statistics',
        id: channelId,
        key: apiKey
      },
      timeout: 8000
    });

    const items = response.data?.items;
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Channel YouTube tidak ditemukan.'
      });
    }

    const stats = items[0].statistics;
    const payload = {
      subscriberCount: parseInt(stats.subscriberCount || '0', 10),
      videoCount: parseInt(stats.videoCount || '0', 10),
      viewCount: parseInt(stats.viewCount || '0', 10)
    };

    // Store in cache
    _statsCache = payload;
    _statsCachedAt = now;

    return res.status(200).json({ success: true, data: payload, cached: false });
  } catch (error) {
    console.error('YouTube channel stats error:', error.response?.data || error.message);

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'YouTube API key tidak memiliki akses atau kuota habis.'
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Gagal mengambil statistik channel YouTube.'
    });
  }
};

module.exports = {
  fetchYouTubeInfo,
  getChannelStats,
  extractVideoId,
  extractPlaylistId
};
