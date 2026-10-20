import api from './api';

/**
 * Todo Service - API calls untuk todo CRUD operations
 *
 * Backend endpoints:
 * GET  /api/todos      - Get all todos
 * POST /api/todos      - Create todo
 * PATCH /api/todos/:id - Update todo (title, description, priority, deadline, status)
 * DELETE /api/todos/:id - Delete todo
 */

export const todoService = {
  /**
   * Get all todos for current user
   * Backend returns: { success, data: { todos: [...], meta: {...} }
   */
  getAll: async (params = {}) => {
    const response = await api.get('/api/todos', { params });
    return response.data; // Return full response for stats/meta
  },

  /**
   * Create new todo
   * Body: { title, description?, priority?, deadline?, tags? }
   */
  create: async (data) => {
    const response = await api.post('/api/todos', data);
    return response.data;
  },

  /**
   * Update todo by ID
   * Body: { title?, description?, priority?, deadline?, status?, tags? }
   * Status values: 'pending' | 'in_progress' | 'completed'
   */
  update: async (id, data) => {
    const response = await api.patch(`/api/todos/${id}`, data);
    return response.data;
  },

  /**
   * Toggle todo completion
   */
  toggleComplete: async (id, isCompleted) => {
    const status = isCompleted ? 'completed' : 'pending';
    const response = await api.patch(`/api/todos/${id}`, { status });
    return response.data;
  },

  /**
   * Update todo status directly ('pending' | 'in_progress' | 'completed')
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/todos/${id}`, { status });
    return response.data;
  },

  /**
   * Delete todo by ID
   */
  delete: async (id) => {
    const response = await api.delete(`/api/todos/${id}`);
    return response.data;
  },
};

export default todoService;
