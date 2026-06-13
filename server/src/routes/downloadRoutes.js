import express from 'express';
import { downloadEmailFile, downloadFile, myDownloads } from '../controllers/downloadController.js';
import { protect } from '../middleware/auth.js';

export const downloadRoutes = express.Router();

downloadRoutes.get('/', protect, myDownloads);
downloadRoutes.get('/email/:id/:token', downloadEmailFile);
downloadRoutes.get('/:id', protect, downloadFile);
