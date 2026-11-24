/**
 * ============================================================================
 * FILE: web/backend/src/models/AuditLog.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Definisi skema tabel `audit_logs` (Rekam Jejak Aktivitas Sistem).
 * Mencatat jenis aksi (`action_type`), detail kejadian, sub-detail, ID user pelaku,
 * dan stempel waktu (`created_at`) untuk audit forensik dan keamanan sistem.
 * ============================================================================
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  action_type: {
    type: DataTypes.ENUM(
      'vote_in',
      'schedule_updated',
      'game_requested',
      'asset_archived',
      'period_reset',
      'content_added',
      'status_changed'
    ),
    allowNull: false,
    field: 'action_type'
  },
  detail: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  sub_detail: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'sub_detail'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['action_type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
