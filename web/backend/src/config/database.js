const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const isRemoteDb =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_HOST &&
    !process.env.DB_HOST.includes('localhost') &&
    !process.env.DB_HOST.includes('127.0.0.1'));

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
  process.env.DB_USER || process.env.MYSQLUSER || 'root',
  process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isRemoteDb
      ? {
          ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
        }
      : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
      connectTimeout: 60000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updated_at: 'updated_at'
    }
  }
);

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
