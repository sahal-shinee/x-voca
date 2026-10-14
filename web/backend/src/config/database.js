const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
  process.env.DB_USER || process.env.MYSQLUSER || 'root',
  // Membaca DB_PASS, DB_PASSWORD, atau MYSQLPASSWORD agar tidak lagi terjadi mismatch
  process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Increase timeout to 60s
      idle: 10000,
      connectTimeout: 60000, // Connection timeout
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