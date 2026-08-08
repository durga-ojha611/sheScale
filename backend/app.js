// app.js — Express application config: middleware registration and route mounting
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middlewares/error.middleware.js';
import { authLimiter, aiLimiter } from './middlewares/rateLimiter.middleware.js';

import authRoutes        from './routes/auth.routes.js';
import profileRoutes     from './routes/profile.routes.js';
import settingsRoutes    from './routes/settings.routes.js';
import fundingRoutes     from './routes/funding.routes.js';
import schemeRoutes      from './routes/scheme.routes.js';
import mentorshipRoutes  from './routes/mentorship.routes.js';
import mentorRoutes      from './routes/mentor.routes.js';
import networkingRoutes  from './routes/networking.routes.js';
import chatRoutes        from './routes/chat.routes.js';
import userChecklistRoutes from './routes/userChecklist.routes.js';
import docsRoutes        from './routes/docs.routes.js';
import pnlRoutes         from './routes/pnl.routes.js';

// --- NEW HUB ROUTES ---
import mentorshipHubRoutes from './routes/mentorshipHub.routes.js';
import networkingHubRoutes from './routes/networkingHub.routes.js';

const app = express();

// ── Security & Parsing Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean), 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SHEscale API', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, authRoutes);
app.use('/api/user',        aiLimiter, profileRoutes);
app.use('/api/user/settings', aiLimiter, settingsRoutes);
app.use('/api/funding',     fundingRoutes);
app.use('/api/schemes',     aiLimiter, schemeRoutes);
app.use('/api/mentorship',  aiLimiter, mentorshipRoutes);
app.use('/api/mentor',      aiLimiter, mentorRoutes);
app.use('/api/networking',  networkingRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/user/checklist', userChecklistRoutes);
app.use('/api/docs',        aiLimiter, docsRoutes);
app.use('/api/pnl',         aiLimiter, pnlRoutes);

// --- MOUNT NEW HUB ROUTES ---
app.use('/api/mentorship',  mentorshipHubRoutes);
app.use('/api/networking',  networkingHubRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

export default app;
