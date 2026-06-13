import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  fetchTrendKeywords,
  generateBlogFromTrend,
  getTrendSettings,
  updateTrendSettings
} from '../services/trendingBlogService.js';

export const listTrends = asyncHandler(async (req, res) => {
  const trends = await fetchTrendKeywords({
    country: req.query.country || 'US',
    category: req.query.category || 'Technology',
    search: req.query.search || ''
  });
  res.json(trends);
});

export const generateTrendBlog = asyncHandler(async (req, res) => {
  const blog = await generateBlogFromTrend(req.body.trend || { keyword: req.body.keyword }, {
    status: req.body.status || 'ai-generated',
    category: req.body.category,
    scheduledAt: req.body.scheduledAt,
    autoGenerateImages: req.body.autoGenerateImages
  });
  res.status(201).json(blog);
});

export const publishGeneratedBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, { status: 'published', publishedAt: new Date() }, { new: true });
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

export const scheduledPosts = asyncHandler(async (req, res) => {
  res.json(await Blog.find({ status: 'scheduled' }).sort('scheduledAt'));
});

export const settings = asyncHandler(async (req, res) => {
  res.json(await getTrendSettings());
});

export const saveSettings = asyncHandler(async (req, res) => {
  res.json(await updateTrendSettings(req.body));
});
