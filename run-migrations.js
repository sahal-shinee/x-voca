require('dotenv').config({ path: './web/backend/.env' });
const { sequelize, testConnection } = require('./web/backend/src/config/database');

async function runMigrations() {
  try {
    console.log('🔄 Testing database connection...');
    await testConnection();

    console.log('🔄 Running migrations...');
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', {
      stdio: 'inherit',
      cwd: './web/backend',
      env: {
        ...process.env,
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT || 3306
      }
    });

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
