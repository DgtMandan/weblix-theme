import express from 'express';
import { analyticsSummary, trackEvent } from '../controllers/analyticsController.js';
import { adminOnly, protect } from '../middleware/auth.js';

export const analyticsRoutes = express.Router();

analyticsRoutes.post('/track', trackEvent);
analyticsRoutes.get('/summary', protect, adminOnly, analyticsSummary);
