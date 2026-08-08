// middlewares/validate.middleware.js — express-validator runner middleware
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/**
 * validate — runs after express-validator chains and short-circuits with 422
 * if any field fails validation.
 *
 * Usage:
 *   router.post('/login', [body('email').isEmail()], validate, loginController)
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join('. ');
    throw new AppError(messages, 422);
  }
  next();
};
