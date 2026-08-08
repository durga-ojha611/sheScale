import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import mongoose from 'mongoose';
import faiss from 'faiss-node';
import 'dotenv/config';

import { env } from '../config/env.js';
import { GovernmentScheme } from '../models/index.js';
import { getEmbedding, geminiFlash } from '../config/gemini.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_DIR = path.join(__dirname, '../data/pdfs');
const INDEX_PATH = path.join(__dirname, '../data/scheme_vectors.index');
const MAP_PATH = path.join(__dirname, '../data/scheme_map.json');

const parsePDFtoJSON = async (pdfText, fileName) => {
  const prompt = `
  You are an expert financial analyst. 
  Extract the government scheme details from the following document text and output ONLY a raw, valid JSON object (no markdown, no backticks).
  The JSON must match this structure exactly:
  {
    "schemeCode": "A unique uppercase string code based on the scheme name",
    "name": "Full name of the scheme",
    "shortName": "Acronym or short name",
    "description": "A clean 2-3 sentence summary of the scheme",
    "eligibility": {
      "businessStages": ["idea", "early", "growth", "scaling"], // pick applicable ones
      "genderRequirement": "women_only", // or "any"
      "minTurnover": 0,
      "maxTurnover": null
    },
    "financialTerms": {
      "minLoanAmount": 0,
      "maxLoanAmount": 1000000,
      "subsidyPercent": 0,
      "collateralRequired": false
    },
    "requiredDocuments": ["Doc 1", "Doc 2"],
    "applicationSteps": [
      { "stepNumber": 1, "title": "Step 1", "description": "Desc" }
    ]
  }

  Document text:
  ${pdfText.substring(0, 15000)} // Using first 15k chars to fit context if very long
  `;

  try {
    const response = await geminiFlash.generateContent(prompt);
    let text = response.response.text().trim();
    // Clean up markdown block if model ignored the instruction
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    return JSON.parse(text);
  } catch (err) {
    logger.error(`Failed to parse ${fileName} with Gemini:`, err);
    return null;
  }
};

const seedSchemes = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.mongodbUri, { dbName: 'shescale' });
    logger.info('Connected to MongoDB');

    if (!fs.existsSync(PDF_DIR)) {
      logger.warn(`Directory not found: ${PDF_DIR}. Creating it...`);
      fs.mkdirSync(PDF_DIR, { recursive: true });
      logger.info('Please put scheme PDFs inside data/pdfs/ and re-run.');
      process.exit(0);
    }

    const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
    if (files.length === 0) {
      logger.warn(`No PDFs found in ${PDF_DIR}. Please add PDFs and re-run.`);
      process.exit(0);
    }

    // Initialize Faiss Index
    const d = 3072; // Dimension for gemini-embedding-2
    const index = new faiss.IndexFlatL2(d);
    const schemeIdMap = {};

    let faissCounter = 0;

    for (const file of files) {
      logger.info(`Processing ${file}...`);
      const filePath = path.join(PDF_DIR, file);
      const dataBuffer = fs.readFileSync(filePath);
      
      const pdfData = await pdfParse(dataBuffer);
      logger.info(`Extracted ${pdfData.text.length} characters from ${file}.`);

      const schemeJson = await parsePDFtoJSON(pdfData.text, file);
      if (!schemeJson) continue;

      // Upsert into MongoDB
      const schemeDoc = await GovernmentScheme.findOneAndUpdate(
        { schemeCode: schemeJson.schemeCode },
        { ...schemeJson, isActive: true, isNewScheme: true, lastSyncedAt: new Date() },
        { upsert: true, new: true }
      );
      logger.info(`Saved ${schemeDoc.name} to MongoDB.`);

      // Generate Embedding
      logger.info(`Generating embedding for ${schemeDoc.schemeCode}...`);
      const textToEmbed = `${schemeDoc.name}. ${schemeDoc.description}. Eligibility: ${JSON.stringify(schemeDoc.eligibility)}`;
      const embedding = await getEmbedding(textToEmbed);

      // Add to Faiss
      index.add(embedding);
      schemeIdMap[faissCounter] = schemeDoc._id.toString();
      faissCounter++;
      
      // Sleep to respect Gemini rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Save Faiss index to disk
    logger.info('Saving Faiss index and map to disk...');
    const vectorDir = path.dirname(INDEX_PATH);
    if (!fs.existsSync(vectorDir)) {
      fs.mkdirSync(vectorDir, { recursive: true });
    }
    index.write(INDEX_PATH);
    fs.writeFileSync(MAP_PATH, JSON.stringify(schemeIdMap));

    logger.info(`Successfully ingested and vectorized ${faissCounter} schemes!`);
    process.exit(0);

  } catch (error) {
    logger.error('Seed process failed:', error);
    process.exit(1);
  }
};

seedSchemes();
