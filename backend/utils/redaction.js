// utils/redaction.js — Sensitive document ID redaction
// Per spec: Aadhaar, PAN, bank proof etc. must NEVER be stored as raw data.
// This utility replaces raw sensitive strings with a safe reference token
// before any data touches the database.

import crypto from 'crypto';
import { env } from '../config/env.js';

// Regex patterns for common Indian government IDs
const SENSITIVE_PATTERNS = [
  { name: 'aadhaar', pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g },
  { name: 'pan',     pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g },
  { name: 'phone',   pattern: /\b[6-9]\d{9}\b/g },
];

/**
 * redactText — replaces sensitive patterns in a string with [REDACTED:type]
 */
export const redactText = (text) => {
  let redacted = text;
  for (const { name, pattern } of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, `[REDACTED:${name}]`);
  }
  return redacted;
};

/**
 * generateDocRef — creates a secure, opaque reference token for an uploaded file.
 * The actual file is stored in encrypted external storage; only this token goes in MongoDB.
 *
 * @param {string} userId
 * @param {string} docType  — e.g. 'aadhaar', 'pan', 'gst_cert'
 * @returns {string}  — a deterministic but opaque reference string
 */
export const generateDocRef = (userId, docType) => {
  const hash = crypto
    .createHmac('sha256', env.storageSecret || 'fallback-secret')
    .update(`${userId}:${docType}:${Date.now()}`)
    .digest('hex')
    .slice(0, 32);
  return `ref:${docType}:${hash}`;
};
