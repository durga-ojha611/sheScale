import { asyncHandler } from '../utils/asyncHandler.js';
import * as docsService from '../services/docsService.js';

export const analyzeDocument = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'Please upload a PDF document (≤5MB).' });
  }

  const result = await docsService.analyzeDocument(req.user.id, file.buffer, file.originalname);

  res.status(200).json({
    success: true,
    data: result,
  });
});
