const { CollabRequest, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Collab Request Controller
 * Handles viewer collab requests and admin moderation
 */

/**
 * Submit collab request (Public - Viewer)
 * POST /api/collab-requests
 */
const createCollabRequest = async (req, res) => {
  try {
    const {
      requested_streamer_name,
      requested_streamer_social,
      message,
      viewer_identifier: bodyViewerIdentifier
    } = req.body;

    // Validate required fields
    if (!requested_streamer_name || !requested_streamer_name.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nama streamer yang di-request wajib diisi.'
      });
    }

    if (requested_streamer_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Nama streamer minimal 2 karakter.'
      });
    }

    // Determine viewer identifier (fingerprint from frontend or client IP)
    const clientIp = (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'anonymous'
    );
    const viewer_identifier = (bodyViewerIdentifier && bodyViewerIdentifier.trim())
      ? bodyViewerIdentifier.trim()
      : clientIp;

    // Current period (YYYY-MM)
    const period_key = new Date().toISOString().slice(0, 7);

    // Create collab request record
    const collabRequest = await CollabRequest.create({
      viewer_identifier,
      requested_streamer_name: requested_streamer_name.trim(),
      requested_streamer_social: requested_streamer_social ? requested_streamer_social.trim() : null,
      message: message ? message.trim() : null,
      status: 'pending',
      period_key
    });

    // Create audit log
    try {
      await AuditLog.create({
        action_type: 'status_changed',
        detail: 'Viewer mengajukan request collab baru',
        sub_detail: requested_streamer_name.trim()
      });
    } catch (logErr) {
      console.warn('AuditLog creation skipped for collab request:', logErr.message);
    }

    return res.status(201).json({
      success: true,
      data: collabRequest,
      message: 'Request collab berhasil dikirim. Terima kasih atas rekomendasimu!'
    });
  } catch (error) {
    console.error('Create collab request error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memproses request collab.'
    });
  }
};

/**
 * List all collab requests with filters and pagination (Protected - Admin)
 * GET /api/collab-requests
 */
const getCollabRequests = async (req, res) => {
  try {
    const {
      status,
      period,
      period_key,
      search,
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const where = {};

    // Filter by status (unless 'all')
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by period
    const targetPeriod = period || period_key;
    if (targetPeriod && targetPeriod !== 'all') {
      where.period_key = targetPeriod;
    }

    // Search by streamer name, social link, or message
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { requested_streamer_name: { [Op.like]: searchTerm } },
        { requested_streamer_social: { [Op.like]: searchTerm } },
        { message: { [Op.like]: searchTerm } }
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Sorting
    const sortField = ['created_at', 'requested_streamer_name', 'status'].includes(sort)
      ? sort
      : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await CollabRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'avatar_url', 'role']
        }
      ],
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages || 1
      }
    });
  } catch (error) {
    console.error('Get collab requests error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil daftar request collab.'
    });
  }
};

/**
 * Get single collab request by ID (Protected - Admin)
 * GET /api/collab-requests/:id
 */
const getCollabRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const collabRequest = await CollabRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'avatar_url', 'role']
        }
      ]
    });

    if (!collabRequest) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Request collab tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: collabRequest
    });
  } catch (error) {
    console.error('Get collab request by ID error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil data request collab.'
    });
  }
};

/**
 * Review collab request (approve/reject/schedule/note) (Protected - Admin)
 * PATCH /api/collab-requests/:id/review
 */
const reviewCollabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, status, notes, review_notes } = req.body;

    const collabRequest = await CollabRequest.findByPk(id);

    if (!collabRequest) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Request collab tidak ditemukan.'
      });
    }

    // Determine target status
    let newStatus = collabRequest.status;
    if (action === 'approve' || action === 'shortlist' || status === 'approved') {
      newStatus = 'approved';
    } else if (action === 'reject' || action === 'archive' || status === 'rejected') {
      newStatus = 'rejected';
    } else if (action === 'scheduled' || status === 'scheduled') {
      newStatus = 'scheduled';
    } else if (action === 'pending' || action === 'reset' || status === 'pending') {
      newStatus = 'pending';
    } else if (action === 'expire' || status === 'expired') {
      newStatus = 'expired';
    } else if (action === 'update_note' || action === 'note' || (!action && !status && (notes !== undefined || review_notes !== undefined))) {
      // Keep existing newStatus
    } else {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Aksi review tidak valid.'
      });
    }

    // Update fields
    const reviewerId = req.userId || req.user?.id || null;
    const resolvedNotes = notes !== undefined ? notes : (review_notes !== undefined ? review_notes : collabRequest.review_notes);

    try {
      await collabRequest.update({
        status: newStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        review_notes: resolvedNotes
      });
    } catch (updateErr) {
      // Fallback in case DB enum does not yet have 'scheduled'
      if (newStatus === 'scheduled') {
        await collabRequest.update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date(),
          review_notes: resolvedNotes ? `${resolvedNotes} (Dijadwalkan)` : '(Dijadwalkan)'
        });
      } else {
        throw updateErr;
      }
    }

    // Create audit log
    try {
      const statusLabels = {
        approved: 'disimpan (shortlist)',
        rejected: 'diarsipkan',
        scheduled: 'dijadwalkan stream',
        pending: 'dikembalikan ke usulan baru',
        expired: 'kedaluwarsa'
      };

      const isNoteOnly = (action === 'update_note' || action === 'note' || (!action && !status && notes !== undefined));
      await AuditLog.create({
        action_type: 'status_changed',
        detail: isNoteOnly
          ? 'Catatan collab request diperbarui oleh admin'
          : `Status collab diubah menjadi ${statusLabels[newStatus] || newStatus} oleh admin`,
        sub_detail: collabRequest.requested_streamer_name
      });
    } catch (logErr) {
      console.warn('AuditLog creation skipped for collab review:', logErr.message);
    }

    // Reload with reviewer association
    const updatedRequest = await CollabRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'email', 'avatar_url', 'role']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: updatedRequest,
      message: `Request collab berhasil di-${newStatus === 'approved' ? 'setujui' : 'tolak'}.`
    });
  } catch (error) {
    console.error('Review collab request error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memproses review request collab.'
    });
  }
};

/**
 * Delete collab request (Protected - Admin)
 * DELETE /api/collab-requests/:id
 */
const deleteCollabRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const collabRequest = await CollabRequest.findByPk(id);

    if (!collabRequest) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Request collab tidak ditemukan.'
      });
    }

    const streamerName = collabRequest.requested_streamer_name;
    await collabRequest.destroy();

    // Create audit log
    try {
      await AuditLog.create({
        action_type: 'asset_archived',
        detail: 'Request collab dihapus',
        sub_detail: streamerName
      });
    } catch (logErr) {
      console.warn('AuditLog creation skipped for collab delete:', logErr.message);
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Request collab berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete collab request error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat menghapus request collab.'
    });
  }
};

/**
 * Get collab request statistics (Protected - Admin)
 * GET /api/collab-requests/stats
 */
const getCollabRequestStats = async (req, res) => {
  try {
    const { period, period_key } = req.query;
    const where = {};

    const targetPeriod = period || period_key;
    if (targetPeriod && targetPeriod !== 'all') {
      where.period_key = targetPeriod;
    }

    const [total, pending, approved, scheduled, rejected, expired] = await Promise.all([
      CollabRequest.count({ where }),
      CollabRequest.count({ where: { ...where, status: 'pending' } }),
      CollabRequest.count({ where: { ...where, status: 'approved' } }),
      CollabRequest.count({ where: { ...where, status: 'scheduled' } }).catch(() => 0),
      CollabRequest.count({ where: { ...where, status: 'rejected' } }),
      CollabRequest.count({ where: { ...where, status: 'expired' } })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        scheduled: scheduled || 0,
        rejected,
        expired
      }
    });
  } catch (error) {
    console.error('Get collab request stats error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil statistik request collab.'
    });
  }
};

module.exports = {
  createCollabRequest,
  getCollabRequests,
  getCollabRequestById,
  reviewCollabRequest,
  deleteCollabRequest,
  getCollabRequestStats
};
