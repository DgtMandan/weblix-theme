import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Download, Eye, FileArchive, LayoutTemplate, Search, ShieldCheck, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { api, assetUrl } from '../services/api.js';
import { SEO } from '../utils/seo.jsx';
import { Reveal } from '../components/common/MotionPage.jsx';
import { formatUsd } from '../utils/currency.js';

const tabs = ['All', 'SaaS', 'Agency', 'AI', 'Blog', 'Dashboard'];

function ProductVisual({ index, template }) {
  if (template.thumbnail) {
    return <img src={assetUrl(template.thumbnail)} alt={template.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />;
  }

  const icons = [LayoutTemplate, Code2, Sparkles, Zap, FileArchive, ShieldCheck];
  const Icon = icons[index % icons.length];

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_72%_15%,#4F7BFF_0_22%,transparent_24%),linear-gradient(135deg,#06134A,#0A0F2C_55%,#050505)] p-8">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="relative w-full max-w-[270px] rounded-[22px] border border-white/12 bg-black/28 p-4 shadow-[0_30px_90px_rgba(0,0,0,.35)] transition duration-500 group-hover:-translate-y-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="h-2 w-20 rounded-full bg-white/22" />
          <span className="rounded-md bg-[#2155FF] px-2 py-1 text-[9px] font900 text-white">ZIP</span>
        </div>
        <div className="mt-4 grid aspect-[16/10] place-items-center rounded-[16px] bg-white/8">
          <Icon className="text-[#4F7BFF]" size={54} />
        </div>
        <div className="mt-4 grid gap-2">
          <span className="h-2 rounded-full bg-white/20" />
          <span className="h-2 w-2/3 rounded-full bg-white/12" />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, index }) {
  const tags = template.tags?.slice(0, 3) || [];
  return (
    <Link to={`/templates/${template.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#111111] shadow-[0_22px_70px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:border-[#4F7BFF]/45">
      <div className="relative aspect-[1.28] overflow-hidden bg-[#171717]">
        <ProductVisual index={index} template={template} />
        <div className="absolute left-4 top-4 rounded-[10px] border border-white/15 bg-black/55 px-3 py-2 text-[11px] font900 leading-none text-white backdrop-blur">
          {template.type || 'Template'}
        </div>
        <div className="absolute right-4 top-4 rounded-[10px] bg-[#2155FF] px-3 py-2 text-[11px] font900 leading-none text-white">
          ZIP File
        </div>
        <div className="absolute inset-x-4 bottom-4 flex translate-y-4 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-white text-sm font900 text-[#0A0F2C]">
            <Eye size={16} /> Preview
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#2155FF] text-white">
            <ShoppingBag size={17} />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font900 uppercase tracking-[0.16em] text-[#4F7BFF]">Builder-ready template</p>
            <h2 className="mt-2 text-[22px] font-semibold leading-[1.18] text-white transition group-hover:text-[#4F7BFF]">{template.name}</h2>
          </div>
          <p className="shrink-0 rounded-[10px] bg-white/8 px-3 py-2 text-base font900 leading-none text-white">{formatUsd(template.price)}</p>
        </div>
        <p className="mt-4 min-h-24 text-sm font-normal leading-6 text-white/52">{template.description}</p>
        <div className="mt-5 flex min-h-8 flex-wrap gap-2">
          {tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font800 text-white/55">{tag}</span>)}
        </div>
        <div className="mt-auto pt-[10px]">
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font900 text-white/45">
            <span className="inline-flex items-center gap-2"><Download size={14} className="text-[#4F7BFF]" /> Unlock after payment</span>
            <span className="inline-flex items-center gap-1 text-[#4F7BFF]">Details <ArrowRight size={14} /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Templates() {
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/templates', { params: { search } }).then(({ data }) => setTemplates(data)).catch(() => setTemplates([]));
  }, [search]);

  const visible = useMemo(() => {
    const source = templates.map((item) => ({ ...item, type: item.category?.name || item.categoryName || item.tags?.[0] || 'Template' }));
    return source.filter((item) => {
      const searchable = `${item.type} ${item.tags?.join(' ')}`.toLowerCase();
      const matchesTab = activeTab === 'All' || searchable.includes(activeTab.toLowerCase());
      const matchesSearch = !search || `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [templates, activeTab, search]);

  return (
    <section className="bg-[#0d0d0d] text-white">
      <SEO title="Templates" />
      <section className="relative overflow-hidden px-4 pb-16 pt-16">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[960px] w-[960px] -translate-x-1/2 rounded-full border border-[#2155FF]/20" />
        <div className="pointer-events-none absolute right-[-18%] top-[-20%] h-[720px] w-[720px] rounded-full bg-[#2155FF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[520px] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <Reveal>
              <h1 className="font-display text-6xl font-black leading-[1.08] tracking-[-0.04em] md:text-8xl">
                Weblix templates built for fast website launches
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-lg text-2xl font800 leading-9 text-white/55">
                Browse builder-ready template ZIP files for SaaS, agencies, blogs, dashboards and AI website projects.
              </p>
              <div className="mt-8 flex gap-3">
                <Link to="/pricing" className="rounded-[10px] bg-[#2155FF] px-5 py-3 text-sm font-black transition hover:bg-[#4F7BFF]">Buy Builder</Link>
                <Link to="/contact" className="rounded-[10px] border border-white/15 px-5 py-3 text-sm font-black transition hover:border-[#4F7BFF] hover:bg-[#4F7BFF]/10">Talk to sales</Link>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['ZIP delivery', 'Buy once and download securely from dashboard.'],
              ['Builder-ready', 'Pages are prepared for Weblix import and editing.'],
              ['Admin managed', 'New templates added in dashboard appear here automatically.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-[16px] border border-white/10 bg-[#111111] p-5">
                <Sparkles className="text-[#4F7BFF]" size={18} />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-stretch justify-between gap-5 md:flex-row md:items-center">
            <div className="mx-auto flex w-full flex-wrap justify-center gap-2 rounded-[10px] border border-white/25 bg-[#050505] p-1 md:w-fit">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`min-h-11 flex-1 rounded-[10px] px-4 py-3 text-sm font900 transition sm:flex-none md:px-7 ${active ? 'bg-[#2155FF] text-white' : 'text-white/70 hover:bg-[#4F7BFF]/10 hover:text-white'}`}>
                    {tab}
                  </button>
                );
              })}
            </div>
            <label className="flex w-full items-center gap-3 rounded-[10px] border border-white/10 bg-[#050505] px-4 py-3 md:w-auto md:min-w-72">
              <Search className="text-[#4F7BFF]" size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search templates" />
            </label>
          </div>

          <div className="mt-16 grid items-stretch gap-7 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((template, index) => (
              <Reveal key={template._id} className="h-full" delay={(index % 3) * 0.05}>
                <TemplateCard template={template} index={index} />
              </Reveal>
            ))}
          </div>
          {visible.length === 0 && (
            <Reveal className="mt-16 rounded-[24px] border border-white/10 bg-[#111111] p-8 text-center">
              <h2 className="text-2xl font-semibold">No templates available yet</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/45">
                Add template ZIP files from the admin dashboard and they will appear here automatically.
              </p>
            </Reveal>
          )}
        </div>
      </section>

    </section>
  );
}
