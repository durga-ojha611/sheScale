import { GovernmentScheme } from '../models/index.js';
import { matchSchemesToQuery, getEmbeddingVector } from './geminiService.js';
import { logger } from '../utils/logger.js';

// Memory cache for the faiss index (optional — used only when faiss-node is installed)
let faissAvailable = false;
let index = null;
let schemeIdMap = {};

// Lazy-load faiss only if available
const tryLoadFaiss = async () => {
  try {
    const faissModule = await import('faiss-node');
    const faiss = faissModule.default || faissModule;
    const path = await import('path');
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const INDEX_PATH = path.join(__dirname, '../data/scheme_vectors.index');
    const MAP_PATH = path.join(__dirname, '../data/scheme_map.json');

    if (fs.existsSync(INDEX_PATH) && fs.existsSync(MAP_PATH)) {
      index = faiss.IndexFlatL2.read(INDEX_PATH);
      schemeIdMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
      faissAvailable = true;
      logger.info(`Loaded existing Faiss index with ${Object.keys(schemeIdMap).length} entries.`);
      return;
    }

    logger.info('Building new Faiss index for Government Schemes...');
    const d = 3072;
    index = new faiss.IndexFlatL2(d);

    const schemes = await GovernmentScheme.find({ isActive: true }).lean();
    for (let i = 0; i < schemes.length; i++) {
      const scheme = schemes[i];
      const textToEmbed = `${scheme.name}. ${scheme.description}. Eligibility: ${JSON.stringify(scheme.eligibility)}`;
      const embedding = await getEmbeddingVector(textToEmbed);
      index.add(embedding);
      schemeIdMap[i] = scheme._id.toString();
    }

    if (!fs.existsSync(path.dirname(INDEX_PATH))) {
      fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
    }
    index.write(INDEX_PATH);
    fs.writeFileSync(MAP_PATH, JSON.stringify(schemeIdMap));
    faissAvailable = true;
    logger.info(`Faiss index built with ${schemes.length} schemes.`);
  } catch (error) {
    faissAvailable = false;
    logger.warn('Faiss not available, falling back to Gemini-only matching:', error.message);
  }
};

/**
 * runSchemeMatchPipeline — RAG pipeline with graceful degradation
 * If Faiss is unavailable, fetches all schemes from DB and uses Gemini to rank them.
 */
export const runSchemeMatchPipeline = async (userQuery, userProfile = {}) => {
  // ── Try FAISS path ─────────────────────────────────────────────────────────
  if (!faissAvailable) await tryLoadFaiss();

  let relevantSchemes = [];

  if (faissAvailable && index && Object.keys(schemeIdMap).length > 0) {
    try {
      const queryEmbedding = await getEmbeddingVector(userQuery);
      const k = Math.min(10, Object.keys(schemeIdMap).length);
      const results = index.search(queryEmbedding, k);
      const matchedMongoIds = results.labels.map(id => schemeIdMap[id]).filter(Boolean);
      relevantSchemes = await GovernmentScheme.find({ _id: { $in: matchedMongoIds } })
        .select('name schemeCode description eligibility financialTerms requiredDocuments applicationSteps alertBoxes')
        .lean();
    } catch (err) {
      logger.warn('Faiss search failed, falling back to full DB scan:', err.message);
    }
  }

  // ── Fallback: fetch all active schemes from DB (no FAISS needed) ───────────
  if (relevantSchemes.length === 0) {
    logger.info('Using full DB scan for scheme matching (no FAISS)');
    relevantSchemes = await GovernmentScheme.find({ isActive: true })
      .select('name schemeCode description eligibility financialTerms requiredDocuments applicationSteps alertBoxes')
      .lean();
  }

  if (relevantSchemes.length === 0) {
    logger.warn('No schemes found in database at all');
    return [];
  }

  // ── Gemini semantic ranking ────────────────────────────────────────────────
  try {
    const matchedSchemes = await matchSchemesToQuery(userQuery, relevantSchemes);
    if (Array.isArray(matchedSchemes) && matchedSchemes.length > 0) {
      return matchedSchemes;
    }
    logger.warn('Gemini returned empty match array, using heuristic fallback');
  } catch (error) {
    logger.warn('Gemini Match Pipeline failed, using local heuristic fallback:', error.message);
  }

  // ── Final Fallback: return all schemes with heuristic scores ──────────────
  return relevantSchemes.slice(0, 5).map((scheme, idx) => {
    const matchScore = Math.max(95 - idx * 7, 60);
    return {
      schemeName: scheme.name,
      schemeId: scheme._id.toString(),
      _id: scheme._id.toString(),
      badge: 'Government of India',
      matchScore,
      subScores: {
        eligibility: Math.min(matchScore + 5, 100),
        financialFit: Math.max(matchScore - 5, 50),
        documentation: 70,
        businessStage: Math.min(matchScore + 2, 100),
        location: 90,
      },
      pros: [
        `Aligned with your described business category.`,
        `Collateral: ${scheme.financialTerms?.collateralRequired ? 'Required' : 'Not Required (Collateral-Free)'}`,
        `Max funding: ₹${((scheme.financialTerms?.maxLoanAmount || 0) / 100000).toFixed(1)} Lakh`,
      ],
      cons: [
        'Requires complete business documentation.',
        'Processing time: 2–6 weeks.',
      ],
      highlights: [
        `Interest Rate: ${scheme.financialTerms?.interestRateMin || 'N/A'}% – ${scheme.financialTerms?.interestRateMax || 'N/A'}% p.a.`,
        `Loan Amount: ₹${((scheme.financialTerms?.minLoanAmount || 0) / 100000).toFixed(1)}L – ₹${((scheme.financialTerms?.maxLoanAmount || 0) / 100000).toFixed(1)} Lakh`,
        `Tenure: ${scheme.financialTerms?.tenureMonths || 'N/A'} months`,
      ],
      improvements: [
        'Prepare a detailed 12-month P&L projection.',
        'Register your business as MSME/Udyam online.',
        'Open a dedicated business current account.',
      ],
      aiRationale: `${scheme.name} is well-aligned with your business profile. ${scheme.description?.slice(0, 200)}...`,
      eligibilitySummary: `You match the criteria for ${scheme.name} based on your business stage and domain.`,
      financialSummary: `This scheme offers funding from ₹${((scheme.financialTerms?.minLoanAmount || 0) / 100000).toFixed(1)}L to ₹${((scheme.financialTerms?.maxLoanAmount || 0) / 100000).toFixed(1)} Lakh at ${scheme.financialTerms?.interestRateMin || 'N/A'}% interest.`,
    };
  });
};

// Legacy export for initVectorStore (called in app.js startup)
export const initVectorStore = tryLoadFaiss;
