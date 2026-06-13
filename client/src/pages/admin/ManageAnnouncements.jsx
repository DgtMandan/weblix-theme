import { useEffect, useState } from 'react';
import { Megaphone, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { api, assetUrl } from '../../services/api.js';
import { SEO } from '../../utils/seo.jsx';

const initial = {
  title: '',
  subtitle: '',
  badge: 'Announcement',
  content: '',
  buttonText: '',
  buttonUrl: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
  showOnce: true,
  image: null
};

export function ManageAnnouncements() {
  const [form, setForm] = useState(initial);
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadAnnouncements() {
    api.get('/admin/announcements').then(({ data }) => setAnnouncements(data)).catch(() => setAnnouncements([]));
  }

  useEffect(() => { loadAnnouncements(); }, []);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const data = new FormData();
      ['title', 'subtitle', 'badge', 'content', 'buttonText', 'buttonUrl', 'startsAt', 'expiresAt'].forEach((key) => {
        if (form[key]) data.append(key, form[key]);
      });
      data.append('isActive', form.isActive);
      data.append('showOnce', form.showOnce);
      if (form.image) data.append('image', form.image);
      await api.post('/admin/announcements', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Announcement saved. It will show on the frontend when active.');
      setForm(initial);
      event.target.reset();
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Announcement could not be saved.');
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    await api.delete(`/admin/announcements/${id}`);
    loadAnnouncements();
  }

  return (
    <section className="min-h-screen bg-[#0d0d0d] px-4 py-8 text-white">
      <SEO title="Manage Announcements" />
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[10px] bg-[#2155FF]/15 text-[#4F7BFF]"><Megaphone /></span>
          <div>
            <p className="text-sm font900 uppercase tracking-[0.18em] text-[#4F7BFF]">Frontend popup</p>
            <h1 className="text-3xl font-black">Website announcements</h1>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[430px_1fr]">
          <form onSubmit={submit} className="rounded-[18px] border border-white/10 bg-[#171717] p-6">
            <h2 className="text-xl font-black">Create popup</h2>
            {message && <div className="mt-4 rounded-[10px] bg-[#4F7BFF]/10 p-3 text-sm font900 text-[#4F7BFF]">{message}</div>}
            {error && <div className="mt-4 rounded-[10px] bg-red-500/10 p-3 text-sm font900 text-red-200">{error}</div>}
            <div className="mt-5 grid gap-3">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Popup title" />
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Subtitle" />
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Badge text" />
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-32 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 outline-none focus:border-[#4F7BFF]" placeholder="Announcement content" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="Button text" />
                <input value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} className="min-h-12 rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 outline-none focus:border-[#4F7BFF]" placeholder="/pricing or https://..." />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font900 uppercase tracking-[0.12em] text-white/40">Start date<input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none focus:border-[#4F7BFF]" /></label>
                <label className="text-xs font900 uppercase tracking-[0.12em] text-white/40">Expiry date<input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="mt-2 min-h-12 w-full rounded-[10px] border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none focus:border-[#4F7BFF]" /></label>
              </div>
              <label className="rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4">
                <span className="text-sm font900">Popup image</span>
                <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="mt-3 w-full text-sm text-white/55" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
              </label>
              <label className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-sm font900 text-white/70">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active popup
              </label>
              <label className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#0d0d0d] p-4 text-sm font900 text-white/70">
                <input type="checkbox" checked={form.showOnce} onChange={(e) => setForm({ ...form, showOnce: e.target.checked })} /> Show once after close
              </label>
              <Button disabled={loading}>{loading ? 'Saving...' : 'Save Announcement'}</Button>
            </div>
          </form>

          <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#171717]">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-xl font-black">Announcement list</h2>
              <p className="mt-1 text-sm text-white/45">Newest active announcement is shown first on the frontend.</p>
            </div>
            <div className="grid gap-4 p-5">
              {announcements.map((item) => (
                <div key={item._id} className="grid gap-4 rounded-[16px] border border-white/10 bg-[#0d0d0d] p-4 md:grid-cols-[160px_1fr_auto]">
                  <div className="h-32 overflow-hidden rounded-[12px] bg-[#06134A]">
                    {item.image ? <img src={assetUrl(item.image)} alt={item.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#4F7BFF]"><Megaphone /></div>}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-[10px] px-3 py-1 text-xs font900 ${item.isActive ? 'bg-[#1f8f55]/15 text-[#48d88b]' : 'bg-white/10 text-white/45'}`}>{item.isActive ? 'Active' : 'Off'}</span>
                      {item.badge && <span className="rounded-[10px] bg-[#2155FF]/15 px-3 py-1 text-xs font900 text-[#4F7BFF]">{item.badge}</span>}
                    </div>
                    <h3 className="mt-3 text-xl font900">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#4F7BFF]">{item.subtitle}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{item.content}</p>
                    {item.buttonText && <p className="mt-2 text-xs font900 text-white/35">Button: {item.buttonText} to {item.buttonUrl}</p>}
                  </div>
                  <button onClick={() => remove(item._id)} className="grid h-10 w-10 place-items-center rounded-[10px] bg-red-500/10 text-red-200 hover:bg-red-500/20"><Trash2 size={17} /></button>
                </div>
              ))}
              {announcements.length === 0 && <p className="p-8 text-center text-white/45">No announcements yet. Create one to show a popup on the site.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
