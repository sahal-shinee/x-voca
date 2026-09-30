const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  game_category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'game_category'
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'scheduled_at'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  youtube_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'youtube_url'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_url'
  },
  stream_platform: {
    type: DataTypes.STRING(50),
    defaultValue: 'YouTube',
    field: 'stream_platform'
  },
  countdown_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'countdown_enabled'
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'live', 'done', 'archived'),
    defaultValue: 'upcoming'
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['scheduled_at'] }
  ]
});

module.exports = Schedule;
