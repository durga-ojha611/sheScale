// controllers/auth.controller.js — Validates input, calls authService, returns response
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseFormatter.js';
import * as authService from '../services/authService.js';

export const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['entrepreneur', 'mentor']).withMessage('Role must be entrepreneur or mentor'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

export const signup = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.signup({ email, password, role });
  sendCreated(res, result, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  sendSuccess(res, result, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  sendSuccess(res, user, 'Profile updated successfully');
});
