// services/schemeService.js — Live Government Scheme Intelligence Panel (Feature 1.5)
// Handles CRUD on GovernmentScheme collection + RAG-based scheme matching
import { GovernmentScheme, FundingApplication } from '../models/index.js';
import { runSchemeMatchPipeline } from './ragRetrievalService.js';
import { updateChecklistProgress } from './userChecklistService.js';
import { AppError } from '../utils/AppError.js';

// ── Feature 1.5: Live Scheme Feed ────────────────────────────────────────────

export const getLiveSchemes = async ({ state, domain, stage, page = 1, limit = 20 } = {}) => {
  const filter = { isActive: true };
  if (state)  filter['eligibility.applicableStates'] = { $in: [state, ''] };
  if (domain) filter['eligibility.applicableDomains'] = { $in: [domain, ''] };
  if (stage)  filter['eligibility.businessStages'] = stage;

  const skip = (page - 1) * limit;
  const [schemes, total] = await Promise.all([
    GovernmentScheme.find(filter)
      .sort({ isNewScheme: -1, lastSyncedAt: -1 })  // "What's New" items first
      .skip(skip)
      .limit(limit)
      .lean(),
    GovernmentScheme.countDocuments(filter),
  ]);

  return { schemes, total, page, limit };
};

export const getSchemeById = async (schemeId) => {
  const scheme = await GovernmentScheme.findById(schemeId);
  if (!scheme) throw new AppError('Scheme not found.', 404);
  return scheme;
};

// ── Feature 1.1: Conversational Scheme Matcher (RAG endpoint) ────────────────

export const matchSchemes = async (userQuery, userProfile, applicationId, userId) => {
  if (!userQuery?.trim()) throw new AppError('Please provide a category or description to match schemes.', 400);

  // Run the RAG pipeline
  const matchedSchemes = await runSchemeMatchPipeline(userQuery, userProfile);

  // Auto-mark checklist progress for findMatchingScheme
  if (userId) {
    await updateChecklistProgress(userId, { findMatchingScheme: true });
  }

  // Optionally persist the match results to an open FundingApplication
  if (applicationId) {
    await FundingApplication.findOneAndUpdate(
      { _id: applicationId, userId },
      {
        $set: {
          'schemeMatch.userQuery':  userQuery,
          'schemeMatch.matchedAt':  new Date(),
          'schemeMatch.results':    matchedSchemes.map((s) => ({
            schemeName:         s.schemeName,
            eligibilitySummary: s.eligibilitySummary,
            matchScore:         s.matchScore,
          })),
        },
      }
    );
  }

  return matchedSchemes;
};
