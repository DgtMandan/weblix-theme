import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bold, Code2, Eye, Heading2, ImagePlus, Italic, Link2, List, Plus, Quote, Sparkles, Table, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { api, assetUrl } from '../../services/api.js';

const initial = {
  title: '',
  seoTitle: '',
  slug: '',
  seoDescription: '',
  focusKeyword: '',
  secondaryKeywords: '',
  categoryName: 'Web Development',
  tags: 'Web Design,SEO',
  excerpt: '',
  content: '',
  authorName: 'Weblix Editorial',
  canonicalUrl: '',
  schemaType: 'BlogPosting',
  geoTitle: '',
  geoSummary: '',
  geoAnswer: '',
  geoAudience: 'Website owners, agencies, SaaS founders and Weblix users',
  geoRegion: 'Global',
  geoEntities: 'Weblix Website Builder, AI Website Builder, Website Templates, SEO, MERN Stack',
  geoQuestions: 'What is Weblix Website Builder?, How do Weblix templates work?',
  geoSources: '/templates,/pricing,/blog',
  internalLinks: '',
  externalLinks: '',
  readTime: '',
  publishDate: new Date().toISOString().slice(0, 10),
  scheduledAt: '',
  status: 'published',
  faqs: [{ question: '', answer: '' }],
  featuredImage: null,
  ogImage: null,
  authorImage: null,
  editorImages: []
};

const tools = [
  ['H2', Heading2, '<h2>Your heading</h2>'],
  ['Bold', Bold, '<strong>important text</strong>'],
  ['Italic', Italic, '<em>emphasized text</em>'],
  ['List', List, '<ul><li>First point</li><li>Second point</li></ul>'],
  ['Quote', Quote, '<blockquote>Useful expert quote.</blockquote>'],
  ['Code', Code2, '<pre><code>// code block</code></pre>'],
  ['Table', Table, '<table><tr><th>Feature</th><th>Benefit</th></tr><tr><td>SEO</td><td>Better rankings</td></tr></table>'],
  ['CTA', Sparkles, '<section class="blog-cta"><h2>Build faster with Weblix</h2><p>Download premium builder ZIPs and templates.</p></section>']
];

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ');
}

function countWords(value = '') {
  return stripHtml(value).split(/\s+/).filter(Boolean).length;
}

function analyzeSeo(form) {
  const keyword = form.focusKeyword.toLowerCase().trim();
  const content = stripHtml(form.content).toLowerCase();
  const words = content.split(/\s+/).filter(Boolean);
  const keywordCount = keyword ? (content.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
  const keywordDensity = words.length ? (keywordCount / words.length) * 100 : 0;
  const checks = [
    ['Focus keyword in title', keyword && `${form.title} ${form.seoTitle}`.toLowerCase().includes(keyword)],
    ['Focus keyword in meta description', keyword && form.seoDescription.toLowerCase().includes(keyword)],
    ['Keyword density 0.3%-3.5%', keywordDensity >= 0.3 && keywordDensity <= 3.5],
    ['Heading structure H2/H3', /<h2|<h3/i.test(form.content)],
    ['Internal links', Boolean(form.internalLinks.trim()) || /href=["']\/blog\//i.test(form.content)],
    ['External links', Boolean(form.externalLinks.trim()) || /href=["']https?:\/\//i.test(form.content)],
    ['Image ALT tags', /<img[^>]+alt=/i.test(form.content) || Boolean(form.featuredImage)],
    ['Content length 700+ words', words.length >= 700],
    ['URL optimization', form.slug.length >= 8 && form.slug.length <= 75],
    ['Mobile SEO ready', true],
    ['Meta title 35-60 chars', form.seoTitle.length >= 35 && form.seoTitle.length <= 60],
    ['Meta description 120-160 chars', form.seoDescription.length >= 120 && form.seoDescription.length <= 160]
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  const score = Math.round((passed / checks.length) * 100);
  return {
    score,
    keywordDensity: Number(keywordDensity.toFixed(2)),
    checks: checks.map(([label, ok]) => ({ label, status: ok ? 'good' : score > 55 ? 'warn' : 'poor' }))
  };
}

function analyzeGeo(form) {
  const checks = [
    ['AI title ready', Boolean(form.geoTitle || form.seoTitle || form.title)],
    ['AI summary 80-320 chars', form.geoSummary.length >= 80 && form.geoSummary.length <= 320],
    ['Direct answer 120+ chars', form.geoAnswer.length >= 120],
    ['Audience defined', Boolean(form.geoAudience.trim())],
    ['Region defined', Boolean(form.geoRegion.trim())],
    ['Named entities 3+', form.geoEntities.split(',').filter((item) => item.trim()).length >= 3],
    ['Questions 2+', form.geoQuestions.split(',').filter((item) => item.trim()).length >= 2],
    ['Sources 1+', form.geoSources.split(',').filter((item) => item.trim()).length >= 1]
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    checks: checks.map(([label, ok]) => ({ label, status: ok ? 'good' : 'poor' }))
  };
}

function tone(score) {
  if (score >= 80) return 'text-[#48d88b]';
  if (score >= 55) return 'text-yellow-300';
  return 'text-red-300';
}

export function ManageBlogs() {
  const [form, setForm] = useState(initial);
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const seo = useMemo(() => analyzeSeo(form), [form]);
  const geo = useMemo(() => analyzeGeo(form), [form]);

  function loadBlogs() {
    api.get('/blogs/admin/blogs').then(({ data }) => setBlogs(data)).catch(() => setBlogs([]));
  }

  useEffect(() => { loadBlogs(); }, []);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'title' && !current.slug) next.slug = slugify(value);
      if (field === 'title' && !current.seoTitle) next.seoTitle = `${value} | Weblix Guide`;
      if (field === 'excerpt' && !current.seoDescription) next.seoDescription = value.slice(0, 155);
      return next;
    });
  }

  function appendContent(snippet) {
    setForm((current) => ({ ...current, content: `${current.content}\n${snippet}`.trim() }));
  }

  function autoGenerate() {
    const base = form.title || 'Best AI Website Builder for Modern Teams';
    const keyword = form.focusKeyword || 'AI website builder';
    setForm((current) => ({
      ...current,
      title: current.title || base,
      seoTitle: `${base}`.slice(0, 58),
      slug: current.slug || slugify(base),
      seoDescription: `Learn how ${keyword} workflows help teams build faster websites, improve SEO, and launch modern pages with Weblix.`.slice(0, 158),
      secondaryKeywords: current.secondaryKeywords || 'website builder, AI web design, SaaS website, SEO templates',
      tags: current.tags || 'AI,Website Builder,SEO',
      excerpt: current.excerpt || `A practical Weblix guide covering ${keyword}, SEO structure, templates, and launch strategy.`,
      content: current.content || `<h2>Why ${keyword} matters</h2><p>${keyword} tools help teams publish faster, test more landing pages, and improve website conversion.</p><h2>How to use this trend</h2><ul><li>Create focused landing pages.</li><li>Add internal links to related Weblix templates.</li><li>Use helpful examples and original screenshots.</li></ul><p><a href="/templates">Explore Weblix templates</a> for faster launches.</p>`,
      geoTitle: current.geoTitle || `${base} for AI search answers`,
      geoSummary: current.geoSummary || `This Weblix guide explains ${keyword} workflows for teams that want faster website launches, stronger SEO, secure templates, and practical builder-ready publishing.`,
      geoAnswer: current.geoAnswer || `Weblix Website Builder helps teams use ${keyword} workflows by combining builder-ready template ZIPs, protected downloads, SEO blog tools, and an admin dashboard for publishing modern websites faster.`,
      geoQuestions: current.geoQuestions || `What is ${keyword}?, How does Weblix help with ${keyword}?`,
      faqs: current.faqs.some((item) => item.question) ? current.faqs : [
        { question: `What is ${keyword}?`, answer: `${keyword} is a workflow for creating pages faster with guided design, content, and SEO assistance.` },
        { question: 'Does Weblix support SEO blogs?', answer: 'Yes, Weblix includes metadata, schema, internal links, and SEO previews.' }
      ]
    }));
  }

  async function generateTrends() {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/blogs/admin/blogs/generate-trends');
      setMessage(`Trend generator complete. Created ${data.created} blog post(s).`);
      loadBlogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Trend generator failed.');
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      [
        'title', 'seoTitle', 'slug', 'seoDescription', 'focusKeyword', 'secondaryKeywords', 'categoryName',
        'tags', 'excerpt', 'content', 'authorName', 'canonicalUrl', 'schemaType', 'internalLinks',
        'externalLinks', 'readTime', 'publishDate', 'scheduledAt', 'status', 'geoTitle', 'geoSummary',
        'geoAnswer', 'geoAudience', 'geoRegion', 'geoEntities', 'geoQuestions', 'geoSources'
      ].forEach((key) => data.append(key, form[key] || ''));
      data.append('faqs', JSON.stringify(form.faqs.filter((item) => item.question && item.answer)));
      if (form.featuredImage) data.append('featuredImage', form.featuredImage);
      if (form.ogImage) data.append('ogImage', form.ogImage);
      if (form.authorImage) data.append('authorImage', form.authorImage);
      form.editorImages.forEach((file) => data.append('editorImages', file));
      if (editingId) await api.put(`/blogs/admin/blogs/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/blogs/admin/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(editingId ? 'Blog updated with SEO fields.' : 'Blog created with SEO fields.');
      setForm(initial);
      setEditingId('');
      e.target.reset();
      loadBlogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Blog save failed.');
    } finally {
      setLoading(false);
    }
  }

  function editBlog(blog) {
    setEditingId(blog._id);
    setForm({
      ...initial,
      ...blog,
      tags: blog.tags?.join(',') || '',
      secondaryKeywords: blog.secondaryKeywords?.join(',') || '',
      internalLinks: blog.internalLinks?.join(',') || '',
      externalLinks: blog.externalLinks?.join(',') || '',
      geoEntities: blog.geoEntities?.join(',') || initial.geoEntities,
      geoQuestions: blog.geoQuestions?.join(',') || initial.geoQuestions,
      geoSources: blog.geoSources?.join(',') || initial.geoSources,
      publishDate: blog.publishedAt ? blog.publishedAt.slice(0, 10) : initial.publishDate,
      scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : '',
      faqs: blog.faqs?.length ? blog.faqs : initial.faqs,
      featuredImage: null,
      ogImage: null,
      authorImage: null,
      editorImages: []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteBlog(id) {
    await api.delete(`/blogs/admin/blogs/${id}`);
    loadBlogs();
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] py-8 text-white">
      <div className="mx-auto max-w-[1500px] px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">SEO Blog Dashboard</p>
            <h1 className="mt-2 text-3xl font-black">Rank-ready blog management</h1>
            <p className="mt-2 text-sm font700 text-white/45">Yoast/RankMath style editor, live SEO score, schema fields, previews, and trend generation.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={autoGenerate} className="rounded-[10px] border border-white/10 px-4 py-3 text-sm font900 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">Auto SEO</button>
            <button onClick={generateTrends} className="rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900 transition hover:bg-[#4F7BFF]">Generate Trends</button>
          </div>
        </div>

        {message && <div className="mb-5 rounded-[10px] border border-lightBlue/30 bg-lightBlue/10 p-4 text-sm font800 text-lightBlue">{message}</div>}
        {error && <div className="mb-5 rounded-[10px] border border-red-400/30 bg-red-500/10 p-4 text-sm font800 text-red-200">{error}</div>}

        <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <div className="grid gap-5">
            <Card>
              <div className="grid gap-4 md:grid-cols-2">
                <input required className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Blog Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="SEO Title" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="SEO Slug URL" value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Focus Keyword" value={form.focusKeyword} onChange={(e) => update('focusKeyword', e.target.value)} />
              </div>
              <textarea className="mt-4 min-h-24 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Meta Description" value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Secondary Keywords" value={form.secondaryKeywords} onChange={(e) => update('secondaryKeywords', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Blog Category" value={form.categoryName} onChange={(e) => update('categoryName', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Blog Tags" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex flex-wrap gap-2">
                {tools.map(([label, Icon, snippet]) => (
                  <button key={label} type="button" onClick={() => appendContent(snippet)} className="inline-flex items-center gap-2 rounded-[10px] bg-[#0d0d0d] px-3 py-2 text-xs font900 text-white/70 transition hover:bg-[#2155FF] hover:text-white">
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
              <textarea className="min-h-20 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Short Description" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
              <textarea required className="mt-4 min-h-[420px] w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 font-mono text-sm text-white outline-none focus:border-lightBlue" placeholder="Full Blog Content Editor (HTML supported: headings, lists, tables, code, images, video embeds, buttons, quotes, CTA sections)" value={form.content} onChange={(e) => update('content', e.target.value)} />
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><span className="text-xs font900">Featured Image</span><input type="file" accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-xs text-white/50" onChange={(e) => update('featuredImage', e.target.files[0])} /></label>
                <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><span className="text-xs font900">OG Image</span><input type="file" accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-xs text-white/50" onChange={(e) => update('ogImage', e.target.files[0])} /></label>
                <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><span className="text-xs font900">Author Image</span><input type="file" accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-xs text-white/50" onChange={(e) => update('authorImage', e.target.files[0])} /></label>
                <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><span className="text-xs font900">Editor Images</span><input type="file" multiple accept=".png,.jpg,.jpeg,.webp" className="mt-3 w-full text-xs text-white/50" onChange={(e) => update('editorImages', [...e.target.files])} /></label>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black">GEO for AI Search</h2>
              <p className="mt-2 text-sm font700 text-white/45">Generative Engine Optimization helps ChatGPT, Gemini, Perplexity, and AI search tools understand direct answers, entities, and user intent.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="GEO / AI Answer Title" value={form.geoTitle} onChange={(e) => update('geoTitle', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Audience" value={form.geoAudience} onChange={(e) => update('geoAudience', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="GEO Region" value={form.geoRegion} onChange={(e) => update('geoRegion', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Entities comma separated" value={form.geoEntities} onChange={(e) => update('geoEntities', e.target.value)} />
              </div>
              <textarea className="mt-4 min-h-24 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="GEO Summary for AI search result answers" value={form.geoSummary} onChange={(e) => update('geoSummary', e.target.value)} />
              <textarea className="mt-4 min-h-32 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Direct answer block for generative engines" value={form.geoAnswer} onChange={(e) => update('geoAnswer', e.target.value)} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <textarea className="min-h-24 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="AI questions comma separated" value={form.geoQuestions} onChange={(e) => update('geoQuestions', e.target.value)} />
                <textarea className="min-h-24 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-white outline-none focus:border-lightBlue" placeholder="Source URLs comma separated" value={form.geoSources} onChange={(e) => update('geoSources', e.target.value)} />
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black">FAQ Schema</h2>
              <div className="mt-4 grid gap-3">
                {form.faqs.map((faq, index) => (
                  <div key={index} className="grid gap-3 rounded-[10px] bg-[#0d0d0d] p-4 md:grid-cols-2">
                    <input className="rounded-[10px] border border-white/10 bg-[#171717] p-3 text-white outline-none" placeholder="Question" value={faq.question} onChange={(e) => {
                      const faqs = [...form.faqs]; faqs[index] = { ...faq, question: e.target.value }; update('faqs', faqs);
                    }} />
                    <input className="rounded-[10px] border border-white/10 bg-[#171717] p-3 text-white outline-none" placeholder="Answer" value={faq.answer} onChange={(e) => {
                      const faqs = [...form.faqs]; faqs[index] = { ...faq, answer: e.target.value }; update('faqs', faqs);
                    }} />
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => update('faqs', [...form.faqs, { question: '', answer: '' }])} className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-white/5 px-4 py-2 text-sm font900 hover:bg-[#2155FF]"><Plus size={16} /> Add FAQ</button>
            </Card>
          </div>

          <aside className="grid content-start gap-5">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">SEO Score</h2>
                <span className={`text-5xl font-black ${tone(seo.score)}`}>{seo.score}</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#0d0d0d]"><div style={{ width: `${seo.score}%` }} className="h-full bg-gradient-to-r from-red-400 via-yellow-300 to-[#48d88b]" /></div>
              <p className="mt-3 text-xs font800 text-white/45">Keyword density: {seo.keywordDensity}% | Words: {countWords(form.content)}</p>
              <div className="mt-5 grid gap-2">
                {seo.checks.map((check) => (
                  <div key={check.label} className="flex justify-between gap-3 rounded-[10px] bg-[#0d0d0d] p-3 text-xs font800">
                    <span>{check.label}</span>
                    <span className={check.status === 'good' ? 'text-[#48d88b]' : check.status === 'warn' ? 'text-yellow-300' : 'text-red-300'}>{check.status}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">GEO Score</h2>
                <span className={`text-5xl font-black ${tone(geo.score)}`}>{geo.score}</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#0d0d0d]"><div style={{ width: `${geo.score}%` }} className="h-full bg-gradient-to-r from-red-400 via-yellow-300 to-[#48d88b]" /></div>
              <div className="mt-5 grid gap-2">
                {geo.checks.map((check) => (
                  <div key={check.label} className="flex justify-between gap-3 rounded-[10px] bg-[#0d0d0d] p-3 text-xs font800">
                    <span>{check.label}</span>
                    <span className={check.status === 'good' ? 'text-[#48d88b]' : 'text-red-300'}>{check.status}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black">Publishing</h2>
              <div className="mt-4 grid gap-3">
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" placeholder="Author Name" value={form.authorName} onChange={(e) => update('authorName', e.target.value)} />
                <input className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" placeholder="Canonical URL" value={form.canonicalUrl} onChange={(e) => update('canonicalUrl', e.target.value)} />
                <select className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" value={form.schemaType} onChange={(e) => update('schemaType', e.target.value)}>
                  {['Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'FAQPage'].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input type="number" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" placeholder="Read Time" value={form.readTime} onChange={(e) => update('readTime', e.target.value)} />
                <input type="date" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" value={form.publishDate} onChange={(e) => update('publishDate', e.target.value)} />
                <input type="datetime-local" className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" value={form.scheduledAt} onChange={(e) => update('scheduledAt', e.target.value)} />
                <select className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="draft">Draft</option><option value="ai-generated">AI Generated</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option>
                </select>
              </div>
              <Button className="mt-4 w-full" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update Blog' : 'Create SEO Blog'}</Button>
            </Card>

            <Card>
              <h2 className="text-xl font-black">Links & Suggestions</h2>
              <textarea className="mt-4 min-h-20 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" placeholder="/blog/related-post, /templates" value={form.internalLinks} onChange={(e) => update('internalLinks', e.target.value)} />
              <textarea className="mt-3 min-h-20 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] p-3 text-white outline-none" placeholder="https://example.com/reference" value={form.externalLinks} onChange={(e) => update('externalLinks', e.target.value)} />
              <div className="mt-4 grid gap-2 text-xs font800 text-white/45">
                {blogs.slice(0, 4).map((blog) => <button type="button" key={blog._id} onClick={() => update('internalLinks', `${form.internalLinks}${form.internalLinks ? ',' : ''}/blog/${blog.slug}`)} className="flex items-center gap-2 rounded-[10px] bg-[#0d0d0d] p-3 text-left hover:text-[#4F7BFF]"><Link2 size={14} /> {blog.title}</button>)}
              </div>
            </Card>
          </aside>
        </form>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <Card><h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Eye size={18} /> Google Preview</h2><p className="text-[#8ab4f8]">{form.seoTitle || form.title || 'SEO title preview'}</p><p className="mt-1 text-xs text-[#bdc1c6]">https://weblix.com/blog/{form.slug || 'seo-slug'}</p><p className="mt-2 text-sm text-[#bdc1c6]">{form.seoDescription || 'Meta description preview appears here.'}</p></Card>
          <Card><h2 className="mb-4 text-xl font-black">Facebook Preview</h2><div className="aspect-[1.91/1] rounded-[10px] bg-[#0d0d0d]">{form.ogImage && <img src={URL.createObjectURL(form.ogImage)} alt="" className="h-full w-full rounded-[10px] object-cover" />}</div><p className="mt-3 text-sm font900">{form.seoTitle || form.title || 'OpenGraph title'}</p><p className="text-xs text-white/45">{form.seoDescription || form.excerpt}</p></Card>
          <Card><h2 className="mb-4 text-xl font-black">Twitter Preview</h2><div className="rounded-[16px] border border-white/10 bg-[#0d0d0d] p-4"><p className="font900">{form.seoTitle || form.title || 'Twitter card title'}</p><p className="mt-2 text-sm text-white/45">{form.seoDescription || 'Twitter description preview.'}</p></div></Card>
        </div>

        <Card className="mt-5 overflow-hidden">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">Admin Blog Table</h2>
            <Link to="/blog" className="text-sm font900 text-[#4F7BFF]">Frontend Blog</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#0d0d0d] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">SEO</th><th className="px-4 py-3">GEO</th><th className="px-4 py-3">Image</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Publish Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Keywords</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-4 py-4 font900">{blog.title}</td>
                    <td className={`px-4 py-4 font900 ${tone(blog.seoScore || 0)}`}>{blog.seoScore || 0}</td>
                    <td className={`px-4 py-4 font900 ${tone(blog.geoScore || 0)}`}>{blog.geoScore || 0}</td>
                    <td className="px-4 py-4">{blog.featuredImage ? <span className="text-[#48d88b]">Ready</span> : <span className="text-yellow-300">Missing</span>}</td>
                    <td className="px-4 py-4 text-white/50">{blog.views || 0}</td>
                    <td className="px-4 py-4 text-white/50">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-4">{blog.status}</td>
                    <td className="px-4 py-4 text-white/50">{blog.categoryName || blog.category?.name || '-'}</td>
                    <td className="px-4 py-4 text-white/50">{blog.focusKeyword || blog.tags?.[0]}</td>
                    <td className="px-4 py-4"><button onClick={() => editBlog(blog)} className="mr-2 text-[#4F7BFF]">Edit</button><button onClick={() => deleteBlog(blog._id)} className="text-red-300"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
