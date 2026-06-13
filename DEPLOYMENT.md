# Weblix Live Deployment

Target domain:

```text
https://weblixtheme.com
https://www.weblixtheme.com
```

## 1. Backend on Render

Create a new Render Blueprint from `render.yaml`, or create a Web Service manually:

```text
Root Directory: server
Build Command: npm install
Start Command: npm run start
Health Check Path: /api/health
```

Required environment variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://weblixtheme.com
CLIENT_URLS=https://weblixtheme.com,https://www.weblixtheme.com
API_PUBLIC_URL=https://your-render-backend-url.onrender.com
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_NAME=Weblix Admin
ADMIN_EMAIL=mandanyadav900@gmail.com
ADMIN_PASSWORD=your_secure_admin_password

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_PLACES_API_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Weblix Website Builder <hello@weblixtheme.com>
LEAD_TO_EMAIL=mandanyadav900@gmail.com

TREND_BLOG_DAILY_LIMIT=2
TREND_BLOG_GEO=US
TREND_BLOG_STATUS=published
TREND_BLOG_TIMEZONE=Asia/Kolkata
AUDIT_MAX_PAGES=25
```

After backend deploy:

```bash
npm run seed
npm run check:production-data
```

Important: `server/uploads` must be backed by persistent storage. If Render disk starts empty, upload the builder ZIP/templates again from the admin dashboard after deploy.

## 2. Frontend on Vercel

Create a Vercel project for the `client` folder:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
Framework: Vite
```

Frontend environment variables:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## 3. Domain DNS

In Vercel, add:

```text
weblixtheme.com
www.weblixtheme.com
```

At the domain provider, add:

```text
Type: A
Name: @
Value: 76.76.21.21
```

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 4. OAuth Redirects

Google OAuth:

```text
Authorized JavaScript origins:
https://weblixtheme.com
https://www.weblixtheme.com

Authorized redirect URI:
https://your-render-backend-url.onrender.com/api/auth/google/callback
```

GitHub OAuth:

```text
Homepage URL:
https://weblixtheme.com

Authorization callback URL:
https://your-render-backend-url.onrender.com/api/auth/github/callback
```

## 5. Final Live Checks

Check:

```text
https://weblixtheme.com
https://weblixtheme.com/pricing
https://weblixtheme.com/templates
https://weblixtheme.com/blog
https://weblixtheme.com/login
https://your-render-backend-url.onrender.com/api/health
```

Then test:

- Admin login
- Product checkout
- Template checkout
- Protected ZIP download
- Contact form
- Request custom website form
- Blog publish from dashboard
- Google/GitHub login
- Lead finder and audit tools
