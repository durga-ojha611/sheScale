// utils/AppError.js — Custom operational error class
// Operational errors (user-facing) are flagged with isOperational = true.
// Programming errors (bugs) are NOT operational and get a generic 500 message in prod.
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode   = statusCode;
    this.status       = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
