import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Globe2, Rocket, Search, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

const countries = ['US', 'IN', 'GB', 'CA', 'AU'];
const categories = ['Technology', 'AI', 'SEO', 'Web Development', 'SaaS', 'React', 'MERN Stack'];

function scoreColor(value, inverse = false) {
  const good = inverse ? value <= 45 : value >= 70;
  const warn = inverse ? value <= 70 : value >= 45;
  if (good) return 'text-[#48d88b]';
  if (warn) return 'text-yellow-300';
  return 'text-red-300';
}

export function GoogleTrends() {
  const [trends, setTrends] = useState([]);
  const [country, setCountry] = useState('US');
  const [category, setCategory] = useState('Technology');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoImages, setAutoImages] = useState(true);

  function load() {
    setLoading(true);
    api.get('/trends/keywords', { params: { country, category, search } })
      .then(({ data }) => setTrends(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [country, category]);

  async function generate(trend, status = 'ai-generated') {
    const { data } = await api.post('/trends/generate-blog', { trend, status, category, autoGenerateImages: autoImages });
    setMessage(`${status === 'published' ? 'Published' : 'Generated'} blog: ${data.title}${data.featuredImage ? ' with original AI image.' : '.'}`);
  }

  const top = useMemo(() => trends.slice(0, 8), [trends]);

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Google Trends" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Google Trends + AI Blog Generator</p>
            <h1 className="mt-2 text-3xl font-black">Trending keyword intelligence</h1>
            <p className="mt-2 text-sm font700 text-white/45">Fetch related topics, generate SEO blogs, publish now, or save AI drafts.</p>
          </div>
          <Link to="/admin/trends/settings" className="rounded-[10px] bg-[#2155FF] px-4 py-3 text-sm font900 hover:bg-[#4F7BFF]">Auto Publish Settings</Link>
        </div>

        {message && <div className="mt-5 rounded-[10px] border border-[#4F7BFF]/30 bg-[#4F7BFF]/10 p-4 text-sm font800 text-[#4F7BFF]">{message}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-[10px] border border-white/10 bg-[#171717] p-4 outline-none">{countries.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-[10px] border border-white/10 bg-[#171717] p-4 outline-none">{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <label className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#171717] px-4 md:col-span-2"><Search size={18} className="text-white/35" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="min-h-14 flex-1 bg-transparent outline-none" placeholder="Search trends" /><button onClick={load} className="text-sm font900 text-[#4F7BFF]">Search</button></label>
        </div>
        <label className="mt-4 flex w-fit items-center gap-3 rounded-[10px] border border-white/10 bg-[#171717] px-4 py-3 text-sm font900 text-white/70">
          <input type="checkbox" checked={autoImages} onChange={(e) => setAutoImages(e.target.checked)} className="accent-[#2155FF]" />
          Generate original copyright-safe Weblix AI images
        </label>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[18px] border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Trend Chart</h2>
              <BarChart3 className="text-[#4F7BFF]" />
            </div>
            <div className="mt-6 flex h-64 items-end gap-3 rounded-[14px] bg-[#0d0d0d] p-5">
              {top.map((trend) => <div key={trend.id} className="flex flex-1 flex-col items-center gap-3"><div style={{ height: `${Math.max(20, trend.growth)}px` }} className="w-full rounded-t-[10px] bg-gradient-to-t from-[#2155FF] to-[#4F7BFF]" /><span className="max-w-[70px] truncate text-[10px] text-white/35">{trend.keyword}</span></div>)}
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-[#171717] p-5">
            <h2 className="text-xl font-black">Automation Status</h2>
            <div className="mt-5 grid gap-3">
              {['Google Trends RSS active', 'SEO blog generator ready', 'Original image generator connected', 'No stock/copyrighted assets used', 'Sitemap/RSS updates automatic', 'Frontend blog updates on publish'].map((item) => <div key={item} className="flex items-center gap-3 rounded-[10px] bg-[#0d0d0d] p-4 text-sm font800 text-white/60"><CheckCircle2 size={18} className="text-[#48d88b]" /> {item}</div>)}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10 bg-[#171717]">
          <div className="border-b border-white/10 p-5"><h2 className="text-xl font-black">Trending Keywords Table</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35">
                <tr><th className="px-5 py-4">Keyword</th><th className="px-5 py-4">Search Volume</th><th className="px-5 py-4">Growth</th><th className="px-5 py-4">SEO Difficulty</th><th className="px-5 py-4">Country</th><th className="px-5 py-4">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading && <tr><td colSpan="6" className="px-5 py-8 text-center text-white/45">Fetching trends...</td></tr>}
                {!loading && trends.map((trend) => (
                  <tr key={trend.id}>
                    <td className="px-5 py-4 font900">{trend.keyword}<p className="mt-1 text-xs text-white/35">{trend.source}</p></td>
                    <td className="px-5 py-4 text-[#4F7BFF]">{trend.searchVolume.toLocaleString()}</td>
                    <td className={`px-5 py-4 font900 ${scoreColor(trend.growth)}`}>+{trend.growth}%</td>
                    <td className={`px-5 py-4 font900 ${scoreColor(trend.difficulty, true)}`}>{trend.difficulty}/100</td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-2"><Globe2 size={16} /> {trend.country}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => generate(trend)} className="mr-2 rounded-[10px] bg-white/5 px-3 py-2 text-xs font900 hover:bg-[#2155FF]"><WandSparkles size={14} className="mr-1 inline" /> Generate Blog</button>
                      <button onClick={() => generate(trend, 'published')} className="rounded-[10px] bg-[#2155FF] px-3 py-2 text-xs font900 hover:bg-[#4F7BFF]"><Rocket size={14} className="mr-1 inline" /> Publish</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
