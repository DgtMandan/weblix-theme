import express from 'express';
import { deleteBlog, generateTrendingBlogs, getBlog, listBlogs, upsertBlog } from '../controllers/blogController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

export const blogRoutes = express.Router();

blogRoutes.get('/', listBlogs);
blogRoutes.get('/admin/blogs', protect, adminOnly, listBlogs);
blogRoutes.post('/admin/blogs/generate-trends', protect, adminOnly, generateTrendingBlogs);
blogRoutes.post('/admin/blogs', protect, adminOnly, upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'ogImage', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 },
  { name: 'editorImages', maxCount: 12 }
]), upsertBlog);
blogRoutes.put('/admin/blogs/:id', protect, adminOnly, upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'ogImage', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 },
  { name: 'editorImages', maxCount: 12 }
]), upsertBlog);
blogRoutes.delete('/admin/blogs/:id', protect, adminOnly, deleteBlog);
blogRoutes.get('/:slug', getBlog);
