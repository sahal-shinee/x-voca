// App-wide constants

// Status constants
export const GAME_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  PLAYING: 'playing',
  DONE: 'done',
};

// Priority constants
export const PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  DONE: 'done',
};

// Content categories
export const CONTENT_CATEGORY = {
  GAMING: 'gaming',
  TALK: 'talk',
  MUSIC: 'music',
  PLAYLIST: 'playlist',
};

// Local storage keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'xvoca_admin_token',
  VOTED_PREFIX: 'xvoca_voted_',
};

// API endpoints (relative)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    BROADCASTING: '/api/auth/broadcasting',
  },
  SCHEDULES: '/api/schedules',
  GAMES: '/api/games',
  VOTES: '/api/votes',
  CONTENT: '/api/content',
  TODOS: '/api/todos',
  DASHBOARD: '/api/dashboard',
  YOUTUBE: '/api/youtube',
};

// Admin routes
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  SCHEDULES: '/admin/schedules',
  VOTING: '/admin/voting',
  CONTENT: '/admin/content',
};

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  VOTING: '/voting',
  CONTENT: '/content',
};
