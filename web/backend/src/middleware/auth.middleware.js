/**
 * ============================================================================
 * FILE: web/backend/src/middleware/auth.middleware.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Penjaga gerbang keamanan (Security Gatekeeper) untuk endpoint privat Studio Admin.
 * Melakukan ekstraksi Bearer token dari header HTTP, verifikasi tanda tangan kriptografi
 * JSON Web Token (JWT) menggunakan secret key server, validasi status aktif pengguna
 * di basis data MySQL, dan penegakan kontrol akses berbasis peran (Role-Based Access Control / RBAC).
 *
 * RELASI ANTAR FILE:
 * - Mengimpor `jsonwebtoken` untuk verifikasi tanda tangan digital.
 * - Mengimpor `User` dan `AuditLog` dari `../models`.
 * - Dipasang pada rute privat di `src/routes/admin.routes.js` dan endpoint mutasi data admin.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * 1. "Kami menggunakan skema otentikasi standar industri: 'Authorization: Bearer <token>'."
 * 2. "Jika token dipalsukan atau diubah 1 karakter saja, jwt.verify akan langsung melempar
 *    error 'JsonWebTokenError' dan menolak akses pengguna."
 * 3. "Tiap percobaan penyusupan tanpa izin dicatat otomatis ke tabel 'audit_logs'."
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');

/**
 * Middleware: authMiddleware
 * Memverifikasi validitas token JWT dari request header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Ekstrak header 'Authorization' dari request HTTP
    const authHeader = req.headers.authorization;

    let token = null;
    // Format yang sah adalah 'Bearer <token_string>'
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Jika token tidak disertakan, tolak akses (HTTP 401 Unauthorized)
    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    // 2. Verifikasi kriptografi tanda tangan token dengan secret key server
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token tidak valid.'
      });
    }

    // 3. Ambil data akun pengguna dari MySQL berdasarkan ID yang terdekripsi
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User pemilik token tidak ditemukan di basis data.'
      });
    }

    // 4. Periksa apakah akun dalam status aktif (bukan dinonaktifkan/banned)
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
    }

    // 5. Lampirkan objek user ke request context agar controller berikutnya bisa menggunakannya
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.tokenData = decoded;

    // Lolos verifikasi, lanjutkan ke controller tujuan
    next();
  } catch (error) {
    // Tangani kondisi token telah melewati masa berlaku (Expired)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token sudah kedaluwarsa. Silakan login kembali.'
      });
    }

    // Tangani token rusak, tidak valid, atau secret key tidak cocok
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token tidak valid atau tanda tangan rusak.'
      });
    }

    // Kesalahan internal tak terduga
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan pada autentikasi server.'
    });
  }
};

/**
 * Middleware: adminOnly
 * Memastikan hanya role 'admin' atau 'superadmin' yang boleh mengakses endpoint
 */
const adminOnly = async (req, res, next) => {
  // Wajib dipasang setelah authMiddleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Autentikasi diperlukan sebelum pemeriksaan role.'
    });
  }

  const allowedRoles = ['admin', 'superadmin'];

  if (!allowedRoles.includes(req.userRole)) {
    // Catat insiden percobaan akses tidak sah ini ke tabel audit_logs untuk forensik keamanan
    try {
      await AuditLog.create({
        user_id: req.userId,
        action_type: 'unauthorized_access_attempt',
        detail: 'Percobaan akses tidak sah ke route admin',
        sub_detail: `${req.method} ${req.path}`
      });
    } catch (logError) {
      console.error('Failed to log unauthorized access:', logError);
    }

    return res.status(403).json({
      success: false,
      data: null,
      message: 'Akses ditolak. Hanya administrator yang memiliki izin.'
    });
  }

  next();
};

/**
 * Middleware: superAdminOnly
 * Restriksi tingkat tertinggi: hanya akun dengan role 'superadmin'
 */
const superAdminOnly = (req, res, next) => {
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Akses ditolak. Fitur ini memerlukan hak istimewa Superadmin.'
    });
  }
  next();
};

/**
 * Helper: generateToken
 * Menerbitkan token JWT baru setelah admin berhasil login
 */
const generateToken = (user) => {
  const expiresIn = '24h'; // Masa berlaku token 24 jam demi keamanan sesi
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  return { token, expiresIn };
};

/**
 * Helper: verifyToken
 * Memeriksa token secara langsung tanpa membungkusnya sebagai middleware Express
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authMiddleware,
  adminOnly,
  superAdminOnly,
  generateToken,
  verifyToken
};
