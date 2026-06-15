import 'dotenv/config';
import cron from 'node-cron';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ensureAdminUser } from './services/adminBootstrapService.js';
import { createTrendingDrafts, publishDueScheduledPosts } from './services/trendingBlogService.js';

const port = process.env.PORT || 5000;

await connectDB();
await ensureAdminUser();
const app = createApp();

cron.schedule('0 8 * * *', () => {
  createTrendingDrafts().catch((error) => console.error('Trend draft failed', error));
}, {
  timezone: process.env.TREND_BLOG_TIMEZONE || 'Asia/Kolkata'
});

cron.schedule('*/15 * * * *', () => {
  publishDueScheduledPosts().catch((error) => console.error('Scheduled publish failed', error));
});

app.listen(port, () => console.log(`Weblix API running on ${port}`));
