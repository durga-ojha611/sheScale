/**
 * MicroGrant.model.js
 * Reason: STANDALONE — financial ledger data must be immutable and auditable.
 * Pledges are EMBEDDED for MVP (amounts are small and pledge count is bounded per post).
 * ⚠️ Production note: If a post can receive 1000+ pledges, extract pledges to a
 * separate `Pledge` collection with a microGrantId ref for proper pagination & auditing.
 */

import mongoose from 'mongoose';

// ── Embedded: Individual pledge (bounded for MVP, extract if unbounded in prod) ──
const PledgeSchema = new mongoose.Schema(
  {
    backerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Denormalized backer name for fast feed rendering (read-mostly)
    backerName: { type: String, default: '' },
    amount:     { type: Number, required: true, min: 500, max: 10000 },  // ₹500 – ₹10,000
    message:    { type: String, default: '' },
    paidAt:     { type: Date, default: Date.now },
    // Transaction reference — points to payment processor record, not raw financial data
    txnRef:     { type: String, required: true },
    status:     { type: String, enum: ['pending', 'confirmed', 'refunded'], default: 'pending' },
  },
  { _id: true, timestamps: false }
);

// ── Root Schema ──────────────────────────────────────────────────────────────
const MicroGrantSchema = new mongoose.Schema(
  {
    founderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Denormalized founder name + avatar for fast community feed rendering
    founderName:   { type: String, default: '' },
    founderAvatar: { type: String, default: '' },

    title:        { type: String, required: true },
    pitchSummary: { type: String, required: true },
    pitchVideoRef:{ type: String, default: null },   // encrypted storage pointer

    targetAmount:  { type: Number, required: true },   // in INR
    currentAmount: { type: Number, default: 0 },       // dynamically updated on each pledge
    backerCount:   { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['active', 'funded', 'closed', 'expired'],
      default: 'active',
      index: true,
    },

    expiresAt:  { type: Date, required: true },
    category:   { type: String, default: '' },   // e.g. 'inventory', 'rent', 'equipment'

    // Embedded pledges (bounded for MVP — see production note above)
    pledges: { type: [PledgeSchema], default: [] },
  },
  { timestamps: true }
);

// ── Virtual: funding progress percentage ─────────────────────────────────────
MicroGrantSchema.virtual('progressPercent').get(function () {
  if (!this.targetAmount) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// ── Compound indexes ─────────────────────────────────────────────────────────
MicroGrantSchema.index({ status: 1, createdAt: -1 });           // community feed (active posts first)
MicroGrantSchema.index({ founderId: 1, status: 1 });
MicroGrantSchema.index({ expiresAt: 1, status: 1 });            // expiry cron job queries

export default mongoose.model('MicroGrant', MicroGrantSchema);
