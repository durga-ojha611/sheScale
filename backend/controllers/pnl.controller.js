import { asyncHandler } from '../utils/asyncHandler.js';
import * as pnlService from '../services/pnlService.js';

export const generatePnL = asyncHandler(async (req, res) => {
  const { businessIdea, category } = req.body;
  const pnlData = await pnlService.generatePnLPlan(req.user.id, businessIdea, category);
  res.status(200).json({
    success: true,
    data: pnlData,
  });
});

export const getPnL = asyncHandler(async (req, res) => {
  const result = await pnlService.getPnLPlan(req.user.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});
