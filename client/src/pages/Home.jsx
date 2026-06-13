import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Copy, CreditCard, Download, FileArchive, KeyRound, Layers, Mail, MousePointerClick, Play, ShieldCheck, WandSparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../utils/seo.jsx';
import { api, assetUrl } from '../services/api.js';
import { formatUsd } from '../utils/currency.js';
import builderDashboardImage from '../assets/builder-dashboard.png';
import builderOneClickImage from '../assets/builder-one-click-import.png';
import builderFrontendImage from '../assets/builder-frontend-enabled.png';
import builderAddSectionImage from '../assets/builder-add-section.png';
import builderRowLayoutImage from '../assets/builder-row-layout.png';
import builderModuleLibraryImage from '../assets/builder-module-library.png';
import builderThemeImage from '../assets/builder-theme-admin.png';
import builderLibraryImage from '../assets/builder-library-admin.png';

const pageCards = [
  ['Home', 'AI-Powered Analytics Fuel Your Success!'],
  ['Features', 'Empowering Success with AI technology'],
  ['About', 'Team work makes the dream work'],
  ['Shop', 'Insights in the World of Analytics'],
  ['Product Details', 'Support us by buying something'],
  ['Cart', 'Secure template cart'],
  ['Blog', 'Insights in the World of Analytics'],
  ['Blog Details', 'One idea, explained clearly'],
  ['404 Page', '404'],
  ['Checkout', 'Payment details'],
  ['Contact', 'Let us know what you think'],
  ['Password', 'This page is protected']
];

const importSteps = [
  ['Prepare one website folder', 'Keep only clean static HTML, CSS, JS, images, fonts, and media together. Do not include template-parts, assets/generated, wp-content, node_modules, or old builder output.'],
  ['ZIP the folder and import', 'Use One-Click Site Import. Root index.html becomes the Home/front page, and every other .html or .htm file becomes a WordPress Template Page.'],
  ['Review generated files', 'The importer writes template files and copies local assets automatically. If a referenced asset is missing, check the Builder Health Log.'],
  ['Edit and publish normally', 'Open the created WordPress page with the Weblix Builder. The original layout assets stay attached to that page.']
];

const importNotes = [
  'Root index.html imports as Home/front page. Nested folders like services/index.html import as Services.',
  'External CDN links remain external. Local files inside the ZIP are copied into the theme.',
  'If a page slug already exists, the importer updates that WordPress page instead of creating a duplicate.',
  'Do not upload ZIP files that contain template-parts, assets/generated, wp-content, node_modules, or previous imports.'
];

const fileStructure = `website-export/
  index.html
  about.html
  contact.html
  services/
    index.html
    service-name.html
  assets/
    css/
      styles.css
      responsive.css
    js/
      app.js
    images/
      hero.jpg
      logo.png
      all-section-images.png
    fonts/
      brand.woff2

Creates:
  template-parts/pages/home.php
  template-parts/pages/about.php
  template-parts/pages/services.php
  template-parts/pages/service-name.php
  assets/generated/home.css
  assets/generated/home.js
  template-parts/pages/{import-name}/assets/...`;

const codexFolderPrompt = `Prompt for Codex / AI Folder Structure for Weblix

Use this prompt when you want Codex, ChatGPT, Claude, or any AI coding tool to create a full multi-page website ZIP that imports correctly into Weblix One-Click Site Import.

Create a full static multi-page website export for Weblix Template Pages. The final website must import pixel-perfect in Weblix Builder with no missing images, CSS, JavaScript, fonts, media, spacing, animations, or layout differences.

Design style:
- Dark premium SaaS theme.
- Body/background color: #0d0d0d.
- Primary blue: #2155FF.
- Light blue/hover color: #4F7BFF.
- Dark blue: #06134A.
- Text dark: #0A0F2C.
- White: #FFFFFF.
- Use modern SaaS typography, preferably Inter or Poppins.
- Heading font-weight should be around 500.
- Buttons must have 10px border-radius.
- Buttons should use Weblix blue, smooth hover color, and clean premium shadows.
- Use responsive sections for desktop, tablet, and mobile.
- Use real images or included local assets where needed. Avoid broken placeholders.
- Keep animations subtle, smooth, and production-ready.

Return one clean ZIP-ready folder. The folder name must be website-export, and it must follow this exact structure:

website-export/
  index.html
  about.html
  services/
    index.html
    service-name.html
  contact.html
  assets/
    css/
      styles.css
      responsive.css
    js/
      app.js
    images/
      logo.png
      hero.jpg
      section-images...
    fonts/
      brand-font.woff2 optional

Required rules:
- ZIP the website-export folder itself, not only the files inside it.
- Every page must be a real .html file.
- Root index.html is required and becomes the WordPress Home/front page.
- Folder index files like services/index.html become pages named from the folder.
- Use relative links only, such as assets/css/styles.css, assets/js/app.js, and assets/images/hero.jpg.
- Link pages with relative HTML URLs, such as about.html, contact.html, services/, or services/service-name.html.
- Keep all shared CSS in assets/css/styles.css and responsive rules in assets/css/responsive.css.
- Use page-specific CSS only when necessary, and link it from that page with a relative path.
- Keep all shared JavaScript in assets/js/app.js and make it safe if elements are missing on some pages.
- Include every image, icon, SVG, video, font, PDF, and media file referenced anywhere inside the ZIP folder.
- Third-party image/video URLs are allowed when they are public HTTPS URLs, for example Unsplash or a CDN. Keep them unchanged if you want the imported page to load those remote images directly.
- CSS background images must use paths relative to the CSS file, for example url("../images/hero.jpg").
- srcset, poster, data-src, data-bg, data-background, and JavaScript image paths must all point to included files.
- Do not include WordPress PHP, template-parts/, wp-content/, assets/generated/, old builder output, shortcodes, node_modules, source maps, hidden Mac folders, Figma/PSD source files, or unused large media.
- Do not use absolute local paths, /Users/... paths, file:// URLs, blob URLs, or root-only /assets/... paths.
- External CDNs are allowed for public libraries, fonts, and public image/video URLs that are intentionally external. Local design assets must be inside the ZIP.
- Match the supplied screenshot/Figma/reference exactly on desktop, tablet, and mobile: colors, typography, section width, image crop, spacing, animation, footer, and navigation.
- Make the design work when opened directly from index.html before import.
- Use semantic HTML, accessible alt text, responsive images, clean CSS variables, and no console errors.
- Do not depend on a build step. The site must work as plain static HTML/CSS/JS.

Final checklist before answering:
- List the complete file tree.
- Confirm index.html exists and is the intended home page.
- Confirm no template-parts/, assets/generated/, wp-content/, node_modules/, or hidden Mac files are included.
- Confirm every src, href, srcset, poster, data-bg, JavaScript asset string, and CSS url(...) resolves to a file in the ZIP or a valid public HTTPS URL.
- Confirm each HTML page opens directly in a browser and visually matches the reference.
- Tell me to ZIP the website-export folder itself and upload it to One-Click Site Import.`;

const included = [
  ['Design pages visually with full builder control', 'Create and refine WordPress pages with sections, rows, columns, modules, spacing, responsive settings, and reusable layouts without editing theme files manually.', MousePointerClick],
  ['Import complete websites from clean ZIP exports', 'Turn static HTML, CSS, JavaScript, images, and fonts into editable Weblix template pages while keeping assets organized and page structure intact.', Layers],
  ['Reuse layouts across your website system', 'Save headers, footers, sections, rows, and content blocks to the library, then apply them across builder pages, template pages, and theme layouts.', WandSparkles]
];

const builderMotionFeatures = [
  {
    title: 'Shape pages with a live visual workspace',
    text: 'Adjust sections, columns, module spacing, backgrounds, and responsive views from one focused builder interface.',
    image: builderFrontendImage
  },
  {
    title: 'Insert ready sections when the page needs more',
    text: 'Open the section picker, search layout types, and place structured content blocks without rebuilding the page from scratch.',
    image: builderAddSectionImage
  },
  {
    title: 'Choose row layouts for clean structure',
    text: 'Start with one, two, three, four, or mixed-width columns so each new area keeps a predictable responsive grid.',
    image: builderRowLayoutImage
  },
  {
    title: 'Add modules for content, media, and commerce',
    text: 'Drop in text, headings, images, buttons, code blocks, blog feeds, and WooCommerce modules from the library.',
    image: builderModuleLibraryImage
  }
];

const homeFaqs = [
  ['Can Weblix import a full static website ZIP?', 'Yes. Prepare a clean website-export folder with HTML, CSS, JavaScript, images, fonts, and media. Weblix can turn those files into editable template pages.'],
  ['Will the imported pages stay editable in the builder?', 'Yes. Generated pages are opened through the Weblix Builder so you can edit content, spacing, sections, rows, columns, modules, and responsive settings.'],
  ['Can I sell template ZIP files from the site?', 'Yes. Add a template from the admin dashboard with thumbnail, preview images, price, and ZIP file. Buyers can pay and download the exact ZIP securely.'],
  ['Does the builder support reusable layouts?', 'Yes. You can save headers, footers, sections, rows, and modules into the library, then reuse them across builder pages and template layouts.'],
  ['What happens if a customer buys a template?', 'After successful checkout, the order is stored in the dashboard and the protected ZIP download becomes available automatically.'],
  ['Can blogs and templates added from admin show on the frontend?', 'Yes. Admin-created templates and published blogs are pulled from the backend APIs and appear on the related frontend sections automatically.']
];

const homePricingPlans = [
  {
    name: 'Weblix Builder Pro',
    price: '$59',
    period: 'one-time',
    description: 'Get the core Weblix Website Builder ZIP with admin dashboard, template import workflow, product pages, and secure download flow.',
    features: ['Builder ZIP package', 'One-click import workflow', 'Admin dashboard tools', 'Protected customer downloads'],
    highlighted: true,
    action: 'Buy Builder',
    to: '/pricing'
  },
  {
    name: 'Template Marketplace',
    price: '$19+',
    period: 'per template',
    description: 'Buy premium page template ZIP files from the marketplace and keep every purchase available inside your dashboard.',
    features: ['Template ZIP downloads', 'Preview images and demos', 'Order history', 'License and download access'],
    action: 'Browse Templates',
    to: '/templates'
  }
];

function MiniBrowser({ title, large = false, tone = 'dark' }) {
  return (
    <div className={`overflow-hidden rounded-[14px] border border-white/10 ${tone === 'dark' ? 'bg-[#0A0F2C]' : 'bg-[#0d0d0d]'} shadow-[0_18px_60px_rgba(6,19,74,0.35)]`}>
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F7BFF]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
        <span className="rounded-full bg-[#2155FF] px-2 py-0.5 text-[9px] font-black text-white">BUY</span>
      </div>
      <div className={`${large ? 'min-h-56 p-5' : 'min-h-36 p-4'}`}>
        <h3 className={`${large ? 'text-3xl' : 'text-base'} max-w-[80%] font-black leading-tight text-white`}>{title}</h3>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[42, 68, 34, 84].map((height, index) => (
            <div key={index} className="flex h-20 items-end rounded-md bg-white/5 px-1">
              <span style={{ height }} className="block w-full rounded-t-md bg-[#4F7BFF]" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 w-2/3 rounded-full bg-white/12" />
        <div className="mt-2 h-2 w-1/2 rounded-full bg-white/8" />
      </div>
    </div>
  );
}

function VideoCard({ title, eyebrow, description, variant = 'website', delay = 0, onVideoClick }) {
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const steps = variant === 'website'
    ? ['Upload ZIP', 'Create Pages', 'Edit Builder']
    : ['Drag', 'Style', 'Export'];

  async function copyFileStructure() {
    await navigator.clipboard?.writeText(fileStructure);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function copyPrompt() {
    await navigator.clipboard?.writeText(codexFolderPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay }}
      className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#050505] shadow-[0_26px_80px_rgba(0,0,0,0.38)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font900 uppercase tracking-[0.18em] text-[#4F7BFF]">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-black text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onVideoClick?.({ title, variant })} className="hidden min-h-11 items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 text-sm font900 text-white shadow-[0_14px_34px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-[#4F7BFF]/50 hover:bg-[#2155FF] md:flex">
            Know more
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </button>
          <button type="button" onClick={() => onVideoClick?.({ title, variant })} className="grid h-12 w-12 place-items-center rounded-full bg-[#2155FF] text-white shadow-[0_0_40px_rgba(33,85,255,0.42)] transition group-hover:scale-105 group-hover:bg-[#4F7BFF]">
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden bg-[#0A0F2C] ${variant === 'website' ? 'min-h-[1380px] lg:min-h-[1080px]' : 'min-h-[620px] lg:min-h-[560px]'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(79,123,255,0.28),transparent_30%),linear-gradient(135deg,#06134A,#0d0d0d_62%)]" />
        <div className="absolute left-5 right-5 top-5 flex items-center gap-2 rounded-[12px] border border-white/10 bg-black/32 p-2 backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4F7BFF]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="ml-3 h-3 flex-1 rounded-full bg-white/10" />
        </div>

        {variant === 'website' ? (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-x-4 bottom-6 top-20 grid gap-4 rounded-[18px] border border-white/10 bg-white/8 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mb-4 overflow-hidden rounded-[16px] border border-white/10 bg-[#0d0d0d]/65 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
                <img src={builderOneClickImage} alt="Weblix Template Pages one-click import screen" className="h-56 w-full object-cover object-top lg:h-52" loading="lazy" />
              </div>
              <div className="mb-2">
                <p className="text-[10px] font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Instructions & File Structure</p>
                <h4 className="mt-1 text-2xl font900 leading-tight text-white">One-click static website import workflow</h4>
                <p className="mt-2 text-sm font700 leading-6 text-white/68">Use this guide when importing a full static website export or preparing template files from your code editor.</p>
                <button type="button" onClick={copyPrompt} className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#4F7BFF]/35 bg-[#2155FF] px-4 py-3 text-sm font900 text-white shadow-[0_14px_40px_rgba(33,85,255,0.24)] transition hover:bg-[#4F7BFF]">
                  {promptCopied ? <Check size={16} /> : <Copy size={16} />}
                  {promptCopied ? 'Weblix prompt copied' : 'Copy Weblix Codex / AI prompt'}
                </button>
              </div>
              <div className="mt-5 grid gap-3">
                {importSteps.map(([stepTitle, text], index) => (
                  <div key={stepTitle} className="flex gap-4 rounded-[16px] border border-white/12 bg-white/10 p-4 shadow-[0_10px_34px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#2155FF] text-base font900 text-white shadow-[0_10px_24px_rgba(33,85,255,0.32)]">{index + 1}</span>
                    <div>
                      <h4 className="text-base font900 leading-5 text-white">{stepTitle}</h4>
                      <p className="mt-2 text-sm font700 leading-6 text-white/64">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[16px] border border-white/10 bg-[#0d0d0d]/70 p-4 backdrop-blur-md">
                <ul className="grid gap-3">
                  {importNotes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm font700 leading-6 text-white/62">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F7BFF]" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="min-h-0 overflow-hidden rounded-[16px] border border-white/10 bg-[#020b18]/94 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_18px_46px_rgba(0,0,0,0.32)] backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-[10px] font900 uppercase tracking-[0.16em] text-[#4F7BFF]">File structure</p>
                  <p className="mt-1 text-[11px] font800 text-white/42">Actual Weblix import/export format</p>
                </div>
                <button type="button" onClick={copyFileStructure} className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-xs font900 text-white transition hover:border-[#4F7BFF]/50 hover:bg-[#2155FF]">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="max-h-[690px] overflow-auto p-4 lg:max-h-[710px]">
                <pre className="whitespace-pre-wrap font-mono text-[12px] font800 leading-[1.75] text-[#ddecff]">{fileStructure}</pre>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="absolute inset-x-5 bottom-6 top-20 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <motion.div
              animate={{ scale: [1, 1.015, 1], y: [0, -6, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
              className="overflow-hidden rounded-[18px] border border-white/10 bg-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
            >
              <img src={builderFrontendImage} alt="Weblix frontend visual builder workspace" className="h-full w-full object-cover object-top" loading="lazy" />
            </motion.div>
            <div className="grid min-h-0 gap-3">
              {[
                ['Add Section', builderAddSectionImage],
                ['Row Layout', builderRowLayoutImage],
                ['Module Library', builderModuleLibraryImage]
              ].map(([label, image]) => (
                <div key={label} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]">
                  <img src={image} alt={`Weblix ${label} popup`} className="h-36 w-full object-cover object-top lg:h-full" loading="lazy" />
                  <p className="border-t border-white/10 px-3 py-2 text-xs font900 text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2155FF] text-[10px] font900">{index + 1}</span>
                <span className="hidden text-xs font800 text-white/58 sm:inline">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.span
              animate={{ width: ['18%', '92%', '18%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="block h-full rounded-full bg-gradient-to-r from-[#2155FF] to-[#4F7BFF]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4">
        <p className="text-sm font700 leading-6 text-white/50">{description}</p>
      </div>
    </motion.div>
  );
}

function TemplateShowcaseCard({ template, index }) {
  const type = template.tags?.includes('Physical') ? 'Physical' : 'Digital';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-[10px] bg-[#171717]">
        <span className="absolute left-4 top-4 z-10 rounded-[10px] border border-[#4F7BFF]/35 bg-[#0d0d0d]/72 px-3 py-1.5 text-[10px] font900 uppercase tracking-[0.12em] text-[#4F7BFF] backdrop-blur">
          From dashboard
        </span>
        <Link to={`/templates/${template.slug}`} className="block aspect-[1.32]">
          {template.thumbnail ? (
            <img src={assetUrl(template.thumbnail)} alt={template.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_72%_12%,#4F7BFF_0_22%,transparent_23%),linear-gradient(135deg,#06134A,#0d0d0d)] p-5">
              <MiniBrowser title={template.name} />
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-4 bottom-4 hidden gap-3 group-hover:flex">
          <Link
            to={`/templates/${template.slug}`}
            className="flex flex-1 items-center justify-center rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900 text-white shadow-[0_16px_40px_rgba(33,85,255,0.35)] transition hover:bg-[#4F7BFF]"
          >
            View ZIP
          </Link>
          <Link
            to="/templates"
            className="grid h-12 w-12 place-items-center rounded-[10px] border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-[#4F7BFF]"
            aria-label="More templates"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font900 text-[#4F7BFF]">{type} Template ZIP</p>
          <Link to={`/templates/${template.slug}`} className="text-lg font900 leading-tight text-white transition hover:text-[#4F7BFF]">{template.name}</Link>
          <p className="mt-2 line-clamp-2 text-sm font700 leading-6 text-white/42">{template.description}</p>
        </div>
        <span className="shrink-0 rounded-[10px] bg-[#2155FF]/14 px-3 py-2 text-sm font900 text-[#4F7BFF]">{formatUsd(template.price)}</span>
      </div>
    </motion.div>
  );
}

function VideoPopup({ video, onClose }) {
  if (!video) return null;
  const isImport = video.variant === 'website';
  const primaryImage = isImport ? builderOneClickImage : builderFrontendImage;
  const gallery = isImport
    ? [
        ['Dashboard', builderDashboardImage],
        ['Theme Builder', builderThemeImage],
        ['Library', builderLibraryImage]
      ]
    : [
        ['Add Section', builderAddSectionImage],
        ['Row Layout', builderRowLayoutImage],
        ['Module Library', builderModuleLibraryImage]
      ];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/78 px-4 py-8 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-[#050505] text-white shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Weblix video preview</p>
            <h2 className="mt-1 text-2xl font900">{video.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 transition hover:bg-[#2155FF]">
            <X size={20} />
          </button>
        </div>
        <div className="relative aspect-video overflow-hidden bg-[#06134A]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,123,255,0.34),transparent_32%),linear-gradient(135deg,#06134A,#0d0d0d_68%)]" />
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-6 grid gap-4 rounded-[20px] border border-white/10 bg-white/10 p-4 backdrop-blur-md md:grid-cols-[1.35fr_0.65fr]">
            <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#0d0d0d] shadow-[0_26px_80px_rgba(0,0,0,0.36)]">
              <img src={primaryImage} alt={video.title} className="h-full w-full object-cover object-top" />
            </div>
            <div className="grid gap-3">
              <p className="rounded-[12px] bg-[#0d0d0d]/75 p-4 text-sm font900 leading-6 text-[#4F7BFF]">
                {isImport ? 'One-click import, template page generation, and Weblix dashboard workflow.' : 'Frontend builder editing, section insertion, row layouts, and module library workflow.'}
              </p>
              {gallery.map(([label, image]) => (
                <div key={label} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#0d0d0d]">
                  <img src={image} alt={`Weblix ${label}`} className="h-24 w-full object-cover object-top" />
                  <p className="border-t border-white/10 px-3 py-2 text-xs font900 text-white/66">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-[#2155FF] text-white shadow-[0_0_70px_rgba(33,85,255,0.55)]">
              <Play size={30} fill="currentColor" />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="text-xs font900 uppercase tracking-[0.18em] text-[#4F7BFF]">{eyebrow}</p>}
      <h2 className="text-4xl font-black leading-tight text-white md:text-5xl">{title}</h2>
      {text && <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/48">{text}</p>}
    </div>
  );
}

export function Home() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [homeTemplates, setHomeTemplates] = useState([]);

  useEffect(() => {
    api.get('/templates')
      .then(({ data }) => setHomeTemplates(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setHomeTemplates([]));
  }, []);

  return (
    <>
      <SEO title="Weblix Website Builder Home" />
      <VideoPopup video={activeVideo} onClose={() => setActiveVideo(null)} />
      <div className="bg-[#0d0d0d] text-white">
        <section className="relative overflow-hidden px-4 pb-10 pt-14">
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(79,123,255,0.22),transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.03em] md:text-7xl">
                Weblix Website Builder
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/55">
                A premium MERN SaaS platform for selling your builder ZIP, paid templates, SEO blogs, secure downloads, and admin-managed digital products.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Link to="/pricing" className="rounded-full bg-[#2155FF] px-5 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-[#4F7BFF]">Buy Builder</Link>
                <Link to="/templates" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-black text-white transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">View Templates</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }} className="mt-16 overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0F2C] p-3 shadow-[0_40px_120px_rgba(6,19,74,0.45)]">
              <div className="grid gap-4">
                <VideoCard
                  eyebrow="Video 01"
                  title="Create with AI, import with one click"
                  description="Create a full website with Codex or any AI tool, follow the Weblix file structure, import the ZIP, then edit pages and HTML sections inside the builder."
                  variant="website"
                  onVideoClick={setActiveVideo}
                />
                <VideoCard
                  eyebrow="Video 02"
                  title="Through builder page"
                  description="Show the builder workflow: drag sections, style blocks, preview responsive pages, add custom HTML blocks, then export or sell the website ZIP."
                  variant="builder"
                  delay={0.08}
                  onVideoClick={setActiveVideo}
                />
              </div>
              <div className="mt-3 flex flex-col justify-between gap-5 rounded-[22px] bg-[#0F1D5C] p-7 md:flex-row md:items-center">
                <h2 className="max-w-sm text-3xl font-black leading-tight">Import ZIP websites and edit pages in just few clicks</h2>
                <div className="max-w-sm">
                  <p className="text-xs leading-5 text-white/50">Upload clean static HTML/CSS/JS exports, generate template pages, keep assets organized, then edit and publish through the Weblix Builder.</p>
                  <div className="mt-4 flex gap-3">
                    <Link to="/templates" className="rounded-full bg-[#2155FF] px-4 py-2 text-[11px] font-black text-white transition hover:bg-[#4F7BFF]">Buy Template</Link>
                    <Link to="/blog" className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">View Blog</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="What is included in Weblix" text="Everything from the master prompt: builder sales, templates, blogs, payments, downloads, and dashboards." />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {included.map(([title, text, Icon], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="min-h-[420px] rounded-[22px] border border-white/10 bg-[#050505] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-[#2155FF]/55 hover:shadow-[0_28px_100px_rgba(33,85,255,0.14)]"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-[10px] border border-[#2155FF]/70 bg-[#2155FF]/10 text-[#2155FF] shadow-[0_0_34px_rgba(33,85,255,0.22)]">
                    <Icon size={28} strokeWidth={2.2} />
                  </div>
                  <h3 className="mt-8 max-w-sm text-[25px] font-semibold leading-tight text-white">{title}</h3>
                  <p className="mt-7 max-w-sm text-base font-normal leading-7 text-white/48">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0A0F2C] px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="Template ZIP files" text="Latest page templates added from the admin dashboard appear here automatically as downloadable ZIP cards." />
            <div className="mt-8 flex justify-center">
              <Link to="/templates" className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-5 py-3 text-sm font900 text-white transition hover:border-[#4F7BFF]/50 hover:bg-[#2155FF]">
                View all templates
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-x-7 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {homeTemplates.length > 0 ? (
                homeTemplates.map((template, index) => <TemplateShowcaseCard key={template._id || template.slug} template={template} index={index} />)
              ) : (
                pageCards.slice(0, 6).map(([label, title], index) => (
                  <TemplateShowcaseCard
                    key={label}
                    index={index}
                    template={{
                      _id: label,
                      slug: 'saas-launch-template',
                      name: label,
                      description: title,
                      price: 19
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="How to download theme and templates" text="Buy the Weblix Builder ZIP or any template pack, then receive your license, email receipt, and protected download automatically." />
            <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[24px] border border-white/10 bg-[#0A0F2C] p-6 md:p-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Instant delivery</p>
                    <h3 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">Your purchased ZIP is unlocked right after payment.</h3>
                    <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-white/52">
                      Weblix connects checkout, license records, dashboard downloads, and branded email delivery so customers know exactly what they bought and where to get it.
                    </p>
                  </div>
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[20px] bg-[#2155FF] shadow-[0_20px_70px_rgba(33,85,255,0.35)]">
                    <Download size={34} />
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ['Builder theme ZIP', FileArchive, 'Download the Weblix Builder product package with license details.'],
                    ['Template ZIP files', Layers, 'Every paid template unlocks the exact uploaded ZIP from the dashboard.'],
                    ['License key included', KeyRound, 'Yearly and lifetime licenses are stored in the customer dashboard.'],
                    ['Secure download links', ShieldCheck, 'Protected links work from dashboard and branded email receipt.']
                  ].map(([title, Icon, text]) => (
                    <div key={title} className="rounded-[16px] border border-white/10 bg-[#0d0d0d] p-5">
                      <Icon className="text-[#4F7BFF]" size={24} />
                      <h4 className="mt-4 text-lg font-semibold text-white">{title}</h4>
                      <p className="mt-2 text-sm font-normal leading-6 text-white/45">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#111111] p-6 md:p-8">
                <h3 className="text-2xl font-semibold">Download workflow</h3>
                <div className="mt-7 grid gap-4">
                  {[
                    ['01', 'Choose product or template', 'Select Weblix Builder Yearly, Lifetime, or any template ZIP card.'],
                    ['02', 'Complete secure checkout', 'Login first, pay with the configured payment gateway, and verify the order.'],
                    ['03', 'License activates automatically', 'The backend creates the license key, renewal date, and download record.'],
                    ['04', 'Download from email or dashboard', 'Customer receives a Weblix branded email and can download again anytime from Dashboard.']
                  ].map(([step, title, text]) => (
                    <div key={step} className="grid grid-cols-[54px_1fr] gap-4 rounded-[16px] border border-white/10 bg-[#0A0F2C] p-4">
                      <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#2155FF] text-sm font900 text-white">{step}</span>
                      <div>
                        <h4 className="text-base font-semibold">{title}</h4>
                        <p className="mt-1 text-sm font-normal leading-6 text-white/45">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[18px] border border-[#4F7BFF]/25 bg-[#2155FF]/10 p-5">
                  <div className="flex items-start gap-4">
                    <CreditCard className="mt-1 shrink-0 text-[#4F7BFF]" />
                    <div>
                      <h4 className="font-semibold">Yearly plans can auto-renew</h4>
                      <p className="mt-2 text-sm font-normal leading-6 text-white/50">Lifetime stays unlocked forever. Yearly licenses show renewal date and keep downloads active while the subscription is paid.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/pricing" className="inline-flex items-center gap-2 rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font900 text-white transition hover:bg-[#4F7BFF]">
                    View pricing
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/templates" className="inline-flex items-center gap-2 rounded-[10px] border border-white/12 px-5 py-3 text-sm font900 text-white/75 transition hover:border-[#4F7BFF]/50 hover:text-white">
                    Browse templates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20">
              <div className="max-w-4xl">
                <p className="text-sm font900 text-[#4F7BFF]">Builder Interactions</p>
                <h2 className="mt-4 max-w-4xl text-4xl font500 leading-tight text-white md:text-6xl">
                  Build pages with visual controls, reusable blocks, and guided editing.
                </h2>
                <p className="mt-5 max-w-3xl text-base font-normal leading-7 text-white/52">
                  Weblix gives creators a practical workspace for page building, section insertion, row structure, module content, and responsive refinement.
                </p>
              </div>

              <div className="mt-10 grid gap-7 lg:grid-cols-2">
                {builderMotionFeatures.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="overflow-hidden rounded-[26px] border border-white/10 bg-[#F5F7FF] p-7 text-[#0A0F2C] shadow-[0_28px_90px_rgba(0,0,0,0.24)]"
                  >
                    <h3 className="max-w-xl text-[25px] font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-4 max-w-xl text-base font-normal leading-7 text-[#0A0F2C]/62">{item.text}</p>
                    <Link to="/pricing" className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#0d0d0d] px-5 py-3 text-sm font900 text-white transition hover:bg-[#2155FF]">
                      Learn More
                      <ArrowRight size={16} />
                    </Link>
                    <div className="mt-8 overflow-hidden rounded-[18px] border border-[#0A0F2C]/10 bg-white">
                      <img src={item.image} alt={`${item.title} Weblix builder screenshot`} className="h-[340px] w-full object-cover object-top transition duration-500 hover:scale-105" loading="lazy" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <SectionTitle title="Frequently asked questions" text="Answers for the Weblix builder, one-click imports, template ZIP sales, downloads, and admin-managed content." />
            <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
              {homeFaqs.map(([question, answer]) => (
                <details key={question} className="group border-b border-white/10 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-6 text-left text-lg font-semibold text-white transition hover:bg-white/[0.03] md:px-8">
                    {question}
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/5 text-[#4F7BFF] transition group-open:rotate-180 group-open:bg-[#2155FF] group-open:text-white">
                      <ChevronDown size={18} />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-base font-normal leading-7 text-white/52 md:px-8">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle title="Simple Weblix pricing" text="Start with the builder ZIP, then add premium template packs whenever your project needs more page designs." />
            <div className="mx-auto mt-8 flex w-fit overflow-hidden rounded-[12px] border border-white/15 bg-[#050505] p-1">
              <span className="rounded-[10px] bg-white px-6 py-3 text-sm font900 text-[#0A0F2C]">Builder</span>
              <Link to="/pricing" className="rounded-[10px] px-6 py-3 text-sm font900 text-white/60 transition hover:bg-[#4F7BFF]/10 hover:text-white">Full Pricing</Link>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-7 lg:grid-cols-2">
              {homePricingPlans.map((plan) => (
                <div key={plan.name} className={`relative flex min-h-[560px] flex-col rounded-[20px] border p-7 ${plan.highlighted ? 'border-[#2155FF] bg-[#050505] shadow-[0_0_0_1px_rgba(33,85,255,0.42),0_30px_110px_rgba(33,85,255,0.16)]' : 'border-white/12 bg-[#050505]'}`}>
                  {plan.highlighted && <span className="absolute right-5 top-5 rounded-[10px] bg-white px-3 py-1 text-[10px] font900 text-[#0A0F2C]">BEST START</span>}
                  <p className="text-sm font900 text-[#4F7BFF]">{plan.name}</p>
                  <div className="mt-7 flex items-end gap-2">
                    <h3 className="text-5xl font-semibold text-white">{plan.price}</h3>
                    <span className="pb-2 text-sm font700 text-white/42">/{plan.period}</span>
                  </div>
                  <p className="mt-5 min-h-24 text-base font-normal leading-7 text-white/52">{plan.description}</p>
                  <Link to={plan.to} className={`mt-7 flex min-h-12 items-center justify-center rounded-[10px] px-5 py-3 text-sm font900 transition ${plan.highlighted ? 'bg-[#2155FF] text-white hover:bg-[#4F7BFF]' : 'bg-white text-[#0A0F2C] hover:bg-[#4F7BFF] hover:text-white'}`}>
                    {plan.action}
                  </Link>
                  <div className="mt-7 h-px bg-white/10" />
                  <div className="mt-7 grid gap-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm font700 text-white/72">
                        <Check size={17} className="text-[#4F7BFF]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link to="/pricing" className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font900 text-[#4F7BFF] transition hover:text-white">
                    Compare all plans
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
