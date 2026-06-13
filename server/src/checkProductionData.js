import 'dotenv/config';
import fs from 'fs';
import { connectDB } from './config/db.js';
import { Product } from './models/Product.js';
import { Template } from './models/Template.js';

await connectDB();

const [products, templates] = await Promise.all([
  Product.find({ isActive: true }).select('name slug zipPath price billingCycle'),
  Template.find({ isActive: true }).select('name slug zipPath price')
]);

const missingZipRefs = [
  ...products.map((item) => ({ type: 'product', slug: item.slug, path: item.zipPath })),
  ...templates.map((item) => ({ type: 'template', slug: item.slug, path: item.zipPath }))
].filter((item) => item.path && !fs.existsSync(item.path));

console.log(JSON.stringify({
  activeProducts: products.length,
  activeTemplates: templates.length,
  missingZipRefs
}, null, 2));

process.exit(missingZipRefs.length ? 1 : 0);
