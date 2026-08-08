/**
 * seed-schemes.js — Seeds 10 real Indian government schemes for women entrepreneurs
 * Run: node seed-schemes.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

const GovernmentSchemeSchema = new mongoose.Schema({
  name: String, shortName: String, ministry: String, description: String,
  eligibility: { businessStages: [String], applicableStates: [String], applicableDomains: [String],
    minTurnover: Number, maxTurnover: Number, genderRequirement: String, additionalCriteria: [String] },
  financialTerms: { minLoanAmount: Number, maxLoanAmount: Number, interestRateMin: Number,
    interestRateMax: Number, tenureMonths: Number, subsidyPercent: Number, collateralRequired: Boolean },
  requiredDocuments: [String], applicationSteps: [mongoose.Schema.Types.Mixed],
  alertBoxes: [String], isActive: Boolean, lastSyncedAt: Date, isNewScheme: Boolean
}, { collection: 'governmentschemes' });

const Scheme = mongoose.models.GovernmentScheme || mongoose.model('GovernmentScheme', GovernmentSchemeSchema);

const schemes = [
  {
    name: 'Stand-Up India Scheme', shortName: 'SUPI',
    ministry: 'Ministry of Finance, Government of India',
    description: 'Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise. The enterprise may be in manufacturing, services, agri-allied activities or the trading sector.',
    eligibility: { businessStages: ['startup', 'early'], applicableStates: [], applicableDomains: ['manufacturing', 'services', 'trading', 'agriculture'], genderRequirement: 'women_only', additionalCriteria: ['SC/ST or women borrower', 'Greenfield enterprise only', 'Must not be in default to any bank/financial institution'] },
    financialTerms: { minLoanAmount: 1000000, maxLoanAmount: 10000000, interestRateMin: 7.5, interestRateMax: 10, tenureMonths: 84, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'PAN Card', 'Business Plan', 'SC/ST Certificate (if applicable)', 'Bank statements (6 months)', 'Proof of business address'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply Online', description: 'Visit the Stand-Up India portal', portalUrl: 'https://www.standupmitra.in/' }, { stepNumber: 2, title: 'Bank Verification', description: 'Visit your nearest bank branch with documents' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Pradhan Mantri MUDRA Yojana – Mahila Udyam', shortName: 'PMMY-Women',
    ministry: 'Ministry of Finance, Government of India',
    description: 'MUDRA (Micro Units Development & Refinance Agency) provides loans to non-corporate, non-farm small/micro enterprises. Especially beneficial for women entrepreneurs in Shishu (up to ₹50,000), Kishore (₹50,001 – ₹5 Lakh), and Tarun (₹5 Lakh – ₹10 Lakh) categories. No collateral required.',
    eligibility: { businessStages: ['idea', 'startup', 'early', 'growth'], applicableStates: [], applicableDomains: ['manufacturing', 'services', 'trading', 'food', 'textile', 'beauty'], genderRequirement: 'women_priority', additionalCriteria: ['Non-corporate micro enterprises', 'Indian citizen'] },
    financialTerms: { minLoanAmount: 10000, maxLoanAmount: 1000000, interestRateMin: 7, interestRateMax: 12, tenureMonths: 60, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'PAN Card', 'Business registration proof', 'Bank statements', 'Passport-size photographs', 'Quotation for machinery/equipment'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply at Bank or NBFC', description: 'Visit any bank, MFI or NBFC' }, { stepNumber: 2, title: 'Submit MUDRA Card application', description: 'Fill MUDRA application form with documents' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Mahila Shakti Kendra Scheme', shortName: 'MSK',
    ministry: 'Ministry of Women and Child Development, GoI',
    description: 'Scheme for empowering rural women through community participation. Provides skill development, digital literacy training, and connects women to government schemes. Supports micro-enterprises in village-level clusters with handholding support.',
    eligibility: { businessStages: ['idea', 'startup'], applicableStates: [], applicableDomains: ['handicrafts', 'food', 'agriculture', 'textiles', 'dairy'], genderRequirement: 'women_only', additionalCriteria: ['Rural women preferred', 'Self-help group members given priority'] },
    financialTerms: { minLoanAmount: 0, maxLoanAmount: 500000, interestRateMin: 0, interestRateMax: 4, tenureMonths: 36, subsidyPercent: 30, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'SHG membership certificate', 'Bank account details', 'Business proposal'],
    applicationSteps: [{ stepNumber: 1, title: 'Contact Mahila Shakti Kendra', description: 'Register at nearest MSK centre' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'NSIC – National Small Industries Corporation Credit Support', shortName: 'NSIC-CS',
    ministry: 'Ministry of MSME, Government of India',
    description: 'NSIC facilitates access to credit for MSMEs through tie-ups with banks. It provides credit support at concessional rate of interest, waiver of processing fee, and collateral-free loans for women entrepreneurs in manufacturing and services sectors.',
    eligibility: { businessStages: ['early', 'growth', 'scaling'], applicableStates: [], applicableDomains: ['manufacturing', 'services', 'technology'], genderRequirement: 'women_priority', additionalCriteria: ['Registered MSME', 'Udyam Registration mandatory'] },
    financialTerms: { minLoanAmount: 500000, maxLoanAmount: 100000000, interestRateMin: 6.5, interestRateMax: 9, tenureMonths: 120, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Udyam Registration Certificate', 'Aadhar & PAN', 'GST certificate', 'Audited balance sheet', 'Project report'],
    applicationSteps: [{ stepNumber: 1, title: 'NSIC Online Registration', description: 'Apply at nsic.co.in', portalUrl: 'https://www.nsic.co.in/' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Annapurna Scheme', shortName: 'ANNAPURNA',
    ministry: 'Ministry of Finance – SBI & Nationalized Banks',
    description: 'Specially designed for women in the food catering business. Provides loans up to ₹50,000 to women entrepreneurs to set up food catering units, canteens, or packaged food businesses. Repayable in 36 monthly instalments.',
    eligibility: { businessStages: ['startup', 'early'], applicableStates: [], applicableDomains: ['food', 'catering', 'restaurants'], genderRequirement: 'women_only', additionalCriteria: ['Women in food catering business', 'Guarantor required'] },
    financialTerms: { minLoanAmount: 10000, maxLoanAmount: 50000, interestRateMin: 8, interestRateMax: 10, tenureMonths: 36, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'FSSAI License', 'Business plan', 'Guarantor details', 'Bank statements'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply at SBI or Nationalized Bank', description: 'Visit nearest bank with documents' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Dena Shakti Scheme', shortName: 'DENA-SHAKTI',
    ministry: 'Bank of Baroda (formerly Dena Bank)',
    description: 'Concessional loan scheme for women entrepreneurs in agriculture, manufacturing, micro-credit, retail stores, and education sectors. Provides loans up to ₹20 Lakh at concessional interest rates with 0.25% interest concession.',
    eligibility: { businessStages: ['startup', 'early', 'growth'], applicableStates: [], applicableDomains: ['agriculture', 'manufacturing', 'retail', 'education', 'micro-finance'], genderRequirement: 'women_only', additionalCriteria: ['Women-majority-owned business'] },
    financialTerms: { minLoanAmount: 50000, maxLoanAmount: 2000000, interestRateMin: 6.5, interestRateMax: 9.5, tenureMonths: 60, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'PAN Card', 'Business registration', 'Income proof', 'Bank statements (1 year)'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply at Bank of Baroda', description: 'Visit nearest BOB branch or apply online', portalUrl: 'https://www.bankofbaroda.in/' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Stree Shakti Package (SBI)', shortName: 'SSP-SBI',
    ministry: 'State Bank of India',
    description: 'SBI scheme for women entrepreneurs who own more than 50% of a business. Provides loans at lower interest rates with no processing fee for loans up to ₹2 Lakh. Interest concession of 0.5% for loans above ₹2 Lakh. Covers all business categories.',
    eligibility: { businessStages: ['startup', 'early', 'growth', 'scaling'], applicableStates: [], applicableDomains: ['manufacturing', 'services', 'trading', 'technology', 'food', 'retail'], genderRequirement: 'women_only', additionalCriteria: ['Women must own >50% of business', 'State Women Entrepreneurship Programme enrollment preferred'] },
    financialTerms: { minLoanAmount: 20000, maxLoanAmount: 20000000, interestRateMin: 6.5, interestRateMax: 11, tenureMonths: 84, subsidyPercent: 0.5, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'PAN Card', 'Business ownership proof (>50%)', 'Bank statements', 'GST returns', 'CA-certified financials'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply at SBI Branch', description: 'Visit nearest SBI branch or apply online', portalUrl: 'https://sbi.co.in/' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'CGTMSE – Credit Guarantee Fund Trust for Micro and Small Enterprises', shortName: 'CGTMSE',
    ministry: 'Ministry of MSME & Small Industries Development Bank of India',
    description: 'Provides collateral-free loans to micro and small enterprises. Women entrepreneurs get priority and additional coverage up to ₹2 Crore. The guarantee cover ranges from 75% to 85% of the loan amount, making it easier to get bank approval without assets.',
    eligibility: { businessStages: ['startup', 'early', 'growth'], applicableStates: [], applicableDomains: ['manufacturing', 'services', 'technology', 'retail', 'healthcare'], genderRequirement: 'women_priority', additionalCriteria: ['Registered MSME', 'Udyam Registration', 'New or existing enterprise'] },
    financialTerms: { minLoanAmount: 100000, maxLoanAmount: 20000000, interestRateMin: 7, interestRateMax: 11, tenureMonths: 120, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Udyam Registration Certificate', 'Aadhar & PAN of promoters', 'Project Report', 'Bank loan sanction letter', 'GST registration', 'Balance sheet (if existing business)'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply Through Member Lending Institution', description: 'Your bank applies on your behalf to CGTMSE' }, { stepNumber: 2, title: 'Submit Business Documents', description: 'Project report and financial documents to bank' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Mahila Udyam Nidhi Scheme (SIDBI)', shortName: 'MUN-SIDBI',
    ministry: 'Small Industries Development Bank of India (SIDBI)',
    description: 'SIDBI scheme providing soft loans up to ₹10 Lakh to women entrepreneurs for setting up new small-scale industries or upgrading existing ones. Repayment period is up to 10 years with a moratorium of 5 years.',
    eligibility: { businessStages: ['startup', 'early', 'growth'], applicableStates: [], applicableDomains: ['manufacturing', 'food processing', 'handicrafts', 'textiles', 'technology'], genderRequirement: 'women_only', additionalCriteria: ['Women-owned small-scale industry', 'New or expansion project'] },
    financialTerms: { minLoanAmount: 100000, maxLoanAmount: 1000000, interestRateMin: 6, interestRateMax: 9, tenureMonths: 120, subsidyPercent: 0, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'PAN Card', 'Detailed project report', 'Quotations for machinery', 'Land/building documents or lease deed', 'Bank NOC'],
    applicationSteps: [{ stepNumber: 1, title: 'Apply at SIDBI or Bank', description: 'Contact nearest SIDBI office or partner bank', portalUrl: 'https://www.sidbi.in/' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: false
  },
  {
    name: 'Pradhan Mantri Kaushal Vikas Yojana – Women Skill Grant', shortName: 'PMKVY-W',
    ministry: 'Ministry of Skill Development and Entrepreneurship, GoI',
    description: 'Skill training and certification scheme with monetary reward for women completing skill training in identified sectors. After certification, women can access MUDRA loans and startup grants. Provides ₹8,000 – ₹10,000 training reward upon successful completion.',
    eligibility: { businessStages: ['idea', 'startup'], applicableStates: [], applicableDomains: ['beauty', 'healthcare', 'hospitality', 'IT', 'textile', 'food', 'retail'], genderRequirement: 'women_priority', additionalCriteria: ['Indian citizen', 'Age 15-45', 'School/college dropout preferred'] },
    financialTerms: { minLoanAmount: 8000, maxLoanAmount: 10000, interestRateMin: 0, interestRateMax: 0, tenureMonths: 0, subsidyPercent: 100, collateralRequired: false },
    requiredDocuments: ['Aadhar Card', 'Educational qualification certificates', 'Bank account details (for reward transfer)'],
    applicationSteps: [{ stepNumber: 1, title: 'Register on PMKVY Portal', description: 'Apply at pmkvyofficial.org', portalUrl: 'https://www.pmkvyofficial.org/' }],
    isActive: true, lastSyncedAt: new Date(), isNewScheme: true
  }
];

await Scheme.deleteMany({});
const inserted = await Scheme.insertMany(schemes);
console.log(`✅ Successfully seeded ${inserted.length} schemes!`);
inserted.forEach(s => console.log(`  - ${s.name} (${s._id})`));
await mongoose.disconnect();
console.log('Done!');
