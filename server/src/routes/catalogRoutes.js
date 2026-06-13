import express from 'express';
import {
  categories,
  deleteProduct,
  deleteTemplate,
  getProduct,
  getTemplate,
  listProducts,
  listTemplates,
  upsertProduct,
  upsertTemplate
} from '../controllers/catalogController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

export const catalogRoutes = express.Router();

catalogRoutes.get('/categories', categories);
catalogRoutes.get('/products', listProducts);
catalogRoutes.get('/products/:slug', getProduct);
catalogRoutes.get('/templates', listTemplates);
catalogRoutes.get('/templates/:slug', getTemplate);

catalogRoutes.post('/admin/products', protect, adminOnly, upload.fields([{ name: 'zip', maxCount: 1 }, { name: 'screenshots', maxCount: 8 }]), upsertProduct);
catalogRoutes.put('/admin/products/:id', protect, adminOnly, upload.fields([{ name: 'zip', maxCount: 1 }, { name: 'screenshots', maxCount: 8 }]), upsertProduct);
catalogRoutes.delete('/admin/products/:id', protect, adminOnly, deleteProduct);

catalogRoutes.post('/admin/templates', protect, adminOnly, upload.fields([{ name: 'zip', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }, { name: 'previewImages', maxCount: 8 }]), upsertTemplate);
catalogRoutes.put('/admin/templates/:id', protect, adminOnly, upload.fields([{ name: 'zip', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }, { name: 'previewImages', maxCount: 8 }]), upsertTemplate);
catalogRoutes.delete('/admin/templates/:id', protect, adminOnly, deleteTemplate);
