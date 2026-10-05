const { Todo, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all todos for current user
 * GET /api/todos
 * Query: status, priority
 * Returns meta: { total, completed_today, pending_deadlines }
 */
const getTodos = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const where = { user_id: req.userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const todos = await Todo.findAll({
      where,
      order: [
        ['priority', 'ASC'], // urgent=1, high=2, medium=3, low=4
        ['deadline', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    // Calculate meta stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const total = await Todo.count({ where: { user_id: req.userId } });

    const completedToday = await Todo.count({
      where: {
        user_id: req.userId,
        status: 'completed',
        completed_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    const pendingDeadlines = await Todo.count({
      where: {
        user_id: req.userId,
        status: { [Op.in]: ['pending', 'in_progress'] },
        deadline: {
          [Op.ne]: null,
          [Op.lte]: tomorrow
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        todos,
        meta: {
          total,
          completed_today: completedToday,
          pending_deadlines: pendingDeadlines
        }
      },
      message: 'Daftar todo berhasil diambil.'
    });
  } catch (error) {
    console.error('Get todos error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil todo.'
    });
  }
};

/**
 * Get todo by ID
 * GET /api/todos/:id
 */
const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: {
        id,
        user_id: req.userId
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo berhasil diambil.'
    });
  } catch (error) {
    console.error('Get todo by ID error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat mengambil todo.'
    });
  }
};

/**
 * Create new todo
 * POST /api/todos
 */
const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      deadline,
      tags,
      resource_info
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Judul todo wajib diisi.'
      });
    }

    const todo = await Todo.create({
      user_id: req.userId,
      title,
      description,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
      tags: tags || [],
      resource_info,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      data: todo,
      message: 'Todo berhasil dibuat.'
    });
  } catch (error) {
    console.error('Create todo error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat membuat todo.'
    });
  }
};

/**
 * Update todo
 * PATCH /api/todos/:id
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const todo = await Todo.findOne({
      where: {
        id,
        user_id: req.userId
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo tidak ditemukan.'
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'description', 'priority', 'deadline',
      'tags', 'resource_info', 'status'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'deadline' && updates[field]) {
          todo[field] = new Date(updates[field]);
        } else {
          todo[field] = updates[field];
        }
      }
    });

    // Set completed_at if marking as completed
    if (updates.status === 'completed' && todo.status !== 'completed') {
      todo.completed_at = new Date();
    }

    await todo.save();

    return res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Update todo error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat memperbarui todo.'
    });
  }
};

/**
 * Delete todo
 * DELETE /api/todos/:id
 */
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      where: {
        id,
        user_id: req.userId
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Todo tidak ditemukan.'
      });
    }

    await todo.destroy();

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Todo berhasil dihapus.'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan saat menghapus todo.'
    });
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
