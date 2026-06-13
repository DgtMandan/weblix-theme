import { useEffect, useState } from 'react';
import { Activity, BarChart3, Bot, DollarSign, Eye, MousePointerClick } from 'lucide-react';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';
import { formatUsd } from '../../utils/currency.js';

function Panel({ children, className = '' }) {
  return <div className={`rounded-[18px] border border-white/10 bg-[#171717] ${className}`}>{children}</div>;
}

function Score({ value }) {
  const color = value >= 80 ? 'text-[#48d88b]' : value >= 55 ? 'text-yellow-300' : 'text-red-300';
  return <span className={`font900 ${color}`}>{value || 0}</span>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get('/analytics/summary', { params: { days } }).then(({ data }) => setData(data)).catch(() => setData(null));
  }, [days]);

  const totals = data?.totals || {};
  const cards = [
    ['Page Views', totals.pageViews || 0, Eye],
    ['Events', totals.events || 0, Activity],
    ['AI Opens', totals.aiOpens || 0, Bot],
    ['Revenue', formatUsd(totals.revenue || 0), DollarSign]
  ];

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Analytics Dashboard" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Data Analytics</p>
            <h1 className="mt-2 text-3xl font-black">SEO, GEO, traffic and conversion analytics</h1>
          </div>
          <select value={days} onChange={(e) => setDays(e.target.value)} className="min-h-12 rounded-[10px] border border-white/10 bg-[#171717] px-4 outline-none">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <Panel key={label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font800 text-white/45">{label}</p><h2 className="mt-2 text-3xl font-black">{value}</h2></div>
                <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><Icon size={22} /></span>
              </div>
            </Panel>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Panel className="p-5">
            <h2 className="flex items-center gap-2 text-xl font-black"><BarChart3 className="text-[#4F7BFF]" /> Top Pages</h2>
            <div className="mt-5 grid gap-3">
              {(data?.topPages || []).map((item) => <div key={item.label} className="flex justify-between rounded-[10px] bg-[#0d0d0d] p-3 text-sm"><span className="truncate">{item.label}</span><b>{item.count}</b></div>)}
              {!data?.topPages?.length && <p className="text-sm text-white/40">No page views tracked yet.</p>}
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="flex items-center gap-2 text-xl font-black"><MousePointerClick className="text-[#4F7BFF]" /> Top Events</h2>
            <div className="mt-5 grid gap-3">
              {(data?.topEvents || []).map((item) => <div key={item.label} className="flex justify-between rounded-[10px] bg-[#0d0d0d] p-3 text-sm"><span>{item.label}</span><b>{item.count}</b></div>)}
              {!data?.topEvents?.length && <p className="text-sm text-white/40">No events tracked yet.</p>}
            </div>
          </Panel>
          <Panel className="p-5">
            <h2 className="text-xl font-black">Devices</h2>
            <div className="mt-5 grid gap-3">
              {(data?.devices || []).map((item) => <div key={item.label} className="flex justify-between rounded-[10px] bg-[#0d0d0d] p-3 text-sm capitalize"><span>{item.label}</span><b>{item.count}</b></div>)}
              {!data?.devices?.length && <p className="text-sm text-white/40">Device data appears after visits.</p>}
            </div>
          </Panel>
        </div>

        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-black">Blog SEO/GEO Ranking Readiness</h2>
            <p className="mt-1 text-sm text-white/45">Automatically generated keywords, SEO scores, GEO scores and views.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#101010] text-xs font900 uppercase tracking-[0.12em] text-white/35"><tr><th className="px-5 py-4">Blog</th><th className="px-5 py-4">Keyword</th><th className="px-5 py-4">SEO</th><th className="px-5 py-4">GEO</th><th className="px-5 py-4">Views</th><th className="px-5 py-4">Status</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {(data?.blogs || []).map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-5 py-4 font900">{blog.title}</td>
                    <td className="px-5 py-4 text-white/50">{blog.focusKeyword || '-'}</td>
                    <td className="px-5 py-4"><Score value={blog.seoScore} /></td>
                    <td className="px-5 py-4"><Score value={blog.geoScore} /></td>
                    <td className="px-5 py-4 text-[#4F7BFF]">{blog.views || 0}</td>
                    <td className="px-5 py-4">{blog.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </section>
  );
}
