import api from './api';

/**
 * Content Service - API calls untuk content guide
 */

// Ambil semua konten dengan pagination dan filter
export const getContent = async (params = {}) => {
  try {
    const { page = 1, limit = 9, tag, search, featured, admin = false } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (tag) queryParams.append('tag', tag);
    if (search) queryParams.append('search', search);
    if (featured !== undefined) queryParams.append('featured', featured);
    if (admin) queryParams.append('admin', 'true');

    const response = await api.get(`/api/content?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// Ambil konten berdasarkan game tag
export const getContentByTag = async (tag, params = {}) => {
  return getContent({ ...params, tag });
};

// Ambil featured content (hanya 1)
export const getFeatured = async () => {
  try {
    const response = await api.get('/api/content?featured=true&limit=1');
    return {
      success: true,
      data: response.data?.content?.[0] || null
    };
  } catch (error) {
    console.error('Error fetching featured content:', error);
    throw error;
  }
};

// Buat konten baru
export const createContent = async (data) => {
  try {
    const response = await api.post('/api/content', data);
    return response.data;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Update konten
export const updateContent = async (id, data) => {
  try {
    const response = await api.patch(`/api/content/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Hapus konten
export const deleteContent = async (id) => {
  try {
    const response = await api.delete(`/api/content/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Toggle visibility
export const toggleContentVisibility = async (id, isVisible) => {
  return updateContent(id, { is_visible: isVisible });
};

// Toggle featured
export const toggleContentFeatured = async (id, isFeatured) => {
  return updateContent(id, { is_featured: isFeatured });
};

export default {
  getContent,
  getContentByTag,
  getFeatured,
  createContent,
  updateContent,
  deleteContent,
  toggleContentVisibility,
  toggleContentFeatured,
};
