import { useEffect, useState } from 'react';
import { SEO } from '../../utils/seo.jsx';
import { api } from '../../services/api.js';

const defaults = {
  enabled: false,
  frequency: 'daily',
  dailyLimit: 2,
  minimumSeoScore: 70,
  autoGenerateImages: true,
  autoAddFaq: true,
  autoInternalLinking: true,
  autoMetaDescription: true,
  autoSchema: true,
  country: 'US',
  category: 'Technology'
};

export function TrendSettings() {
  const [form, setForm] = useState(defaults);
  const [message, setMessage] = useState('');

  useEffect(() => { api.get('/trends/settings').then(({ data }) => setForm({ ...defaults, ...data })); }, []);

  async function save(e) {
    e.preventDefault();
    const { data } = await api.put('/trends/settings', form);
    setForm({ ...defaults, ...data });
    setMessage('Auto publish settings saved.');
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Auto Publish Settings" />
      <form onSubmit={save} className="mx-auto max-w-4xl rounded-[18px] border border-white/10 bg-[#171717] p-6">
        <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Auto Publish Settings</p>
        <h1 className="mt-2 text-3xl font-black">Google Trends automation</h1>
        {message && <div className="mt-5 rounded-[10px] bg-[#4F7BFF]/10 p-4 text-sm font900 text-[#4F7BFF]">{message}</div>}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4"><option value="hourly">Every Hour</option><option value="6-hours">Every 6 Hours</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select>
          <input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: Number(e.target.value) })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4" placeholder="Daily Limit" />
          <input type="number" value={form.minimumSeoScore} onChange={(e) => setForm({ ...form, minimumSeoScore: Number(e.target.value) })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4" placeholder="Minimum SEO Score" />
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4" placeholder="Country" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 md:col-span-2" placeholder="Category" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            ['enabled', 'Enable Auto Publishing'],
            ['autoGenerateImages', 'Auto Generate Images'],
            ['autoAddFaq', 'Auto Add FAQ'],
            ['autoInternalLinking', 'Auto Internal Linking'],
            ['autoMetaDescription', 'Auto Meta Description'],
            ['autoSchema', 'Auto Schema']
          ].map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-[10px] bg-[#0d0d0d] p-4 text-sm font900"><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-[#2155FF]" /> {label}</label>)}
        </div>
        <button className="mt-6 rounded-[10px] bg-[#2155FF] px-6 py-3 text-sm font900 hover:bg-[#4F7BFF]">Save Settings</button>
      </form>
    </section>
  );
}
