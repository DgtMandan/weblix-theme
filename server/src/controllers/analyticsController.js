import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { Blog } from '../models/Blog.js';
import { Template } from '../models/Template.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const trackEvent = asyncHandler(async (req, res) => {
  const type = String(req.body.type || '').trim();
  if (!type) return res.status(400).json({ message: 'Event type is required.' });
  await AnalyticsEvent.create({
    type,
    path: req.body.path,
    title: req.body.title,
    referrer: req.body.referrer,
    device: req.body.device,
    metadata: req.body.metadata || {},
    userAgent: req.get('user-agent'),
    ip: req.ip
  });
  res.status(201).json({ ok: true });
});

function groupBy(items, key, limit = 10) {
  const map = items.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
}

export const analyticsSummary = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - Number(req.query.days || 30) * 24 * 60 * 60 * 1000);
  const [events, blogs, templates, paidOrders] = await Promise.all([
    AnalyticsEvent.find({ createdAt: { $gte: since } }).sort('-createdAt').limit(2000),
    Blog.find().select('title slug views clicks seoScore geoScore focusKeyword status').sort('-views').limit(20),
    Template.find().select('name slug price isActive').sort('-createdAt').limit(20),
    Order.find({ status: 'paid', createdAt: { $gte: since } })
  ]);
  res.json({
    totals: {
      events: events.length,
      pageViews: events.filter((item) => item.type === 'page_view').length,
      aiOpens: events.filter((item) => item.type === 'ai_agent_open').length,
      checkoutStarts: events.filter((item) => item.type === 'checkout_start').length,
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0)
    },
    topPages: groupBy(events.filter((item) => item.type === 'page_view'), 'path'),
    topEvents: groupBy(events, 'type'),
    devices: groupBy(events, 'device'),
    blogs,
    templates,
    recentEvents: events.slice(0, 30)
  });
});
