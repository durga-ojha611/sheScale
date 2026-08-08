import { asyncHandler } from '../utils/asyncHandler.js';
import * as checklistService from '../services/userChecklistService.js';

export const getChecklist = asyncHandler(async (req, res) => {
  const checklist = await checklistService.getChecklistProgress(req.user.id);
  res.status(200).json({
    success: true,
    data: checklist,
  });
});

export const updateChecklist = asyncHandler(async (req, res) => {
  const updatedChecklist = await checklistService.updateChecklistProgress(req.user.id, req.body);
  res.status(200).json({
    success: true,
    data: updatedChecklist,
  });
});
