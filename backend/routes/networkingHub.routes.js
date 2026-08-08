import { Router } from 'express';
import {
  createPitch,
  getPitches,
  matchCoFounders,
  recommendConnections
} from '../controllers/networkingHub.controller.js';

const router = Router();

router.post('/create-pitch', createPitch);
router.get('/pitches', getPitches);
router.post('/match', matchCoFounders);
router.get('/recommend/:userId', recommendConnections);

export default router;
