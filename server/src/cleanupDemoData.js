import 'dotenv/config';
import { connectDB } from './config/db.js';
import { Blog } from './models/Blog.js';
import { Lead } from './models/Lead.js';
import { Product } from './models/Product.js';
import { Template } from './models/Template.js';
import { User } from './models/User.js';

await connectDB();

const result = {
  users: await User.deleteMany({ email: { $in: ['admin@weblix.test'] } }),
  products: await Product.deleteMany({ slug: { $in: ['weblix-website-builder', 'weblix-template-lifetime'] } }),
  templates: await Template.deleteMany({ slug: { $in: ['saas-launch-template'] } }),
  blogs: await Blog.deleteMany({ slug: { $in: ['how-ai-website-builders-speed-up-launches'] } }),
  leads: await Lead.deleteMany({
    $or: [
      { tags: { $in: ['demo', 'sample'] } },
      { businessName: /^Demo /i },
      { notes: /demo lead/i }
    ]
  })
};

console.log(JSON.stringify(Object.fromEntries(Object.entries(result).map(([key, value]) => [key, value.deletedCount])), null, 2));
process.exit(0);
