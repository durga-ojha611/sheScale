// controllers/networking.controller.js — Networking Hub orchestration (Features 3.1 – 3.3)
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as networkingService from '../services/networkingService.js';

// ── Feature 3.1: Co-founder Discovery & Matching ──────────────────────────────

export const getDiscoverProfiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const profiles = await networkingService.getDiscoverProfiles(req.user._id, req.user.profile, +page, +limit);
  sendSuccess(res, profiles);
});

export const swipeValidation = [
  body('targetId').isMongoId().withMessage('Valid targetId required'),
  body('direction').isIn(['left', 'right']).withMessage('direction must be left or right'),
];

export const swipe = asyncHandler(async (req, res) => {
  const { targetId, direction } = req.body;
  const result = await networkingService.swipeOnProfile(req.user._id, targetId, direction);
  sendSuccess(res, result, result.matched ? '🎉 It\'s a match!' : 'Swipe recorded');
});

export const getMatches = asyncHandler(async (req, res) => {
  const matches = await networkingService.getUserMatches(req.user._id);
  sendSuccess(res, matches);
});

// ── Feature 3.2: Hyper-Local Ecosystem Blueprint ──────────────────────────────

export const getLocalBusinesses = asyncHandler(async (req, res) => {
  const { city, state, domain, lat, lng, radiusKm, page = 1, limit = 20 } = req.query;
  const result = await networkingService.getLocalBusinesses({ city, state, domain, lat, lng, radiusKm, page: +page, limit: +limit });
  sendPaginated(res, result.businesses, result);
});

export const registerBusinessValidation = [
  body('businessName').notEmpty().withMessage('Business name required'),
  body('domain').notEmpty().withMessage('Domain/sector required'),
  body('location.city').notEmpty().withMessage('City required'),
  body('location.state').notEmpty().withMessage('State required'),
];

export const registerLocalBusiness = asyncHandler(async (req, res) => {
  const business = await networkingService.registerLocalBusiness(req.user._id, req.body);
  sendCreated(res, business, 'Business registered in local ecosystem');
});

// ── Feature 3.3: Micro-Grant Community Ledger ────────────────────────────────

export const getMicroGrants = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await networkingService.getMicroGrants({ status, page: +page, limit: +limit });
  sendPaginated(res, result.grants, result);
});

export const createGrantValidation = [
  body('title').notEmpty().withMessage('Title required'),
  body('pitchSummary').notEmpty().withMessage('Pitch summary required'),
  body('targetAmount').isInt({ min: 500 }).withMessage('Target amount must be at least ₹500'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date required'),
];

export const createMicroGrant = asyncHandler(async (req, res) => {
  const grant = await networkingService.createMicroGrant(req.user._id, req.body);
  sendCreated(res, grant, 'Micro-grant post created');
});

export const pledgeValidation = [
  body('amount').isInt({ min: 500, max: 10000 }).withMessage('Pledge amount must be ₹500 – ₹10,000'),
  body('txnRef').notEmpty().withMessage('Transaction reference required'),
];

export const pledgeToGrant = asyncHandler(async (req, res) => {
  const result = await networkingService.pledgeToGrant(req.params.id, req.user._id, req.body);
  sendSuccess(res, result, `Pledge of ₹${req.body.amount} confirmed!`);
});
