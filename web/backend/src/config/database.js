/**
 * ============================================================================
 * FILE: web/backend/src/config/database.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Menginisialisasi koneksi basis data relasional MySQL menggunakan Sequelize ORM.
 * Mengonfigurasi parameter connection pooling, SSL untuk remote cloud database (TiDB/Railway),
 * konvensi penamaan kolom basis data (snake_case), dan fungsi pengujian koneksi.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor driver `mysql2`.
 * - Diekspor ke seluruh model di `src/models/*.js` untuk mendefinisikan tabel.
 * - Diekspor ke `server.js` untuk fungsi `testConnection()`.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Kami menggunakan Sequelize ORM agar query basis data aman dari SQL Injection."
 * 2. "Connection Pooling (max: 5, idle: 10000ms) diatur agar koneksi MySQL digunakan kembali
 *    secara efisien tanpa boros memori."
 * ============================================================================
 */

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

// Mendeteksi apakah basis data berada di cloud/remote yang membutuhkan koneksi terenkripsi SSL
const isRemoteDb =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_HOST &&
    !process.env.DB_HOST.includes('localhost') &&
    !process.env.DB_HOST.includes('127.0.0.1'));

// Inisialisasi instance Sequelize dengan kredensial dari environment variable
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
  process.env.DB_USER || process.env.MYSQLUSER || 'root',
  process.env.DB_PASS || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    dialectModule: mysql2, // Driver MySQL2 berperforma tinggi
    // Menampilkan log query SQL hanya saat mode pengembangan (development)
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: isRemoteDb
      ? {
          ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
        }
      : {},
    // Konfigurasi Connection Pool untuk optimasi penggunaan koneksi bersama
    pool: {
      max: 5,           // Maksimal 5 koneksi simultan aktif
      min: 0,           // Minimal 0 koneksi saat tidak ada lalu lintas
      acquire: 60000,   // Waktu maksimal menunggu koneksi tersedia (60 detik)
      idle: 10000,      // Waktu koneksi dilepas jika tidak terpakai (10 detik)
      connectTimeout: 60000
    },
    // Konvensi penamaan tabel & kolom secara otomatis
    define: {
      timestamps: true,       // Otomatis mengelola kolom created_at dan updated_at
      underscored: true,      // Mengubah format camelCase menjadi snake_case di SQL
      createdAt: 'created_at',
      updated_at: 'updated_at'
    }
  }
);

/**
 * Fungsi testConnection: Menguji autentikasi dan ketersediaan server MySQL
 */
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
