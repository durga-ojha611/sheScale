/**
 * FinancialPlan.model.js
 * Reason: STANDALONE — a user can run multiple "what-if" financial scenarios independently.
 * This data is queried, compared, and updated separately from the FundingApplication journey,
 * so embedding it would create update confusion and break scenario isolation.
 */

import mongoose from 'mongoose';

// ── Sub-schema: One year's projected financials ──────────────────────────────
const YearProjectionSchema = new mongoose.Schema(
  {
    year:           { type: Number, required: true },   // 1, 2, or 3
    revenue:        { type: Number, default: 0 },
    totalCost:      { type: Number, default: 0 },
    grossProfit:    { type: Number, default: 0 },
    netProfit:      { type: Number, default: 0 },
    profitMargin:   { type: Number, default: 0 },       // percentage
  },
  { _id: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const FinancialPlanSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenarioName: { type: String, default: 'My Business Plan' },

    // Raw inputs from the BizCalculus chat
    inputs: {
      rawMaterialCostPerUnit: { type: Number, default: 0 },   // e.g. ₹100
      sellingPricePerUnit:    { type: Number, default: 0 },   // e.g. ₹300
      monthlyVolume:          { type: Number, default: 0 },   // units/month
      fixedMonthlyCosts:      { type: Number, default: 0 },   // rent, salaries, etc.
      growthRatePercent:      { type: Number, default: 20 },  // assumed YoY growth
    },

    // Computed outputs (stored so frontend can re-render without recomputing)
    outputs: {
      breakEvenUnits:    { type: Number, default: 0 },
      breakEvenRevenue:  { type: Number, default: 0 },
      yearlyProjections: { type: [YearProjectionSchema], default: [] },
    },

    // Original natural-language input that triggered this plan
    rawUserStatement: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'finalized'], default: 'draft' },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
FinancialPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('FinancialPlan', FinancialPlanSchema);
