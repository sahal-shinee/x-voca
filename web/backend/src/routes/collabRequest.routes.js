const express = require('express');
const router = express.Router();
const collabRequestController = require('../controllers/collabRequest.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');
const { collabLimiter } = require('../middleware/rateLimit.middleware');

// Public route: Viewer submits collab request (rate limited to prevent spam)
router.post('/', collabLimiter.middleware(), collabRequestController.createCollabRequest);

// Protected routes: Admin moderation & analytics
// Note: /stats MUST be defined before /:id to prevent route shadowing
router.get('/stats', authMiddleware, adminOnly, collabRequestController.getCollabRequestStats);
router.get('/', authMiddleware, adminOnly, collabRequestController.getCollabRequests);
router.get('/:id', authMiddleware, adminOnly, collabRequestController.getCollabRequestById);
router.patch('/:id/review', authMiddleware, adminOnly, collabRequestController.reviewCollabRequest);
router.delete('/:id', authMiddleware, adminOnly, collabRequestController.deleteCollabRequest);

module.exports = router;
