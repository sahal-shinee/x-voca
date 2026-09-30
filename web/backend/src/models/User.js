const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('admin', 'superadmin'),
    defaultValue: 'admin'
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'avatar_url'
  },
  rig_name: {
    type: DataTypes.STRING(100),
    defaultValue: 'Obsidian Rig #03',
    field: 'rig_name'
  },
  rig_version: {
    type: DataTypes.STRING(20),
    defaultValue: 'v3.4',
    field: 'rig_version'
  },
  is_broadcasting: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_broadcasting'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    }
  }
});

// Instance method to verify password
User.prototype.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

// Static method to find by email with password
User.findByEmail = async function(email) {
  return this.findOne({ where: { email } });
};

// Remove password_hash from JSON output
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;
