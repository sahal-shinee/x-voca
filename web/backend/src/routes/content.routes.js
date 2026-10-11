const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/content/stats - Get aggregate stats (public)
router.get('/stats', contentController.getContentStats);

// GET /api/content/categories - Get grouped categories (public)
router.get('/categories', contentController.getContentCategories);

// GET /api/content - Get all visible content guides (public)
router.get('/', contentController.getContents);

// GET /api/content/:id - Get content by ID (public)
router.get('/:id', contentController.getContentById);

// POST /api/content - Create new content (protected)
router.post('/', authMiddleware, contentController.createContent);

// PATCH /api/content/:id - Update content (protected)
router.patch('/:id', authMiddleware, contentController.updateContent);

// DELETE /api/content/:id - Delete content (protected)
router.delete('/:id', authMiddleware, contentController.deleteContent);

module.exports = router;
