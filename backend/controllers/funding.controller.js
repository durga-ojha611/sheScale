// controllers/funding.controller.js — Funding Hub orchestration (Features 1.2 – 1.4)
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as fundingService from '../services/fundingService.js';

// ── Applications ─────────────────────────────────────────────────────────────

export const createApplication = asyncHandler(async (req, res) => {
  const app = await fundingService.createApplication(req.user._id, req.body);
  sendCreated(res, app, 'Funding application created');
});

export const getApplications = asyncHandler(async (req, res) => {
  const apps = await fundingService.getUserApplications(req.user._id);
  sendSuccess(res, apps);
});

export const getApplication = asyncHandler(async (req, res) => {
  const app = await fundingService.getApplicationById(req.params.id, req.user._id);
  sendSuccess(res, app);
});

// ── Feature 1.2: PDF Doc-Whisperer ───────────────────────────────────────────

export const parsePdf = asyncHandler(async (req, res) => {
  if (!req.file) throw { statusCode: 400, message: 'No PDF file uploaded.', isOperational: true };
  const result = await fundingService.processPolicyPdf(
    req.params.id,
    req.user._id,
    req.file.buffer,
    req.file.originalname
  );
  sendSuccess(res, result, 'PDF analysed successfully');
});

// ── Feature 1.3: Document Pre-Flight Scanner ──────────────────────────────────

export const scanDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw { statusCode: 400, message: 'No document file uploaded.', isOperational: true };
  const { docType } = req.body;
  if (!docType) throw { statusCode: 400, message: 'docType is required.', isOperational: true };

  const result = await fundingService.scanAndTrackDocument(
    req.params.id,
    req.user._id,
    req.file.buffer,
    docType
  );
  sendSuccess(res, result, `Document scan complete: ${result.scanResult}`);
});

// ── Feature 1.4: BizCalculus Financial Planner ───────────────────────────────

export const createFinancialPlanValidation = [
  body('inputs.sellingPricePerUnit').isNumeric().withMessage('Selling price must be a number'),
  body('inputs.rawMaterialCostPerUnit').isNumeric().withMessage('Raw material cost must be a number'),
  body('inputs.monthlyVolume').isNumeric().withMessage('Monthly volume must be a number'),
];

export const createFinancialPlan = asyncHandler(async (req, res) => {
  const plan = await fundingService.createFinancialPlan(req.user._id, req.body);
  sendCreated(res, plan, 'Financial plan generated');
});

export const getFinancialPlans = asyncHandler(async (req, res) => {
  const plans = await fundingService.getUserFinancialPlans(req.user._id);
  sendSuccess(res, plans);
});

export const getFinancialPlan = asyncHandler(async (req, res) => {
  const plan = await fundingService.getFinancialPlanById(req.params.id, req.user._id);
  sendSuccess(res, plan);
});
