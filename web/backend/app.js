/**
 * ============================================================================
 * FILE: web/backend/app.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pusat konfigurasi instance aplikasi Express.js.
 * Mengatur pengamanan header HTTP (Security Hardening), pembatasan akses domain (CORS),
 * penguraian payload JSON, pembatasan laju request (Rate Limiting), pendaftaran
 * seluruh modul rute API (`/api/*`), dan penanganan terpusat error 404 serta 500.
 *
 * RELASI ANTAR FILE:
 * - Mengimpor `./src/routes/*`         -> Rute modul fitur (auth, admin, game, vote, dll.).
 * - Mengimpor `./src/middleware/*`     -> Rate limiter & error handler global.
 * - Mengimpor `./src/config/firebase`  -> Inisialisasi Firebase untuk event broadcast.
 * - Diekspor ke `./server.js`          -> Dipanggil untuk di-listen pada port HTTP.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Kami memasang security headers manual (mirip Helmet) untuk mencegah serangan
 *    XSS, Clickjacking, dan MIME sniffing."
 * 2. "CORS dikonfigurasi dinamis agar aman di localhost development, namun fleksibel
 *    mendukung deployment Vercel dan aplikasi Flutter mobile tanpa kendala."
 * ============================================================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ============================================================
// IMPORT MODUL RUTE (ROUTES)
// ============================================================
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const scheduleRoutes = require('./src/routes/schedule.routes');
const gameRoutes = require('./src/routes/game.routes');
const voteRoutes = require('./src/routes/vote.routes');
const contentRoutes = require('./src/routes/content.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const auditLogRoutes = require('./src/routes/auditLog.routes');
const collabRequestRoutes = require('./src/routes/collabRequest.routes');
const todoRoutes = require('./src/routes/todo.routes');
const youtubeRoutes = require('./src/routes/youtube.routes');
const notificationRoutes = require('./src/routes/notification.routes');

// ============================================================
// IMPORT MIDDLEWARE GLOBAL
// ============================================================
const { globalLimiter } = require('./src/middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Inisialisasi Firebase Cloud Services
const firebaseDb = require('./src/config/firebase');

// Inisialisasi instance aplikasi Express
const app = express();

// ============================================================
// KEAMANAN TINGKAT SERVER (SECURITY HEADERS HARDENING)
// ============================================================
// Menyembunyikan header 'x-powered-by: Express' agar peretas tidak mengetahui teknologi server kita
app.disable('x-powered-by');

app.use((req, res, next) => {
  // Mencegah eksekusi script jahat di peramban pengguna (Anti-XSS)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Mencegah peramban menebak tipe konten file selain header yang didefinisikan (Anti-MIME Sniffing)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Melarang website kita di-embed di dalam iframe website lain (Anti-Clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  // Membatasi pengiriman informasi referrer saat pengguna berpindah domain
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Membatasi akses sensor perangkat keras yang tidak dibutuhkan website (kamera, mic, GPS)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Memaksa peramban menggunakan protokol aman HTTPS di server produksi
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Kebijakan sumber konten (Content Security Policy)
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// ============================================================
// KONFIGURASI CORS (CROSS-ORIGIN RESOURCE SHARING)
// ============================================================
// Daftar domain yang diberi izin mengakses API ini
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti dari mobile app Flutter, curl, atau Postman)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Periksa apakah domain request ada di dalam whitelist allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Mendukung otomatis domain preview deployment Vercel (*.vercel.app)
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    // Tolak domain tidak dikenal secara halus tanpa membuat server crash
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-user-id'],
  credentials: true
};
app.use(cors(corsOptions));

// Parsing payload body request menjadi format JSON (dengan batasan ukuran 10 MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mempercayai header reverse proxy (seperti Nginx atau Cloudflare) untuk akurasi Alamat IP
app.set('trust proxy', 1);

// Menjalankan Rate Limiter global untuk mencegah serangan spamming dan DDoS ringan
app.use(globalLimiter.middleware());

// Pencatatan log request sederhana saat berada dalam mode pengembangan (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================
// PENDAFTARAN RUTE API (ROUTES REGISTRATION)
// ============================================================

// Mengimpor handler cron job pembaruan status jadwal
const { updateScheduleStatuses } = require('./src/utils/scheduleCron');

// Endpoint Health Check: Mengonfirmasi bahwa server berjalan sehat
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'X-VOCA Backend API'
    },
    message: 'Server is running smoothly.'
  });
});

// Endpoint Webhook Cron Job untuk auto-update jadwal jika dipanggil oleh scheduler eksternal
app.get(['/cron/schedules', '/api/cron/schedules'], async (req, res) => {
  try {
    const result = await updateScheduleStatuses();
    res.json({
      success: true,
      message: 'Schedule cron executed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1. Rute Autentikasi Admin (Login & Profil)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// 2. Rute Khusus Admin Studio (Semua rute di dalamnya terlindungi JWT dan role adminOnly)
app.use('/api/admin', adminRoutes);

// 3. Rute Publik (Dapat diakses oleh seluruh penonton tanpa login)
app.use('/api/schedules', scheduleRoutes);          // Kalender siaran streaming
app.use('/api/games', gameRoutes);                  // Katalog game untuk voting
app.use('/api/votes', voteRoutes);                  // Submit vote & request game penonton
app.use('/api/content', contentRoutes);              // Arsip video siaran (Content Guide)
app.use('/api/collab-requests', collabRequestRoutes);// Usulan kolaborasi streamer
app.use('/api/notifications', notificationRoutes);  // Notifikasi push topic
app.use('/api/todos', todoRoutes);                  // Checklist agenda internal streamer

// 4. Rute Tambahan untuk Kompatibilitas Lintas Versi
app.use('/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/api/dashboard', dashboardRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/api/audit-logs', auditLogRoutes);
app.use('/youtube', youtubeRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/api/youtube', youtubeRoutes);

// ============================================================
// PENANGANAN ERROR GLOBAL (ERROR HANDLING LAYER)
// ============================================================

// Menangkap request ke endpoint URL yang tidak terdaftar (HTTP 404 Not Found)
app.use(notFoundHandler);

// Menangkap seluruh exception tak terduga (HTTP 500) agar server tetap stabil
app.use(errorHandler);

module.exports = app;
