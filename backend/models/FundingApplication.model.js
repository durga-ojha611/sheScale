/**
 * FundingApplication.model.js
 * Reason: One document represents one user's complete application journey for a scheme.
 * SchemeMatch results, PDF analysis output, and document tracker steps are all EMBEDDED
 * because they are bounded in size, always co-fetched, and tightly coupled to a single journey.
 * Financial projections are NOT here — they live in FinancialPlan (independently run what-ifs).
 */

import mongoose from 'mongoose';

// ── Sub-schema: One matched scheme result ────────────────────────────────────
const MatchedSchemeSchema = new mongoose.Schema(
  {
    schemeName:         { type: String, required: true },
    schemeId:           { type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentScheme', default: null },
    badge:              { type: String, default: '' },
    eligibilitySummary: { type: String, default: '' },
    financialSummary:   { type: String, default: '' },
    matchScore:         { type: Number, min: 0, max: 100, default: 0 },
    subScores: {
      eligibility:   { type: Number, default: 0 },
      financialFit:  { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      businessStage: { type: Number, default: 0 },
      location:      { type: Number, default: 0 }
    },
    pros:               { type: [String], default: [] },
    cons:               { type: [String], default: [] },
    highlights:         { type: [String], default: [] },
    improvements:       { type: [String], default: [] },
    isApplied:          { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Sub-schema: Scheme Matcher session (Feature 1.1) ────────────────────────
const SchemeMatchSchema = new mongoose.Schema(
  {
    userQuery:     { type: String, default: '' },     // raw user input text
    matchedAt:     { type: Date, default: Date.now },
    results:       { type: [MatchedSchemeSchema], default: [] },
  },
  { _id: false }
);

// ── Sub-schema: PDF Doc-Whisperer analysis (Feature 1.2) ────────────────────
const PdfAnalysisSchema = new mongoose.Schema(
  {
    sourcePdfRef:    { type: String, default: '' },   // encrypted storage pointer — never raw file
    analyzedAt:      { type: Date, default: null },
    eligibilityCards:{ type: [String], default: [] }, // Green card text items
    financialTerms: [{
      label:  { type: String },  // e.g. 'Loan Amount', 'Interest Rate'
      value:  { type: String },  // e.g. '₹50,000 – ₹10 Lakh', '7.5% p.a.'
    }],
    alertBoxes:      { type: [String], default: [] }, // Red alert text items
  },
  { _id: false }
);

// ── Sub-schema: One document in the pre-flight tracker (Feature 1.3) ────────
const TrackerStepSchema = new mongoose.Schema(
  {
    docType:      { type: String, required: true },   // e.g. 'Aadhaar', 'Business Registration'
    uploadStatus: { type: String, enum: ['pending', 'uploaded', 'approved', 'rejected'], default: 'pending' },
    scanResult:   { type: String, enum: ['ok', 'blurry', 'cut_off', 'pending'], default: 'pending' },
    documentRef:  { type: String, default: null },    // encrypted storage pointer — never raw ID data
    uploadedAt:   { type: Date, default: null },
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const FundingApplicationSchema = new mongoose.Schema(
  {
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationTitle:   { type: String, default: 'My Funding Application' },
    targetSchemeName:   { type: String, default: '' },
    applicationStatus:  {
      type: String,
      enum: ['draft', 'documents_pending', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    schemeMatch:        { type: SchemeMatchSchema, default: () => ({}) },
    pdfAnalysis:        { type: PdfAnalysisSchema, default: () => ({}) },
    documentTracker:    { type: [TrackerStepSchema], default: [] },
    generatedApplicationText: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
FundingApplicationSchema.index({ userId: 1, applicationStatus: 1 });
FundingApplicationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('FundingApplication', FundingApplicationSchema);
