import express from 'express';
import { aiAgent, getActiveAnnouncement, siteSearch } from '../controllers/siteController.js';

export const siteRoutes = express.Router();

siteRoutes.get('/search', siteSearch);
siteRoutes.get('/announcements/active', getActiveAnnouncement);
siteRoutes.post('/ai-agent', aiAgent);
