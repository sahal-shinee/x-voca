import api from './api';

/**
 * Fetch public YouTube channel statistics via backend proxy.
 * The backend caches this response for 5 minutes to stay within API quota.
 *
 * @returns {Promise<{ subscriberCount: number, videoCount: number, viewCount: number }>}
 */
export const getYoutubeStats = async () => {
  const response = await api.get('/api/youtube/stats');
  return response.data?.data ?? null;
};
