import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { configurePassport } from './config/passport.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { blogRoutes } from './routes/blogRoutes.js';
import { catalogRoutes } from './routes/catalogRoutes.js';
import { contactRoutes } from './routes/contactRoutes.js';
import { downloadRoutes } from './routes/downloadRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';
import { siteRoutes } from './routes/siteRoutes.js';
import { trendRoutes } from './routes/trendRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { Blog } from './models/Blog.js';
import { stripeWebhook } from './controllers/orderController.js';
import { trackLeadClick, trackLeadOpen } from './controllers/leadController.js';
import { clientUrl } from './config/urls.js';

export function createApp() {
  const app = express();
  configurePassport();

  app.set('trust proxy', 1);
  const allowedOrigins = [
    clientUrl(),
    ...(process.env.CLIENT_URLS || '').split(',').map((origin) => origin.trim()).filter(Boolean)
  ];

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
  app.use(compression());
  app.use(morgan('dev'));
  app.post('/api/orders/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use('/uploads', (req, res, next) => {
    if (/\.zip($|\?)/i.test(req.path)) {
      return res.status(403).json({ message: 'ZIP files are protected. Please download from your paid dashboard.' });
    }
    next();
  }, express.static('uploads'));

  app.get('/api/health', (req, res) => res.json({ ok: true, service: 'weblix-api' }));
  app.get('/api/leads/track/open/:id.png', trackLeadOpen);
  app.get('/api/leads/track/click/:id', trackLeadClick);
  app.get('/robots.txt', (req, res) => {
    const base = clientUrl();
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  });
  app.get('/sitemap.xml', async (req, res, next) => {
    try {
      const base = clientUrl();
      const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');
      const urls = ['/', '/about', '/pricing', '/templates', '/blog', '/contact', ...blogs.map((blog) => `/blog/${blog.slug}`)];
      res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${base}${url}</loc><changefreq>weekly</changefreq><priority>${url.startsWith('/blog/') ? '0.8' : '0.9'}</priority></url>`).join('')}</urlset>`);
    } catch (error) {
      next(error);
    }
  });
  app.get('/rss.xml', async (req, res, next) => {
    try {
      const base = clientUrl();
      const blogs = await Blog.find({ status: 'published' }).sort('-publishedAt -createdAt').limit(50);
      res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Weblix Blog</title><link>${base}/blog</link><description>AI website builder, SEO, SaaS and web development articles.</description>${blogs.map((blog) => `<item><title><![CDATA[${blog.title}]]></title><link>${base}/blog/${blog.slug}</link><description><![CDATA[${blog.excerpt || ''}]]></description><pubDate>${new Date(blog.publishedAt || blog.createdAt).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
    } catch (error) {
      next(error);
    }
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api', catalogRoutes);
  app.use('/api', siteRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/trends', trendRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/downloads', downloadRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
