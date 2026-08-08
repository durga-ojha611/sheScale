// config/env.js — Centralized environment variable loader and validator
import 'dotenv/config';

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  nodeEnv:       process.env.NODE_ENV || 'development',
  port:          parseInt(process.env.PORT || '5000', 10),
  mongodbUri:    process.env.MONGODB_URI,
  jwtSecret:     process.env.JWT_SECRET,
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey:  process.env.GEMINI_API_KEY,
  storageBucket: process.env.ENCRYPTED_STORAGE_BUCKET || '',
  storageSecret: process.env.ENCRYPTED_STORAGE_SECRET || '',
  isDev:         process.env.NODE_ENV !== 'production',
};
