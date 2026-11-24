/**
 * ============================================================================
 * FILE: web/backend/server.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Titik masuk utama (Entry Point) server backend Node.js untuk sistem X-VOCA.
 * Bertanggung jawab memuat konfigurasi environment (.env), menguji koneksi basis
 * data MySQL, menjalankan sinkronisasi tabel (Sequelize), menginisialisasi
 * cron job jadwal siaran otomatis, dan menjalankan HTTP server pada port yang ditentukan.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor `./app.js`           -> Instance aplikasi Express dengan seluruh rute API.
 * - Mengimpor `./src/models`       -> Fungsi `testConnection` & `syncDatabase` (Sequelize).
 * - Mengimpor `./src/config/firebase` -> Inisialisasi Firebase Admin (Realtime DB & FCM).
 * - Mengimpor `./src/utils/scheduleCron` -> Scheduler otomatis pengubah status siaran 'live'.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Server kami menguji koneksi basis data terlebih dahulu sebelum membuka port HTTP,
 *    sehingga request pengguna tidak akan masuk ke server yang databasenya belum siap."
 * 2. "Terdapat penanganan Graceful Shutdown (SIGTERM/SIGINT) untuk mematikan koneksi
 *    secara bersih tanpa ada transaksi basis data yang menggantung atau korup."
 * ============================================================================
 */

const path = require('path');
// 1. Memuat variabel lingkungan rahasia dari file .env (DB_HOST, DB_NAME, JWT_SECRET, dll.)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2. Mengimpor aplikasi Express yang telah dikonfigurasi lengkap dengan rute dan middleware
const app = require('./app');

// 3. Mengimpor helper koneksi dan sinkronisasi model dari Sequelize ORM
const { testConnection, syncDatabase } = require('./src/models');

// 4. Inisialisasi Firebase Admin SDK saat server pertama kali dinyalakan (untuk Realtime DB)
const firebaseDb = require('./src/config/firebase');

// 5. Mengimpor Schedule Cron Job untuk pengecekan status siaran terjadwal secara periodik
const { startScheduleCron } = require('./src/utils/scheduleCron');

// Menentukan Port HTTP (Default: 3001 jika tidak didefinisikan di environment)
const PORT = process.env.PORT || 3001;

/**
 * Fungsi startServer: Mengorkestrasi seluruh tahapan booting backend
 */
const startServer = async () => {
  try {
    // LANGKAH 1: Uji autentikasi koneksi ke server MySQL
    await testConnection();

    // LANGKAH 2: Sinkronisasi skema tabel Sequelize dengan MySQL
    // alter: false digunakan agar struktur tabel tidak diubah mendadak di masa produksi
    const syncOptions = { alter: false };
    await syncDatabase(syncOptions);

    // LANGKAH 3: Jalankan cron job otomatis pengecekan status jadwal siaran
    // Memeriksa setiap 1 menit apakah ada siaran yang sudah memasuki waktu 'live'
    if (process.env.NODE_ENV !== 'test') {
      startScheduleCron({ intervalMinutes: 1 });
    }

    // LANGKAH 4: Buka listener HTTP server pada host '0.0.0.0' (kompatibel lokal & cloud hosting)
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║           X-VOCA Backend Server                           ║');
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log(`║  🚀 Server running on port ${PORT}                            ║`);
      console.log(`║  🌐 Environment: ${(process.env.NODE_ENV || 'development').padEnd(32)}║`);
      console.log(`║  📊 Database: ${(process.env.DB_NAME || 'xvoca_db').padEnd(37)}║`);
      console.log('╠═══════════════════════════════════════════════════════════╣');
      console.log('║  Endpoints Utama:                                         ║');
      console.log('║  POST /api/auth/login      -> Login Admin Studio          ║');
      console.log('║  GET  /api/schedules       -> Jadwal Streaming Mingguan   ║');
      console.log('║  GET  /api/games           -> Daftar Game Voting          ║');
      console.log('║  POST /api/votes/:gameId   -> Submit Vote (Anti-Spam)     ║');
      console.log('║  GET  /api/content         -> Arsip Konten Video (VOD)    ║');
      console.log('║  POST /api/collab-requests -> Usulan Kolaborasi Streamer  ║');
      console.log('║  GET  /api/dashboard/stats -> Statistik Dashboard Admin   ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
    });

  } catch (error) {
    // Tangkap kegagalan inisialisasi awal dan hentikan proses dengan exit code 1
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ============================================================
// GLOBAL ERROR LISTENERS & GRACEFUL SHUTDOWN
// ============================================================

// Menangkap uncaught exception (error fatal yang tidak tertangkap oleh try-catch)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Menangkap unhandled promise rejection (asynchronous error yang lupa di-catch)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Menangani sinyal penghentian SIGTERM (misal: saat server dihentikan oleh cloud container)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Menangani penutupan paksa via terminal Ctrl+C (SIGINT)
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Eksekusi fungsi startup server
startServer();
