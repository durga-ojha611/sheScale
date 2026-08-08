// middlewares/rateLimiter.middleware.js — Rate limiters for auth and AI-calling routes
import rateLimit from 'express-rate-limit';

/**
 * authLimiter — tight limit for signup/login to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

/**
 * aiLimiter — prevents runaway Gemini API costs from a single user
 * Applied to all routes that call Gemini (scheme matching, PDF parse, mentor chat, mock interview)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please slow down.' },
});

/**
 * generalLimiter — broad protection across all other routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
