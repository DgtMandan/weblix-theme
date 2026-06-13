const DEFAULT_USER_AGENT = 'WeblixAuditBot/1.0 (+https://weblix.local)';
const DEFAULT_MAX_AUDIT_PAGES = 25;

function normalizeUrl(url = '') {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function stripHtml(value = '') {
  return String(value).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreFromIssues(base, issueCount, weight = 8) {
  return Math.max(20, Math.min(100, base - issueCount * weight));
}

function findLinks(html, baseUrl) {
  const base = new URL(baseUrl);
  const links = [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((href) => href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
    .map((href) => {
      try {
        const url = new URL(href, base);
        return url.hostname === base.hostname ? url.href.split('#')[0] : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return [...new Set(links)];
}

async function findSitemapUrls(startUrl, maxPages) {
  try {
    const base = new URL(startUrl);
    const sitemapUrl = `${base.origin}/sitemap.xml`;
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/xml,text/xml,text/plain' },
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
      .map((match) => match[1].trim())
      .filter((url) => {
        try {
          const parsed = new URL(url);
          return parsed.hostname === base.hostname;
        } catch {
          return false;
        }
      })
      .slice(0, maxPages);
  } catch {
    return [];
  }
}

async function fetchPage(url) {
  const started = Date.now();
  const response = await fetch(url, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(9000),
    redirect: 'follow'
  });
  const html = await response.text();
  return {
    url: response.url || url,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    html,
    loadMs: Date.now() - started
  };
}

function analyzeHtml(page, lead) {
  const html = page.html || '';
  const text = stripHtml(html);
  const issues = [];
  const recommendations = [];
  const contentGaps = [];
  const trustGaps = [];

  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() || '';
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const imageCount = (html.match(/<img\b/gi) || []).length;
  const altCount = (html.match(/<img[^>]+alt=["'][^"']+["']/gi) || []).length;
  const hasSchema = /application\/ld\+json|schema\.org/i.test(html);
  const hasAnalytics = /gtag|google-analytics|googletagmanager|facebook.*pixel|meta pixel/i.test(html);
  const hasForms = /<form\b|type=["']email["']|contact/i.test(html);
  const hasPhone = /tel:|\+?\d[\d\s().-]{8,}/.test(html);
  const hasReviews = /review|testimonial|rating|stars/i.test(text);
  const hasPrivacy = /privacy|terms|cookie/i.test(text);
  const hasCta = /book|call|quote|contact|get started|schedule|buy|request/i.test(text);
  const usesHttps = page.url.startsWith('https://');
  const hasSecurityHeaders = Boolean(page.headers['content-security-policy'] || page.headers['strict-transport-security']);
  const hasManyScripts = (html.match(/<script\b/gi) || []).length > 18;
  const largeHtml = Buffer.byteLength(html) > 450000;

  if (!title || title.length < 20 || title.length > 65) issues.push('SEO title is missing, too short, or too long.');
  if (!description || description.length < 80 || description.length > 165) issues.push('Meta description needs stronger search-result copy.');
  if (h1Count !== 1) issues.push('Page should have exactly one clear H1 heading.');
  if (!hasSchema) issues.push('Structured data/schema markup is missing.');
  if (!viewport) issues.push('Mobile viewport tag is missing or misconfigured.');
  if (imageCount && altCount < imageCount) issues.push('Some images are missing descriptive ALT text.');
  if (!usesHttps) issues.push('Website should use HTTPS for trust and security.');
  if (!hasSecurityHeaders) issues.push('Security headers such as HSTS or CSP are missing.');
  if (hasManyScripts || largeHtml || page.loadMs > 3000) issues.push('Page appears heavy or slow and should be optimized.');
  if (!hasCta) issues.push('Primary conversion call-to-action is not clear enough.');
  if (!hasForms && !hasPhone) issues.push('Visitors may not have an obvious way to contact the business.');
  if (!hasReviews) trustGaps.push('Add testimonials, review highlights, or proof points above the fold.');
  if (!hasPrivacy) trustGaps.push('Add privacy/terms links to improve trust and compliance.');
  if (!hasAnalytics) recommendations.push('Install analytics and conversion tracking before running ads.');

  if (!/service|services/i.test(text)) contentGaps.push('Create service pages for each high-value offer.');
  if (!/faq|question/i.test(text)) contentGaps.push('Add FAQs to capture long-tail SEO searches and AI answers.');
  if (!/area|near me|city|location/i.test(text)) contentGaps.push('Add local landing pages for city and neighborhood searches.');

  recommendations.push('Rewrite title/meta copy around the highest-value local keyword.');
  recommendations.push('Add a strong hero CTA, trust badges, reviews, and a short lead form.');
  recommendations.push('Compress images, reduce render-blocking scripts, and lazy-load media.');
  recommendations.push('Add LocalBusiness schema and Google Business Profile links.');

  return {
    issues,
    recommendations: [...new Set(recommendations)],
    contentGaps: [...new Set(contentGaps)],
    trustGaps: [...new Set(trustGaps)],
    signals: { title, description, viewport, h1Count, imageCount, altCount, hasSchema, hasAnalytics, hasForms, hasPhone, hasReviews, hasPrivacy, hasCta, usesHttps, hasSecurityHeaders, loadMs: page.loadMs, textLength: text.length, category: lead.category }
  };
}

function buildProposal(lead, audit) {
  const business = lead.businessName || 'your business';
  const reviewCount = Number(lead.reviewCount || 0);
  const category = lead.category || 'local business';
  const redesignDetected = audit.designScore < 72 || audit.conversionScore < 72 || audit.performanceScore < 70;

  return {
    redesignDetected,
    redesignProposal: `Modernize ${business}'s website with a mobile-first Weblix redesign, clearer service pages, stronger calls-to-action, review proof, faster loading sections, and conversion tracking.`,
    seoProposal: `Build SEO pages for ${category}, optimize metadata and headings, add schema, improve internal linking, and publish helpful local content around buyer questions.`,
    localSeoProposal: `Create location-specific service pages, improve NAP consistency, add LocalBusiness schema, and connect website CTAs to Google Business Profile actions.`,
    googleBusinessProposal: `Improve Google Business Profile categories, services, posts, photos, review replies, and website links so local searchers see a complete brand experience.`,
    socialMediaProposal: `Repurpose customer proof, before/after visuals, and service tips into social posts that support local trust and remarketing.`,
    paidAdsProposal: reviewCount >= 30 ? `Use search ads and retargeting once landing pages and tracking are fixed. ${reviewCount}+ reviews give this business enough proof to convert paid traffic.` : 'Wait on paid ads until the website, tracking, and review proof are stronger.'
  };
}

export async function auditLeadWebsite(lead) {
  const startUrl = normalizeUrl(lead.website);
  if (!startUrl) {
    const error = new Error('Lead does not have a website URL to audit.');
    error.statusCode = 400;
    throw error;
  }

  const maxPages = Math.min(Math.max(Number(process.env.AUDIT_MAX_PAGES || DEFAULT_MAX_AUDIT_PAGES), 5), 100);
  const firstPage = await fetchPage(startUrl);
  const sitemapUrls = await findSitemapUrls(firstPage.url, maxPages);
  const discovered = new Set([firstPage.url, ...sitemapUrls, ...findLinks(firstPage.html, firstPage.url)]);
  const pages = [firstPage];
  const visited = new Set([firstPage.url]);
  for (const url of [...discovered]) {
    if (pages.length >= maxPages) break;
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      const page = await fetchPage(url);
      pages.push(page);
      findLinks(page.html, page.url).forEach((link) => {
        if (discovered.size < maxPages * 3) discovered.add(link);
      });
    } catch {
      // Keep audit moving when one internal page is unavailable.
    }
  }

  const analyses = pages.map((page) => analyzeHtml(page, lead));
  const allIssues = [...new Set(analyses.flatMap((item) => item.issues))];
  const recommendations = [...new Set(analyses.flatMap((item) => item.recommendations))];
  const contentGaps = [...new Set(analyses.flatMap((item) => item.contentGaps))];
  const trustGaps = [...new Set(analyses.flatMap((item) => item.trustGaps))];
  const signals = analyses[0].signals;

  const seoScore = scoreFromIssues(92, allIssues.filter((issue) => /SEO|Meta|H1|schema|ALT/i.test(issue)).length, 11);
  const performanceScore = Math.max(25, Math.min(100, 95 - Math.round((signals.loadMs || 0) / 110) - (signals.textLength > 25000 ? 8 : 0)));
  const mobileScore = signals.viewport ? 86 : 52;
  const securityScore = (signals.usesHttps ? 55 : 20) + (signals.hasSecurityHeaders ? 35 : 10);
  const conversionScore = 45 + (signals.hasCta ? 20 : 0) + (signals.hasForms ? 15 : 0) + (signals.hasPhone ? 10 : 0) + (signals.hasReviews ? 10 : 0);
  const designScore = 80 - (trustGaps.length * 8) - (!signals.hasCta ? 12 : 0) - (signals.imageCount < 2 ? 8 : 0);
  const accessibilityScore = signals.imageCount ? Math.round((signals.altCount / signals.imageCount) * 70 + 25) : 82;
  const localSeoScore = 45 + (signals.hasSchema ? 18 : 0) + (signals.hasPhone ? 12 : 0) + (lead.googleMapsUrl ? 10 : 0) + (Number(lead.reviewCount || 0) > 30 ? 10 : 0);
  const websiteHealthScore = Math.round((seoScore + performanceScore + mobileScore + securityScore + conversionScore + designScore + accessibilityScore + localSeoScore) / 8);
  const leadScore = Math.min(100, Math.round((100 - websiteHealthScore) * 0.45 + Math.min(Number(lead.reviewCount || 0), 100) * 0.25 + (lead.website ? 12 : 0) + (lead.email ? 10 : 0) + (lead.phone ? 8 : 0)));
  const proposals = buildProposal(lead, { designScore, conversionScore, performanceScore });

  return {
    auditedAt: new Date(),
    crawledUrls: pages.map((page) => page.url),
    seoScore,
    websiteHealthScore,
    performanceScore,
    designScore: Math.max(20, Math.min(100, designScore)),
    mobileScore,
    conversionScore: Math.min(100, conversionScore),
    accessibilityScore: Math.max(20, Math.min(100, accessibilityScore)),
    securityScore: Math.min(100, securityScore),
    localSeoScore: Math.min(100, localSeoScore),
    leadScore,
    issues: allIssues,
    priorityIssues: allIssues.slice(0, 6),
    recommendations: recommendations.slice(0, 10),
    contentGaps,
    trustGaps,
    competitorComparison: `Compared with stronger ${lead.category || 'local'} competitors, this site needs clearer service positioning, faster pages, stronger trust proof, and more local SEO content.`,
    trafficImprovementEstimate: websiteHealthScore < 65 ? 'Potential 25-45% lift from technical SEO, local pages, and stronger metadata.' : 'Potential 10-20% lift from content expansion and conversion improvements.',
    revenueOpportunityEstimate: leadScore > 70 ? 'High opportunity: fixes may unlock more calls, quote requests, and booked consultations.' : 'Medium opportunity: improvements can increase trust and lead capture over time.',
    ...proposals
  };
}

function escapePdfText(value = '') {
  return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/\r?\n/g, ' ');
}

function pdfText(value, x, y, size = 10, color = '0 0 0', font = 'F1') {
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function pdfRect(x, y, width, height, color) {
  return `${color} rg ${x} ${y} ${width} ${height} re f`;
}

function pdfStrokeRect(x, y, width, height, color = '0.88 0.90 0.96', lineWidth = 1) {
  return `q ${lineWidth} w ${color} RG ${x} ${y} ${width} ${height} re S Q`;
}

function pdfLine(x1, y1, x2, y2, color = '0.88 0.90 0.96', lineWidth = 1) {
  return `q ${lineWidth} w ${color} RG ${x1} ${y1} m ${x2} ${y2} l S Q`;
}

function wrapText(value = '', maxChars = 86) {
  const words = String(value || '').replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function scoreColor(score = 0) {
  if (score >= 75) return '0.12 0.62 0.34';
  if (score >= 55) return '0.98 0.62 0.12';
  return '0.88 0.16 0.22';
}

function addLogo(commands, x, y) {
  commands.push(pdfRect(x, y, 30, 30, '0.13 0.33 1'));
  commands.push(pdfRect(x + 6, y + 18, 7, 7, '1 1 1'));
  commands.push(pdfRect(x + 17, y + 18, 7, 7, '1 1 1'));
  commands.push(pdfRect(x + 6, y + 7, 7, 7, '1 1 1'));
  commands.push(pdfRect(x + 17, y + 7, 7, 7, '1 1 1'));
  commands.push(pdfText('Weblix', x + 40, y + 15, 22, '1 1 1', 'F2'));
  commands.push(pdfText('Website Builder', x + 42, y + 4, 8, '0.77 0.84 1', 'F1'));
}

function addScoreCard(commands, label, score, x, y, width = 82) {
  const fill = scoreColor(Number(score || 0));
  commands.push(pdfRect(x, y, width, 58, '0.96 0.97 1'));
  commands.push(pdfStrokeRect(x, y, width, 58, '0.82 0.86 0.96'));
  commands.push(pdfText(label, x + 10, y + 38, 8, '0.35 0.39 0.50', 'F2'));
  commands.push(pdfText(`${score ?? '-'}`, x + 10, y + 15, 24, fill, 'F2'));
  commands.push(pdfText('/100', x + 48, y + 18, 9, '0.45 0.48 0.58'));
}

function addBar(commands, label, score, x, y, width = 250) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  commands.push(pdfText(label, x, y + 5, 9, '0.12 0.15 0.25', 'F2'));
  commands.push(pdfRect(x + 116, y, width, 10, '0.91 0.93 0.98'));
  commands.push(pdfRect(x + 116, y, Math.round((safeScore / 100) * width), 10, scoreColor(safeScore)));
  commands.push(pdfText(`${safeScore}/100`, x + 375, y + 2, 8, '0.35 0.39 0.50'));
}

function addWrapped(commands, value, x, y, maxChars, size = 9, color = '0.30 0.34 0.44', leading = 13) {
  let nextY = y;
  wrapText(value, maxChars).forEach((line) => {
    commands.push(pdfText(line, x, nextY, size, color));
    nextY -= leading;
  });
  return nextY;
}

function addBullets(commands, items = [], x, y, max = 5) {
  let nextY = y;
  items.slice(0, max).forEach((item) => {
    commands.push(pdfRect(x, nextY + 4, 4, 4, '0.13 0.33 1'));
    nextY = addWrapped(commands, item, x + 12, nextY, 76, 8.5, '0.25 0.28 0.37', 12);
    nextY -= 3;
  });
  return nextY;
}

function buildPdf(pages) {
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    `2 0 obj << /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`
  ];

  pages.forEach((stream, index) => {
    const pageObj = 3 + index * 2;
    const contentObj = pageObj + 1;
    objects.push(`${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObj} 0 R >> endobj`);
    objects.push(`${contentObj} 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`);
  });

  objects.push(`${3 + pages.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
  objects.push(`${4 + pages.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

export function createLeadAuditPdf(lead) {
  const audit = lead.websiteAudit || {};
  const brand = process.env.WHITE_LABEL_AGENCY_NAME || 'Weblix Growth Audit';
  const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const summary = lead.aiSummary || 'This report highlights website, SEO, conversion and local marketing opportunities.';
  const scores = [
    ['SEO', audit.seoScore],
    ['Health', audit.websiteHealthScore],
    ['Speed', audit.performanceScore],
    ['Mobile', audit.mobileScore],
    ['Design', audit.designScore],
    ['Convert', audit.conversionScore]
  ];

  const p1 = [];
  p1.push(pdfRect(0, 722, 612, 120, '0.02 0.07 0.27'));
  p1.push(pdfRect(0, 722, 612, 6, '0.13 0.33 1'));
  addLogo(p1, 42, 782);
  p1.push(pdfText(brand, 42, 738, 9, '0.77 0.84 1', 'F2'));
  p1.push(pdfText('AI Website Audit Report', 42, 694, 30, '0.04 0.06 0.17', 'F2'));
  p1.push(pdfText(lead.businessName || 'Business Lead', 42, 669, 17, '0.13 0.33 1', 'F2'));
  p1.push(pdfText(`Website: ${lead.website || 'Not provided'}`, 42, 649, 10, '0.35 0.39 0.50'));
  p1.push(pdfText(`Generated: ${generated}`, 420, 649, 10, '0.35 0.39 0.50'));
  p1.push(pdfText(`Pages crawled: ${(audit.crawledUrls || []).length}`, 420, 634, 9, '0.35 0.39 0.50'));
  p1.push(pdfLine(42, 632, 570, 632));
  p1.push(pdfText('Executive Summary', 42, 607, 14, '0.04 0.06 0.17', 'F2'));
  addWrapped(p1, summary, 42, 586, 98, 9.5, '0.25 0.28 0.37', 14);

  let x = 42;
  let y = 492;
  scores.forEach(([label, score], index) => {
    addScoreCard(p1, label, score ?? 0, x, y);
    x += 88;
    if (index === 2) {
      x = 42;
      y -= 70;
    }
  });

  p1.push(pdfRect(314, 418, 256, 132, '0.96 0.97 1'));
  p1.push(pdfStrokeRect(314, 418, 256, 132));
  p1.push(pdfText('Lead Opportunity', 330, 524, 13, '0.04 0.06 0.17', 'F2'));
  p1.push(pdfText(`${audit.leadScore ?? 0}/100`, 330, 486, 34, scoreColor(audit.leadScore), 'F2'));
  p1.push(pdfText('Priority for outreach and proposal follow-up', 330, 464, 9, '0.35 0.39 0.50'));
  p1.push(pdfText(`Reviews: ${lead.reviewCount || 0}  Rating: ${lead.rating || '-'}`, 330, 444, 9, '0.35 0.39 0.50'));

  p1.push(pdfText('SEO Infographic', 42, 374, 15, '0.04 0.06 0.17', 'F2'));
  addBar(p1, 'Meta + headings', audit.seoScore || 0, 42, 346);
  addBar(p1, 'Technical health', audit.websiteHealthScore || 0, 42, 321);
  addBar(p1, 'Local SEO', audit.localSeoScore || 0, 42, 296);
  addBar(p1, 'Trust + conversion', audit.conversionScore || 0, 42, 271);
  addBar(p1, 'Mobile experience', audit.mobileScore || 0, 42, 246);

  p1.push(pdfRect(42, 118, 528, 96, '0.96 0.97 1'));
  p1.push(pdfStrokeRect(42, 118, 528, 96));
  p1.push(pdfText('Estimated Upside', 58, 188, 13, '0.04 0.06 0.17', 'F2'));
  addWrapped(p1, `Traffic: ${audit.trafficImprovementEstimate || 'Potential lift from technical SEO, local pages and stronger metadata.'}`, 58, 166, 88, 9, '0.25 0.28 0.37', 13);
  addWrapped(p1, `Revenue: ${audit.revenueOpportunityEstimate || 'Improved trust and conversion can increase calls and quote requests.'}`, 58, 139, 88, 9, '0.25 0.28 0.37', 13);
  p1.push(pdfText('Page 1 / 2', 516, 42, 8, '0.55 0.58 0.66'));

  const p2 = [];
  p2.push(pdfRect(0, 798, 612, 44, '0.02 0.07 0.27'));
  addLogo(p2, 42, 805);
  p2.push(pdfText('Findings, Fixes and Proposal', 42, 764, 22, '0.04 0.06 0.17', 'F2'));
  p2.push(pdfText(lead.businessName || 'Business Lead', 42, 742, 11, '0.13 0.33 1', 'F2'));

  p2.push(pdfText('Priority Issues', 42, 704, 14, '0.04 0.06 0.17', 'F2'));
  let nextY = addBullets(p2, audit.priorityIssues || audit.issues || [], 42, 682, 6);

  p2.push(pdfText('Recommended Fixes', 315, 704, 14, '0.04 0.06 0.17', 'F2'));
  addBullets(p2, audit.recommendations || [], 315, 682, 6);

  p2.push(pdfRect(42, 352, 528, 132, '0.96 0.97 1'));
  p2.push(pdfStrokeRect(42, 352, 528, 132));
  p2.push(pdfText('Website Redesign Proposal', 58, 458, 14, '0.04 0.06 0.17', 'F2'));
  addWrapped(p2, audit.redesignProposal || 'A modern, mobile-first redesign can improve trust, speed and lead capture.', 58, 436, 91, 9, '0.25 0.28 0.37', 13);
  p2.push(pdfText('Before vs After Direction', 58, 396, 10, '0.13 0.33 1', 'F2'));
  addWrapped(p2, 'Before: unclear calls-to-action, thin SEO pages and weak trust signals. After: fast Weblix landing pages, service sections, proof blocks, local SEO schema and conversion tracking.', 58, 378, 91, 8.5, '0.30 0.34 0.44', 12);

  p2.push(pdfText('Marketing Opportunity Plan', 42, 316, 14, '0.04 0.06 0.17', 'F2'));
  const proposalItems = [
    ['SEO', audit.seoProposal],
    ['Local SEO', audit.localSeoProposal],
    ['Google Business', audit.googleBusinessProposal],
    ['Social Media', audit.socialMediaProposal],
    ['Paid Ads', audit.paidAdsProposal]
  ].filter(([, value]) => value);
  nextY = 292;
  proposalItems.forEach(([label, value]) => {
    p2.push(pdfText(label, 42, nextY, 9.5, '0.13 0.33 1', 'F2'));
    nextY = addWrapped(p2, value, 126, nextY, 74, 8.5, '0.25 0.28 0.37', 12);
    nextY -= 6;
  });

  p2.push(pdfLine(42, 82, 570, 82));
  p2.push(pdfText('Prepared by Weblix Website Builder', 42, 60, 9, '0.35 0.39 0.50', 'F2'));
  p2.push(pdfText('Page 2 / 2', 516, 42, 8, '0.55 0.58 0.66'));

  return buildPdf([p1.join('\n'), p2.join('\n')]);
}
