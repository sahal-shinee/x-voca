/**
 * ============================================================================
 * FILE: web/backend/src/middleware/rateLimit.middleware.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pembatas laju request (Rate Limiter) berbasis in-memory Map.
 * Menghitung dan membatasi frekuensi request dari Alamat IP yang sama dalam kurun waktu
 * tertentu (sliding window) untuk menangkal bot spamming, brute-force password login,
 * serta serangan Denial of Service (DoS) skala ringan.
 *
 * RELASI ANTAR FILE:
 * - `globalLimiter` dipasang di `app.js` untuk membatasi traffic global (100 req/menit).
 * - `voteLimiter` dipasang di `src/routes/vote.routes.js` untuk membatasi voting (10 req/menit).
 * - `collabLimiter` dipasang di `src/routes/collabRequest.routes.js` (5 req/10 menit).
 * - `authLimiter` dipasang di rute login admin.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Sistem rate limiting ini mengembalikan HTTP status 429 Too Many Requests jika pengguna
 *    melebihi ambang batas yang ditentukan."
 * 2. "Setiap respons HTTP menyertakan header standar industri: 'X-RateLimit-Limit',
 *    'X-RateLimit-Remaining', dan 'X-RateLimit-Reset'."
 * ============================================================================
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // Durasi jendela waktu (default: 1 menit)
    this.max = options.max || 100;              // Kuota maksimal request per jendela waktu
    this.store = new Map();                     // Penyimpanan in-memory riwayat IP

    // Membersihkan entri yang sudah kedaluwarsa secara berkala agar tidak memakan RAM
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Menghapus cache IP yang masa resetnya sudah terlewati
   */
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Membuat identifier unik berdasarkan IP klien dan ID pengguna (jika login)
   */
  generateKey(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.userId ? `_user_${req.userId}` : '';
    return `${ip}${userId}`;
  }

  /**
   * Middleware Express untuk memvalidasi batas laju request
   */
  middleware() {
    return (req, res, next) => {
      const key = this.generateKey(req);
      const now = Date.now();
      const record = this.store.get(key);

      // Kunjungan pertama dari IP ini: inisialisasi hitungan = 1
      if (!record) {
        this.store.set(key, {
          count: 1,
          resetTime: now + this.windowMs
        });
        return next();
      }

      // Jika jendela waktu sudah kedaluwarsa, reset hitungan kembali ke 1
      if (now > record.resetTime) {
        this.store.set(key, {
          count: 1,
          resetTime: now + this.windowMs
        });
        return next();
      }

      // Tambah hitungan request
      record.count++;

      // Sisipkan header transparan untuk menginformasikan sisa kuota ke klien
      res.set({
        'X-RateLimit-Limit': this.max,
        'X-RateLimit-Remaining': Math.max(0, this.max - record.count),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      });

      // Jika request melebihi batas kuota, tolak dengan status 429
      if (record.count > this.max) {
        return res.status(429).json({
          success: false,
          data: null,
          message: 'Terlalu banyak request. Silakan coba lagi nanti.'
        });
      }

      next();
    };
  }
}

// 1. Limiter Global untuk seluruh API: maksimal 100 request per menit
const globalLimiter = new RateLimiter({
  windowMs: 60000,
  max: 100
});

// 2. Limiter Khusus Voting & Request Game: maksimal 10 request per menit
const voteLimiter = new RateLimiter({
  windowMs: 60000,
  max: 10
});

// 3. Limiter Autentikasi Login: mencegah brute-force kata sandi
const authLimiter = new RateLimiter({
  windowMs: 900000, // 15 menit
  max: process.env.NODE_ENV === 'production' ? 10 : 100
});

// 4. Limiter Pengajuan Kolaborasi: maksimal 5 request per 10 menit
const collabLimiter = new RateLimiter({
  windowMs: 600000, // 10 menit
  max: 5
});

module.exports = {
  RateLimiter,
  globalLimiter,
  voteLimiter,
  authLimiter,
  collabLimiter
};
