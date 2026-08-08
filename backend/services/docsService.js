import pdfParse from 'pdf-parse';
import { geminiFlash } from '../config/gemini.js';
import { User } from '../models/index.js';
import { updateChecklistProgress } from './userChecklistService.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const analyzeDocument = async (userId, fileBuffer, fileName) => {
  if (!fileBuffer) {
    throw new AppError('No document file provided.', 400);
  }

  let pdfData;
  try {
    pdfData = await pdfParse(fileBuffer);
  } catch (err) {
    logger.error('pdf-parse failed:', err);
    throw new AppError('Failed to parse PDF document. Please ensure it is a valid PDF.', 400);
  }

  const extractedText = pdfData.text || '';
  if (!extractedText.trim()) {
    throw new AppError('The uploaded PDF document contains no readable text.', 400);
  }

  const prompt = `
You are an expert document verification AI for SHEscale Indian Women Founders Platform.
Analyze the following document text from file "${fileName}".

OUTPUT ONLY valid JSON in this exact structure — no markdown blocks, no text before/after:
{
  "isValid": true,
  "docType": "Aadhaar Card / PAN Card / Udyam Certificate / Registration Doc / Policy Doc / Other",
  "extractedFields": {
    "holderName": "Name if found or N/A",
    "documentNumber": "Identifier if found or N/A",
    "issuingAuthority": "Government of India / Ministry / State / N/A"
  },
  "flags": [
    "Clear observation or potential risk alert 1",
    "Clear observation 2"
  ]
}

DOCUMENT TEXT:
${extractedText.substring(0, 10000)}
  `.trim();

  try {
    const result = await geminiFlash.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    const verificationResult = JSON.parse(rawText);

    // Save result to User model and update checklist progress
    await User.findByIdAndUpdate(userId, {
      $set: { docVerification: verificationResult }
    });

    await updateChecklistProgress(userId, { scanIdentityDocs: true });

    return verificationResult;
  } catch (err) {
    logger.error('Gemini doc verification failed:', err);
    throw new AppError('Failed to verify document authenticity with Gemini AI.', 502);
  }
};
