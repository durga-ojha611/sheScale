import { asyncHandler } from '../utils/asyncHandler.js';
import Pitch from '../models/Pitch.model.js';
import User from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import * as matchService from '../services/match.service.js';

export const createPitch = asyncHandler(async (req, res) => {
  const { userId, title, problem, solution, budget, stage } = req.body;

  if (!userId || !title || !problem || !solution || budget === undefined || !stage) {
    throw new AppError('Missing required fields', 400);
  }

  const pitch = await Pitch.create({
    userId,
    title,
    problem,
    solution,
    budget,
    stage
  });

  // Return the structure requested in docs
  res.status(201).json({
    message: 'Pitch created successfully',
    pitch
  });
});

export const getPitches = asyncHandler(async (req, res) => {
  const pitches = await Pitch.find().sort({ createdAt: -1 });

  // Map to the requested output structure
  const formattedPitches = pitches.map(p => ({
    id: p._id,
    title: p.title,
    problem: p.problem,
    solution: p.solution,
    budget: p.budget,
    stage: p.stage,
    createdAt: p.createdAt
  }));

  res.status(200).json({ pitches: formattedPitches });
});

export const matchCoFounders = asyncHandler(async (req, res) => {
  const { skills, needs } = req.body;

  if (!needs || !Array.isArray(needs)) {
    throw new AppError('needs array is required', 400);
  }

  const matches = await matchService.findCoFounders(skills || [], needs);

  res.status(200).json({ matches });
});

export const recommendConnections = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Simple AI recommendation mock based on user domain
  const domain = user.profile?.domain || 'General';

  // Find users in the same domain
  const relatedUsers = await User.find({
    _id: { $ne: userId },
    'profile.domain': { $regex: domain, $options: 'i' }
  }).select('_id profile.businessName profile.domain profile.city').limit(5);

  const recommendations = relatedUsers.map(u => ({
    userId: u._id,
    name: u.profile.businessName || 'Anonymous',
    domain: u.profile.domain,
    reason: `Similar domain: ${domain}`
  }));

  res.status(200).json({ recommendations });
});
