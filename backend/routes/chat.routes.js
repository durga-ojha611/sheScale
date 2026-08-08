// routes/chat.routes.js — Shared paginated chat message retrieval
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMessages } from '../controllers/chat.controller.js';

const router = Router();
router.use(protect);

router.get('/:conversationId/messages', getMessages);

export default router;
