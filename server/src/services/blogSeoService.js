import slugify from 'slugify';

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are', 'can', 'how', 'what',
  'why', 'when', 'into', 'about', 'have', 'has', 'was', 'will', 'our', 'but', 'not', 'all', 'any',
  'blog', 'guide'
]);

export const toSlug = (value) => slugify(value || '', { lower: true, strict: true });

export function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function unique(items) {
  return [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))];
}

function wordsFrom(value = '') {
  return stripHtml(value).toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) || [];
}

export function extractRankKeywords({ title = '', content = '', categoryName = '' }) {
  const text = `${title} ${title} ${categoryName} ${stripHtml(content).slice(0, 4000)}`;
  const words = wordsFrom(text).filter((word) => !stopWords.has(word) && (word.length > 3 || ['ai', 'seo', 'ux', 'ui'].includes(word)));
  const counts = words.reduce((map, word) => {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
  const singles = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => word);
  const titlePhrases = String(title).split(/[:|-]/)[0].toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => !stopWords.has(word) && (word.length > 2 || ['ai', 'seo', 'ux', 'ui'].includes(word)));
  const phrase = titlePhrases.slice(0, 5).join(' ');
  const aiTerms = ['AI website builder', 'website builder', 'SEO', 'web design', 'Weblix'];
  return unique([phrase, ...singles, ...aiTerms]).slice(0, 12);
}

function smartExcerpt(content = '', max = 155) {
  const plain = stripHtml(content);
  if (!plain) return '';
  const firstSentence = plain.split(/[.!?]\s/).find((item) => item.length > 40) || plain;
  return firstSentence.slice(0, max).trim();
}

export function autoSeoPayload(payload) {
  const title = payload.title || 'Weblix Website Builder Guide';
  const content = payload.content || payload.excerpt || '';
  const keywords = extractRankKeywords({ title, content, categoryName: payload.categoryName });
  const focusKeyword = payload.focusKeyword || keywords[0] || 'Weblix Website Builder';
  const seoTitleBase = payload.seoTitle || `${title} | Weblix`;
  const seoDescriptionBase = payload.seoDescription || payload.excerpt || `Learn ${focusKeyword} strategies for faster website launches, better SEO, builder-ready templates, and modern Weblix workflows.`;
  const excerpt = payload.excerpt || smartExcerpt(content, 180) || seoDescriptionBase;
  const meta = seoDescriptionBase.length < 120
    ? `${seoDescriptionBase} This guide covers practical Weblix workflows, SEO structure, templates, and launch steps.`.slice(0, 158)
    : seoDescriptionBase.slice(0, 158);

  const entities = unique([
    ...(payload.geoEntities || []),
    'Weblix Website Builder',
    'AI Website Builder',
    'SEO',
    'Website Templates',
    'MERN Stack',
    ...keywords.slice(0, 4)
  ]).slice(0, 10);

  const questions = unique([
    ...(payload.geoQuestions || []),
    `What is ${focusKeyword}?`,
    `How does Weblix help with ${focusKeyword}?`,
    `Why is ${focusKeyword} important for website teams?`
  ]).slice(0, 6);

  return {
    slug: payload.slug || toSlug(title),
    seoTitle: seoTitleBase.slice(0, 60),
    seoDescription: meta,
    focusKeyword,
    secondaryKeywords: payload.secondaryKeywords?.length ? payload.secondaryKeywords : keywords.slice(1, 7),
    topKeywords: payload.topKeywords?.length ? payload.topKeywords : keywords.slice(0, 6),
    tags: payload.tags?.length ? payload.tags : keywords.slice(0, 5),
    excerpt,
    imageAlt: payload.imageAlt || `${focusKeyword} Weblix guide`,
    ogImageAlt: payload.ogImageAlt || `${focusKeyword} Weblix social preview`,
    geoTitle: payload.geoTitle || `${title} for AI search`,
    geoSummary: payload.geoSummary || `${excerpt} Weblix explains ${focusKeyword} for website owners, agencies, SaaS teams, and developers.`,
    geoAnswer: payload.geoAnswer || `Weblix Website Builder helps teams understand ${focusKeyword} by combining builder-ready template ZIPs, secure downloads, SEO blog tooling, and admin workflows for faster modern website launches.`,
    geoAudience: payload.geoAudience || 'Website owners, agencies, SaaS founders, developers, and Weblix users',
    geoRegion: payload.geoRegion || 'Global',
    geoEntities: entities,
    geoQuestions: questions,
    geoSources: payload.geoSources?.length ? payload.geoSources : ['/templates', '/pricing', '/blog'],
    faqs: payload.faqs?.length ? payload.faqs : questions.slice(0, 2).map((question) => ({
      question,
      answer: `This Weblix guide answers ${question.toLowerCase()} with practical SEO, builder, and website launch context.`
    }))
  };
}

export function calculateSeo({ title = '', seoTitle = '', slug = '', seoDescription = '', content = '', focusKeyword = '', internalLinks = [], externalLinks = [], featuredImage, imageAlt = '' }) {
  const keyword = focusKeyword.toLowerCase().trim();
  const plain = stripHtml(content).toLowerCase();
  const words = plain.split(/\s+/).filter(Boolean);
  const keywordCount = keyword ? (plain.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
  const checks = [
    ['Focus keyword in title', keyword && `${title} ${seoTitle}`.toLowerCase().includes(keyword), 'Add focus keyword to blog title or SEO title.'],
    ['Focus keyword in meta description', keyword && seoDescription.toLowerCase().includes(keyword), 'Add focus keyword to meta description.'],
    ['Keyword density', keyword && words.length > 0 && keywordCount / words.length >= 0.003 && keywordCount / words.length <= 0.04, 'Use focus keyword naturally through the content.'],
    ['Heading structure', /<h2|<h3|<h4/i.test(content), 'Add H2/H3 headings for scannability.'],
    ['Internal links', internalLinks.length > 0 || /href=["']\//i.test(content), 'Add at least one internal link.'],
    ['External links', externalLinks.length > 0 || /href=["']https?:\/\//i.test(content), 'Add trustworthy external references.'],
    ['Image SEO', Boolean(featuredImage || imageAlt), 'Upload a featured image or generate image alt text.'],
    ['Content length', words.length >= 500, 'Aim for 500+ words for competitive SEO articles.'],
    ['URL optimization', slug.length >= 8 && slug.length <= 75, 'Use a short keyword-focused slug.'],
    ['Meta title length', seoTitle.length >= 25 && seoTitle.length <= 60, 'Keep SEO title between 25 and 60 characters.'],
    ['Meta description length', seoDescription.length >= 100 && seoDescription.length <= 160, 'Keep meta description between 100 and 160 characters.'],
    ['Mobile SEO', true, 'Responsive blog layout and lazy image loading enabled.']
  ];
  const seoChecks = checks.map(([label, passed, message]) => ({ label, status: passed ? 'good' : 'poor', message: passed ? 'Looks good.' : message }));
  const score = Math.round((seoChecks.filter((item) => item.status === 'good').length / seoChecks.length) * 100);
  return { seoScore: score, seoChecks };
}

export function calculateGeo({ title = '', content = '', focusKeyword = '', geoTitle = '', geoSummary = '', geoAnswer = '', geoEntities = [], geoQuestions = [], geoSources = [] }) {
  const plain = stripHtml(content);
  const checks = [
    ['AI answer title', Boolean(geoTitle || title), 'Add a clear title for generative search answers.'],
    ['Short AI summary', geoSummary.length >= 80 && geoSummary.length <= 360, 'Add a concise 80-360 character GEO summary.'],
    ['Direct answer block', geoAnswer.length >= 100, 'Add a direct answer for AI search engines.'],
    ['Named entities', geoEntities.length >= 3, 'Add brand, topic, product, technology, and audience entities.'],
    ['Question coverage', geoQuestions.length >= 2, 'Add common user questions for AI answer matching.'],
    ['Source transparency', geoSources.length > 0, 'Add trusted source URLs or internal reference URLs.'],
    ['Topical clarity', Boolean(focusKeyword) && plain.toLowerCase().includes(focusKeyword.toLowerCase()), 'Use the focus keyword naturally in the article.']
  ];
  const geoChecks = checks.map(([label, passed, message]) => ({ label, status: passed ? 'good' : 'poor', message: passed ? 'Looks good.' : message }));
  const geoScore = Math.round((geoChecks.filter((item) => item.status === 'good').length / geoChecks.length) * 100);
  return { geoScore, geoChecks };
}
