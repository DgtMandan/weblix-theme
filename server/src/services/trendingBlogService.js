import slugify from 'slugify';
import { Blog } from '../models/Blog.js';
import { TrendSetting } from '../models/TrendSetting.js';
import { generateOriginalBlogImages } from './aiImageService.js';
import { autoSeoPayload, calculateGeo, calculateSeo } from './blogSeoService.js';

const GOOGLE_TRENDS_RSS = 'https://trends.google.com/trending/rss';
const DEFAULT_STATUS = process.env.TREND_BLOG_STATUS || 'published';

const relatedKeywords = [
  'ai website builder', 'website design', 'ui', 'ux', 'wordpress', 'seo', 'web development',
  'saas', 'react', 'mern', 'ai tools', 'artificial intelligence', 'website', 'frontend', 'builder'
];

const fallbackTopics = [
  'AI website builder trends for SaaS teams',
  'React and MERN stack website development',
  'SEO strategy for AI generated websites',
  'WordPress alternatives for modern website builders',
  'UI UX patterns for high converting SaaS pages',
  'AI tools for faster web development',
  'Website design trends for startup landing pages',
  'Technical SEO checklist for React websites'
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeXml(value = '') {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${escapeRegExp(tag)}[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tag)}>`, 'i'));
  return decodeXml(match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() || '');
}

function parseTraffic(value = '') {
  const text = String(value).toLowerCase().replaceAll(',', '');
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return 1000;
  const number = Number(match[1]);
  if (text.includes('m')) return Math.round(number * 1000000);
  if (text.includes('k')) return Math.round(number * 1000);
  return Math.round(number);
}

function parseTrendItems(xml, country) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match, index) => {
    const title = extractTag(match[1], 'title');
    const volume = parseTraffic(extractTag(match[1], 'ht:approx_traffic'));
    return {
      id: slugify(`${title}-${country}-${index}`, { lower: true, strict: true }),
      keyword: title,
      searchVolume: volume,
      growth: Math.min(600, Math.max(18, Math.round(volume / 700 + index * 7))),
      difficulty: Math.min(92, Math.max(18, Math.round(35 + index * 4 + title.length / 3))),
      country,
      category: 'Google Trends',
      source: 'Google Trends',
      newsUrl: extractTag(match[1], 'ht:news_item_url'),
      newsTitle: extractTag(match[1], 'ht:news_item_title')
    };
  }).filter((item) => item.keyword);
}

function isRelatedTrend(item) {
  const haystack = `${item.keyword} ${item.newsTitle}`.toLowerCase();
  return relatedKeywords.some((keyword) => haystack.includes(keyword));
}

function fallbackTrends(country, category) {
  return fallbackTopics.map((keyword, index) => ({
    id: slugify(`${keyword}-${country}-${index}`, { lower: true, strict: true }),
    keyword,
    searchVolume: 12000 - index * 900,
    growth: 85 - index * 5,
    difficulty: 42 + index * 4,
    country,
    category,
    source: 'Curated Weblix Trends',
    newsUrl: '',
    newsTitle: ''
  }));
}

export async function getTrendSettings() {
  return TrendSetting.findOneAndUpdate({ key: 'global' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function updateTrendSettings(payload) {
  return TrendSetting.findOneAndUpdate({ key: 'global' }, payload, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function fetchTrendKeywords({ country = process.env.TREND_BLOG_GEO || 'US', category = 'Technology', search = '' } = {}) {
  let items = [];
  try {
    const response = await fetch(`${GOOGLE_TRENDS_RSS}?geo=${encodeURIComponent(country)}`, {
      headers: { 'User-Agent': 'WeblixBot/1.0 (+https://weblix.local)' }
    });
    if (!response.ok) throw new Error(`Google Trends RSS failed with ${response.status}`);
    items = parseTrendItems(await response.text(), country);
  } catch (error) {
    console.warn('Google Trends unavailable, using curated Weblix trends:', error.message);
  }
  const merged = [...items.filter(isRelatedTrend), ...fallbackTrends(country, category)];
  const unique = [...new Map(merged.map((item) => [item.keyword.toLowerCase(), item])).values()];
  return unique
    .filter((item) => !search || item.keyword.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20);
}

export function buildGeneratedBlogPayload(trend, options = {}) {
  const keyword = trend.keyword || trend;
  const title = `${keyword}: SEO guide for modern website teams`;
  const slug = slugify(title, { lower: true, strict: true });
  const faqs = [
    { question: `Why is ${keyword} trending?`, answer: `${keyword} is connected to demand for faster website launches, AI-assisted workflows, and better SEO outcomes.` },
    { question: `How can Weblix users apply ${keyword}?`, answer: 'Use the topic to create focused landing pages, internal links, FAQ sections, and template CTAs.' }
  ];
  const imageFields = options.autoGenerateImages ? generateOriginalBlogImages({ slug, keyword, title }) : {};
  const payload = {
    title,
    slug,
    excerpt: `A practical SEO brief about ${keyword} for website builders, SaaS teams, and Weblix template buyers.`,
    content: `
      <h2>What ${keyword} means for website teams</h2>
      <p><strong>${keyword}</strong> is gaining attention because teams need faster ways to plan, design, publish, and optimize modern websites.</p>
      <h2>SEO opportunity</h2>
      <p>Search demand around ${keyword} can support comparison pages, template collections, tutorials, and product-led blog content.</p>
      <h3>Recommended content structure</h3>
      <ul><li>Define the problem clearly.</li><li>Show examples and use cases.</li><li>Add internal links to related Weblix blogs and templates.</li><li>Include FAQ schema for long-tail search.</li></ul>
      <h2>How to act now</h2>
      <p>Create a page targeting ${keyword}, add screenshots, include a concise CTA, and link to <a href="/templates">Weblix templates</a>.</p>
      <section class="blog-cta"><h2>Launch faster with Weblix</h2><p>Use premium builder ZIPs and template packs to turn this trend into a live website.</p></section>
    `,
    status: options.status || 'ai-generated',
    source: 'trend-draft',
    seoTitle: `${keyword} SEO guide for website builders`,
    seoDescription: `Learn how ${keyword} impacts AI website builders, SEO, web development, SaaS pages, and modern Weblix workflows.`,
    focusKeyword: keyword,
    secondaryKeywords: ['AI website builder', 'SEO', 'Web Development', 'SaaS', 'Weblix'],
    tags: ['Google Trends', 'AI Blog', 'SEO', 'Web Development', keyword],
    categoryName: options.category || trend.category || 'Technology',
    schemaType: 'BlogPosting',
    faqs,
    authorName: 'Weblix AI Editorial',
    internalLinks: ['/templates', '/pricing', '/blog'],
    externalLinks: trend.newsUrl ? [trend.newsUrl] : [],
    readTime: 4,
    topKeywords: [keyword, 'AI website builder', 'SEO'],
    geoTitle: `${keyword}: concise AI answer for website teams`,
    geoSummary: `This Weblix trend brief explains ${keyword} for AI search, website builders, SaaS teams, SEO planning, and template-based website launch workflows.`,
    geoAnswer: `${keyword} matters because modern website teams need faster ways to create, optimize, and publish pages. Weblix applies this trend through builder-ready ZIP files, SEO blog workflows, template packs, secure downloads, and dashboard-managed content.`,
    geoAudience: 'Website owners, agencies, SaaS founders, developers, SEO teams, and Weblix users',
    geoRegion: trend.country || process.env.TREND_BLOG_GEO || 'Global',
    geoEntities: ['Weblix Website Builder', keyword, 'AI Website Builder', 'SEO', 'Website Templates', 'MERN Stack'],
    geoQuestions: [`Why is ${keyword} trending?`, `How can Weblix users apply ${keyword}?`, `How does ${keyword} help website teams?`],
    geoSources: trend.newsUrl ? [trend.newsUrl, '/templates', '/pricing'] : ['/templates', '/pricing', '/blog'],
    geoScore: 100,
    geoChecks: [
      { label: 'AI answer title', status: 'good', message: 'Looks good.' },
      { label: 'Short AI summary', status: 'good', message: 'Looks good.' },
      { label: 'Direct answer block', status: 'good', message: 'Looks good.' },
      { label: 'Named entities', status: 'good', message: 'Looks good.' },
      { label: 'Question coverage', status: 'good', message: 'Looks good.' },
      { label: 'Source transparency', status: 'good', message: 'Looks good.' }
    ],
    publishedAt: options.status === 'published' ? new Date() : undefined,
    scheduledAt: options.scheduledAt ? new Date(options.scheduledAt) : undefined,
    ...imageFields
  };
  Object.assign(payload, autoSeoPayload(payload));
  Object.assign(payload, calculateSeo(payload));
  Object.assign(payload, calculateGeo(payload));
  return payload;
}

export async function generateBlogFromTrend(trend, options = {}) {
  const settings = await getTrendSettings();
  const payload = buildGeneratedBlogPayload(trend, {
    autoGenerateImages: options.autoGenerateImages !== false,
    category: options.category || settings.category,
    scheduledAt: options.scheduledAt,
    status: options.status
  });
  let slug = payload.slug;
  let counter = 1;
  while (await Blog.findOne({ slug })) {
    slug = `${payload.slug}-${counter}`;
    counter += 1;
  }
  if (slug !== payload.slug && payload.featuredImage) {
    Object.assign(payload, generateOriginalBlogImages({ slug, keyword: payload.focusKeyword, title: payload.title }));
  }
  return Blog.create({ ...payload, slug });
}

export async function createTrendingDrafts() {
  const settings = await getTrendSettings();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyLimit = Number(settings.dailyLimit || process.env.TREND_BLOG_DAILY_LIMIT || 2);
  const alreadyCreated = await Blog.countDocuments({ source: 'trend-draft', createdAt: { $gte: todayStart } });
  if (alreadyCreated >= dailyLimit) return { created: 0, skipped: alreadyCreated, blogs: [] };
  const trends = await fetchTrendKeywords({ country: settings.country, category: settings.category });
  const blogs = [];
  for (const trend of trends.slice(0, dailyLimit - alreadyCreated)) {
    blogs.push(await generateBlogFromTrend(trend, { status: settings.enabled ? DEFAULT_STATUS : 'ai-generated', category: settings.category, autoGenerateImages: settings.autoGenerateImages !== false }));
  }
  return { created: blogs.length, skipped: alreadyCreated, blogs };
}

export async function publishDueScheduledPosts() {
  const result = await Blog.updateMany(
    { status: 'scheduled', scheduledAt: { $lte: new Date() } },
    { $set: { status: 'published', publishedAt: new Date() } }
  );
  return result.modifiedCount || 0;
}
