import { useEffect, useMemo, useState } from 'react';
import { Building2, Download, FileText, Globe2, Mail, MapPinned, Phone, Search, Send, Sparkles, Star, Trash2, Zap } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { api } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

const googleInitial = {
  businessType: 'web design agency',
  location: 'New York, USA',
  limit: 10,
  offering: 'Weblix Website Builder, template ZIPs, SEO blogs, and website launch services'
};

const manualInitial = {
  source: 'bbb',
  businessName: '',
  category: '',
  address: '',
  phone: '',
  website: '',
  email: '',
  socialLinks: '',
  tags: '',
  bbbProfileUrl: '',
  bbbRating: '',
  bbbAccredited: false,
  notes: ''
};

const statusOptions = ['new', 'qualified', 'contacted', 'opened', 'replied', 'interested', 'closed', 'won', 'lost'];

const featureChecklist = [
  ['Instant Maps search', 'Google Places scans businesses in real time by business type and location.'],
  ['Full contact details', 'Phone, address, website and Maps links are saved when provided by public business data.'],
  ['Contactability score', 'Every prospect gets a 0-100 score so the best calls rise first.'],
  ['CSV & PDF export', 'Download your filtered lead list in one click.'],
  ['Social profile scoring', 'Instagram, LinkedIn and Facebook links can be captured and scored.'],
  ['GDPR-aware data', 'Public business data only, with deployment-ready support for EU hosting.']
];

function sourceLabel(source) {
  if (source === 'google_places') return 'Google Maps';
  if (source === 'bbb') return 'BBB';
  return 'Manual';
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#171717] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font800 text-white/45">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]">
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

export function ManageLeads() {
  const [leads, setLeads] = useState([]);
  const [googleForm, setGoogleForm] = useState(googleInitial);
  const [manualForm, setManualForm] = useState(manualInitial);
  const [filters, setFilters] = useState({ search: '', source: 'all', status: 'all', industry: '', country: '', city: '', minReviews: '', maxReviews: '', minWebsiteScore: '', minLeadScore: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadLeads(nextFilters = filters) {
    api.get('/admin/leads', { params: nextFilters }).then(({ data }) => setLeads(data)).catch(() => setLeads([]));
  }

  useEffect(() => { loadLeads(); }, []);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    opened: leads.filter((lead) => lead.outreach?.openedAt || lead.status === 'opened').length,
    replied: leads.filter((lead) => lead.status === 'replied').length,
    interested: leads.filter((lead) => lead.status === 'interested').length,
    closed: leads.filter((lead) => ['closed', 'won'].includes(lead.status)).length,
    google: leads.filter((lead) => lead.source === 'google_places').length,
    bbb: leads.filter((lead) => lead.source === 'bbb').length,
    audited: leads.filter((lead) => lead.websiteAudit?.auditedAt).length
  }), [leads]);

  async function searchGoogle(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/admin/leads/google-search', googleForm);
      setMessage(`${data.leads.length} Google Maps leads synced. ${data.created} new leads added.`);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Google Maps lead search failed.');
    } finally {
      setLoading(false);
    }
  }

  async function saveManual(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.post('/admin/leads', manualForm);
      setMessage('Lead saved with AI pain points and outreach email.');
      setManualForm(manualInitial);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Lead could not be saved.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    await api.put(`/admin/leads/${id}`, { status });
    loadLeads();
  }

  async function removeLead(id) {
    await api.delete(`/admin/leads/${id}`);
    loadLeads();
  }

  async function runAudit(id) {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.post(`/admin/leads/${id}/audit`);
      setMessage('Website audit completed with scores, proposals and outreach copy.');
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Website audit failed.');
    } finally {
      setLoading(false);
    }
  }

  async function bulkAudit() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/admin/leads/bulk-audit', { limit: 5 });
      setMessage(`${data.audited} leads audited. Check individual cards for any failed URLs.`);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk audit failed.');
    } finally {
      setLoading(false);
    }
  }

  async function sendOutreach(id) {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post(`/admin/leads/${id}/send-outreach`);
      setMessage(data.message || 'Outreach sent.');
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Outreach email failed.');
    } finally {
      setLoading(false);
    }
  }

  async function bulkSend() {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/admin/leads/bulk-send', { limit: 5 });
      setMessage(`${data.sent} audited leads processed for outreach.`);
      loadLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk outreach failed.');
    } finally {
      setLoading(false);
    }
  }

  async function downloadAudit(id, name) {
    const response = await api.get(`/admin/leads/${id}/audit.pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${String(name || 'website-audit').replace(/[^a-z0-9-]+/gi, '-')}-audit.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function exportLeads(format) {
    const response = await api.get('/admin/leads/export', {
      params: { ...filters, format },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weblix-leads.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function applyFilters(event) {
    event.preventDefault();
    loadLeads(filters);
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Lead Finder" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><MapPinned /></span>
            <div>
              <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">B2B Prospecting</p>
              <h1 className="text-3xl font-black">Google Maps & BBB Lead Finder</h1>
              <p className="mt-2 max-w-2xl text-sm font700 text-white/45">
                Find local businesses by niche and location, store BBB profile details, analyze pain points, and generate outreach copy for Weblix services.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={bulkAudit} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 text-sm font900 text-white/70 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">
              <Zap size={16} /> Bulk Audit
            </button>
            <button onClick={bulkSend} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 text-sm font900 text-white/70 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">
              <Send size={16} /> Bulk Send
            </button>
            <button onClick={() => exportLeads('csv')} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-4 text-sm font900 text-white/70 transition hover:border-[#4F7BFF] hover:text-[#4F7BFF]">
              <Download size={16} /> CSV
            </button>
            <button onClick={() => exportLeads('pdf')} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#2155FF] px-4 text-sm font900 text-white transition hover:bg-[#4F7BFF]">
              <Download size={16} /> PDF
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Building2} label="Total Leads" value={stats.total} />
          <StatCard icon={Sparkles} label="New" value={stats.new} />
          <StatCard icon={Mail} label="Contacted" value={stats.contacted} />
          <StatCard icon={FileText} label="Audited" value={stats.audited} />
          <StatCard icon={Mail} label="Opened Emails" value={stats.opened} />
          <StatCard icon={Send} label="Replied Leads" value={stats.replied} />
          <StatCard icon={Sparkles} label="Interested" value={stats.interested} />
          <StatCard icon={Star} label="Closed Deals" value={stats.closed} />
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureChecklist.map(([title, description], index) => (
            <div key={title} className="rounded-[18px] border border-white/10 bg-[#171717] p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#2155FF]/15 text-sm font900 text-[#4F7BFF]">{index + 1}</span>
                <div>
                  <h2 className="text-[18px] font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm font-normal leading-6 text-white/48">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(message || error) && (
          <div className={`mt-5 rounded-[14px] border p-4 text-sm font900 ${error ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-[#4F7BFF]/20 bg-[#2155FF]/10 text-[#b9c8ff]'}`}>
            {error || message}
          </div>
        )}

        <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_420px]">
          <form onSubmit={searchGoogle} className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Find Google Maps leads</h2>
                <p className="mt-1 text-sm font700 text-white/40">Search businesses by type and location, then sync them into your CRM list.</p>
              </div>
              <MapPinned className="text-[#4F7BFF]" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input required value={googleForm.businessType} onChange={(e) => setGoogleForm({ ...googleForm, businessType: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Business type, e.g. dentists" />
              <input required value={googleForm.location} onChange={(e) => setGoogleForm({ ...googleForm, location: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Location, e.g. Austin, TX" />
              <input type="number" min="1" max="20" value={googleForm.limit} onChange={(e) => setGoogleForm({ ...googleForm, limit: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Lead limit" />
              <input value={googleForm.offering} onChange={(e) => setGoogleForm({ ...googleForm, offering: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Your offering for AI email" />
            </div>
            <Button disabled={loading} className="mt-4">{loading ? 'Searching...' : 'Search Google Places'}</Button>
            <p className="mt-4 text-xs font700 leading-6 text-white/35">
              Add <span className="text-[#4F7BFF]">GOOGLE_PLACES_API_KEY</span> in <span className="text-white/60">server/.env</span> to enable live Google Maps results. Emails are not provided by Google Places; add verified emails manually after consent-safe research.
            </p>
          </form>

          <form onSubmit={saveManual} className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <h2 className="text-xl font-black">Add BBB or manual lead</h2>
            <div className="mt-5 grid gap-3">
              <select value={manualForm.source} onChange={(e) => setManualForm({ ...manualForm, source: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
                <option value="bbb">BBB profile</option>
                <option value="manual">Manual lead</option>
              </select>
              <input required value={manualForm.businessName} onChange={(e) => setManualForm({ ...manualForm, businessName: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Business name" />
              <input value={manualForm.category} onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Category, e.g. Local agency" />
              <input value={manualForm.website} onChange={(e) => setManualForm({ ...manualForm, website: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Website URL" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Phone" />
                <input value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Verified email" />
              </div>
              <input value={manualForm.socialLinks} onChange={(e) => setManualForm({ ...manualForm, socialLinks: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Social links, one per line" />
              <input value={manualForm.tags} onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Tags, e.g. high intent, SEO, agency" />
              <input value={manualForm.bbbProfileUrl} onChange={(e) => setManualForm({ ...manualForm, bbbProfileUrl: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="BBB profile URL" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={manualForm.bbbRating} onChange={(e) => setManualForm({ ...manualForm, bbbRating: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="BBB rating, e.g. A+" />
                <label className="flex min-h-12 items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm font800 text-white/65">
                  <input type="checkbox" checked={manualForm.bbbAccredited} onChange={(e) => setManualForm({ ...manualForm, bbbAccredited: e.target.checked })} />
                  Accredited
                </label>
              </div>
              <textarea rows="3" value={manualForm.notes} onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })} className="rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 py-3 outline-none focus:border-[#4F7BFF]" placeholder="Notes or review pain points" />
              <Button disabled={loading}>{loading ? 'Saving...' : 'Save Lead'}</Button>
            </div>
          </form>
        </div>

        <div className="mt-7 rounded-[18px] border border-white/10 bg-[#171717]">
          <form onSubmit={applyFilters} className="grid gap-3 border-b border-white/10 p-5 md:grid-cols-2 xl:grid-cols-[1fr_repeat(8,130px)_auto]">
            <div className="flex min-h-12 items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4">
              <Search size={17} className="text-white/35" />
              <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full bg-transparent outline-none placeholder:text-white/25" placeholder="Search lead name, category, notes" />
            </div>
            <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
              <option value="all">All sources</option>
              <option value="google_places">Google Maps</option>
              <option value="bbb">BBB</option>
              <option value="manual">Manual</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]">
              <option value="all">All statuses</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <input value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Industry" />
            <input value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Country" />
            <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="City" />
            <input type="number" value={filters.minReviews} onChange={(e) => setFilters({ ...filters, minReviews: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Min rev" />
            <input type="number" value={filters.maxReviews} onChange={(e) => setFilters({ ...filters, maxReviews: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Max rev" />
            <input type="number" value={filters.minWebsiteScore} onChange={(e) => setFilters({ ...filters, minWebsiteScore: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Site score" />
            <input type="number" value={filters.minLeadScore} onChange={(e) => setFilters({ ...filters, minLeadScore: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-3 outline-none focus:border-[#4F7BFF]" placeholder="Lead score" />
            <Button type="submit">Filter</Button>
          </form>

          <div className="grid gap-4 p-5">
            {leads.length === 0 && <p className="rounded-[14px] bg-[#0d0d0d] p-8 text-center text-white/40">No leads yet. Search Google Places or add a BBB/manual lead.</p>}
            {leads.map((lead) => (
              <article key={lead._id} className="rounded-[16px] border border-white/10 bg-[#0d0d0d] p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{lead.businessName}</h3>
                      <span className="rounded-[10px] bg-[#2155FF]/15 px-3 py-1 text-xs font900 text-[#b9c8ff]">{sourceLabel(lead.source)}</span>
                      {lead.bbbAccredited && <span className="rounded-[10px] bg-[#1f8f55]/15 px-3 py-1 text-xs font900 text-[#48d88b]">BBB accredited</span>}
                    </div>
                    <p className="mt-2 text-sm font700 text-white/45">{lead.category || 'Business lead'}{lead.address ? ` - ${lead.address}` : ''}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font800 text-white/55">
                      {lead.phone && <span className="inline-flex items-center gap-2"><Phone size={15} />{lead.phone}</span>}
                      {lead.email && <span className="inline-flex items-center gap-2"><Mail size={15} />{lead.email}</span>}
                      {lead.rating && <span className="inline-flex items-center gap-2"><Star size={15} />{lead.rating} ({lead.reviewCount || 0})</span>}
                      {lead.bbbRating && <span className="inline-flex items-center gap-2"><Star size={15} />BBB {lead.bbbRating}</span>}
                      <span className="inline-flex items-center gap-2 rounded-[10px] bg-[#2155FF]/15 px-3 py-1 text-[#b9c8ff]"><Sparkles size={15} />Contactability {lead.contactabilityScore || 0}/100</span>
                      <span className="inline-flex items-center gap-2 rounded-[10px] bg-white/5 px-3 py-1 text-white/55"><Globe2 size={15} />Social {lead.socialProfileScore || 0}/100</span>
                      {lead.websiteAudit?.websiteHealthScore && <span className="inline-flex items-center gap-2 rounded-[10px] bg-[#1f8f55]/15 px-3 py-1 text-[#48d88b]"><FileText size={15} />Website {lead.websiteAudit.websiteHealthScore}/100</span>}
                      {lead.websiteAudit?.leadScore && <span className="inline-flex items-center gap-2 rounded-[10px] bg-[#2155FF]/15 px-3 py-1 text-[#b9c8ff]"><Zap size={15} />Lead {lead.websiteAudit.leadScore}/100</span>}
                    </div>
                    {!!lead.tags?.length && <div className="mt-3 flex flex-wrap gap-2">{lead.tags.map((tag) => <span key={tag} className="rounded-[10px] bg-white/5 px-3 py-1 text-xs font900 text-white/45">{tag}</span>)}</div>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={lead.status} onChange={(e) => updateStatus(lead._id, e.target.value)} className="min-h-10 rounded-[10px] border border-white/10 bg-[#171717] px-3 text-sm font800 outline-none focus:border-[#4F7BFF]">
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-[#4F7BFF]" title="Open website"><Globe2 size={17} /></a>}
                    {lead.googleMapsUrl && <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-[#4F7BFF]" title="Open maps"><MapPinned size={17} /></a>}
                    {lead.bbbProfileUrl && <a href={lead.bbbProfileUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-[#4F7BFF]" title="Open BBB"><Building2 size={17} /></a>}
                    <button onClick={() => runAudit(lead._id)} disabled={!lead.website || loading} className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-[#4F7BFF] disabled:opacity-35" title="Run website audit"><Zap size={17} /></button>
                    <button onClick={() => downloadAudit(lead._id, lead.businessName)} disabled={!lead.website || loading} className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/5 text-white/70 hover:text-[#4F7BFF] disabled:opacity-35" title="Download audit PDF"><FileText size={17} /></button>
                    <button onClick={() => sendOutreach(lead._id)} disabled={!lead.email || loading} className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#b9c8ff] hover:bg-[#2155FF]/25 disabled:opacity-35" title="Send audit email"><Send size={17} /></button>
                    <button onClick={() => removeLead(lead._id)} className="grid h-10 w-10 place-items-center rounded-[10px] bg-red-500/10 text-red-200 hover:bg-red-500/20" title="Delete lead"><Trash2 size={17} /></button>
                  </div>
                </div>

                {lead.websiteAudit?.auditedAt && (
                  <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {[
                      ['SEO', lead.websiteAudit.seoScore],
                      ['Health', lead.websiteAudit.websiteHealthScore],
                      ['Speed', lead.websiteAudit.performanceScore],
                      ['Mobile', lead.websiteAudit.mobileScore],
                      ['Design', lead.websiteAudit.designScore],
                      ['Conversion', lead.websiteAudit.conversionScore]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[12px] border border-white/10 bg-[#171717] p-3">
                        <p className="text-xs font900 text-white/35">{label}</p>
                        <p className="mt-1 text-2xl font-black text-[#4F7BFF]">{value || 0}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1fr]">
                  <div className="rounded-[14px] border border-white/10 bg-[#171717] p-4">
                    <p className="text-sm font900 text-[#4F7BFF]">AI audit findings</p>
                    <ul className="mt-3 grid gap-2 text-sm font700 leading-6 text-white/60">
                      {(lead.websiteAudit?.priorityIssues?.length ? lead.websiteAudit.priorityIssues : lead.painPoints || []).map((point) => <li key={point}>- {point}</li>)}
                    </ul>
                    {lead.websiteAudit?.recommendations?.length > 0 && <p className="mt-4 text-xs font900 uppercase tracking-[0.12em] text-white/35">Recommended fixes</p>}
                    {lead.websiteAudit?.recommendations?.slice(0, 4).map((item) => <p key={item} className="mt-2 text-xs font700 leading-5 text-white/45">- {item}</p>)}
                    {lead.aiSummary && <p className="mt-3 text-xs font700 leading-5 text-white/35">{lead.aiSummary}</p>}
                  </div>
                  <div className="rounded-[14px] border border-white/10 bg-[#171717] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font900 text-[#4F7BFF]">Outreach email</p>
                      <p className="text-xs font800 text-white/35">Opens {lead.outreach?.openCount || 0} / Clicks {lead.outreach?.clickCount || 0}</p>
                    </div>
                    <p className="mt-3 text-sm font900">{lead.outreachEmailSubject}</p>
                    <pre className="mt-3 whitespace-pre-wrap rounded-[12px] bg-[#0d0d0d] p-4 text-xs font700 leading-5 text-white/55">{lead.outreachEmailBody}</pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
