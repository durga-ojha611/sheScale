import mongoose from 'mongoose';
import faiss from 'faiss-node';
import 'dotenv/config';
import { env } from '../config/env.js';
import { GovernmentScheme } from '../models/index.js';
import { getEmbedding } from '../config/gemini.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INDEX_PATH = path.join(__dirname, '../data/scheme_vectors.index');
const MAP_PATH = path.join(__dirname, '../data/scheme_map.json');

const staticSchemes = [
  {
    schemeCode: "STAND_UP_INDIA",
    name: "Stand-Up India Scheme",
    shortName: "SUI",
    ministry: "Ministry of Finance",
    description: "Promotes entrepreneurship among women and SC/ST communities by providing loans for greenfield enterprises.",
    eligibility: {
      businessStages: ["idea", "early", "growth"],
      applicableStates: [""],
      applicableDomains: ["Tech / SaaS", "Agriculture / AgTech", "D2C / E-Commerce", "Healthcare", "Services", "Handicrafts / MSME"],
      minTurnover: 0,
      maxTurnover: null,
      genderRequirement: "women_only",
      additionalCriteria: ["Only greenfield projects eligible", "Borrower must not be in default"]
    },
    financialTerms: {
      minLoanAmount: 1000000,
      maxLoanAmount: 10000000,
      interestRateMin: 7.75,
      interestRateMax: 10.5,
      tenureMonths: 84,
      subsidyPercent: 0,
      collateralRequired: false
    },
    requiredDocuments: ["Identity Proof", "Address Proof", "Business Project Report", "Pollution Control Certificate if applicable"],
    applicationSteps: [
      { stepNumber: 1, title: "Register on Portal", description: "Register on the Stand-Up India portal." },
      { stepNumber: 2, title: "Fill Details", description: "Enter business description and category." },
      { stepNumber: 3, title: "Connect to Bank", description: "Get handholding support and connect to a lender." }
    ]
  },
  {
    schemeCode: "CGTMSE",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises",
    shortName: "CGTMSE",
    ministry: "Ministry of MSME",
    description: "Provides collateral-free credit and credit guarantee to micro and small enterprises, focusing heavily on retail trade and manufacturing.",
    eligibility: {
      businessStages: ["early", "growth", "scaling"],
      applicableStates: [""],
      applicableDomains: ["Tech / SaaS", "D2C / E-Commerce", "Services", "Handicrafts / MSME"],
      minTurnover: 0,
      maxTurnover: 100000000,
      genderRequirement: "any",
      additionalCriteria: ["Must be a registered MSME"]
    },
    financialTerms: {
      minLoanAmount: 500000,
      maxLoanAmount: 20000000,
      interestRateMin: 8.5,
      interestRateMax: 12.0,
      tenureMonths: 60,
      subsidyPercent: 0,
      collateralRequired: false
    },
    requiredDocuments: ["MSME Registration (Udyam)", "Financial Audit Reports", "Project Plan", "ITR returns"],
    applicationSteps: [
      { stepNumber: 1, title: "Apply at Bank", description: "Submit standard loan request application at a CGTMSE partner bank." },
      { stepNumber: 2, title: "Guarantee Cover Process", description: "Bank applies to CGTMSE trust for credit guarantee approval cover." }
    ]
  },
  {
    schemeCode: "MUDRA_LOAN",
    name: "Pradhan Mantri MUDRA Yojana",
    shortName: "MUDRA",
    ministry: "Ministry of Finance",
    description: "Collateral-free refinancing scheme for micro units and startups, categorised under Shishu, Kishor, and Tarun schemes.",
    eligibility: {
      businessStages: ["idea", "early", "growth"],
      applicableStates: [""],
      applicableDomains: ["Agriculture / AgTech", "Services", "Handicrafts / MSME", "D2C / E-Commerce"],
      minTurnover: 0,
      maxTurnover: null,
      genderRequirement: "any",
      additionalCriteria: []
    },
    financialTerms: {
      minLoanAmount: 50000,
      maxLoanAmount: 1000000,
      interestRateMin: 9.0,
      interestRateMax: 12.5,
      tenureMonths: 60,
      subsidyPercent: 0,
      collateralRequired: false
    },
    requiredDocuments: ["Identity Card", "Proof of Business Address", "Mudra Application Form", "Quotation of machinery/assets to be purchased"],
    applicationSteps: [
      { stepNumber: 1, title: "Select Mudra Category", description: "Choose Shishu (up to 50k), Kishor (50k-5L) or Tarun (5L-10L)." },
      { stepNumber: 2, title: "Submit Request", description: "Apply online via Udyami Mitra portal or visit a national bank." }
    ]
  },
  {
    schemeCode: "MAHILA_UDYAM_NIDHI",
    name: "Mahila Udyam Nidhi Scheme",
    shortName: "MUN",
    ministry: "SIDBI",
    description: "Financial assistance program initiated by SIDBI to aid female entrepreneurs in setting up new industrial and service enterprises.",
    eligibility: {
      businessStages: ["idea", "early"],
      applicableStates: [""],
      applicableDomains: ["Handicrafts / MSME", "Services", "Healthcare"],
      minTurnover: 0,
      maxTurnover: null,
      genderRequirement: "women_only",
      additionalCriteria: ["Women stake in the enterprise must be 51% or higher"]
    },
    financialTerms: {
      minLoanAmount: 100000,
      maxLoanAmount: 1000000,
      interestRateMin: 8.0,
      interestRateMax: 10.0,
      tenureMonths: 120,
      subsidyPercent: 0,
      collateralRequired: false
    },
    requiredDocuments: ["SIDBI Application Form", "Project Estimate Cost Sheet", "Ownership/partnership details", "Udyam Aadhar"],
    applicationSteps: [
      { stepNumber: 1, title: "Approach SIDBI / State Financial Corp", description: "Fill the MUN registration request." },
      { stepNumber: 2, title: "Project Appraisal", description: "The lending institution evaluates business plan feasibility." }
    ]
  }
];

const seedStatic = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.mongodbUri, { dbName: 'shescale' });
    logger.info('Connected to MongoDB.');

    // Clear existing schemes
    await GovernmentScheme.deleteMany({});
    logger.info('Cleared GovernmentScheme collection.');

    const d = 3072;
    const index = new faiss.IndexFlatL2(d);
    const schemeIdMap = {};
    let counter = 0;

    for (const scheme of staticSchemes) {
      logger.info(`Saving scheme: ${scheme.name}...`);
      const doc = await GovernmentScheme.create({
        ...scheme,
        isActive: true,
        isNewScheme: true,
        lastSyncedAt: new Date()
      });

      logger.info(`Generating embedding for ${doc.schemeCode}...`);
      const textToEmbed = `${doc.name}. ${doc.description}. Eligibility: ${JSON.stringify(doc.eligibility)}`;
      const embedding = await getEmbedding(textToEmbed);

      index.add(embedding);
      schemeIdMap[counter] = doc._id.toString();
      counter++;

      // Brief sleep between embeddings to respect limits
      await new Promise(r => setTimeout(r, 1000));
    }

    logger.info('Saving Faiss index and map to disk...');
    if (!fs.existsSync(path.dirname(INDEX_PATH))) {
      fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
    }
    index.write(INDEX_PATH);
    fs.writeFileSync(MAP_PATH, JSON.stringify(schemeIdMap));

    logger.info(`Successfully seeded ${counter} static schemes with 3072-dimension vectors!`);
    process.exit(0);
  } catch (error) {
    logger.error('Static seeding failed:', error);
    process.exit(1);
  }
};

seedStatic();
