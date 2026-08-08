import { Router } from 'express';
import {
  analyzePitch,
  getReadiness,
  suggestMentors
} from '../controllers/mentorshipHub.controller.js';

const router = Router();

router.post('/analyze-pitch', analyzePitch);
router.get('/readiness/:userId', getReadiness);
router.post('/suggest-mentors', suggestMentors);

export default router;
