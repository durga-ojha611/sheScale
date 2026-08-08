// services/mentorshipService.js — Mentorship Hub business logic (Features 2.1 – 2.3)
import mongoose from 'mongoose';
import {
  InterviewSession,
  MentorBooking,
  ChatMessage,
  User,
} from '../models/index.js';
import { aiMentorChat, scoreInterview, generateAiBrief } from './geminiService.js';
import { AppError } from '../utils/AppError.js';

// ── Feature 2.1: AI Twin Mentor Chat ─────────────────────────────────────────

export const sendMentorMessage = async (userId, userProfile, message, conversationId) => {
  // Create or reuse a conversation ID
  const convId = conversationId
    ? new mongoose.Types.ObjectId(conversationId)
    : new mongoose.Types.ObjectId();

  // Fetch recent history for context
  const history = await ChatMessage.find({ conversationId: convId })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  // Call AI mentor
  const aiResponse = await aiMentorChat(message, userProfile, history.reverse());

  // Persist both messages
  await ChatMessage.insertMany([
    { conversationId: convId, senderId: userId, senderRole: 'user', content: message },
    { conversationId: convId, senderId: null, senderRole: 'ai', content: aiResponse },
  ]);

  return { conversationId: convId, aiResponse };
};

// ── Feature 2.2: AI Mock Interview ───────────────────────────────────────────

export const startInterview = async (userId, sessionType) => {
  const session = await InterviewSession.create({ userId, sessionType, status: 'in_progress' });
  return session;
};

export const completeInterview = async (sessionId, userId, transcriptSummary) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Interview session not found.', 404);
  if (session.status !== 'in_progress') throw new AppError('Session is already completed.', 400);

  // Score the interview via Gemini
  const scoreData = await scoreInterview(transcriptSummary, session.sessionType);

  session.transcriptSummary = transcriptSummary;
  session.status = 'completed';
  session.readinessScore = {
    overall:    scoreData.overall,
    risk:       scoreData.risk,
    marketing:  scoreData.marketing,
    operations: scoreData.operations,
    financial:  scoreData.financial,
    feedback:   scoreData.feedback,
  };
  session.unlockedMentorAccess = scoreData.unlockedMentorAccess;

  await session.save();

  // Update the user's latestReadinessScore on their profile
  if (scoreData.overall) {
    await User.findByIdAndUpdate(userId, { latestReadinessScore: scoreData.overall });
  }

  return session;
};

export const getUserInterviews = async (userId) => {
  return InterviewSession.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const getInterviewById = async (sessionId, userId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Interview session not found.', 404);
  return session;
};

// ── Feature 2.3: Human Mentor Booking ────────────────────────────────────────

export const getAvailableMentors = async ({ domain, page = 1, limit = 10 } = {}) => {
  const filter = {
    role: 'mentor',
    accountStatus: 'active',
    'profile.mentorProfile.isAvailable': true,
  };
  if (domain) filter['profile.expertise'] = domain;

  const skip = (page - 1) * limit;
  const [mentors, total] = await Promise.all([
    User.find(filter)
      .select('profile.mentorProfile profile.bio profile.city profile.state profile.avatarUrl email')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { mentors, total, page, limit };
};

export const bookMentorSession = async (entrepreneurId, { mentorId, scheduledAt, preCallNotes }) => {
  const entrepreneur = await User.findById(entrepreneurId);
  if (!entrepreneur) throw new AppError('User not found.', 404);

  // Check readiness score gate
  const latestScore = entrepreneur.latestReadinessScore;
  if (!latestScore || latestScore < 65) {
    throw new AppError(
      `Your current readiness score is ${latestScore || 0}/100. Complete a mock interview and reach 65+ to unlock human mentor sessions.`,
      403
    );
  }

  const mentor = await User.findOne({ _id: mentorId, role: 'mentor', accountStatus: 'active' });
  if (!mentor) throw new AppError('Mentor not found or unavailable.', 404);

  // Generate AI brief for the mentor
  const aiBriefData = await generateAiBrief(entrepreneur.profile, { overall: latestScore }, null);

  const booking = await MentorBooking.create({
    entrepreneurId,
    mentorId,
    scheduledAt: new Date(scheduledAt),
    preCallNotes,
    status: 'pending',
    aiBrief: {
      ...aiBriefData,
      readinessScore: latestScore,
      generatedAt: new Date(),
    },
  });

  return booking;
};

export const getUserBookings = async (userId, role) => {
  const filter = role === 'mentor' ? { mentorId: userId } : { entrepreneurId: userId };
  return MentorBooking.find(filter)
    .populate('mentorId', 'email profile.mentorProfile profile.avatarUrl')
    .populate('entrepreneurId', 'email profile.businessName profile.stage')
    .sort({ scheduledAt: 1 })
    .lean();
};

export const updateBookingStatus = async (bookingId, userId, status) => {
  const booking = await MentorBooking.findOne({
    _id: bookingId,
    $or: [{ mentorId: userId }, { entrepreneurId: userId }],
  });
  if (!booking) throw new AppError('Booking not found.', 404);

  booking.status = status;
  await booking.save();
  return booking;
};
