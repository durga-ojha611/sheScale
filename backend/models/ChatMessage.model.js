/**
 * ChatMessage.model.js
 * Reason: STANDALONE — high write volume, append-heavy, independently paginated.
 * Shared across both Mentorship Hub (AI Twin chat) and Networking Hub (co-founder direct chat).
 * Embedding messages inside a Conversation doc would blow past the 16MB limit quickly
 * and make pagination impossible without custom logic.
 * A generic `conversationId` ties messages to either pillar context.
 */

import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      // No ref — conversationId is a logical grouping key shared across features.
      // The application layer decides which pillar context it belongs to.
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,     // null when sender is the AI
    },
    senderRole: {
      type: String,
      enum: ['user', 'ai', 'mentor', 'system'],
      required: true,
    },
    content:     { type: String, required: true },
    messageType: { type: String, enum: ['text', 'audio', 'system_event'], default: 'text' },
    audioRef:    { type: String, default: null },  // encrypted storage pointer for audio messages
    isRead:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Compound indexes — optimized for chat pagination ─────────────────────────
ChatMessageSchema.index({ conversationId: 1, createdAt: -1 });   // primary pagination query
ChatMessageSchema.index({ senderId: 1, conversationId: 1 });      // "messages by user in chat"

export default mongoose.model('ChatMessage', ChatMessageSchema);
