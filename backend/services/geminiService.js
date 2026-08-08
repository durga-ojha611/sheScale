// services/geminiService.js — Single shared wrapper for ALL Gemini API calls
// Every prompt, retry, and API key concern lives here. No scattered Gemini calls in controllers.
import { geminiPro, geminiFlash, getEmbedding } from '../config/gemini.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * callGemini — base retry wrapper for all Gemini text generation calls
 */
export const callGemini = async (model, prompt, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      logger.warn(`Gemini attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw new AppError(`Gemini API error: ${err.message}`, 502);
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
};

/**
 * parseSchemeFromText — Feature 1.5 / RAG sync
 * Extracts structured scheme data from raw policy text (PDF or web scrape)
 */
export const parseSchemeFromText = async (rawText, schemeName) => {
  const prompt = `
You are a government scheme data extraction engine. Extract structured information from the following policy text for the scheme: "${schemeName}".

OUTPUT ONLY valid JSON in this exact shape — no markdown, no commentary:
{
  "name": "",
  "shortName": "",
  "ministry": "",
  "description": "",
  "eligibility": {
    "businessStages": [],
    "applicableStates": [],
    "applicableDomains": [],
    "minTurnover": 0,
    "maxTurnover": null,
    "genderRequirement": "women_only",
    "additionalCriteria": []
  },
  "financialTerms": {
    "minLoanAmount": 0,
    "maxLoanAmount": null,
    "interestRateMin": null,
    "interestRateMax": null,
    "tenureMonths": null,
    "subsidyPercent": 0,
    "collateralRequired": false
  },
  "requiredDocuments": [],
  "applicationSteps": [{ "stepNumber": 1, "title": "", "description": "", "portalUrl": "" }],
  "alertBoxes": []
}

POLICY TEXT:
${rawText.slice(0, 12000)}
  `.trim();

  const raw = await callGemini(geminiFlash, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse scheme JSON from Gemini response.', 502);
  }
};

/**
 * matchSchemesToQuery — Feature 1.1 Conversational Scheme Matcher (RAG completion step)
 * Takes retrieved scheme context + user query → returns matched scheme cards as JSON
 */
export const matchSchemesToQuery = async (userQuery, schemeContexts) => {
  const contextBlock = schemeContexts
    .map((s, i) => `SCHEME ${i + 1}: ${s.name}\n${JSON.stringify(s, null, 2)}`)
    .join('\n\n---\n\n');

  const prompt = `
You are SHEscale's AI Scheme Matcher for Indian women entrepreneurs.

USER'S BUSINESS DESCRIPTION:
"${userQuery}"

AVAILABLE SCHEMES (live data from government portals):
${contextBlock}

Evaluate each scheme against the user's business description. For each scheme that is a GOOD MATCH, return it in the JSON array below. Rank them by overall match score.

OUTPUT ONLY valid JSON — no markdown, no explanation:
[
  {
    "schemeName": "",
    "schemeId": "",
    "badge": "e.g. Government of India, State level",
    "matchScore": 85,
    "subScores": {
      "eligibility": 90,
      "financialFit": 80,
      "documentation": 75,
      "businessStage": 95,
      "location": 85
    },
    "pros": ["Pro 1", "Pro 2"],
    "cons": ["Con 1", "Con 2"],
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
    "eligibilitySummary": "Detailed explanation of why she qualifies...",
    "financialSummary": "Detailed explanation of the financial terms..."
  }
]
  `.trim();

  const raw = await callGemini(geminiPro, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse scheme match JSON from Gemini.', 502);
  }
};

/**
 * parsePolicyPdf — Feature 1.2 PDF Doc-Whisperer
 * Converts dense PDF text into eligibility cards, financial pills, and alert boxes
 */
export const parsePolicyPdf = async (pdfText) => {
  const prompt = `
You are the SHEscale PDF Policy Doc-Whisperer. Convert this government policy document into a clean, structured summary for a first-time woman entrepreneur.

OUTPUT ONLY valid JSON — no markdown:
{
  "eligibilityCards": ["Clear statement 1", "Clear statement 2"],
  "financialTerms": [
    { "label": "Loan Amount", "value": "₹50,000 – ₹10 Lakh" },
    { "label": "Interest Rate", "value": "7.5% p.a." }
  ],
  "alertBoxes": ["⚠️ Hidden fee: ...", "🚨 Deadline: ..."],
  "summary": "2-sentence plain language overview"
}

POLICY TEXT:
${pdfText.slice(0, 15000)}
  `.trim();

  const raw = await callGemini(geminiPro, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse PDF analysis JSON from Gemini.', 502);
  }
};

/**
 * generateFinancialPlan — Feature 1.4 BizCalculus AI
 * Converts plain-language unit economics into 3-year P&L projections
 */
export const generateFinancialPlan = async (inputs, rawStatement) => {
  const prompt = `
You are SHEscale's BizCalculus financial engine for a women entrepreneur.

USER'S STATEMENT: "${rawStatement}"

EXTRACTED INPUTS:
- Raw material cost per unit: ₹${inputs.rawMaterialCostPerUnit}
- Selling price per unit: ₹${inputs.sellingPricePerUnit}
- Monthly volume: ${inputs.monthlyVolume} units
- Fixed monthly costs: ₹${inputs.fixedMonthlyCosts}
- Assumed annual growth rate: ${inputs.growthRatePercent}%

Calculate and OUTPUT ONLY valid JSON:
{
  "breakEvenUnits": 0,
  "breakEvenRevenue": 0,
  "yearlyProjections": [
    { "year": 1, "revenue": 0, "totalCost": 0, "grossProfit": 0, "netProfit": 0, "profitMargin": 0 },
    { "year": 2, "revenue": 0, "totalCost": 0, "grossProfit": 0, "netProfit": 0, "profitMargin": 0 },
    { "year": 3, "revenue": 0, "totalCost": 0, "grossProfit": 0, "netProfit": 0, "profitMargin": 0 }
  ],
  "insights": ["Key insight 1", "Key insight 2"]
}
  `.trim();

  const raw = await callGemini(geminiFlash, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse financial plan JSON from Gemini.', 502);
  }
};

/**
 * aiMentorChat — Feature 2.1 AI Twin Mentor
 * Contextual advisory response using entrepreneur's profile
 */
export const aiMentorChat = async (message, userProfile, conversationHistory = []) => {
  const historyBlock = conversationHistory
    .slice(-6)  // last 3 exchanges
    .map((m) => `${m.senderRole === 'user' ? 'Entrepreneur' : 'Mentor AI'}: ${m.content}`)
    .join('\n');

  const prompt = `
You are the SHEscale AI Twin Mentor — modeled after successful Indian women entrepreneurs and investors. You are speaking with a women entrepreneur.

ENTREPRENEUR PROFILE:
- Business: ${userProfile.businessName || 'Not specified'} (${userProfile.domain || 'General'})
- Stage: ${userProfile.stage}
- Location: ${userProfile.city}, ${userProfile.state}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}

RECENT CONVERSATION:
${historyBlock || '(new conversation)'}

CURRENT QUESTION: "${message}"

Respond as a warm, direct, experienced mentor. Give actionable advice specific to her business context. Keep response under 200 words. Do NOT ask her to consult a professional for every question.
  `.trim();

  return await callGemini(geminiFlash, prompt);
};

/**
 * scoreInterview — Feature 2.2 Mock Interview Readiness Scoring
 * Analyses transcript and produces a quantitative readiness score matrix
 */
export const scoreInterview = async (transcriptSummary, sessionType) => {
  const interviewerType = sessionType === 'bank_officer' ? 'bank loan officer' : 'VC investor';

  const prompt = `
You are evaluating a women entrepreneur's performance in a mock ${interviewerType} interview for SHEscale.

INTERVIEW TRANSCRIPT SUMMARY:
${transcriptSummary}

Score her performance across 4 dimensions (0-100 each). Be honest and specific.

OUTPUT ONLY valid JSON:
{
  "overall": 0,
  "risk": 0,
  "marketing": 0,
  "operations": 0,
  "financial": 0,
  "feedback": [
    "Specific improvement area 1",
    "Specific improvement area 2",
    "Specific improvement area 3"
  ],
  "unlockedMentorAccess": false
}

Set "unlockedMentorAccess" to true ONLY if overall >= 65.
  `.trim();

  const raw = await callGemini(geminiPro, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse readiness score JSON from Gemini.', 502);
  }
};

/**
 * generateAiBrief — Feature 2.3 AI-vetted mentor brief
 * Creates a pre-formatted brief for the human mentor before the session
 */
export const generateAiBrief = async (userProfile, interviewScore, financialPlan) => {
  const prompt = `
Generate a concise pre-session brief for a human mentor at SHEscale who is about to spend 30 minutes with this entrepreneur.

ENTREPRENEUR:
- Business: ${userProfile.businessName} | Domain: ${userProfile.domain} | Stage: ${userProfile.stage}
- Location: ${userProfile.city}, ${userProfile.state}
- Readiness Score: ${interviewScore?.overall || 'N/A'}/100

FINANCIAL SNAPSHOT: ${financialPlan ? JSON.stringify(financialPlan.inputs) : 'Not available'}
INTERVIEW FEEDBACK: ${interviewScore?.feedback?.join('; ') || 'Not available'}

OUTPUT ONLY valid JSON:
{
  "businessSummary": "",
  "keyMetrics": ["Metric 1", "Metric 2"],
  "challengesIdentified": ["Challenge 1", "Challenge 2"],
  "suggestedAgendaItems": ["Agenda item 1", "Agenda item 2", "Agenda item 3"]
}
  `.trim();

  const raw = await callGemini(geminiFlash, prompt);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    throw new AppError('Failed to parse AI brief JSON from Gemini.', 502);
  }
};

/**
 * getEmbeddingVector — Re-export embedding for use in RAG service
 */
export { getEmbedding as getEmbeddingVector };
