// middlewares/error.middleware.js — Centralized error handler
// All errors thrown with AppError or unhandled errors land here.
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, _next) => {
  // Default to 500 if no status was set
  const statusCode = err.statusCode || 500;
  const status     = err.status || 'error';

  // Log full error in dev, minimal in prod
  if (env.isDev) {
    console.error('💥 Error:', {
      path: req.path,
      method: req.method,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error(`💥 [${req.method}] ${req.path} — ${statusCode}: ${err.message}`);
  }

  // Mongoose: duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      message: `${field ? `"${field}"` : 'A field'} already exists.`,
    });
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
  }

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong. Please try again.',
    ...(env.isDev && { stack: err.stack }),
  });
};
