import { callGemini } from './geminiService.js';
import { geminiFlash } from '../config/gemini.js';
import { AppError } from '../utils/AppError.js';

export const analyzePitch = async (pitchText) => {
  const prompt = `
Analyze the startup pitch and return ONLY valid JSON with:
* pitchScore (0-100)
* clarityScore (0-100)
* marketScore (0-100)
* strengths (array of strings)
* weaknesses (array of strings)
* suggestions (array of strings)
* fundingReadiness (Low, Medium, or High)

Do NOT return explanation text, no markdown backticks. Return raw JSON.

Pitch to analyze:
"${pitchText}"
  `.trim();

  try {
    const result = await callGemini(geminiFlash, prompt);
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new AppError('Failed to analyze pitch with AI. Please try again later.', 500);
  }
};
