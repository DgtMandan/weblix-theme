import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function paletteSeed(text = '') {
  return [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function originalSaasSvg({ keyword, title, width = 1200, height = 630 }) {
  const seed = paletteSeed(keyword);
  const circles = Array.from({ length: 10 }, (_, index) => {
    const x = (seed * (index + 3) * 37) % width;
    const y = (seed * (index + 5) * 29) % height;
    const r = 34 + ((seed + index * 17) % 96);
    const opacity = 0.08 + ((index % 4) * 0.035);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#4F7BFF" opacity="${opacity.toFixed(2)}"/>`;
  }).join('');

  const safeKeyword = escapeXml(keyword);
  const safeTitle = escapeXml(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#06134A"/>
      <stop offset="45%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#2155FF"/>
    </linearGradient>
    <linearGradient id="card" x1="0" x2="1">
      <stop offset="0%" stop-color="#2155FF"/>
      <stop offset="100%" stop-color="#4F7BFF"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="18" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${width}" height="${height}" rx="46" fill="url(#bg)"/>
  ${circles}
  <g transform="translate(70 70)">
    <rect x="0" y="0" width="1060" height="490" rx="34" fill="#101010" opacity="0.72" stroke="#4F7BFF" stroke-opacity="0.3"/>
    <rect x="42" y="44" width="170" height="16" rx="8" fill="#4F7BFF"/>
    <rect x="42" y="88" width="420" height="18" rx="9" fill="#FFFFFF" opacity="0.18"/>
    <rect x="42" y="132" width="520" height="18" rx="9" fill="#FFFFFF" opacity="0.12"/>
    <g transform="translate(690 96)" filter="url(#glow)">
      <rect x="0" y="0" width="230" height="230" rx="48" fill="url(#card)"/>
      <path d="M70 122h90M84 84h62M84 160h62" stroke="#fff" stroke-width="20" stroke-linecap="round"/>
    </g>
    <text x="42" y="250" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="800">${safeKeyword}</text>
    <text x="42" y="312" fill="#B9C8FF" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="600">Original Weblix AI trend visual</text>
    <rect x="42" y="374" width="220" height="54" rx="16" fill="#2155FF"/>
    <text x="82" y="409" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">Read the guide</text>
  </g>
</svg>`;
}

export function generateOriginalBlogImages({ slug, keyword, title }) {
  const dir = path.join('uploads', 'generated');
  ensureDir(dir);
  const safeSlug = slugify(slug || title || keyword || `blog-${Date.now()}`, { lower: true, strict: true });
  const imagePrompt = `Create an original, copyright-safe modern SaaS blue-theme abstract blog image for: ${keyword}. No stock photos, no copied brand assets, no copyrighted characters.`;
  const alt = `${keyword} Weblix AI website builder trend illustration`;
  const featuredPath = path.join(dir, `${safeSlug}-featured.svg`);
  const ogPath = path.join(dir, `${safeSlug}-og.svg`);
  fs.writeFileSync(featuredPath, originalSaasSvg({ keyword, title, width: 1200, height: 720 }));
  fs.writeFileSync(ogPath, originalSaasSvg({ keyword, title, width: 1200, height: 630 }));
  return {
    featuredImage: featuredPath,
    ogImage: ogPath,
    featuredImagePrompt: imagePrompt,
    imageAlt: alt,
    ogImageAlt: alt
  };
}
