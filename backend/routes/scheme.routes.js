// routes/scheme.routes.js
import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getLiveSchemes, getLiveSchemesValidation,
  getScheme,
  matchSchemes,
  generateApplication,
  triggerSync,
} from '../controllers/scheme.controller.js';

const router = Router();

// ── Feature 1.5: Live Government Scheme Intelligence Panel ──────────────────
router.get('/',    protect, getLiveSchemesValidation, validate, getLiveSchemes);
router.get('/:id', protect, getScheme);

// ── Feature 1.1: Conversational Scheme Matcher (RAG) ───────────────────────
router.post('/scan', protect, matchSchemes);
router.post('/generate-application', protect, generateApplication);

// ── Admin: Manual sync trigger ──────────────────────────────────────────────
router.post('/sync', protect, restrictTo('admin'), triggerSync);

export default router;
