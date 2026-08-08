import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import * as aiService from '../services/ai.service.js';
import User from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const analyzePitch = asyncHandler(async (req, res) => {
  const { pitchText, userId } = req.body;

  if (!pitchText) {
    throw new AppError('pitchText is required', 400);
  }

  const analysisResult = await aiService.analyzePitch(pitchText);

  // Return strictly JSON as requested
  res.status(200).json(analysisResult);
});

export const getReadiness = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // A basic readiness computation using user profile data.
  // In a real app, this might pull from past saved pitches.
  const profileComplete = user.profile.onboarding?.profileComplete ? 30 : 0;
  const hasDomain = user.profile.domain ? 20 : 0;
  
  const overallScore = 50 + profileComplete + hasDomain;

  res.status(200).json({
    overallScore,
    breakdown: {
      ideaClarity: 75,
      financialReadiness: 60,
      riskLevel: 40
    }
  });
});

export const suggestMentors = asyncHandler(async (req, res) => {
  const { domain, location } = req.body;

  // Load static mentors data for MVP
  const mentorsPath = path.join(__dirname, '../data/mentors.json');
  let mentors = [];
  try {
    const rawData = fs.readFileSync(mentorsPath, 'utf-8');
    mentors = JSON.parse(rawData);
  } catch (error) {
    mentors = [];
  }

  // Filter based on domain or location (simple matching)
  let recommendedMentors = mentors;
  if (domain || location) {
    recommendedMentors = mentors.filter(mentor => {
      const matchDomain = domain ? mentor.expertise.toLowerCase().includes(domain.toLowerCase()) : false;
      const matchLocation = location ? mentor.location.toLowerCase() === location.toLowerCase() : false;
      return matchDomain || matchLocation;
    });
  }

  // Fallback if no exact match
  if (recommendedMentors.length === 0 && mentors.length > 0) {
    recommendedMentors = mentors.slice(0, 2);
  }

  res.status(200).json({ recommendedMentors });
});
