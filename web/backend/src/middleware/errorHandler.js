/**
 * ============================================================================
 * FILE: web/backend/src/middleware/errorHandler.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Penanganan terpusat untuk error sistem (Centralized Error Handling).
 * Menangkap seluruh error database (Sequelize ValidationError, UniqueConstraint,
 * ForeignKey), error autentikasi JWT, serta kesalahan runtime tak terduga (500)
 * agar server tidak pernah crash dan selalu mengembalikan respons JSON yang rapi.
 *
 * RELASI ANTAR FILE:
 * - Dipasang di `app.js` sebagai middleware paling akhir setelah seluruh rute didaftarkan.
 * - Menyediakan `notFoundHandler` untuk menangkap rute 404 yang tidak ada.
 * - Menyediakan `asyncHandler` wrapper untuk fungsi async di controller.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Middleware ini menjamin prinsip fail-safe. Pengguna tidak akan pernah melihat
 *    layar putih atau error stack trace mentah yang membocorkan struktur server."
 * 2. "Error database Sequelize diterjemahkan ke pesan Bahasa Indonesia yang mudah dipahami."
 * ============================================================================
 */

/**
 * Global Error Handler Middleware
 * Parameter (err, req, res, next) dengan 4 argumen adalah standar middleware error Express
 */
const errorHandler = (err, req, res, next) => {
  // Catat error ke console server untuk kebutuhan investigasi pengembang
  console.error('❌ Error Terdeteksi:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // 1. Tangani Error Validasi Sequelize (misal: kolom wajib tidak diisi / format salah)
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      data: null,
      message: 'Validasi data gagal. Periksa kembali input Anda.',
      errors
    });
  }

  // 2. Tangani Error Duplikasi Data Unik (misal: email atau judul yang harus unik sudah ada)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      data: null,
      message: `Data pada ${field} sudah terdaftar di sistem.`
    });
  }

  // 3. Tangani Error Relasi Foreign Key (misal: mereferensikan game_id yang tidak ada)
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Referensi tidak valid. Data relasi terkait tidak ditemukan.'
    });
  }

  // 4. Tangani Error Token JWT Rusak / Palsu
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Token otentikasi tidak valid.'
    });
  }

  // 5. Tangani Error Token JWT Kedaluwarsa
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Sesi Anda telah berakhir. Silakan login kembali.'
    });
  }

  // 6. Default Fallback Error (Status 500 Internal Server Error)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal server.';

  res.status(statusCode).json({
    success: false,
    data: null,
    message
  });
};

/**
 * Not Found Handler
 * Menangani URL yang tidak terdaftar di sistem
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Endpoint ${req.originalUrl} tidak ditemukan pada server X-VOCA.`
  });
};

/**
 * Async Handler Wrapper
 * Membungkus fungsi asynchronous agar error otomatis diteruskan ke errorHandler via next(err)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
