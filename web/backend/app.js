require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const gameRoutes = require('./src/routes/game.routes');
const voteRoutes = require('./src/routes/vote.routes');
const contentRoutes = require('./src/routes/content.routes');
const todoRoutes = require('./src/routes/todo.routes');
const youtubeRoutes = require('./src/routes/youtube.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const auditLogRoutes = require('./src/routes/auditLog.routes');

// Import middleware
const { globalLimiter } = require('./src/middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Initialize Firebase
const firebaseDb = require('./src/config/firebase');

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Global rate limiter
app.use(globalLimiter.middleware());

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Server is running.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
