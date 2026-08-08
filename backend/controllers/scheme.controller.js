// controllers/scheme.controller.js — Scheme Intelligence Panel & Scheme Matcher (Features 1.1, 1.5)
import { query } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../utils/responseFormatter.js';
import * as schemeService from '../services/schemeService.js';
import { syncGovernmentSchemes } from '../jobs/schemeSyncJob.js';

// ── Feature 1.5: Live Scheme Feed ─────────────────────────────────────────────

export const getLiveSchemesValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const getLiveSchemes = asyncHandler(async (req, res) => {
  const { state, domain, stage, page = 1, limit = 20 } = req.query;
  const result = await schemeService.getLiveSchemes({ state, domain, stage, page: +page, limit: +limit });
  sendPaginated(res, result.schemes, result);
});

export const getScheme = asyncHandler(async (req, res) => {
  const scheme = await schemeService.getSchemeById(req.params.id);
  sendSuccess(res, scheme);
});

// Admin-only: manually trigger a sync cycle
export const triggerSync = asyncHandler(async (_req, res) => {
  const result = await syncGovernmentSchemes();
  sendSuccess(res, result, `Sync complete. Synced: ${result.synced}, Failed: ${result.failed}`);
});

// ── Feature 1.1: Conversational Scheme Matcher (RAG endpoint) ─────────────────

export const matchSchemes = asyncHandler(async (req, res) => {
  const { query: userQuery, applicationId } = req.body;
  const result = await schemeService.matchSchemes(
    userQuery,
    req.user.profile,
    applicationId,
    req.user._id
  );
  sendSuccess(res, result, `Found ${result.length} matching scheme(s)`);
});

export const generateApplication = asyncHandler(async (req, res) => {
  const { schemeId, businessIdeaText } = req.body;
  
  // Use funding service to generate the loan application
  const { generateApplication } = await import('../services/fundingService.js');
  const result = await generateApplication(req.user._id, schemeId, businessIdeaText);
  
  sendSuccess(res, result, 'Application generated successfully');
});
