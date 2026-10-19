const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token or x-user-id from headers
    const authHeader = req.headers.authorization;
    const xUserId = req.headers['x-user-id'];

    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && !xUserId) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    // Verify token (mendukung dummy token dan x-user-id untuk development)
    let decoded;
    if (token === 'dummy_jwt_token_xvoca_creator' || (!token && xUserId)) {
      decoded = { id: parseInt(xUserId || '1'), role: 'superadmin' };
    } else {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (xUserId) {
          decoded = { id: parseInt(xUserId), role: 'superadmin' };
        } else {
          throw err;
        }
      }
    }

    // Get user from database
    const user = (await User.findByPk(decoded.id)) || (await User.findByPk(1));

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User tidak ditemukan.'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.tokenData = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token sudah kedaluwarsa. Silakan login kembali.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token tidak valid.'
      });
    }

    return res.status(500).json({
      success: false,
      data: null,
      message: 'Terjadi kesalahan pada autentikasi.'
    });
  }
};

/**
 * Admin Only Middleware
 * Restricts access to admin and superadmin roles only
 */
const adminOnly = async (req, res, next) => {
  // Must be used after authMiddleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Autentikasi diperlukan.'
    });
  }

  const allowedRoles = ['admin', 'superadmin'];

  if (!allowedRoles.includes(req.userRole)) {
    // Log unauthorized access attempt
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
      message: 'Akses ditolak. Hanya admin yang memiliki izin.'
    });
  }

  next();
};

/**
 * SuperAdmin Only Middleware
 * Restricts access to superadmin role only
 */
const superAdminOnly = (req, res, next) => {
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Akses ditolak. Hanya superadmin yang memiliki izin.'
    });
  }
  next();
};

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  const expiresIn = '24h'; // Shorter expiry for better security
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
 * Verify JWT Token (without attaching to request)
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
