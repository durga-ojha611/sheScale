import { User, Mentor } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import * as mentorService from '../services/mentor.service.js';

export const getAITwinResponse = async (req, res, next) => {
  try {
    const { message, chatHistory, businessIdea } = req.body;
    
    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const aiResponse = await mentorService.getAITwinResponse(message, chatHistory || [], businessIdea);
    
    res.status(200).json({
      status: 'success',
      data: {
        reply: aiResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

export const evaluatePitch = async (req, res, next) => {
  try {
    const { pitchText, businessIdea } = req.body;
    
    if (!pitchText) {
      throw new AppError('Pitch text is required', 400);
    }

    const result = await mentorService.evaluateMockPitch(pitchText, businessIdea);
    
    // Update user's mentorship hub data
    const user = await User.findById(req.user.id);
    
    if (!user.mentorshipHub) {
      user.mentorshipHub = {
        readinessScore: 0,
        isMentorBookingUnlocked: false,
        mockPitchHistory: []
      };
    }
    
    user.mentorshipHub.mockPitchHistory.push({
      pitchText,
      score: result.score,
      feedback: {
        strengths: result.strengths,
        improvements: result.improvements
      }
    });
    
    // Update readiness score (use the latest or highest, here we use latest for simplicity)
    user.mentorshipHub.readinessScore = result.score;
    
    // Unlock mentor booking if score >= 80
    if (result.score >= 80) {
      user.mentorshipHub.isMentorBookingUnlocked = true;
    }
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        evaluation: result,
        isMentorBookingUnlocked: user.mentorshipHub.isMentorBookingUnlocked
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMentorList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.mentorshipHub?.isMentorBookingUnlocked) {
      throw new AppError('You must score 80+ in the Mock Pitch Simulator to unlock Mentor Booking.', 403);
    }
    
    const mentors = await Mentor.find({});
    
    res.status(200).json({
      status: 'success',
      data: {
        mentors
      }
    });
  } catch (error) {
    next(error);
  }
};

export const bookMentorSlot = async (req, res, next) => {
  try {
    const { mentorId, slotId } = req.body;
    
    if (!mentorId || !slotId) {
      throw new AppError('Mentor ID and Slot ID are required', 400);
    }
    
    const user = await User.findById(req.user.id);
    if (!user.mentorshipHub?.isMentorBookingUnlocked) {
      throw new AppError('Mentor Booking is locked.', 403);
    }
    
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new AppError('Mentor not found', 404);
    }
    
    const slot = mentor.availableSlots.id(slotId);
    if (!slot) {
      throw new AppError('Slot not found', 404);
    }
    
    if (slot.isBooked) {
      throw new AppError('This slot is already booked', 400);
    }
    
    slot.isBooked = true;
    await mentor.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Mentor booked successfully!'
    });
  } catch (error) {
    next(error);
  }
};
