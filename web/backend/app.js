require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const gameRoutes = require('./src/routes/game.routes');
const voteRoutes = require('./src/routes/vote.routes');
const contentRoutes = require('./src/routes/content.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const auditLogRoutes = require('./src/routes/auditLog.routes');
const collabRequestRoutes = require('./src/routes/collabRequest.routes');
const todoRoutes = require('./src/routes/todo.routes');
const youtubeRoutes = require('./src/routes/youtube.routes');

// Import middleware
const { globalLimiter } = require('./src/middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Initialize Firebase
const firebaseDb = require('./src/config/firebase');

const app = express();

// ============================================================
// SECURITY HEADERS
// ============================================================
app.use((req, res, next) => {
  // Prevent XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration - Multi-origin & mobile friendly
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-user-id'],
  credentials: true
};
app.use(cors(corsOptions));

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

// Health check (public) - supports both /health and /api/health
app.get(['/health', '/api/health'], (req, res) => {
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

// Auth routes (login public, profile/password protected in admin routes)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Admin routes (ALL protected with adminOnly middleware)
app.use('/api/admin', adminRoutes);

// Public routes (read-only for everyone)
app.use('/api/schedules', scheduleRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/collab-requests', collabRequestRoutes);
app.use('/api/todos', todoRoutes);

// Legacy protected routes (for backward compatibility)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/youtube', youtubeRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
