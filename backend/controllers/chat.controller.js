// controllers/chat.controller.js — Shared chat message retrieval (used by Mentorship + Networking)
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginated } from '../utils/responseFormatter.js';
import { ChatMessage } from '../models/index.js';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new AppError('Invalid conversationId', 400);
  }

  const page  = parseInt(req.query.page  || '1', 10);
  const limit = parseInt(req.query.limit || '30', 10);
  const skip  = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })  // newest first, frontend reverses for display
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatMessage.countDocuments({ conversationId }),
  ]);

  sendPaginated(res, messages.reverse(), { total, page, limit });
});
