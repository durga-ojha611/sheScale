import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export const getChecklistProgress = async (userId) => {
  const user = await User.findById(userId).select('checklistProgress profile');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const completeProfile = Boolean(user.profile?.businessName && user.profile?.domain) || Boolean(user.checklistProgress?.completeProfile);
  const findMatchingScheme = Boolean(user.checklistProgress?.findMatchingScheme);
  const scanIdentityDocs = Boolean(user.checklistProgress?.scanIdentityDocs);
  const generatePnLPlan = Boolean(user.checklistProgress?.generatePnLPlan);

  const checklistProgress = {
    completeProfile,
    findMatchingScheme,
    scanIdentityDocs,
    generatePnLPlan,
  };

  const tasksTrue = Object.values(checklistProgress).filter(Boolean).length;
  const progressPercent = Math.round((tasksTrue / 4) * 100);

  return {
    checklistProgress,
    progressPercent,
  };
};

export const updateChecklistProgress = async (userId, updates) => {
  const allowedKeys = ['completeProfile', 'findMatchingScheme', 'scanIdentityDocs', 'generatePnLPlan'];
  const sanitizedUpdates = {};

  for (const key of allowedKeys) {
    if (typeof updates[key] === 'boolean') {
      sanitizedUpdates[`checklistProgress.${key}`] = updates[key];
    }
  }

  await User.findByIdAndUpdate(
    userId,
    { $set: sanitizedUpdates },
    { new: true }
  );

  return await getChecklistProgress(userId);
};
