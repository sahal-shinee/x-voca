const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CollabRequest = sequelize.define('CollabRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  viewer_identifier: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'viewer_identifier',
    comment: 'fingerprint or IP address'
  },
  requested_streamer_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'requested_streamer_name',
    validate: {
      notEmpty: true
    }
  },
  requested_streamer_social: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'requested_streamer_social'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reviewed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'review_notes'
  },
  period_key: {
    type: DataTypes.STRING(7),
    allowNull: false,
    field: 'period_key'
  }
}, {
  tableName: 'collab_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['period_key'] }
  ]
});

module.exports = CollabRequest;

