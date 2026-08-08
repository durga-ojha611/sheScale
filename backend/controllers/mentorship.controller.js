// controllers/mentorship.controller.js — Mentorship Hub orchestration (Features 2.1 – 2.3)
import { body } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as mentorshipService from '../services/mentorshipService.js';

// ── Feature 2.1: AI Twin Mentor Chat ──────────────────────────────────────────

export const sendMessageValidation = [
  body('message').notEmpty().withMessage('Message content required'),
];

export const sendMentorMessage = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const result = await mentorshipService.sendMentorMessage(
    req.user._id,
    req.user.profile,
    message,
    conversationId
  );
  sendSuccess(res, result);
});

// ── Feature 2.2: AI Mock Interview ────────────────────────────────────────────

export const startInterviewValidation = [
  body('sessionType').isIn(['bank_officer', 'vc_investor']).withMessage('sessionType must be bank_officer or vc_investor'),
];

export const startInterview = asyncHandler(async (req, res) => {
  const session = await mentorshipService.startInterview(req.user._id, req.body.sessionType);
  sendCreated(res, session, 'Mock interview session started');
});

export const completeInterview = asyncHandler(async (req, res) => {
  const { transcriptSummary } = req.body;
  if (!transcriptSummary) throw { statusCode: 400, message: 'transcriptSummary is required', isOperational: true };
  const session = await mentorshipService.completeInterview(req.params.id, req.user._id, transcriptSummary);
  sendSuccess(res, session, 'Interview scored successfully');
});

export const getUserInterviews = asyncHandler(async (req, res) => {
  const sessions = await mentorshipService.getUserInterviews(req.user._id);
  sendSuccess(res, sessions);
});

export const getInterview = asyncHandler(async (req, res) => {
  const session = await mentorshipService.getInterviewById(req.params.id, req.user._id);
  sendSuccess(res, session);
});

// ── Feature 2.3: Human Mentor Booking ─────────────────────────────────────────

export const getAvailableMentors = asyncHandler(async (req, res) => {
  const { domain, page = 1, limit = 10 } = req.query;
  const result = await mentorshipService.getAvailableMentors({ domain, page: +page, limit: +limit });
  sendPaginated(res, result.mentors, result);
});

export const bookMentorValidation = [
  body('mentorId').notEmpty().isMongoId().withMessage('Valid mentorId required'),
  body('scheduledAt').isISO8601().withMessage('Valid ISO date required for scheduledAt'),
];

export const bookMentor = asyncHandler(async (req, res) => {
  const booking = await mentorshipService.bookMentorSession(req.user._id, req.body);
  sendCreated(res, booking, 'Mentor session booked successfully');
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await mentorshipService.getUserBookings(req.user._id, req.user.role);
  sendSuccess(res, bookings);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await mentorshipService.updateBookingStatus(req.params.id, req.user._id, status);
  sendSuccess(res, booking, 'Booking status updated');
});
