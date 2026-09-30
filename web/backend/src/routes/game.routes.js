const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/games - Get all games (public)
router.get('/', gameController.getGames);

// GET /api/games/:id - Get game by ID (public)
router.get('/:id', gameController.getGameById);

// POST /api/games - Create new game (protected)
router.post('/', authMiddleware, gameController.createGame);

// PATCH /api/games/:id/status - Update game status (protected)
router.patch('/:id/status', authMiddleware, gameController.updateGameStatus);

// DELETE /api/games/:id - Delete game (protected)
router.delete('/:id', authMiddleware, gameController.deleteGame);

module.exports = router;
