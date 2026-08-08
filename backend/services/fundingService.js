// services/fundingService.js — Funding Hub business logic (Features 1.1 – 1.4)
import { FundingApplication, FinancialPlan, GovernmentScheme } from '../models/index.js';
import { parsePolicyPdf, generateFinancialPlan, callGemini } from './geminiService.js';
import { geminiFlash } from '../config/gemini.js';
import { redactText, generateDocRef } from '../utils/redaction.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// ── Funding Applications ─────────────────────────────────────────────────────

export const createApplication = async (userId, { applicationTitle, targetSchemeName }) => {
  return FundingApplication.create({ userId, applicationTitle, targetSchemeName });
};

export const getUserApplications = async (userId) => {
  return FundingApplication.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const getApplicationById = async (applicationId, userId) => {
  const app = await FundingApplication.findOne({ _id: applicationId, userId });
  if (!app) throw new AppError('Application not found.', 404);
  return app;
};

// Template fallback when Gemini is unavailable
const buildFallbackApplication = (scheme, businessIdeaText) => {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const schemeName = scheme?.name || 'Government Scheme for Women Entrepreneurs';
  const ministry = scheme?.ministry || 'Ministry of Finance, Government of India';
  const maxLoan = scheme?.financialTerms?.maxLoanAmount
    ? `₹${(scheme.financialTerms.maxLoanAmount / 100000).toFixed(0)} Lakh`
    : '₹10 Lakh';

  return `Date: ${today}

To,
The Branch Manager / Nodal Officer
${ministry}

Subject: Application for Loan/Grant under "${schemeName}"

Respected Sir/Madam,

I, a woman entrepreneur, humbly submit this application for financial assistance under the "${schemeName}" scheme. I am writing to request your consideration for funding support to establish and grow my business venture.

BUSINESS OVERVIEW:
${businessIdeaText}

ELIGIBILITY & SCHEME ALIGNMENT:
I am a woman entrepreneur who fully meets the eligibility criteria of the ${schemeName}. My business operates in alignment with the scheme's targeted sectors. I am committed to building a sustainable, growth-oriented enterprise that will contribute to local employment and economic development.

FINANCIAL REQUEST:
I respectfully request financial support of up to ${maxLoan} under this scheme. The funds will be utilized for:
- Working capital requirements and operational expenses
- Procurement of equipment/machinery as needed
- Business expansion and capacity building
- Marketing and customer acquisition initiatives

DECLARATION:
I hereby declare that all information provided is true and accurate to the best of my knowledge. I understand that any misrepresentation may result in the rejection of this application.

I assure you that I will utilize the funds responsibly and adhere to all terms and conditions of the scheme.

Yours faithfully,

[Your Name]
[Business Name]
[Contact Number]
[Email Address]
[Business Registration Number]
[Date]`;
};

export const generateApplication = async (userId, schemeId, businessIdeaText) => {
  // schemeId may be a MongoDB ObjectId string or a Gemini-returned string id
  let scheme = null;
  if (schemeId) {
    try { scheme = await GovernmentScheme.findById(schemeId).lean(); } catch (_) {}
  }
  // Fallback: pick any active scheme if id lookup failed
  if (!scheme) {
    scheme = await GovernmentScheme.findOne({ isActive: true }).lean();
  }
  if (!scheme) throw new AppError('No schemes found in the database. Please sync schemes first.', 404);

  const prompt = `
    You are an expert loan officer and business consultant for Indian women entrepreneurs.
    Generate a formal, professional loan application document for the following scheme:
    Scheme Name: ${scheme.name}
    Scheme Description: ${scheme.description}

    The user's business idea/details:
    ${businessIdeaText}

    Create a formal application draft that includes:
    1. Formal greeting to the relevant authority (e.g., Bank Manager, Nodal Agency).
    2. Clear statement of purpose.
    3. Business overview.
    4. Justification of how the business meets the scheme's criteria.
    5. Financial request overview.
    6. Closing statement.

    Return ONLY the raw text of the application. Do not include markdown formatting or extra conversational text.
  `;

  let generatedText;
  try {
    generatedText = await callGemini(geminiFlash, prompt);
    logger.info('Application generated via Gemini AI');
  } catch (err) {
    logger.warn('Gemini application generation failed, using template fallback:', err.message?.slice(0, 100));
    generatedText = buildFallbackApplication(scheme, businessIdeaText);
  }

  try {
    let application = await FundingApplication.findOne({ userId, targetSchemeName: scheme.name });
    if (!application) {
      application = new FundingApplication({
        userId,
        applicationTitle: `Application for ${scheme.name}`,
        targetSchemeName: scheme.name,
        applicationStatus: 'draft',
        generatedApplicationText: generatedText
      });
    } else {
      application.generatedApplicationText = generatedText;
      application.applicationStatus = 'draft';
    }
    await application.save();
    return { applicationId: application._id, text: generatedText };
  } catch (saveErr) {
    logger.warn('Could not save application to DB:', saveErr.message);
    return { applicationId: null, text: generatedText };
  }
};


// ── Feature 1.2: PDF Doc-Whisperer ──────────────────────────────────────────

export const processPolicyPdf = async (applicationId, userId, fileBuffer, originalName) => {
  const application = await getApplicationById(applicationId, userId);

  // Dynamic import of pdf-parse (ESM-compatible workaround)
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const pdfData = await pdfParse(fileBuffer);

  // Redact any sensitive strings in the extracted text before AI processing
  const cleanText = redactText(pdfData.text);

  // Send to Gemini Doc-Whisperer
  const analysis = await parsePolicyPdf(cleanText);

  // Store encrypted file reference (never the raw file)
  const pdfRef = generateDocRef(userId.toString(), 'policy_pdf');

  application.pdfAnalysis = {
    sourcePdfRef:    pdfRef,
    analyzedAt:      new Date(),
    eligibilityCards: analysis.eligibilityCards || [],
    financialTerms:  analysis.financialTerms || [],
    alertBoxes:      analysis.alertBoxes || [],
  };

  await application.save();
  return { analysis, pdfRef, applicationTitle: application.applicationTitle };
};

// ── Feature 1.3: Document Pre-Flight Scanner ─────────────────────────────────

export const scanAndTrackDocument = async (applicationId, userId, fileBuffer, docType) => {
  const application = await getApplicationById(applicationId, userId);

  // Basic canvas-style quality checks on the buffer
  const scanResult = assessDocumentQuality(fileBuffer);

  // Generate secure reference — raw file goes to encrypted storage (external)
  const documentRef = generateDocRef(userId.toString(), docType);

  // Find existing tracker step or add new one
  const existingStepIdx = application.documentTracker.findIndex((s) => s.docType === docType);
  const stepData = {
    docType,
    uploadStatus: scanResult === 'ok' ? 'uploaded' : 'rejected',
    scanResult,
    documentRef,
    uploadedAt: new Date(),
  };

  if (existingStepIdx >= 0) {
    application.documentTracker[existingStepIdx] = stepData;
  } else {
    application.documentTracker.push(stepData);
  }

  await application.save();
  return { scanResult, documentRef, docType };
};

/**
 * assessDocumentQuality — lightweight quality check on uploaded file buffer
 * Real implementation would use canvas/sharp for blur/crop detection.
 * For MVP: checks file size thresholds as a proxy for quality.
 */
const assessDocumentQuality = (buffer) => {
  if (!buffer || buffer.length < 5000)   return 'blurry';   // too small = likely low quality
  if (buffer.length > 15 * 1024 * 1024) return 'cut_off';  // unusually large for a document
  return 'ok';
};

// ── Feature 1.4: BizCalculus Financial Planner ───────────────────────────────

export const createFinancialPlan = async (userId, { rawStatement, inputs, scenarioName }) => {
  // Validate minimum inputs
  if (!inputs.sellingPricePerUnit || !inputs.rawMaterialCostPerUnit) {
    throw new AppError('Selling price and raw material cost are required.', 400);
  }
  if (inputs.sellingPricePerUnit <= inputs.rawMaterialCostPerUnit) {
    throw new AppError('Selling price must be greater than raw material cost.', 400);
  }

  const outputs = await generateFinancialPlan(inputs, rawStatement);

  return FinancialPlan.create({
    userId,
    scenarioName: scenarioName || 'My Business Plan',
    rawUserStatement: rawStatement,
    inputs,
    outputs,
    status: 'finalized',
  });
};

export const getUserFinancialPlans = async (userId) => {
  return FinancialPlan.find({ userId }).sort({ createdAt: -1 }).lean();
};

export const getFinancialPlanById = async (planId, userId) => {
  const plan = await FinancialPlan.findOne({ _id: planId, userId });
  if (!plan) throw new AppError('Financial plan not found.', 404);
  return plan;
};
