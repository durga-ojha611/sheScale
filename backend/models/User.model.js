/**
 * User.model.js
 * Reason: Core identity anchor for the entire platform.
 * Profile is EMBEDDED (1:1 relationship, always fetched together — eliminates a lookup on every request).
 * Mentor-specific fields (expertise, calendlyUrl) are conditionally embedded inside profile
 * so we avoid a separate Mentor collection.
 */

import mongoose from 'mongoose';

// ── Embedded: Mentor-specific fields (only populated when role === 'mentor') ──
const MentorProfileSchema = new mongoose.Schema(
  {
    expertise:    { type: [String], default: [] },        // e.g. ['fintech', 'D2C', 'manufacturing']
    bio:          { type: String, default: '' },
    calendlyUrl:  { type: String, default: '' },
    hourlyRate:   { type: Number, default: 0 },
    isAvailable:  { type: Boolean, default: true },
    totalSessions:{ type: Number, default: 0 },
    rating:       { type: Number, default: 0, min: 0, max: 5 },
  },
  { _id: false }
);

// ── Embedded: Entrepreneur business profile (always fetched with User) ──
const ProfileSchema = new mongoose.Schema(
  {
    businessName:   { type: String, default: '' },
    stage:          { type: String, enum: ['idea', 'early', 'growth', 'scaling'], default: 'idea' },
    domain:         { type: String, default: '' },   // e.g. 'textile', 'tech', 'food'
    city:           { type: String, default: '' },
    state:          { type: String, default: '' },
    skills:         { type: [String], default: [] }, // e.g. ['marketing', 'design']
    bio:            { type: String, default: '' },
    avatarUrl:      { type: String, default: '' },
    // Onboarding progress flags
    onboarding: {
      profileComplete:    { type: Boolean, default: false },
      firstSchemeMatched: { type: Boolean, default: false },
      firstPdfParsed:     { type: Boolean, default: false },
      firstInterviewDone: { type: Boolean, default: false },
    },
    mentorProfile:  { type: MentorProfileSchema, default: null },
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, default: 'Founder' },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash:    { type: String, default: null },   // null if OAuth-only
    phone:           { type: String, default: null },
    oAuthProvider:   { type: String, enum: ['google', 'github', null], default: null },
    oAuthProviderId: { type: String, default: null },
    role:            { type: String, enum: ['entrepreneur', 'mentor', 'admin'], default: 'entrepreneur', index: true },
    accountStatus:   { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    // Latest readiness score (denormalized from InterviewSession for fast profile display)
    latestReadinessScore: { type: Number, default: null, min: 0, max: 100 },
    profile: { type: ProfileSchema, default: () => ({}) },
    businessDetails: {
      businessIdea: { type: String, default: '' },
      category:     { type: String, default: '' },
      isWomanFounder: { type: Boolean, default: true },
    },
    // Funding checklist progress tracking
    checklistProgress: {
      completeProfile:    { type: Boolean, default: false },
      findMatchingScheme: { type: Boolean, default: false },
      scanIdentityDocs:   { type: Boolean, default: false },
      generatePnLPlan:    { type: Boolean, default: false },
    },
    pnlData:         { type: Object, default: null },
    docVerification: { type: Object, default: null },
    // Mentorship Hub specific fields
    mentorshipHub: {
      readinessScore: { type: Number, default: 0 },
      isMentorBookingUnlocked: { type: Boolean, default: false },
      mockPitchHistory: [{
        pitchText: String,
        score: Number,
        feedback: { strengths: [String], improvements: [String] },
        date: { type: Date, default: Date.now }
      }]
    }
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
UserSchema.index({ role: 1, accountStatus: 1 });                    // mentor discovery filter
UserSchema.index({ 'profile.city': 1, 'profile.domain': 1 });      // local ecosystem matching
UserSchema.index({ 'profile.skills': 1, role: 1 });                 // skill-based co-founder search

export default mongoose.model('User', UserSchema);
