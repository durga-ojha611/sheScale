import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middlewares/auth.middleware.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseFormatter.js';

const router = express.Router();

// PUT /api/user/settings/email
router.put('/email', protect, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw { statusCode: 400, message: 'Email is required' };
  }

  // Check if taken
  const existing = await User.findOne({ email });
  if (existing && existing._id.toString() !== req.user._id.toString()) {
    throw { statusCode: 400, message: 'Email is already in use' };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { email },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  sendSuccess(res, user, 'Email updated successfully');
}));

// PUT /api/user/settings/password
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw { statusCode: 400, message: 'Current and new password are required' };
  }

  const user = await User.findById(req.user._id);
  if (!user.passwordHash) {
    throw { statusCode: 400, message: 'Account is OAuth only. Cannot set password this way.' };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Incorrect current password' };
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  sendSuccess(res, null, 'Password updated successfully');
}));

export default router;
