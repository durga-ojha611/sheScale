// routes/funding.routes.js
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { handleUpload, uploadSingle } from '../middlewares/upload.middleware.js';
import {
  createApplication,
  getApplications,
  getApplication,
  parsePdf,
  scanDocument,
  createFinancialPlan, createFinancialPlanValidation,
  getFinancialPlans,
  getFinancialPlan,
} from '../controllers/funding.controller.js';

const router = Router();

// All funding routes require authentication
router.use(protect);

// ── Funding Applications ────────────────────────────────────────────────────
router.post('/',    createApplication);
router.get('/',     getApplications);
router.get('/:id',  getApplication);

// ── Feature 1.2: PDF Doc-Whisperer ─────────────────────────────────────────
router.post('/:id/parse-pdf',    handleUpload(uploadSingle), parsePdf);

// ── Feature 1.3: Document Pre-Flight Scanner ────────────────────────────────
router.post('/:id/scan-document', handleUpload(uploadSingle), scanDocument);

// ── Feature 1.4: BizCalculus Financial Planner ─────────────────────────────
router.post('/financial-plans',       createFinancialPlanValidation, validate, createFinancialPlan);
router.get('/financial-plans',        getFinancialPlans);
router.get('/financial-plans/:id',    getFinancialPlan);

export default router;
