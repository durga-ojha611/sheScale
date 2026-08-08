/**
 * Match.model.js
 * Reason: STANDALONE — created ONLY when both users swipe right (mutual match).
 * Individual swipe actions are NOT persisted long-term (analytics flag noted below).
 * Tradeoff: This saves significant write volume. If swipe analytics are needed later,
 * add a separate lightweight Swipe collection (userId, targetId, direction, timestamp).
 * The conversationId links to ChatMessage for the match's direct message thread.
 */

import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    // Always store userA < userB (lexicographic) to enforce uniqueness and prevent duplicate pairs
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    matchType: {
      type: String,
      enum: ['cofounder', 'business_partner'],
      default: 'cofounder',
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
      index: true,
    },

    // Computed at match time from skill-vector similarity algorithm
    skillComplementScore: { type: Number, min: 0, max: 100, default: 0 },

    // Links to the shared ChatMessage thread for this pair
    conversationId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Which user initiated the final swipe that created the match
    matchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// ── Compound indexes ─────────────────────────────────────────────────────────
// Unique pair constraint — prevents duplicate match documents for the same two users
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
MatchSchema.index({ userA: 1, status: 1 });
MatchSchema.index({ userB: 1, status: 1 });

export default mongoose.model('Match', MatchSchema);
