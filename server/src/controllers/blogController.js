import { Blog } from '../models/Blog.js';
import { generateOriginalBlogImages } from '../services/aiImageService.js';
import { createTrendingDrafts } from '../services/trendingBlogService.js';
import { autoSeoPayload, calculateGeo, calculateSeo, stripHtml, toSlug } from '../services/blogSeoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const listBlogs = asyncHandler(async (req, res) => {
  const query = req.user?.role === 'admin' ? {} : { status: 'published' };
  if (req.query.search) query.$or = [
    { title: new RegExp(req.query.search, 'i') },
    { excerpt: new RegExp(req.query.search, 'i') }
  ];
  const blogs = await Blog.find(query).populate('category').sort('-publishedAt -createdAt');
  res.json(blogs);
});

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('category');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  if (blog.status === 'published') {
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });
  }
  res.json(blog);
});

export const upsertBlog = asyncHandler(async (req, res) => {
  const payload = { ...req.body, slug: req.body.slug || toSlug(req.body.title) };
  const existing = req.params.id ? await Blog.findById(req.params.id).select('featuredImage ogImage imageAlt ogImageAlt featuredImagePrompt') : null;
  payload.tags = toArray(payload.tags);
  payload.secondaryKeywords = toArray(payload.secondaryKeywords);
  payload.internalLinks = toArray(payload.internalLinks);
  payload.externalLinks = toArray(payload.externalLinks);
  payload.topKeywords = toArray(payload.topKeywords || payload.focusKeyword);
  payload.geoEntities = toArray(payload.geoEntities);
  payload.geoQuestions = toArray(payload.geoQuestions);
  payload.geoSources = toArray(payload.geoSources);
  payload.faqs = parseJsonArray(payload.faqs);
  Object.assign(payload, autoSeoPayload(payload));
  if (payload.publishDate) payload.publishedAt = new Date(payload.publishDate);
  if (payload.scheduledAt) payload.scheduledAt = new Date(payload.scheduledAt);
  if (payload.status === 'published' && !payload.publishedAt) payload.publishedAt = new Date();
  if (payload.status === 'scheduled' && !payload.scheduledAt) payload.scheduledAt = payload.publishedAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (!payload.readTime) payload.readTime = Math.max(1, Math.ceil(stripHtml(payload.content).split(/\s+/).filter(Boolean).length / 220));
  if (req.files?.featuredImage?.[0]) payload.featuredImage = req.files.featuredImage[0].path;
  if (req.files?.ogImage?.[0]) payload.ogImage = req.files.ogImage[0].path;
  if (req.files?.authorImage?.[0]) payload.authorImage = req.files.authorImage[0].path;
  if (req.files?.editorImages) payload.editorImages = req.files.editorImages.map((file) => file.path);

  if (!payload.featuredImage && existing?.featuredImage) payload.featuredImage = existing.featuredImage;
  if (!payload.ogImage && existing?.ogImage) payload.ogImage = existing.ogImage;
  if (!payload.imageAlt && existing?.imageAlt) payload.imageAlt = existing.imageAlt;
  if (!payload.ogImageAlt && existing?.ogImageAlt) payload.ogImageAlt = existing.ogImageAlt;
  if (!payload.featuredImagePrompt && existing?.featuredImagePrompt) payload.featuredImagePrompt = existing.featuredImagePrompt;

  if (!payload.featuredImage || !payload.ogImage) {
    Object.assign(payload, generateOriginalBlogImages({
      slug: payload.slug,
      keyword: payload.focusKeyword || payload.title,
      title: payload.title
    }));
  }

  Object.assign(payload, calculateSeo(payload));
  Object.assign(payload, calculateGeo(payload));
  const blog = req.params.id
    ? await Blog.findByIdAndUpdate(req.params.id, payload, { new: true })
    : await Blog.create(payload);
  res.status(req.params.id ? 200 : 201).json(blog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Blog deleted' });
});

export const generateTrendingBlogs = asyncHandler(async (req, res) => {
  const result = await createTrendingDrafts();
  res.status(201).json(result);
});
