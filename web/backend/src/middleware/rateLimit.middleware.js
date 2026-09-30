// Simple in-memory rate limiter using Map
// For production, consider using Redis

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.max = options.max || 100; // 100 requests per window default
    this.store = new Map();

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  generateKey(req) {
    // Use IP as primary key, with optional user ID for authenticated requests
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.userId ? `_user_${req.userId}` : '';
    return `${ip}${userId}`;
  }

  middleware() {
    return (req, res, next) => {
      const key = this.generateKey(req);
      const now = Date.now();
      const record = this.store.get(key);

      if (!record) {
        // First request from this key
        this.store.set(key, {
          count: 1,
          resetTime: now + this.windowMs
        });
        return next();
      }

      // Check if window has expired
      if (now > record.resetTime) {
        this.store.set(key, {
          count: 1,
          resetTime: now + this.windowMs
        });
        return next();
      }

      // Increment count
      record.count++;

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': this.max,
        'X-RateLimit-Remaining': Math.max(0, this.max - record.count),
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
      });

      // Check if limit exceeded
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

// Global rate limiter for general API
const globalLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  max: 100
});

// Strict rate limiter for voting
const voteLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  max: 10 // Max 10 votes per minute
});

// Strict rate limiter for auth endpoints
const authLimiter = new RateLimiter({
  windowMs: 900000, // 15 minutes
  max: 5 // Max 5 login attempts per 15 minutes
});

module.exports = {
  globalLimiter,
  voteLimiter,
  authLimiter,
  RateLimiter
};
