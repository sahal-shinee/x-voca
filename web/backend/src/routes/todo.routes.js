const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// All todo routes are protected
router.use(authMiddleware);

// GET /api/todos - Get all todos for current user
router.get('/', todoController.getTodos);

// GET /api/todos/:id - Get todo by ID
router.get('/:id', todoController.getTodoById);

// POST /api/todos - Create new todo
router.post('/', todoController.createTodo);

// PATCH /api/todos/:id - Update todo
router.patch('/:id', todoController.updateTodo);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
