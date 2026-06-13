import express from 'express';
import { createContactLead } from '../controllers/contactController.js';

export const contactRoutes = express.Router();

contactRoutes.post('/leads', createContactLead);
