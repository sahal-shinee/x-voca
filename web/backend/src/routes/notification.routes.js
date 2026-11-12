const express = require('express');
const router = express.Router();
const { subscribeTokenToTopic } = require('../utils/firebase.helper');

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
