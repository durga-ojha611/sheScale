import { callGemini } from './geminiService.js';
import { geminiFlash, geminiPro } from '../config/gemini.js';
import { AppError } from '../utils/AppError.js';

export const getAITwinResponse = async (message, chatHistory, businessIdea) => {
  const historyBlock = chatHistory
    .slice(-6)
    .map((m) => `${m.senderRole === 'user' ? 'Entrepreneur' : 'Mentor AI'}: ${m.content}`)
    .join('\n');

  const prompt = `
You are the SHEscale AI Twin Mentor — a highly successful Indian female founder.
Your persona is a mix of Falguni Nayar's scale and Kiran Mazumdar-Shaw's pragmatism.
Your tone must be encouraging yet fiercely realistic, utilizing a slight Hinglish flavor.

ENTREPRENEUR'S BUSINESS IDEA:
"${businessIdea || 'Not provided'}"

RECENT CONVERSATION:
${historyBlock || '(new conversation)'}

CURRENT MESSAGE: "${message}"

Respond directly to the user as their mentor. Weave their business idea into the advice.
Keep the response under 250 words.
  `.trim();

  return await callGemini(geminiFlash, prompt);
};

export const evaluateMockPitch = async (pitchText, businessIdea) => {
  const prompt = `
You are a strict VC / Bank Loan Officer evaluating a pitch from an Indian woman entrepreneur.

BUSINESS IDEA BACKGROUND:
"${businessIdea || 'Not provided'}"

PITCH TEXT:
"${pitchText}"

Evaluate this pitch stringently.
OUTPUT ONLY valid JSON in this exact shape:
{
  "score": integer(0-100),
  "matrix": {
    "clarity": integer(0-100),
    "financials": integer(0-100),
    "marketFit": integer(0-100)
  },
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}
  `.trim();

  const raw = await callGemini(geminiPro, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse mock pitch evaluation from Gemini.', 502);
  }
};
