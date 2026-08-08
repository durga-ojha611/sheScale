/**
 * GovernmentScheme.model.js
 * Reason: STANDALONE — continuously refreshed by a backend scheduled job from official
 * government portals (Jan Samarth, Mudra, Stand-Up India, state MSME portals).
 * Queried independently for the Live Scheme Intelligence Panel and powers the
 * Conversational Scheme Matcher (always runs against this live, current dataset).
 * Also used as source material for the local vector store (RAG knowledge base).
 */

import mongoose from 'mongoose';

// ── Sub-schema: Eligibility ruleset ─────────────────────────────────────────
const EligibilitySchema = new mongoose.Schema(
  {
    businessStages:    { type: [String], enum: ['idea', 'early', 'growth', 'scaling'], default: [] },
    applicableStates:  { type: [String], default: [] },   // empty = all India
    applicableDomains: { type: [String], default: [] },   // empty = all sectors
    minTurnover:       { type: Number, default: 0 },      // INR
    maxTurnover:       { type: Number, default: null },
    genderRequirement: { type: String, enum: ['women_only', 'any'], default: 'women_only' },
    ageRange:          { type: [Number], default: [] },   // [min, max] years
    additionalCriteria:{ type: [String], default: [] },   // free-text rules
  },
  { _id: false }
);

// ── Sub-schema: Financial terms ──────────────────────────────────────────────
const FinancialTermsSchema = new mongoose.Schema(
  {
    minLoanAmount:   { type: Number, default: 0 },
    maxLoanAmount:   { type: Number, default: null },
    interestRateMin: { type: Number, default: null },
    interestRateMax: { type: Number, default: null },
    tenureMonths:    { type: Number, default: null },
    subsidyPercent:  { type: Number, default: 0 },
    collateralRequired: { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Sub-schema: Application step (renders as the same Stepper UI) ────────────
const ApplicationStepSchema = new mongoose.Schema(
  {
    stepNumber:   { type: Number, required: true },
    title:        { type: String, required: true },
    description:  { type: String, default: '' },
    portalUrl:    { type: String, default: '' },      // direct link to gov portal step
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const GovernmentSchemeSchema = new mongoose.Schema(
  {
    // Official scheme identifiers
    schemeCode:    { type: String, unique: true, required: true }, // e.g. 'MUDRA_SHISHU'
    name:          { type: String, required: true },
    shortName:     { type: String, default: '' },
    ministry:      { type: String, default: '' },

    // Source tracking
    sourcePortal:  { type: String, default: '' },   // e.g. 'Jan Samarth', 'Mudra Yojana'
    sourceUrl:     { type: String, default: '' },

    // Main content (rendered via the same card/pill/alert design system)
    description:       { type: String, default: '' },
    eligibility:       { type: EligibilitySchema, default: () => ({}) },
    financialTerms:    { type: FinancialTermsSchema, default: () => ({}) },
    requiredDocuments: { type: [String], default: [] },
    applicationSteps:  { type: [ApplicationStepSchema], default: [] },

    // Red alert boxes for deadlines, rule changes, penalties
    alertBoxes: [{
      message:     { type: String },
      severity:    { type: String, enum: ['warning', 'deadline', 'info'], default: 'info' },
      addedAt:     { type: Date, default: Date.now },
    }],

    // Live sync metadata
    isActive:       { type: Boolean, default: true, index: true },
    lastSyncedAt:   { type: Date, default: Date.now, index: true },
    // "What's New" ribbon — true if added/updated since last sync cycle
    isNewScheme:    { type: Boolean, default: true, index: true },
    isUpdated:      { type: Boolean, default: false },

    // Embedding vector reference — points to entry in local vector_store.db
    vectorStoreId:{ type: String, default: null },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
GovernmentSchemeSchema.index({ isActive: 1, lastSyncedAt: -1 });
GovernmentSchemeSchema.index({ isActive: 1, isNew: 1 });
GovernmentSchemeSchema.index({ 'eligibility.businessStages': 1, isActive: 1 });
GovernmentSchemeSchema.index({ 'eligibility.applicableStates': 1, isActive: 1 });

export default mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
