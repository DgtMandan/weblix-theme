# Weblix Website Builder

Full-stack MERN SaaS for selling the Weblix Website Builder ZIP, paid template ZIP downloads, blogs, OAuth login, payments, user dashboard, and admin dashboard.

## Quick Start

```bash
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Notes

- Add real MongoDB Atlas, OAuth, Stripe/Razorpay keys in env files.
- Uploads are stored locally for development under `server/uploads`. For production, replace storage with S3/R2/Cloudinary using the same controller boundaries.
- Pixel-perfect design implementation can now be applied page-by-page when Figma URLs or screenshots are provided.
