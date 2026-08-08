import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as checklistController from '../controllers/userChecklist.controller.js';

const router = Router();

router.use(protect);

router.get('/', checklistController.getChecklist);
router.patch('/', checklistController.updateChecklist);

export default router;
