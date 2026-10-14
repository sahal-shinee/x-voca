import api from './api';

export const todoService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/todos', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/api/todos', data);
      return response.data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.patch(`/api/todos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  toggleComplete: async (id, isCompleted) => {
    return todoService.update(id, { is_completed: isCompleted });
  },
};

export default todoService;
