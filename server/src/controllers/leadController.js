import { Lead } from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { analyzeLeadPainPoints, calculateContactabilityScore, calculateSocialProfileScore, generateOutreachEmail, searchGooglePlaces } from '../services/leadFinderService.js';
import { sendLeadAuditEmail } from '../services/emailService.js';
import { auditLeadWebsite, createLeadAuditPdf } from '../services/websiteAuditService.js';

function buildFilter(query) {
  const filter = {};
  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.source && query.source !== 'all') filter.source = query.source;
  if (query.industry) filter.category = new RegExp(query.industry, 'i');
  if (query.country) filter.country = new RegExp(query.country, 'i');
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.minReviews) filter.reviewCount = { ...(filter.reviewCount || {}), $gte: Number(query.minReviews) };
  if (query.maxReviews) filter.reviewCount = { ...(filter.reviewCount || {}), $lte: Number(query.maxReviews) };
  if (query.minWebsiteScore) filter['websiteAudit.websiteHealthScore'] = { $gte: Number(query.minWebsiteScore) };
  if (query.minLeadScore) filter['websiteAudit.leadScore'] = { $gte: Number(query.minLeadScore) };
  if (query.search) filter.$text = { $search: query.search };
  return filter;
}

export const listLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find(buildFilter(req.query)).sort('-createdAt').limit(300);
  res.json(leads);
});

export const leadAnalytics = asyncHandler(async (req, res) => {
  const [total, byStatus, bySource, audited, opened, clicked, replied, interested, closed] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    Lead.countDocuments({ 'websiteAudit.auditedAt': { $exists: true } }),
    Lead.countDocuments({ 'outreach.openedAt': { $exists: true } }),
    Lead.countDocuments({ 'outreach.clickedAt': { $exists: true } }),
    Lead.countDocuments({ status: 'replied' }),
    Lead.countDocuments({ status: 'interested' }),
    Lead.countDocuments({ status: { $in: ['closed', 'won'] } })
  ]);
  res.json({ total, byStatus, bySource, audited, opened, clicked, replied, interested, closed });
});

export const createLead = asyncHandler(async (req, res) => {
  const body = req.body;
  const socialLinks = Array.isArray(body.socialLinks)
    ? body.socialLinks
    : String(body.socialLinks || '').split('\n').map((item) => item.trim()).filter(Boolean);
  const tags = Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || '').split(',').map((item) => item.trim()).filter(Boolean);
  const analysis = analyzeLeadPainPoints({
    businessName: body.businessName,
    category: body.category,
    reviews: body.reviews || [],
    offering: body.offering
  });
  const outreach = generateOutreachEmail({ ...body, socialLinks, tags, ...analysis }, body.offering);
  const contactabilityScore = calculateContactabilityScore({ ...body, socialLinks, tags, ...analysis });
  const socialProfileScore = calculateSocialProfileScore({ ...body, socialLinks });
  const lead = await Lead.create({ ...body, socialLinks, tags, ...analysis, ...outreach, contactabilityScore, socialProfileScore });
  res.status(201).json(lead);
});

export const searchGoogleLeads = asyncHandler(async (req, res) => {
  const { businessType, location, limit, offering } = req.body;
  if (!businessType || !location) {
    res.status(400);
    throw new Error('Business type and location are required.');
  }

  const found = await searchGooglePlaces({ businessType, location, limit, offering });
  const leads = [];
  let created = 0;

  for (const item of found) {
    const query = item.googlePlaceId
      ? { googlePlaceId: item.googlePlaceId }
      : { businessName: item.businessName, address: item.address };
    const existing = await Lead.findOne(query);
    if (existing) {
      existing.set({ ...item, status: existing.status, notes: existing.notes });
      await existing.save();
      leads.push(existing);
    } else {
      const lead = await Lead.create(item);
      created += 1;
      leads.push(lead);
    }
  }

  res.status(201).json({ created, leads });
});

function recomputeLeadScores(lead) {
  lead.contactabilityScore = calculateContactabilityScore(lead);
  lead.socialProfileScore = calculateSocialProfileScore(lead);
  if (lead.websiteAudit?.leadScore) {
    lead.tags = [...new Set([...(lead.tags || []), lead.websiteAudit.leadScore >= 70 ? 'hot lead' : 'audit-ready'])];
  }
}

export const auditLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found.' });
  const audit = await auditLeadWebsite(lead);
  lead.websiteAudit = audit;
  lead.painPoints = [...new Set([...(lead.painPoints || []), ...(audit.priorityIssues || [])])].slice(0, 10);
  const outreach = generateOutreachEmail(lead, req.body?.offering);
  lead.outreachEmailSubject = outreach.outreachEmailSubject;
  lead.outreachEmailBody = `${outreach.outreachEmailBody}\n\nAudit snapshot:\n- Website health: ${audit.websiteHealthScore}/100\n- SEO: ${audit.seoScore}/100\n- Performance: ${audit.performanceScore}/100\n- Conversion: ${audit.conversionScore}/100\n\nTop recommendation: ${audit.recommendations?.[0] || 'Improve website trust, speed, SEO and lead capture.'}`;
  lead.status = audit.leadScore >= 70 ? 'qualified' : lead.status;
  recomputeLeadScores(lead);
  await lead.save();
  res.json(lead);
});

export const bulkAuditLeads = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.body.limit || 5), 20);
  const leads = await Lead.find({ website: { $nin: ['', null] }, 'websiteAudit.auditedAt': { $exists: false } }).sort('-contactabilityScore -createdAt').limit(limit);
  const results = [];
  for (const lead of leads) {
    try {
      const audit = await auditLeadWebsite(lead);
      lead.websiteAudit = audit;
      lead.painPoints = [...new Set([...(lead.painPoints || []), ...(audit.priorityIssues || [])])].slice(0, 10);
      lead.status = audit.leadScore >= 70 ? 'qualified' : lead.status;
      recomputeLeadScores(lead);
      await lead.save();
      results.push({ id: lead._id, businessName: lead.businessName, ok: true, leadScore: audit.leadScore });
    } catch (error) {
      results.push({ id: lead._id, businessName: lead.businessName, ok: false, message: error.message });
    }
  }
  res.json({ audited: results.filter((item) => item.ok).length, results });
});

export const updateLead = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (typeof body.socialLinks === 'string') body.socialLinks = body.socialLinks.split('\n').map((item) => item.trim()).filter(Boolean);
  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((item) => item.trim()).filter(Boolean);
  if (['phone', 'email', 'website', 'googleMapsUrl', 'bbbProfileUrl', 'bbbRating', 'bbbAccredited', 'socialLinks', 'painPoints'].some((key) => key in body)) {
    const existing = await Lead.findById(req.params.id);
    body.contactabilityScore = calculateContactabilityScore({ ...(existing?.toObject() || {}), ...body });
    body.socialProfileScore = calculateSocialProfileScore({ ...(existing?.toObject() || {}), ...body });
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found.');
  }
  res.json(lead);
});

export const downloadAuditPdf = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found.' });
  if (!lead.websiteAudit?.auditedAt) {
    lead.websiteAudit = await auditLeadWebsite(lead);
    await lead.save();
  }
  const pdf = createLeadAuditPdf(lead);
  lead.websiteAudit.reportPdfGeneratedAt = new Date();
  await lead.save({ validateBeforeSave: false });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${String(lead.businessName || 'lead').replace(/[^a-z0-9-]+/gi, '-')}-audit.pdf"`);
  res.send(pdf);
});

export const sendLeadOutreach = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found.' });
  if (!lead.email) return res.status(400).json({ message: 'Lead needs a verified email before outreach can be sent.' });
  if (!lead.websiteAudit?.auditedAt && lead.website) {
    lead.websiteAudit = await auditLeadWebsite(lead);
  }
  const pdf = createLeadAuditPdf(lead);
  try {
    const result = await sendLeadAuditEmail({ lead, pdfBuffer: pdf });
    lead.outreach = { ...(lead.outreach || {}), sentAt: new Date(), lastError: result?.reason || '' };
    lead.status = 'contacted';
    await lead.save({ validateBeforeSave: false });
    res.json({ message: result?.skipped ? 'Email prepared but SMTP is not configured.' : 'Audit outreach email sent.', result, lead });
  } catch (error) {
    lead.outreach = { ...(lead.outreach || {}), lastError: error.message };
    await lead.save({ validateBeforeSave: false });
    res.status(500);
    throw error;
  }
});

export const bulkSendOutreach = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.body.limit || 5), 20);
  const leads = await Lead.find({
    email: { $nin: ['', null] },
    status: { $in: ['new', 'qualified'] },
    'websiteAudit.auditedAt': { $exists: true }
  }).sort('-websiteAudit.leadScore -contactabilityScore').limit(limit);
  const results = [];
  for (const lead of leads) {
    try {
      const pdf = createLeadAuditPdf(lead);
      const result = await sendLeadAuditEmail({ lead, pdfBuffer: pdf });
      lead.outreach = { ...(lead.outreach || {}), sentAt: new Date(), lastError: result?.reason || '' };
      lead.status = 'contacted';
      await lead.save({ validateBeforeSave: false });
      results.push({ id: lead._id, businessName: lead.businessName, ok: true, skipped: Boolean(result?.skipped) });
    } catch (error) {
      lead.outreach = { ...(lead.outreach || {}), lastError: error.message };
      await lead.save({ validateBeforeSave: false });
      results.push({ id: lead._id, businessName: lead.businessName, ok: false, message: error.message });
    }
  }
  res.json({ sent: results.filter((item) => item.ok).length, results });
});

function escapeCsv(value = '') {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function escapePdfText(value = '') {
  return String(value ?? '').replace(/[\\()]/g, '\\$&').replace(/\r?\n/g, ' ');
}

function createSimplePdf(leads) {
  const lines = ['Weblix Lead Finder Export', `Generated: ${new Date().toLocaleString()}`, ''];
  leads.slice(0, 80).forEach((lead, index) => {
    lines.push(`${index + 1}. ${lead.businessName} | ${lead.phone || 'No phone'} | ${lead.website || 'No website'} | Score ${lead.contactabilityScore || 0}`);
    if (lead.address) lines.push(`   ${lead.address}`);
  });

  const content = ['BT', '/F1 11 Tf', '40 790 Td'];
  lines.forEach((line, index) => {
    if (index) content.push('0 -16 Td');
    content.push(`(${escapePdfText(line).slice(0, 105)}) Tj`);
  });
  content.push('ET');
  const stream = content.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`
  ];
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

export const exportLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find(buildFilter(req.query)).sort('-createdAt').limit(1000);
  const format = req.query.format === 'pdf' ? 'pdf' : 'csv';

  if (format === 'pdf') {
    const pdf = createSimplePdf(leads);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="weblix-leads.pdf"');
    return res.send(pdf);
  }

  const headers = ['Business', 'Source', 'Status', 'Contactability Score', 'Social Score', 'Category', 'Phone', 'Email', 'Website', 'Social Links', 'Address', 'Maps URL', 'BBB URL', 'Pain Points'];
  const rows = leads.map((lead) => [
    lead.businessName,
    lead.source,
    lead.status,
    lead.contactabilityScore,
    lead.socialProfileScore,
    lead.category,
    lead.phone,
    lead.email,
    lead.website,
    (lead.socialLinks || []).join(' | '),
    lead.address,
    lead.googleMapsUrl,
    lead.bbbProfileUrl,
    (lead.painPoints || []).join(' | ')
  ].map(escapeCsv).join(','));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="weblix-leads.csv"');
  res.send([headers.map(escapeCsv).join(','), ...rows].join('\n'));
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found.');
  }
  res.json({ message: 'Lead deleted.' });
});

export const trackLeadOpen = asyncHandler(async (req, res) => {
  await Lead.findByIdAndUpdate(req.params.id, {
    $inc: { 'outreach.openCount': 1 },
    $set: { 'outreach.openedAt': new Date(), status: 'opened' }
  });
  const pixel = Buffer.from('R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.end(pixel);
});

export const trackLeadClick = asyncHandler(async (req, res) => {
  const target = String(req.query.url || process.env.CLIENT_URL || 'http://localhost:5173');
  await Lead.findByIdAndUpdate(req.params.id, {
    $inc: { 'outreach.clickCount': 1 },
    $set: { 'outreach.clickedAt': new Date(), status: 'interested' }
  });
  res.redirect(target);
});
