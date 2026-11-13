const express = require('express');
const router = express.Router();
const {
  subscribeTokenToTopic,
  getNotificationsFromDb,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  clearAllNotifications
} = require('../utils/firebase.helper');
const { AuditLog } = require('../models');

/**
 * GET /api/notifications
 * Get latest notifications (combines Firebase RTDB with fallback to recent audit logs)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    let list = await getNotificationsFromDb(userId);

    // Fallback: If RTDB is empty, populate from recent AuditLogs
    if (!list || list.length === 0) {
      const recentLogs = await AuditLog.findAll({
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      list = recentLogs.map((log) => ({
        id: `audit_${log.id}`,
        type: log.action_type || 'SYSTEM_UPDATE',
        title: log.action_type === 'collab_requested' ? '🤝 Request Collab Baru' : (log.action_type === 'game_requested' ? '🎮 Request Game Baru' : 'Aktivitas Studio'),
        message: `${log.detail || ''}${log.sub_detail ? ` — ${log.sub_detail}` : ''}`,
        read: false,
        createdAt: new Date(log.created_at).getTime(),
        link: log.action_type === 'collab_requested' ? '/admin/collab-requests' : (log.action_type === 'game_requested' ? '/admin/voting' : '/admin')
      }));
    }

    return res.status(200).json({
      success: true,
      data: list,
      unreadCount: list.filter((n) => !n.read).length,
      message: 'Notifikasi berhasil dimuat.'
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      data: [],
      unreadCount: 0,
      message: 'Gagal mengambil notifikasi.'
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', async (req, res) => {
  try {
    const userId = req.body?.userId || 'default';
    await markAllNotificationsRead(userId);
    return res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai telah dibaca.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menandai notifikasi.'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body?.userId || 'default';
    await markNotificationRead(id, userId);
    return res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai telah dibaca.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menandai notifikasi.'
    });
  }
});

/**
 * DELETE /api/notifications
 * Clear all notifications
 */
router.delete('/', async (req, res) => {
  try {
    const userId = req.query?.userId || 'default';
    await clearAllNotifications(userId);
    return res.status(200).json({
      success: true,
      message: 'Semua notifikasi dibersihkan.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membersihkan notifikasi.'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete single notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query?.userId || 'default';
    await deleteNotificationById(id, userId);
    return res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus notifikasi.'
    });
  }
});

/**
 * POST /api/notifications/subscribe
 * Public endpoint to subscribe a web/mobile FCM token to 'stream_alerts'
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'FCM token wajib diisi.'
      });
    }

    const result = await subscribeTokenToTopic(token.trim(), 'stream_alerts');
    if (!result.success) {
      return res.status(503).json({
        success: false,
        data: null,
        message: result.message || 'Gagal mendaftarkan token notifikasi.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { topic: 'stream_alerts' },
      message: 'Berhasil mengaktifkan pengingat notifikasi siaran!'
    });
  } catch (error) {
    console.error('Notification subscribe error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengaktifkan notifikasi.'
    });
  }
});

module.exports = router;
