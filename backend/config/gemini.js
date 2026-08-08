// config/gemini.js — Shared Gemini API client singleton
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

// Text generation model — used for scheme matching, PDF parsing, mentor chat, financial plans
export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  generationConfig: {
    temperature: 0.2,       // low temp for factual extraction tasks
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

// Flash model — faster/cheaper for high-frequency calls (scheme filter, quick Q&A)
export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash',
  generationConfig: {
    temperature: 0.3,
    topP: 0.95,
    maxOutputTokens: 4096,
  },
});

// Embedding model — used for RAG vector generation
export const getEmbedding = async (text) => {
  const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};

export default genAI;
