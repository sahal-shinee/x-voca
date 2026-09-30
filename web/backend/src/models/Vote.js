const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'game_id',
    references: {
      model: 'games',
      key: 'id'
    }
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'ip_address'
  },
  fingerprint: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  period_key: {
    type: DataTypes.STRING(7),
    allowNull: false,
    field: 'period_key'
  },
  voted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'voted_at'
  }
}, {
  tableName: 'votes',
  timestamps: false, // Using voted_at instead of created_at
  createdAt: false,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['game_id', 'ip_address', 'period_key'],
      name: 'idx_unique_vote'
    },
    {
      unique: true,
      fields: ['game_id', 'fingerprint', 'period_key'],
      name: 'idx_unique_fingerprint'
    },
    { fields: ['period_key'] }
  ]
});

module.exports = Vote;
