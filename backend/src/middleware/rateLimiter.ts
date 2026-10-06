import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many attempts from this IP, please try again after 15 minutes',
      },
    });
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated tests to prevent false failures unless explicitly testing rate limiter
});
