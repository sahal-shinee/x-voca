require('dotenv').config();

const app = require('./app');
const { testConnection, syncDatabase } = require('./src/models');

// Import Firebase (initialize on startup)
const firebaseDb = require('./src/config/firebase');

// Import Schedule Cron Job
const { startScheduleCron } = require('./src/utils/scheduleCron');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models (create tables if not exist)
    // Set alter: true in development to auto-update tables
    // Set alter: false in production for manual migrations
    const syncOptions = process.env.NODE_ENV === 'production'
      ? { alter: false }
      : { alter: true };

    await syncDatabase(syncOptions);

    // Start schedule auto-status cron job
    // Checks every 1 minute for schedules that should go 'live'
    if (process.env.NODE_ENV !== 'test') {
      startScheduleCron({ intervalMinutes: 1 });
    }

    // Start the server with host '0.0.0.0' for Railway compatibility
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║           X-VOCA Backend Server                           ║');
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log(`║  🚀 Server running on port ${PORT}                            ║`);
      console.log(`║  🌐 Environment: ${(process.env.NODE_ENV || 'development').padEnd(32)}║`);
      console.log(`║  📊 Database: ${(process.env.DB_NAME || 'xvoca_db').padEnd(37)}║`);
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log('║  Endpoints:                                               ║');
      console.log('║  POST /api/auth/login                                     ║');
      console.log('║  GET  /api/schedules                                      ║');
      console.log('║  GET  /api/games                                          ║');
      console.log('║  POST /api/votes/:gameId                                  ║');
      console.log('║  GET  /api/content                                        ║');
      console.log('║  POST /api/collab-requests                                ║');
      console.log('║  GET  /api/dashboard/stats                                ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();