// routes/mentorship.routes.js
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  sendMentorMessage, sendMessageValidation,
  startInterview, startInterviewValidation,
  completeInterview,
  getUserInterviews,
  getInterview,
  getAvailableMentors,
  bookMentor, bookMentorValidation,
  getUserBookings,
  updateBookingStatus,
} from '../controllers/mentorship.controller.js';

const router = Router();
router.use(protect);

// ── Feature 2.1: AI Twin Mentor ─────────────────────────────────────────────
router.post('/chat', sendMessageValidation, validate, sendMentorMessage);

// ── Feature 2.2: AI Mock Interview ──────────────────────────────────────────
router.post('/interviews',           startInterviewValidation, validate, startInterview);
router.get('/interviews',            getUserInterviews);
router.get('/interviews/:id',        getInterview);
router.patch('/interviews/:id/complete', completeInterview);

// ── Feature 2.3: Human Mentor Booking ───────────────────────────────────────
router.get('/mentors',               getAvailableMentors);
router.post('/bookings',             bookMentorValidation, validate, bookMentor);
router.get('/bookings',              getUserBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
