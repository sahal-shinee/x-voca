// Import all models
const { sequelize } = require('../config/database');
const User = require('./User');
const Schedule = require('./Schedule');
const Game = require('./Game');
const Vote = require('./Vote');
const ContentGuide = require('./ContentGuide');
const Todo = require('./Todo');
const AuditLog = require('./AuditLog');
const CollabRequest = require('./CollabRequest');

// Define Associations

// User - Schedule (One-to-Many)
User.hasMany(Schedule, {
  foreignKey: 'user_id',
  as: 'schedules'
});
Schedule.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - ContentGuide (One-to-Many)
User.hasMany(ContentGuide, {
  foreignKey: 'user_id',
  as: 'contentGuides'
});
ContentGuide.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Todo (One-to-Many)
User.hasMany(Todo, {
  foreignKey: 'user_id',
  as: 'todos'
});
Todo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Game - Vote (One-to-Many)
Game.hasMany(Vote, {
  foreignKey: 'game_id',
  as: 'votes'
});
Vote.belongsTo(Game, {
  foreignKey: 'game_id',
  as: 'game'
});

// User - CollabRequest (One-to-Many as reviewer)
User.hasMany(CollabRequest, {
  foreignKey: 'reviewed_by',
  as: 'reviewedCollabs'
});
CollabRequest.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer'
});

// Sync database function
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Database synchronized successfully.');

    // Ensure games.cover_url supports long URLs and base64 data URIs
    try {
      await sequelize.query('ALTER TABLE games MODIFY COLUMN cover_url MEDIUMTEXT;');
    } catch (colErr) {
      // Column might already be modified or non-fatal
    }
  } catch (error) {
    console.error('❌ Database synchronization error:', error.message);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Schedule,
  Game,
  Vote,
  ContentGuide,
  Todo,
  AuditLog,
  CollabRequest,
  syncDatabase,
  testConnection
};
