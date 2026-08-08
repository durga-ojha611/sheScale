import { geminiFlash } from '../config/gemini.js';
import { User } from '../models/index.js';
import { updateChecklistProgress } from './userChecklistService.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// ── Heuristic P&L fallback (used when Gemini is rate-limited / unavailable) ──
const buildFallbackPnL = (businessIdea, category) => {
  // Scale projections based on category
  const categoryMultipliers = {
    manufacturing: 1.2, technology: 1.5, services: 1.0,
    food: 0.9, retail: 0.8, agriculture: 0.7, healthcare: 1.3,
    education: 1.1, beauty: 0.95, textile: 0.85
  };
  const mult = categoryMultipliers[category?.toLowerCase()] || 1.0;

  const base = [
    { month: 1,  revenue: 42000,  cogs: 16800,  opex: 14000 },
    { month: 2,  revenue: 55000,  cogs: 22000,  opex: 14500 },
    { month: 3,  revenue: 68000,  cogs: 27200,  opex: 15000 },
    { month: 4,  revenue: 82000,  cogs: 32800,  opex: 15500 },
    { month: 5,  revenue: 98000,  cogs: 39200,  opex: 16000 },
    { month: 6,  revenue: 115000, cogs: 46000,  opex: 16500 },
    { month: 7,  revenue: 128000, cogs: 51200,  opex: 17000 },
    { month: 8,  revenue: 143000, cogs: 57200,  opex: 17500 },
    { month: 9,  revenue: 158000, cogs: 63200,  opex: 18000 },
    { month: 10, revenue: 172000, cogs: 68800,  opex: 18500 },
    { month: 11, revenue: 187000, cogs: 74800,  opex: 19000 },
    { month: 12, revenue: 205000, cogs: 82000,  opex: 19500 },
  ];

  const monthlyProjections = base.map(r => {
    const revenue     = Math.round(r.revenue * mult);
    const cogs        = Math.round(r.cogs * mult);
    const opex        = Math.round(r.opex * mult);
    const grossProfit = revenue - cogs;
    const netProfit   = grossProfit - opex;
    return { month: r.month, revenue, cogs, grossProfit, opex, netProfit };
  });

  return {
    summary: `Based on your ${category || 'business'} profile, your projected revenue grows from ₹${(monthlyProjections[0].revenue/1000).toFixed(0)}K to ₹${(monthlyProjections[11].revenue/1000).toFixed(0)}K over 12 months. Your business is expected to break even by Month 4 with positive cash flows thereafter.`,
    breakEvenMonth: 4,
    monthlyProjections,
    cfoAdvice: [
      'Maintain a 3-month emergency working capital reserve before scaling operations.',
      'Negotiate supplier credit terms of 30–45 days to improve your cash conversion cycle.',
      'Target gross margins above 55% by optimizing raw material procurement in bulk.',
      'Apply for GST registration early to claim input tax credits and reduce overall costs.',
    ],
  };
};

export const generatePnLPlan = async (userId, inputIdea, inputCategory) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const businessIdea = inputIdea || user.businessDetails?.businessIdea || user.profile?.bio;
  const category = inputCategory || user.businessDetails?.category || user.profile?.domain || 'General';

  if (!businessIdea?.trim()) {
    throw new AppError('Please provide a business description or idea to generate P&L projections.', 400);
  }

  // Persist business details
  user.businessDetails = { businessIdea, category, isWomanFounder: true };
  await user.save();

  const prompt = `
You are the Chief Financial Officer (CFO) AI for SHEscale Indian Women Founders Platform.
Construct a realistic 12-month P&L (Profit & Loss) projection table and CFO advice for this business idea:
Category: ${category}
Business Description: "${businessIdea}"

OUTPUT ONLY valid JSON in this exact structure — no markdown backticks, no extra text:
{
  "summary": "2-sentence executive financial overview",
  "breakEvenMonth": 4,
  "monthlyProjections": [
    { "month": 1, "revenue": 50000, "cogs": 20000, "grossProfit": 30000, "opex": 15000, "netProfit": 15000 },
    { "month": 2, "revenue": 60000, "cogs": 24000, "grossProfit": 36000, "opex": 16000, "netProfit": 20000 },
    { "month": 3, "revenue": 75000, "cogs": 30000, "grossProfit": 45000, "opex": 17000, "netProfit": 28000 },
    { "month": 4, "revenue": 90000, "cogs": 36000, "grossProfit": 54000, "opex": 18000, "netProfit": 36000 },
    { "month": 5, "revenue": 105000, "cogs": 42000, "grossProfit": 63000, "opex": 19000, "netProfit": 44000 },
    { "month": 6, "revenue": 120000, "cogs": 48000, "grossProfit": 72000, "opex": 20000, "netProfit": 52000 },
    { "month": 7, "revenue": 135000, "cogs": 54000, "grossProfit": 81000, "opex": 21000, "netProfit": 60000 },
    { "month": 8, "revenue": 150000, "cogs": 60000, "grossProfit": 90000, "opex": 22000, "netProfit": 68000 },
    { "month": 9, "revenue": 165000, "cogs": 66000, "grossProfit": 99000, "opex": 23000, "netProfit": 76000 },
    { "month": 10, "revenue": 180000, "cogs": 72000, "grossProfit": 108000, "opex": 24000, "netProfit": 84000 },
    { "month": 11, "revenue": 195000, "cogs": 78000, "grossProfit": 117000, "opex": 25000, "netProfit": 92000 },
    { "month": 12, "revenue": 210000, "cogs": 84000, "grossProfit": 126000, "opex": 26000, "netProfit": 100000 }
  ],
  "cfoAdvice": [
    "Practical CFO tip 1 regarding working capital or margin optimization",
    "Practical CFO tip 2 regarding cash flow management"
  ]
}
  `.trim();

  let pnlData;
  try {
    const result = await geminiFlash.generateContent(prompt);
    let rawText = result.response.text().trim();
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      rawText = rawText.substring(jsonStart, jsonEnd + 1);
    }
    pnlData = JSON.parse(rawText);
    logger.info('P&L generated via Gemini AI');
  } catch (err) {
    logger.warn('Gemini P&L failed, using heuristic fallback:', err.message?.slice(0, 100));
    pnlData = buildFallbackPnL(businessIdea, category);
  }

  // Save to User model
  await User.findByIdAndUpdate(userId, { $set: { pnlData } });
  await updateChecklistProgress(userId, { generatePnLPlan: true }).catch(() => {});

  return pnlData;
};

export const getPnLPlan = async (userId) => {
  const user = await User.findById(userId).select('pnlData businessDetails');
  if (!user) throw new AppError('User not found', 404);
  return {
    pnlData: user.pnlData,
    businessDetails: user.businessDetails,
  };
};
