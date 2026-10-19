const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cover_url: {
    type: DataTypes.TEXT('medium'),
    allowNull: true,
    field: 'cover_url'
  },
  vote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'vote_count'
  },
  status: {
    type: DataTypes.ENUM('requested', 'accepted', 'playing', 'done'),
    defaultValue: 'requested'
  },
  added_by: {
    type: DataTypes.ENUM('viewer', 'creator'),
    defaultValue: 'viewer',
    field: 'added_by'
  },
  requester_info: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'requester_info'
  },
  period_key: {
    type: DataTypes.STRING(7),
    allowNull: false,
    field: 'period_key'
  }
}, {
  tableName: 'games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['period_key'] },
    { fields: ['vote_count'] }
  ]
});

module.exports = Game;
