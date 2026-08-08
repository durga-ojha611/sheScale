// services/authService.js — Auth business logic: signup, login, JWT generation
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const signup = async ({ email, password, role = 'entrepreneur' }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, role });

  const token = signToken(user._id);
  return { token, user: { id: user._id, email: user.email, role: user.role } };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.passwordHash) throw new AppError('Invalid email or password.', 401);

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);
  if (user.accountStatus !== 'active') throw new AppError('Account is not active.', 403);

  const token = signToken(user._id);
  return { token, user: { id: user._id, email: user.email, role: user.role, profile: user.profile } };
};

export const updateProfile = async (userId, profileData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'profile': { ...profileData } } },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};
