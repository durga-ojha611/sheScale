/**
 * models/index.js
 * Central barrel export for all SHEscale Mongoose models.
 * Import from here across the app: import { User, FundingApplication } from '../models/index.js'
 */

export { default as User }                from './User.model.js';
export { default as FundingApplication }  from './FundingApplication.model.js';
export { default as FinancialPlan }       from './FinancialPlan.model.js';
export { default as ChatMessage }         from './ChatMessage.model.js';
export { default as InterviewSession }    from './InterviewSession.model.js';
export { default as MentorBooking }       from './MentorBooking.model.js';
export { default as Match }               from './Match.model.js';
export { default as LocalBusiness }       from './LocalBusiness.model.js';
export { default as MicroGrant }          from './MicroGrant.model.js';
export { default as GovernmentScheme }    from './GovernmentScheme.model.js';
export { default as Mentor }              from './Mentor.model.js';
