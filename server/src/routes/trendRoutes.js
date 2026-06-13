import express from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { generateTrendBlog, listTrends, publishGeneratedBlog, saveSettings, scheduledPosts, settings } from '../controllers/trendController.js';

export const trendRoutes = express.Router();

trendRoutes.get('/keywords', protect, adminOnly, listTrends);
trendRoutes.post('/generate-blog', protect, adminOnly, generateTrendBlog);
trendRoutes.post('/publish/:id', protect, adminOnly, publishGeneratedBlog);
trendRoutes.get('/scheduled', protect, adminOnly, scheduledPosts);
trendRoutes.get('/settings', protect, adminOnly, settings);
trendRoutes.put('/settings', protect, adminOnly, saveSettings);
