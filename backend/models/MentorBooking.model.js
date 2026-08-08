/**
 * MentorBooking.model.js
 * Reason: STANDALONE — bookings are independently scheduled, queried by both parties,
 * and need independent status tracking. The AI brief is EMBEDDED as a snapshot:
 * it's a point-in-time vetted summary created at booking time, never reused or queried alone.
 */

import mongoose from 'mongoose';

// ── Embedded: AI-vetted business brief sent to mentor before the call ────────
const AiBriefSchema = new mongoose.Schema(
  {
    businessSummary:      { type: String, default: '' },
    keyMetrics:           { type: [String], default: [] },   // e.g. ['Revenue: ₹3L/mo', 'Margin: 40%']
    challengesIdentified: { type: [String], default: [] },
    readinessScore:       { type: Number, default: 0 },      // Denormalized from InterviewSession
    suggestedAgendaItems: { type: [String], default: [] },
    generatedAt:          { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const MentorBookingSchema = new mongoose.Schema(
  {
    entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    scheduledAt:    { type: Date, required: true, index: true },
    durationMins:   { type: Number, default: 30 },
    meetingLink:    { type: String, default: '' },   // Calendly / Google Meet / Zoom URL

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },

    // Entrepreneur notes submitted before the call
    preCallNotes: { type: String, default: '' },

    // Mentor feedback / notes after the call
    postCallFeedback: { type: String, default: '' },
    mentorRating:     { type: Number, min: 1, max: 5, default: null },

    // AI-generated brief — snapshot embedded (not a live reference)
    aiBrief: { type: AiBriefSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
MentorBookingSchema.index({ entrepreneurId: 1, status: 1 });
MentorBookingSchema.index({ mentorId: 1, scheduledAt: 1 });
MentorBookingSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.model('MentorBooking', MentorBookingSchema);
