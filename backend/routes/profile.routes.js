import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseFormatter.js';

const router = express.Router();

// GET /api/user/me
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  
  // Calculate completed steps for checklist
  let completed = 0;
  if (user.checklistProgress) {
    if (user.checklistProgress.completeProfile) completed++;
    if (user.checklistProgress.findMatchingScheme) completed++;
    if (user.checklistProgress.scanIdentityDocs) completed++;
    if (user.checklistProgress.generatePnLPlan) completed++;
  }
  
  // Append calculated checklist progress
  const userObj = user.toObject();
  userObj.checklistProgress.completedSteps = completed;
  userObj.checklistProgress.totalSteps = 4;

  sendSuccess(res, userObj);
}));

// PUT /api/user/details
router.put('/details', protect, asyncHandler(async (req, res) => {
  const { name, businessIdea, category } = req.body;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (businessIdea !== undefined) updateData['businessDetails.businessIdea'] = businessIdea;
  if (category !== undefined) updateData['businessDetails.category'] = category;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  sendSuccess(res, user, 'Profile updated successfully');
}));

export default router;
