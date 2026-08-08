// middlewares/auth.middleware.js — JWT verification + role-based access control
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * protect — verifies JWT and attaches req.user
 * Usage: router.get('/route', protect, controller)
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) throw new AppError('User no longer exists.', 401);
  if (user.accountStatus === 'suspended') throw new AppError('Account suspended.', 403);

  req.user = user;
  next();
});

/**
 * restrictTo — role-based access control
 * Usage: router.post('/admin/sync', protect, restrictTo('admin'), controller)
 */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('You do not have permission to perform this action.', 403);
  }
  next();
};
