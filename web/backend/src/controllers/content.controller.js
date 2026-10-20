const { ContentGuide, User, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { triggerContentUpdate } = require('../utils/firebase.helper');

// Category mapping untuk UI
const CATEGORY_MAP = {
  'zatsu': { name: 'ZATSU', icon: 'ChatIcon', color: '#c084fc' },
  'live2d': { name: 'LIVE2D', icon: 'EyeIcon', color: '#7ee0d2' },
  'live-2d': { name: 'LIVE2D', icon: 'EyeIcon', color: '#7ee0d2' },
  'indie': { name: 'INDIE GAMES', icon: 'GameIcon', color: '#fbbf24' },
  'indie games': { name: 'INDIE GAMES', icon: 'GameIcon', color: '#fbbf24' },
  'karaoke': { name: 'KARAOKE', icon: 'MusicIcon', color: '#f472b6' }
};

// Get category config
const getCategoryConfig = (gameTag) => {
  const key = (gameTag || '').toLowerCase().trim();
  return CATEGORY_MAP[key] || {
    name: gameTag?.toUpperCase() || 'OTHER',
    icon: 'ChatIcon',
    color: '#7ee0d2'
  };
};

/**
 * Format duration string
 */
const formatDuration = (minutes) => {
  if (!minutes) return '0j 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}j ${mins}m`;
};

/**
 * Format relative date
 */
const formatRelativeDate = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  if (days < 14) return '1 minggu lalu';
  if (days < 21) return '2 minggu lalu';
  if (days < 28) return '3 minggu lalu';
  return `${Math.floor(days / 7)} minggu lalu`;
};

/**
 * Get content stats (aggregate)
 * GET /api/content/stats
 */
const getContentStats = async (req, res) => {
  try {
    const contents = await ContentGuide.findAll({
      where: { is_visible: true },
      attributes: ['created_at', 'video_count', 'total_duration']
    });

    const totalStreams = contents.length;

    // Calculate total hours from total_duration (format: "Xh Ym")
    let totalMinutes = 0;
    contents.forEach(c => {
      if (c.total_duration) {
        const hourMatch = c.total_duration.match(/(\d+)h/);
        const minMatch = c.total_duration.match(/(\d+)m/);
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
        if (minMatch) totalMinutes += parseInt(minMatch[1]);
      } else {
        // Default: estimate based on video_count
        totalMinutes += (c.video_count || 1) * 60;
      }
    });

    // Calculate total videos across all content
    const totalVideos = contents.reduce((sum, c) => sum + (c.video_count || 1), 0);

    // Count new content (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newContent = contents.filter(c => new Date(c.created_at) >= sevenDaysAgo).length;

    // Format hours display
    const hoursDisplay = formatDuration(totalMinutes);

    return res.status(200).json({
      success: true,
      data: {
        totalStreams: totalStreams.toString(),
        totalHours: hoursDisplay,
        totalVideos: totalVideos.toString(),
        newContent: newContent.toString()
      },
      message: 'Stats berhasil diambil.'
    });
  } catch (error) {
    console.error('Get content stats error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil stats.'
    });
  }
};

/**
 * Get content categories (grouped by game_tag)
 * GET /api/content/categories
 */
const getContentCategories = async (req, res) => {
  try {
    const contents = await ContentGuide.findAll({
      where: { is_visible: true },
      attributes: ['game_tag', 'video_count', 'created_at']
    });

    // Group by game_tag
    const grouped = {};
    contents.forEach(c => {
      const tag = c.game_tag || 'other';
      if (!grouped[tag]) {
        grouped[tag] = { count: 0, videos: 0 };
      }
      grouped[tag].count += 1;
      grouped[tag].videos += (c.video_count || 1);
    });

    // Transform to array with category config
    const categories = Object.entries(grouped).map(([tag, data]) => {
      const config = getCategoryConfig(tag);
      return {
        id: tag.toLowerCase().replace(/\s+/g, '-'),
        name: config.name,
        icon: config.icon,
        color: config.color,
        count: data.count,
        totalVideos: data.videos.toString()
      };
    });

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories berhasil diambil.'
    });
  } catch (error) {
    console.error('Get content categories error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil categories.'
    });
  }
};

/**
 * Get all visible content guides (public)
 * GET /api/content
 * Query: featured, game_tag, search, page, limit
 */
const getContents = async (req, res) => {
  try {
    const { game_tag, content_type, is_featured, featured, is_visible, visible, search, page = 1, limit = 20, admin } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    // For public viewer: only visible content
    // For admin: allow seeing all content, or filter by is_visible if requested
    const visibleParam = is_visible !== undefined ? is_visible : visible;
    if (admin === 'true') {
      if (visibleParam !== undefined) {
        where.is_visible = visibleParam === 'true' || visibleParam === true;
      }
    } else {
      where.is_visible = true;
    }

    if (game_tag) {
      where.game_tag = game_tag;
    }

    if (content_type) {
      where.content_type = content_type;
    }

    const featuredParam = is_featured !== undefined ? is_featured : featured;
    if (featuredParam !== undefined) {
      where.is_featured = featuredParam === 'true' || featuredParam === true;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { game_tag: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: contents } = await ContentGuide.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }],
      order: [
        ['is_featured', 'DESC'],
        ['sort_order', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit: limitNum,
      offset: offset
    });

    // Transform contents with computed fields for UI
    const transformedContents = contents.map(c => {
      const categoryConfig = getCategoryConfig(c.game_tag);
      const videoCount = c.video_count || 1;
      const daysSinceCreated = Math.floor((new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24));

      let status = '';
      if (daysSinceCreated <= 7) status = 'new';
      else if (videoCount >= 5) status = 'popular';

      return {
        id: c.id,
        title: c.title,
        subtitle: `Stream oleh ${c.user?.name || 'X-VOCA'}`,
        streamer: c.user?.name || 'Admin',
        user: c.user ? { id: c.user.id, name: c.user.name, avatar_url: c.user.avatar_url } : null,
        videoCount: videoCount,
        video_count: videoCount,
        duration: c.total_duration || formatDuration(videoCount * 60),
        total_duration: c.total_duration,
        category: categoryConfig.name,
        categoryId: (c.game_tag || 'other').toLowerCase().replace(/\s+/g, '-'),
        categoryColor: categoryConfig.color,
        categoryIcon: categoryConfig.icon,
        date: formatRelativeDate(c.created_at),
        status: status,
        youtube_url: c.youtube_url,
        youtubeUrl: c.youtube_url,
        thumbnail_url: c.thumbnail_url,
        thumbnailUrl: c.thumbnail_url,
        thumbnail: c.thumbnail_url,
        content_type: c.content_type || 'video',
        contentType: c.content_type || 'video',
        game_tag: c.game_tag,
        gameTag: c.game_tag,
        is_visible: c.is_visible,
        isVisible: c.is_visible,
        is_featured: c.is_featured,
        isFeatured: c.is_featured,
        sort_order: c.sort_order ?? 1,
        sortOrder: c.sort_order ?? 1,
        created_at: c.created_at,
        updated_at: c.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        contents: transformedContents,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      },
      message: 'Daftar konten berhasil diambil.'
    });
  } catch (error) {
    console.error('Get contents error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil konten.'
    });
  }
};

/**
 * Get content by ID
 * GET /api/content/:id
 */
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await ContentGuide.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url']
      }]
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Konten tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: content,
      message: 'Konten berhasil diambil.'
    });
  } catch (error) {
    console.error('Get content by ID error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil konten.'
    });
  }
};

/**
 * Create new content guide
 * POST /api/content
 */
const createContent = async (req, res) => {
  try {
    const {
      title,
      game_tag,
      category,
      youtube_url,
      thumbnail_url,
      thumbnail,
      video_count,
      total_duration,
      content_type,
      is_featured,
      is_visible,
      sort_order
    } = req.body;

    // Validate required fields
    if (!title || !youtube_url) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul dan URL YouTube wajib diisi.'
      });
    }

    const resolvedThumbnail = thumbnail_url || thumbnail || null;
    const resolvedCategory = game_tag || category || 'Lainnya';
    const resolvedVisible = is_visible !== undefined ? Boolean(is_visible) : true;
    const resolvedFeatured = is_featured !== undefined ? Boolean(is_featured) : false;
    const resolvedSortOrder = sort_order !== undefined ? parseInt(sort_order, 10) : 1;

    const content = await ContentGuide.create({
      user_id: req.userId || 1,
      title: title.trim(),
      game_tag: resolvedCategory.trim(),
      youtube_url: youtube_url.trim(),
      thumbnail_url: resolvedThumbnail,
      video_count: video_count ? parseInt(video_count, 10) : 1,
      total_duration: total_duration || null,
      content_type: content_type || 'video',
      is_featured: resolvedFeatured,
      is_visible: resolvedVisible,
      sort_order: resolvedSortOrder
    });

    // Create audit log
    try {
      await AuditLog.create({
        action_type: 'content_added',
        detail: 'Konten baru ditambahkan',
        sub_detail: title
      });
    } catch (logErr) {
      console.warn('AuditLog creation skipped for content:', logErr.message);
    }

    // Broadcast real-time update via Firebase
    try {
      await triggerContentUpdate();
    } catch (fbErr) {
      console.warn('Firebase content broadcast skipped:', fbErr.message);
    }

    return res.status(201).json({
      success: true,
      data: content,
      message: 'Konten berhasil dibuat.'
    });
  } catch (error) {
    console.error('Create content error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat membuat konten.'
    });
  }
};

/**
 * Update content guide
 * PATCH /api/content/:id
 */
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await ContentGuide.findByPk(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Konten tidak ditemukan.'
      });
    }

    // Map aliases if present
    if (updates.thumbnail !== undefined && updates.thumbnail_url === undefined) {
      updates.thumbnail_url = updates.thumbnail;
    }
    if (updates.category !== undefined && updates.game_tag === undefined) {
      updates.game_tag = updates.category;
    }

    // Update fields
    const allowedFields = [
      'title', 'game_tag', 'youtube_url', 'thumbnail_url',
      'video_count', 'total_duration', 'content_type',
      'is_featured', 'is_visible', 'sort_order'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        content[field] = updates[field];
      }
    });

    await content.save();

    // Create audit log
    try {
      await AuditLog.create({
        action_type: 'content_updated',
        detail: 'Konten diperbarui',
        sub_detail: content.title
      });
    } catch (logErr) {
      console.warn('AuditLog creation skipped for content update:', logErr.message);
    }

    // Broadcast real-time update via Firebase
    try {
      await triggerContentUpdate();
    } catch (fbErr) {
      console.warn('Firebase content broadcast skipped:', fbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: content,
      message: 'Konten berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Update content error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memperbarui konten.'
    });
  }
};

/**
 * Delete content guide
 * DELETE /api/content/:id
 */
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await ContentGuide.findByPk(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Konten tidak ditemukan.'
      });
    }

    const contentTitle = content.title;
    await content.destroy();

    // Create audit log
    await AuditLog.create({
      action_type: 'asset_archived',
      detail: 'Konten dihapus',
      sub_detail: contentTitle
    });

    // Broadcast real-time update via Firebase
    try {
      await triggerContentUpdate();
    } catch (fbErr) {
      console.warn('Firebase content broadcast skipped:', fbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Konten berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat menghapus konten.'
    });
  }
};

module.exports = {
  getContents,
  getContentById,
  getContentStats,
  getContentCategories,
  createContent,
  updateContent,
  deleteContent
};
