import slugify from 'slugify';
import { Product } from '../models/Product.js';
import { Template } from '../models/Template.js';
import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toSlug = (value) => slugify(value, { lower: true, strict: true });

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).sort('-createdAt');
  res.json(products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

export const upsertProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body, slug: req.body.slug || toSlug(req.body.name), currency: 'USD' };
  if (typeof payload.features === 'string') payload.features = payload.features.split(',').map((feature) => feature.trim()).filter(Boolean);
  if (payload.billingCycle === 'yearly' && !payload.licenseDurationDays) payload.licenseDurationDays = 365;
  if (payload.billingCycle === 'lifetime') payload.licenseDurationDays = 0;
  if (req.files?.zip?.[0]) payload.zipPath = req.files.zip[0].path;
  if (req.files?.screenshots) payload.screenshots = req.files.screenshots.map((file) => file.path);
  const product = req.params.id
    ? await Product.findByIdAndUpdate(req.params.id, payload, { new: true })
    : await Product.create(payload);
  res.status(req.params.id ? 200 : 201).json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Product archived' });
});

export const listTemplates = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.$text = { $search: req.query.search };
  const templates = await Template.find(query).populate('category').sort('-createdAt');
  res.json(templates);
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ slug: req.params.slug, isActive: true }).populate('category');
  if (!template) return res.status(404).json({ message: 'Template not found' });
  res.json(template);
});

export const upsertTemplate = asyncHandler(async (req, res) => {
  const payload = { ...req.body, slug: req.body.slug || toSlug(req.body.name), currency: 'USD' };
  if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  if (req.files?.zip?.[0]) payload.zipPath = req.files.zip[0].path;
  if (req.files?.thumbnail?.[0]) payload.thumbnail = req.files.thumbnail[0].path;
  if (req.files?.previewImages) payload.previewImages = req.files.previewImages.map((file) => file.path);
  const template = req.params.id
    ? await Template.findByIdAndUpdate(req.params.id, payload, { new: true })
    : await Template.create(payload);
  res.status(req.params.id ? 200 : 201).json(template);
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await Template.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Template archived' });
});

export const categories = asyncHandler(async (req, res) => {
  res.json(await Category.find().sort('name'));
});
