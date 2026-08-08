// routes/networking.routes.js
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getDiscoverProfiles,
  swipe, swipeValidation,
  getMatches,
  getLocalBusinesses,
  registerLocalBusiness, registerBusinessValidation,
  getMicroGrants,
  createMicroGrant, createGrantValidation,
  pledgeToGrant, pledgeValidation,
} from '../controllers/networking.controller.js';

const router = Router();
router.use(protect);

// ── Feature 3.1: Co-founder Swipe & Match ───────────────────────────────────
router.get('/discover',  getDiscoverProfiles);
router.post('/swipe',    swipeValidation, validate, swipe);
router.get('/matches',   getMatches);

// ── Feature 3.2: Hyper-Local Ecosystem Blueprint ─────────────────────────────
router.get('/local-businesses',  getLocalBusinesses);
router.post('/local-businesses', registerBusinessValidation, validate, registerLocalBusiness);

// ── Feature 3.3: Micro-Grant Community Ledger ────────────────────────────────
router.get('/micro-grants',           getMicroGrants);
router.post('/micro-grants',          createGrantValidation, validate, createMicroGrant);
router.post('/micro-grants/:id/pledge', pledgeValidation, validate, pledgeToGrant);

export default router;
