/**
 * Database Connection Test Script
 * Run: cd web/backend && node ../test-db-connection.js
 */

const mysql = require('mysql2/promise');

// Read .env manually
const fs = require('fs');
const envContent = fs.readFileSync('./web/backend/.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

async function testConnection() {
  console.log('🔄 Testing MySQL connection to Railway...\n');

  const config = {
    host: env.DB_HOST || 'tokaido.proxy.rlwy.net',
    port: parseInt(env.DB_PORT) || 3306,
    user: env.DB_USER || 'root',
    password: env.DB_PASS,
    database: env.DB_NAME || 'railway',
    connectTimeout: 10000
  };

  console.log('📡 Connection config:');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}\n`);

  let connection;

  try {
    console.log('🔌 Connecting...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');

    // List databases
    console.log('📋 Databases available:');
    const [databases] = await connection.query('SHOW DATABASES');
    databases.forEach(db => {
      const name = Object.values(db)[0];
      const marker = name === config.database ? ' ← TARGET' : '';
      console.log(`   - ${name}${marker}`);
    });

    // Check if target database exists
    console.log(`\n📊 Checking target database '${config.database}'...`);
    const [tables] = await connection.query(`SHOW TABLES FROM \`${config.database}\``);

    if (tables.length === 0) {
      console.log('⚠️  Database exists but is EMPTY. Run migrations: npx sequelize-cli db:migrate');
    } else {
      console.log(`✅ Database has ${tables.length} tables:`);
      tables.forEach(t => {
        const tableName = Object.values(t)[0];
        console.log(`   - ${tableName}`);
      });
    }

    console.log('\n✅ All checks passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('   Error:', error.message);

    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Possible causes:');
      console.error('   1. Railway MySQL instance is sleeping (free tier auto-sleeps after 5 min)');
      console.error('   2. Network firewall blocking port 3306');
      console.error('   3. Railway proxy is down');
      console.error('\n💡 Solutions:');
      console.error('   1. Wake up MySQL from Railway dashboard');
      console.error('   2. Check Railway status at status.railway.app');
    }

    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS resolution failed. Check DB_HOST in .env');
    }

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`\n💡 Database '${config.database}' not found`);
      console.error('   Create it first with: CREATE DATABASE IF NOT EXISTS ${config.database}');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
