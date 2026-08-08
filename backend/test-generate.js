import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateApplication } from './services/fundingService.js';
import { generatePnLPlan } from './services/pnlService.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log("Testing generateApplication...");
    const appRes = await generateApplication("60c72b2f9b1d8b001c8e4b5a", null, "A new ecommerce store for women's clothing.");
    console.log("Application generated length:", appRes.text.length);

    console.log("Testing generatePnLPlan...");
    const pnlRes = await generatePnLPlan("60c72b2f9b1d8b001c8e4b5a", "A new ecommerce store for women's clothing.", "E-commerce");
    console.log("PnL generated:", pnlRes.summary);
    
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};
run();
