import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as pnlController from '../controllers/pnl.controller.js';

const router = Router();

router.use(protect);

router.get('/', pnlController.getPnL);
router.post('/generate-pnl', pnlController.generatePnL);

export default router;
