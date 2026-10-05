import api from './api';

/**
 * Game Service - API calls untuk game voting
 */

// Ambil semua game
export const getGames = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }

    const response = await api.get(`/api/games?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

// Buat game baru
export const createGame = async (data) => {
  try {
    const response = await api.post('/api/games', data);
    return response.data;
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

// Update status game
export const updateGameStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/games/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating game status:', error);
    throw error;
  }
};

// Hapus game
export const deleteGame = async (id) => {
  try {
    const response = await api.delete(`/api/games/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting game:', error);
    throw error;
  }
};

// Reset periode voting
export const resetVotingPeriod = async () => {
  try {
    const response = await api.post('/api/votes/reset-period');
    return response.data;
  } catch (error) {
    console.error('Error resetting voting period:', error);
    throw error;
  }
};

// Vote untuk game
export const voteGame = async (gameId, fingerprint) => {
  try {
    const response = await api.post(`/api/votes/${gameId}`, { fingerprint });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      return {
        success: false,
        message: 'Kamu sudah vote game ini',
        alreadyVoted: true
      };
    }
    throw error;
  }
};

// Request game baru
export const requestGame = async (data) => {
  try {
    const response = await api.post('/api/votes/request', data);
    return response.data;
  } catch (error) {
    console.error('Error requesting game:', error);
    throw error;
  }
};

// Vote API (for direct export)
export const voteAPI = {
  resetPeriod: () => api.post('/api/votes/reset-period'),
};

export default {
  getGames,
  createGame,
  updateGameStatus,
  deleteGame,
  resetVotingPeriod,
  voteGame,
  requestGame,
  voteAPI,
};
