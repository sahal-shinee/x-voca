const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// GET /api/games - Get all games (public)
router.get('/', gameController.getGames);

// GET /api/games/periods - Get distinct available period keys (public)
router.get('/periods', gameController.getPeriods);

// GET /api/games/:id - Get game by ID (public)
router.get('/:id', gameController.getGameById);

// POST /api/games - Create new game (admin only)
router.post('/', authMiddleware, adminOnly, gameController.createGame);

// PATCH /api/games/:id/status - Update game status (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, gameController.updateGameStatus);

// DELETE /api/games/:id - Delete game (admin only)
router.delete('/:id', authMiddleware, adminOnly, gameController.deleteGame);

module.exports = router;
