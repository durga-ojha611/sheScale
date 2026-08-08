/**
 * InterviewSession.model.js
 * Reason: STANDALONE — each mock interview is a distinct, independently tracked event.
 * ReadinessScoreMatrix is EMBEDDED: it is small, bounded (5 category scores),
 * always fetched together with the session, and never queried independently.
 */

import mongoose from 'mongoose';

// ── Embedded: Readiness Score breakdown (always co-fetched with session) ─────
const ReadinessScoreSchema = new mongoose.Schema(
  {
    overall:    { type: Number, default: 0, min: 0, max: 100 },
    risk:       { type: Number, default: 0, min: 0, max: 100 },  // risk management answers
    marketing:  { type: Number, default: 0, min: 0, max: 100 },  // marketing spend defence
    operations: { type: Number, default: 0, min: 0, max: 100 },  // operational readiness
    financial:  { type: Number, default: 0, min: 0, max: 100 },  // financial metrics defence
    feedback:   { type: [String], default: [] },                  // specific improvement areas
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const InterviewSessionSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionType:     { type: String, enum: ['bank_officer', 'vc_investor'], required: true },
    status:          { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress', index: true },

    // Conversation context for this session (links to ChatMessage via conversationId)
    conversationId:  { type: mongoose.Schema.Types.ObjectId, default: null },

    // Summary of what was said — stored as structured text, not raw audio
    transcriptSummary: { type: String, default: '' },

    // Audio session recording — stored as encrypted pointer only
    audioSessionRef: { type: String, default: null },

    // Duration in seconds
    durationSeconds: { type: Number, default: 0 },

    // Embedded readiness score (bounded, always fetched with session)
    readinessScore: { type: ReadinessScoreSchema, default: () => ({}) },

    // Whether this session unlocked human mentor access
    unlockedMentorAccess: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
InterviewSessionSchema.index({ userId: 1, status: 1 });
InterviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('InterviewSession', InterviewSessionSchema);
