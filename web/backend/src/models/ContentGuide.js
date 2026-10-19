const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContentGuide = sequelize.define('ContentGuide', {
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
  game_tag: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'game_tag'
  },
  youtube_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    },
    field: 'youtube_url'
  },
  thumbnail_url: {
    type: DataTypes.TEXT('medium'),
    allowNull: true,
    field: 'thumbnail_url'
  },
  video_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'video_count'
  },
  total_duration: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'total_duration'
  },
  content_type: {
    type: DataTypes.ENUM('video', 'playlist'),
    defaultValue: 'playlist',
    field: 'content_type'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  is_visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_visible'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'content_guides',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['is_visible'] },
    { fields: ['is_featured'] },
    { fields: ['sort_order'] }
  ]
});

module.exports = ContentGuide;
