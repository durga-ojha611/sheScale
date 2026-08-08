// utils/logger.js — Structured logger (console-based for MVP, swap with Winston/Pino in prod)
import { env } from '../config/env.js';

const timestamp = () => new Date().toISOString();

export const logger = {
  info:  (...args) => console.log(`[${timestamp()}] ℹ️  INFO:`, ...args),
  warn:  (...args) => console.warn(`[${timestamp()}] ⚠️  WARN:`, ...args),
  error: (...args) => console.error(`[${timestamp()}] ❌ ERROR:`, ...args),
  debug: (...args) => { if (env.isDev) console.debug(`[${timestamp()}] 🐛 DEBUG:`, ...args); },
  job:   (...args) => console.log(`[${timestamp()}] ⚙️  JOB:`, ...args),
};
