/**
 * scripts/test-models.js
 * Quick smoke test — verifies all 10 models import correctly and are registered
 * with Mongoose. Run: node scripts/test-models.js
 */

import mongoose from 'mongoose';

import {
  User,
  FundingApplication,
  FinancialPlan,
  ChatMessage,
  InterviewSession,
  MentorBooking,
  Match,
  LocalBusiness,
  MicroGrant,
  GovernmentScheme,
} from '../models/index.js';

const models = {
  User,
  FundingApplication,
  FinancialPlan,
  ChatMessage,
  InterviewSession,
  MentorBooking,
  Match,
  LocalBusiness,
  MicroGrant,
  GovernmentScheme,
};

console.log('\n🔍 SHEscale — Model Import Verification\n');
console.log('─'.repeat(50));

let allPassed = true;

for (const [name, Model] of Object.entries(models)) {
  const isMongooseModel = Model && Model.modelName;
  const status = isMongooseModel ? '✅ OK' : '❌ FAIL';
  if (!isMongooseModel) allPassed = false;
  console.log(`${status}  ${name.padEnd(25)} → collection: "${isMongooseModel ? Model.collection.name : 'N/A'}"`);
}

console.log('─'.repeat(50));
console.log(`\n📦 Total collections registered: ${Object.keys(mongoose.models).length}`);
console.log(`\n${allPassed ? '🎉 All models verified successfully!' : '⚠️  Some models failed — check imports.'}\n`);

process.exit(allPassed ? 0 : 1);
