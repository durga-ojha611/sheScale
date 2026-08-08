// jobs/schemeSyncJob.js — Live Government Scheme Intelligence Panel Sync (Feature 1.5)
// Runs on a cron schedule. Fetches structured scheme data from government sources,
// passes each through Gemini's structural-extraction pipeline, and upserts into GovernmentScheme.
import cron from 'node-cron';
import { GovernmentScheme } from '../models/index.js';
import { parseSchemeFromText } from '../services/geminiService.js';
import { logger } from '../utils/logger.js';

// ── Seed data: Known government scheme sources for MVP ───────────────────────
// In production, replace these with actual scraped/fetched content from portals.
// Each entry represents a scheme whose policy text is fetched from the official source.
const SCHEME_SOURCES = [
  {
    schemeCode: 'MUDRA_SHISHU',
    name:        'Pradhan Mantri MUDRA Yojana — Shishu',
    sourcePortal: 'MUDRA Yojana',
    sourceUrl:    'https://www.mudra.org.in',
    rawText: `
      Pradhan Mantri MUDRA Yojana (PMMY) - Shishu Category.
      Loan up to ₹50,000 for micro-enterprises. Applicable to women entrepreneurs in early stage businesses.
      Interest rate: As per lending institution (typically 10-12% p.a.).
      No collateral required for Shishu loans.
      Eligible sectors: Manufacturing, trading, service sector.
      Required documents: Aadhaar card, address proof, business proof, bank account details.
      Application steps: Apply through nearest bank, NBFC, or MFI. Fill MUDRA loan application form.
      Applicable to all states. Business stages: idea, early.
    `,
  },
  {
    schemeCode: 'STANDUP_INDIA',
    name:        'Stand-Up India Scheme',
    sourcePortal: 'Stand-Up India',
    sourceUrl:    'https://www.standupmitra.in',
    rawText: `
      Stand-Up India Scheme — For Women and SC/ST Entrepreneurs.
      Loan between ₹10 lakh and ₹1 crore for setting up greenfield enterprises.
      Repayment period: 7 years with moratorium of 18 months.
      At least one woman borrower per bank branch must be facilitated.
      Eligible for manufacturing, services, or trading sector.
      Required documents: Identity proof, address proof, business plan, caste certificate if applicable,
      bank account statements for 6 months, ITR for last 2 years.
      Business stages: early, growth. Gender requirement: women only.
    `,
  },
  {
    schemeCode: 'MAHILA_UDYAM_NIDHI',
    name:        'Mahila Udyam Nidhi Scheme',
    sourcePortal: 'Punjab National Bank / SBI',
    sourceUrl:    'https://www.pnbindia.in',
    rawText: `
      Mahila Udyam Nidhi Scheme — for women entrepreneurs in small industry.
      Loan up to ₹10 lakh for setting up new projects in small-scale sector.
      Repayment: Up to 10 years including moratorium of 5 years.
      Interest rate: As per bank guidelines.
      Applicable sector: Small scale industries only.
      Women entrepreneurs starting new ventures qualify.
      Required documents: Project report, identity proof, address proof, bank account, no dues certificate.
      Business stages: idea, early.
    `,
  },
  {
    schemeCode: 'WE_HUB_TELANGANA',
    name:        'WE Hub — Telangana Women Entrepreneurship',
    sourcePortal: 'WE Hub Telangana',
    sourceUrl:    'https://wehub.telangana.gov.in',
    rawText: `
      WE Hub is India's first state-led incubator for women entrepreneurs in Telangana.
      Provides mentorship, funding access, market linkages and co-working space.
      Eligible: Women entrepreneurs in Telangana at any stage.
      Grant amounts vary by program — up to ₹10 lakh in seed funding.
      Applicable states: Telangana. Applicable domains: all sectors.
      Business stages: idea, early, growth.
      Required documents: Business registration, Aadhaar, project proposal.
    `,
  },
  {
    schemeCode: 'DENA_SHAKTI_SCHEME',
    name:        'Dena Shakti Scheme',
    sourcePortal: 'Bank of Baroda',
    sourceUrl:    'https://www.bankofbaroda.in',
    rawText: `
      Dena Shakti Scheme — concessional loans for women in agriculture, manufacturing, micro-credit,
      retail stores, or education/housing.
      Loan up to ₹20 lakh. Interest concession of 0.25% over normal rate.
      Applicable sectors: Agriculture, manufacturing, micro-credit, retail, education.
      All India scheme. Women-only.
      Business stages: early, growth, scaling.
      Required documents: Loan application, identity proof, address proof, income proof, business proof.
    `,
  },
];

// ── Core sync logic ──────────────────────────────────────────────────────────

export const syncGovernmentSchemes = async () => {
  logger.job('Starting government scheme sync...');
  let synced = 0;
  let failed = 0;

  for (const source of SCHEME_SOURCES) {
    try {
      // Extract structured data via Gemini Doc-Whisperer pipeline
      const parsed = await parseSchemeFromText(source.rawText, source.name);

      // Upsert into GovernmentScheme collection
      const existing = await GovernmentScheme.findOne({ schemeCode: source.schemeCode });
      const isNew = !existing;

      await GovernmentScheme.findOneAndUpdate(
        { schemeCode: source.schemeCode },
        {
          $set: {
            ...parsed,
            schemeCode:    source.schemeCode,
            sourcePortal:  source.sourcePortal,
            sourceUrl:     source.sourceUrl,
            isActive:      true,
            lastSyncedAt:  new Date(),
            isNewScheme:   isNew,
            isUpdated:     !isNew,
          },
        },
        { upsert: true, new: true, runValidators: false }
      );

      synced++;
      logger.job(`✅ Synced: ${source.name}`);

      // Throttle to avoid Gemini rate limits (Flash free tier is ~15 RPM)
      await new Promise((r) => setTimeout(r, 4500));
    } catch (err) {
      failed++;
      logger.error(`❌ Failed to sync ${source.name}: ${err.message}`);
    }
  }

  logger.job(`Scheme sync complete. Synced: ${synced}, Failed: ${failed}`);
  return { synced, failed };
};

// ── Cron schedule: runs every 6 hours ───────────────────────────────────────

export const startSchemeSyncJob = () => {
  // Run once on startup to seed the DB if empty
  GovernmentScheme.countDocuments().then((count) => {
    if (count === 0) {
      logger.job('No schemes found in DB — running initial sync...');
      syncGovernmentSchemes();
    }
  });

  // Then schedule recurring sync every 6 hours
  cron.schedule('0 */6 * * *', () => {
    logger.job('Cron triggered: government scheme sync');
    syncGovernmentSchemes();
  });

  logger.job('Government scheme sync job scheduled (every 6 hours)');
};
