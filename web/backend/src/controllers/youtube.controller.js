const axios = require('axios');

// Cache memori sederhana (15 menit) agar hemat kuota Google API
let cachedStats = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000;

/**
 * Extract YouTube video ID from various URL formats
 */
const extractVideoId = (url) => {
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

    const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyAzSEpeZu2_bSqopF5N5piIy2Ww87G4oD8';
    const videoId = extractVideoId(url);
    const playlistId = extractPlaylistId(url);

    if (!videoId && !playlistId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'URL YouTube tidak valid (bukan video atau playlist).'
      });
    }

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
 * Get YouTube channel stats
 * GET /api/youtube/stats — public, cached
 * Returns channel info, subscribers, views, and videos
 */
const getChannelStats = async (req, res) => {
  try {
    const now = Date.now();

    // Kembalikan cache jika masih dalam batas cache (15 menit)
    if (cachedStats && (now - lastFetchTime < CACHE_DURATION)) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cachedStats,
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyAzSEpeZu2_bSqopF5N5piIy2Ww87G4oD8';
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCtOvoDqWorYc6NqkuGmZgEg';

    const url = 'https://www.googleapis.com/youtube/v3/channels';
    const response = await axios.get(url, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: apiKey,
      },
      timeout: 8000,
    });

    const items = response.data?.items;
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Channel YouTube tidak ditemukan.',
      });
    }

    const channel = items[0];
    const subCount = parseInt(channel.statistics.subscriberCount, 10) || 0;
    const viewCount = parseInt(channel.statistics.viewCount, 10) || 0;
    const vidCount = parseInt(channel.statistics.videoCount, 10) || 0;

    const stats = {
      channel_name: channel.snippet.title,
      custom_url: channel.snippet.customUrl || '@xionregalia',
      avatar_url: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
      subscribers: subCount,
      total_views: viewCount,
      total_videos: vidCount,
      // Compatibility with web frontend
      subscriberCount: subCount,
      videoCount: vidCount,
      viewCount: viewCount,
      updated_at: new Date().toISOString(),
    };

    cachedStats = stats;
    lastFetchTime = now;

    return res.status(200).json({
      success: true,
      source: 'live_api',
      data: stats,
      message: 'Statistik YouTube berhasil diperbarui.',
    });
  } catch (error) {
    console.error('YouTube stats error:', error.response?.data || error.message);
    if (cachedStats) {
      return res.status(200).json({
        success: true,
        source: 'stale_cache',
        data: cachedStats,
        message: 'Menggunakan data statistik tersimpan.',
      });
    }
    return res.status(200).json({
      success: true,
      source: 'fallback',
      data: {
        channel_name: 'Xion Regalia Ch',
        custom_url: '@xionregalia',
        avatar_url: 'https://yt3.ggpht.com/420karrhb78PSJENTapcnmM3dmQw0fU_SvoWKtg3qcE46VD9sL7w7KVGJ-ANG-JxyBjugThI=s240-c-k-c0x00ffffff-no-rj',
        subscribers: 4610,
        total_views: 463965,
        total_videos: 703,
        subscriberCount: 4610,
        videoCount: 703,
        viewCount: 463965,
        updated_at: new Date().toISOString(),
      },
      message: 'Statistik default dimuat (koneksi YouTube API terkendala).',
    });
  }
};

module.exports = {
  fetchYouTubeInfo,
  getChannelStats,
  extractVideoId,
  extractPlaylistId,
};
