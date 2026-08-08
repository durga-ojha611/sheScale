import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getAITwinResponse,
  evaluatePitch,
  getMentorList,
  bookMentorSlot
} from '../controllers/mentor.controller.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/ai-twin', getAITwinResponse);
router.post('/evaluate-pitch', evaluatePitch);
router.get('/list', getMentorList);
router.post('/book', bookMentorSlot);

export default router;
