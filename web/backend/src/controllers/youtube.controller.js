const axios = require('axios');

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
 * Fetch YouTube video/playlist info
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

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'YouTube API key belum dikonfigurasi.'
      });
    }

    // Check if it's a video or playlist
    const videoId = extractVideoId(url);
    const playlistId = extractPlaylistId(url);

    if (!videoId && !playlistId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'URL YouTube tidak valid.'
      });
    }

    // Determine content type
    const contentType = playlistId ? 'playlist' : 'video';

    // Fetch video/playlist details
    if (contentType === 'video') {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,contentDetails',
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

      const video = response.data.items[0].snippet;
      const contentDetails = response.data.items[0].contentDetails;

      return res.status(200).json({
        success: true,
        data: {
          title: video.title,
          thumbnail: video.thumbnails?.high?.url || video.thumbnails?.medium?.url,
          category: video.categoryId,
          publishedAt: video.publishedAt,
          channelTitle: video.channelTitle,
          duration: contentDetails.duration,
          contentType: 'video'
        },
        message: 'Info video berhasil diambil.'
      });
    } else {
      // Fetch playlist details
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
          part: 'snippet',
          id: playlistId,
          key: apiKey
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Playlist tidak ditemukan.'
        });
      }

      const playlist = response.data.items[0].snippet;

      // Get playlist items count
      const itemsResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'contentDetails',
          playlistId: playlistId,
          maxResults: 1,
          key: apiKey
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          title: playlist.title,
          thumbnail: playlist.thumbnails?.high?.url || playlist.thumbnails?.medium?.url,
          channelTitle: playlist.channelTitle,
          contentType: 'playlist',
          videoCount: itemsResponse.data.pageInfo?.totalResults || 0
        },
        message: 'Info playlist berhasil diambil.'
      });
    }
  } catch (error) {
    console.error('YouTube fetch error:', error.response?.data || error.message);

    // Handle YouTube API errors
    if (error.response?.data?.error?.code === 404) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Video/playlist tidak ditemukan.'
      });
    }

    if (error.response?.data?.error?.code === 403) {
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
