const { ContentGuide, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all visible content guides (public)
 * GET /api/content
 * Query: featured, game_tag, search, page, limit
 */
const getContents = async (req, res) => {
  try {
    const { game_tag, content_type, is_featured, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = { is_visible: true };

    if (game_tag) {
      where.game_tag = game_tag;
    }

    if (content_type) {
      where.content_type = content_type;
    }

    if (is_featured !== undefined) {
      where.is_featured = is_featured === 'true';
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

    return res.status(200).json({
      success: true,
      data: {
        contents,
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
      youtube_url,
      thumbnail_url,
      video_count,
      total_duration,
      content_type,
      is_featured,
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

    const content = await ContentGuide.create({
      user_id: req.userId,
      title,
      game_tag,
      youtube_url,
      thumbnail_url,
      video_count: video_count || 1,
      total_duration,
      content_type: content_type || 'playlist',
      is_featured: is_featured || false,
      sort_order: sort_order || 0
    });

    // Create audit log
    await AuditLog.create({
      action_type: 'content_added',
      detail: 'Konten baru ditambahkan',
      sub_detail: title
    });

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
    await AuditLog.create({
      action_type: 'content_added',
      detail: 'Konten diperbarui',
      sub_detail: content.title
    });

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
  createContent,
  updateContent,
  deleteContent
};
