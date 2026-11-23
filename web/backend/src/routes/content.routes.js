const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// GET /api/content/stats - Get aggregate stats (public)
router.get('/stats', contentController.getContentStats);

// GET /api/content/categories - Get grouped categories (public)
router.get('/categories', contentController.getContentCategories);

// GET /api/content - Get all visible content guides (public)
router.get('/', contentController.getContents);

// GET /api/content/:id - Get content by ID (public)
router.get('/:id', contentController.getContentById);

// POST /api/content - Create new content (admin only)
router.post('/', authMiddleware, adminOnly, contentController.createContent);

// PATCH /api/content/:id - Update content (admin only)
router.patch('/:id', authMiddleware, adminOnly, contentController.updateContent);

// DELETE /api/content/:id - Delete content (admin only)
router.delete('/:id', authMiddleware, adminOnly, contentController.deleteContent);

module.exports = router;
