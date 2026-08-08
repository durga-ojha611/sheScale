// server.js — Application entry point
// Loads env first, then connects DB, then starts Express
import './config/env.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import app from './app.js';
import { startSchemeSyncJob } from './jobs/schemeSyncJob.js';

const start = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`🚀 SHEscale API running on port ${env.port} [${env.nodeEnv}]`);
    });

    // Start the live government scheme sync cron job
    startSchemeSyncJob();
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
