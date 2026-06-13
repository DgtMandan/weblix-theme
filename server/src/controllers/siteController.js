import { Blog } from '../models/Blog.js';
import { Announcement } from '../models/Announcement.js';
import { Product } from '../models/Product.js';
import { Template } from '../models/Template.js';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const money = (price) => `$${Number(price || 0).toLocaleString('en-US')}`;

const normalizeText = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const buildSearchFilter = (fields, query) => {
  const safe = escapeRegex(query);
  return { $or: fields.map((field) => ({ [field]: { $regex: safe, $options: 'i' } })) };
};

export async function siteSearch(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ query: q, results: [] });

    const [products, templates, blogs] = await Promise.all([
      Product.find({ isActive: true, ...buildSearchFilter(['name', 'description', 'longDescription', 'features'], q) }).limit(6),
      Template.find({ isActive: true, ...buildSearchFilter(['name', 'description', 'tags'], q) }).limit(8),
      Blog.find({ status: 'published', ...buildSearchFilter(['title', 'excerpt', 'content', 'tags', 'focusKeyword'], q) }).sort('-publishedAt -createdAt').limit(8)
    ]);

    const results = [
      ...products.map((item) => ({
        id: item._id,
        type: 'Builder',
        title: item.name,
        description: item.description || item.longDescription,
        url: '/pricing',
        price: money(item.price),
        meta: item.billingCycle === 'yearly' ? 'Yearly license' : 'Lifetime access'
      })),
      ...templates.map((item) => ({
        id: item._id,
        type: 'Template',
        title: item.name,
        description: item.description,
        url: `/templates/${item.slug}`,
        price: money(item.price),
        meta: item.tags?.slice(0, 3).join(', ') || 'Builder-ready ZIP'
      })),
      ...blogs.map((item) => ({
        id: item._id,
        type: 'Blog',
        title: item.title,
        description: item.excerpt || normalizeText(item.content).slice(0, 180),
        url: `/blog/${item.slug}`,
        meta: item.focusKeyword || item.categoryName || 'Weblix article'
      }))
    ];

    res.json({ query: q, results });
  } catch (error) {
    next(error);
  }
}

export async function getActiveAnnouncement(req, res, next) {
  try {
    const now = new Date();
    const announcement = await Announcement.findOne({
      isActive: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }] }
      ]
    }).sort('-createdAt');
    res.json(announcement || null);
  } catch (error) {
    next(error);
  }
}

function productSummary(products) {
  if (!products.length) return 'Weblix Builder pricing is managed from the admin product dashboard.';
  return products.map((product) => {
    const cycle = product.billingCycle === 'yearly'
      ? `${product.licenseDurationDays || 365}-day yearly license`
      : product.billingCycle === 'lifetime'
        ? 'lifetime license'
        : `${product.billingCycle || 'standard'} license`;
    const features = product.features?.length ? ` Includes ${product.features.slice(0, 4).join(', ')}.` : '';
    return `${product.name}: ${money(product.price)} for a ${cycle}.${features}`;
  }).join(' ');
}

function pricingAdvice(products) {
  const yearly = products.find((product) => product.billingCycle === 'yearly');
  const lifetime = products.find((product) => product.billingCycle === 'lifetime');
  if (yearly && lifetime) {
    return `Choose ${yearly.name} if you want a lower entry price with yearly updates. Choose ${lifetime.name} if you want long-term access without yearly renewal.`;
  }
  return 'Choose the plan that matches your license and update needs.';
}

function licenseSummary(products) {
  if (!products.length) return 'Builder license rules are managed from the admin product dashboard.';
  return products.map((product) => {
    if (product.billingCycle === 'yearly') {
      return `${product.name} uses a ${product.licenseDurationDays || 365}-day yearly license for updates and downloads.`;
    }
    if (product.billingCycle === 'lifetime') {
      return `${product.name} is a lifetime license with ongoing access to the purchased builder ZIP.`;
    }
    return `${product.name} uses a ${product.billingCycle || 'standard'} license.`;
  }).join(' ');
}

function matchIntent(message) {
  const text = message.toLowerCase();
  if (/(price|plan|yearly|lifetime|cost|package)/.test(text)) return 'pricing';
  if (/(feature|include|included|benefit|what do i get)/.test(text)) return 'features';
  if (/(download|zip|file|theme|template)/.test(text)) return 'downloads';
  if (/(license|licence|renew|expire|update)/.test(text)) return 'license';
  if (/(login|signup|sign up|otp|verify|account)/.test(text)) return 'account';
  if (/(blog|seo|geo|trend|article|google)/.test(text)) return 'blog';
  if (/(contact|support|help|email)/.test(text)) return 'support';
  return 'general';
}

export async function aiAgent(req, res, next) {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) return res.status(400).json({ message: 'Message is required.' });

    const [products, templates, blogs] = await Promise.all([
      Product.find({ isActive: true }).sort('price'),
      Template.find({ isActive: true }).sort('-isFeatured -createdAt').limit(4),
      Blog.find({ status: 'published' }).sort('-publishedAt -createdAt').limit(4)
    ]);

    const intent = matchIntent(message);
    const answers = {
      pricing: `Here is the current live Weblix Builder pricing from the admin product database. ${productSummary(products)} ${pricingAdvice(products)}`,
      features: `Here are the current live Weblix Builder package features from the admin product database. ${productSummary(products)} If an admin changes price, license duration, billing cycle, or features, I will answer using the updated data.`,
      downloads: 'After a successful payment, Weblix unlocks the exact builder ZIP or template ZIP attached to that order. The download appears automatically on the success flow and remains available inside the user dashboard downloads section according to the license.',
      license: `${licenseSummary(products)} Admins can change ZIP files, prices, billing cycles, features, and license duration from the product dashboard, and I will answer using that latest product data.`,
      account: 'For email signup, Weblix sends an OTP verification code only after the user submits the signup form. Google and GitHub login create or connect the account through OAuth. Protected purchases require a verified account.',
      blog: 'The Weblix blog system supports SEO titles, GEO fields for AI search, schema, FAQs, images, Google Trends drafts, and published blog pages. Admin-published blogs appear automatically on the public blog page, sitemap, and RSS feed.',
      support: 'For support, use the Contact page form. Leads are sent to the configured Weblix inbox when email settings are active, and the request is stored in the backend for admin follow-up.',
      general: `I can help with Weblix Builder pricing, package features, template ZIPs, downloads, licenses, account verification, SEO blogs, Google Trends drafts, and dashboard workflows. Current active builder plans: ${products.map((product) => `${product.name} (${money(product.price)})`).join(', ') || 'managed in admin'}.`
    };

    const results = [
      ...products.slice(0, 2).map((item) => ({ type: 'Builder plan', title: item.name, url: '/pricing', price: money(item.price) })),
      ...templates.slice(0, 2).map((item) => ({ type: 'Template', title: item.name, url: `/templates/${item.slug}`, price: money(item.price) })),
      ...blogs.slice(0, 2).map((item) => ({ type: 'Blog', title: item.title, url: `/blog/${item.slug}` }))
    ];

    res.json({
      answer: answers[intent],
      suggestions: [
        'Which Weblix Builder plan should I buy?',
        'How do downloads work after payment?',
        'How can I publish SEO blogs from Google Trends?'
      ],
      results
    });
  } catch (error) {
    next(error);
  }
}
